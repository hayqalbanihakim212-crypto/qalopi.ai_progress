// Public links. Empty values are hidden / shown as "Coming soon". Never guess a URL.
export const CFG = {
  github: 'https://github.com/hayqalbanihakim212-crypto',
  email: 'mailto:hayqalbanihakim212@gmail.com',
  telegram: 'https://t.me/qalopi90',
  instagram: 'https://www.instagram.com/qalopi.ai',
  igDev: 'https://www.instagram.com/qarlbanihakim/',
  x: '', linkedin: '', discord: '', youtube: '', mainSite: '',
  tokenName: 'qalopi',
  tokenSymbol: 'QLPO', // ticker exactly as registered on Pump.fun
}
export const ok=u=>typeof u==='string'&&/^(https:\/\/|mailto:)/.test(u);

// Official donation wallets. These are the ONLY addresses the site publishes; each one is checked
// by server/test/donate.test.js (bech32 checksum / base58 length / 0x format). Double-check any edit.
// BNB, ETH and MON are all EVM chains and share one address, so `network` must be shown to donors.
export const DONATE = [
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin mainnet (native SegWit, bc1q…)', address: 'bc1qc0tsdgvvh02whfwww82ammhqqr2amq6slpl460', explorer: 'https://mempool.space/address/' },
  { id: 'bnb', symbol: 'BNB', name: 'BNB', network: 'BNB Smart Chain (BSC / BEP-20)', address: '0xFB2dC493a5D1ecAC1592be747293186914bD8D28', explorer: 'https://bscscan.com/address/' },
  { id: 'sol', symbol: 'SOL', name: 'Solana', network: 'Solana mainnet', address: '4Frjxs6yFRwvgSUHuXgFzLpa5zXgnBs41QfcB6FH8T4X', explorer: 'https://solscan.io/account/' },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', network: 'Ethereum mainnet (ERC-20)', address: '0xFB2dC493a5D1ecAC1592be747293186914bD8D28', explorer: 'https://etherscan.io/address/' },
  { id: 'mon', symbol: 'MON', name: 'Monad', network: 'Monad mainnet (chain ID 143)', address: '0xFB2dC493a5D1ecAC1592be747293186914bD8D28', explorer: 'https://monadscan.com/address/' },
]

// Currencies the funding ledger accepts (must match server/lib/funding.js).
export const FUND_CURRENCIES = ['USD', 'USDC', 'SOL', 'BTC', 'BNB', 'ETH', 'MON']
