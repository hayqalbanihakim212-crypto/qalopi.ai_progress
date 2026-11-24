import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'
import { CFG, ok } from '../config/site.js'
import { useApi } from '../lib/useApi.js'
import { when } from '../lib/format.js'

export default function GithubLive() {
  const L = useL()
  const { data: d, error, loading, reload } = useApi('/github')
  const live = d && d.configured
  return html`<section className="max-w-6xl mx-auto px-5 pb-16"><div className="border ln p-6 md:p-8" style=${{ background: 'var(--bg2)' }}>
<div className="flex flex-wrap items-center justify-between gap-3"><h3 className="serif text-3xl font-semibold">${L('Live GitHub activity', 'Aktivitas GitHub langsung')}</h3>
<button className="btn" onClick=${reload} disabled=${loading}>${L('Refresh', 'Muat ulang')}</button></div>
${loading && html`<p className="mut mt-3">${L('Loading…', 'Memuat…')}</p>`}
${error && html`<p className="mt-3" style=${{ color: 'var(--bad)' }}>${L('GitHub data is temporarily unavailable. Nothing is shown rather than guessing.', 'Data GitHub sedang tidak tersedia. Tidak ada data ditampilkan daripada menebak.')}</p>`}
${d && !live && html`<p className="mt-3 font-medium" style=${{ color: 'var(--warn)' }}>${L('Awaiting repository connection', 'Menunggu koneksi repository')}</p>
<p className="mut mt-2 max-w-2xl text-sm">${L('Set GITHUB_OWNER and GITHUB_REPOSITORY on the server to show real commits, releases and contributors. Commit counts are activity, not proof that a feature is finished.', 'Atur GITHUB_OWNER dan GITHUB_REPOSITORY di server untuk menampilkan commit, rilis, dan kontributor nyata. Jumlah commit adalah aktivitas, bukan bukti fitur selesai.')}</p>
${ok(CFG.github) && html`<a className="btn mt-5" href=${CFG.github} rel="noopener noreferrer" target="_blank">GitHub</a>`}`}
${live && html`<div className="mt-4 grid md:grid-cols-2 gap-8">
<div><a className="gold font-semibold underline" href=${d.repo.url} target="_blank" rel="noopener noreferrer">${d.repo.name}</a>
<p className="mut text-sm mt-1">${d.repo.description || ''}</p>
<p className="text-sm mt-3">★ ${d.repo.stars} · ${L('forks', 'fork')} ${d.repo.forks} · ${L('open issues', 'issue terbuka')} ${d.repo.openIssues}</p>
<p className="mut text-sm mt-1">${Object.keys(d.languages).join(', ')}</p>
<h4 className="font-semibold mt-5">${L('Releases', 'Rilis')}</h4>${d.releases.length ? d.releases.map(x => html`<p key=${x.tag} className="text-sm"><a className="underline" href=${x.url} target="_blank" rel="noopener noreferrer">${x.name || x.tag}</a> <span className="mut">${when(x.date)}</span></p>`) : html`<p className="mut text-sm">${L('No releases yet.', 'Belum ada rilis.')}</p>`}
<h4 className="font-semibold mt-5">${L('Contributors', 'Kontributor')}</h4><p className="text-sm">${d.contributors.map(x => html`<a key=${x.login} className="underline mr-3" href=${x.url} target="_blank" rel="noopener noreferrer">${x.login}</a>`)}</p></div>
<div><h4 className="font-semibold">${L('Latest commits', 'Commit terbaru')}</h4>${d.commits.map(c => html`<div key=${c.sha} className="py-2 border-b ln text-sm"><a className="underline" href=${c.url} target="_blank" rel="noopener noreferrer">${c.sha}</a> ${c.message}<div className="mut text-xs">${c.author} · ${when(c.date)}</div></div>`)}
<p className="mut text-xs mt-3">${L('Last synchronized', 'Sinkron terakhir')}: ${when(d.lastSynced)}</p></div></div>`}
</div></section>`
}
