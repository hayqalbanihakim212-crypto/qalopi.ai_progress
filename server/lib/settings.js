import { z } from 'zod'
import * as store from '../store.js'

// Official community token (Pump.fun, Solana). Used until /admin saves its own settings;
// anything saved in /admin takes precedence over these defaults.
export const TOKEN = {
  name: 'qalopi',
  symbol: 'QLPO',
  mint: 'AGVeuGdPYePghgF6evN8C8mceNzDVT4GVZdcPRDfpump',
  pumpfunUrl: 'https://pump.fun/coin/AGVeuGdPYePghgF6evN8C8mceNzDVT4GVZdcPRDfpump',
}
export const DEFAULTS = { launchStatus: 'LAUNCHED', mint: TOKEN.mint, pumpfunUrl: TOKEN.pumpfunUrl }
export const getSettings = async () => ({ ...DEFAULTS, ...(await store.get('settings', {})) })
export const SettingsSchema = z.object({
  launchStatus: z.enum(['NOT_LAUNCHED', 'LAUNCHED']),
  mint: z.string().trim().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Not a valid Solana address').or(z.literal('')),
  pumpfunUrl: z.string().trim().regex(/^https:\/\/(www\.)?pump\.fun\//, 'Must be an https://pump.fun/ URL').or(z.literal('')),
}).refine(s => s.launchStatus === 'NOT_LAUNCHED' || (s.mint && s.pumpfunUrl), { message: 'LAUNCHED requires a mint address and a Pump.fun URL' })
