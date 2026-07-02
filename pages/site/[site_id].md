---
title: Site detail
description: Scraper health, alert history, and listing volume for a single monitored website.
---

<a href="/" class="back-link">← Overview</a>

```site_partitions
SELECT DISTINCT s.hub_partition_date::VARCHAR AS hub_partition_date
FROM motherduck.site_daily s
WHERE s.site_id = '${params.site_id}'
ORDER BY hub_partition_date DESC
```

<div class="dash-filters">
<Grid cols=2 gap=sm>
  <Dropdown name=partition title="Hub run date" data={site_partitions} value=hub_partition_date defaultValue="%">
    <DropdownOption value="%" valueLabel="Latest run" />
  </Dropdown>
</Grid>
</div>

```site_summary
WITH target AS (
  SELECT MAX(s.hub_partition_date) AS d
  FROM motherduck.site_daily s
  WHERE s.site_id = '${params.site_id}'
    AND s.hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
)
SELECT
  s.display_name,
  s.website,
  s.country,
  s.repo,
  s.github_username,
  s.run_place,
  s.schedule,
  s.status,
  s.scrapers_passed,
  s.scrapers_total,
  s.alert_count,
  s.unique_ads,
  s.r2_file_count,
  s.workflow_name,
  s.workflow_status,
  s.workflow_duration_sec,
  s.workflow_run_number,
  s.workflow_run_id,
  s.report_fallback,
  s.uses_proxy,
  s.hub_partition_date::VARCHAR AS partition_date,
  s.inspect_date::VARCHAR AS inspect_date,
  ROUND(100.0 * s.scrapers_passed / NULLIF(s.scrapers_total, 0), 1) AS pass_pct,
  CASE
    WHEN s.github_username IS NOT NULL AND s.repo IS NOT NULL
    THEN 'https://github.com/' || s.github_username || '/' || s.repo
  END AS github_repo_url,
  CASE s.status
    WHEN 'ok' THEN 'Healthy'
    WHEN 'failed' THEN 'Issues detected'
    WHEN 'missing' THEN 'Report missing'
    ELSE s.status
  END AS status_label,
  COALESCE(
    NULLIF(s.workflow_name, ''),
    CASE WHEN COALESCE(s.run_place, 'github') = 'github' THEN 'Schema Monitor' ELSE 'monitor' END
  ) AS workflow_name_label,
  COALESCE(
    NULLIF(s.workflow_status, ''),
    CASE s.status WHEN 'ok' THEN 'success' WHEN 'failed' THEN 'failure' END,
    '—'
  ) AS workflow_status_label,
  CASE
    WHEN s.workflow_duration_sec IS NOT NULL
    THEN s.workflow_duration_sec::VARCHAR || 's'
    ELSE '—'
  END AS workflow_duration_label
FROM motherduck.site_daily s
CROSS JOIN target t
WHERE s.site_id = '${params.site_id}'
  AND s.hub_partition_date = t.d
```

```site_scrapers
WITH target AS (
  SELECT MAX(s.hub_partition_date) AS d
  FROM motherduck.site_daily s
  WHERE s.site_id = '${params.site_id}'
    AND s.hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
)
SELECT
  sc.scraper,
  sc.files_found,
  sc.checks_passed,
  sc.checks_total,
  sc.all_passed,
  sc.files_optional,
  sc.unique_ads,
  sc.total_rows,
  sc.ads_source,
  sc.r2_file_count
FROM motherduck.scraper_daily sc
CROSS JOIN target t
WHERE sc.site_id = '${params.site_id}'
  AND sc.hub_partition_date = t.d
ORDER BY sc.unique_ads DESC NULLS LAST, sc.scraper
```

```site_alerts
WITH target AS (
  SELECT MAX(s.hub_partition_date) AS d
  FROM motherduck.site_daily s
  WHERE s.site_id = '${params.site_id}'
    AND s.hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
)
SELECT
  a.scraper,
  a.severity,
  a.alert_type,
  a.check_name,
  a.detail,
  a.file_key
FROM motherduck.alerts a
CROSS JOIN target t
WHERE a.site_id = '${params.site_id}'
  AND a.hub_partition_date = t.d
ORDER BY
  CASE a.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
  a.scraper
```

```site_history
SELECT
  s.hub_partition_date,
  s.status,
  s.scrapers_passed,
  s.scrapers_total,
  s.alert_count,
  s.unique_ads,
  s.r2_file_count,
  s.workflow_status,
  s.workflow_duration_sec
FROM motherduck.site_daily s
WHERE s.site_id = '${params.site_id}'
ORDER BY s.hub_partition_date DESC
LIMIT 30
```

```site_http_history
SELECT
  s.hub_partition_date,
  COALESCE(s.requests_total, 0) AS requests_total,
  COALESCE(s.requests_failed, 0) AS requests_failed,
  CASE
    WHEN COALESCE(s.requests_total, 0) > 0 THEN
      ROUND(100.0 * COALESCE(s.requests_failed, 0) / COALESCE(s.requests_total, 0), 2)
    ELSE 0
  END AS error_rate_pct,
  COALESCE(s.requests_per_min, 0) AS requests_per_min
FROM motherduck.site_daily s
WHERE s.site_id = '${params.site_id}'
ORDER BY s.hub_partition_date DESC
LIMIT 30
```

<div class="site-header">
  <div>
    <div class="site-header__badges">
      {#if site_summary[0].status === 'ok'}
        <span class="badge badge-good">Healthy</span>
      {:else if site_summary[0].status === 'failed'}
        <span class="badge badge-bad">Issues detected</span>
      {:else}
        <span class="badge badge-warn">{site_summary[0].status_label}</span>
      {/if}
      <ProxyBadge uses_proxy={site_summary[0].uses_proxy} />
    </div>
    <h1>{site_summary[0].display_name}</h1>
    <p class="sub">{site_summary[0].website} · {site_summary[0].country}</p>
  </div>
</div>

<div class="dash-meta">
  <span>Run date <strong>{site_summary[0].partition_date}</strong></span>
  <span class="sep">·</span>
  <span>Listings as of <strong>{site_summary[0].inspect_date ?? '—'}</strong></span>
</div>

<div class="kpi-row cols-5">
  <KpiCard label="Unique Ads" value={site_summary[0].unique_ads?.toLocaleString()} tone="primary" />
  <KpiCard label="R2 Files" value={site_summary[0].r2_file_count?.toLocaleString()} tone="neutral" />
  <KpiCard label="Scrapers Passed" value={site_summary[0].scrapers_passed} tone="good" />
  <KpiCard label="Alerts" value={site_summary[0].alert_count} tone="bad" />
  <KpiCard label="Pass Rate" value="{site_summary[0].pass_pct}%" tone="good" />
</div>

<Details title="Run metadata">
  <div class="not-prose meta-grid">
    <div>
      <p class="meta-label">Run place</p>
      <p class="meta-value">{site_summary[0].run_place}</p>
    </div>
    <div>
      <p class="meta-label">Schedule</p>
      <p class="meta-value">{site_summary[0].schedule}</p>
    </div>
    <div>
      <p class="meta-label">Workflow</p>
      <p class="meta-value">{site_summary[0].workflow_name_label}</p>
    </div>
    <div>
      <p class="meta-label">CI status</p>
      <p class="meta-value">{site_summary[0].workflow_status_label}</p>
    </div>
    <div>
      <p class="meta-label">Duration</p>
      <p class="meta-value">{site_summary[0].workflow_duration_label}</p>
    </div>
    <div>
      <p class="meta-label">Repository</p>
      <p class="meta-value">{site_summary[0].github_username}/{site_summary[0].repo}</p>
    </div>
    <div>
      <p class="meta-label">HTTP proxy</p>
      <p class="meta-value"><ProxyBadge uses_proxy={site_summary[0].uses_proxy} /></p>
    </div>
    <div>
      <p class="meta-label">Stale fallback</p>
      <p class="meta-value">{site_summary[0].report_fallback}</p>
    </div>
  </div>
</Details>

<div class="dash-panel">
<Tabs id="site-tabs" color=primary fullWidth=true>

<Tab label="History" id="history">

<div class="chart-row">
  <div class="chart-panel">
  <LineChart
    data={site_history}
    x=hub_partition_date
    y=unique_ads
    title="Unique ads — 30 runs"
    yAxisTitle="Listings"
    yFmt=num0
    chartAreaHeight=220
    echartsOptions={{ backgroundColor: 'transparent' }}
  />
  </div>
  <div class="chart-panel">
  <LineChart
    data={site_history}
    x=hub_partition_date
    y=alert_count
    title="Alerts — 30 runs"
    yAxisTitle="Alerts"
    chartAreaHeight=220
    echartsOptions={{ backgroundColor: 'transparent' }}
  />
  </div>
</div>

<div class="chart-row">
  <div class="chart-panel">
  <LineChart
    data={site_history}
    x=hub_partition_date
    y=r2_file_count
    title="R2 files — 30 runs"
    yAxisTitle="Objects"
    yFmt=num0
    chartAreaHeight=200
    echartsOptions={{ backgroundColor: 'transparent' }}
  />
  </div>
  <div class="chart-panel">
  <LineChart
    data={site_history}
    x=hub_partition_date
    y=scrapers_passed
    title="Scrapers passed — 30 runs"
    yAxisTitle="Count"
    chartAreaHeight=200
    echartsOptions={{ backgroundColor: 'transparent' }}
  />
  </div>
</div>

<div class="chart-row">
  <div class="chart-panel">
  <LineChart
    data={site_http_history}
    x=hub_partition_date
    y=requests_per_min
    title="Request rate — 30 runs"
    yAxisTitle="Req/min"
    chartAreaHeight=220
    echartsOptions={{ backgroundColor: 'transparent' }}
  />
  </div>
  <div class="chart-panel">
  <LineChart
    data={site_http_history}
    x=hub_partition_date
    y=error_rate_pct
    title="Error rate — 30 runs"
    yAxisTitle="Error %"
    chartAreaHeight=220
    echartsOptions={{ backgroundColor: 'transparent' }}
  />
  </div>
</div>

</Tab>

<Tab label="Scrapers" id="scrapers">

<div class="not-prose stat-line">
  <strong>{site_scrapers.length}</strong> scrapers ·
  <strong>{site_scrapers.filter(d => d.all_passed).length}</strong> all checks passed
</div>

<div class="dash-table-wrap">
<DataTable
  data={site_scrapers}
  search=true
  rows=all
  emptySet=pass
  emptyMessage="No scraper data for this partition."
>
  <Column id=scraper />
  <Column id=unique_ads title="Unique ads" fmt=num0 />
  <Column id=r2_file_count title="R2 files" fmt=num0 />
  <Column id=ads_source title="Source" />
  <Column id=files_found title="Files" />
  <Column id=checks_passed title="Passed" />
  <Column id=checks_total title="Total" />
  <Column id=all_passed title="All OK?" />
  <Column id=files_optional title="Optional?" />
</DataTable>
</div>

</Tab>

<Tab label="Alerts" id="alerts">

<div class="sev-row">
  <span class="badge badge-bad">Critical <strong>{site_alerts.filter(d => d.severity === 'critical').length}</strong></span>
  <span class="badge badge-warn">High <strong>{site_alerts.filter(d => d.severity === 'high').length}</strong></span>
  <span class="badge badge-warn">Medium <strong>{site_alerts.filter(d => d.severity === 'medium').length}</strong></span>
  <span class="badge">Low <strong>{site_alerts.filter(d => d.severity === 'low').length}</strong></span>
</div>

<div class="dash-table-wrap">
<DataTable
  data={site_alerts}
  search=true
  rows=all
  emptySet=pass
  emptyMessage="No alerts — all validation checks passed."
>
  <Column id=scraper />
  <Column id=severity />
  <Column id=alert_type title="Type" />
  <Column id=check_name title="Check" />
  <Column id=detail />
  <Column id=file_key title="File" />
</DataTable>
</div>

</Tab>

</Tabs>
</div>
