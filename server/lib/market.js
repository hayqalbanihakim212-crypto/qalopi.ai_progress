const B58_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
const SOLANA_SIGNATURE = /^[1-9A-HJ-NP-Za-km-z]{64,90}$/

export function selectSolanaBasePair(pairs, mint) {
  const expectedMint = String(mint)
  return (Array.isArray(pairs) ? pairs : [])
    .filter(pair =>
      pair?.chainId === 'solana' &&
      String(pair.baseToken?.address || '') === expectedMint &&
      Number.isFinite(Number(pair.priceUsd)) &&
      Number(pair.priceUsd) > 0
    )
    .sort((a, b) => (Number(b.liquidity?.usd) || 0) - (Number(a.liquidity?.usd) || 0))[0] || null
}

export function marketNumber(value) {
  if (value == null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

// ---- GeckoTerminal fallback (used when DexScreener has not indexed the pair yet) ----

// GeckoTerminal /networks/solana/tokens/{mint}/pools. Keep only pools where the configured
// mint is the BASE token and the price is a real positive number; most liquid pool wins.
export function selectGeckoPool(pools, mint) {
  const baseId = 'solana_' + String(mint)
  return (Array.isArray(pools) ? pools : [])
    .filter(pool =>
      pool?.relationships?.base_token?.data?.id === baseId &&
      B58_ADDRESS.test(String(pool.attributes?.address || '')) &&
      (marketNumber(pool.attributes?.base_token_price_usd) ?? 0) > 0
    )
    .sort((a, b) => (marketNumber(b.attributes?.reserve_in_usd) || 0) - (marketNumber(a.attributes?.reserve_in_usd) || 0))[0] || null
}

export function geckoPoolToMarket(pool, now = new Date()) {
  const a = pool.attributes || {}
  return {
    available: true,
    provider: 'GeckoTerminal',
    dex: String(pool.relationships?.dex?.data?.id || ''),
    pairAddress: a.address,
    pairUrl: 'https://www.geckoterminal.com/solana/pools/' + a.address,
    price: marketNumber(a.base_token_price_usd),
    priceChange24h: marketNumber(a.price_change_percentage?.h24),
    liquidityUsd: marketNumber(a.reserve_in_usd),
    volume24hUsd: marketNumber(a.volume_usd?.h24),
    marketCapUsd: marketNumber(a.market_cap_usd),
    fdvUsd: marketNumber(a.fdv_usd),
    lastSynced: now.toISOString(),
  }
}

// ---- Real swaps (GeckoTerminal /pools/{pool}/trades: last 24h, max 300) ----

// Converts raw provider rows into the public trade shape. Rows that do not involve the
// configured mint, or lack a valid timestamp, are dropped. Nothing is invented: a missing
// number stays null and an unverifiable signature/wallet gets no link.
export function normalizeTrades(rows, mint, limit = 50) {
  const expected = String(mint)
  return (Array.isArray(rows) ? rows : [])
    .map(row => {
      const a = row?.attributes || {}
      let side, tokenAmount, priceUsd
      if (String(a.to_token_address || '') === expected) {
        side = 'buy'; tokenAmount = marketNumber(a.to_token_amount); priceUsd = marketNumber(a.price_to_in_usd)
      } else if (String(a.from_token_address || '') === expected) {
        side = 'sell'; tokenAmount = marketNumber(a.from_token_amount); priceUsd = marketNumber(a.price_from_in_usd)
      } else return null
      const time = Date.parse(a.block_timestamp)
      if (!Number.isFinite(time)) return null
      const signature = String(a.tx_hash || '')
      const wallet = String(a.tx_from_address || '')
      return {
        side,
        time: new Date(time).toISOString(),
        tokenAmount,
        priceUsd,
        volumeUsd: marketNumber(a.volume_in_usd),
        wallet: B58_ADDRESS.test(wallet) ? wallet : null,
        signature: SOLANA_SIGNATURE.test(signature) ? signature : null,
      }
    })
    .filter(Boolean)
    .sort((x, y) => Date.parse(y.time) - Date.parse(x.time))
    .slice(0, limit)
}
