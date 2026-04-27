<div align="center" style="margin: 20px 0; padding: 10px; background: #1c1917; border-radius: 10px;">
  <strong>Language:</strong>
  <a href="./README.ru.md" style="color: #F5F752; margin: 0 10px;">Russian</a>
  |
  <span style="color: #0891b2; margin: 0 10px;">English current</span>
</div>

<h1 align="center">SiteSnapshotter</h1>

<p align="center">Browser-side runtime capture engine for live web applications.</p>

<h2 align="center">What It Does</h2>

`SiteSnapshotter` runs inside a real browser page and captures structured signals from the current session:

- DOM and CSS
- assets and network activity
- runtime state and feature flags
- routes and interaction timeline
- cookies, localStorage, sessionStorage, IndexedDB
- Cache Storage and Service Worker signals
- endpoint and schema hints

<h2 align="center">Quick Start</h2>

```javascript
// Paste SiteSnapshotter/injector.js into DevTools Console first.
SiteSnapshotter.watch()
const pack = await SiteSnapshotter.run({ mode: "intel", download: false })
await SiteSnapshotter.exportChunks(pack)
```

<h2 align="center">Where To Go Next</h2>

- [Docs index](./docs/index.md)
- [Russian README](./README.ru.md)
- [Main repository README](../README.md)
