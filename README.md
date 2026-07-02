# Monitor Hub (Evidence)

Professional multi-site operations dashboard — scraper health, alerts, and listing volume.

## Setup

```powershell
npm install
copy .env.example .env
npm run sources
npm run dev
```

Requires MotherDuck credentials with read access to `monitor_hub`.

## Structure

- `pages/index.md` — hub overview
- `pages/ads.md` — unique ads analytics
- `pages/site/[site_id].md` — per-site drill-down
- `pages/+layout.svelte` — app shell (title, width, typography)
- `sources/motherduck/` — SQL sources
- `evidence.config.yaml` — theme and plugins
