import { z } from 'zod'
import * as store from '../store.js'
import { ROAD } from '../../src/data/roadmap.js'
import { ROLES, PARTN } from '../../src/data/join.js'

const httpsUrl = z.string().url().refine(value => value.startsWith('https://'), 'Use an HTTPS URL')
const roadmapItem = z.object({
  id: z.string().min(1).max(80),
  title: z.string().trim().min(1).max(100),
  descriptionEn: z.string().trim().min(1).max(500),
  descriptionId: z.string().trim().min(1).max(500),
  status: z.enum(['PASS_HISTORIS', 'PASS_SCOPED', 'PASS_SCOPED_LIVE', 'PASS_SCOPED_SOURCE_BOUND', 'IN_PROGRESS', 'OPEN', 'BLOCKED', 'DEFERRED', 'PLANNED', 'UNVERIFIED', 'NOT_RUN']),
})
const roleItem = z.object({ id: z.string().min(1).max(80), title: z.string().trim().min(1).max(120) })
const partnerItem = z.object({
  id: z.string().min(1).max(80),
  nameEn: z.string().trim().min(1).max(120),
  nameId: z.string().trim().min(1).max(120),
})
const contributorItem = z.object({
  id: z.string().min(1).max(80),
  displayName: z.string().trim().min(1).max(100),
  contribution: z.string().trim().min(1).max(300),
  profileUrl: httpsUrl.or(z.literal('')),
  consentToPublish: z.boolean(),
})
const documentationItem = z.object({
  id: z.string().min(1).max(80),
  title: z.string().trim().min(1).max(120),
  url: httpsUrl,
  description: z.string().trim().max(300).default(''),
})
const uniqueList = schema => z.array(schema).max(100).superRefine((items, ctx) => {
  const ids = new Set()
  items.forEach((item, index) => {
    if (ids.has(item.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [index, 'id'], message: 'IDs must be unique' })
    ids.add(item.id)
  })
})

export const ContentSchemas = {
  roadmap: uniqueList(roadmapItem),
  roles: uniqueList(roleItem),
  partners: uniqueList(partnerItem),
  contributors: uniqueList(contributorItem),
  documentation: uniqueList(documentationItem),
}

const seed = {
  roadmap: [
    ...ROAD.map(([title, [descriptionEn, descriptionId], status], i) => ({ id: `roadmap-${i + 1}`, title, descriptionEn, descriptionId, status })),
    { id: 'roadmap-mainnet', title: 'Mainnet', descriptionEn: 'Not scheduled.', descriptionId: 'Belum dijadwalkan.', status: 'PLANNED' },
  ],
  roles: ROLES.map((title, i) => ({ id: `role-${i + 1}`, title })),
  partners: PARTN.map(([nameEn, nameId], i) => ({ id: `partner-${i + 1}`, nameEn, nameId })),
  contributors: [],
  documentation: [],
}

export async function getContent() {
  const content = {}
  for (const [type, fallback] of Object.entries(seed)) content[type] = await store.get(`content-${type}`, fallback)
  return content
}

export async function saveContent(type, items) {
  return store.update(`content-${type}`, seed[type], () => items)
}

export function publicContent(content) {
  return { ...content, contributors: content.contributors.filter(person => person.consentToPublish) }
}
