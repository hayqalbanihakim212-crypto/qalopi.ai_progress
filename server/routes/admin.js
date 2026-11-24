import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import * as store from '../store.js'
import { env } from '../config.js'
import { getSettings, SettingsSchema } from '../lib/settings.js'

const r = Router()
const COOKIE = 'qal_admin'
const opts = () => ({ httpOnly: true, sameSite: 'strict', secure: env().prod, path: '/api', maxAge: 8 * 3600 * 1000 })
const configured = () => { const e = env(); return e.authSecret.length >= 32 && e.adminEmail && e.adminHash }
const audit = (action, detail = '') => store.update('audit', [], l => { l.unshift({ at: new Date().toISOString(), action, detail }); return l.slice(0, 500) })

// Same-origin guard for state-changing requests (cookies are SameSite=Strict as well).
r.use((req, res, next) => {
  if (req.method !== 'GET' && req.get('origin')) { try { if (new URL(req.get('origin')).host !== req.get('host')) return res.status(403).json({ error: 'Forbidden' }) } catch { return res.status(403).json({ error: 'Forbidden' }) } }
  next()
})
const loginLimit = rateLimit({ windowMs: 900000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many attempts. Try again later.' } })

r.post('/login', loginLimit, async (req, res, next) => {
  try {
    if (!configured()) return res.status(503).json({ error: 'Admin is not configured on the server.' })
    const p = z.object({ email: z.string().max(120), password: z.string().max(200) }).safeParse(req.body)
    if (!p.success) return res.status(400).json({ error: 'Invalid request' })
    const e = env()
    const passOk = await bcrypt.compare(p.data.password, e.adminHash) // always run to keep timing similar
    if (!(passOk && p.data.email.trim().toLowerCase() === e.adminEmail)) { await audit('login_failed'); return res.status(401).json({ error: 'Wrong email or password.' }) }
    res.cookie(COOKIE, jwt.sign({ sub: 'admin' }, e.authSecret, { expiresIn: '8h' }), opts())
    await audit('login')
    res.json({ ok: true })
  } catch (err) { next(err) }
})
r.post('/logout', (req, res) => { res.clearCookie(COOKIE, { ...opts(), maxAge: undefined }); res.json({ ok: true }) })

const auth = (req, res, next) => {
  try { jwt.verify(req.cookies?.[COOKIE] || '', env().authSecret); next() } catch { res.status(401).json({ error: 'Not signed in.' }) }
}
r.use(auth)
r.get('/me', (req, res) => res.json({ ok: true }))

r.get('/submissions', async (req, res, next) => {
  try {
    let l = await store.get('submissions', [])
    if (req.query.status) l = l.filter(s => s.status === req.query.status)
    if (req.query.type) l = l.filter(s => s.type === req.query.type)
    res.json({ items: l })
  } catch (e) { next(e) }
})
r.patch('/submissions/:id', async (req, res, next) => {
  const p = z.object({ status: z.enum(['new', 'reviewing', 'resolved', 'spam']) }).safeParse(req.body)
  if (!p.success) return res.status(400).json({ error: 'Invalid status' })
  try {
    let found = false
    await store.update('submissions', [], l => { const s = l.find(x => x.id === req.params.id); if (s) { s.status = p.data.status; found = true } return l })
    if (!found) return res.status(404).json({ error: 'Not found' })
    await audit('submission_status', `${req.params.id} -> ${p.data.status}`)
    res.json({ ok: true })
  } catch (e) { next(e) }
})
r.get('/settings', async (req, res, next) => { try { res.json(await getSettings()) } catch (e) { next(e) } })
r.put('/settings', async (req, res, next) => {
  const p = SettingsSchema.safeParse(req.body)
  if (!p.success) return res.status(400).json({ error: p.error.issues[0].message })
  try {
    await store.update('settings', {}, () => p.data)
    await audit('settings_update', `${p.data.launchStatus} ${p.data.mint}`)
    res.json(p.data)
  } catch (e) { next(e) }
})
r.get('/audit', async (req, res, next) => { try { res.json({ items: await store.get('audit', []) }) } catch (e) { next(e) } })
export default r
