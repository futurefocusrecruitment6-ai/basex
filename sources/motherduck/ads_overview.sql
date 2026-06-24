SELECT
  hub_partition_date,
  inspect_date,
  total_unique_ads,
  sites_total,
  sites_ok,
  sites_failed,
  sites_missing,
  total_alerts
FROM hub_daily
ORDER BY hub_partition_date DESC
