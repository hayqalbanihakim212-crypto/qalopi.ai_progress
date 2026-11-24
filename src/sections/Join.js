import { Fragment, useEffect, useState } from 'react'
import { html } from '../lib/html.js'
import { api } from '../lib/api.js'
import { useL } from '../i18n/LangContext.js'
import { Sec } from '../components/ui.js'
import { ROLES, PARTN } from '../data/join.js'

export default function Join() {
  const L = useL()
  const [content, setContent] = useState({
    roles: ROLES.map((title, i) => ({ id: `role-${i}`, title })),
    partners: PARTN.map(([nameEn, nameId], i) => ({ id: `partner-${i}`, nameEn, nameId })),
    documentation: [],
  })
  const [error, setError] = useState('')
  useEffect(() => { api('/content').then(data => setContent(data)).catch(() => setError(L('Published links and contributions could not be refreshed.','Tautan dan kontribusi publik tidak dapat diperbarui.'))) }, [])
  return html`<${Fragment}><${Sec} id="join" title=${L('Experts and partners wanted.','Mencari tenaga ahli dan mitra.')} lead=${L('Roles are volunteer, research collaboration or open-source contribution unless stated otherwise. No salary, equity or token is promised without a signed agreement. Investor inquiries are handled separately from any $QAL purchase.','Peran bersifat sukarela, kolaborasi riset, atau kontribusi open-source kecuali dinyatakan lain. Tidak ada gaji, saham, atau token yang dijanjikan tanpa perjanjian tertulis. Pertanyaan investor ditangani terpisah dari pembelian $QAL apa pun.')}>
${error && html`<p role="status" className="mut text-sm mb-3">${error}</p>`}
<div className="grid md:grid-cols-2 gap-10"><div><h3 className="serif text-2xl font-semibold mb-3">${L('Open roles','Peran terbuka')}</h3><div className="flex flex-wrap gap-2">${content.roles.map(r=>html`<span key=${r.id} className="text-sm border ln px-3 py-1">${r.title}</span>`)}</div></div>
<div><h3 className="serif text-2xl font-semibold mb-3">${L('Partnership types','Jenis kemitraan')}</h3><ul className="mut space-y-1">${content.partners.map(p=>html`<li key=${p.id}>${L(p.nameEn,p.nameId)}</li>`)}</ul></div></div>
${content.contributors?.length > 0 && html`<div className="mt-10"><h3 className="serif text-2xl font-semibold mb-3">${L('Contributors','Kontributor')}</h3><ul className="mut space-y-2">${content.contributors.map(person=>html`<li key=${person.id}>${person.profileUrl ? html`<a className="underline" href=${person.profileUrl} target="_blank" rel="noopener noreferrer">${person.displayName}</a>` : person.displayName} · ${person.contribution}</li>`)}</ul></div>`}
${content.documentation?.length > 0 && html`<div className="mt-10"><h3 className="serif text-2xl font-semibold mb-3">${L('Documentation','Dokumentasi')}</h3><ul className="mut space-y-2">${content.documentation.map(doc=>html`<li key=${doc.id}><a className="underline" href=${doc.url} target="_blank" rel="noopener noreferrer">${doc.title}</a>${doc.description && html`<span> · ${doc.description}</span>`}</li>`)}</ul></div>`}<//>

<//>`
}
