import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import bcrypt from 'bcryptjs'

const dataDir = path.resolve('server/test/.cms-funding-data')
await fs.rm(dataDir, { recursive: true, force: true })
Object.assign(process.env, {
  DATA_DIR: dataDir,
  AUTH_SECRET: 'cms-test-secret-that-is-long-enough-123456',
  ADMIN_EMAIL: 'owner@example.com',
  ADMIN_PASSWORD_HASH: bcrypt.hashSync('test-password', 4),
  GITHUB_OWNER: '',
  GITHUB_REPOSITORY: '',
})
const { default: app } = await import('../app.js')
let server, base, cookie

before(() => new Promise(resolve => {
  server = app.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; resolve() })
}))
after(async () => {
  await new Promise(resolve => server.close(resolve))
  await fs.rm(dataDir, { recursive: true, force: true })
})

const call = (url, options = {}) => fetch(base + url, {
  ...options,
  headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...options.headers },
  body: options.body === undefined ? undefined : JSON.stringify(options.body),
})

test('CMS and funding admin routes require authenticated admin session', async () => {
  assert.equal((await call('/api/admin/content')).status, 401)
  assert.equal((await call('/api/admin/funding')).status, 401)
  const login = await call('/api/admin/login', { method: 'POST', body: { email: 'owner@example.com', password: 'test-password' } })
  assert.equal(login.status, 200)
  cookie = login.headers.get('set-cookie').split(';')[0]
})

test('CMS persists validated records and keeps non-consenting contributors private', async () => {
  const initial = await (await call('/api/content')).json()
  assert.ok(initial.roadmap.length > 0)
  const cms = {
    roadmap: [{ id: 'm1', title: 'Milestone', descriptionEn: 'Verified milestone', descriptionId: 'Tahap terverifikasi', status: 'PLANNED' }],
    roles: [{ id: 'r1', title: 'Protocol engineer' }],
    partners: [{ id: 'p1', nameEn: 'Research partnership', nameId: 'Kemitraan riset' }],
    contributors: [
      { id: 'c1', displayName: 'Private handle', contribution: 'Review', profileUrl: '', consentToPublish: false },
      { id: 'c2', displayName: 'Public handle', contribution: 'Documentation', profileUrl: 'https://example.org/profile', consentToPublish: true },
    ],
    documentation: [{ id: 'd1', title: 'Project docs', url: 'https://example.org/docs', description: 'Public docs' }],
  }
  for (const [type, items] of Object.entries(cms)) {
    const saved = await call(`/api/admin/content/${type}`, { method: 'PUT', body: items })
    assert.equal(saved.status, 200, type)
  }
  assert.equal((await call('/api/admin/content/roadmap', { method: 'PUT', body: [{ ...cms.roadmap[0], status: 'made-up' }] })).status, 400)
  assert.equal((await call('/api/admin/content/documentation', { method: 'PUT', body: [{ ...cms.documentation[0], url: 'javascript:alert(1)' }] })).status, 400)
  const publicData = await (await call('/api/content')).json()
  assert.equal(publicData.roadmap[0].title, 'Milestone')
  assert.deepEqual(publicData.contributors.map(item => item.displayName), ['Public handle'])
  assert.equal(publicData.documentation[0].url, 'https://example.org/docs')
})

test('funding ledger requires evidence, validates values, and is public after save', async () => {
  const invalid = { target: null, entries: [{ id: 'e1', date: '2026-01-02', direction: 'received', amount: 25, currency: 'USD', description: 'Donation', source: 'Donor', evidenceUrl: '' }] }
  assert.equal((await call('/api/admin/funding', { method: 'PUT', body: invalid })).status, 400)
  assert.equal((await call('/api/admin/funding', { method: 'PUT', body: { ...invalid, entries: [{ ...invalid.entries[0], amount: -1, evidenceUrl: 'https://example.org/receipt' }] } })).status, 400)
  const funding = {
    target: { amount: 1000, currency: 'USD' },
    entries: [{ id: 'e1', date: '2026-01-02', direction: 'received', amount: 25, currency: 'USD', description: 'Documented donation', source: 'Public transaction', evidenceUrl: 'https://example.org/receipt' }],
  }
  assert.equal((await call('/api/admin/funding', { method: 'PUT', body: funding })).status, 200)
  assert.deepEqual(await (await call('/api/funding')).json(), funding)
})
