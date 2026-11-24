// Tiny key-value store. Postgres when DATABASE_URL is set, otherwise a local JSON file.
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { env } from './config.js'

let pool, ready = false, queue = Promise.resolve()
const dir = () => env().dataDir || (process.env.VERCEL ? path.join(os.tmpdir(), 'qalopi') : path.resolve('data'))
const file = () => path.join(dir(), 'db.json')
export const storage = () => (env().databaseUrl ? 'postgres' : process.env.VERCEL ? 'ephemeral-file' : 'file')

async function pg() {
  if (!pool) {
    const { default: pgm } = await import('pg')
    pool = new pgm.Pool({ connectionString: env().databaseUrl, ssl: /localhost|127\.0\.0\.1/.test(env().databaseUrl) ? false : { rejectUnauthorized: false }, max: 3 })
  }
  if (!ready) { await pool.query('create table if not exists kv(key text primary key, value jsonb not null)'); ready = true }
  return pool
}
const readAll = async () => { try { return JSON.parse(await fs.readFile(file(), 'utf8')) } catch { return {} } }

export async function get(key, def) {
  if (env().databaseUrl) { const r = await (await pg()).query('select value from kv where key=$1', [key]); return r.rows[0] ? r.rows[0].value : def }
  return (await readAll())[key] ?? def
}
async function set(key, val) {
  if (env().databaseUrl) { await (await pg()).query('insert into kv(key,value) values($1,$2) on conflict(key) do update set value=excluded.value', [key, JSON.stringify(val)]); return }
  await fs.mkdir(dir(), { recursive: true })
  const all = await readAll(); all[key] = val
  await fs.writeFile(file(), JSON.stringify(all, null, 1))
}
// Serialized read-modify-write (per process). Use for every write.
export function update(key, def, fn) {
  const run = async () => { const next = await fn(structuredClone(await get(key, def))); await set(key, next); return next }
  const p = queue.then(run, run); queue = p.catch(() => {}); return p
}
