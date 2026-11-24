import { env } from '../config.js'
// Optional, fire-and-forget. Never includes the message body.
export function notify(sub) {
  const { resendKey, notifyEmail, fromEmail } = env()
  if (!resendKey || !notifyEmail || !fromEmail) return
  fetch('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(8000),
    headers: { Authorization: 'Bearer ' + resendKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: fromEmail, to: notifyEmail, subject: `[QALOPI hub] ${sub.type}: ${sub.ref}`, text: `New ${sub.type} submission ${sub.ref}. Review it in the admin dashboard.` }),
  }).catch(() => {})
}
