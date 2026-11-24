import { Router } from 'express'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import * as store from '../store.js'
import { env } from '../config.js'
import { cached } from '../lib/cache.js'
import { getSettings } from '../lib/settings.js'
import { notify } from '../lib/notify.js'
import { marketNumber, selectSolanaBasePair } from '../lib/market.js'

const r = Router()
const B58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

r.get('/health', (req, res) => res.json({ ok: true, storage: store.storage(), time: new Date().toISOString() }))

r.get('/settings', async (req, res, next) => {
  try { res.json(await getSettings()) } catch (e) { next(e) }
})

// ---- GitHub (read-only, server-side token, cached 5 min) ----
async function gh(p) {
  const { ghToken } = env()
  const x = await fetch('https://api.github.com' + p, { signal: AbortSignal.timeout(8000), headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'qalopi-public-hub', ...(ghToken ? { Authorization: 'Bearer ' + ghToken } : {}) } })
  if (x.status === 204) return []
  if (!x.ok) throw new Error('GitHub ' + x.status)
  return x.json()
}
r.get('/github', async (req, res) => {
  const { ghOwner: o, ghRepo: n } = env()
  if (!o || !n) return res.json({ configured: false })
  try {
    const data = await cached('gh:' + o + '/' + n, 300000, async () => {
      const b = `/repos/${encodeURIComponent(o)}/${encodeURIComponent(n)}`
      const [repo, commits, releases, contrib, langs] = await Promise.all([gh(b), gh(b + '/commits?per_page=8'), gh(b + '/releases?per_page=5'), gh(b + '/contributors?per_page=10'), gh(b + '/languages')])
      return {
        repo: { name: repo.full_name, description: repo.description, url: repo.html_url, stars: repo.stargazers_count, forks: repo.forks_count, openIssues: repo.open_issues_count, pushedAt: repo.pushed_at, private: repo.private },
        languages: langs,
        commits: commits.map(c => ({ sha: c.sha.slice(0, 7), message: String(c.commit.message).split('\n')[0].slice(0, 120), author: c.commit.author?.name || '', date: c.commit.author?.date, url: c.html_url })),
        releases: releases.map(x => ({ tag: x.tag_name, name: x.name, date: x.published_at, url: x.html_url })),
        contributors: contrib.map(x => ({ login: x.login, url: x.html_url, contributions: x.contributions })),
        lastSynced: new Date().toISOString(),
      }
    })
    res.json({ configured: true, ...data })
  } catch { res.status(502).json({ error: 'GitHub data is temporarily unavailable.' }) }
})

// ---- Market data (DexScreener + GeckoTerminal). No dummy data: unavailable until launched. ----
async function market() {
  const s = await getSettings()
  if (s.launchStatus !== 'LAUNCHED' || !s.mint) return { available: false, reason: 'NOT_LAUNCHED' }
  return cached('mkt:' + s.mint, 30000, async () => {
    const x = await fetch('https://api.dexscreener.com/latest/dex/tokens/' + s.mint, { signal: AbortSignal.timeout(8000) })
    if (!x.ok) throw new Error('dex ' + x.status)
    const d = await x.json()
    const p = selectSolanaBasePair(d.pairs, s.mint)
    if (!p) return { available: false, reason: 'NO_MARKET_YET' }
    return {
      available: true,
      provider: 'DexScreener',
      dex: p.dexId,
      pairAddress: p.pairAddress,
      pairUrl: p.url,
      price: marketNumber(p.priceUsd),
      priceChange24h: marketNumber(p.priceChange?.h24),
      liquidityUsd: marketNumber(p.liquidity?.usd),
      volume24hUsd: marketNumber(p.volume?.h24),
      marketCapUsd: marketNumber(p.marketCap),
      fdvUsd: marketNumber(p.fdv),
      lastSynced: new Date().toISOString(),
    }
  })
}
r.get('/market', async (req, res) => {
  try { res.json(await market()) } catch { res.status(502).json({ error: 'Market data is temporarily unavailable.' }) }
})
const TF = { '5m': ['minute', 5], '15m': ['minute', 15], '1h': ['hour', 1], '4h': ['hour', 4], '1d': ['day', 1] }
r.get('/market/ohlcv', async (req, res) => {
  const tf = TF[req.query.tf]
  if (!tf) return res.status(400).json({ error: 'Unsupported timeframe', supported: Object.keys(TF) })
  try {
    const m = await market()
    if (!m.available || !B58.test(m.pairAddress || '')) return res.json({ available: false, candles: [] })
    const candles = await cached(`ohlcv:${m.pairAddress}:${req.query.tf}`, 60000, async () => {
      const x = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${m.pairAddress}/ohlcv/${tf[0]}?aggregate=${tf[1]}&limit=120`, { signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' } })
      if (!x.ok) throw new Error('gt ' + x.status)
      const list = (await x.json())?.data?.attributes?.ohlcv_list || []
      return list.map(c => c.map(Number)).sort((a, b) => a[0] - b[0])
    })
    res.json({ available: true, provider: 'GeckoTerminal', tf: req.query.tf, candles })
  } catch { res.status(502).json({ error: 'Chart data is temporarily unavailable.' }) }
})

// ---- Submissions (feedback, careers, partnerships, investment, security) ----
const NEEDS_EMAIL = ['partnership', 'investment', 'career']
export const SubSchema = z.object({
  type: z.enum(['suggestion', 'criticism', 'bug', 'docs', 'partnership', 'investment', 'career', 'security']),
  name: z.string().trim().max(80).default(''),
  email: z.string().trim().email().max(120).or(z.literal('')).default(''),
  subject: z.string().trim().min(3).max(140),
  message: z.string().trim().min(10).max(4000),
  consent: z.literal(true),
  website: z.string().max(0).optional(), // honeypot
}).refine(s => !NEEDS_EMAIL.includes(s.type) || s.email, { message: 'Email is required for this type', path: ['email'] })

const subLimit = rateLimit({ windowMs: 3600000, limit: 8, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many submissions. Try again later.' } })
r.post('/submissions', subLimit, async (req, res, next) => {
  if (typeof req.body?.website === 'string' && req.body.website) return res.status(201).json({ ok: true, ref: 'QAL-OK' }) // bot: pretend success, store nothing
  const p = SubSchema.safeParse(req.body)
  if (!p.success) return res.status(400).json({ error: 'Invalid submission', details: p.error.flatten().fieldErrors })
  try {
    const { website, consent, ...d } = p.data
    const ref = 'QAL-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase()
    const sub = { id: ref, ref, ...d, status: 'new', createdAt: new Date().toISOString() }
    await store.update('submissions', [], list => { list.unshift(sub); return list.slice(0, 2000) })
    notify(sub)
    res.status(201).json({ ok: true, ref })
  } catch (e) { next(e) }
})
export default r
