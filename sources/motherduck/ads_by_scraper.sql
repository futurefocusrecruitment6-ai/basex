SELECT
  sc.hub_partition_date,
  s.display_name,
  s.country,
  sc.site_id,
  sc.scraper,
  sc.unique_ads,
  sc.total_rows,
  sc.ads_source,
  sc.files_found,
  sc.all_passed
FROM scraper_daily sc
JOIN site_daily s
  ON sc.hub_partition_date = s.hub_partition_date
 AND sc.site_id = s.site_id
ORDER BY sc.hub_partition_date DESC, sc.unique_ads DESC NULLS LAST
