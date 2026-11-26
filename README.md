# QALOPI.AI Public Development & Transparency Hub

Vite + React + Tailwind frontend, Express backend (Vercel-ready). Principle: evidence over claims, no dummy data.

## Structure
```
api/index.js          Vercel entry (wraps the Express app)
server/               Express API: routes/, lib/, store.js, test/
src/config/site.js    Public links (edit here)
src/data/             Module/evidence status, technology, roadmap, roles
src/sections/         Page sections (Hero, Token, GithubLive, Contact, ...)
src/components/       Header, Footer, Chart (candles + volume), Trades (live swaps), Donate (5 coins + QR), CopyButton, shared UI
src/pages/Admin.js    Admin dashboard (/admin)
src/i18n/             English / Bahasa Indonesia switch
```
Views use `htm` tagged templates (React.createElement under the hood), so no JSX transform is needed.

## Run locally
```
npm install
npm run hash-password -- "a new, unique password"   # put the output in ADMIN_PASSWORD_HASH in .env
npm run dev               # web: http://localhost:5173, API: http://localhost:8787
npm test                  # backend tests
npm run build             # production build
```
`.env` is local-only and ignored by Git. Without `DATABASE_URL`, local data is kept in `./data/db.json`; this is not durable storage on Vercel.

## Deploy to Vercel
1. Push to a new GitHub repo (`qalopi-public-hub`) and import it in Vercel (framework: Vite).
2. In Supabase, open **Connect** and choose **Transaction pooler** for Vercel serverless functions. Copy its PostgreSQL URI (port `6543`) to Vercel as the server-only `DATABASE_URL`; use the exact host and username shown by Supabase. A direct database URI can time out from an IPv4-only runtime. The Supabase project HTTPS URL and publishable key are not PostgreSQL connection credentials; this backend uses `pg`. Never add database credentials to `VITE_*` variables or commit them.
3. Set `AUTH_SECRET` (at least 32 characters), `ADMIN_EMAIL`, and `ADMIN_PASSWORD_HASH`; optionally set `GITHUB_OWNER`, `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `EMAIL_API_KEY`, `NOTIFY_EMAIL`, and `FROM_EMAIL`. Use the owner and repository names only, not GitHub URLs.
4. Deploy, then open `/api/health`. It must show `"storage":"postgres"` and `"database":"connected"`. A 503 or `"database":"unavailable"` means the Vercel function cannot reach PostgreSQL; check that `DATABASE_URL` uses the Supabase Transaction pooler and redeploy after changing it. `ephemeral-file` means submissions and admin content will be lost between serverless instances.
5. Custom domain: Vercel > Settings > Domains. Rollback: Vercel > Deployments > promote a previous deployment.
Check that your Vercel plan's terms allow public, commercial and fundraising use.

## Admin content and funding
Open `/admin` to manage submissions, token launch settings, roadmap, roles, partners, contributors, documentation links, and the evidence-backed funding ledger. Contributors are shown publicly only with explicit publication consent. Funding entries require a public HTTPS evidence link and totals remain separated by currency; add only verified transactions or receipts.

## Token ($QLPO), chart and live transactions
The community token is preconfigured in `server/lib/settings.js` (`TOKEN`): **qalopi ($QLPO)**, mint `AGVeuGdPYePghgF6evN8C8mceNzDVT4GVZdcPRDfpump`, status LAUNCHED. The ticker shown on the site comes from `CFG.tokenSymbol` in `src/config/site.js` and must match Pump.fun.

- **Precedence:** anything saved in `/admin` > Token overrides these defaults. If you saved settings there before, open `/admin` > Token once and set LAUNCHED + the mint + the Pump.fun URL above (or the site keeps showing the old state).
- **Market stats:** DexScreener first, GeckoTerminal as fallback (a brand-new Pump.fun coin is often indexed by only one of them). Refresh 30 s.
- **Chart:** GeckoTerminal OHLCV (5m, 15m, 1h, 4h, 1d), refresh 60 s, with `include_empty_intervals` so a thinly traded coin shows a continuous time axis (flat candles = no trades).
- **Recent transactions:** real swaps from GeckoTerminal for the token's pool, refresh 30 s. The provider only returns the **last 24 hours (max 300)**; the site shows the newest 50. Each row links to Solscan when the signature/wallet pass validation. An empty list means nobody traded in that window; nothing is simulated or padded.
- A price/chart/transactions panel appears only after a real Solana pool for the exact mint is indexed. Holders and creator rewards have no data source and stay "Not available".
- Disabling: `/admin` > Token > NOT_LAUNCHED hides the market panel.

## Donations
Five coins are offered in `src/config/site.js` (`DONATE`): BTC, BNB (BSC), SOL, ETH and MON (Monad mainnet). BNB, ETH and MON are EVM chains that share one `0x` address, so the network is always shown next to it. Each coin shows a copyable address, a QR code (generated in the browser with `qrcode`, nothing is sent to a third party) and an explorer link. `server/test/donate.test.js` fails if an address becomes malformed (BTC bech32 checksum, Solana 32-byte key, `0x` format) or changes from the agreed value; update the test deliberately when rotating a wallet.
The funding ledger (`/admin` > Funding) accepts USD, USDC, SOL, BTC, BNB, ETH and MON, always totalled per currency. Add a received donation only with its public explorer link as evidence.

## API
- Public: GET `/api/health`, `/api/settings`, `/api/content`, `/api/funding`, `/api/github`, `/api/market`, `/api/market/ohlcv?tf=5m|15m|1h|4h|1d`, `/api/market/trades`; POST `/api/submissions`
- Admin (cookie auth): POST `/api/admin/login`, `/api/admin/logout`; GET `/api/admin/me`, `/submissions`, `/settings`, `/audit`, `/content`, `/funding`; PATCH `/api/admin/submissions/:id`; PUT `/api/admin/settings`, `/api/admin/funding`, and `/api/admin/content/{roadmap|roles|partners|contributors|documentation}`

## Known limitations / pending
- Documentation is currently managed as validated public links, not an uploaded MDX/PDF document center. The development evidence table and technology descriptions remain code-managed.
- Newsletter, separate routes per page (this is one page plus `/admin`), per-page SEO, and hosted error monitoring are not included.
- Rate limiting is in memory per serverless instance. Add an edge or WAF limit for stronger protection.
- Live market responses depend on DexScreener / GeckoTerminal having indexed the mint's pool; their free APIs are rate limited (GeckoTerminal ~30 calls/min per IP), which the in-memory cache only partly absorbs on serverless. The transactions list covers the last 24 h only; a longer history would need a Solana RPC provider. Holders and creator rewards have no data source and stay "Not available".
- The GitHub panel publishes commit messages of the configured repo. Use a public repo or accept that they are shown.
- No ESLint or browser test suite configured. A live Supabase connection and email notification still need deployment-level verification.
