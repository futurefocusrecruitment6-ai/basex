---
title: All sites
description: Index of site detail pages (used for static build).
---

# Sites

Select a website to view scraper health, alerts, and listing history.

```sites
SELECT DISTINCT
  site_id,
  display_name,
  country,
  '/site/' || site_id AS site_link
FROM motherduck.site_daily
WHERE site_id IS NOT NULL
ORDER BY display_name
```

<DataTable
  data={sites}
  link=site_link
  search=true
  rows=all
  emptySet=pass
  emptyMessage="No sites in MotherDuck yet."
>
  <Column id=display_name title="Site" />
  <Column id=country />
  <Column id=site_id title="Site ID" />
</DataTable>

<p class="text-xs text-base-content/50 mt-6">
  <a href="/">← Back to overview</a>
</p>
