import { useEffect, useState } from 'react'
import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { DONATE } from '../config/site.js'
import CopyButton from './CopyButton.js'

const qrCache = new Map()
// Generated in the browser (no external QR service, so the address never leaves the page).
async function makeQr(text) {
  if (qrCache.has(text)) return qrCache.get(text)
  const QRCode = (await import('qrcode')).default
  const svg = await QRCode.toString(text, { type: 'svg', errorCorrectionLevel: 'M', margin: 1, color: { dark: '#000000', light: '#ffffff' } })
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  qrCache.set(text, url)
  return url
}

export default function Donate() {
  const L = useL()
  const [id, setId] = useState(DONATE[0].id)
  const [qr, setQr] = useState('')
  const d = DONATE.find(x => x.id === id) || DONATE[0]
  useEffect(() => {
    let off = false
    setQr('')
    makeQr(d.address).then(u => !off && setQr(u)).catch(() => {})
    return () => { off = true }
  }, [d.address])
  const onKey = (e, i) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = DONATE[(i + (e.key === 'ArrowRight' ? 1 : DONATE.length - 1)) % DONATE.length]
    setId(next.id)
    document.getElementById('donate-tab-' + next.id)?.focus()
  }
  return html`<div>
    <h3 className="serif text-2xl font-semibold mb-2">${L('Donate', 'Donasi')}</h3>
    <p className="mut text-sm mb-4">${L('Choose a coin, then send only on the network shown.', 'Pilih koin, lalu kirim hanya melalui jaringan yang ditampilkan.')}</p>
    <div role="tablist" aria-label=${L('Donation coin', 'Koin donasi')} className="flex flex-wrap gap-2">${DONATE.map((x, i) => html`<button key=${x.id} id=${'donate-tab-' + x.id} role="tab" type="button" aria-selected=${x.id === id} aria-controls="donate-panel" tabIndex=${x.id === id ? 0 : -1} onClick=${() => setId(x.id)} onKeyDown=${e => onKey(e, i)} className="px-3 py-1 text-sm border font-semibold" style=${{ borderColor: x.id === id ? 'var(--gold)' : 'var(--line)', color: x.id === id ? 'var(--gold)' : 'var(--mut)' }}>${x.symbol}</button>`)}</div>
    <div id="donate-panel" role="tabpanel" aria-labelledby=${'donate-tab-' + d.id} className="mt-4 border ln p-4 grid sm:grid-cols-[auto_1fr] gap-5 items-start">
      <div className="w-40 h-40 shrink-0" style=${{ background: '#fff' }}>${qr ? html`<img src=${qr} alt=${L(`QR code of the ${d.symbol} donation address`, `Kode QR alamat donasi ${d.symbol}`)} width="160" height="160" className="w-40 h-40"/>` : html`<div className="w-40 h-40 flex items-center justify-center text-xs" style=${{ color: '#555' }}>${L('Generating QR…', 'Membuat QR…')}</div>`}</div>
      <div className="min-w-0">
        <p className="font-semibold">${d.name} (${d.symbol})</p>
        <p className="mut text-sm">${L('Network', 'Jaringan')}: ${d.network}</p>
        <p className="mt-3 break-all text-sm font-mono select-all" data-testid="donate-address">${d.address}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3"><${CopyButton} text=${d.address} label=${L(`Copy ${d.symbol} address`, `Salin alamat ${d.symbol}`)}/><a className="underline text-sm" href=${d.explorer + d.address} target="_blank" rel="noopener noreferrer">${L('View on explorer', 'Lihat di explorer')}</a></div>
      </div>
    </div>
    <ul className="mut text-sm mt-4 list-disc pl-5 space-y-1">
      <li>${L('BNB, ETH and MON use the same 0x address but are different networks. Select the correct network in your wallet; funds sent on the wrong network may be lost.', 'BNB, ETH, dan MON memakai alamat 0x yang sama tetapi jaringannya berbeda. Pilih jaringan yang benar di dompet Anda; dana yang dikirim lewat jaringan yang salah bisa hilang.')}</li>
      <li>${L('Compare the address with the one on the explorer before sending. We never ask for donations by direct message and never ask for a seed phrase or private key.', 'Cocokkan alamat dengan yang ada di explorer sebelum mengirim. Kami tidak pernah meminta donasi lewat pesan pribadi dan tidak pernah meminta seed phrase atau private key.')}</li>
      <li>${L('Donations are voluntary, not an investment, and give no token, share or return. Confirmed receipts appear in the public ledger.', 'Donasi bersifat sukarela, bukan investasi, dan tidak memberi token, saham, maupun imbal hasil. Penerimaan yang terkonfirmasi tampil di buku besar publik.')}</li>
    </ul>
  </div>`
}
