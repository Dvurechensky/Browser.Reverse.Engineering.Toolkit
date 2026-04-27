<div align="center" style="margin: 20px 0; padding: 10px; background: #1c1917; border-radius: 10px;">
  <strong>Language:</strong>
  <span style="color: #F5F752; margin: 0 10px;">Russian current</span>
  |
  <a href="./README.md" style="color: #0891b2; margin: 0 10px;">English</a>
</div>

<h1 align="center">SiteSnapshotter</h1>

<p align="center">Браузерный runtime capture engine для живых веб-приложений.</p>

<h2 align="center">Что делает</h2>

`SiteSnapshotter` работает внутри реальной страницы браузера и собирает структурированные сигналы из текущей сессии:

- DOM и CSS
- assets и сетевую активность
- runtime state и feature flags
- маршруты и таймлайн действий
- cookies, localStorage, sessionStorage, IndexedDB
- Cache Storage и Service Worker сигналы
- endpoint и schema hints

<h2 align="center">Быстрый старт</h2>

```javascript
// Сначала вставьте SiteSnapshotter/injector.js в DevTools Console.
SiteSnapshotter.watch()
const pack = await SiteSnapshotter.run({ mode: "intel", download: false })
await SiteSnapshotter.exportChunks(pack)
```

<h2 align="center">Куда дальше</h2>

- [Оглавление документации](./docs/index.ru.md)
- [README на английском](./README.md)
- [Корневой README](../README.ru.md)
