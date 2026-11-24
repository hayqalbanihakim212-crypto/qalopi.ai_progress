import { Fragment } from 'react'
import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { Sec, Row, NA, Badge } from '../components/ui.js'
import { CFG, ok } from '../config/site.js'
import { TECH } from '../data/technology.js'
import { ROAD } from '../data/roadmap.js'
import { ROLES, PARTN } from '../data/join.js'
import DevStatus from './DevStatus.js'

export default function Support() {
  const L = useL()
  return html`<${Fragment}><${Sec} id="support" title=${L('Support development, separate from the token.','Dukung pengembangan, terpisah dari token.')} lead=${L('Top need: GPU for QLoRA, model evaluation, learning infrastructure, storage and independent security testing. Accepted: donations, GPU or hardware donations, cloud credits, grants, infrastructure sponsorship and technical help.','Kebutuhan utama: GPU untuk QLoRA, evaluasi model, infrastruktur pembelajaran, penyimpanan, dan pengujian keamanan independen. Diterima: donasi, donasi GPU atau perangkat keras, kredit cloud, hibah, sponsor infrastruktur, dan bantuan teknis.')}>
<div className="grid md:grid-cols-2 gap-10"><div><h3 className="serif text-2xl font-semibold mb-2">${L('Funding transparency','Transparansi pendanaan')}</h3>
${[L('Funding target','Target dana'),L('Verified funds received','Dana terverifikasi diterima'),L('Creator rewards received','Creator rewards diterima'),L('Expenses','Pengeluaran'),L('Hardware purchased','Perangkat keras dibeli')].map(k=>html`<${Row} key=${k} k=${k}>${L('Awaiting evidence','Menunggu bukti')}<//>`)}
<p className="mut text-sm mt-3">${L('Funds count as received only with a valid transaction or receipt. Token market value is never counted as funds.','Dana dihitung diterima hanya dengan transaksi atau bukti sah. Nilai pasar token tidak dihitung sebagai dana.')}</p></div>
<div><h3 className="serif text-2xl font-semibold mb-2">${L('Donation addresses','Alamat donasi')}</h3>
<${Row} k="SOL">${CFG.donateSol?html`<span className="break-all text-sm">${CFG.donateSol}</span>`:L('Not configured','Belum dikonfigurasi')}<//>
<${Row} k="USDC">${CFG.donateUsdc?html`<span className="break-all text-sm">${CFG.donateUsdc}</span>`:L('Not configured','Belum dikonfigurasi')}<//>
<p className="mut text-sm mt-3">${L('Only send to an address published here after it is configured.','Kirim hanya ke alamat yang dipublikasikan di sini setelah dikonfigurasi.')}</p></div></div><//>

<//>`
}
