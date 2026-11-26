import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DONATE, CFG } from '../../src/config/site.js'

// Donation addresses are money-critical: these tests fail if one is edited into something malformed.
const BECH32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
function bech32Valid(addr) {
  const a = addr.toLowerCase(); const sep = a.lastIndexOf('1')
  const hrp = a.slice(0, sep); const data = [...a.slice(sep + 1)].map(c => BECH32.indexOf(c))
  if (hrp !== 'bc' || data.includes(-1) || a !== addr) return false
  const G = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
  let chk = 1
  for (const v of [...[...hrp].map(c => c.charCodeAt(0) >> 5), 0, ...[...hrp].map(c => c.charCodeAt(0) & 31), ...data]) {
    const top = chk >> 25; chk = ((chk & 0x1ffffff) << 5) ^ v
    for (let i = 0; i < 5; i++) if ((top >> i) & 1) chk ^= G[i]
  }
  return chk === 1 || chk === 0x2bc830a3 // bech32 (v0) or bech32m (v1+)
}
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
function base58Length(s) {
  let n = 0n
  for (const c of s) { const i = B58.indexOf(c); if (i < 0) return -1; n = n * 58n + BigInt(i) }
  let hex = n.toString(16); if (hex.length % 2) hex = '0' + hex
  return (hex === '0' ? 0 : hex.length / 2) + [...s].findIndex(c => c !== '1') // leading '1's are zero bytes
}

test('exactly BTC, BNB, SOL, ETH and MON are offered, with unique ids', () => {
  assert.deepEqual(DONATE.map(d => d.symbol), ['BTC', 'BNB', 'SOL', 'ETH', 'MON'])
  assert.equal(new Set(DONATE.map(d => d.id)).size, DONATE.length)
})

test('every donation address is well formed for its network', () => {
  for (const d of DONATE) {
    if (d.id === 'btc') assert.ok(bech32Valid(d.address), 'BTC bech32 checksum')
    else if (d.id === 'sol') assert.equal(base58Length(d.address), 32, 'Solana public key is 32 bytes')
    else assert.match(d.address, /^0x[0-9a-fA-F]{40}$/, d.symbol)
    assert.ok(d.network && d.name, d.symbol + ' needs a network label')
    assert.match(d.explorer, /^https:\/\/[^/]+\/.+\/$/, d.symbol + ' explorer base URL')
  }
})

test('the three EVM coins share one address and the exact addresses requested', () => {
  const by = Object.fromEntries(DONATE.map(d => [d.id, d.address]))
  assert.equal(by.btc, 'bc1qc0tsdgvvh02whfwww82ammhqqr2amq6slpl460')
  assert.equal(by.sol, '4Frjxs6yFRwvgSUHuXgFzLpa5zXgnBs41QfcB6FH8T4X')
  assert.equal(by.bnb, '0xFB2dC493a5D1ecAC1592be747293186914bD8D28')
  assert.equal(by.eth, by.bnb)
  assert.equal(by.mon, by.bnb)
})

test('token ticker matches the one registered on Pump.fun', () => {
  assert.equal(CFG.tokenSymbol, 'QLPO')
})
