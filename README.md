# Monitor Hub (Evidence)

Professional multi-site operations dashboard — scraper health, alerts, and listing volume.

## Setup

```powershell
npm install
copy .env.example .env
npm run sources
npm run dev
```

Requires MotherDuck credentials with access to `monitor_hub` (read-write if you use Solved checkboxes).

## Structure

- `pages/index.md` — hub overview
- `pages/ads.md` — unique ads analytics
- `pages/site/[site_id].md` — per-site drill-down
- `pages/+layout.svelte` — app shell (title, width, typography)
- `components/AlertsTable.svelte` — alerts table with shared Solved checkbox
- `api/alerts/solved.js` — Vercel function that updates MotherDuck `alerts.solved`
- `sources/motherduck/` — SQL sources
- `evidence.config.yaml` — theme and plugins

### Solved checkboxes

Marking an alert Solved writes to MotherDuck via `/api/alerts/solved` (shared across the team). That API runs on Vercel; for local write-testing use `vercel dev` (plain `npm run dev` only serves the Evidence UI).
