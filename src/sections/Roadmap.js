import { Fragment } from 'react'
import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { Sec, Row, NA, Badge } from '../components/ui.js'
import { CFG, ok } from '../config/site.js'
import { TECH } from '../data/technology.js'
import { ROAD } from '../data/roadmap.js'
import { ROLES, PARTN } from '../data/join.js'
import DevStatus from './DevStatus.js'

export default function Roadmap() {
  const L = useL()
  return html`<${Fragment}><${Sec} id="roadmap" title="Roadmap" lead=${L('Targets, not guarantees. Each step depends on its acceptance gates.','Target, bukan jaminan. Setiap tahap bergantung pada gerbang akseptasinya.')}>
<ol className="border-l ln ml-2">${ROAD.map(r=>html`<li key=${r[0]} className="pl-6 pb-7 relative"><span className="absolute -left-[5px] top-2 w-[9px] h-[9px] rounded-full" style=${{background:'var(--gold)'}}></span><div className="flex flex-wrap items-center gap-3"><span className="serif text-2xl font-semibold">${r[0]}</span><${Badge} s=${r[2]}/></div><p className="mut">${L(r[1][0],r[1][1])}</p></li>`)}
<li className="pl-6 relative"><span className="absolute -left-[5px] top-2 w-[9px] h-[9px] rounded-full" style=${{background:'var(--mut)'}}></span><span className="serif text-2xl font-semibold">Mainnet</span> <${Badge} s="PLANNED"/><p className="mut">${L('Not scheduled.','Belum dijadwalkan.')}</p></li></ol><//>

<//>`
}
