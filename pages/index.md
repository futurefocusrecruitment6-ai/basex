# Monitor Hub — All Sites

Latest hub run summary and per-site status for all websites.

```hub_summary
SELECT * FROM motherduck.hub_daily
ORDER BY hub_partition_date DESC
LIMIT 1
```

```sites_today
SELECT * FROM motherduck.site_daily
WHERE hub_partition_date = (
  SELECT MAX(hub_partition_date) FROM motherduck.hub_daily
)
ORDER BY display_name
```

<BigValue data={hub_summary} value=sites_ok title="Sites OK" />
<BigValue data={hub_summary} value=total_alerts title="Total alerts" />
<BigValue data={hub_summary} value=sites_missing title="Sites missing" />

<DataTable data={sites_today} search=true>
  <Column id=display_name title="Site" />
  <Column id=country />
  <Column id=website />
  <Column id=status />
  <Column id=scrapers_passed title="Passed" />
  <Column id=scrapers_total title="Total scrapers" />
  <Column id=alert_count title="Alerts" />
  <Column id=report_fallback title="Stale report?" />
</DataTable>