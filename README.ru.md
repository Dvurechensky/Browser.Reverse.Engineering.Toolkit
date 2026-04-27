<div align="center" style="margin: 20px 0; padding: 10px; background: #1c1917; border-radius: 10px;">
  <strong>Language:</strong>
  <span style="color: #F5F752; margin: 0 10px;">Russian current</span>
  |
  <a href="./README.md" style="color: #0891b2; margin: 0 10px;">English</a>
</div>

<p align="center">
  <img src="docs/assets/favicon.ico" width="96" height="96" alt="Browser Reverse Engineering Toolkit Logo" />
</p>

<h1 align="center">
Browser Reverse Engineering Toolkit
</h1>

<p align="center">
  Набор из трех связанных проектов для захвата браузерной сессии, автоматизированного обхода сайта и оффлайн-реконструкции его клиентской архитектуры.
</p>

<p align="center">
  <img src="https://shields.dvurechensky.pro/badge/license-MIT-0891b2" alt="MIT License">
  <img src="https://shields.dvurechensky.pro/badge/status-experimental-a3e635" alt="Experimental">
  <img src="https://shields.dvurechensky.pro/badge/focus-browser%20intelligence-F5F752" alt="Browser Intelligence">
</p>

<h2 align="center">Что это такое</h2>

Этот репозиторий не про взлом и не про обход авторизации. Он работает с тем, что уже доступно в браузерной сессии: DOM, сеть, storage, маршруты, runtime state, telemetry и следы реального пользовательского сценария.

Общий пайплайн такой:

```text
Capture -> Crawl -> Reconstruct -> Review -> Export
```

<h2 align="center">Пример анализа</h2>

![alt text](media/image-3.png)
![alt text](media/image-2.png)
![alt text](media/image-1.png)
![alt text](media/image.png)

- https://dvurechensky.github.io/Browser.Reverse.Engineering.Toolkit/

<h2 align="center">Состав</h2>

### `SiteSnapshotter`

Браузерный движок захвата, который внедряется в открытую страницу через DevTools или через автоматизацию.

- Собирает DOM, CSS, assets, network, routes, cookies, storage, IndexedDB, Cache Storage и Service Worker сигналы.
- Умеет вести запись сессии через `watch()`.
- Выдаёт capture-пакет в JSON.

Документация:

- [README на английском](./SiteSnapshotter/README.md)
- [README на русском](./SiteSnapshotter/README.ru.md)

### `SiteCrawlerSnapshotter`

Playwright-слой для одной потоковой сессии на целевой сайт.

- Работает через persistent Chromium profile.
- Поддерживает `auth none|manual|auto|profile`.
- Переживает redirect и login flow.
- Сам наращивает очередь внутренних URL и пишет один финальный session capture.

Документация:

- [README на английском](./SiteCrawlerSnapshotter/README.md)
- [README на русском](./SiteCrawlerSnapshotter/README.ru.md)

### `SiteReconstructor`

Оффлайн-анализатор и генератор отчётов поверх готовых capture-пакетов.

- Строит представления по архитектуре, API, сценариям, телеметрии, сущностям, storage и security.
- Генерирует HTML-портал и экспортные артефакты.
- Поддерживает Postman, OpenAPI draft, TypeScript SDK draft и MockServers.

Документация:

- [README на английском](./SiteReconstructor/README.md)
- [README на русском](./SiteReconstructor/README.ru.md)

<h2 align="center">Типовой поток</h2>

1. Снять сессию вручную через `SiteSnapshotter` или автоматически через `SiteCrawlerSnapshotter`.
2. Передать итоговую capture-папку в `SiteReconstructor`.
3. Открыть HTML-отчёт и экспортные артефакты.
4. Использовать результат как техническую разведку, основу для интеграции, миграции или due diligence.

<h2 align="center">Кому это полезно</h2>

- reverse engineers
- интеграторам
- frontend/platform-командам
- security-minded аналитикам
- командам миграции и технического due diligence

<h2 align="center">Структура репозитория</h2>

```text
SiteSnapshotter/         браузерный capture engine
SiteCrawlerSnapshotter/  Playwright automation и потоковая запись
SiteReconstructor/       оффлайн-отчёты и export pipeline
scripts/                 вспомогательные build/generation сценарии
docs/                    внутренние заметки и рабочие материалы
```

<h2 align="center">Лицензия</h2>

Репозиторий распространяется по лицензии [MIT](./LICENSE).
