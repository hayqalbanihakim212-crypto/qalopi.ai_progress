import { Fragment } from 'react'
import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { Sec, Row, NA, Badge } from '../components/ui.js'
import { CFG, ok } from '../config/site.js'
import { TECH } from '../data/technology.js'
import { ROAD } from '../data/roadmap.js'
import { ROLES, PARTN } from '../data/join.js'
import DevStatus from './DevStatus.js'

export default function Development() {
  const L = useL()
  return html`<${Fragment}><${Sec} id="development" title=${L('Development status, by evidence.','Status pengembangan, berdasarkan bukti.')}><${DevStatus}/><//>

<//>`
}
