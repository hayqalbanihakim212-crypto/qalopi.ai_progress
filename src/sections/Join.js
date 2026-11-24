import { Fragment } from 'react'
import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { Sec, Row, NA, Badge } from '../components/ui.js'
import { CFG, ok } from '../config/site.js'
import { TECH } from '../data/technology.js'
import { ROAD } from '../data/roadmap.js'
import { ROLES, PARTN } from '../data/join.js'
import DevStatus from './DevStatus.js'

export default function Join() {
  const L = useL()
  return html`<${Fragment}><${Sec} id="join" title=${L('Experts and partners wanted.','Mencari tenaga ahli dan mitra.')} lead=${L('Roles are volunteer, research collaboration or open-source contribution unless stated otherwise. No salary, equity or token is promised without a signed agreement. Investor inquiries are handled separately from any $QAL purchase.','Peran bersifat sukarela, kolaborasi riset, atau kontribusi open-source kecuali dinyatakan lain. Tidak ada gaji, saham, atau token yang dijanjikan tanpa perjanjian tertulis. Pertanyaan investor ditangani terpisah dari pembelian $QAL apa pun.')}>
<div className="grid md:grid-cols-2 gap-10"><div><h3 className="serif text-2xl font-semibold mb-3">${L('Open roles','Peran terbuka')}</h3><div className="flex flex-wrap gap-2">${ROLES.map(r=>html`<span key=${r} className="text-sm border ln px-3 py-1">${r}</span>`)}</div></div>
<div><h3 className="serif text-2xl font-semibold mb-3">${L('Partnership types','Jenis kemitraan')}</h3><ul className="mut space-y-1">${PARTN.map(p=>html`<li key=${p[0]}>${L(p[0],p[1])}</li>`)}</ul></div></div><//>

<//>`
}
