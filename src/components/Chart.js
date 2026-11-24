import { useState } from 'react'
import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { useApi } from '../lib/useApi.js'

const TFS = ['5m', '15m', '1h', '4h', '1d'] // only what GeckoTerminal actually supports
export default function Chart() {
  const L = useL()
  const [tf, setTf] = useState('1h')
  const { data, error, loading } = useApi(`/market/ohlcv?tf=${tf}`, 60000)
  const c = data?.candles || []
  const W = 640, H = 240, w = W / Math.max(c.length, 1)
  const lo = Math.min(...c.map(x => x[3])), hi = Math.max(...c.map(x => x[2]))
  const y = v => 8 + (H - 16) * (1 - (v - lo) / (hi - lo || 1))
  return html`<div className="mt-6">
    <div className="flex gap-2 mb-2" role="group" aria-label="Timeframe">${TFS.map(k => html`<button key=${k} onClick=${() => setTf(k)} aria-pressed=${tf === k} className="px-2 py-0.5 text-sm border" style=${{ borderColor: tf === k ? 'var(--gold)' : 'var(--line)', color: tf === k ? 'var(--gold)' : 'var(--mut)' }}>${k}</button>`)}</div>
    ${loading ? html`<p className="mut text-sm">${L('Loading chart…', 'Memuat grafik…')}</p>` : error ? html`<p className="text-sm" style=${{ color: 'var(--bad)' }}>${error}</p>` : !c.length ? html`<p className="mut text-sm">${L('No candles for this timeframe yet.', 'Belum ada candle untuk timeframe ini.')}</p>` : html`
      <svg viewBox=${`0 0 ${W} ${H}`} className="w-full border ln" role="img" aria-label="Candlestick chart">${c.map((x, i) => { const up = x[4] >= x[1]; const col = up ? 'var(--blue)' : 'var(--bad)'; const cx = i * w + w / 2; return html`<g key=${x[0]}><line x1=${cx} x2=${cx} y1=${y(x[2])} y2=${y(x[3])} stroke=${col}/><rect x=${i * w + w * 0.2} width=${w * 0.6} y=${Math.min(y(x[1]), y(x[4]))} height=${Math.max(1, Math.abs(y(x[1]) - y(x[4])))} fill=${col}/></g>` })}</svg>
      <p className="mut text-xs mt-1">${L('Source', 'Sumber')}: ${data.provider}</p>`}
  </div>`
}
