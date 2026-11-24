import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import logo from '../assets/logo.png'

export default function Header({ lang, setLang, theme, setTheme, nav }) {
  const L = useL()
  return html`<header className="sticky z-50 border-b ln" style=${{top:'env(safe-area-inset-top,0px)',background:'var(--bg)'}}>
<div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-4">
<a href="#top" className="flex items-center gap-3" aria-label="QALOPI.AI"><span className="bg-white p-1 flex"><img src=${logo} alt="QALOPI.AI" height="36" style=${{height:36,width:'auto'}}/></span><span className="serif text-xl font-semibold hidden sm:inline">QALOPI.AI</span></a>
<nav className="hidden lg:flex gap-5 ml-auto text-sm mut" aria-label="Main">${nav.map(n=>html`<a key=${n[0]} href=${'#'+n[0]} className="hover:text-[var(--gold)]">${n[1]}</a>`)}</nav>
<div className="flex gap-2 ml-auto lg:ml-4 text-sm">
<button onClick=${()=>setLang(lang==='en'?'id':'en')} className="px-2 py-1 border ln" aria-label="Language">${lang==='en'?'ID':'EN'}</button>
<button onClick=${()=>setTheme(theme==='dark'?'light':'dark')} className="px-2 py-1 border ln" aria-label="Theme">${theme==='dark'?L('Light','Terang'):L('Dark','Gelap')}</button></div></div>
<nav className="lg:hidden flex gap-5 overflow-x-auto px-5 pb-2 text-sm mut whitespace-nowrap" aria-label="Sections">${nav.map(n=>html`<a key=${n[0]} href=${'#'+n[0]}>${n[1]}</a>`)}</nav></header>`
}
