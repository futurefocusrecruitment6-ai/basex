---
title: All sites
description: Every monitored website. Click a row to open scraper health, alert history, and listing volume for that site.
---

<div class="not-prose report-nav">
  <a href="/">Overview</a>
  <a href="/ads">Listing volume</a>
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
  s.r2_file_count,
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

```site_counts
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE s.status = 'ok') AS healthy,
  COUNT(*) FILTER (WHERE s.status != 'ok') AS need_attention
FROM motherduck.site_daily s
INNER JOIN (
  SELECT site_id, MAX(hub_partition_date) AS max_date
  FROM motherduck.site_daily
  WHERE site_id IS NOT NULL
  GROUP BY site_id
) latest ON s.site_id = latest.site_id AND s.hub_partition_date = latest.max_date
```

<div class="not-prose dash-kpis cols-3">
<Grid cols=3 gap=md>
  <BigValue data={site_counts} value=total title="Total sites" />
  <BigValue data={site_counts} value=healthy title="Healthy" />
  <BigValue data={site_counts} value=need_attention title="Need attention" />
</Grid>
</div>

<div class="not-prose dash-panel">
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
  <Column id=r2_file_count title="R2 files" fmt=num0 />
  <Column id=last_run title="Last run" />
  <Column id=site_id title="Site ID" />
</DataTable>
</div>
