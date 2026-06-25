---
title: Site detail
---

<div class="not-prose">
  <a href="/" class="dash-back-link">← Back to overview</a>
</div>

```site_partitions
SELECT DISTINCT s.hub_partition_date::VARCHAR AS hub_partition_date
FROM motherduck.site_daily s
WHERE s.site_id = '${params.site_id}'
ORDER BY hub_partition_date DESC
```

<div class="not-prose dash-filter-bar">
  <p class="filter-label">Run selector</p>
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
  sc.ads_source
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
  s.workflow_status,
  s.workflow_duration_sec
FROM motherduck.site_daily s
WHERE s.site_id = '${params.site_id}'
ORDER BY s.hub_partition_date DESC
LIMIT 30
```

<div class="not-prose dash-site-header">
  <div style="display:flex; flex-wrap:wrap; align-items:flex-start; justify-content:space-between; gap:1rem;">
    <div>
      <div style="margin-bottom:0.625rem;">
        {#if site_summary[0].status === 'ok'}
          <span class="status-badge status-ok">● Healthy</span>
        {:else if site_summary[0].status === 'failed'}
          <span class="status-badge status-failed">● Issues detected</span>
        {:else}
          <span class="status-badge status-missing">● {site_summary[0].status_label}</span>
        {/if}
      </div>
      <h1 style="font-size:1.75rem; font-weight:800; letter-spacing:-0.035em; color:var(--base-content); margin:0; line-height:1.15;">{site_summary[0].display_name}</h1>
      <p style="font-size:0.875rem; color:hsl(var(--twc-base-content) / 0.5); margin-top:0.375rem;">
        {site_summary[0].website} · {site_summary[0].country}
      </p>
    </div>
    <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
      <span class="dash-meta-pill">Run <strong>{site_summary[0].partition_date}</strong></span>
      <span class="dash-meta-pill">Listings <strong>{site_summary[0].inspect_date}</strong></span>
    </div>
  </div>
</div>

<div class="not-prose dash-kpi-grid">
  <div class="dash-kpi-card kpi-info">
    <div class="dash-kpi-top">
      <span class="dash-kpi-label">Unique ads</span>
      <span class="dash-kpi-icon">#</span>
    </div>
    <div class="dash-kpi-value">{site_summary[0].unique_ads.toLocaleString()}</div>
    <div class="dash-kpi-sub">latest run</div>
  </div>
  <div class="dash-kpi-card kpi-success">
    <div class="dash-kpi-top">
      <span class="dash-kpi-label">Scrapers passed</span>
      <span class="dash-kpi-icon">✓</span>
    </div>
    <div class="dash-kpi-value">{site_summary[0].scrapers_passed}<span style="font-size:1rem; font-weight:600; color:hsl(var(--twc-base-content)/0.4);">/{site_summary[0].scrapers_total}</span></div>
    <div class="dash-kpi-sub">{site_summary[0].pass_pct}% pass rate</div>
  </div>
  <div class="dash-kpi-card kpi-warning">
    <div class="dash-kpi-top">
      <span class="dash-kpi-label">Alerts</span>
      <span class="dash-kpi-icon">!</span>
    </div>
    <div class="dash-kpi-value">{site_summary[0].alert_count}</div>
    <div class="dash-kpi-sub">validation failures</div>
  </div>
  <div class="dash-kpi-card kpi-neutral">
    <div class="dash-kpi-top">
      <span class="dash-kpi-label">CI duration</span>
      <span class="dash-kpi-icon">⏱</span>
    </div>
    <div class="dash-kpi-value">{site_summary[0].workflow_duration_sec}<span style="font-size:1rem; font-weight:600; color:hsl(var(--twc-base-content)/0.4);">s</span></div>
    <div class="dash-kpi-sub">{site_summary[0].workflow_status}</div>
  </div>
</div>

<Details title="Run metadata">
  <div class="not-prose dash-panel dash-panel-padded" style="border:none; box-shadow:none; padding:0;">
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:1.25rem 2rem; font-size:0.8125rem;">
      <div>
        <p class="dash-section-label">Run place</p>
        <p style="font-weight:600; color:var(--base-content); margin:0;">{site_summary[0].run_place}</p>
      </div>
      <div>
        <p class="dash-section-label">Schedule</p>
        <p style="font-weight:600; color:var(--base-content); margin:0;">{site_summary[0].schedule}</p>
      </div>
      <div>
        <p class="dash-section-label">Workflow</p>
        <p style="font-weight:600; color:var(--base-content); margin:0;">{site_summary[0].workflow_name}</p>
      </div>
      <div>
        <p class="dash-section-label">CI status</p>
        <p style="font-weight:600; color:var(--base-content); margin:0;">{site_summary[0].workflow_status}</p>
      </div>
      <div>
        <p class="dash-section-label">Duration</p>
        <p style="font-weight:600; color:var(--base-content); margin:0;">{site_summary[0].workflow_duration_sec}s</p>
      </div>
      <div>
        <p class="dash-section-label">Repository</p>
        <p style="font-weight:600; color:var(--base-content); margin:0;">{site_summary[0].github_username}/{site_summary[0].repo}</p>
      </div>
      <div>
        <p class="dash-section-label">Stale fallback</p>
        <p style="font-weight:600; color:var(--base-content); margin:0;">{site_summary[0].report_fallback}</p>
      </div>
    </div>
  </div>
</Details>

<Tabs id="site-tabs" color=primary fullWidth=true>

<Tab label="History" id="history">

<div class="not-prose dash-tab-panel">

<Grid cols=2 gap=lg>
  <div class="dash-chart-card">
    <LineChart
      data={site_history}
      x=hub_partition_date
      y=unique_ads
      title="Unique ads — 30 runs"
      yAxisTitle="Listings"
      yFmt=num0
    />
  </div>
  <div class="dash-chart-card">
    <LineChart
      data={site_history}
      x=hub_partition_date
      y=alert_count
      title="Alerts — 30 runs"
      yAxisTitle="Alerts"
    />
  </div>
</Grid>

<div class="dash-chart-card" style="margin-top:1rem;">
  <LineChart
    data={site_history}
    x=hub_partition_date
    y=scrapers_passed
    title="Scrapers passed — 30 runs"
    yAxisTitle="Count"
  />
</div>

</div>

</Tab>

<Tab label="Scrapers" id="scrapers">

<div class="not-prose dash-tab-panel">

<div class="dash-stat-line">
  <strong>{site_scrapers.length}</strong> scrapers ·
  <strong>{site_scrapers.filter(d => d.all_passed).length}</strong> all checks passed
</div>

<DataTable
  data={site_scrapers}
  search=true
  rows=all
  emptySet=pass
  emptyMessage="No scraper data for this partition."
>
  <Column id=scraper />
  <Column id=unique_ads title="Unique ads" fmt=num0 />
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

<div class="not-prose dash-tab-panel">

<div class="not-prose" style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
  <span class="sev-badge sev-critical">Critical <strong>{site_alerts.filter(d => d.severity === 'critical').length}</strong></span>
  <span class="sev-badge sev-high">High <strong>{site_alerts.filter(d => d.severity === 'high').length}</strong></span>
  <span class="sev-badge sev-medium">Medium <strong>{site_alerts.filter(d => d.severity === 'medium').length}</strong></span>
  <span class="sev-badge sev-low">Low <strong>{site_alerts.filter(d => d.severity === 'low').length}</strong></span>
</div>

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
