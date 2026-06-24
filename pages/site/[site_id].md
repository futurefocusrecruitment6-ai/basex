---
title: Site detail
---

<div class="not-prose mb-6">
  <a href="/" class="text-sm text-primary hover:underline">← Back to overview</a>
</div>

```site_partitions
SELECT DISTINCT s.hub_partition_date::VARCHAR AS hub_partition_date
FROM motherduck.site_daily s
WHERE s.site_id = '${params.site_id}'
ORDER BY hub_partition_date DESC
```

<div class="not-prose mb-6 rounded-xl border border-base-300/70 bg-base-200/30 px-4 py-4">
  <Grid cols=1 gap=sm>
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

<div class="not-prose mb-6 rounded-2xl border border-base-300/80 bg-base-100 px-6 py-5 shadow-sm">
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-base-content">{site_summary[0].display_name}</h1>
      <p class="text-sm text-base-content/60 mt-1">
        {site_summary[0].website} · {site_summary[0].country}
      </p>
    </div>
    <div class="text-right text-sm text-base-content/60">
      <p>Partition <strong class="text-base-content">{site_summary[0].partition_date}</strong></p>
      <p>Listing date <strong class="text-base-content">{site_summary[0].inspect_date}</strong></p>
    </div>
  </div>
</div>

<Grid cols=5 gap=md>
  <BigValue data={site_summary} value=status_label title="Monitor status" />
  <BigValue data={site_summary} value=unique_ads title="Unique ads" />
  <BigValue data={site_summary} value=scrapers_passed title="Scrapers passed" />
  <BigValue data={site_summary} value=alert_count title="Alerts" />
  <BigValue data={site_summary} value=pass_pct title="Pass rate" fmt='0.0"%"' />
</Grid>

<Details title="Run metadata">
  <Grid cols=2 gap=md>
    <div class="text-sm space-y-2">
      <p><span class="text-base-content/50">Run place</span><br /><strong>{site_summary[0].run_place}</strong></p>
      <p><span class="text-base-content/50">Schedule</span><br /><strong>{site_summary[0].schedule}</strong></p>
      <p><span class="text-base-content/50">Workflow</span><br /><strong>{site_summary[0].workflow_name}</strong></p>
    </div>
    <div class="text-sm space-y-2">
      <p><span class="text-base-content/50">CI status</span><br /><strong>{site_summary[0].workflow_status}</strong></p>
      <p><span class="text-base-content/50">Duration</span><br /><strong>{site_summary[0].workflow_duration_sec}s</strong></p>
      <p><span class="text-base-content/50">Repository</span><br /><strong>{site_summary[0].github_username}/{site_summary[0].repo}</strong></p>
      <p><span class="text-base-content/50">Stale report fallback</span><br /><strong>{site_summary[0].report_fallback}</strong></p>
    </div>
  </Grid>
</Details>

<Tabs id="site-tabs" color=primary fullWidth=true>

<Tab label="History" id="history">

<Grid cols=2 gap=lg>
  <LineChart
    data={site_history}
    x=hub_partition_date
    y=unique_ads
    title="Unique ads — 30 runs"
    yAxisTitle="Listings"
  />
  <LineChart
    data={site_history}
    x=hub_partition_date
    y=alert_count
    title="Alerts — 30 runs"
    yAxisTitle="Alerts"
  />
</Grid>

<LineChart
  data={site_history}
  x=hub_partition_date
  y=scrapers_passed
  title="Scrapers passed — 30 runs"
  yAxisTitle="Count"
/>

</Tab>

<Tab label="Scrapers" id="scrapers">

<DataTable
  data={site_scrapers}
  search=true
  rows=all
  emptySet=pass
  emptyMessage="No scraper data for this partition."
>
  <Column id=scraper />
  <Column id=unique_ads title="Unique ads" />
  <Column id=ads_source title="Source" />
  <Column id=files_found title="Files" />
  <Column id=checks_passed title="Passed" />
  <Column id=checks_total title="Total checks" />
  <Column id=all_passed title="All passed?" />
  <Column id=files_optional title="Optional?" />
</DataTable>

</Tab>

<Tab label="Alerts" id="alerts">

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

</Tab>

</Tabs>
