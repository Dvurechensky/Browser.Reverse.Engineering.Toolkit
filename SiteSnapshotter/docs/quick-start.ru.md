<!-- doc-nav:start -->
<div align="center">
[README проекта](../README.ru.md) | [Оглавление](./index.ru.md) | [Корневой README](../../README.ru.md) | [English version](./quick-start.md)
</div>
<!-- doc-nav:end -->

<h1 align="center">Быстрый старт SiteSnapshotter</h1>

<p align="center">Снимите живую браузерную сессию через DevTools.</p>

## Шаги

1. Откройте целевой сайт в браузере.
2. Откройте DevTools.
3. Вставьте `SiteSnapshotter/injector.js` в Console.
4. Запустите запись сессии и capture:

```javascript
SiteSnapshotter.watch()
const pack = await SiteSnapshotter.run({ mode: "intel", download: false })
await SiteSnapshotter.exportChunks(pack)
```

## Полезные команды

```javascript
SiteSnapshotter.report()
SiteSnapshotter.inspect()
SiteSnapshotter.inspect("storage")
SiteSnapshotter.stop()
```

## Следующий шаг

Передайте экспортированную capture-папку в `SiteReconstructor`.
