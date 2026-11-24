import { lazy, Suspense, useEffect, useState } from 'react'
import { html } from './lib/html.js'
import { LC } from './i18n/LangContext.js'
import { navItems } from './data/nav.js'
import Header from './components/Header.js'
import Footer from './components/Footer.js'
import Hero from './sections/Hero.js'
import DeferredSection from './components/DeferredSection.js'

const About = lazy(() => import('./sections/About.js'))
const Technology = lazy(() => import('./sections/Technology.js'))
const Development = lazy(() => import('./sections/Development.js'))
const GithubLive = lazy(() => import('./sections/GithubLive.js'))
const Roadmap = lazy(() => import('./sections/Roadmap.js'))
const Token = lazy(() => import('./sections/Token.js'))
const Support = lazy(() => import('./sections/Support.js'))
const Join = lazy(() => import('./sections/Join.js'))
const Community = lazy(() => import('./sections/Community.js'))
const Contact = lazy(() => import('./sections/Contact.js'))
const Admin = lazy(() => import('./pages/Admin.js'))

export default function App() {
  const [lang, setLang] = useState(() => (/^id/i.test(navigator.language || '') ? 'id' : 'en'))
  const [theme, setTheme] = useState(() => (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'))
  useEffect(() => { document.documentElement.dataset.theme = theme; document.documentElement.lang = lang }, [theme, lang])
  const L = (a, b) => (lang === 'en' ? a : b)
  if (location.pathname.startsWith('/admin')) return html`<${LC.Provider} value=${lang}><${Suspense} fallback=${html`<p className="p-8 mut">Loading admin…</p>`}><${Admin}/><//><//>`
  return html`<${LC.Provider} value=${lang}>
    <${Header} lang=${lang} setLang=${setLang} theme=${theme} setTheme=${setTheme} nav=${navItems(L)}/>
    <main id="top"><${Hero}/>
      <${DeferredSection} id="about" Component=${About}/>
      <${DeferredSection} id="technology" Component=${Technology}/>
      <${DeferredSection} id="development" Component=${Development}/>
      <${DeferredSection} id="github" Component=${GithubLive}/>
      <${DeferredSection} id="roadmap" Component=${Roadmap}/>
      <${DeferredSection} id="token" Component=${Token}/>
      <${DeferredSection} id="support" Component=${Support}/>
      <${DeferredSection} id="join" Component=${Join}/>
      <${DeferredSection} id="community" Component=${Community}/>
      <${DeferredSection} id="feedback" Component=${Contact}/>
    </main>
    <${Footer}/>
  <//>`
}
