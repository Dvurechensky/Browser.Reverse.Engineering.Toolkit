<div align="center" style="margin: 20px 0; padding: 10px; background: #1c1917; border-radius: 10px;">
  <strong>Language:</strong>
  <span style="color: #F5F752; margin: 0 10px;">Russian current</span>
  |
  <a href="./README.md" style="color: #0891b2; margin: 0 10px;">English</a>
</div>

<h1 align="center">SiteReconstructor</h1>

<p align="center">Оффлайн-генератор отчётов для capture-пакетов SiteSnapshotter и SiteCrawlerSnapshotter.</p>

<h2 align="center">Универсальный запуск</h2>

Теперь не нужен отдельный npm script под каждый сайт. Реконструктор может сам вывести разумную папку отчёта из данных capture:

```bash
cd SiteReconstructor
npm run reconstruct -- --input ../SiteCrawlerSnapshotter/captures/example_com/session/2026-04-27T10-00-00-000Z
```

Если `--output` не задан, путь отчёта строится автоматически по захваченному host.

<h2 align="center">Что получается на выходе</h2>

- architecture и API map
- scenario и telemetry views
- storage и IndexedDB intelligence
- entity extraction и security hints
- Postman, OpenAPI, TypeScript SDK и MockServer exports

<h2 align="center">Куда дальше</h2>

- [README на английском](./README.md)
- [Оглавление документации](./docs/index.ru.md)
- [Корневой README](../README.ru.md)
