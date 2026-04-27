<div align="center" style="margin: 20px 0; padding: 10px; background: #1c1917; border-radius: 10px;">
  <strong>Language:</strong>
  <a href="./README.ru.md" style="color: #F5F752; margin: 0 10px;">Russian</a>
  |
  <span style="color: #0891b2; margin: 0 10px;">English current</span>
</div>

<h1 align="center">SiteReconstructor</h1>

<p align="center">Offline report generator for SiteSnapshotter and SiteCrawlerSnapshotter capture packages.</p>

<h2 align="center">Universal Run</h2>

You no longer need a site-specific npm script. The reconstructor can infer a sensible report folder from the capture itself:

```bash
cd SiteReconstructor
npm run reconstruct -- --input ../SiteCrawlerSnapshotter/captures/example_com/session/2026-04-27T10-00-00-000Z
```

If `--output` is omitted, the report path is derived automatically from the captured host.

<h2 align="center">What You Get</h2>

- architecture and API maps
- scenario and telemetry views
- storage and IndexedDB intelligence
- entity extraction and security hints
- Postman, OpenAPI, TypeScript SDK, and MockServer exports

<h2 align="center">Where To Go Next</h2>

- [Russian README](./README.ru.md)
- [Docs index](./docs/index.md)
- [Main repository README](../README.md)
