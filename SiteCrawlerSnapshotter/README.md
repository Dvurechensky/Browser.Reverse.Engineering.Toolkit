<div align="center" style="margin: 20px 0; padding: 10px; background: #1c1917; border-radius: 10px;">
  <strong>Language:</strong>
  <a href="./README.ru.md" style="color: #F5F752; margin: 0 10px;">Russian</a>
  |
  <span style="color: #0891b2; margin: 0 10px;">English current</span>
</div>

<h1 align="center">SiteCrawlerSnapshotter</h1>

<p align="center">Playwright session orchestrator for one continuous capture per target site.</p>

<h2 align="center">Core Model</h2>

This project launches a persistent Chromium profile, injects `SiteSnapshotter`, survives redirects, walks discovered internal URLs, and writes one final session capture to disk.

```bash
cd SiteCrawlerSnapshotter
npm install
npx playwright install chromium
node src/index.js --url https://example.com --auth none --max-pages 30
```

<h2 align="center">Key Features</h2>

- `auth none|manual|auto|profile`
- one continuous session instead of many isolated page captures
- redirect-safe browser automation
- URL discovery from DOM, routes, network, forms, manifests, sitemap, cache, service worker, JS, and IndexedDB hints

<h2 align="center">Where To Go Next</h2>

- [Russian README](./README.ru.md)
- [Main repository README](../README.md)
