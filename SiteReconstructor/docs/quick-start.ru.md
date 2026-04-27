<!-- doc-nav:start -->
<p align="center">
  <sub>
    <a href="../README.ru.md">README проекта</a>
    &nbsp;•&nbsp;
    <a href="./index.ru.md">Оглавление</a>
    &nbsp;•&nbsp;
    <a href="../../README.ru.md">Корневой README</a>
    &nbsp;•&nbsp;
    <a href="./quick-start.md">English version</a>
  </sub>
</p>
<!-- doc-nav:end -->

<h1 align="center">Быстрый старт SiteReconstructor</h1>

<p align="center">Создание отчета из любой совместимой папки захвата без создания скрипта, специфичного для сайта.</p>

## Требования

- Node.js 18+
- папка захвата из `SiteSnapshotter` или `SiteCrawlerSnapshotter`
- локальный `dotnet` только если требуется генерация MockServer

## Универсальный запуск

```bash
cd SiteReconstructor
npm run reconstruct -- --input ../SiteCrawlerSnapshotter/captures/example_com/session/2026-04-27T10-00-00-000Z
```

Если Параметр `--output` опущен, папка с отчетом определяется автоматически на основе захваченного хоста.
