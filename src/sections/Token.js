import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { Sec, Row, NA } from '../components/ui.js'
import Chart from '../components/Chart.js'
import { ok } from '../config/site.js'
import { useApi } from '../lib/useApi.js'
import { usd, when } from '../lib/format.js'

export default function Token() {
  const L = useL()
  const { data: s } = useApi('/settings')
  const st = s || {}
  const live = st.launchStatus === 'LAUNCHED' && !!st.mint && ok(st.pumpfunUrl)
  const { data: m, error: me } = useApi(live ? '/market' : null)
  const mk = m && m.available ? m : null
  const rows = [
    [L('Price', 'Harga'), mk && usd(mk.price)],
    [L('24h change', 'Perubahan 24 jam'), mk && mk.priceChange24h != null ? mk.priceChange24h + '%' : null],
    [L('Market cap', 'Kapitalisasi pasar'), mk && usd(mk.marketCapUsd)],
    ['FDV', mk && usd(mk.fdvUsd)],
    [L('Liquidity', 'Likuiditas'), mk && usd(mk.liquidityUsd)],
    [L('24h volume', 'Volume 24 jam'), mk && usd(mk.volume24hUsd)],
    [L('Holders', 'Pemegang'), null],
    [L('Creator rewards', 'Creator rewards'), null],
  ]
  return html`<${Sec} id="token" title=${L('$QAL, a community token on Solana.', '$QAL, token komunitas di Solana.')} lead=${L('Planned for launch on Pump.fun. It is not the native coin of the QALOPI Layer-1, and no migration, conversion or airdrop is promised.', 'Direncanakan meluncur di Pump.fun. Ini bukan koin native Layer-1 QALOPI, dan tidak ada janji migrasi, konversi, atau airdrop.')}>
<div className="grid md:grid-cols-2 gap-10"><div>
<${Row} k=${L('Launch status', 'Status peluncuran')}>${live ? 'LAUNCHED' : 'NOT_LAUNCHED'}<//>
<${Row} k=${L('Official mint address', 'Alamat mint resmi')}>${live ? html`<span className="break-all text-sm">${st.mint}</span>` : html`<${NA}/>`}<//>
${rows.map(([k, v]) => html`<${Row} key=${k} k=${k}>${v || html`<${NA}/>`}<//>`)}
${me && html`<p className="text-sm mt-3" style=${{ color: 'var(--bad)' }}>${L('Market data is temporarily unavailable.', 'Data pasar sedang tidak tersedia.')}</p>`}
${mk && html`<p className="mut text-xs mt-2">${L('Source', 'Sumber')}: ${mk.provider} · ${L('last synced', 'sinkron terakhir')} ${when(mk.lastSynced)}</p>`}
<div className="mt-6">${live ? html`<a className="btn" href=${st.pumpfunUrl} rel="noopener noreferrer" target="_blank">${L('Open on Pump.fun', 'Buka di Pump.fun')}</a>` : html`<button className="btn" disabled>${L('Buy $QAL (unavailable until the mint is verified)', 'Beli $QAL (tidak tersedia sampai mint terverifikasi)')}</button>`}</div>
${live && mk && html`<${Chart}/>`}
${!live && html`<p className="mut text-sm mt-3">${L('Charts appear only when real market data from a documented provider is connected.', 'Grafik hanya muncul setelah data pasar nyata dari penyedia terdokumentasi terhubung.')}</p>`}</div>
<div><h3 className="serif text-2xl font-semibold">${L('Buying $QAL does not give you', 'Membeli $QAL tidak memberi Anda')}</h3>
<ul className="mt-3 mut list-disc pl-5 space-y-1">${[['shares in QALOPI.AI', 'saham QALOPI.AI'], ['ownership of intellectual property', 'kepemilikan kekayaan intelektual'], ['a right to company revenue', 'hak atas pendapatan perusahaan'], ['fixed returns or any guarantee of profit', 'imbal hasil tetap atau jaminan keuntungan'], ['rights to a future native coin', 'hak atas koin native di masa depan']].map(x => html`<li key=${x[0]}>${L(x[0], x[1])}</li>`)}</ul>
<p className="mut text-sm mt-5">${L('Token prices can fall to zero. We will never ask for your seed phrase or private key, and we never trade on your behalf. Verify the mint address here before any purchase.', 'Harga token bisa jatuh ke nol. Kami tidak akan pernah meminta seed phrase atau private key, dan tidak pernah bertransaksi atas nama Anda. Verifikasi alamat mint di sini sebelum membeli.')}</p></div></div><//>`
}
