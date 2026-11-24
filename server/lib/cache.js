const m = new Map()
export async function cached(key, ttlMs, fn) {
  const h = m.get(key)
  if (h && h.exp > Date.now()) return h.v
  const v = await fn()
  m.set(key, { v, exp: Date.now() + ttlMs })
  return v
}
