import { Fragment, useEffect, useState } from 'react'
import { html } from '../lib/html.js'
import { api } from '../lib/api.js'
import { useL } from '../i18n/LangContext.js'
import { Sec, Row, NA, Badge } from '../components/ui.js'
import Donate from '../components/Donate.js'

export default function Support() {
  const L = useL()
  const [funding, setFunding] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api('/funding').then(setFunding).catch(() => setError(L('Funding records could not be loaded.','Catatan pendanaan tidak dapat dimuat.'))) }, [])
  const currencies = funding ? [...new Set(funding.entries.map(entry => entry.currency))] : []
  const format = (amount, currency) => `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(amount)} ${currency}`
  return html`<${Fragment}><${Sec} id="support" title=${L('Support development, separate from the token.','Dukung pengembangan, terpisah dari token.')} lead=${L('Top need: GPU for QLoRA, model evaluation, learning infrastructure, storage and independent security testing. Accepted: donations, GPU or hardware donations, cloud credits, grants, infrastructure sponsorship and technical help.','Kebutuhan utama: GPU untuk QLoRA, evaluasi model, infrastruktur pembelajaran, penyimpanan, dan pengujian keamanan independen. Diterima: donasi, donasi GPU atau perangkat keras, kredit cloud, hibah, sponsor infrastruktur, dan bantuan teknis.')}>
<div className="grid md:grid-cols-2 gap-10"><div><h3 className="serif text-2xl font-semibold mb-2">${L('Funding transparency','Transparansi pendanaan')}</h3>
${error && html`<p role="status" className="mut text-sm">${error}</p>`}
${funding?.target && html`<${Row} k=${L('Funding target','Target dana')}>${format(funding.target.amount, funding.target.currency)}<//>`}
${currencies.map(currency=>{const entries=funding.entries.filter(entry=>entry.currency===currency);const received=entries.filter(entry=>entry.direction==='received').reduce((sum,entry)=>sum+entry.amount,0);const spent=entries.filter(entry=>entry.direction==='spent').reduce((sum,entry)=>sum+entry.amount,0);return html`<div key=${currency}><${Row} k=${L('Verified funds received','Dana terverifikasi diterima')}>${format(received,currency)}<//><${Row} k=${L('Documented expenses','Pengeluaran terdokumentasi')}>${format(spent,currency)}<//><${Row} k=${L('Recorded balance','Saldo tercatat')}>${format(received-spent,currency)}<//></div>`})}
${funding && funding.entries.length > 0 && html`<div className="mt-5"><h4 className="font-semibold mb-2">${L('Public ledger','Buku besar publik')}</h4>${funding.entries.map(entry=>html`<article key=${entry.id} className="border-b ln py-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><strong>${entry.date} · ${entry.direction === 'received' ? L('Received','Diterima') : L('Spent','Dibelanjakan')}</strong><strong>${format(entry.amount,entry.currency)}</strong></div><p className="mut">${entry.description} · ${entry.source}</p><a className="underline" href=${entry.evidenceUrl} target="_blank" rel="noopener noreferrer">${L('View transaction or receipt evidence','Lihat bukti transaksi atau tanda terima')}</a></article>`)}</div>`}
<p className="mut text-sm mt-3">${L('Only documented entries are included. Token market value is never counted as funding. Totals are not combined across currencies.','Hanya catatan dengan bukti yang disertakan. Nilai pasar token tidak dihitung sebagai pendanaan. Total mata uang tidak digabung.')}</p></div>
<${Donate}/></div><//>

<//>`
}
