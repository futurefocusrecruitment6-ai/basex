---
title: Website focus drill-down
description: Focused listing and phone volume for 4sale and boshmalan, with category and subcategory drill-down.
---

<DashNav active="ads" />

<a href="/ads" class="back-link">← Listing Volume</a>

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

```ads_hierarchy_totals
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
), scoped AS (
  SELECT
    s.hub_partition_date,
    s.inspect_date,
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
    REPLACE(REPLACE(REPLACE(REPLACE(scraper_name, ' > ', '/'), '::', '/'), ' - ', '/'), ' / ', '/') AS scraper_path,
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
    REPLACE(REPLACE(REPLACE(REPLACE(TRIM(COALESCE(sc.scraper, '')), ' > ', '/'), '::', '/'), ' - ', '/'), ' / ', '/') AS scraper_path,
    COALESCE(sc.unique_ads, 0) AS unique_ads,
    COALESCE(sc.total_rows, 0) AS total_rows
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
  COALESCE(NULLIF(SPLIT_PART(scraper_path, '/', 1), ''), '(uncategorized)') AS category,
  COALESCE(NULLIF(SPLIT_PART(scraper_path, '/', 2), ''), '(no subcategory)') AS subcategory,
  SUM(unique_ads) AS unique_ads,
  SUM(total_rows) AS sheet_rows,
  COUNT(*) AS sheets_count,
  COUNT(*) AS hierarchy_rows
FROM scoped
WHERE site_focus IN ${inputs.site_focus_filter.value}
GROUP BY 1, 2, 3
ORDER BY site_focus, category, unique_ads DESC, subcategory
```

```ads_by_level3_focus
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
    REPLACE(REPLACE(REPLACE(REPLACE(TRIM(COALESCE(sc.scraper, '')), ' > ', '/'), '::', '/'), ' - ', '/'), ' / ', '/') AS scraper_path,
    COALESCE(sc.unique_ads, 0) AS unique_ads,
    COALESCE(sc.total_rows, 0) AS total_rows
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
  COALESCE(NULLIF(SPLIT_PART(scraper_path, '/', 1), ''), '(uncategorized)') AS category,
  COALESCE(NULLIF(SPLIT_PART(scraper_path, '/', 2), ''), '(no subcategory)') AS subcategory,
  COALESCE(NULLIF(SPLIT_PART(scraper_path, '/', 3), ''), '(leaf)') AS level_3,
  SUM(unique_ads) AS unique_ads,
  SUM(total_rows) AS sheet_rows,
  COUNT(*) AS sheets_count,
  COUNT(*) AS hierarchy_rows
FROM scoped
WHERE site_focus IN ${inputs.site_focus_filter.value}
  AND COALESCE(NULLIF(SPLIT_PART(scraper_path, '/', 3), ''), '') <> ''
GROUP BY 1, 2, 3, 4
ORDER BY site_focus, category, subcategory, unique_ads DESC, level_3
```

```weekly_ad_change_summary
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
), prev_target AS (
  SELECT MAX(h.hub_partition_date) AS d
  FROM motherduck.hub_daily h
  CROSS JOIN target t
  WHERE h.hub_partition_date < t.d
    AND DATE_TRUNC('week', h.hub_partition_date) = DATE_TRUNC('week', t.d) - INTERVAL '7' DAY
), current_scope AS (
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
), prev_scope AS (
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
  CROSS JOIN prev_target pt
  WHERE sc.hub_partition_date = pt.d
    AND s.country IN ${inputs.country_filter.value}
), current_ads AS (
  SELECT site_focus, SUM(unique_ads) AS current_week_ads
  FROM current_scope
  WHERE site_focus IS NOT NULL
  GROUP BY 1
), prev_ads AS (
  SELECT site_focus, SUM(unique_ads) AS previous_week_ads
  FROM prev_scope
  WHERE site_focus IS NOT NULL
  GROUP BY 1
)
SELECT
  COALESCE(c.site_focus, p.site_focus) AS site_focus,
  COALESCE(c.current_week_ads, 0) AS current_week_ads,
  COALESCE(p.previous_week_ads, 0) AS previous_week_ads,
  COALESCE(c.current_week_ads, 0) - COALESCE(p.previous_week_ads, 0) AS ads_change,
  CASE
    WHEN COALESCE(p.previous_week_ads, 0) > 0 THEN ROUND(100.0 * (COALESCE(c.current_week_ads, 0) - COALESCE(p.previous_week_ads, 0)) / COALESCE(p.previous_week_ads, 0), 2)
    WHEN COALESCE(c.current_week_ads, 0) > 0 THEN 100.0
    ELSE 0
  END AS ads_change_pct
FROM current_ads c
FULL OUTER JOIN prev_ads p
  ON c.site_focus = p.site_focus
WHERE COALESCE(c.site_focus, p.site_focus) IN ${inputs.site_focus_filter.value}
```

```weekly_ad_change
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
), prev_target AS (
  SELECT MAX(h.hub_partition_date) AS d
  FROM motherduck.hub_daily h
  CROSS JOIN target t
  WHERE h.hub_partition_date < t.d
    AND DATE_TRUNC('week', h.hub_partition_date) = DATE_TRUNC('week', t.d) - INTERVAL '7' DAY
), current_scope AS (
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
), prev_scope AS (
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
  CROSS JOIN prev_target pt
  WHERE sc.hub_partition_date = pt.d
    AND s.country IN ${inputs.country_filter.value}
), current_normalized AS (
  SELECT
    site_focus,
    REPLACE(REPLACE(REPLACE(scraper_name, ' > ', '/'), '::', '/'), ' - ', '/') AS scraper_path,
    unique_ads
  FROM current_scope
  WHERE site_focus IS NOT NULL
), prev_normalized AS (
  SELECT
    site_focus,
    REPLACE(REPLACE(REPLACE(scraper_name, ' > ', '/'), '::', '/'), ' - ', '/') AS scraper_path,
    unique_ads
  FROM prev_scope
  WHERE site_focus IS NOT NULL
), current_summary AS (
  SELECT
    site_focus,
    COALESCE(NULLIF(SPLIT_PART(scraper_path, '/', 1), ''), '(uncategorized)') AS category,
    SUM(unique_ads) AS current_week_ads
  FROM current_normalized
  GROUP BY 1, 2
), prev_summary AS (
  SELECT
    site_focus,
    COALESCE(NULLIF(SPLIT_PART(scraper_path, '/', 1), ''), '(uncategorized)') AS category,
    SUM(unique_ads) AS previous_week_ads
  FROM prev_normalized
  GROUP BY 1, 2
)
SELECT
  COALESCE(c.site_focus, p.site_focus) AS site_focus,
  COALESCE(c.category, p.category) AS category,
  COALESCE(c.current_week_ads, 0) AS current_week_ads,
  COALESCE(p.previous_week_ads, 0) AS previous_week_ads,
  COALESCE(c.current_week_ads, 0) - COALESCE(p.previous_week_ads, 0) AS ads_change,
  CASE
    WHEN COALESCE(p.previous_week_ads, 0) > 0 THEN ROUND(100.0 * (COALESCE(c.current_week_ads, 0) - COALESCE(p.previous_week_ads, 0)) / COALESCE(p.previous_week_ads, 0), 2)
    WHEN COALESCE(c.current_week_ads, 0) > 0 THEN 100.0
    ELSE 0
  END AS ads_change_pct
FROM current_summary c
FULL OUTER JOIN prev_summary p
  ON c.site_focus = p.site_focus
 AND c.category = p.category
WHERE COALESCE(c.site_focus, p.site_focus) IN ${inputs.site_focus_filter.value}
ORDER BY ads_change DESC, ads_change_pct DESC, category
```

```phone_focus_totals
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
), scraper_phone AS (
  SELECT
    hub_partition_date,
    site_id,
    COALESCE(SUM(unique_phones), 0) AS scraper_unique_phones
  FROM motherduck.scraper_daily
  GROUP BY 1, 2
), scoped AS (
  SELECT
    s.hub_partition_date,
    s.inspect_date,
    CASE
      WHEN REGEXP_MATCHES(LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')), '4\\s*sale|4sale') THEN '4sale'
      WHEN LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')) LIKE '%boshmalan%' THEN 'boshmalan'
    END AS site_focus,
    GREATEST(COALESCE(s.unique_phones, 0), COALESCE(sp.scraper_unique_phones, 0)) AS unique_phones,
    COALESCE(s.unique_ads, 0) AS unique_ads
  FROM motherduck.site_daily s
  LEFT JOIN scraper_phone sp
    ON sp.hub_partition_date = s.hub_partition_date
   AND sp.site_id = s.site_id
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
WITH target AS (
  SELECT MAX(hub_partition_date) AS d
  FROM motherduck.hub_daily
  WHERE hub_partition_date::VARCHAR LIKE '${inputs.partition.value}'
), scraper_phone AS (
  SELECT
    hub_partition_date,
    site_id,
    COALESCE(SUM(unique_phones), 0) AS scraper_unique_phones
  FROM motherduck.scraper_daily
  GROUP BY 1, 2
), scoped AS (
  SELECT
    s.hub_partition_date,
    s.inspect_date,
    CASE
      WHEN REGEXP_MATCHES(LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')), '4\\s*sale|4sale') THEN '4sale'
      WHEN LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')) LIKE '%boshmalan%' THEN 'boshmalan'
    END AS site_focus,
    GREATEST(COALESCE(s.unique_phones, 0), COALESCE(sp.scraper_unique_phones, 0)) AS unique_phones,
    COALESCE(s.unique_ads, 0) AS unique_ads
  FROM motherduck.site_daily s
  LEFT JOIN scraper_phone sp
    ON sp.hub_partition_date = s.hub_partition_date
   AND sp.site_id = s.site_id
  CROSS JOIN target t
  WHERE s.hub_partition_date = t.d
    AND s.country IN ${inputs.country_filter.value}
)
SELECT
  COALESCE(SUM(unique_phones), 0) AS total_unique_phones,
  COALESCE(SUM(unique_ads), 0) AS total_unique_ads,
  MAX(hub_partition_date)::VARCHAR AS partition_date,
  MAX(inspect_date)::VARCHAR AS inspect_date,
  COUNT(*) AS websites_in_focus
FROM scoped
WHERE site_focus IN ${inputs.site_focus_filter.value}
```

```phone_focus_daily
WITH scraper_phone AS (
  SELECT
    hub_partition_date,
    site_id,
    COALESCE(SUM(unique_phones), 0) AS scraper_unique_phones
  FROM motherduck.scraper_daily
  GROUP BY 1, 2
), scoped AS (
  SELECT
    s.hub_partition_date,
    CASE
      WHEN REGEXP_MATCHES(LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')), '4\\s*sale|4sale') THEN '4sale'
      WHEN LOWER(COALESCE(s.site_id, '') || ' ' || COALESCE(s.display_name, '') || ' ' || COALESCE(s.website, '')) LIKE '%boshmalan%' THEN 'boshmalan'
    END AS site_focus,
    GREATEST(COALESCE(s.unique_phones, 0), COALESCE(sp.scraper_unique_phones, 0)) AS unique_phones
  FROM motherduck.site_daily s
  LEFT JOIN scraper_phone sp
    ON sp.hub_partition_date = s.hub_partition_date
   AND sp.site_id = s.site_id
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

<div class="dash-filters">
<Grid cols=3 gap=sm>
  <Dropdown name=partition title="Hub run date" data={partition_dates} value=hub_partition_date defaultValue="%">
    <DropdownOption value="%" valueLabel="Latest run" />
  </Dropdown>
  <Dropdown name=country_filter title="Country" data={country_options} value=country multiple selectAllByDefault />
  <Dropdown name=site_focus_filter title="Website focus" data={site_focus_options} value=site_focus multiple selectAllByDefault />
</Grid>
</div>

<div class="dash-meta">
  <span>Run date <strong>{phone_focus_kpis[0]?.partition_date ?? '—'}</strong></span>
  <span class="sep">·</span>
  <span>Listings as of <strong>{phone_focus_kpis[0]?.inspect_date ?? '—'}</strong></span>
</div>

<div class="kpi-row cols-3">
  <KpiCard label="Focus Unique Phones" value={phone_focus_kpis[0]?.total_unique_phones?.toLocaleString()} tone="good" />
  <KpiCard label="Focus Unique Ads" value={phone_focus_kpis[0]?.total_unique_ads?.toLocaleString()} tone="primary" />
  <KpiCard label="Focused Websites" value={phone_focus_kpis[0]?.websites_in_focus} tone="neutral" />
</div>

<div class="kpi-row cols-3 mt-4">
  <KpiCard
    label="Weekly ad change"
    value={weekly_ad_change_summary[0]?.ads_change_pct != null ? `${weekly_ad_change_summary[0].ads_change_pct > 0 ? '+' : ''}${weekly_ad_change_summary[0].ads_change_pct.toFixed(1)}%` : '—'}
    tone={weekly_ad_change_summary[0]?.ads_change_pct > 0 ? 'good' : weekly_ad_change_summary[0]?.ads_change_pct < 0 ? 'bad' : 'neutral'}
  />
  <KpiCard label="This week ads" value={weekly_ad_change_summary[0]?.current_week_ads?.toLocaleString() ?? '—'} tone="primary" />
  <KpiCard label="Last week ads" value={weekly_ad_change_summary[0]?.previous_week_ads?.toLocaleString() ?? '—'} tone="neutral" />
</div>

<div class="stat-line mt-4">
  Categories with positive week-over-week growth show which segments are driving the increase.
</div>

<div class="dash-table-wrap mt-3">
  <DataTable
    data={weekly_ad_change.filter(d => d.ads_change > 0)}
    search=true
    rows=all
    emptySet=pass
    emptyMessage="No category growth was detected versus the previous week."
  >
    <Column id=category title="Category" />
    <Column id=current_week_ads title="This week" fmt=num0 />
    <Column id=previous_week_ads title="Last week" fmt=num0 />
    <Column id=ads_change title="Δ ads" fmt=num0 contentType=delta />
    <Column id=ads_change_pct title="Δ %" fmt=pct1 contentType=delta />
  </DataTable>
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
  Category, subcategory, and brand-level drill-down are parsed from scraper names (for example: Used Car / Toyota / Corolla) for the selected run.
</div>

<div class="space-y-3 mt-3">
{#each ads_by_category_focus as c}
  <details class="rounded-lg border border-base-300/70 bg-base-100 p-3">
    <summary class="cursor-pointer font-medium">
      {c.site_focus} / {c.category} - {c.unique_ads?.toLocaleString()} ads
    </summary>
    <div class="dash-table-wrap mt-3">
    <DataTable
      data={ads_by_subcategory_focus.filter(d => d.site_focus === c.site_focus && d.category === c.category)}
      rows=all
      emptySet=pass
      emptyMessage="No subcategory rows were found for this category in scraper names."
    >
      <Column id=subcategory title="Subcategory" />
      <Column id=unique_ads title="Unique ads" fmt=num0 />
      <Column id=sheet_rows title="Sheet rows" fmt=num0 />
      <Column id=sheets_count title="Sheets" />
    </DataTable>
    </div>

    {#if ads_by_level3_focus.filter(d => d.site_focus === c.site_focus && d.category === c.category).length}
      <div class="space-y-3 mt-3">
      {#each ads_by_subcategory_focus.filter(d => d.site_focus === c.site_focus && d.category === c.category) as sc}
        {#if ads_by_level3_focus.filter(d => d.site_focus === sc.site_focus && d.category === sc.category && d.subcategory === sc.subcategory).length}
          <details class="rounded-lg border border-base-300/60 bg-base-100/70 p-3">
            <summary class="cursor-pointer font-medium">
              {sc.subcategory} - {sc.unique_ads?.toLocaleString()} ads
            </summary>
            <div class="dash-table-wrap mt-3">
            <DataTable
              data={ads_by_level3_focus.filter(d => d.site_focus === sc.site_focus && d.category === sc.category && d.subcategory === sc.subcategory)}
              rows=all
              emptySet=pass
              emptyMessage="No brand-level rows exist for this subcategory."
            >
              <Column id=level_3 title="Brand / Level 3" />
              <Column id=unique_ads title="Unique ads" fmt=num0 />
              <Column id=sheet_rows title="Sheet rows" fmt=num0 />
              <Column id=sheets_count title="Sheets" />
            </DataTable>
            </div>
          </details>
        {/if}
      {/each}
      </div>
    {/if}
  </details>
{/each}
</div>