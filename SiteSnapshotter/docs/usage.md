<!-- doc-nav:start -->
<div align="center">
[Project README](../README.md) | [Docs Index](./index.md) | [Root README](../../README.md) | [Русская версия](./usage.ru.md)
</div>
<!-- doc-nav:end -->

# Использование SiteSnapshotter v4

Этот файл оставлен как практический cheatsheet. Полная документация начинается с [index.md](index.md).

## Рекомендованный порядок анализа

```javascript
SiteSnapshotter.watch()

// пройти важные пользовательские сценарии:
// login, навигация, поиск, открытие модалок, отправка форм, действия с API

const pack = await SiteSnapshotter.run({
  mode: 'intel',
  download: false
})

SiteSnapshotter.report()
SiteSnapshotter.inspect()
SiteSnapshotter.inspect('telemetry')
SiteSnapshotter.inspect('schemas')
SiteSnapshotter.inspect('runtime_state')
SiteSnapshotter.inspect('feature_flags')
SiteSnapshotter.inspect('module_graph')
SiteSnapshotter.inspect('scenario')
SiteSnapshotter.inspect('source_maps')
SiteSnapshotter.inspect('intelligence')
SiteSnapshotter.inspect('endpoints')
SiteSnapshotter.inspect('state_map')
SiteSnapshotter.inspect('tech_tree')
SiteSnapshotter.inspect('confidence')
SiteSnapshotter.inspect('evidence')

await SiteSnapshotter.exportChunks(pack)
SiteSnapshotter.stop()
```

## Если браузер блокирует много скачиваний

```javascript
SiteSnapshotter.exportZip(pack)
```

`exportChunks(pack)` уже скачивает файлы по очереди с задержкой. Если браузер всё равно блокирует массовые downloads, используйте ZIP fallback.

## Что смотреть первым

```javascript
SiteSnapshotter.inspect('intelligence')
SiteSnapshotter.inspect('endpoints')
SiteSnapshotter.inspect('scenario')
SiteSnapshotter.inspect('tech_tree')
SiteSnapshotter.inspect('evidence')
```

## Что передавать в SiteReconstructor

Лучший набор для будущего `SiteReconstructor`:

- `intelligence.json`
- `endpoints.json`
- `schemas.json`
- `scenario.json`
- `module_graph.json`
- `state_map.json`
- `tech_tree.json`
- `evidence.json`
- `confidence.json`
- плюс базовые файлы `page/dom/forms/css/jsenv/storage/network/routes/auth/security/entities/assets/timeline`.
