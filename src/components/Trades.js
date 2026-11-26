import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { useApi } from '../lib/useApi.js'
import { CFG } from '../config/site.js'
import { ago, compact, shortAddr, usdPrice, usdSmall, when } from '../lib/format.js'

// Real swaps for the token's pool, straight from the market provider. Never simulated or padded.
export default function Trades({ mint }) {
  const L = useL()
  const { data, error, loading } = useApi('/market/trades', 30000)
  const trades = data?.trades || []
  const th = 'text-left font-medium py-2 pr-4 whitespace-nowrap'
  return html`<div>
    <h3 className="serif text-2xl font-semibold">${L('Recent transactions', 'Transaksi terbaru')}</h3>
    <p className="mut text-sm mt-1">${L('Real on-chain swaps of the token, from the last 24 hours. Every row links to its Solscan record.', 'Swap on-chain nyata untuk token ini dalam 24 jam terakhir. Setiap baris tertaut ke catatan Solscan.')}</p>
    <div className="mt-4">
    ${loading && !data ? html`<p className="mut text-sm">${L('Loading transactions…', 'Memuat transaksi…')}</p>`
      : error ? html`<p className="text-sm" style=${{ color: 'var(--bad)' }}>${L('Transaction data is temporarily unavailable.', 'Data transaksi sedang tidak tersedia.')}</p>`
      : !trades.length ? html`<p className="mut text-sm border ln p-4">${L('No swaps in the last 24 hours. Nothing is simulated: this list fills automatically as soon as someone buys or sells.', 'Belum ada swap dalam 24 jam terakhir. Tidak ada yang disimulasikan: daftar ini terisi otomatis begitu ada yang membeli atau menjual.')}</p>`
      : html`<div className="tbl"><table className="w-full text-sm"><thead className="mut border-b ln"><tr>
          <th className=${th}>${L('Time', 'Waktu')}</th><th className=${th}>${L('Type', 'Jenis')}</th><th className=${th + ' text-right'}>${L('Amount', 'Jumlah')} (${CFG.tokenSymbol})</th><th className=${th + ' text-right'}>${L('Price', 'Harga')}</th><th className=${th + ' text-right'}>${L('Value', 'Nilai')}</th><th className=${th}>${L('Wallet', 'Dompet')}</th><th className=${th}>${L('Transaction', 'Transaksi')}</th></tr></thead>
          <tbody>${trades.map((t, i) => html`<tr key=${(t.signature || t.time) + i} className="border-b ln">
            <td className="py-2 pr-4 whitespace-nowrap" title=${when(t.time)}>${ago(t.time, L)}</td>
            <td className="py-2 pr-4 font-semibold" style=${{ color: t.side === 'buy' ? 'var(--blue)' : 'var(--bad)' }}>${t.side === 'buy' ? L('Buy', 'Beli') : L('Sell', 'Jual')}</td>
            <td className="py-2 pr-4 text-right">${compact(t.tokenAmount) ?? '–'}</td>
            <td className="py-2 pr-4 text-right whitespace-nowrap">${usdPrice(t.priceUsd) ?? '–'}</td>
            <td className="py-2 pr-4 text-right">${usdSmall(t.volumeUsd) ?? '–'}</td>
            <td className="py-2 pr-4">${t.wallet ? html`<a className="underline" href=${'https://solscan.io/account/' + t.wallet} target="_blank" rel="noopener noreferrer">${shortAddr(t.wallet)}</a>` : '–'}</td>
            <td className="py-2 pr-4">${t.signature ? html`<a className="underline" href=${'https://solscan.io/tx/' + t.signature} target="_blank" rel="noopener noreferrer">${shortAddr(t.signature)}</a>` : '–'}</td></tr>`)}</tbody></table></div>`}
    </div>
    <p className="mut text-xs mt-2">${data?.provider ? html`${L('Source', 'Sumber')}: ${data.provider} · ${L('last synced', 'sinkron terakhir')} ${when(data.lastSynced)} · ` : null}${mint ? html`<a className="underline" href=${'https://solscan.io/token/' + mint} target="_blank" rel="noopener noreferrer">${L('Full token history on Solscan', 'Riwayat lengkap token di Solscan')}</a>` : null}</p>
  </div>`
}
