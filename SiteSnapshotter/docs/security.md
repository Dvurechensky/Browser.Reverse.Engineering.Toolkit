<!-- doc-nav:start -->
<div align="center">
[Project README](../README.md) | [Docs Index](./index.md) | [Root README](../../README.md) | [Русская версия](./security.ru.md)
</div>
<!-- doc-nav:end -->

# Безопасность и ограничения

SiteSnapshotter — это клиентский инструмент наблюдения. Он не должен использоваться как средство атаки.

## Что инструмент делает

- Анализирует уже загруженную страницу.
- Читает то, что доступно JavaScript-коду текущей страницы.
- Перехватывает новые запросы после `watch()` или режимов `deep/session/intel`.
- Маскирует чувствительные значения.
- Экспортирует структурированные capture-файлы.

## Что инструмент не делает

- Не обходит авторизацию.
- Не читает HttpOnly cookies.
- Не извлекает серверный исходный код.
- Не получает приватные базы данных.
- Не делает внешние запросы.
- Не атакует сайт.
- Не брутфорсит API.
- Не извлекает недоступные браузеру данные.

## Маскирование

Единый sanitizer маскирует:

- token;
- jwt;
- password;
- passwd;
- cookie;
- session;
- sid;
- auth;
- authorization;
- bearer;
- csrf;
- xsrf;
- api_key;
- apikey;
- secret;
- access_token;
- refresh_token.

Также маскируются значения, похожие на JWT или bearer token.

## Ограничения browser-side подхода

### HTTP headers

Не все response headers видны JavaScript-коду. Например, security headers могут быть доступны только браузеру, но не странице.

### Screenshot

In-page JavaScript не может сделать настоящий screenshot без browser extension, CDP, Playwright или внешней автоматизации.

### Network history

Active hooks видят только запросы, сделанные после установки hooks.

Для лучшего результата:

```javascript
SiteSnapshotter.watch()
// действия на сайте
await SiteSnapshotter.run('intel')
```

### Source maps

`source_maps.json` фиксирует hints и вероятные пути, но не скачивает sourcemap-файлы самостоятельно.
