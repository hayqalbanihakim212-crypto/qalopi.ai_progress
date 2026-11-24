import { useEffect, useState } from 'react'
import { html } from './lib/html.js'
import { LC } from './i18n/LangContext.js'
import { navItems } from './data/nav.js'
import Header from './components/Header.js'
import Footer from './components/Footer.js'
import Hero from './sections/Hero.js'
import About from './sections/About.js'
import Technology from './sections/Technology.js'
import Development from './sections/Development.js'
import GithubLive from './sections/GithubLive.js'
import Roadmap from './sections/Roadmap.js'
import Token from './sections/Token.js'
import Support from './sections/Support.js'
import Join from './sections/Join.js'
import Community from './sections/Community.js'
import Contact from './sections/Contact.js'
import Admin from './pages/Admin.js'

export default function App() {
  const [lang, setLang] = useState(() => (/^id/i.test(navigator.language || '') ? 'id' : 'en'))
  const [theme, setTheme] = useState(() => (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'))
  useEffect(() => { document.documentElement.dataset.theme = theme; document.documentElement.lang = lang }, [theme, lang])
  const L = (a, b) => (lang === 'en' ? a : b)
  if (location.pathname.startsWith('/admin')) return html`<${LC.Provider} value=${lang}><${Admin}/><//>`
  return html`<${LC.Provider} value=${lang}>
    <${Header} lang=${lang} setLang=${setLang} theme=${theme} setTheme=${setTheme} nav=${navItems(L)}/>
    <main id="top"><${Hero}/><${About}/><${Technology}/><${Development}/><${GithubLive}/><${Roadmap}/><${Token}/><${Support}/><${Join}/><${Community}/><${Contact}/></main>
    <${Footer}/>
  <//>`
}
