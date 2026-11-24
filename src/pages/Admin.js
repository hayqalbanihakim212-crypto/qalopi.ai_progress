import { useEffect, useState } from 'react'
import { html } from '../lib/html.js'
import { api } from '../lib/api.js'
import { when } from '../lib/format.js'

const STATUSES = ['new', 'reviewing', 'resolved', 'spam']
const CONTENT_FIELDS = {
  roadmap: [['title', 'Milestone title'], ['descriptionEn', 'Description (English)'], ['descriptionId', 'Description (Indonesian)'], ['status', 'Status']],
  roles: [['title', 'Role']],
  partners: [['nameEn', 'Partnership (English)'], ['nameId', 'Partnership (Indonesian)']],
  contributors: [['displayName', 'Public name / handle'], ['contribution', 'Contribution'], ['profileUrl', 'Public profile URL']],
  documentation: [['title', 'Link title'], ['url', 'HTTPS URL'], ['description', 'Description']],
}
const newId = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

function ContentEditor({ content, onSave, message, setMessage }) {
  const [type, setType] = useState('roadmap')
  const items = content?.[type] || []
  const update = (index, key, value) => onSave(type, items.map((item, i) => i === index ? { ...item, [key]: value } : item), false)
  const add = () => {
    const item = { id: newId(type) }
    CONTENT_FIELDS[type].forEach(([key]) => { item[key] = key === 'status' ? 'PLANNED' : '' })
    if (type === 'contributors') item.consentToPublish = false
    onSave(type, [...items, item], false)
  }
  const save = async () => { setMessage(''); await onSave(type, items, true) }
  return html`<section className="space-y-4">
    <div className="flex flex-wrap gap-2 items-center"><select className="fld max-w-xs" value=${type} onChange=${e => setType(e.target.value)}>${Object.keys(CONTENT_FIELDS).map(t => html`<option key=${t} value=${t}>${t}</option>`)}</select>
    <button className="btn" onClick=${add}>Add item</button><button className="btn" onClick=${save}>Save ${type}</button><span role="status" className="text-sm">${message}</span></div>
    ${type === 'contributors' && html`<p className="mut text-sm">Publish only a public name or handle with the person's consent. Unchecked contributors remain private.</p>`}
    ${items.map((item, index) => html`<article key=${item.id} className="border ln p-4 space-y-3">
      <div className="flex justify-between"><strong>${item.title || item.displayName || item.nameEn || `Item ${index + 1}`}</strong><button className="underline text-sm" onClick=${() => onSave(type, items.filter((_, i) => i !== index), false)}>Remove</button></div>
      ${CONTENT_FIELDS[type].map(([key, label]) => key === 'status'
        ? html`<label className="block text-sm">${label}<select className="fld mt-1" value=${item[key]} onChange=${e => update(index, key, e.target.value)}>${['PASS_HISTORIS', 'PASS_SCOPED', 'PASS_SCOPED_LIVE', 'PASS_SCOPED_SOURCE_BOUND', 'IN_PROGRESS', 'OPEN', 'BLOCKED', 'DEFERRED', 'PLANNED', 'UNVERIFIED', 'NOT_RUN'].map(status => html`<option key=${status}>${status}</option>`)}</select></label>`
        : html`<label className="block text-sm">${label}<input className="fld mt-1" value=${item[key] || ''} type=${key.toLowerCase().includes('url') ? 'url' : 'text'} onChange=${e => update(index, key, e.target.value)}/></label>`)}
      ${type === 'contributors' && html`<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked=${item.consentToPublish} onChange=${e => update(index, 'consentToPublish', e.target.checked)}/> Consent to publish</label>`}
    </article>`)}
  </section>`
}

function FundingEditor({ funding, onSave, message, setMessage }) {
  const data = funding || { target: null, entries: [] }
  const target = data.target || { amount: '', currency: 'USD' }
  const updateEntry = (index, key, value) => onSave({ ...data, entries: data.entries.map((entry, i) => i === index ? { ...entry, [key]: value } : entry) }, false)
  const addEntry = () => onSave({ ...data, entries: [...data.entries, { id: newId('fund'), date: new Date().toISOString().slice(0, 10), direction: 'received', amount: '', currency: 'USD', description: '', source: '', evidenceUrl: '' }] }, false)
  const save = async () => { setMessage(''); await onSave(data, true) }
  return html`<section className="space-y-4 max-w-3xl">
    <p className="mut text-sm">Only enter amounts supported by the linked transaction or receipt. Values in different currencies are shown separately.</p>
    <fieldset className="border ln p-4 space-y-3"><legend className="px-2">Funding target (optional)</legend>
      <label className="block text-sm">Amount<input className="fld mt-1" type="number" min="0" step="any" value=${target.amount ?? ''} onChange=${e => onSave({ ...data, target: e.target.value ? { ...target, amount: Number(e.target.value) } : null }, false)}/></label>
      <label className="block text-sm">Currency<select className="fld mt-1" value=${target.currency} onChange=${e => onSave({ ...data, target: target.amount ? { ...target, currency: e.target.value } : null }, false)}>${['USD', 'USDC', 'SOL'].map(c => html`<option key=${c}>${c}</option>`)}</select></label>
    </fieldset>
    ${data.entries.map((entry, index) => html`<article key=${entry.id} className="border ln p-4 space-y-3">
      <div className="flex justify-between"><strong>${entry.date} · ${entry.direction}</strong><button className="underline text-sm" onClick=${() => onSave({ ...data, entries: data.entries.filter((_, i) => i !== index) }, false)}>Remove</button></div>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block text-sm">Date<input className="fld mt-1" type="date" value=${entry.date} onChange=${e => updateEntry(index, 'date', e.target.value)}/></label>
        <label className="block text-sm">Direction<select className="fld mt-1" value=${entry.direction} onChange=${e => updateEntry(index, 'direction', e.target.value)}><option value="received">Received</option><option value="spent">Spent</option></select></label>
        <label className="block text-sm">Amount<input className="fld mt-1" type="number" min="0" step="any" value=${entry.amount} onChange=${e => updateEntry(index, 'amount', e.target.value ? Number(e.target.value) : '')}/></label>
        <label className="block text-sm">Currency<select className="fld mt-1" value=${entry.currency} onChange=${e => updateEntry(index, 'currency', e.target.value)}>${['USD', 'USDC', 'SOL'].map(c => html`<option key=${c}>${c}</option>`)}</select></label>
        <label className="block text-sm">Description<input className="fld mt-1" value=${entry.description} onChange=${e => updateEntry(index, 'description', e.target.value)}/></label>
        <label className="block text-sm">Source<input className="fld mt-1" value=${entry.source} onChange=${e => updateEntry(index, 'source', e.target.value)}/></label>
      </div>
      <label className="block text-sm">Public transaction or receipt evidence (HTTPS)<input className="fld mt-1" type="url" value=${entry.evidenceUrl} onChange=${e => updateEntry(index, 'evidenceUrl', e.target.value)}/></label>
    </article>`)}
    <div className="flex gap-3"><button className="btn" onClick=${addEntry}>Add ledger entry</button><button className="btn" onClick=${save}>Save funding ledger</button><span role="status" className="text-sm">${message}</span></div>
  </section>`
}

export default function Admin() {
  const [auth, setAuth] = useState(null)
  const [tab, setTab] = useState('submissions')
  const [err, setErr] = useState('')
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('')
  const [set, setSet] = useState(null)
  const [log, setLog] = useState([])
  const [msg, setMsg] = useState('')
  const [content, setContent] = useState(null)
  const [funding, setFunding] = useState(null)
  const [contentMsg, setContentMsg] = useState('')
  const [fundingMsg, setFundingMsg] = useState('')
  const load = async () => {
    try {
      setItems((await api('/admin/submissions' + (filter ? '?status=' + filter : ''))).items)
      setSet(await api('/admin/settings')); setLog((await api('/admin/audit')).items)
      setContent(await api('/admin/content')); setFunding(await api('/admin/funding'))
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
  const saveContent = async (type, items, persist) => {
    setContent(current => ({ ...current, [type]: items }))
    if (persist) {
      try { const result = await api('/admin/content/' + type, { method: 'PUT', body: items }); setContent(current => ({ ...current, [type]: result.items })); setContentMsg('Saved.') }
      catch (e) { setContentMsg(e.message) }
    }
  }
  const saveFunding = async (value, persist) => {
    setFunding(value)
    if (persist) {
      try { setFunding(await api('/admin/funding', { method: 'PUT', body: value })); setFundingMsg('Saved.') }
      catch (e) { setFundingMsg(e.message) }
    }
  }
  if (auth === null) return html`<p className="p-8 mut">Loading…</p>`
  if (!auth) return html`<main className="max-w-sm mx-auto p-8"><h1 className="serif text-4xl font-semibold mb-6">Admin</h1>
<form onSubmit=${login} className="space-y-3"><input name="email" type="email" placeholder="Email" className="fld" required autoComplete="username"/><input name="password" type="password" placeholder="Password" className="fld" required autoComplete="current-password"/>
<button className="btn" type="submit">Sign in</button><p role="alert" className="text-sm" style=${{ color: 'var(--bad)' }}>${err}</p></form></main>`
  return html`<main className="max-w-6xl mx-auto p-6">
<div className="flex items-center justify-between"><h1 className="serif text-4xl font-semibold">Admin</h1><div className="flex gap-3 text-sm"><a href="/" className="underline">Site</a><button className="underline" onClick=${async () => { await api('/admin/logout', { method: 'POST' }); setAuth(false) }}>Sign out</button></div></div>
<div className="flex flex-wrap gap-2 my-6">${['submissions', 'token', 'content', 'funding', 'audit'].map(t => html`<button key=${t} onClick=${() => setTab(t)} className="px-3 py-1 border" style=${{ borderColor: tab === t ? 'var(--gold)' : 'var(--line)', color: tab === t ? 'var(--gold)' : 'var(--mut)' }}>${t}</button>`)}</div>
${tab === 'submissions' && html`<div><select className="fld max-w-xs mb-4" value=${filter} onChange=${e => setFilter(e.target.value)} aria-label="Status filter"><option value="">All statuses</option>${STATUSES.map(s => html`<option key=${s}>${s}</option>`)}</select>
${!items.length ? html`<p className="mut">No submissions yet.</p>` : items.map(s => html`<article key=${s.id} className="border ln p-4 mb-3"><div className="flex flex-wrap justify-between gap-2 text-sm"><span><strong>${s.ref}</strong> · ${s.type} · <span className="mut">${when(s.createdAt)}</span></span>
<select value=${s.status} onChange=${e => setStatus(s.id, e.target.value)} className="fld w-auto" aria-label="Set status">${STATUSES.map(x => html`<option key=${x}>${x}</option>`)}</select></div>
<h3 className="font-semibold mt-2">${s.subject}</h3><p className="mut whitespace-pre-wrap text-sm mt-1">${s.message}</p><p className="text-xs mt-2 mut">${s.name || 'anonymous'} ${s.email ? '· ' + s.email : ''}</p></article>`)}</div>`}
${tab === 'token' && set && html`<form onSubmit=${save} className="max-w-xl space-y-3"><p className="mut text-sm">Set these only after the token is live and the mint address is verified on-chain. Market data and the buy button turn on automatically.</p>
<label className="block text-sm">Launch status<select name="launchStatus" defaultValue=${set.launchStatus} className="fld mt-1"><option>NOT_LAUNCHED</option><option>LAUNCHED</option></select></label>
<label className="block text-sm">Mint address<input name="mint" defaultValue=${set.mint} className="fld mt-1"/></label>
<label className="block text-sm">Pump.fun URL (https://pump.fun/...)<input name="pumpfunUrl" defaultValue=${set.pumpfunUrl} className="fld mt-1"/></label>
<button className="btn" type="submit">Save</button> <span role="status" className="text-sm">${msg}</span></form>`}
${tab === 'content' && content && html`<${ContentEditor} content=${content} onSave=${saveContent} message=${contentMsg} setMessage=${setContentMsg}/>`}
${tab === 'funding' && funding && html`<${FundingEditor} funding=${funding} onSave=${saveFunding} message=${fundingMsg} setMessage=${setFundingMsg}/>`}
${tab === 'audit' && html`<div>${log.map((l, i) => html`<p key=${i} className="text-sm py-1 border-b ln"><span className="mut">${when(l.at)}</span> ${l.action} ${l.detail}</p>`)}</div>`}
</main>`
}
