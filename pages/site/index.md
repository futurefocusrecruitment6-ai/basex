---
title: All sites
description: Index of site detail pages.
---

<div class="not-prose dash-page">

<header class="dash-page-header">
  <div>
    <h1>All sites</h1>
    <p class="dash-page-desc">Every monitored website. Click a row to open scraper health, alert history, and listing volume for that site.</p>
  </div>
  <div class="dash-page-meta">
    <a href="/" class="dash-back-link" style="margin-bottom:0;">← Overview</a>
  </div>
</header>

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

<div class="not-prose dash-kpi-grid cols-3">
  <div class="dash-kpi-card kpi-neutral">
    <div class="dash-kpi-top">
      <span class="dash-kpi-label">Total sites</span>
      <span class="dash-kpi-icon">◎</span>
    </div>
    <div class="dash-kpi-value">{sites.length}</div>
    <div class="dash-kpi-sub">monitored websites</div>
  </div>
  <div class="dash-kpi-card kpi-success">
    <div class="dash-kpi-top">
      <span class="dash-kpi-label">Healthy</span>
      <span class="dash-kpi-icon">✓</span>
    </div>
    <div class="dash-kpi-value">{sites.filter(d => d.status === 'ok').length}</div>
    <div class="dash-kpi-sub">passing validation</div>
  </div>
  <div class="dash-kpi-card kpi-warning">
    <div class="dash-kpi-top">
      <span class="dash-kpi-label">Need attention</span>
      <span class="dash-kpi-icon">!</span>
    </div>
    <div class="dash-kpi-value">{sites.filter(d => d.status !== 'ok').length}</div>
    <div class="dash-kpi-sub">failed or missing</div>
  </div>
</div>

<div class="not-prose dash-panel" style="padding:0;">
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
</div>
