export const usd = n => (n == null ? null : n < 1 ? '$' + Number(n).toPrecision(4) : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 }))
export const when = d => (d ? new Date(d).toLocaleString() : '')
