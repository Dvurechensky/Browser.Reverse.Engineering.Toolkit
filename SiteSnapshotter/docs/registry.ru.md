<!-- doc-nav:start -->
<div align="center">
[README проекта](../README.ru.md) | [Оглавление](./index.ru.md) | [Корневой README](../../README.ru.md) | [English version](./registry.md)
</div>
<!-- doc-nav:end -->

<h1 align="center">Registry-модель</h1>

`SiteSnapshotter` строится вокруг общего registry, в котором каждый модуль сам описывает:

- свой файл
- порядок запуска
- поддержку режимов
- inspect/report hooks

Именно это делает export, inspect и report согласованными между собой.
