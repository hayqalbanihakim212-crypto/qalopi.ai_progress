export const usd = n => (n == null ? null : n < 1 ? '$' + Number(n).toPrecision(4) : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 }))
export const when = d => (d ? new Date(d).toLocaleString() : '')

// Token prices are often tiny (e.g. 0.000004). Fixed decimals with ~4 significant digits, never exponent notation.
export const usdPrice = n => {
  if (n == null || !Number.isFinite(n)) return null
  if (n === 0) return '$0'
  const abs = Math.abs(n)
  if (abs >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (abs >= 1) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 })
  const decimals = Math.min(12, Math.max(2, -Math.floor(Math.log10(abs)) + 3))
  return '$' + n.toFixed(decimals)
}
export const usdSmall = n => (n == null || !Number.isFinite(n) ? null : n >= 1 ? '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '$' + n.toFixed(n >= 0.01 ? 2 : 4))
export const compact = n => (n == null || !Number.isFinite(n) ? null : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(n))
export const shortAddr = a => (a && a.length > 12 ? a.slice(0, 4) + '…' + a.slice(-4) : a || '')
// Relative time, localised by the caller: L(en, id).
export const ago = (iso, L) => {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return L(`${s}s ago`, `${s} dtk lalu`)
  if (s < 3600) return L(`${Math.floor(s / 60)}m ago`, `${Math.floor(s / 60)} mnt lalu`)
  if (s < 86400) return L(`${Math.floor(s / 3600)}h ago`, `${Math.floor(s / 3600)} jam lalu`)
  return L(`${Math.floor(s / 86400)}d ago`, `${Math.floor(s / 86400)} hr lalu`)
}
