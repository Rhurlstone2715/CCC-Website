# Search visibility improvements — 28 November 2026

Public category and equipment pages now include server-rendered content, unique titles/descriptions, canonical URLs, social previews, breadcrumb/product/local business structured data, and crawlable links. The sitemap includes visible inventory only. Private account/admin/API pages and booking documents are excluded from indexing. No customer records, booking prices, rewards or payment workflows were changed by this release.

Images have optimized display variants; originals remain available. Public assets use compression, responsive hero images, bundled requests and content-hashed caching. Validate rankings and real-user performance over time; technical audit scores do not guarantee traffic or search positions.

## Owner actions

1. In GoDaddy, open the domain's DNS > Forwarding and edit existing root-domain forwarding. Use destination `https://www.caymancrane.com`, Permanent (301), Forward only (unmasked). Test both the homepage and a deeper URL such as `https://caymancrane.com/rentals?category=cranes`. The destination should retain the path/query and use HTTPS. If deeper URLs still return 404, ask GoDaddy support for path-preserving forwarding. Do not change nameservers or mail records as part of this fix.
2. Verify ownership in Google Search Console and submit `https://www.caymancrane.com/sitemap.xml`. Inspect `/rentals` and representative equipment pages. Review indexing, search queries and Core Web Vitals after Google recrawls the site.
3. Keep the Google Business Profile's name, address, phone, website and actual service area accurate. Add genuine project photos and request honest customer reviews.

GoDaddy forwarding and Search Console submissions were not performed: those accounts are not connected.

## Validation

249 automated tests passed. Local browser checks found no script errors or mobile horizontal overflow. All 108 sitemap pages and 90 referenced images passed the local crawl. Technical SEO and accessibility audits reached 100/100 before final request bundling; lab results are not field ranking or Core Web Vitals guarantees.

## References

- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/appearance/structured-data/local-business
- https://www.godaddy.com/help/edit-my-domain-forwarding-19978
