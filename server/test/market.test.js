import { test } from 'node:test'
import assert from 'node:assert/strict'
import { geckoPoolToMarket, marketNumber, normalizeTrades, selectGeckoPool, selectSolanaBasePair } from '../lib/market.js'

const mint = 'So11111111111111111111111111111111111111112'
const pair = (overrides = {}) => ({
  chainId: 'solana',
  baseToken: { address: mint },
  priceUsd: '0.125',
  liquidity: { usd: 100 },
  ...overrides,
})

test('selects the most liquid Solana pair where the configured mint is the base token', () => {
  const selected = selectSolanaBasePair([
    pair({ liquidity: { usd: 100 } }),
    pair({ liquidity: { usd: 500 } }),
    pair({ chainId: 'ethereum', liquidity: { usd: 900 } }),
    pair({ baseToken: { address: 'another-token' }, liquidity: { usd: 1000 } }),
  ], mint)

  assert.equal(selected.liquidity.usd, 500)
})

test('does not report a quote-token, invalid, or zero price as the token market price', () => {
  assert.equal(selectSolanaBasePair([
    pair({ baseToken: { address: 'another-token' }, quoteToken: { address: mint } }),
    pair({ baseToken: { address: mint.toLowerCase() } }),
    pair({ priceUsd: 'invalid' }),
    pair({ priceUsd: '0' }),
  ], mint), null)
})

test('normalizes numeric market data and rejects non-finite values', () => {
  assert.equal(marketNumber('1.25'), 1.25)
  assert.equal(marketNumber('unavailable'), null)
  assert.equal(marketNumber(null), null)
})

const QLPO = 'AGVeuGdPYePghgF6evN8C8mceNzDVT4GVZdcPRDfpump'
const POOL = 'G6jcR1v8mYVs2F4rhqTDg5953eyjb4ydM3ZaU4LXwVzc'
const SIG = '5'.repeat(87)
const WALLET = '6WThPwhGp1rato61eESPy43XJLQvf168vJmnifgvt3dC'
const gtPool = (o = {}) => ({
  id: 'solana_' + POOL,
  attributes: { address: POOL, base_token_price_usd: '0.000004', reserve_in_usd: '66.27', fdv_usd: '4000', market_cap_usd: '4000', volume_usd: { h24: '0.1' }, price_change_percentage: { h24: '0' }, ...o.attributes },
  relationships: { base_token: { data: { id: 'solana_' + QLPO } }, dex: { data: { id: 'pump-fun' } }, ...o.relationships },
})

test('GeckoTerminal fallback only accepts pools where the mint is the base token with a real price', () => {
  assert.equal(selectGeckoPool([gtPool({ relationships: { base_token: { data: { id: 'solana_other' } } } })], QLPO), null)
  assert.equal(selectGeckoPool([gtPool({ attributes: { base_token_price_usd: '0' } })], QLPO), null)
  assert.equal(selectGeckoPool([gtPool({ attributes: { address: 'bad address' } })], QLPO), null)
  assert.equal(selectGeckoPool([gtPool({ attributes: { reserve_in_usd: '10' } }), gtPool({ attributes: { address: 'So11111111111111111111111111111111111111112', reserve_in_usd: '900' } })], QLPO).attributes.address, 'So11111111111111111111111111111111111111112')
  const m = geckoPoolToMarket(selectGeckoPool([gtPool()], QLPO), new Date('2026-01-01T00:00:00Z'))
  assert.equal(m.provider, 'GeckoTerminal')
  assert.equal(m.pairAddress, POOL)
  assert.equal(m.price, 0.000004)
  assert.equal(m.liquidityUsd, 66.27)
  assert.equal(m.marketCapUsd, 4000)
})

const gtTrade = (o = {}) => ({ attributes: { block_timestamp: '2026-11-26T10:00:00Z', tx_hash: SIG, tx_from_address: WALLET, kind: 'buy', from_token_address: 'So11111111111111111111111111111111111111112', to_token_address: QLPO, from_token_amount: '0.001', to_token_amount: '235000', price_to_in_usd: '0.000004', price_from_in_usd: '150', volume_in_usd: '0.95', ...o } })

test('trades are normalised from the mint side, newest first, and never invented', () => {
  const out = normalizeTrades([
    gtTrade({ block_timestamp: '2026-11-26T09:00:00Z' }),
    gtTrade({ kind: 'sell', from_token_address: QLPO, to_token_address: 'So11111111111111111111111111111111111111112', from_token_amount: '1000', price_from_in_usd: '0.000005', volume_in_usd: '0.005', block_timestamp: '2026-11-26T11:00:00Z' }),
    gtTrade({ from_token_address: 'x', to_token_address: 'y' }),            // unrelated pair: dropped
    gtTrade({ block_timestamp: 'not-a-date' }),                              // bad time: dropped
    gtTrade({ tx_hash: 'javascript:alert(1)', tx_from_address: '<b>' }),      // bad links: kept but without links
  ], QLPO)
  assert.equal(out.length, 3)
  assert.deepEqual(out.map(t => t.side), ['sell', 'buy', 'buy'])
  assert.equal(out[0].tokenAmount, 1000)
  assert.equal(out[0].priceUsd, 0.000005)
  // 11:00 sell, 10:00 buy with unverifiable links (kept, but no links), 09:00 buy with valid links
  assert.equal(out[1].signature, null)
  assert.equal(out[1].wallet, null)
  assert.equal(out[2].volumeUsd, 0.95)
  assert.equal(out[2].signature, SIG)
  assert.equal(out[2].wallet, WALLET)
  assert.deepEqual(normalizeTrades(undefined, QLPO), [])
  assert.equal(normalizeTrades(Array.from({ length: 80 }, (_, i) => gtTrade({ block_timestamp: new Date(1e12 + i * 1000).toISOString() })), QLPO).length, 50)
})
