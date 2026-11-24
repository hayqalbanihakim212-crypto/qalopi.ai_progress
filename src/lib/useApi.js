import { useEffect, useState } from 'react'
import { api } from './api.js'
// GET helper with loading/error state. Pass null to skip the request.
export function useApi(path) {
  const [s, setS] = useState({ data: null, error: null, loading: !!path })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!path) { setS({ data: null, error: null, loading: false }); return }
    let off = false
    setS(x => ({ ...x, loading: true, error: null }))
    api(path).then(d => !off && setS({ data: d, error: null, loading: false })).catch(e => !off && setS({ data: null, error: e.message, loading: false }))
    return () => { off = true }
  }, [path, n])
  return { ...s, reload: () => setN(x => x + 1) }
}
