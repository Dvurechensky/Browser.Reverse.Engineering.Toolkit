<!-- doc-nav:start -->
<div align="center">
[Project README](../README.md) | [Docs Index](./index.md) | [Root README](../../README.md) | [Русская версия](./export.ru.md)
</div>
<!-- doc-nav:end -->

# Экспорт

## Основные варианты

### Один package JSON

```javascript
SiteSnapshotter.export()
```

Скачивает последний capture package целиком.

### Все файлы отдельно

```javascript
await SiteSnapshotter.exportChunks(pack)
```

`exportChunks()`:

- берёт порядок файлов из `SiteSnapshotter.registry`;
- добавляет неизвестные файлы из `pack.files` в конец;
- скачивает файлы один за другим;
- ждёт между скачиваниями;
- выводит progress в console.

Настройка задержки:

```javascript
await SiteSnapshotter.exportChunks(pack, {
  downloadDelayMs: 500
})
```

### ZIP fallback

```javascript
SiteSnapshotter.exportZip(pack)
```

ZIP собирается прямо в браузере без внешних зависимостей.

Используйте ZIP, если браузер блокирует множественные автоматические скачивания.

## Почему браузер блокирует скачивания

Многие браузеры считают серию автоматических downloads подозрительной. Поэтому v4 делает очередь:

```text
file 1 -> wait 400ms -> file 2 -> wait 400ms -> ...
```

Если политика браузера всё равно блокирует файлы, скачайте ZIP.

## Имена файлов

Браузер не может создать настоящую папку без File System Access API или расширения, поэтому имена делаются плоскими:

```text
captures__vk_com__2026-04-25_11-47-30__network.json
```

Логическая папка хранится в `manifest.json`:

```json
{
  "folder": "captures/vk_com/2026-04-25_11-47-30/"
}
```
