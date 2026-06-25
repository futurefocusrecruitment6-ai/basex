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
      <!-- Status badge rendered before the site name for instant health signal -->
      <div class="mb-2">
        {#if site_summary[0].status === 'ok'}
          <span class="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">● Healthy</span>
        {:else if site_summary[0].status === 'failed'}
          <span class="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">● Issues detected</span>
        {:else}
          <span class="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">● {site_summary[0].status_label}</span>
        {/if}
      </div>
      <h1 class="text-2xl font-bold tracking-tight text-base-content">{site_summary[0].display_name}</h1>
      <p class="text-sm text-base-content/60 mt-1">
        {site_summary[0].website} · {site_summary[0].country}
      </p>
    </div>
    <div class="flex flex-col items-end gap-1 text-right">
      <span class="inline-flex items-center rounded-md border border-base-300/70 bg-base-200/50 px-2.5 py-0.5 text-xs font-medium text-base-content/60">
        Partition <strong class="ml-1 text-base-content">{site_summary[0].partition_date}</strong>
      </span>
      <span class="inline-flex items-center rounded-md border border-base-300/70 bg-base-200/50 px-2.5 py-0.5 text-xs font-medium text-base-content/60">
        Listing date <strong class="ml-1 text-base-content">{site_summary[0].inspect_date}</strong>
      </span>
    </div>
  </div>
</div>

<!-- Status excluded from KPI strip — it's already prominent in the header badge above -->
<Grid cols=4 gap=md>
  <BigValue data={site_summary} value=unique_ads title="Unique ads" fmt=num0 />
  <BigValue data={site_summary} value=scrapers_passed title="Scrapers passed" />
  <BigValue data={site_summary} value=alert_count title="Alerts" />
  <BigValue data={site_summary} value=pass_pct title="Pass rate" fmt='0.0"%"' />
</Grid>

<Details title="Run metadata">
  <!-- Key-value grid avoids the fragile <br /> pattern; consistent 4-column baseline -->
  <dl class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
    <div>
      <dt class="text-xs font-medium uppercase tracking-wide text-base-content/40">Run place</dt>
      <dd class="mt-0.5 font-semibold text-base-content">{site_summary[0].run_place}</dd>
    </div>
    <div>
      <dt class="text-xs font-medium uppercase tracking-wide text-base-content/40">Schedule</dt>
      <dd class="mt-0.5 font-semibold text-base-content">{site_summary[0].schedule}</dd>
    </div>
    <div>
      <dt class="text-xs font-medium uppercase tracking-wide text-base-content/40">Workflow</dt>
      <dd class="mt-0.5 font-semibold text-base-content">{site_summary[0].workflow_name}</dd>
    </div>
    <div>
      <dt class="text-xs font-medium uppercase tracking-wide text-base-content/40">CI status</dt>
      <dd class="mt-0.5 font-semibold text-base-content">{site_summary[0].workflow_status}</dd>
    </div>
    <div>
      <dt class="text-xs font-medium uppercase tracking-wide text-base-content/40">Duration</dt>
      <dd class="mt-0.5 font-semibold text-base-content">{site_summary[0].workflow_duration_sec}s</dd>
    </div>
    <div>
      <dt class="text-xs font-medium uppercase tracking-wide text-base-content/40">Repository</dt>
      <dd class="mt-0.5 font-semibold text-base-content">{site_summary[0].github_username}/{site_summary[0].repo}</dd>
    </div>
    <div>
      <dt class="text-xs font-medium uppercase tracking-wide text-base-content/40">Stale fallback</dt>
      <dd class="mt-0.5 font-semibold text-base-content">{site_summary[0].report_fallback}</dd>
    </div>
  </dl>
</Details>

<Tabs id="site-tabs" color=primary fullWidth=true>

<Tab label="History" id="history">

<!-- 3-column grid keeps all trend metrics at equal visual weight, removes the orphan chart -->
<Grid cols=3 gap=lg>
  <LineChart
    data={site_history}
    x=hub_partition_date
    y=unique_ads
    title="Unique ads — 30 runs"
    yAxisTitle="Listings"
    yFmt=num0
  />
  <LineChart
    data={site_history}
    x=hub_partition_date
    y=alert_count
    title="Alerts — 30 runs"
    yAxisTitle="Alerts"
  />
  <LineChart
    data={site_history}
    x=hub_partition_date
    y=scrapers_passed
    title="Scrapers passed — 30 runs"
    yAxisTitle="Count"
  />
</Grid>

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

<div class="not-prose mb-4 flex flex-wrap gap-2">
  <span class="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
    Critical <strong>{site_alerts.filter(d => d.severity === 'critical').length}</strong>
  </span>
  <span class="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
    High <strong>{site_alerts.filter(d => d.severity === 'high').length}</strong>
  </span>
  <span class="inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
    Medium <strong>{site_alerts.filter(d => d.severity === 'medium').length}</strong>
  </span>
  <span class="inline-flex items-center gap-1.5 rounded-full border border-base-300 bg-base-200 px-3 py-1 text-xs font-semibold text-base-content/60">
    Low <strong>{site_alerts.filter(d => d.severity === 'low').length}</strong>
  </span>
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

</Tab>

</Tabs>
