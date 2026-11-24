import { Fragment, useEffect, useState } from 'react'
import { html } from '../lib/html.js'
import { api } from '../lib/api.js'
import { useL } from '../i18n/LangContext.js'
import { Sec, Badge } from '../components/ui.js'
import { ROAD } from '../data/roadmap.js'

export default function Roadmap() {
  const L = useL()
  const [items, setItems] = useState([
    ...ROAD.map(([title, [descriptionEn, descriptionId], status], i) => ({ id: `static-${i}`, title, descriptionEn, descriptionId, status })),
    { id: 'static-mainnet', title: 'Mainnet', descriptionEn: 'Not scheduled.', descriptionId: 'Belum dijadwalkan.', status: 'PLANNED' },
  ])
  const [error, setError] = useState('')
  useEffect(() => { api('/content').then(data => setItems(data.roadmap)).catch(() => setError(L('Live roadmap could not be loaded; showing the published baseline.','Roadmap terkini tidak dapat dimuat; menampilkan data publik sebelumnya.'))) }, [])
  return html`<${Fragment}><${Sec} id="roadmap" title="Roadmap" lead=${L('Targets, not guarantees. Each step depends on its acceptance gates.','Target, bukan jaminan. Setiap tahap bergantung pada gerbang akseptasinya.')}>
${error && html`<p role="status" className="mut text-sm mb-3">${error}</p>`}
<ol className="border-l ln ml-2">${items.map(r=>html`<li key=${r.id} className="pl-6 pb-7 relative"><span className="absolute -left-[5px] top-2 w-[9px] h-[9px] rounded-full" style=${{background:'var(--gold)'}}></span><div className="flex flex-wrap items-center gap-3"><span className="serif text-2xl font-semibold">${r.title}</span><${Badge} s=${r.status}/></div><p className="mut">${L(r.descriptionEn,r.descriptionId)}</p></li>`)}
 </ol><//>

<//>`
}
