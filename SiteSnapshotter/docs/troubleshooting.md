<!-- doc-nav:start -->
<div align="center">
[Project README](../README.md) | [Docs Index](./index.md) | [Root README](../../README.md) | [Русская версия](./troubleshooting.ru.md)
</div>
<!-- doc-nav:end -->

# Troubleshooting

## `exportChunks()` скачал не все файлы

Браузер мог заблокировать множественные downloads.

Решения:

```javascript
await SiteSnapshotter.exportChunks(pack, { downloadDelayMs: 700 })
```

или:

```javascript
SiteSnapshotter.exportZip(pack)
```

## `network.json` почти пустой

Вероятно, hooks были установлены после основной загрузки.

Используйте:

```javascript
SiteSnapshotter.watch()
// выполнить действия
await SiteSnapshotter.run('intel')
```

## `scenario.json` пустой

Нужно начать с `watch()` и реально взаимодействовать со страницей:

```javascript
SiteSnapshotter.watch()
// клики, формы, навигация
await SiteSnapshotter.run('session')
```

## `schemas.json` не содержит response shape

Причины:

- response не JSON;
- body слишком большой;
- body нельзя прочитать;
- запрос был сделан до установки hooks;
- CORS/браузерные ограничения;
- сайт использует бинарный формат.

## `runtime_state.json` не нашёл store

Не все приложения раскрывают store в `window`. Многие state managers закрыты внутри bundle scope.

Проверьте:

```javascript
SiteSnapshotter.inspect('jsenv')
SiteSnapshotter.inspect('runtime_state')
```

## `framework.json` ошибся

Это эвристика, а не гарантированная истина. Смотрите:

- `confidence.json`;
- `evidence.json`;
- `tech_tree.json`;
- `assets.json`;
- `jsenv.json`.

## В console видны ошибки модулей

v4 не ломает весь capture из-за одного модуля. Ошибка попадёт в соответствующий JSON:

```json
{
  "error": true,
  "module": "name",
  "message": "..."
}
```

Также `report()` покажет `Errors count`.
