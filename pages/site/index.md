---
title: All sites
description: Every monitored website. Click a row to open scraper health, alert history, and listing volume for that site.
---

<DashNav active="sites" />

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

<div class="kpi-row cols-3">
  <KpiCard label="Total Sites" value={site_counts[0].total} tone="primary" />
  <KpiCard label="Healthy" value={site_counts[0].healthy} tone="good" />
  <KpiCard label="Need Attention" value={site_counts[0].need_attention} tone="warn" />
</div>

<div class="dash-panel">
<div class="dash-table-wrap">
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
</div>
