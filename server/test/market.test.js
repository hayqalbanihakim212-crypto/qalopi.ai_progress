import { test } from 'node:test'
import assert from 'node:assert/strict'
import { marketNumber, selectSolanaBasePair } from '../lib/market.js'

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
