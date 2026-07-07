---
title: Listing volume
description: Total unique listings collected per site and scraper. Counts prefer deduplicated listing IDs from Excel, with JSON summary as fallback.
---

<DashNav active="ads" />

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

```ads_kpis
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
)
SELECT
  COALESCE(SUM(s.unique_ads), 0) AS total_unique_ads,
  0 AS total_unique_phones,
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
  0 AS unique_phones,
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
  0 AS unique_phones,
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

```site_focus_options
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
), scoped AS (
  SELECT DISTINCT
    CASE
      WHEN REGEXP_MATCHES(LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')), '4\\s*sale|4sale') THEN '4sale'
      WHEN LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')) LIKE '%boshmalan%' THEN 'boshmalan'
    END AS site_focus
  FROM motherduck.scraper_daily sc
  JOIN motherduck.site_daily s
    ON sc.hub_partition_date = s.hub_partition_date
   AND sc.site_id = s.site_id
  CROSS JOIN target t
  WHERE sc.hub_partition_date = t.d
    AND s.country IN ${inputs.country_filter.value}
)
SELECT site_focus
FROM scoped
WHERE site_focus IS NOT NULL
ORDER BY site_focus
```

```ads_hierarchy_category_options
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
), scoped AS (
  SELECT
    CASE
      WHEN REGEXP_MATCHES(LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')), '4\\s*sale|4sale') THEN '4sale'
      WHEN LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')) LIKE '%boshmalan%' THEN 'boshmalan'
    END AS site_focus,
    TRIM(COALESCE(sc.scraper, '')) AS scraper_name
  FROM motherduck.scraper_daily sc
  JOIN motherduck.site_daily s
    ON sc.hub_partition_date = s.hub_partition_date
   AND sc.site_id = s.site_id
  CROSS JOIN target t
  WHERE sc.hub_partition_date = t.d
    AND s.country IN ${inputs.country_filter.value}
), normalized AS (
  SELECT
    site_focus,
    REPLACE(REPLACE(REPLACE(scraper_name, ' > ', '/'), '::', '/'), ' - ', '/') AS scraper_path
  FROM scoped
  WHERE site_focus IS NOT NULL
)
SELECT DISTINCT
  COALESCE(NULLIF(SPLIT_PART(scraper_path, '/', 1), ''), '(uncategorized)') AS category
FROM normalized
WHERE site_focus IN ${inputs.site_focus_filter.value}
ORDER BY category
```

```phone_focus_totals
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
), scoped AS (
  SELECT
    CASE
      WHEN REGEXP_MATCHES(LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')), '4\\s*sale|4sale') THEN '4sale'
      WHEN LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')) LIKE '%boshmalan%' THEN 'boshmalan'
    END AS site_focus,
    0 AS unique_phones,
    COALESCE(s.unique_ads, 0) AS unique_ads
  FROM motherduck.site_daily s
  CROSS JOIN target t
  WHERE s.hub_partition_date = t.d
    AND s.country IN ${inputs.country_filter.value}
)
SELECT
  site_focus,
  SUM(unique_phones) AS unique_phones,
  SUM(unique_ads) AS unique_ads,
  COUNT(*) AS sites_count
FROM scoped
WHERE site_focus IN ${inputs.site_focus_filter.value}
GROUP BY 1
ORDER BY unique_phones DESC, unique_ads DESC
```

```phone_focus_kpis
SELECT
  COALESCE(SUM(unique_phones), 0) AS total_unique_phones,
  COALESCE(SUM(unique_ads), 0) AS total_unique_ads,
  COUNT(*) AS websites_in_focus
FROM phone_focus_totals
```

```phone_focus_daily
WITH scoped AS (
  SELECT
    s.hub_partition_date,
    CASE
      WHEN REGEXP_MATCHES(LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')), '4\\s*sale|4sale') THEN '4sale'
      WHEN LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')) LIKE '%boshmalan%' THEN 'boshmalan'
    END AS site_focus,
    0 AS unique_phones
  FROM motherduck.site_daily s
  WHERE s.hub_partition_date >= CURRENT_DATE - INTERVAL '60' DAY
    AND s.country IN ${inputs.country_filter.value}
)
SELECT
  hub_partition_date,
  site_focus,
  SUM(unique_phones) AS unique_phones
FROM scoped
WHERE site_focus IN ${inputs.site_focus_filter.value}
GROUP BY 1, 2
ORDER BY 1, 2
```

```ads_hierarchy_totals
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
), scoped AS (
  SELECT
    CASE
      WHEN REGEXP_MATCHES(LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')), '4\\s*sale|4sale') THEN '4sale'
      WHEN LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')) LIKE '%boshmalan%' THEN 'boshmalan'
    END AS site_focus,
    COALESCE(sc.unique_ads, 0) AS unique_ads
  FROM motherduck.scraper_daily sc
  JOIN motherduck.site_daily s
    ON sc.hub_partition_date = s.hub_partition_date
   AND sc.site_id = s.site_id
  CROSS JOIN target t
  WHERE sc.hub_partition_date = t.d
    AND s.country IN ${inputs.country_filter.value}
)
SELECT
  site_focus,
  SUM(unique_ads) AS unique_ads,
  COUNT(*) AS scrapers_count
FROM scoped
WHERE site_focus IS NOT NULL
GROUP BY 1
ORDER BY unique_ads DESC
```

```ads_by_category_focus
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
), scoped AS (
  SELECT
    CASE
      WHEN REGEXP_MATCHES(LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')), '4\\s*sale|4sale') THEN '4sale'
      WHEN LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')) LIKE '%boshmalan%' THEN 'boshmalan'
    END AS site_focus,
    TRIM(COALESCE(sc.scraper, '')) AS scraper_name,
    COALESCE(sc.unique_ads, 0) AS unique_ads
  FROM motherduck.scraper_daily sc
  JOIN motherduck.site_daily s
    ON sc.hub_partition_date = s.hub_partition_date
   AND sc.site_id = s.site_id
  CROSS JOIN target t
  WHERE sc.hub_partition_date = t.d
    AND s.country IN ${inputs.country_filter.value}
), normalized AS (
  SELECT
    site_focus,
    REPLACE(REPLACE(REPLACE(scraper_name, ' > ', '/'), '::', '/'), ' - ', '/') AS scraper_path,
    unique_ads
  FROM scoped
  WHERE site_focus IS NOT NULL
)
SELECT
  site_focus,
  COALESCE(NULLIF(SPLIT_PART(scraper_path, '/', 1), ''), '(uncategorized)') AS category,
  SUM(unique_ads) AS unique_ads,
  COUNT(*) AS scrapers_count
FROM normalized
WHERE site_focus IN ${inputs.site_focus_filter.value}
GROUP BY 1, 2
ORDER BY site_focus, unique_ads DESC, category
```

```ads_by_subcategory_focus
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
), scoped AS (
  SELECT
    CASE
      WHEN REGEXP_MATCHES(LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')), '4\\s*sale|4sale') THEN '4sale'
      WHEN LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')) LIKE '%boshmalan%' THEN 'boshmalan'
    END AS site_focus,
    TRIM(COALESCE(sc.scraper, '')) AS scraper_name,
    COALESCE(sc.unique_ads, 0) AS unique_ads
  FROM motherduck.scraper_daily sc
  JOIN motherduck.site_daily s
    ON sc.hub_partition_date = s.hub_partition_date
   AND sc.site_id = s.site_id
  CROSS JOIN target t
  WHERE sc.hub_partition_date = t.d
    AND s.country IN ${inputs.country_filter.value}
), normalized AS (
  SELECT
    site_focus,
    REPLACE(REPLACE(REPLACE(scraper_name, ' > ', '/'), '::', '/'), ' - ', '/') AS scraper_path,
    unique_ads
  FROM scoped
  WHERE site_focus IS NOT NULL
)
SELECT
  site_focus,
  COALESCE(NULLIF(SPLIT_PART(scraper_path, '/', 1), ''), '(uncategorized)') AS category,
  COALESCE(NULLIF(SPLIT_PART(scraper_path, '/', 2), ''), '(no subcategory)') AS subcategory,
  COALESCE(NULLIF(SPLIT_PART(scraper_path, '/', 3), ''), '(no level-3)') AS level_3,
  SUM(unique_ads) AS unique_ads,
  COUNT(*) AS scrapers_count
FROM normalized
WHERE site_focus IN ${inputs.site_focus_filter.value}
GROUP BY 1, 2, 3, 4
ORDER BY site_focus, category, unique_ads DESC, subcategory, level_3
```

<div class="dash-meta">
  <span>Run date <strong>{ads_kpis[0].partition_date}</strong></span>
  <span class="sep">·</span>
  <span>Listings as of <strong>{ads_kpis[0].inspect_date ?? '—'}</strong></span>
</div>

<div class="kpi-row cols-4">
  <a href="#ads-hierarchy" class="no-underline block">
    <KpiCard label="Total Unique Ads (click to drill down)" value={ads_kpis[0].total_unique_ads?.toLocaleString()} tone="primary" />
  </a>
  <KpiCard label="Total Unique Phones" value={ads_kpis[0].total_unique_phones?.toLocaleString()} tone="good" />
  <KpiCard label="Sites Reporting" value={ads_kpis[0].sites_reporting_ads} tone="good" />
  <KpiCard label="Sites in Scope" value={ads_kpis[0].sites_with_data} tone="neutral" />
</div>

<div class="chart-row">
  <div class="chart-panel">
  <LineChart
    data={ads_trend}
    x=hub_partition_date
    y=total_unique_ads
    title="Hub total — 60 day trend"
    yAxisTitle="Unique listings"
    yFmt=num0
    chartAreaHeight=240
    echartsOptions={{ backgroundColor: 'transparent' }}
  />
  </div>
  <div class="chart-panel">
  <BarChart
    data={ads_by_site}
    x=display_name
    y=unique_ads
    title="By website (selected run)"
    yFmt=num0
    swapXY=true
    chartAreaHeight=240
    echartsOptions={{ backgroundColor: 'transparent' }}
  />
  </div>
</div>

<div class="dash-panel">
<Tabs id="ads-tabs" color=primary fullWidth=true>

<Tab label="By website" id="by-site">

<div class="stat-line">
  <strong>{ads_by_site.length}</strong> websites · sorted by listing volume descending
</div>

<div class="dash-table-wrap">
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
  <Column id=unique_phones title="Unique phones" fmt=num0 />
  <Column id=scrapers_passed title="Scrapers OK" />
  <Column id=scrapers_total title="Scrapers" />
  <Column id=status title="Status" />
  <Column id=report_fallback title="Stale?" />
</DataTable>
</div>

</Tab>

<Tab label="By scraper" id="by-scraper">

<div class="stat-line">
  <strong>{ads_by_scraper.length}</strong> scrapers ·
  <strong>{ads_by_scraper.filter(d => d.all_passed).length}</strong> validation passed
</div>

<div class="dash-table-wrap">
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

<div id="ads-hierarchy" class="dash-panel">
  <h2 class="mt-0">4sale and boshmalan drill-down</h2>
  <div class="stat-line">
    Click a category to open its subcategories and deeper levels.
  </div>

  <Grid cols=1 gap=sm>
    <Dropdown name=site_focus_filter title="Website focus" data={site_focus_options} value=site_focus multiple selectAllByDefault />
  </Grid>

  <div class="kpi-row cols-3 mt-4">
    <KpiCard label="Focus Unique Phones" value={phone_focus_kpis[0]?.total_unique_phones?.toLocaleString()} tone="good" />
    <KpiCard label="Focus Unique Ads" value={phone_focus_kpis[0]?.total_unique_ads?.toLocaleString()} tone="primary" />
    <KpiCard label="Focused Websites" value={phone_focus_kpis[0]?.websites_in_focus} tone="neutral" />
  </div>

  <div class="chart-row mt-4">
    <div class="chart-panel">
    <LineChart
      data={phone_focus_daily}
      x=hub_partition_date
      y=unique_phones
      series=site_focus
      title="Daily unique phones (4sale / boshmalan)"
      yFmt=num0
      chartAreaHeight=260
      echartsOptions={{ backgroundColor: 'transparent' }}
    />
    </div>
    <div class="dash-table-wrap">
    <DataTable
      data={phone_focus_totals}
      rows=all
      emptySet=pass
      emptyMessage="No phone rows found for the selected filters."
    >
      <Column id=site_focus title="Website" />
      <Column id=unique_phones title="Unique phones" fmt=num0 />
      <Column id=unique_ads title="Unique ads" fmt=num0 />
      <Column id=sites_count title="Sites" />
    </DataTable>
    </div>
  </div>

  <div class="chart-row mt-4">
    <div class="chart-panel">
    <BarChart
      data={ads_by_category_focus}
      x=category
      y=unique_ads
      series=site_focus
      title="Ads by category"
      yFmt=num0
      swapXY=true
      chartAreaHeight=260
      echartsOptions={{ backgroundColor: 'transparent' }}
    />
    </div>
    <div class="dash-table-wrap">
    <DataTable
      data={ads_hierarchy_totals}
      rows=all
      emptySet=pass
      emptyMessage="No 4sale or boshmalan rows for the selected filters."
    >
      <Column id=site_focus title="Website" />
      <Column id=unique_ads title="Unique ads" fmt=num0 />
      <Column id=scrapers_count title="Scraper rows" />
    </DataTable>
    </div>
  </div>

  <div class="dash-table-wrap mt-4">
  <DataTable
    data={ads_by_category_focus}
    search=true
    rows=all
    emptySet=pass
    emptyMessage="No category rows for the selected filters."
  >
    <Column id=site_focus title="Website" />
    <Column id=category title="Category" />
    <Column id=unique_ads title="Unique ads" fmt=num0 />
    <Column id=scrapers_count title="Scraper rows" />
  </DataTable>
  </div>

  <div class="stat-line mt-4">
    Expand any category below to see its subcategories.
  </div>

  <div class="space-y-3 mt-3">
  {#each ads_by_category_focus as c}
    <details class="rounded-lg border border-base-300/70 bg-base-100 p-3">
      <summary class="cursor-pointer font-medium">
        {c.site_focus} / {c.category} - {c.unique_ads?.toLocaleString()} ads
      </summary>
      <div class="dash-table-wrap mt-3">
      <DataTable
        data={ads_by_subcategory_focus.filter(d => d.site_focus === c.site_focus && d.category === c.category && (d.subcategory !== '(no subcategory)' || d.level_3 !== '(no level-3)'))}
        rows=all
        emptySet=pass
        emptyMessage="No subcategory data exists yet for this category in monitor_hub."
      >
        <Column id=subcategory title="Subcategory" />
        <Column id=level_3 title="Level 3" />
        <Column id=unique_ads title="Unique ads" fmt=num0 />
        <Column id=scrapers_count title="Scraper rows" />
      </DataTable>
      </div>
    </details>
  {/each}
  </div>
</div>

<div class="dash-footer">
  Count source: <code>excel_ids</code> (preferred), <code>json_summary</code>, or <code>excel_rows</code>.
</div>
