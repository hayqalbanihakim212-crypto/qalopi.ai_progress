import { useState } from 'react'
import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { Sec } from '../components/ui.js'
import { api } from '../lib/api.js'

const TYPES = [['suggestion', 'Suggestion', 'Saran'], ['criticism', 'Criticism', 'Kritik'], ['bug', 'Bug report', 'Laporan bug'], ['docs', 'Documentation correction', 'Koreksi dokumentasi'], ['partnership', 'Partnership inquiry', 'Pertanyaan kemitraan'], ['investment', 'Investment inquiry', 'Pertanyaan investasi'], ['career', 'Expert / career application', 'Lamaran tenaga ahli'], ['security', 'Security concern (private)', 'Masalah keamanan (privat)']]

export default function Contact() {
  const L = useL()
  const [st, setSt] = useState(null)
  const [busy, setBusy] = useState(false)
  const submit = async e => {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.target))
    setBusy(true); setSt(null)
    try {
      const r = await api('/submissions', { method: 'POST', body: { type: f.type, name: f.name || '', email: f.email || '', subject: f.subject, message: f.message, consent: f.consent === 'on', website: f.website || '' } })
      setSt({ ok: true, ref: r.ref }); e.target.reset()
    } catch (err) {
      const d = err.details ? Object.values(err.details).flat().join(' ') : ''
      setSt({ ok: false, msg: err.message + (d ? ': ' + d : '') })
    } finally { setBusy(false) }
  }
  return html`<${Sec} id="feedback" title=${L('Suggestions, criticism and corrections.', 'Saran, kritik, dan koreksi.')}>
<form onSubmit=${submit} className="grid md:grid-cols-2 gap-4 max-w-3xl">
<label className="block text-sm">${L('Type', 'Jenis')}<select name="type" className="fld mt-1">${TYPES.map(t => html`<option key=${t[0]} value=${t[0]}>${L(t[1], t[2])}</option>`)}</select></label>
<label className="block text-sm">${L('Name (optional)', 'Nama (opsional)')}<input name="name" maxLength="80" className="fld mt-1"/></label>
<label className="block text-sm md:col-span-2">${L('Email (required for partnership, investment and career)', 'Email (wajib untuk kemitraan, investasi, dan lamaran)')}<input name="email" type="email" className="fld mt-1"/></label>
<label className="block text-sm md:col-span-2">${L('Subject', 'Subjek')}<input name="subject" required minLength="3" maxLength="140" className="fld mt-1"/></label>
<label className="block text-sm md:col-span-2">${L('Description (at least 10 characters)', 'Deskripsi (minimal 10 karakter)')}<textarea name="message" required minLength="10" maxLength="4000" rows="5" className="fld mt-1"></textarea></label>
<input name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" style=${{ position: 'absolute', left: '-9999px' }}/>
<label className="flex gap-2 text-sm md:col-span-2"><input type="checkbox" name="consent" required/>${L('I agree my message may be stored and reviewed.', 'Saya setuju pesan saya disimpan dan ditinjau.')}</label>
<div className="md:col-span-2"><button className="btn" type="submit" disabled=${busy}>${busy ? L('Sending…', 'Mengirim…') : L('Send message', 'Kirim pesan')}</button>
<p role="status" className="text-sm mt-3" style=${{ color: st && st.ok ? 'var(--blue)' : 'var(--bad)' }}>${st ? (st.ok ? L('Received. Your reference ID: ', 'Diterima. ID referensi Anda: ') + st.ref : st.msg) : ''}</p>
<p className="mut text-sm mt-3">${L('Security vulnerabilities: do not post details publicly. Choose "Security concern (private)"; it is never shown on this site.', 'Kerentanan keamanan: jangan tulis detail secara publik. Pilih "Masalah keamanan (privat)"; tidak pernah ditampilkan di situs ini.')}</p></div></form><//>`
}
