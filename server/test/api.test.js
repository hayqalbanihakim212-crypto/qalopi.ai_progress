import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import bcrypt from 'bcryptjs'

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qal-'))
Object.assign(process.env, { DATA_DIR: dir, AUTH_SECRET: 'x'.repeat(40), ADMIN_EMAIL: 'owner@example.com', ADMIN_PASSWORD_HASH: bcrypt.hashSync('correct-horse-battery', 4), GITHUB_OWNER: '', GITHUB_REPOSITORY: '' })
const { default: app } = await import('../app.js')
let server, base, cookie
before(() => new Promise(r => { server = app.listen(0, () => { base = 'http://127.0.0.1:' + server.address().port; r() }) }))
after(() => { server.close(); fs.rmSync(dir, { recursive: true, force: true }) })
const call = (p, o = {}) => fetch(base + p, { ...o, headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...o.headers }, body: o.body ? JSON.stringify(o.body) : undefined })
const valid = { type: 'suggestion', subject: 'Docs idea', message: 'Please add a glossary page.', consent: true }

test('health and default settings', async () => {
  const health = await (await call('/api/health')).json()
  assert.equal(health.ok, true)
  assert.equal(health.storage, 'file')
  assert.equal(health.database, 'not-configured')
  assert.equal((await (await call('/api/settings')).json()).launchStatus, 'NOT_LAUNCHED')
})
test('github unconfigured returns configured:false, no fake data', async () => {
  assert.deepEqual(await (await call('/api/github')).json(), { configured: false })
})
test('market unavailable before launch; chart rejects bad timeframe', async () => {
  assert.equal((await (await call('/api/market')).json()).available, false)
  assert.equal((await call('/api/market/ohlcv?tf=1w')).status, 400)
  assert.deepEqual((await (await call('/api/market/ohlcv?tf=1h')).json()).candles, [])
})
test('submission validation', async () => {
  assert.equal((await call('/api/submissions', { method: 'POST', body: { ...valid, consent: false } })).status, 400)
  assert.equal((await call('/api/submissions', { method: 'POST', body: { ...valid, subject: 'x' } })).status, 400)
  assert.equal((await call('/api/submissions', { method: 'POST', body: { ...valid, type: 'investment' } })).status, 400) // email required
})
test('valid submission gets a reference ID; honeypot stores nothing', async () => {
  const r = await call('/api/submissions', { method: 'POST', body: valid })
  assert.equal(r.status, 201)
  assert.match((await r.json()).ref, /^QAL-/)
  await call('/api/submissions', { method: 'POST', body: { ...valid, website: 'spam' } })
})
test('admin routes require auth; wrong password rejected', async () => {
  assert.equal((await call('/api/admin/submissions')).status, 401)
  assert.equal((await call('/api/admin/login', { method: 'POST', body: { email: 'owner@example.com', password: 'nope' } })).status, 401)
})
test('admin login, list, status change, settings validation and update', async () => {
  const l = await call('/api/admin/login', { method: 'POST', body: { email: 'Owner@example.com', password: 'correct-horse-battery' } })
  assert.equal(l.status, 200)
  const sc = l.headers.get('set-cookie'); assert.match(sc, /HttpOnly/i); assert.match(sc, /SameSite=Strict/i)
  cookie = sc.split(';')[0]
  const items = (await (await call('/api/admin/submissions')).json()).items
  assert.equal(items.length, 1) // honeypot not stored
  assert.equal((await call('/api/admin/submissions/' + items[0].id, { method: 'PATCH', body: { status: 'resolved' } })).status, 200)
  assert.equal((await call('/api/admin/settings', { method: 'PUT', body: { launchStatus: 'LAUNCHED', mint: '', pumpfunUrl: '' } })).status, 400)
  assert.equal((await call('/api/admin/settings', { method: 'PUT', body: { launchStatus: 'LAUNCHED', mint: 'not-an-address', pumpfunUrl: 'https://pump.fun/x' } })).status, 400)
  assert.equal((await call('/api/admin/settings', { method: 'PUT', body: { launchStatus: 'LAUNCHED', mint: '11111111111111111111111111111111', pumpfunUrl: 'https://evil.example/x' } })).status, 400)
  assert.equal((await call('/api/admin/settings', { method: 'PUT', body: { launchStatus: 'NOT_LAUNCHED', mint: '', pumpfunUrl: '' } })).status, 200)
  assert.ok((await (await call('/api/admin/audit')).json()).items.length >= 3)
})
test('cross-origin state change is blocked', async () => {
  const r = await call('/api/admin/logout', { method: 'POST', headers: { Origin: 'https://evil.example' } })
  assert.equal(r.status, 403)
})
