<!-- doc-nav:start -->
<div align="center">
[Project README](../README.md) | [Docs Index](./index.md) | [Root README](../../README.md) | [Русская версия](./api.ru.md)
</div>
<!-- doc-nav:end -->

# Публичный API

## `SiteSnapshotter.run(modeOrOptions)`

Запускает capture pipeline.

```javascript
await SiteSnapshotter.run()
await SiteSnapshotter.run('quick')
await SiteSnapshotter.run('deep')
await SiteSnapshotter.run('session')
await SiteSnapshotter.run('intel')
```

Вариант с настройками:

```javascript
const pack = await SiteSnapshotter.run({
  mode: 'intel',
  download: false,
  minify: false,
  downloadDelayMs: 400
})
```

Возвращает `capture package`:

```javascript
{
  schema: 'site-snapshotter.capture-package.v4',
  version: '0.4.0',
  mode: 'intel',
  createdAt: '...',
  captureRoot: 'captures/example_com/...',
  files: {},
  meta: {},
  manifest: {}
}
```

## `SiteSnapshotter.watch()`

Включает активные hooks и наблюдатели.

Отслеживает:

- `fetch`;
- `XMLHttpRequest`;
- `WebSocket`;
- `navigator.sendBeacon`;
- `history.pushState`;
- `history.replaceState`;
- `popstate`;
- `hashchange`;
- `click`;
- `submit`;
- `input`;
- `change`;
- DOM mutations;
- modal events;
- storage changes.

## `SiteSnapshotter.stop()`

Останавливает watch-режим и восстанавливает перехваченные методы, где это возможно.

```javascript
SiteSnapshotter.stop()
```

## `SiteSnapshotter.export()`

Скачивает последний capture package одним JSON-файлом.

```javascript
SiteSnapshotter.export()
```

## `SiteSnapshotter.exportChunks(pack)`

Скачивает все файлы из `pack.files`.

Особенности:

- порядок берётся из `SiteSnapshotter.registry`;
- нет ручного списка файлов;
- скачивание идёт по очереди;
- между файлами есть задержка;
- прогресс выводится в console;
- при ошибке есть fallback на ZIP.

```javascript
await SiteSnapshotter.exportChunks(pack)
```

## `SiteSnapshotter.exportZip(pack)`

Собирает ZIP в браузере без внешних зависимостей и скачивает одним файлом.

```javascript
SiteSnapshotter.exportZip(pack)
```

## `SiteSnapshotter.inspect(target)`

Показывает данные последнего capture.

```javascript
SiteSnapshotter.inspect()
SiteSnapshotter.inspect('telemetry')
SiteSnapshotter.inspect('telemetry.json')
SiteSnapshotter.inspect('runtime_state')
SiteSnapshotter.inspect('intelligence')
```

Если у модуля есть собственный `inspect()` hook, используется он. Иначе выводятся raw data.

## `SiteSnapshotter.report()`

Собирает итоговую таблицу через registry hooks `module.report()`.

```javascript
SiteSnapshotter.report()
```

## `SiteSnapshotter.overlay()`

Показывает мини-панель поверх сайта.

Панель отображает:

- Mode;
- Requests;
- Telemetry events;
- Feature flags;
- State stores;
- Scenario steps;
- Risk score;
- кнопки Export, Report, Stop.

## `SiteSnapshotter.registry`

Центральный реестр модулей.

```javascript
SiteSnapshotter.registry.list()
SiteSnapshotter.registry.files()
SiteSnapshotter.registry.get('network')
SiteSnapshotter.registry.get('network.json')
SiteSnapshotter.registry.forMode('intel')
```

## `SiteSnapshotter.sanitize(value)`

Единый sanitizer для маскирования секретов.

```javascript
SiteSnapshotter.sanitize({ token: 'abc', user: 'demo' })
```

Маскирует token, jwt, password, cookie, session, sid, authorization, bearer, csrf, xsrf, api key, secret, access token и refresh token.
