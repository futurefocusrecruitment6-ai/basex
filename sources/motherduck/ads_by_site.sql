SELECT
  hub_partition_date,
  site_id,
  display_name,
  country,
  website,
  unique_ads,
  scrapers_total,
  scrapers_passed,
  status,
  report_fallback
FROM site_daily
ORDER BY hub_partition_date DESC, unique_ads DESC NULLS LAST
