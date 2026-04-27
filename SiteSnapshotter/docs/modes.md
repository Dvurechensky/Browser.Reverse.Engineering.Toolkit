<!-- doc-nav:start -->
<div align="center">
[Project README](../README.md) | [Docs Index](./index.md) | [Root README](../../README.md) | [Русская версия](./modes.ru.md)
</div>
<!-- doc-nav:end -->

# Режимы захвата

## quick

Быстрый scan. Подходит, когда нужно быстро понять, что за страница открыта.

Обычно собирает:

- `page.json`;
- `dom.json`;
- `forms.json`;
- `css.json`;
- `jsenv.json`;
- `storage.json`;
- `network.json`;
- `assets.json`;
- `routes.json`;
- `auth.json`;
- `framework.json`;
- `security.json`;
- `entities.json`;
- `performance.json`;
- `timeline.json`;
- `analysis.json`;
- `screenshot_meta.json`.

## deep

Расширенный технический capture.

Отличия:

- включает active network hooks;
- собирает больше DOM/CSS деталей;
- включает intelligence-модули, доступные для deep/session/intel;
- полезен для SPA и сложных фронтендов.

## session

Режим сценарной записи.

Используется так:

```javascript
SiteSnapshotter.watch()
// действия на сайте
await SiteSnapshotter.run('session')
```

Фокус:

- route changes;
- API после действий;
- клики;
- формы;
- input/change;
- modal events;
- storage changes;
- DOM mutation bursts.

## intel

Максимально глубокий режим.

Фокус:

- telemetry parsing;
- schema mining;
- runtime state;
- feature flags;
- module graph;
- endpoints map;
- state map;
- tech tree;
- confidence;
- evidence;
- intelligence report.

Рекомендуется для подготовки данных к `SiteReconstructor`.
