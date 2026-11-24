import { Fragment } from 'react'
import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { Sec, Row, NA, Badge } from '../components/ui.js'
import { CFG, ok } from '../config/site.js'
import { TECH } from '../data/technology.js'
import { ROAD } from '../data/roadmap.js'
import { ROLES, PARTN } from '../data/join.js'
import DevStatus from './DevStatus.js'

export default function About() {
  const L = useL()
  return html`<${Fragment}><${Sec} id="about" title=${L('An independent project, openly scoped.','Proyek independen dengan cakupan terbuka.')} lead=${L('Founder: Muhammad Hayqal Bani Hakim Tanjung, independent developer in Medan, Indonesia. No team members, investors, advisors or partners are listed until they have confirmed publication. The project is open to individuals, universities, companies and research bodies.','Pendiri: Muhammad Hayqal Bani Hakim Tanjung, pengembang independen di Medan, Indonesia. Anggota tim, investor, penasihat, atau mitra baru dicantumkan setelah mereka menyetujui publikasi. Proyek terbuka bagi individu, universitas, perusahaan, dan lembaga riset.')}>
<div className="grid md:grid-cols-2 gap-8 text-sm"><p className="mut">${L('Needs right now: GPU and compute, research partners, funding, engineering contributors and independent technical verification.','Kebutuhan saat ini: GPU dan komputasi, mitra riset, pendanaan, kontributor engineering, dan verifikasi teknis independen.')}</p><p className="mut">${L('Principle: evidence over claims, real integration over simulation, transparency over hype.','Prinsip: bukti di atas klaim, integrasi nyata di atas simulasi, transparansi di atas hype.')}</p></div><//>

<//>`
}
