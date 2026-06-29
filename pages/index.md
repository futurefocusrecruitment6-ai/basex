---
title: Overview
description: Daily validation results from every website in the hub. Filter by country, site, or run status — then drill into a site for scraper-level detail.
---

<div class="not-prose report-nav">
  <a href="/ads">Listing volume</a>
  <a href="/site">All sites</a>
</div>

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

```site_options
SELECT DISTINCT site_id, display_name
FROM motherduck.site_daily
ORDER BY display_name
```

```run_place_options
SELECT DISTINCT COALESCE(run_place, 'github') AS run_place
FROM motherduck.site_daily
ORDER BY 1
```

```status_options
SELECT DISTINCT status
FROM motherduck.site_daily
WHERE status IS NOT NULL
ORDER BY status
```

<div class="not-prose dash-toolbar">
<Grid cols=5 gap=sm>
  <Dropdown name=partition title="Hub run date" data={partition_dates} value=hub_partition_date defaultValue="%">
    <DropdownOption value="%" valueLabel="Latest run" />
  </Dropdown>
  <Dropdown name=country_filter title="Country" data={country_options} value=country multiple selectAllByDefault />
  <Dropdown name=site_filter title="Site" data={site_options} value=site_id label=display_name multiple selectAllByDefault />
  <Dropdown name=run_place_filter title="Run place" data={run_place_options} value=run_place multiple selectAllByDefault />
  <Dropdown name=status_filter title="Status" data={status_options} value=status multiple selectAllByDefault />
</Grid>
</div>

```hub_kpis
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
)
SELECT
  COUNT(*) FILTER (WHERE s.status = 'ok') AS sites_ok,
  COALESCE(SUM(s.alert_count), 0) AS total_alerts,
  COUNT(*) FILTER (WHERE s.status = 'missing') AS sites_missing,
  COUNT(*) FILTER (WHERE s.status = 'failed') AS sites_failed,
  COUNT(*) AS sites_shown,
  COALESCE(SUM(s.unique_ads), 0) AS total_unique_ads,
  COALESCE(SUM(s.r2_file_count), 0) AS total_r2_files,
  MAX(s.hub_partition_date)::VARCHAR AS partition_date,
  MAX(s.inspect_date)::VARCHAR AS inspect_date
FROM motherduck.site_daily s
CROSS JOIN target t
WHERE s.hub_partition_date = t.d
  AND s.country IN ${inputs.country_filter.value}
  AND s.site_id IN ${inputs.site_filter.value}
  AND COALESCE(s.run_place, 'github') IN ${inputs.run_place_filter.value}
  AND s.status IN ${inputs.status_filter.value}
```

```sites_filtered
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
)
SELECT
  s.*,
  s.scrapers_total - s.scrapers_passed AS scrapers_failed,
  ROUND(100.0 * s.scrapers_passed / NULLIF(s.scrapers_total, 0), 1) AS pass_pct,
  '/site/' || s.site_id AS site_link,
  CASE
    WHEN s.github_username IS NOT NULL AND s.repo IS NOT NULL
    THEN 'https://github.com/' || s.github_username || '/' || s.repo
  END AS github_repo_url,
  CASE s.status
    WHEN 'ok' THEN 'Healthy'
    WHEN 'failed' THEN 'Issues'
    WHEN 'missing' THEN 'No report'
    ELSE s.status
  END AS status_label
FROM motherduck.site_daily s
CROSS JOIN target t
WHERE s.hub_partition_date = t.d
  AND s.country IN ${inputs.country_filter.value}
  AND s.site_id IN ${inputs.site_filter.value}
  AND COALESCE(s.run_place, 'github') IN ${inputs.run_place_filter.value}
  AND s.status IN ${inputs.status_filter.value}
ORDER BY s.alert_count DESC, s.display_name
```

```alert_trend
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
),
site_scope AS (
  SELECT DISTINCT site_id
  FROM motherduck.site_daily s
  CROSS JOIN target t
  WHERE s.hub_partition_date = t.d
    AND s.country IN ${inputs.country_filter.value}
    AND s.site_id IN ${inputs.site_filter.value}
    AND COALESCE(s.run_place, 'github') IN ${inputs.run_place_filter.value}
    AND s.status IN ${inputs.status_filter.value}
)
SELECT
  s.hub_partition_date,
  SUM(s.alert_count) AS total_alerts,
  COUNT(*) FILTER (WHERE s.status = 'ok') AS sites_ok,
  COUNT(*) AS sites_count,
  COALESCE(SUM(s.unique_ads), 0) AS total_unique_ads,
  COALESCE(SUM(s.r2_file_count), 0) AS total_r2_files
FROM motherduck.site_daily s
INNER JOIN site_scope ss ON s.site_id = ss.site_id
WHERE s.hub_partition_date >= (SELECT d FROM target) - INTERVAL '30' DAY
GROUP BY 1
ORDER BY 1
```

```scrapers_filtered
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
)
SELECT
  s.display_name,
  sc.scraper,
  sc.files_found,
  sc.checks_passed,
  sc.checks_total,
  sc.all_passed,
  sc.files_optional,
  sc.unique_ads,
  sc.ads_source,
  sc.r2_file_count
FROM motherduck.scraper_daily sc
INNER JOIN motherduck.site_daily s
  ON s.hub_partition_date = sc.hub_partition_date
 AND s.site_id = sc.site_id
CROSS JOIN target t
WHERE sc.hub_partition_date = t.d
  AND s.country IN ${inputs.country_filter.value}
  AND s.site_id IN ${inputs.site_filter.value}
  AND COALESCE(s.run_place, 'github') IN ${inputs.run_place_filter.value}
  AND s.status IN ${inputs.status_filter.value}
ORDER BY s.display_name, sc.scraper
```

```alerts_filtered
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
)
SELECT
  s.display_name,
  a.scraper,
  a.severity,
  a.alert_type,
  a.check_name,
  a.detail
FROM motherduck.alerts a
INNER JOIN motherduck.site_daily s
  ON s.hub_partition_date = a.hub_partition_date
 AND s.site_id = a.site_id
CROSS JOIN target t
WHERE a.hub_partition_date = t.d
  AND s.country IN ${inputs.country_filter.value}
  AND s.site_id IN ${inputs.site_filter.value}
  AND COALESCE(s.run_place, 'github') IN ${inputs.run_place_filter.value}
  AND s.status IN ${inputs.status_filter.value}
ORDER BY
  CASE a.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
  s.display_name,
  a.scraper
```

<div class="not-prose dash-context">
  <span>Run <strong>{hub_kpis[0].partition_date}</strong></span>
  <span class="ctx-sep">·</span>
  <span>Listings <strong>{hub_kpis[0].inspect_date}</strong></span>
  <span class="ctx-sep">·</span>
  <span><strong>{hub_kpis[0].sites_shown}</strong> sites in scope</span>
</div>

<div class="not-prose dash-kpis hub-kpis">
<Grid cols=3 gap=sm>
  <BigValue data={hub_kpis} value=sites_ok title="Sites healthy" maxWidth="100%" />
  <BigValue data={hub_kpis} value=total_unique_ads title="Unique ads" fmt=num0 maxWidth="100%" />
  <BigValue data={hub_kpis} value=total_r2_files title="R2 files" fmt=num0 maxWidth="100%" />
  <BigValue data={hub_kpis} value=total_alerts title="Open alerts" maxWidth="100%" />
  <BigValue data={hub_kpis} value=sites_failed title="Sites with issues" maxWidth="100%" />
  <BigValue data={hub_kpis} value=sites_missing title="Missing reports" maxWidth="100%" />
</Grid>
</div>

<div class="not-prose dash-panel">
<Tabs id="hub-main" color=primary fullWidth=true>

<Tab label="Trends" id="trends">

<div class="not-prose dash-charts">
<Grid cols=2 gap=md>
  <LineChart
    data={alert_trend}
    x=hub_partition_date
    y=total_alerts
    title="Alerts — 30 day"
    yAxisTitle="Alerts"
    chartAreaHeight=220
  />
  <LineChart
    data={alert_trend}
    x=hub_partition_date
    y=total_unique_ads
    title="Unique ads — 30 day"
    yAxisTitle="Listings"
    yFmt=num0
    chartAreaHeight=220
  />
</Grid>

<LineChart
  data={alert_trend}
  x=hub_partition_date
  y=sites_ok
  title="Healthy sites — 30 day"
  yAxisTitle="Sites OK"
  chartAreaHeight=200
/>
</div>

</Tab>

<Tab label="Sites" id="sites">

<div class="not-prose stat-line">
  <strong>{sites_filtered.length}</strong> sites · <strong>{sites_filtered.filter(d => d.status === 'ok').length}</strong> healthy · <strong>{sites_filtered.filter(d => d.status !== 'ok').length}</strong> need attention
</div>

<Grid cols=2 gap=md>
  <BarChart
    data={sites_filtered}
    x=display_name
    y=alert_count
    title="Alerts by site"
    swapXY=true
    chartAreaHeight=260
  />
  <BarChart
    data={sites_filtered}
    x=display_name
    y=unique_ads
    title="Unique ads by site"
    yFmt=num0
    swapXY=true
    chartAreaHeight=260
  />
</Grid>

<BarChart
  data={sites_filtered}
  x=display_name
  y=r2_file_count
  title="R2 files by site"
  yFmt=num0
  swapXY=true
  chartAreaHeight=220
/>

<div class="not-prose dash-table-scroll">
<DataTable
  data={sites_filtered}
  link=site_link
  search=true
  rows=25
  emptySet=pass
  emptyMessage="No sites match the current filters."
>
  <Column id=display_name title="Site" />
  <Column id=country />
  <Column id=status_label title="Status" />
  <Column id=unique_ads title="Unique ads" fmt=num0 />
  <Column id=r2_file_count title="R2 files" fmt=num0 />
  <Column id=scrapers_passed title="Passed" />
  <Column id=scrapers_total title="Scrapers" />
  <Column id=pass_pct title="Pass %" fmt='0.0"%"' />
  <Column id=alert_count title="Alerts" />
  <Column id=workflow_status title="CI" />
  <Column id=github_repo_url title="Repo" contentType=link linkLabel="GitHub ↗" openInNewTab=true />
</DataTable>
</div>

</Tab>

<Tab label="Scrapers" id="scrapers">

<div class="not-prose stat-line">
  <strong>{scrapers_filtered.length}</strong> scraper rows ·
  <strong>{scrapers_filtered.filter(d => d.all_passed).length}</strong> all checks passed
</div>

<div class="not-prose dash-table-scroll">
<DataTable
  data={scrapers_filtered}
  search=true
  rows=20
  emptySet=pass
  emptyMessage="No scraper rows for the current filters."
>
  <Column id=display_name title="Site" />
  <Column id=scraper />
  <Column id=unique_ads title="Unique ads" fmt=num0 />
  <Column id=r2_file_count title="R2 files" fmt=num0 />
  <Column id=ads_source title="Count source" />
  <Column id=files_found title="Files" />
  <Column id=checks_passed title="Checks passed" />
  <Column id=checks_total title="Checks total" />
  <Column id=all_passed title="Passed?" />
  <Column id=files_optional title="Optional?" />
</DataTable>
</div>

</Tab>

<Tab label="Alerts" id="alerts">

<div class="not-prose sev-row">
  <span class="sev-badge sev-critical">Critical <strong>{alerts_filtered.filter(d => d.severity === 'critical').length}</strong></span>
  <span class="sev-badge sev-high">High <strong>{alerts_filtered.filter(d => d.severity === 'high').length}</strong></span>
  <span class="sev-badge sev-medium">Medium <strong>{alerts_filtered.filter(d => d.severity === 'medium').length}</strong></span>
  <span class="sev-badge sev-low">Low <strong>{alerts_filtered.filter(d => d.severity === 'low').length}</strong></span>
</div>

<div class="not-prose dash-table-scroll">
<DataTable
  data={alerts_filtered}
  search=true
  rows=20
  emptySet=pass
  emptyMessage="No alerts — all scrapers passed for the current filters."
>
  <Column id=display_name title="Site" />
  <Column id=scraper />
  <Column id=severity />
  <Column id=alert_type title="Type" />
  <Column id=check_name title="Check" />
  <Column id=detail />
</DataTable>
</div>

</Tab>

</Tabs>
</div>

<div class="not-prose report-footer">
  Click any site row to drill into scraper detail, history, and alert breakdown.
</div>

```all_site_links
SELECT DISTINCT
  site_id,
  display_name,
  '/site/' || site_id AS href
FROM motherduck.site_daily
WHERE site_id IS NOT NULL
ORDER BY display_name
```

<div class="not-prose sr-only" aria-hidden="true">
{#each all_site_links as s}
<a href="{s.href}">{s.display_name}</a>
{/each}
</div>
