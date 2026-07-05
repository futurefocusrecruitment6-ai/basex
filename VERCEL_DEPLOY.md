# Deploy Monitor Hub dashboard to Vercel


Step-by-step guide after pushing **Pro1-Os** to GitHub. The Evidence app lives in `dashboard/basex/` — not the repo root.

---

## Prerequisites

Before deploying, confirm the data pipeline is working:

1. **MotherDuck** — database `monitor_hub` exists with tables: `hub_daily`, `site_daily`, `scraper_daily`, `alerts`.
2. **Hub workflow** — `.github/workflows/monitor-hub.yml` runs daily and `push_to_motherduck.py` succeeds.
3. **GitHub secrets** (Pro1-Os repo) — `MOTHERDUCK_TOKEN`, `MOTHERDUCK_DATABASE`, `CF_R2_*` already configured for the hub job.

You need a **MotherDuck service token** with read access to `monitor_hub` (read-only is enough for the dashboard build).

---

## 1. Push the repo to GitHub

```powershell
git add dashboard/basex
git commit -m "Add monitor hub Evidence dashboard"
git push origin main
```

Use your actual branch name if not `main`.

---

## 2. Import the project in Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. **Import** your `Pro1-Os` GitHub repository.
3. On the configure screen, set **Root Directory**:
   - Click **Edit** next to Root Directory.
   - Enter: `dashboard/basex`
   - Confirm — Vercel will use `dashboard/basex/package.json`.

---

## 3. Build settings

Use these values (Vercel usually detects Evidence; verify manually):

| Setting | Value |
|---------|--------|
| **Framework Preset** | Other (or Evidence if listed) |
| **Root Directory** | `dashboard/basex` |
| **Install Command** | `npm install` |
| **Build Command** | `npm run sources && npm run build` |
| **Output Directory** | `build` |
| **Node.js Version** | 18.x or 20.x |

Why `npm run sources`? Evidence pulls MotherDuck data at build time and bakes it into static pages. Without this step, charts and tables will be empty.

---

## 4. Environment variables

In Vercel → **Project → Settings → Environment Variables**, add:

| Name | Value | Environments |
|------|--------|----------------|
| `MOTHERDUCK_TOKEN` | Your MotherDuck service token | Production, Preview, Development |

The database name is fixed in `sources/motherduck/connection.yaml` as `monitor_hub`. If you use a different database, edit that file before deploying.

**Do not** commit the token to git. `.env` is gitignored; only set the token in Vercel (and locally in `.env`).

---

## 5. Deploy

1. Click **Deploy**.
2. Wait for the build log — expect:
   - `npm install`
   - `evidence sources` (MotherDuck connection)
   - `evidence build`
3. Open the production URL (e.g. `https://your-project.vercel.app`).

### Verify after first deploy

- **Overview** (`/`) — KPIs, site table, trends load.
- **Ads** (`/ads`) — unique ads totals appear (after hub has pushed `unique_ads` columns).
- **Site drill-down** — click a site row → `/site/{site_id}`.

If the build fails on `evidence sources`, check:

- Token is valid and has access to `monitor_hub`.
- Tables exist (run hub workflow once or backfill MotherDuck manually).

---

## 6. Optional — daily rebuild after hub ingest

The dashboard is **static at build time**. New MotherDuck data appears only after a **new deploy**.

Hub aggregation runs at **10:00 UTC** (`.github/workflows/monitor-hub.yml`). Schedule a rebuild **after** that, e.g. **10:30 UTC**.

### Option A — Vercel Deploy Hook (recommended)

1. Vercel → **Project → Settings → Git → Deploy Hooks**.
2. Create hook: name `daily-after-hub`, branch `main`.
3. Copy the hook URL.
4. In Pro1-Os → **Settings → Secrets → Actions**, add:
   - `VERCEL_DEPLOY_HOOK` = hook URL
5. Add a step at the end of `monitor-hub.yml`:

```yaml
      - name: Trigger Vercel rebuild
        if: ${{ !inputs.backfill }}
        run: curl -fsS -X POST "${{ secrets.VERCEL_DEPLOY_HOOK }}"
```

### Option B — Vercel Cron (Pro plan)

Add `dashboard/basex/vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/rebuild",
      "schedule": "30 10 * * *"
    }
  ]
}
```

Follow [Evidence + Vercel cron docs](https://docs.evidence.dev/deployment/overview/) if you use this path.

### Option C — Manual

Vercel → **Deployments → Redeploy** after each hub run, or push an empty commit.

---

## 7. Optional — custom domain

1. Vercel → **Project → Settings → Domains**.
2. Add e.g. `monitor.yourdomain.com`.
3. Add the DNS records Vercel shows (CNAME or A).
4. Wait for SSL — usually a few minutes.

---

## 8. Preview deployments

Every PR gets a **Preview** deployment if Vercel is connected to GitHub.

- Set `MOTHERDUCK_TOKEN` for the **Preview** environment too (same as Production).
- Previews use the same MotherDuck data unless you use separate tokens/databases.

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| Build fails at `evidence sources` | Missing/invalid `MOTHERDUCK_TOKEN` | Add token in Vercel env vars |
| Empty charts, build succeeds | No rows in MotherDuck | Run `monitor-hub.yml` or backfill |
| `Horizontal charts do not support... swapXY` | BarChart used numeric `x` with `swapXY=true` | Use `x=display_name` `y=metric` without `swapXY` |
| `/site/[site_id]` prerender error | Crawler did not discover site URLs | Ensure `pages/site/index.md` exists and index links to all `/site/...` pages |
| `needful_things` in build log | Leftover Evidence template source | Delete `sources/needful_things/` |
| Wrong root directory | Wrong root directory | Root must be `dashboard/basex` (or repo root if basex-only repo) |

### Test build locally (same as Vercel)

```powershell
cd dashboard/basex
copy .env.example .env
# Edit .env — paste MOTHERDUCK_TOKEN
npm install
npm run sources
npm run build
npm run preview
```

---

## 10. Checklist

- [ ] Repo pushed to GitHub
- [ ] Vercel project imported with **Root Directory** = `dashboard/basex`
- [ ] Build command = `npm run sources && npm run build`
- [ ] Output directory = `build`
- [ ] `MOTHERDUCK_TOKEN` set in Vercel (Production + Preview)
- [ ] First deploy succeeded
- [ ] Overview / Ads / site pages show data
- [ ] (Optional) Deploy hook wired to `monitor-hub.yml` for daily updates
- [ ] (Optional) Custom domain configured

---

## Related docs

- Local dev: `dashboard/basex/README.md`
- Hub pipeline: `monitor/DASHBOARD_IMPLEMENTATION.md`
- MotherDuck ingest: `.github/workflows/monitor-hub.yml`
