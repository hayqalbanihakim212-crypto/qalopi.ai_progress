import { Fragment, useState } from 'react'
import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { useApi } from '../lib/useApi.js'
import { compact, usdPrice } from '../lib/format.js'

const TFS = ['5m', '15m', '1h', '4h', '1d'] // only what GeckoTerminal actually supports
const W = 720, H = 300, M = { l: 8, r: 78, t: 10, b: 22 }, VOL_H = 44

// Candle = [unixSeconds, open, high, low, close, volume] (GeckoTerminal OHLCV, USD per token).
export default function Chart() {
  const L = useL()
  const [tf, setTf] = useState('1h')
  const [hover, setHover] = useState(null)
  const { data, error, loading } = useApi(`/market/ohlcv?tf=${tf}`, 60000)
  const c = data?.candles || []
  const plotW = W - M.l - M.r, priceH = H - M.t - M.b - VOL_H - 6
  const slot = plotW / Math.max(c.length, 1)
  const lo = c.length ? Math.min(...c.map(x => x[3])) : 0, hi = c.length ? Math.max(...c.map(x => x[2])) : 1
  const pad = (hi - lo) * 0.08 || hi * 0.05 || 1e-9
  const top = hi + pad, bottom = Math.max(0, lo - pad)
  const y = v => M.t + priceH * (1 - (v - bottom) / (top - bottom || 1))
  const maxVol = c.length ? Math.max(...c.map(x => x[5] || 0)) : 0
  const volY = v => H - M.b - (maxVol ? ((v || 0) / maxVol) * VOL_H : 0)
  const fmtTime = (s, long) => { const d = new Date(s * 1000); return tf === '1d' ? d.toLocaleDateString() : long ? d.toLocaleString() : d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  const shown = c.length ? c[hover ?? c.length - 1] : null
  const onMove = e => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W - M.l
    setHover(Math.min(c.length - 1, Math.max(0, Math.floor(x / slot))))
  }
  const grid = [0, 1, 2, 3].map(i => bottom + ((top - bottom) * i) / 3)
  const col = x => (x[4] >= x[1] ? 'var(--blue)' : 'var(--bad)')
  return html`<div>
    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
      <div className="flex gap-2" role="group" aria-label=${L('Timeframe', 'Rentang waktu')}>${TFS.map(k => html`<button key=${k} onClick=${() => { setTf(k); setHover(null) }} aria-pressed=${tf === k} className="px-2 py-0.5 text-sm border" style=${{ borderColor: tf === k ? 'var(--gold)' : 'var(--line)', color: tf === k ? 'var(--gold)' : 'var(--mut)' }}>${k}</button>`)}</div>
      ${shown && html`<p className="mut text-xs" aria-live="off">${fmtTime(shown[0], true)} · O ${usdPrice(shown[1])} H ${usdPrice(shown[2])} L ${usdPrice(shown[3])} C ${usdPrice(shown[4])} · ${L('Vol', 'Vol')} ${compact(shown[5]) ?? '0'}</p>`}
    </div>
    ${loading && !c.length ? html`<p className="mut text-sm">${L('Loading chart…', 'Memuat grafik…')}</p>` : error ? html`<p className="text-sm" style=${{ color: 'var(--bad)' }}>${L('Chart data is temporarily unavailable.', 'Data grafik sedang tidak tersedia.')}</p>` : !c.length ? html`<p className="mut text-sm">${L('No candles for this timeframe yet.', 'Belum ada candle untuk timeframe ini.')}</p>` : html`<${Fragment}>
      <svg viewBox=${`0 0 ${W} ${H}`} className="w-full border ln" style=${{ touchAction: 'pan-y', background: 'var(--bg2)' }} role="img" aria-label=${L(`Candlestick chart, ${c.length} candles, last price ${usdPrice(c[c.length - 1][4])}`, `Grafik candlestick, ${c.length} candle, harga terakhir ${usdPrice(c[c.length - 1][4])}`)} onPointerMove=${onMove} onPointerDown=${onMove} onPointerLeave=${() => setHover(null)}>
        ${grid.map((v, i) => html`<g key=${i}><line x1=${M.l} x2=${W - M.r} y1=${y(v)} y2=${y(v)} stroke="var(--line)" strokeDasharray="3 4"/><text x=${W - M.r + 6} y=${y(v) + 4} fontSize="11" fill="var(--mut)">${usdPrice(v)}</text></g>`)}
        ${c.map((x, i) => { const cx = M.l + i * slot + slot / 2; const bw = Math.max(1, slot * 0.64); return html`<g key=${x[0]} opacity=${hover == null || hover === i ? 1 : 0.55}><rect x=${cx - bw / 2} width=${bw} y=${volY(x[5])} height=${H - M.b - volY(x[5])} fill=${col(x)} opacity="0.35"/><line x1=${cx} x2=${cx} y1=${y(x[2])} y2=${y(x[3])} stroke=${col(x)}/><rect x=${cx - bw / 2} width=${bw} y=${Math.min(y(x[1]), y(x[4]))} height=${Math.max(1, Math.abs(y(x[1]) - y(x[4])))} fill=${col(x)}/></g>` })}
        <line x1=${M.l} x2=${W - M.r} y1=${y(c[c.length - 1][4])} y2=${y(c[c.length - 1][4])} stroke="var(--gold)" strokeWidth="1" strokeDasharray="2 3"/>
        <text x=${W - M.r + 6} y=${y(c[c.length - 1][4]) - 4} fontSize="11" fontWeight="700" fill="var(--gold)">${usdPrice(c[c.length - 1][4])}</text>
        ${hover != null && html`<line x1=${M.l + hover * slot + slot / 2} x2=${M.l + hover * slot + slot / 2} y1=${M.t} y2=${H - M.b} stroke="var(--mut)" strokeWidth="1"/>`}
        <text x=${M.l} y=${H - 6} fontSize="11" fill="var(--mut)">${fmtTime(c[0][0])}</text>
        <text x=${W - M.r} y=${H - 6} fontSize="11" textAnchor="end" fill="var(--mut)">${fmtTime(c[c.length - 1][0])}</text>
      </svg>
      <p className="mut text-xs mt-1">${L('Source', 'Sumber')}: ${data.provider} · USD ${L('per token', 'per token')} · ${L('flat candles mean no trades in that period', 'candle datar berarti tidak ada transaksi pada periode itu')}</p><//>`}
  </div>`
}
