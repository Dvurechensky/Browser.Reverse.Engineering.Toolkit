<!-- doc-nav:start -->
<div align="center">
[Project README](../README.md) | [Docs Index](./index.md) | [Root README](../../README.md) | [Русская версия](./registry.ru.md)
</div>
<!-- doc-nav:end -->

# Registry-архитектура

v4 построен вокруг центрального реестра:

```javascript
SiteSnapshotter.registry
```

## Зачем нужен registry

В старых версиях новые анализаторы могли появиться в `run()`, но не попасть в `exportChunks()`, `inspect()` или `report()`.

v4 решает это архитектурно:

```text
Один модуль = один зарегистрированный артефакт = один экспортируемый файл.
```

## API registry

```javascript
SiteSnapshotter.registry.register(module)
SiteSnapshotter.registry.get(idOrFile)
SiteSnapshotter.registry.list()
SiteSnapshotter.registry.files()
SiteSnapshotter.registry.forMode(mode)
```

## Формат модуля

```javascript
SiteSnapshotter.registry.register({
  id: 'telemetry',
  file: 'telemetry.json',
  modes: ['deep', 'session', 'intel'],
  order: 200,
  collect: async ctx => {},
  inspect: (data, ctx) => data,
  report: (data, reportCtx) => {},
  dependencies: ['network'],
  tags: ['intel', 'network']
})
```

Обязательные поля:

- `id` — стабильный идентификатор;
- `file` — имя JSON-файла;
- `modes` — режимы, в которых модуль запускается;
- `order` — порядок выполнения и экспорта;
- `collect(ctx)` — функция сбора данных.

Опциональные поля:

- `inspect(data, ctx)`;
- `report(data, reportCtx)`;
- `dependencies`;
- `tags`.

## Capture context

Каждый `collect()` получает контекст:

```javascript
{
  config,
  mode,
  capturedAt,
  captureRoot,
  files,
  state,
  registry,
  sanitize
}
```

Через `ctx.files` модуль может читать результаты предыдущих модулей.

## Ошибки модулей

Если модуль падает, весь capture не ломается. В соответствующий файл пишется:

```json
{
  "error": true,
  "module": "telemetry",
  "message": "..."
}
```

`report()` показывает `Errors count`.

## Порядок

Порядок запуска и экспорта определяется `order`. Поэтому `exportChunks()` не содержит ручного списка файлов.
