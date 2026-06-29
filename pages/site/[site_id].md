---
title: Site detail
description: Scraper health, alert history, and listing volume for a single monitored website.
---

<div class="not-prose">
  <a href="/" class="back-link">← Overview</a>
</div>

```site_partitions
SELECT DISTINCT s.hub_partition_date::VARCHAR AS hub_partition_date
FROM motherduck.site_daily s
WHERE s.site_id = '${params.site_id}'
ORDER BY hub_partition_date DESC
```

<div class="not-prose dash-toolbar">
<Grid cols=2 gap=md>
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
  END AS status_label
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

<div class="not-prose site-hero">
  <div>
    {#if site_summary[0].status === 'ok'}
      <span class="status-badge status-ok">Healthy</span>
    {:else if site_summary[0].status === 'failed'}
      <span class="status-badge status-failed">Issues detected</span>
    {:else}
      <span class="status-badge status-missing">{site_summary[0].status_label}</span>
    {/if}
    <h1>{site_summary[0].display_name}</h1>
    <p class="site-sub">{site_summary[0].website} · {site_summary[0].country}</p>
  </div>
</div>

<div class="not-prose dash-context">
  <span>Run <strong>{site_summary[0].partition_date}</strong></span>
  <span class="ctx-sep">·</span>
  <span>Listings <strong>{site_summary[0].inspect_date}</strong></span>
</div>

<div class="not-prose dash-kpis site-kpis">
<Grid cols=5 gap=sm>
  <BigValue data={site_summary} value=unique_ads title="Unique ads" fmt=num0 maxWidth="100%" />
  <BigValue data={site_summary} value=r2_file_count title="R2 files" fmt=num0 maxWidth="100%" />
  <BigValue data={site_summary} value=scrapers_passed title="Scrapers passed" maxWidth="100%" />
  <BigValue data={site_summary} value=alert_count title="Alerts" maxWidth="100%" />
  <BigValue data={site_summary} value=pass_pct title="Pass rate" fmt='0.0"%"' maxWidth="100%" />
</Grid>
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
      <p class="meta-value">{site_summary[0].workflow_name}</p>
    </div>
    <div>
      <p class="meta-label">CI status</p>
      <p class="meta-value">{site_summary[0].workflow_status}</p>
    </div>
    <div>
      <p class="meta-label">Duration</p>
      <p class="meta-value">{site_summary[0].workflow_duration_sec}s</p>
    </div>
    <div>
      <p class="meta-label">Repository</p>
      <p class="meta-value">{site_summary[0].github_username}/{site_summary[0].repo}</p>
    </div>
    <div>
      <p class="meta-label">Stale fallback</p>
      <p class="meta-value">{site_summary[0].report_fallback}</p>
    </div>
  </div>
</Details>

<div class="not-prose dash-panel">
<Tabs id="site-tabs" color=primary fullWidth=true>

<Tab label="History" id="history">

<div class="not-prose dash-charts">
<Grid cols=2 gap=md>
  <LineChart
    data={site_history}
    x=hub_partition_date
    y=unique_ads
    title="Unique ads — 30 runs"
    yAxisTitle="Listings"
    yFmt=num0
    chartAreaHeight=220
  />
  <LineChart
    data={site_history}
    x=hub_partition_date
    y=alert_count
    title="Alerts — 30 runs"
    yAxisTitle="Alerts"
    chartAreaHeight=220
  />
</Grid>

<Grid cols=2 gap=md>
  <LineChart
    data={site_history}
    x=hub_partition_date
    y=r2_file_count
    title="R2 files — 30 runs"
    yAxisTitle="Objects"
    yFmt=num0
    chartAreaHeight=200
  />
  <LineChart
    data={site_history}
    x=hub_partition_date
    y=scrapers_passed
    title="Scrapers passed — 30 runs"
    yAxisTitle="Count"
    chartAreaHeight=200
  />
</Grid>
</div>

</Tab>

<Tab label="Scrapers" id="scrapers">

<div class="not-prose stat-line">
  <strong>{site_scrapers.length}</strong> scrapers ·
  <strong>{site_scrapers.filter(d => d.all_passed).length}</strong> all checks passed
</div>

<div class="not-prose dash-table-scroll">
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

<div class="not-prose sev-row">
  <span class="sev-badge sev-critical">Critical <strong>{site_alerts.filter(d => d.severity === 'critical').length}</strong></span>
  <span class="sev-badge sev-high">High <strong>{site_alerts.filter(d => d.severity === 'high').length}</strong></span>
  <span class="sev-badge sev-medium">Medium <strong>{site_alerts.filter(d => d.severity === 'medium').length}</strong></span>
  <span class="sev-badge sev-low">Low <strong>{site_alerts.filter(d => d.severity === 'low').length}</strong></span>
</div>

<div class="not-prose dash-table-scroll">
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
