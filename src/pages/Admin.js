import { useEffect, useState } from 'react'
import { html } from '../lib/html.js'
import { api } from '../lib/api.js'
import { when } from '../lib/format.js'

const STATUSES = ['new', 'reviewing', 'resolved', 'spam']
export default function Admin() {
  const [auth, setAuth] = useState(null)
  const [tab, setTab] = useState('submissions')
  const [err, setErr] = useState('')
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('')
  const [set, setSet] = useState(null)
  const [log, setLog] = useState([])
  const [msg, setMsg] = useState('')
  const load = async () => {
    try {
      setItems((await api('/admin/submissions' + (filter ? '?status=' + filter : ''))).items)
      setSet(await api('/admin/settings')); setLog((await api('/admin/audit')).items)
    } catch (e) { if (e.status === 401) setAuth(false) }
  }
  useEffect(() => { api('/admin/me').then(() => setAuth(true)).catch(() => setAuth(false)) }, [])
  useEffect(() => { if (auth) load() }, [auth, filter])
  const login = async e => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); setErr('')
    try { await api('/admin/login', { method: 'POST', body: f }); setAuth(true) } catch (x) { setErr(x.message) }
  }
  const setStatus = async (id, status) => { await api('/admin/submissions/' + id, { method: 'PATCH', body: { status } }); load() }
  const save = async e => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); setMsg('')
    try { setSet(await api('/admin/settings', { method: 'PUT', body: f })); setMsg('Saved.'); load() } catch (x) { setMsg(x.message) }
  }
  if (auth === null) return html`<p className="p-8 mut">Loading…</p>`
  if (!auth) return html`<main className="max-w-sm mx-auto p-8"><h1 className="serif text-4xl font-semibold mb-6">Admin</h1>
<form onSubmit=${login} className="space-y-3"><input name="email" type="email" placeholder="Email" className="fld" required autoComplete="username"/><input name="password" type="password" placeholder="Password" className="fld" required autoComplete="current-password"/>
<button className="btn" type="submit">Sign in</button><p role="alert" className="text-sm" style=${{ color: 'var(--bad)' }}>${err}</p></form></main>`
  return html`<main className="max-w-6xl mx-auto p-6">
<div className="flex items-center justify-between"><h1 className="serif text-4xl font-semibold">Admin</h1><div className="flex gap-3 text-sm"><a href="/" className="underline">Site</a><button className="underline" onClick=${async () => { await api('/admin/logout', { method: 'POST' }); setAuth(false) }}>Sign out</button></div></div>
<div className="flex gap-2 my-6">${['submissions', 'token', 'audit'].map(t => html`<button key=${t} onClick=${() => setTab(t)} className="px-3 py-1 border" style=${{ borderColor: tab === t ? 'var(--gold)' : 'var(--line)', color: tab === t ? 'var(--gold)' : 'var(--mut)' }}>${t}</button>`)}</div>
${tab === 'submissions' && html`<div><select className="fld max-w-xs mb-4" value=${filter} onChange=${e => setFilter(e.target.value)} aria-label="Status filter"><option value="">All statuses</option>${STATUSES.map(s => html`<option key=${s}>${s}</option>`)}</select>
${!items.length ? html`<p className="mut">No submissions yet.</p>` : items.map(s => html`<article key=${s.id} className="border ln p-4 mb-3"><div className="flex flex-wrap justify-between gap-2 text-sm"><span><strong>${s.ref}</strong> · ${s.type} · <span className="mut">${when(s.createdAt)}</span></span>
<select value=${s.status} onChange=${e => setStatus(s.id, e.target.value)} className="fld w-auto" aria-label="Set status">${STATUSES.map(x => html`<option key=${x}>${x}</option>`)}</select></div>
<h3 className="font-semibold mt-2">${s.subject}</h3><p className="mut whitespace-pre-wrap text-sm mt-1">${s.message}</p><p className="text-xs mt-2 mut">${s.name || 'anonymous'} ${s.email ? '· ' + s.email : ''}</p></article>`)}</div>`}
${tab === 'token' && set && html`<form onSubmit=${save} className="max-w-xl space-y-3"><p className="mut text-sm">Set these only after the token is live and the mint address is verified on-chain. Market data and the buy button turn on automatically.</p>
<label className="block text-sm">Launch status<select name="launchStatus" defaultValue=${set.launchStatus} className="fld mt-1"><option>NOT_LAUNCHED</option><option>LAUNCHED</option></select></label>
<label className="block text-sm">Mint address<input name="mint" defaultValue=${set.mint} className="fld mt-1"/></label>
<label className="block text-sm">Pump.fun URL (https://pump.fun/...)<input name="pumpfunUrl" defaultValue=${set.pumpfunUrl} className="fld mt-1"/></label>
<button className="btn" type="submit">Save</button> <span role="status" className="text-sm">${msg}</span></form>`}
${tab === 'audit' && html`<div>${log.map((l, i) => html`<p key=${i} className="text-sm py-1 border-b ln"><span className="mut">${when(l.at)}</span> ${l.action} ${l.detail}</p>`)}</div>`}
</main>`
}
