import { Fragment } from 'react'
import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { Sec, Row, NA } from '../components/ui.js'
import Chart from '../components/Chart.js'
import Trades from '../components/Trades.js'
import CopyButton from '../components/CopyButton.js'
import { CFG, ok } from '../config/site.js'
import { useApi } from '../lib/useApi.js'
import { usd, usdPrice, when } from '../lib/format.js'

export default function Token() {
  const L = useL()
  const sym = '$' + CFG.tokenSymbol
  const { data: s } = useApi('/settings', 30000)
  const st = s || {}
  const live = st.launchStatus === 'LAUNCHED' && !!st.mint && ok(st.pumpfunUrl)
  const { data: m, error: me } = useApi(live ? '/market' : null, 30000)
  const mk = m && m.available ? m : null
  const rows = [
    [L('Price', 'Harga'), mk && usdPrice(mk.price)],
    [L('24h change', 'Perubahan 24 jam'), mk && mk.priceChange24h != null ? mk.priceChange24h + '%' : null],
    [L('Market cap', 'Kapitalisasi pasar'), mk && usd(mk.marketCapUsd)],
    ['FDV', mk && usd(mk.fdvUsd)],
    [L('Liquidity', 'Likuiditas'), mk && usd(mk.liquidityUsd)],
    [L('24h volume', 'Volume 24 jam'), mk && usd(mk.volume24hUsd)],
    [L('Holders', 'Pemegang'), null],
    [L('Creator rewards', 'Creator rewards'), null],
  ]
  return html`<${Sec} id="token" title=${L(`${sym}, a community token on Solana.`, `${sym}, token komunitas di Solana.`)} lead=${live ? L('Live on Pump.fun. It is not the native coin of the QALOPI Layer-1, and no migration, conversion or airdrop is promised.', 'Sudah live di Pump.fun. Ini bukan koin native Layer-1 QALOPI, dan tidak ada janji migrasi, konversi, atau airdrop.') : L('Planned for launch on Pump.fun. It is not the native coin of the QALOPI Layer-1, and no migration, conversion or airdrop is promised.', 'Direncanakan meluncur di Pump.fun. Ini bukan koin native Layer-1 QALOPI, dan tidak ada janji migrasi, konversi, atau airdrop.')}>
<div className="grid md:grid-cols-2 gap-10"><div>
<${Row} k=${L('Launch status', 'Status peluncuran')}>${live ? 'LAUNCHED' : 'NOT_LAUNCHED'}<//>
${live && html`<${Row} k=${L('Token', 'Token')}>${CFG.tokenName} (${sym})<//>`}
<${Row} k=${L('Official mint address', 'Alamat mint resmi')}>${live ? html`<span className="flex flex-col items-end gap-1"><span className="break-all text-sm">${st.mint}</span><${CopyButton} text=${st.mint} label=${L('Copy mint address', 'Salin alamat mint')}/></span>` : html`<${NA}/>`}<//>
${rows.map(([k, v]) => html`<${Row} key=${k} k=${k}>${v || html`<${NA}/>`}<//>`)}
${me && html`<p className="text-sm mt-3" style=${{ color: 'var(--bad)' }}>${L('Market data is temporarily unavailable.', 'Data pasar sedang tidak tersedia.')}</p>`}
${mk && html`<p className="mut text-xs mt-2">${L('Source', 'Sumber')}: ${mk.provider} · ${L('last synced', 'sinkron terakhir')} ${when(mk.lastSynced)}</p>`}
${mk?.pairUrl && html`<p className="mut text-xs mt-1"><a className="underline" href=${mk.pairUrl} rel="noopener noreferrer" target="_blank">${L('View live market pair', 'Lihat pasangan market')}</a></p>`}
<div className="mt-6 flex flex-wrap gap-3">${live ? html`<${Fragment}><a className="btn" href=${st.pumpfunUrl} rel="noopener noreferrer" target="_blank">${L('Open on Pump.fun', 'Buka di Pump.fun')}</a><a className="btn" href=${'https://solscan.io/token/' + st.mint} rel="noopener noreferrer" target="_blank">${L('View on Solscan', 'Lihat di Solscan')}</a><//>` : html`<button className="btn" disabled>${L(`Buy ${sym} (unavailable until the mint is verified)`, `Beli ${sym} (tidak tersedia sampai mint terverifikasi)`)}</button>`}</div>
${live && m && !mk && html`<p className="mut text-sm mt-3">${L('No verified public market pair was found for this mint yet. Prices will appear when a real Solana pool is indexed.', 'Pasangan pasar publik yang terverifikasi untuk mint ini belum ditemukan. Harga akan tampil setelah pool Solana nyata terindeks.')}</p>`}
${!live && html`<p className="mut text-sm mt-3">${L('Charts appear only when real market data from a documented provider is connected.', 'Grafik hanya muncul setelah data pasar nyata dari penyedia terdokumentasi terhubung.')}</p>`}</div>
<div><h3 className="serif text-2xl font-semibold">${L(`Buying ${sym} does not give you`, `Membeli ${sym} tidak memberi Anda`)}</h3>
<ul className="mt-3 mut list-disc pl-5 space-y-1">${[['shares in QALOPI.AI', 'saham QALOPI.AI'], ['ownership of intellectual property', 'kepemilikan kekayaan intelektual'], ['a right to company revenue', 'hak atas pendapatan perusahaan'], ['fixed returns or any guarantee of profit', 'imbal hasil tetap atau jaminan keuntungan'], ['rights to a future native coin', 'hak atas koin native di masa depan']].map(x => html`<li key=${x[0]}>${L(x[0], x[1])}</li>`)}</ul>
<p className="mut text-sm mt-5">${L('Token prices can fall to zero. We will never ask for your seed phrase or private key, and we never trade on your behalf. Verify the mint address here before any purchase.', 'Harga token bisa jatuh ke nol. Kami tidak akan pernah meminta seed phrase atau private key, dan tidak pernah bertransaksi atas nama Anda. Verifikasi alamat mint di sini sebelum membeli.')}</p>
${live && mk && html`<p className="mut text-sm mt-3">${L('This is a very new, thinly traded token: price and volume can be near zero and a single trade can move the price sharply.', 'Ini token yang sangat baru dengan perdagangan tipis: harga dan volume bisa mendekati nol, dan satu transaksi saja dapat menggerakkan harga secara tajam.')}</p>`}</div></div>
${live && mk && html`<${Fragment}><div className="mt-14"><h3 className="serif text-2xl font-semibold mb-3">${L(`${sym} price chart`, `Grafik harga ${sym}`)}</h3><${Chart}/></div><div className="mt-12"><${Trades} mint=${st.mint}/></div><//>`}
<//>`
}
