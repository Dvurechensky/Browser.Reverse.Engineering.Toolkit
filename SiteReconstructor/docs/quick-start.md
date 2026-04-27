<!-- doc-nav:start -->
<p align="center">
  <sub>
    <a href="../README.md">Project README</a>
    &nbsp;•&nbsp;
    <a href="./index.md">Docs Index</a>
    &nbsp;•&nbsp;
    <a href="../../README.md">Root README</a>
    &nbsp;•&nbsp;
    <a href="./quick-start.ru.md">Russian version</a>
  </sub>
</p>
<!-- doc-nav:end -->

<h1 align="center">SiteReconstructor Quick Start</h1>

<p align="center">Generate a report from any compatible capture folder without creating a site-specific script.</p>

## Requirements

- Node.js 18+
- a capture folder from `SiteSnapshotter` or `SiteCrawlerSnapshotter`
- local `dotnet` only if MockServer generation is needed

## Universal Run

```bash
cd SiteReconstructor
npm run reconstruct -- --input ../SiteCrawlerSnapshotter/captures/example_com/session/2026-04-27T10-00-00-000Z
```

If `--output` is omitted, the report folder is derived automatically from the captured host.
