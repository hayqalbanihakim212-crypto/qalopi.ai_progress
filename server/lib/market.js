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
