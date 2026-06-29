---
title: Listing volume
description: Total unique listings collected per site and scraper. Counts prefer deduplicated listing IDs from Excel, with JSON summary as fallback.
---

<div class="not-prose report-nav">
  <a href="/">Overview</a>
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

<div class="not-prose dash-toolbar">
<Grid cols=2 gap=md>
  <Dropdown name=partition title="Hub run date" data={partition_dates} value=hub_partition_date defaultValue="%">
    <DropdownOption value="%" valueLabel="Latest run" />
  </Dropdown>
  <Dropdown name=country_filter title="Country" data={country_options} value=country multiple selectAllByDefault />
</Grid>
</div>

```ads_kpis
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
)
SELECT
  COALESCE(SUM(s.unique_ads), 0) AS total_unique_ads,
  COUNT(*) AS sites_with_data,
  COUNT(*) FILTER (WHERE s.unique_ads > 0) AS sites_reporting_ads,
  MAX(s.hub_partition_date)::VARCHAR AS partition_date,
  MAX(s.inspect_date)::VARCHAR AS inspect_date
FROM motherduck.site_daily s
CROSS JOIN target t
WHERE s.hub_partition_date = t.d
  AND s.country IN ${inputs.country_filter.value}
```

```ads_trend
SELECT
  h.hub_partition_date,
  h.total_unique_ads,
  h.sites_ok,
  h.total_alerts
FROM motherduck.hub_daily h
WHERE h.hub_partition_date >= CURRENT_DATE - INTERVAL '60' DAY
ORDER BY h.hub_partition_date
```

```ads_by_site
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
)
SELECT
  s.hub_partition_date,
  s.display_name,
  s.country,
  s.website,
  s.unique_ads,
  s.scrapers_passed,
  s.scrapers_total,
  s.status,
  s.report_fallback,
  '/site/' || s.site_id AS site_link
FROM motherduck.site_daily s
CROSS JOIN target t
WHERE s.hub_partition_date = t.d
  AND s.country IN ${inputs.country_filter.value}
ORDER BY s.unique_ads DESC NULLS LAST
```

```ads_by_scraper
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
)
SELECT
  s.display_name,
  s.country,
  sc.scraper,
  sc.unique_ads,
  sc.total_rows,
  sc.ads_source,
  sc.all_passed,
  sc.files_found
FROM motherduck.scraper_daily sc
JOIN motherduck.site_daily s
  ON sc.hub_partition_date = s.hub_partition_date
 AND sc.site_id = s.site_id
CROSS JOIN target t
WHERE sc.hub_partition_date = t.d
  AND s.country IN ${inputs.country_filter.value}
ORDER BY sc.unique_ads DESC NULLS LAST
```

<div class="not-prose dash-context">
  <span>Run <strong>{ads_kpis[0].partition_date}</strong></span>
  <span class="ctx-sep">·</span>
  <span>Listings <strong>{ads_kpis[0].inspect_date}</strong></span>
</div>

<div class="not-prose dash-kpis cols-3">
<Grid cols=3 gap=sm>
  <BigValue data={ads_kpis} value=total_unique_ads title="Total unique ads" fmt=num0 maxWidth="100%" />
  <BigValue data={ads_kpis} value=sites_reporting_ads title="Sites reporting data" maxWidth="100%" />
  <BigValue data={ads_kpis} value=sites_with_data title="Sites in scope" maxWidth="100%" />
</Grid>
</div>

<div class="not-prose dash-charts">
<Grid cols=2 gap=md>
  <LineChart
    data={ads_trend}
    x=hub_partition_date
    y=total_unique_ads
    title="Hub total — 60 day trend"
    yAxisTitle="Unique listings"
    yFmt=num0
    chartAreaHeight=240
  />
  <BarChart
    data={ads_by_site}
    x=display_name
    y=unique_ads
    title="By website (selected run)"
    yFmt=num0
    swapXY=true
    chartAreaHeight=240
  />
</Grid>
</div>

<div class="not-prose dash-panel">
<Tabs id="ads-tabs" color=primary fullWidth=true>

<Tab label="By website" id="by-site">

<div class="not-prose stat-line">
  <strong>{ads_by_site.length}</strong> websites · sorted by listing volume descending
</div>

<div class="not-prose dash-table-scroll">
<DataTable
  data={ads_by_site}
  link=site_link
  search=true
  rows=25
  emptySet=pass
  emptyMessage="No ad counts for this partition yet."
>
  <Column id=display_name title="Website" />
  <Column id=country />
  <Column id=website />
  <Column id=unique_ads title="Unique ads" fmt=num0 />
  <Column id=scrapers_passed title="Scrapers OK" />
  <Column id=scrapers_total title="Scrapers" />
  <Column id=status title="Status" />
  <Column id=report_fallback title="Stale?" />
</DataTable>
</div>

</Tab>

<Tab label="By scraper" id="by-scraper">

<div class="not-prose stat-line">
  <strong>{ads_by_scraper.length}</strong> scrapers ·
  <strong>{ads_by_scraper.filter(d => d.all_passed).length}</strong> validation passed
</div>

<div class="not-prose dash-table-scroll">
<DataTable
  data={ads_by_scraper}
  search=true
  rows=30
  emptySet=pass
  emptyMessage="No scraper-level ad counts available."
>
  <Column id=display_name title="Website" />
  <Column id=country />
  <Column id=scraper title="Category / scraper" />
  <Column id=unique_ads title="Unique ads" fmt=num0 />
  <Column id=ads_source title="Source" />
  <Column id=total_rows title="Excel rows" fmt=num0 />
  <Column id=files_found title="Files" />
  <Column id=all_passed title="Passed?" />
</DataTable>
</div>

</Tab>

</Tabs>
</div>

<div class="not-prose report-footer">
  Count source: <code>excel_ids</code> (preferred), <code>json_summary</code>, or <code>excel_rows</code>.
</div>
