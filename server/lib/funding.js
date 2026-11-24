import { z } from 'zod'
import * as store from '../store.js'

const amount = z.number().finite().positive().max(1_000_000_000_000)
const currency = z.enum(['USD', 'USDC', 'SOL'])
const httpsUrl = z.string().url().refine(value => value.startsWith('https://'), 'Use an HTTPS URL')

export const FundingSchema = z.object({
  target: z.object({ amount, currency }).nullable(),
  entries: z.array(z.object({
    id: z.string().min(1).max(80),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    direction: z.enum(['received', 'spent']),
    amount,
    currency,
    description: z.string().trim().min(1).max(300),
    source: z.string().trim().min(1).max(120),
    evidenceUrl: httpsUrl,
  })).max(500),
}).superRefine(({ entries }, ctx) => {
  const ids = new Set()
  entries.forEach((entry, index) => {
    if (ids.has(entry.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['entries', index, 'id'], message: 'IDs must be unique' })
    ids.add(entry.id)
  })
})

const emptyFunding = { target: null, entries: [] }

export async function getFunding() {
  return store.get('funding', emptyFunding)
}

export async function saveFunding(value) {
  return store.update('funding', emptyFunding, () => value)
}
