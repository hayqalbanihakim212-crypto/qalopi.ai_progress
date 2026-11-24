export async function api(path, { method = 'GET', body } = {}) {
  const r = await fetch('/api' + path, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
  let d = null
  try { d = await r.json() } catch { /* empty body */ }
  if (!r.ok) throw Object.assign(new Error(d?.error || 'Request failed'), { status: r.status, details: d?.details })
  return d
}
