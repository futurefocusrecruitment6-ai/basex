# Monitor Hub — All Sites

Interactive overview: filter by date, country, site, run place, and status. Click a site row to drill into scrapers and alerts.

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

## Filters

<Dropdown name=partition title="Hub run date" data={partition_dates} value=hub_partition_date defaultValue="%">
  <DropdownOption value="%" valueLabel="Latest run" />
</Dropdown>

<Dropdown name=country_filter title="Country" data={country_options} value=country multiple selectAllByDefault />

<Dropdown name=site_filter title="Site" data={site_options} value=site_id label=display_name multiple selectAllByDefault />

<Dropdown name=run_place_filter title="Run place" data={run_place_options} value=run_place multiple selectAllByDefault />

<Dropdown name=status_filter title="Monitor status" data={status_options} value=status multiple selectAllByDefault />

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
  COUNT(*) AS sites_shown,
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
  END AS github_repo_url
FROM motherduck.site_daily s
CROSS JOIN target t
WHERE s.hub_partition_date = t.d
  AND s.country IN ${inputs.country_filter.value}
  AND s.site_id IN ${inputs.site_filter.value}
  AND COALESCE(s.run_place, 'github') IN ${inputs.run_place_filter.value}
  AND s.status IN ${inputs.status_filter.value}
ORDER BY s.display_name
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
  COUNT(*) AS sites_count
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
  sc.files_optional
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
ORDER BY s.display_name, a.severity, a.scraper
```

<BigValue data={hub_kpis} value=sites_ok title="Sites OK" />
<BigValue data={hub_kpis} value=total_alerts title="Total alerts" />
<BigValue data={hub_kpis} value=sites_missing title="Sites missing" />
<BigValue data={hub_kpis} value=sites_shown title="Sites shown" />

Partition **{hub_kpis[0].partition_date}** · inspect date **{hub_kpis[0].inspect_date}**

## Trends (last 30 days)

<LineChart
  data={alert_trend}
  x=hub_partition_date
  y=total_alerts
  title="Alerts across hub runs"
/>

<LineChart
  data={alert_trend}
  x=hub_partition_date
  y=sites_ok
  title="Sites OK across hub runs"
/>

## Sites overview

Click a row to open the site detail page (scrapers + alerts).

<BarChart
  data={sites_filtered}
  y=display_name
  x=alert_count
  title="Alerts by site"
/>

<BarChart
  data={sites_filtered}
  y=display_name
  x={['scrapers_passed', 'scrapers_failed']}
  title="Scrapers passed vs failed"
  type=stacked
/>

<DataTable
  data={sites_filtered}
  link=site_link
  search=true
  rows=20
  emptySet=pass
  emptyMessage="No sites match the current filters."
>
  <Column id=display_name title="Site" />
  <Column id=country />
  <Column id=run_place title="Run place" />
  <Column id=schedule />
  <Column id=status title="Monitor result" />
  <Column id=github_username title="GitHub user" />
  <Column id=repo title="Repository" />
  <Column id=github_repo_url title="GitHub" contentType=link linkLabel="Open ↗" openInNewTab=true />
  <Column id=workflow_name title="Workflow" />
  <Column id=workflow_status title="Workflow status" />
  <Column id=workflow_duration_sec title="Duration (sec)" />
  <Column id=workflow_run_number title="Run #" />
  <Column id=scrapers_passed title="Passed" />
  <Column id=scrapers_total title="Total scrapers" />
  <Column id=pass_pct title="Pass %" fmt='0.0"%"' />
  <Column id=alert_count title="Alerts" />
  <Column id=report_fallback title="Stale report?" />
</DataTable>

## Scrapers (filtered)

<DataTable data={scrapers_filtered} search=true rows=15 emptySet=pass emptyMessage="No scraper rows for the current filters.">
  <Column id=display_name title="Site" />
  <Column id=scraper />
  <Column id=files_found title="Files" />
  <Column id=checks_passed title="Passed" />
  <Column id=checks_total title="Total checks" />
  <Column id=all_passed title="All passed?" />
  <Column id=files_optional title="Optional?" />
</DataTable>

## Alerts (filtered)

<DataTable data={alerts_filtered} search=true rows=15 emptySet=pass emptyMessage="No alerts for the current filters.">
  <Column id=display_name title="Site" />
  <Column id=scraper />
  <Column id=severity />
  <Column id=alert_type title="Type" />
  <Column id=check_name title="Check" />
  <Column id=detail />
</DataTable>
