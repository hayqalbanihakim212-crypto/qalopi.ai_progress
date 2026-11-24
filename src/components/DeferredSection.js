import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { SectionAnchorContext } from './ui.js'

export default function DeferredSection({ id, Component }) {
  const L = useL()
  const anchor = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!anchor.current || !('IntersectionObserver' in window)) {
      setReady(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setReady(true)
        observer.disconnect()
      }
    }, { rootMargin: '700px 0px' })
    observer.observe(anchor.current)
    return () => observer.disconnect()
  }, [])

  return html`<div id=${id} ref=${anchor} className="scroll-mt-24">
    ${ready ? html`<${SectionAnchorContext.Provider} value=${true}>
      <${Suspense} fallback=${html`<div className="max-w-6xl mx-auto px-5 py-16 mut">${L('Loading section…', 'Memuat bagian…')}</div>`}>
        <${Component}/>
      <//>
    <//>` : null}
  </div>`
}
