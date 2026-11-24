import { createContext, useContext } from 'react'
import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'

const SC={PASS_SCOPED:'--blue',PASS_SCOPED_LIVE:'--blue',PASS_SCOPED_SOURCE_BOUND:'--blue',PASS_HISTORIS:'--blue',IN_PROGRESS:'--warn',OPEN:'--warn',BLOCKED:'--bad',DEFERRED:'--mut',PLANNED:'--mut',UNVERIFIED:'--warn',NOT_RUN:'--mut'};
export const Badge=({s})=>html`<span className="inline-block text-xs font-semibold px-2 py-0.5 whitespace-nowrap" style=${{color:`var(${SC[s]||'--mut'})`,border:`1px solid var(${SC[s]||'--mut'})`}}>${s}</span>`;
export const SectionAnchorContext = createContext(false)
export const Sec=({id,title,lead,children})=>{
  const hasExternalAnchor=useContext(SectionAnchorContext)
  return html`<section id=${hasExternalAnchor?undefined:id} className="max-w-6xl mx-auto px-5 py-16 md:py-24 border-t ln">
<h2 className="serif text-4xl md:text-5xl font-semibold max-w-3xl leading-tight">${title}</h2>
${lead&&html`<p className="mut mt-4 max-w-2xl">${lead}</p>`}
<div className="mt-10">${children}</div></section>`
}
export const NA=()=>{const L=useL();return html`<span className="mut">${L('Not available','Belum tersedia')}</span>`};
export const Row=({k,children})=>html`<div className="flex justify-between gap-4 py-3 border-b ln"><span className="mut">${k}</span><span className="text-right font-medium">${children}</span></div>`;
