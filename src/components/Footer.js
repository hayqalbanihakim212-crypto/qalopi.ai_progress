import { html } from '../lib/html.js'
import { useL } from '../i18n/LangContext.js'

export default function Footer() {
  const L = useL()
  return html`<footer className="border-t ln"><div className="max-w-6xl mx-auto px-5 py-10 text-sm mut space-y-3">
<p><strong className="text-[var(--ink)]">${L('Risk disclosure.','Pengungkapan risiko.')}</strong> ${L('QALOPI.AI is in research and development. Nothing here is investment advice or a promise of returns, and no mainnet, audit or certification is claimed that is not shown with evidence. Crypto assets are highly volatile.','QALOPI.AI masih dalam riset dan pengembangan. Tidak ada di sini yang merupakan saran investasi atau janji imbal hasil, dan tidak ada klaim mainnet, audit, atau sertifikasi tanpa bukti. Aset kripto sangat fluktuatif.')}</p>
<p>${L('Decorative visuals on this page are not runtime telemetry.','Visual dekoratif di halaman ini bukan telemetri runtime.')} © QALOPI.AI</p></div></footer>`
}
