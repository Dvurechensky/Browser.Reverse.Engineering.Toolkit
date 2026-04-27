<!-- doc-nav:start -->
<div align="center">
[Project README](../README.md) | [Docs Index](./index.md) | [Root README](../../README.md) | [Русская версия](./quick-start.ru.md)
</div>
<!-- doc-nav:end -->

<h1 align="center">SiteSnapshotter Quick Start</h1>

<p align="center">Capture a live browser session from DevTools.</p>

## Steps

1. Open the target site in your browser.
2. Open DevTools.
3. Paste `SiteSnapshotter/injector.js` into the Console.
4. Start session recording and capture:

```javascript
SiteSnapshotter.watch()
const pack = await SiteSnapshotter.run({ mode: "intel", download: false })
await SiteSnapshotter.exportChunks(pack)
```

## Helpful Commands

```javascript
SiteSnapshotter.report()
SiteSnapshotter.inspect()
SiteSnapshotter.inspect("storage")
SiteSnapshotter.stop()
```

## Next Step

Feed the exported capture folder into `SiteReconstructor`.
