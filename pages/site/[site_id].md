# Site detail

[← Back to hub](/)

```site_partitions
SELECT DISTINCT s.hub_partition_date::VARCHAR AS hub_partition_date
FROM motherduck.site_daily s
WHERE s.site_id = '${params.site_id}'
ORDER BY hub_partition_date DESC
```

<Dropdown name=partition title="Hub run date" data={site_partitions} value=hub_partition_date defaultValue="%">
  <DropdownOption value="%" valueLabel="Latest run" />
</Dropdown>

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
  s.workflow_name,
  s.workflow_status,
  s.workflow_duration_sec,
  s.workflow_run_number,
  s.workflow_run_id,
  s.report_fallback,
  s.hub_partition_date::VARCHAR AS partition_date,
  s.inspect_date::VARCHAR AS inspect_date,
  CASE
    WHEN s.github_username IS NOT NULL AND s.repo IS NOT NULL
    THEN 'https://github.com/' || s.github_username || '/' || s.repo
  END AS github_repo_url
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
  sc.files_optional
FROM motherduck.scraper_daily sc
CROSS JOIN target t
WHERE sc.site_id = '${params.site_id}'
  AND sc.hub_partition_date = t.d
ORDER BY sc.scraper
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
ORDER BY a.severity, a.scraper
```

```site_history
SELECT
  s.hub_partition_date,
  s.status,
  s.scrapers_passed,
  s.scrapers_total,
  s.alert_count,
  s.workflow_status,
  s.workflow_duration_sec
FROM motherduck.site_daily s
WHERE s.site_id = '${params.site_id}'
ORDER BY s.hub_partition_date DESC
LIMIT 30
```

## {site_summary[0].display_name}

**{site_summary[0].website}** · {site_summary[0].country} · partition **{site_summary[0].partition_date}**

<BigValue data={site_summary} value=scrapers_passed title="Scrapers passed" />
<BigValue data={site_summary} value=scrapers_total title="Total scrapers" />
<BigValue data={site_summary} value=alert_count title="Alerts" />
<BigValue data={site_summary} value=workflow_duration_sec title="Workflow sec" />

| Field | Value |
|-------|-------|
| Monitor status | {site_summary[0].status} |
| Run place | {site_summary[0].run_place} |
| Schedule | {site_summary[0].schedule} |
| GitHub | [{site_summary[0].github_username}/{site_summary[0].repo}]({site_summary[0].github_repo_url}) |
| Workflow | {site_summary[0].workflow_name} |
| Workflow status | {site_summary[0].workflow_status} |
| Run # | {site_summary[0].workflow_run_number} |
| Stale report? | {site_summary[0].report_fallback} |

## History (30 runs)

<LineChart
  data={site_history}
  x=hub_partition_date
  y=alert_count
  title="Alerts over time"
/>

<LineChart
  data={site_history}
  x=hub_partition_date
  y=scrapers_passed
  title="Scrapers passed over time"
/>

## Scrapers

<DataTable data={site_scrapers} search=true rows=all emptySet=pass emptyMessage="No scraper data for this partition.">
  <Column id=scraper />
  <Column id=files_found title="Files" />
  <Column id=checks_passed title="Passed" />
  <Column id=checks_total title="Total checks" />
  <Column id=all_passed title="All passed?" />
  <Column id=files_optional title="Optional?" />
</DataTable>

## Alerts

<DataTable data={site_alerts} search=true rows=all emptySet=pass emptyMessage="No alerts for this partition.">
  <Column id=scraper />
  <Column id=severity />
  <Column id=alert_type title="Type" />
  <Column id=check_name title="Check" />
  <Column id=detail />
  <Column id=file_key title="File" />
</DataTable>
