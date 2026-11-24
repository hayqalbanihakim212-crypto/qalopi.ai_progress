import { Fragment } from 'react'
import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { Sec, Row, NA, Badge } from '../components/ui.js'
import { CFG, ok } from '../config/site.js'
import { TECH } from '../data/technology.js'
import { ROAD } from '../data/roadmap.js'
import { ROLES, PARTN } from '../data/join.js'
import DevStatus from './DevStatus.js'
import coin from '../assets/coin.jpg'

export default function Hero() {
  const L = useL()
  return html`<${Fragment}><section className="max-w-6xl mx-auto px-5 pt-14 md:pt-24 pb-16 grid md:grid-cols-[1.4fr_1fr] gap-12 items-center">
<div>
<p className="gold font-semibold">${L('Independent research & development','Riset & pengembangan independen')}</p>
<h1 className="serif text-5xl md:text-7xl font-semibold leading-[1.02] mt-4">${L('Building the infrastructure of verifiable intelligence.','Membangun infrastruktur kecerdasan yang dapat diverifikasi.')}</h1>
<p className="mut mt-6 max-w-xl">${L('QALOPI.AI combines AI, a Layer-1 blockchain, distributed computing and defensive cybersecurity. This hub shows what is built, what is tested and what is still only a plan, each marked with its evidence.','QALOPI.AI memadukan AI, blockchain Layer-1, komputasi terdistribusi, dan keamanan siber defensif. Hub ini menunjukkan apa yang sudah dibangun, diuji, dan yang masih rencana, masing-masing dengan status buktinya.')}</p>
<div className="flex flex-wrap gap-3 mt-8"><a href="#development" className="btn">${L('Track development','Pantau pengembangan')}</a><a href="#technology" className="btn">${L('Explore technology','Jelajahi teknologi')}</a><a href="#support" className="btn">${L('Support the project','Dukung proyek')}</a></div></div>
<div className="flex justify-center"><div className="ring rounded-full p-[3px] w-64 h-64 md:w-80 md:h-80"><img src=${coin} alt="QAL coin mark" className="rounded-full w-full h-full object-cover" style=${{border:'6px solid var(--bg)'}}/></div></div></section>

<div className="border-y ln" style=${{background:'var(--bg2)'}}><dl className="max-w-6xl mx-auto px-5 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
${[[L('Engineering phase','Fase engineering'),'V2.6'],[L('Full release','Rilis penuh'),'Blocked'],[L('AI component','Komponen AI'),'ANANKE'],[L('Community token $QAL','Token komunitas $QAL'),L('Not launched','Belum diluncurkan')]].map(([k,v])=>html`<div key=${k}><dt className="mut text-sm">${k}</dt><dd className="serif text-2xl font-semibold gold">${v}</dd></div>`)}</dl></div>

<//>`
}
