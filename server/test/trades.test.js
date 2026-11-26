import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qal-trades-'))
Object.assign(process.env, { DATA_DIR: dir, AUTH_SECRET: 'x'.repeat(40), ADMIN_EMAIL: 'owner@example.com', ADMIN_PASSWORD_HASH: 'x', GITHUB_OWNER: '', GITHUB_REPOSITORY: '' })
const { default: app } = await import('../app.js')
const { clearCache } = await import('../lib/cache.js')

const MINT = 'AGVeuGdPYePghgF6evN8C8mceNzDVT4GVZdcPRDfpump' // default token
const POOL = 'G6jcR1v8mYVs2F4rhqTDg5953eyjb4ydM3ZaU4LXwVzc'
const SIG = '4'.repeat(88)
const WALLET = '6WThPwhGp1rato61eESPy43XJLQvf168vJmnifgvt3dC'
const SOL = 'So11111111111111111111111111111111111111112'

const realFetch = globalThis.fetch
let server, base, provider, seen
before(() => new Promise(r => { server = app.listen(0, () => { base = 'http://127.0.0.1:' + server.address().port; r() }) }))
after(() => { globalThis.fetch = realFetch; server.close(); fs.rmSync(dir, { recursive: true, force: true }) })
beforeEach(() => {
  clearCache(); seen = []
  provider = { dex: () => ({ pairs: null }), tokenPools: () => ({ data: [] }), ohlcv: () => ({ data: { attributes: { ohlcv_list: [] } } }), trades: () => ({ data: [] }) }
  // Local requests go to the real app; every provider is stubbed. No test touches the internet.
  globalThis.fetch = async (url, opts) => {
    url = String(url)
    if (url.startsWith(base)) return realFetch(url, opts)
    seen.push(url)
    const route = url.includes('api.dexscreener.com') ? 'dex' : url.includes('/ohlcv/') ? 'ohlcv' : url.includes('/trades') ? 'trades' : url.includes('/tokens/') ? 'tokenPools' : null
    if (!route) throw new Error('unexpected outbound request: ' + url)
    const body = provider[route](url)
    if (body instanceof Error) throw body
    if (typeof body === 'number') return new Response('{}', { status: body })
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
})
const get = p => realFetch(base + p)

const gtPool = { id: 'solana_' + POOL, attributes: { address: POOL, base_token_price_usd: '0.000004', reserve_in_usd: '66.27', fdv_usd: '4000', market_cap_usd: '4000', volume_usd: { h24: '0.1' }, price_change_percentage: { h24: '0' } }, relationships: { base_token: { data: { id: 'solana_' + MINT } }, dex: { data: { id: 'pump-fun' } } } }
const gtTrade = (o = {}) => ({ attributes: { block_timestamp: '2026-11-26T10:00:00Z', tx_hash: SIG, tx_from_address: WALLET, kind: 'buy', from_token_address: SOL, to_token_address: MINT, to_token_amount: '235000', price_to_in_usd: '0.000004', volume_in_usd: '0.95', ...o } })

test('falls back to GeckoTerminal when DexScreener has no pair yet', async () => {
  provider.tokenPools = () => ({ data: [gtPool] })
  const m = await (await get('/api/market')).json()
  assert.equal(m.available, true)
  assert.equal(m.provider, 'GeckoTerminal')
  assert.equal(m.pairAddress, POOL)
  assert.equal(m.price, 0.000004)
  assert.ok(seen.some(u => u.includes('api.dexscreener.com/latest/dex/tokens/' + MINT)))
})

test('DexScreener wins when it has the pair', async () => {
  provider.dex = () => ({ pairs: [{ chainId: 'solana', dexId: 'pumpfun', pairAddress: POOL, url: 'https://dexscreener.com/solana/' + POOL, baseToken: { address: MINT }, priceUsd: '0.000004', liquidity: { usd: 66 }, volume: { h24: 0.1 }, marketCap: 4000, fdv: 4000 }] })
  const m = await (await get('/api/market')).json()
  assert.equal(m.provider, 'DexScreener')
  assert.equal(seen.some(u => u.includes('geckoterminal')), false)
})

test('no pair on either provider is NO_MARKET_YET, not an error and not fake data', async () => {
  const m = await (await get('/api/market')).json()
  assert.deepEqual(m, { available: false, reason: 'NO_MARKET_YET' })
  assert.deepEqual((await (await get('/api/market/trades')).json()).trades, [])
})

test('one provider failing is tolerated; both failing is a 502', async () => {
  provider.dex = () => 500
  provider.tokenPools = () => ({ data: [gtPool] })
  assert.equal((await (await get('/api/market')).json()).provider, 'GeckoTerminal')
  clearCache()
  provider.tokenPools = () => new Error('network down')
  assert.equal((await get('/api/market')).status, 502)
})

test('trades endpoint returns real normalised swaps for the pool', async () => {
  provider.tokenPools = () => ({ data: [gtPool] })
  provider.trades = () => ({ data: [gtTrade(), gtTrade({ block_timestamp: '2026-11-26T11:00:00Z', kind: 'sell', from_token_address: MINT, to_token_address: SOL, from_token_amount: '500', price_from_in_usd: '0.000005', volume_in_usd: '0.0025' }), gtTrade({ from_token_address: 'x', to_token_address: 'y' })] })
  const r = await (await get('/api/market/trades')).json()
  assert.equal(r.available, true)
  assert.equal(r.provider, 'GeckoTerminal')
  assert.equal(r.windowHours, 24)
  assert.equal(r.mint, MINT)
  assert.deepEqual(r.trades.map(t => t.side), ['sell', 'buy'])
  assert.equal(r.trades[1].signature, SIG)
  assert.ok(seen.some(u => u.includes(`/pools/${POOL}/trades`)))
})

test('trades endpoint reports provider failures as 502 instead of inventing rows', async () => {
  provider.tokenPools = () => ({ data: [gtPool] })
  provider.trades = () => 429
  assert.equal((await get('/api/market/trades')).status, 502)
})

test('OHLCV keeps the time axis continuous and drops malformed candles', async () => {
  provider.tokenPools = () => ({ data: [gtPool] })
  provider.ohlcv = () => ({ data: { attributes: { ohlcv_list: [[1700003600, 2, 3, 1, 2.5, 10], [1700000000, 1, 2, 0.5, 1.5, 5], [1700007200, 'x', 1, 1, 1, 1], [1700010800, 1, 2]] } } })
  const r = await (await get('/api/market/ohlcv?tf=1h')).json()
  assert.deepEqual(r.candles.map(c => c[0]), [1700000000, 1700003600])
  assert.ok(seen.find(u => u.includes('/ohlcv/hour')).includes('include_empty_intervals=true'))
})
