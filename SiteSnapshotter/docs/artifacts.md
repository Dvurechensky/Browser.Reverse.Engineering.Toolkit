<!-- doc-nav:start -->
<div align="center">
[Project README](../README.md) | [Docs Index](./index.md) | [Root README](../../README.md) | [Русская версия](./artifacts.ru.md)
</div>
<!-- doc-nav:end -->

# Справочник артефактов

Этот файл описывает, за что отвечает каждый JSON-файл capture-пакета и что он возвращает.

## `page.json`

Метаданные страницы.

Возвращает:

- `url`;
- `host`;
- `hostname`;
- `title`;
- `timestamp`;
- `viewport`;
- `language`;
- `referrer`;
- `userAgent`;
- `charset`;
- `visibilityState`.

Используется как паспорт capture.

## `dom.json`

Снимок DOM и структурные признаки интерфейса.

Возвращает:

- doctype;
- полный HTML или preview;
- head/body preview;
- counts;
- semantic blocks;
- buttons;
- links;
- forms;
- tables;
- dialogs;
- hidden sections;
- iframes;
- custom elements;
- layout hints: navbar, sidebar, footer, cards, pagination, dashboard blocks;
- shadow DOM, если доступен.

## `forms.json`

Инвентаризация форм.

Возвращает:

- список форм;
- action/method;
- inputs;
- buttons;
- classification.

Классификации:

- `login`;
- `register`;
- `search`;
- `payment`;
- `admin_filter`;
- `generic`.

## `css.json`

CSS-снимок.

Возвращает:

- stylesheet URLs;
- inline styles;
- styleSheets metadata;
- css rules, если режим позволяет;
- font-face;
- media queries;
- utility frameworks;
- used classes;
- computed styles, если включено.

Определяет:

- Tailwind;
- Bootstrap;
- Material UI;
- Chakra;
- Ant Design.

## `jsenv.json`

JavaScript runtime environment.

Возвращает:

- количество window keys;
- список window keys;
- known globals;
- state container hints;
- build hints;
- runtime configs.

Помогает найти:

- Webpack/Vite/Rollup/Parcel hints;
- Redux/Apollo/store-like globals;
- public runtime configs.

## `storage.json`

Данные браузерного storage.

Возвращает:

- cookies;
- localStorage;
- sessionStorage;
- IndexedDB database names;
- Cache Storage names;
- Service Worker registrations.

Все чувствительные значения маскируются.

## `network.json`

Сетевая активность.

Возвращает:

- passive resource timing;
- active log из hooks;
- category counts.

Категории:

- `auth`;
- `api`;
- `graphql`;
- `analytics`;
- `telemetry`;
- `ads`;
- `media`;
- `upload`;
- `download`;
- `chat`;
- `presence`;
- `polling`;
- `config`;
- `static`;
- `other`.

Для active entries может содержать:

- method;
- url;
- status;
- request headers;
- request body preview;
- response headers;
- response preview;
- request/response JSON signals;
- category;
- action trigger.

## `assets.json`

Ресурсы страницы.

Возвращает:

- images;
- inline SVG count/samples;
- fonts;
- favicons;
- manifest;
- scripts;
- styles;
- background image URLs;
- video URLs;
- audio URLs.

## `routes.json`

Маршруты и навигационные признаки.

Возвращает:

- current route;
- anchors;
- same-origin routes;
- history changes;
- SPA transitions.

## `auth.json`

Признаки авторизации.

Возвращает:

- JWT markers;
- CSRF tokens;
- OAuth providers;
- login forms;
- session cookies;
- refresh token markers;
- auth changes.

Значения токенов маскируются.

## `framework.json`

Scoring engine технологий.

Возвращает:

- `frontend`;
- `backend_guess`;
- `evidence`.

Определяет:

- React;
- Vue;
- Angular;
- Next.js;
- Nuxt;
- Svelte;
- Webpack;
- Vite;
- Rollup;
- Parcel;
- Custom SPA Runtime;
- jQuery;
- Tailwind/Bootstrap/Material UI/Chakra/Ant Design;
- backend guesses: ASP.NET Core, Laravel, Django, Java/Spring, PHP, Node/Express, WordPress, Shopify.

## `security.json`

Поверхность безопасности, видимая клиенту.

Возвращает:

- CSP meta;
- iframe sandbox;
- captcha presence;
- Cloudflare challenge markers;
- reCAPTCHA;
- Sentry;
- OAuth providers;
- public keys;
- analytics vendors;
- visible cookie hints;
- ограничение по HTTP headers.

## `entities.json`

Бизнес-сущности.

Возвращает:

- список entities со score;
- sources.

Ищет:

- users;
- messages;
- friends;
- groups;
- products;
- orders;
- courses;
- payments;
- tickets;
- stories;
- notifications;
- roles;
- permissions;
- events;
- profiles;
- comments;
- uploads.

## `performance.json`

Производительность и порядок загрузки.

Возвращает:

- timeOrigin;
- navigation entries;
- resource entries;
- first resources;
- chunk load order;
- slow requests;
- lazy loaded bundles;
- counts by initiator type.

## `timeline.json`

Временная шкала capture/session.

Возвращает события:

- page loaded;
- hooks installed;
- watch started/stopped;
- route changes;
- fetch/xhr/beacon;
- clicks;
- submits;
- storage changes;
- modal events.

## `telemetry.json`

Телеметрия.

Возвращает:

- events;
- aggregates.

Для события:

- provider;
- endpoint;
- event name;
- modules;
- raw type;
- category;
- confidence;
- timestamp;
- payload keys.

Источники:

- sendBeacon;
- fetch;
- XMLHttpRequest;
- analytics endpoints;
- stats/metrics/diagnostics URLs;
- JSON payload keys.

## `schemas.json`

Схемы JSON-запросов и ответов.

Возвращает карту endpoint -> schema info:

- request shape;
- request keys;
- response shape;
- response keys;
- entities;
- pagination hints;
- id fields;
- methods;
- samples;
- category.

Если response body прочитать нельзя, данные могут отсутствовать или быть частичными.

## `runtime_state.json`

Runtime state mining.

Возвращает:

- known initial states;
- containers;
- stateStoresFound;
- nextDataPresent;
- nuxtStatePresent.

Ищет:

- Redux;
- Apollo;
- React Query;
- Pinia;
- Zustand;
- MobX;
- `window.__INITIAL_STATE__`;
- `window.__NEXT_DATA__`;
- `window.__NUXT__`;
- похожие store/state globals.

## `feature_flags.json`

Флаги и эксперименты.

Возвращает:

- `flags`;
- `count`;
- `sources`.

Ищет:

- beta flags;
- experiments;
- A/B tests;
- role gates;
- hidden features;
- config toggles;
- rollout settings.

Источники:

- globals;
- localStorage/sessionStorage;
- network config responses.

## `module_graph.json`

Граф внутренних модулей frontend.

Возвращает:

- modules;
- edges.

Модуль содержит:

- name;
- score;
- sources;
- evidence_count.

Шумодав фильтрует:

- stopwords;
- случайные hash-like строки;
- слишком длинные имена;
- одноразовые технические идентификаторы.

Источники:

- telemetry;
- routes;
- network;
- assets/chunks;
- globals.

## `scenario.json`

Граф пользовательского поведения.

Возвращает список шагов:

- click;
- submit;
- input;
- change;
- route_change;
- api;
- modal_opened/modal_hidden.

API событие связывается с ближайшим пользовательским действием за последние 3 секунды:

```json
{
  "action": "api",
  "value": "/api/messages",
  "after": "click:Messages",
  "delay_ms": 430
}
```

## `source_maps.json`

Source map hints.

Возвращает:

- `present`;
- `mapFiles`;
- `sourceMappingURLHints`;
- `probableHiddenMaps`.

Не скачивает source maps сам, только фиксирует наличие и вероятные пути.

## `intelligence.json`

Высокоуровневый итоговый отчёт.

Возвращает:

- site_type;
- frontend_stack;
- backend_guess;
- live_features;
- telemetry_level;
- telemetry_providers;
- state_management;
- api_complexity;
- main_modules;
- feature_flags_count;
- scenario_steps;
- risk_score.

Это главный файл для быстрого понимания сайта.

## `endpoints.json`

Карта API endpoints.

Возвращает:

- normalized URL без query noise;
- method;
- category;
- count;
- request schema;
- response schema;
- entities;
- triggered_by;
- confidence.

Пример нормализации:

```text
/api/messages?offset=10
/api/messages?offset=20
```

становится:

```text
/api/messages
```

## `state_map.json`

Карта state stores.

Возвращает:

- type;
- source;
- keys;
- masked;
- confidence.

Типы:

- redux;
- apollo;
- react_query;
- pinia;
- zustand;
- mobx;
- next_data;
- nuxt_state;
- custom.

## `tech_tree.json`

Дерево технических слоёв.

Возвращает:

- frontend.ui;
- frontend.framework;
- frontend.bundlers;
- frontend.state;
- frontend.telemetry;
- backend.guess;
- backend.evidence;
- security.captcha;
- security.oauth;
- security.monitoring.

Нужно для архитектурной карты.

## `confidence.json`

Оценки уверенности.

Возвращает confidence для:

- backend guess;
- frontend stack;
- telemetry level.

Каждая запись содержит:

- value;
- confidence;
- evidence.

## `evidence.json`

Доказательства выводов.

Возвращает массив `items`.

Элемент:

- type;
- claim;
- evidence;
- source;
- confidence.

Примеры:

- Webpack detected;
- PHP guessed;
- telemetry event found;
- source map visible.

## `analysis.json`

Сводный legacy-compatible анализ.

Возвращает:

- site_type;
- frontend;
- backend_guess;
- auth;
- main_entities;
- api_count;
- pages_seen;
- risks;
- notes.

## `screenshot_meta.json`

Метаданные screenshot.

Возвращает:

- captured: false;
- reason;
- viewport;
- documentSize.

Важно: обычный in-page JavaScript не может сделать настоящий screenshot без browser extension, CDP, Playwright или внешней автоматизации.

## `manifest.json`

Manifest экспорта.

Возвращает:

- domain;
- folder;
- fileNames;
- registryFiles;
- zipReady;
- exportHint.

Используется для восстановления логической структуры `captures/domain/date/`.
## IndexedDB deep snapshot

`storage.json.indexedDB` includes a bounded deep snapshot when the browser exposes database names:

- `databases[]`: database name, version, readability, store count and truncation flags;
- `databases[].stores[]`: object store name, key path, auto-increment flag, record count and indexes;
- `databases[].stores[].records[]`: masked sample records with key, primary key, value preview and extracted signals;
- record signals: JSON keys, entity-like names, route strings, URL strings, pagination hints and sensitive-key flags.

The snapshot is intentionally limited by `indexedDBDatabaseLimit`, `indexedDBStoreLimit` and `indexedDBRecordLimit` to keep exports usable and privacy-aware.
