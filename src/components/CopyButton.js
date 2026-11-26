import { useEffect, useRef, useState } from 'react'
import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true } catch { /* fall back below */ }
  try {
    const t = document.createElement('textarea')
    t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0'
    document.body.appendChild(t); t.select()
    const done = document.execCommand('copy')
    document.body.removeChild(t)
    return done
  } catch { return false }
}

export default function CopyButton({ text, label }) {
  const L = useL()
  const [state, setState] = useState('idle') // idle | copied | failed
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const onClick = async () => {
    setState((await copyText(text)) ? 'copied' : 'failed')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), 2000)
  }
  const msg = state === 'copied' ? L('Copied', 'Tersalin') : state === 'failed' ? L('Copy failed, select the text manually', 'Gagal menyalin, pilih teks secara manual') : ''
  return html`<span className="inline-flex items-center gap-2"><button type="button" className="px-2 py-0.5 text-sm border ln" style=${{ color: 'var(--gold)', borderColor: 'var(--gold)' }} onClick=${onClick} aria-label=${label || L('Copy address', 'Salin alamat')}>${state === 'copied' ? L('Copied', 'Tersalin') : L('Copy', 'Salin')}</button><span role="status" aria-live="polite" className="text-xs mut">${state === 'failed' ? msg : ''}</span></span>`
}
