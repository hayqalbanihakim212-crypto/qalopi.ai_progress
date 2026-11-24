import { useState } from 'react'
import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { Badge } from '../components/ui.js'
import { MODS, FILT } from '../data/modules.js'

export default function DevStatus(){const L=useL();const[f,setF]=useState('all');const rows=MODS.filter(m=>f==='all'||m[4]===f);
return html`<div>
<div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filter">${FILT.map(([k,n])=>html`<button key=${k} onClick=${()=>setF(k)} aria-pressed=${f===k} className="px-3 py-1 text-sm border" style=${{borderColor:f===k?'var(--gold)':'var(--line)',color:f===k?'var(--gold)':'var(--mut)'}}>${L(n[0],n[1])}</button>`)}</div>
<div className="tbl"><table className="w-full text-left text-sm min-w-[640px]"><thead className="mut"><tr className="border-b ln"><th className="py-2 pr-4 font-medium">${L('Version','Versi')}</th><th className="pr-4 font-medium">${L('Module','Modul')}</th><th className="pr-4 font-medium">${L('Status','Status')}</th><th className="font-medium">${L('Evidence note','Catatan bukti')}</th></tr></thead>
<tbody>${rows.length?rows.map((m,i)=>html`<tr key=${m[0]+i+m[2]} className="border-b ln align-top"><td className="py-3 pr-4 font-semibold">${m[0]}</td><td className="pr-4">${L(m[1][0],m[1][1])}</td><td className="pr-4"><${Badge} s=${m[2]}/></td><td className="mut">${L(m[3][0],m[3][1])}</td></tr>`):html`<tr><td colSpan="4" className="py-6 mut">${L('No items in this filter.','Tidak ada butir pada filter ini.')}</td></tr>`}</tbody></table></div>
<p className="mut text-sm mt-5 max-w-3xl">${L('A scoped pass means a defined test passed within a defined scope. It does not mean production-ready. Entries reflect the historical project baseline as of 24 November 2026, not a fresh audit of the repository.','Lulus terbatas berarti pengujian tertentu lulus dalam cakupan tertentu, bukan siap produksi. Isi tabel adalah baseline historis proyek per 24 November 2026, bukan audit baru terhadap repository.')}</p></div>`}

