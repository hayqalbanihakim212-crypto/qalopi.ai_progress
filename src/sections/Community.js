import { Fragment } from 'react'
import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { Sec, Row, NA, Badge } from '../components/ui.js'
import { CFG, ok } from '../config/site.js'
import { TECH } from '../data/technology.js'
import { ROAD } from '../data/roadmap.js'
import { ROLES, PARTN } from '../data/join.js'
import DevStatus from './DevStatus.js'
const soc = L => [['GitHub', CFG.github], ['Telegram', CFG.telegram], ['Instagram QALOPI.AI', CFG.instagram], [L('Instagram developer', 'Instagram pengembang'), CFG.igDev], ['Email', CFG.email], ['X', CFG.x], ['LinkedIn', CFG.linkedin], ['Discord', CFG.discord], ['YouTube', CFG.youtube], [L('Main QALOPI.AI site', 'Situs utama QALOPI.AI'), CFG.mainSite]]

export default function Community() {
  const L = useL()
  return html`<${Fragment}><${Sec} id="community" title=${L('Community and official channels.','Komunitas dan kanal resmi.')} lead=${L('Only channels the developer has confirmed are linked. The rest stay marked as coming soon.','Hanya kanal yang dikonfirmasi pengembang yang ditautkan. Sisanya ditandai segera hadir.')}>
<div className="grid sm:grid-cols-2 md:grid-cols-5 gap-px border ln" style=${{background:'var(--line)'}}>${soc(L).map(([n,u])=>html`<div key=${n} className="p-5" style=${{background:'var(--bg)'}}><div className="font-semibold">${n}</div>${ok(u)?html`<a className="gold text-sm underline break-all" href=${u} rel="noopener noreferrer" target="_blank">${u.startsWith('mailto:')?u.slice(7):L('Open','Buka')}</a>`:html`<div className="mut text-sm">${L('Coming soon','Segera hadir')}</div>`}</div>`)}</div><//>

<//>`
}
