# QALOPI.AI Public Development & Transparency Hub

Vite + React + Tailwind frontend, Express backend (Vercel-ready). Principle: evidence over claims, no dummy data.

## Structure
```
api/index.js          Vercel entry (wraps the Express app)
server/               Express API: routes/, lib/, store.js, test/
src/config/site.js    Public links (edit here)
src/data/             Module/evidence status, technology, roadmap, roles
src/sections/         Page sections (Hero, Token, GithubLive, Contact, ...)
src/components/       Header, Footer, Chart, shared UI
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
2. In Supabase, open **Connect** and obtain a PostgreSQL connection URI suitable for serverless use. Put it in Vercel as the server-only `DATABASE_URL`. The Supabase project HTTPS URL and publishable key are not PostgreSQL connection credentials; this backend uses `pg`. Never add database credentials to `VITE_*` variables or commit them.
3. Set `AUTH_SECRET` (at least 32 characters), `ADMIN_EMAIL`, and `ADMIN_PASSWORD_HASH`; optionally set `GITHUB_OWNER`, `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `EMAIL_API_KEY`, `NOTIFY_EMAIL`, and `FROM_EMAIL`. Use the owner and repository names only, not GitHub URLs.
4. Deploy, then open `/api/health`. It must show `"storage":"postgres"`; `ephemeral-file` means submissions and admin content will be lost between serverless instances.
5. Custom domain: Vercel > Settings > Domains. Rollback: Vercel > Deployments > promote a previous deployment.
Check that your Vercel plan's terms allow public, commercial and fundraising use.

## Admin content and funding
Open `/admin` to manage submissions, token launch settings, roadmap, roles, partners, contributors, documentation links, and the evidence-backed funding ledger. Contributors are shown publicly only with explicit publication consent. Funding entries require a public HTTPS evidence link and totals remain separated by currency; add only verified transactions or receipts.

## After the token launches
Open `/admin` > token only after launch. Set status LAUNCHED, the verified Solana mint, and that token's Pump.fun URL. Market data from DexScreener refreshes every 30 seconds; the GeckoTerminal OHLCV chart refreshes every 60 seconds. A price appears only after a real Solana market pair is indexed for the exact mint. No price is fabricated before then.

## API
- Public: GET `/api/health`, `/api/settings`, `/api/content`, `/api/funding`, `/api/github`, `/api/market`, `/api/market/ohlcv?tf=5m|15m|1h|4h|1d`; POST `/api/submissions`
- Admin (cookie auth): POST `/api/admin/login`, `/api/admin/logout`; GET `/api/admin/me`, `/submissions`, `/settings`, `/audit`, `/content`, `/funding`; PATCH `/api/admin/submissions/:id`; PUT `/api/admin/settings`, `/api/admin/funding`, and `/api/admin/content/{roadmap|roles|partners|contributors|documentation}`

## Known limitations / pending
- Documentation is currently managed as validated public links, not an uploaded MDX/PDF document center. The development evidence table and technology descriptions remain code-managed.
- Newsletter, separate routes per page (this is one page plus `/admin`), per-page SEO, and hosted error monitoring are not included.
- Rate limiting is in memory per serverless instance. Add an edge or WAF limit for stronger protection.
- Live market responses cannot be confirmed until the token is launched and its real mint has an indexed Solana pool. Holders and creator rewards have no data source and stay "Not available".
- The GitHub panel publishes commit messages of the configured repo. Use a public repo or accept that they are shown.
- No ESLint or browser test suite configured. A live Supabase connection and email notification still need deployment-level verification.
