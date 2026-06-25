---
title: All sites
description: Index of site detail pages.
---

<div class="not-prose dash-hero">
  <p class="hero-label" style="color: hsl(var(--base-content) / 0.45);">Site directory</p>
  <p class="hero-desc">
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

<div class="not-prose dash-stat-line">
  <strong>{sites.length}</strong> sites ·
  <strong>{sites.filter(d => d.status === 'ok').length}</strong> healthy ·
  <strong>{sites.filter(d => d.status !== 'ok').length}</strong> need attention
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

<div class="not-prose dash-footer">
  <a href="/">← Back to overview</a>
</div>
