import { useEffect, useState } from 'react'
import { api } from './api.js'
// GET helper with loading/error state. Pass null to skip the request.
export function useApi(path, refreshIntervalMs = 0) {
  const [s, setS] = useState({ data: null, error: null, loading: !!path })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!path) { setS({ data: null, error: null, loading: false }); return }
    let off = false
    let pending = false
    setS(x => ({ ...x, loading: true, error: null }))
    const load = () => {
      if (pending) return
      pending = true
      api(path)
        .then(d => !off && setS({ data: d, error: null, loading: false }))
        .catch(e => !off && setS({ data: null, error: e.message, loading: false }))
        .finally(() => { pending = false })
    }
    load()
    const timer = refreshIntervalMs > 0 ? setInterval(load, refreshIntervalMs) : null
    return () => { off = true; if (timer) clearInterval(timer) }
  }, [path, n, refreshIntervalMs])
  return { ...s, reload: () => setN(x => x + 1) }
}
