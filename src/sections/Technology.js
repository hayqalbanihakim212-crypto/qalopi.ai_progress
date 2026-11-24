import { Fragment } from 'react'
import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { Sec, Row, NA, Badge } from '../components/ui.js'
import { CFG, ok } from '../config/site.js'
import { TECH } from '../data/technology.js'
import { ROAD } from '../data/roadmap.js'
import { ROLES, PARTN } from '../data/join.js'
import DevStatus from './DevStatus.js'

export default function Technology() {
  const L = useL()
  return html`<${Fragment}><${Sec} id="technology" title=${L('What the system is meant to become, and where each part stands.','Arah sistem ini, dan posisi tiap bagiannya.')}>
<div>${TECH.map(t=>html`<div key=${t[0]} className="grid md:grid-cols-[1fr_2fr_1.3fr] gap-3 md:gap-8 py-6 border-b ln"><h3 className="serif text-2xl font-semibold">${t[0]}</h3><p className="mut">${L(t[1][0],t[1][1])}</p><p className="text-sm gold">${L(t[2][0],t[2][1])}</p></div>`)}</div><//>

<//>`
}
