---
title: All sites
description: Index of site detail pages (used for static build).
---

<div class="not-prose mb-8 rounded-2xl border border-base-300/80 bg-gradient-to-br from-base-200/60 via-base-100 to-base-200/30 px-6 py-5 shadow-sm">
  <p class="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-1">Site directory</p>
  <p class="text-base text-base-content/70 max-w-3xl leading-relaxed">
    All monitored websites. Click a row to open scraper health, alert history, and listing volume for that site.
  </p>
</div>

```sites
SELECT
  s.site_id,
  s.display_name,
  s.country,
  s.status,
  CASE
    WHEN s.status = 'ok' THEN 'Healthy'
    WHEN s.status = 'failed' THEN 'Issues'
    WHEN s.status = 'missing' THEN 'No report'
    ELSE s.status
  END AS status_label,
  s.hub_partition_date::VARCHAR AS last_run,
  s.unique_ads,
  '/site/' || s.site_id AS site_link
FROM motherduck.site_daily s
INNER JOIN (
  SELECT site_id, MAX(hub_partition_date) AS max_date
  FROM motherduck.site_daily
  WHERE site_id IS NOT NULL
  GROUP BY site_id
) latest ON s.site_id = latest.site_id AND s.hub_partition_date = latest.max_date
ORDER BY s.display_name
```

<div class="not-prose mb-4 text-sm text-base-content/60">
  <strong class="text-base-content">{sites.length}</strong> sites ·
  <strong class="text-base-content">{sites.filter(d => d.status === 'ok').length}</strong> healthy ·
  <strong class="text-base-content">{sites.filter(d => d.status !== 'ok').length}</strong> need attention
</div>

<DataTable
  data={sites}
  link=site_link
  search=true
  rows=all
  emptySet=pass
  emptyMessage="No sites in MotherDuck yet."
>
  <Column id=display_name title="Site" />
  <Column id=country />
  <Column id=status_label title="Status" />
  <Column id=unique_ads title="Unique ads" fmt=num0 />
  <Column id=last_run title="Last run" />
  <Column id=site_id title="Site ID" />
</DataTable>

<p class="text-xs text-base-content/50 mt-6">
  <a href="/">← Back to overview</a>
</p>
