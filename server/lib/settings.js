import { z } from 'zod'
import * as store from '../store.js'
export const DEFAULTS = { launchStatus: 'NOT_LAUNCHED', mint: '', pumpfunUrl: '' }
export const getSettings = async () => ({ ...DEFAULTS, ...(await store.get('settings', {})) })
export const SettingsSchema = z.object({
  launchStatus: z.enum(['NOT_LAUNCHED', 'LAUNCHED']),
  mint: z.string().trim().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Not a valid Solana address').or(z.literal('')),
  pumpfunUrl: z.string().trim().regex(/^https:\/\/(www\.)?pump\.fun\//, 'Must be an https://pump.fun/ URL').or(z.literal('')),
}).refine(s => s.launchStatus === 'NOT_LAUNCHED' || (s.mint && s.pumpfunUrl), { message: 'LAUNCHED requires a mint address and a Pump.fun URL' })
