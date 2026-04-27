<div align="center" style="margin: 20px 0; padding: 10px; background: #1c1917; border-radius: 10px;">
  <strong>Language:</strong>
  <span style="color: #F5F752; margin: 0 10px;">Russian current</span>
  |
  <a href="./README.md" style="color: #0891b2; margin: 0 10px;">English</a>
</div>

<h1 align="center">SiteCrawlerSnapshotter</h1>

<p align="center">Playwright orchestration layer для одной потоковой сессии на целевой сайт.</p>

<h2 align="center">Базовая модель</h2>

Проект поднимает persistent Chromium profile, инжектит `SiteSnapshotter`, переживает redirect, обходит найденные внутренние URL и в конце пишет один финальный session capture на диск.

```bash
cd SiteCrawlerSnapshotter
npm install
npx playwright install chromium
node src/index.js --url https://example.com --auth none --max-pages 30
```

<h2 align="center">Ключевые возможности</h2>

- `auth none|manual|auto|profile`
- одна потоковая сессия вместо набора разрозненных page-capture
- redirect-safe automation
- discovery из DOM, routes, network, forms, manifest, sitemap, cache, service worker, JS и IndexedDB hints

<h2 align="center">Куда дальше</h2>

- [README на английском](./README.md)
- [Корневой README](../README.ru.md)
