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
cp .env.example .env      # fill AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD_HASH
npm run hash-password -- "a long password"   # paste the output into .env inside single quotes
npm run dev               # web: http://localhost:5173, API: http://localhost:8787
npm test                  # backend tests
npm run build             # production build
```
Without `DATABASE_URL`, data is kept in `./data/db.json` (local only).

## Deploy to Vercel
1. Push to a new GitHub repo (`qalopi-public-hub`) and import it in Vercel (framework: Vite).
2. Create a Postgres database (Neon or Vercel Marketplace) and set `DATABASE_URL`. The `kv` table is created automatically.
3. Set `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and optionally `GITHUB_OWNER`, `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `EMAIL_API_KEY`, `NOTIFY_EMAIL`, `FROM_EMAIL`.
4. Deploy, then open `/api/health`. It must show `"storage":"postgres"`; `ephemeral-file` means submissions will be lost.
5. Custom domain: Vercel > Settings > Domains. Rollback: Vercel > Deployments > promote a previous deployment.
Check that your Vercel plan's terms allow public, commercial and fundraising use.

## After the token launches
Open `/admin` > token. Set status LAUNCHED, the verified mint address and the https://pump.fun/ URL. Market data (DexScreener) and the OHLCV chart (GeckoTerminal) turn on, and the Buy button links to Pump.fun. Verify the mint on-chain first.

## API
- Public: GET `/api/health`, `/api/settings`, `/api/github`, `/api/market`, `/api/market/ohlcv?tf=5m|15m|1h|4h|1d`; POST `/api/submissions`
- Admin (cookie auth): POST `/api/admin/login`, `/api/admin/logout`; GET `/api/admin/me`, `/submissions`, `/settings`, `/audit`; PATCH `/api/admin/submissions/:id`; PUT `/api/admin/settings`

## Known limitations / pending
- Not built yet: documentation center (MDX/PDF), funding records manager, admin editors for careers, partners, contributors and roadmap, newsletter, separate routes per page (this is one page plus /admin), per-page SEO, error monitoring.
- The funding ledger and the evidence table are static data in `src/data` and `src/sections`. Edit them in code for now.
- Rate limiting is in memory per serverless instance. Add an edge or WAF limit for stronger protection.
- Market and OHLCV code is untested against live Solana data (no mint exists yet). Holders and creator rewards have no data source and stay "Not available".
- The GitHub panel publishes commit messages of the configured repo. Use a public repo or accept that they are shown.
- No ESLint or browser test suite configured. Postgres storage and email notification are untested.
