<!-- doc-nav:start -->
<div align="center">
[Project README](../README.md) | [Docs Index](./index.md) | [Root README](../../README.md) | [Русская версия](./workflows.ru.md)
</div>
<!-- doc-nav:end -->

# Workflow и сценарии

## Базовый intelligence workflow

```javascript
const pack = await SiteSnapshotter.run({
  mode: 'intel',
  download: false
})

SiteSnapshotter.report()
SiteSnapshotter.inspect('intelligence')
SiteSnapshotter.inspect('endpoints')
await SiteSnapshotter.exportChunks(pack)
```

## Поведенческий workflow

```javascript
SiteSnapshotter.watch()

// 1. login
// 2. перейти в dashboard
// 3. открыть список сущностей
// 4. открыть карточку сущности
// 5. отправить форму
// 6. открыть модальное окно
// 7. выполнить logout

const pack = await SiteSnapshotter.run({
  mode: 'intel',
  download: false
})

SiteSnapshotter.inspect('scenario')
SiteSnapshotter.inspect('endpoints')
SiteSnapshotter.inspect('schemas')
await SiteSnapshotter.exportChunks(pack)
SiteSnapshotter.stop()
```

## Что проверять после capture

1. `intelligence.json` — общий вывод.
2. `endpoints.json` — API карта.
3. `schemas.json` — структуры данных.
4. `scenario.json` — связь действий и API.
5. `module_graph.json` — внутренние подсистемы.
6. `state_map.json` — runtime state.
7. `evidence.json` — доказательства.
8. `confidence.json` — уверенность эвристик.

## Workflow для SiteReconstructor

Для будущего реконструктора особенно важны:

- `page.json`;
- `dom.json`;
- `forms.json`;
- `routes.json`;
- `network.json`;
- `endpoints.json`;
- `schemas.json`;
- `entities.json`;
- `scenario.json`;
- `module_graph.json`;
- `tech_tree.json`;
- `intelligence.json`;
- `evidence.json`;
- `confidence.json`.

Эти файлы дают карту:

```text
страницы -> действия -> API -> схемы -> сущности -> модули -> технологические слои
```
