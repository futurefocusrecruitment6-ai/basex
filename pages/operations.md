---
title: Throughput & errors
description: Daily HTTP request rate and error rate per website and scraper, with day-over-day comparison.
---

<DashNav active="operations" />

```partition_dates
SELECT DISTINCT hub_partition_date::VARCHAR AS hub_partition_date
FROM motherduck.hub_daily
ORDER BY hub_partition_date DESC
```

```country_options
SELECT DISTINCT country
FROM motherduck.site_daily
WHERE country IS NOT NULL
ORDER BY country
```

<div class="dash-filters">
<Grid cols=2 gap=sm>
  <Dropdown name=partition title="Hub run date" data={partition_dates} value=hub_partition_date defaultValue="%">
    <DropdownOption value="%" valueLabel="Latest run" />
  </Dropdown>
  <Dropdown name=country_filter title="Country" data={country_options} value=country multiple selectAllByDefault />
</Grid>
</div>

```ops_kpis
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
),
prev AS (
  SELECT MAX(h.hub_partition_date) AS d
  FROM motherduck.hub_daily h
  CROSS JOIN target t
  WHERE h.hub_partition_date < t.d
)
SELECT
  h.avg_requests_per_min,
  h.avg_error_rate_pct,
  h.total_requests,
  h.total_requests_failed,
  h.hub_partition_date::VARCHAR AS partition_date,
  h.inspect_date::VARCHAR AS inspect_date,
  p.avg_requests_per_min AS prev_avg_requests_per_min,
  p.avg_error_rate_pct AS prev_avg_error_rate_pct,
  CASE
    WHEN p.avg_requests_per_min IS NOT NULL AND p.avg_requests_per_min > 0
    THEN ROUND((h.avg_requests_per_min - p.avg_requests_per_min) / p.avg_requests_per_min * 100.0, 1)
  END AS rpm_change_pct,
  CASE
    WHEN p.avg_error_rate_pct IS NOT NULL
    THEN ROUND(h.avg_error_rate_pct - p.avg_error_rate_pct, 2)
  END AS error_rate_change_pts
FROM motherduck.hub_daily h
CROSS JOIN target t
LEFT JOIN motherduck.hub_daily p ON p.hub_partition_date = (SELECT d FROM prev)
WHERE h.hub_partition_date = t.d
```

```ops_trend
SELECT
  h.hub_partition_date,
  h.avg_requests_per_min,
  h.avg_error_rate_pct,
  h.total_requests,
  h.total_requests_failed
FROM motherduck.hub_daily h
WHERE h.avg_requests_per_min IS NOT NULL
ORDER BY h.hub_partition_date
```

```ops_by_site
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
),
with_prev AS (
  SELECT
    s.*,
    LAG(s.requests_per_min) OVER (PARTITION BY s.site_id ORDER BY s.hub_partition_date) AS prev_rpm,
    LAG(s.error_rate_pct) OVER (PARTITION BY s.site_id ORDER BY s.hub_partition_date) AS prev_error_rate
  FROM motherduck.site_daily s
  WHERE s.requests_per_min IS NOT NULL OR s.error_rate_pct IS NOT NULL
)
SELECT
  w.hub_partition_date,
  w.display_name,
  w.country,
  w.website,
  w.repo,
  w.requests_per_min,
  w.error_rate_pct,
  w.requests_total,
  w.requests_failed,
  w.scrapers_failed,
  w.scrapers_passed,
  w.scrapers_total,
  w.status,
  w.uses_proxy,
  CASE
    WHEN w.uses_proxy = true THEN 'Proxy'
    WHEN w.uses_proxy = false THEN 'Direct'
    ELSE 'Unknown'
  END AS proxy_label,
  w.prev_rpm,
  w.prev_error_rate,
  CASE
    WHEN w.prev_rpm IS NOT NULL AND w.prev_rpm > 0
    THEN ROUND((w.requests_per_min - w.prev_rpm) / w.prev_rpm * 100.0, 1)
  END AS rpm_change_pct,
  CASE
    WHEN w.prev_error_rate IS NOT NULL
    THEN ROUND(w.error_rate_pct - w.prev_error_rate, 2)
  END AS error_rate_change_pts,
  '/site/' || w.site_id AS site_link
FROM with_prev w
CROSS JOIN target t
WHERE w.hub_partition_date = t.d
  AND w.country IN ${inputs.country_filter.value}
ORDER BY w.requests_per_min DESC NULLS LAST
```

```ops_by_scraper
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
),
with_prev AS (
  SELECT
    sc.*,
    LAG(sc.requests_per_min) OVER (
      PARTITION BY sc.site_id, sc.scraper ORDER BY sc.hub_partition_date
    ) AS prev_rpm,
    LAG(sc.error_rate_pct) OVER (
      PARTITION BY sc.site_id, sc.scraper ORDER BY sc.hub_partition_date
    ) AS prev_error_rate
  FROM motherduck.scraper_daily sc
  WHERE sc.requests_per_min IS NOT NULL OR sc.error_rate_pct IS NOT NULL
)
SELECT
  s.display_name,
  s.country,
  w.scraper,
  w.requests_per_min,
  w.error_rate_pct,
  w.requests_total,
  w.requests_failed,
  w.duration_sec,
  w.metrics_source,
  w.failed_items_summary,
  w.all_passed,
  w.prev_rpm,
  CASE
    WHEN w.prev_rpm IS NOT NULL AND w.prev_rpm > 0
    THEN ROUND((w.requests_per_min - w.prev_rpm) / w.prev_rpm * 100.0, 1)
  END AS rpm_change_pct,
  CASE
    WHEN w.prev_error_rate IS NOT NULL
    THEN ROUND(w.error_rate_pct - w.prev_error_rate, 2)
  END AS error_rate_change_pts
FROM with_prev w
JOIN motherduck.site_daily s
  ON w.hub_partition_date = s.hub_partition_date
 AND w.site_id = s.site_id
CROSS JOIN target t
WHERE w.hub_partition_date = t.d
  AND s.country IN ${inputs.country_filter.value}
ORDER BY w.requests_per_min DESC NULLS LAST
```

```ops_failed_scrapers
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
)
SELECT
  s.display_name,
  s.country,
  sc.scraper,
  sc.all_passed,
  sc.requests_failed,
  sc.error_rate_pct,
  sc.failed_items_summary,
  sc.files_found,
  sc.checks_passed,
  sc.checks_total
FROM motherduck.scraper_daily sc
JOIN motherduck.site_daily s
  ON sc.hub_partition_date = s.hub_partition_date
 AND sc.site_id = s.site_id
CROSS JOIN target t
WHERE sc.hub_partition_date = t.d
  AND s.country IN ${inputs.country_filter.value}
  AND sc.all_passed = FALSE
ORDER BY s.display_name, sc.scraper
```

<div class="dash-meta">
  <span>Run date <strong>{ops_kpis[0].partition_date}</strong></span>
  <span class="sep">·</span>
  <span>Listings as of <strong>{ops_kpis[0].inspect_date ?? '—'}</strong></span>
  <span class="sep">·</span>
  <span><strong>{ops_kpis[0].total_requests?.toLocaleString() ?? '—'}</strong> HTTP requests</span>
</div>

<div class="kpi-row cols-4">
  <KpiCard label="Avg req/min (hub)" value={ops_kpis[0].avg_requests_per_min?.toFixed(1) ?? '—'} tone="primary" />
  <KpiCard
    label="Req/min vs yesterday"
    value={ops_kpis[0].rpm_change_pct != null ? `${ops_kpis[0].rpm_change_pct > 0 ? '+' : ''}${ops_kpis[0].rpm_change_pct}%` : '—'}
    tone="neutral"
  />
  <KpiCard label="HTTP error rate %" value={ops_kpis[0].avg_error_rate_pct != null ? `${ops_kpis[0].avg_error_rate_pct}%` : '—'} tone="warn" />
  <KpiCard
    label="Error rate vs yesterday"
    value={ops_kpis[0].error_rate_change_pts != null ? `${ops_kpis[0].error_rate_change_pts > 0 ? '+' : ''}${ops_kpis[0].error_rate_change_pts} pts` : '—'}
    tone="neutral"
  />
</div>

<div class="chart-row">
  <div class="chart-panel">
  <LineChart
    data={ops_trend}
    x=hub_partition_date
    y=avg_requests_per_min
    title="Hub avg req/min — all history"
    yAxisTitle="Requests / min"
    yFmt=num1
    chartAreaHeight=240
    echartsOptions={{ backgroundColor: 'transparent' }}
  />
  </div>
  <div class="chart-panel">
  <LineChart
    data={ops_trend}
    x=hub_partition_date
    y=avg_error_rate_pct
    title="Hub HTTP error rate — all history"
    yAxisTitle="Error rate %"
    yFmt=num2
    chartAreaHeight=240
    echartsOptions={{ backgroundColor: 'transparent' }}
  />
  </div>
</div>

<div class="dash-panel">
<Tabs id="ops-tabs" color=primary fullWidth=true>

<Tab label="By website" id="by-site">

<div class="stat-line">
  <strong>{ops_by_site.length}</strong> websites · sorted by req/min descending
</div>

<div class="dash-table-wrap">
<DataTable
  data={ops_by_site}
  link=site_link
  search=true
  rows=25
  emptySet=pass
  emptyMessage="No request metrics yet — scrapers must emit request_metrics in daily JSON summaries."
>
  <Column id=display_name title="Website" />
  <Column id=country />
  <Column id=proxy_label title="Proxy" />
  <Column id=repo title="Repo" />
  <Column id=requests_per_min title="Req/min" fmt=num1 />
  <Column id=rpm_change_pct title="Δ vs yesterday" fmt=pct1 contentType=delta />
  <Column id=error_rate_pct title="Error rate %" fmt=num2 />
  <Column id=error_rate_change_pts title="Δ error (pts)" fmt=num2 contentType=delta />
  <Column id=requests_total title="Requests" fmt=num0 />
  <Column id=requests_failed title="Failed" fmt=num0 />
  <Column id=scrapers_failed title="Scrapers failed" />
  <Column id=status title="Status" />
</DataTable>
</div>

</Tab>

<Tab label="By scraper" id="by-scraper">

<div class="stat-line">
  <strong>{ops_by_scraper.length}</strong> scrapers reporting metrics ·
  <strong>{ops_by_scraper.filter(d => !d.all_passed).length}</strong> validation failed
</div>

<div class="dash-table-wrap">
<DataTable
  data={ops_by_scraper}
  search=true
  rows=30
  emptySet=pass
  emptyMessage="No scraper-level metrics available."
>
  <Column id=display_name title="Website" />
  <Column id=scraper title="Category / scraper" />
  <Column id=requests_per_min title="Req/min" fmt=num1 />
  <Column id=rpm_change_pct title="Δ vs yesterday" fmt=pct1 contentType=delta />
  <Column id=error_rate_pct title="Error rate %" fmt=num2 />
  <Column id=error_rate_change_pts title="Δ error (pts)" fmt=num2 contentType=delta />
  <Column id=requests_total title="Requests" fmt=num0 />
  <Column id=requests_failed title="Failed" fmt=num0 />
  <Column id=failed_items_summary title="Who failed" />
  <Column id=metrics_source title="Source" />
  <Column id=all_passed title="Passed?" />
</DataTable>
</div>

</Tab>

<Tab label="Failed scrapers" id="failed">

<div class="stat-line">
  <strong>{ops_failed_scrapers.length}</strong> scrapers failed validation or reported HTTP errors
</div>

<div class="dash-table-wrap">
<DataTable
  data={ops_failed_scrapers}
  search=true
  rows=30
  emptySet=pass
  emptyMessage="All scrapers passed validation for this run."
>
  <Column id=display_name title="Website" />
  <Column id=scraper />
  <Column id=files_found title="Files" />
  <Column id=checks_passed title="Checks OK" />
  <Column id=checks_total title="Checks" />
  <Column id=requests_failed title="HTTP errors" fmt=num0 />
  <Column id=error_rate_pct title="Error rate %" fmt=num2 />
  <Column id=failed_items_summary title="Failure detail" />
</DataTable>
</div>

</Tab>

</Tabs>
</div>

<div class="dash-footer">
  Metrics source: daily JSON summary <code>request_metrics</code> block · day-over-day via SQL <code>LAG()</code> on prior hub partition.
</div>
