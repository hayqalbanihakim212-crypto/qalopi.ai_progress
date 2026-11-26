import { Router } from 'express'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import * as store from '../store.js'
import { env } from '../config.js'
import { cached } from '../lib/cache.js'
import { getSettings } from '../lib/settings.js'
import { notify } from '../lib/notify.js'
import { geckoPoolToMarket, marketNumber, normalizeTrades, selectGeckoPool, selectSolanaBasePair } from '../lib/market.js'

const r = Router()
const B58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

r.get('/health', async (req, res) => {
  try { res.json({ ok: true, ...await store.check(), time: new Date().toISOString() }) }
  catch (e) {
    console.error('Storage health check failed:', e)
    res.status(503).json({ ok: false, storage: store.storage(), database: 'unavailable', time: new Date().toISOString() })
  }
})

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

// ---- Market data (DexScreener, GeckoTerminal fallback). No dummy data: unavailable until a real pair exists. ----
async function getJson(url) {
  const x = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' } })
  if (!x.ok) throw new Error(`${new URL(url).host} ${x.status}`)
  return x.json()
}
async function dexMarket(mint) {
  const d = await getJson('https://api.dexscreener.com/latest/dex/tokens/' + encodeURIComponent(mint))
  const p = selectSolanaBasePair(d.pairs, mint)
  if (!p) return null
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
}
async function geckoMarket(mint) {
  const d = await getJson(`https://api.geckoterminal.com/api/v2/networks/solana/tokens/${encodeURIComponent(mint)}/pools`)
  const pool = selectGeckoPool(d?.data, mint)
  return pool ? geckoPoolToMarket(pool) : null
}
async function market() {
  const s = await getSettings()
  if (s.launchStatus !== 'LAUNCHED' || !s.mint) return { available: false, reason: 'NOT_LAUNCHED' }
  return cached('mkt:' + s.mint, 30000, async () => {
    // A brand-new Pump.fun coin may be indexed by one provider before the other, so ask both.
    // Only when neither provider answers is this an error; "answered, no pair" is NO_MARKET_YET.
    let answered = false, lastError = null
    for (const source of [dexMarket, geckoMarket]) {
      try {
        const m = await source(s.mint)
        answered = true
        if (m) return { ...m, mint: s.mint }
      } catch (e) { lastError = e }
    }
    if (!answered) throw lastError || new Error('no market provider answered')
    return { available: false, reason: 'NO_MARKET_YET' }
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
      // include_empty_intervals keeps the time axis continuous for thinly traded coins (flat candles = no trades).
      const d = await getJson(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${m.pairAddress}/ohlcv/${tf[0]}?aggregate=${tf[1]}&limit=120&include_empty_intervals=true`)
      const list = d?.data?.attributes?.ohlcv_list || []
      return list.map(c => c.map(Number)).filter(c => c.length >= 5 && c.every(Number.isFinite)).sort((a, b) => a[0] - b[0])
    })
    res.json({ available: true, provider: 'GeckoTerminal', tf: req.query.tf, candles })
  } catch { res.status(502).json({ error: 'Chart data is temporarily unavailable.' }) }
})
// Real on-chain swaps for the token's pool (provider window: last 24 hours). Empty means nobody traded.
r.get('/market/trades', async (req, res) => {
  try {
    const m = await market()
    if (!m.available || !B58.test(m.pairAddress || '') || !m.mint) return res.json({ available: false, trades: [] })
    const out = await cached(`trades:${m.pairAddress}`, 20000, async () => {
      const d = await getJson(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${m.pairAddress}/trades`)
      return { trades: normalizeTrades(d?.data, m.mint), lastSynced: new Date().toISOString() }
    })
    res.json({ available: true, provider: 'GeckoTerminal', windowHours: 24, mint: m.mint, ...out })
  } catch { res.status(502).json({ error: 'Transaction data is temporarily unavailable.' }) }
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
