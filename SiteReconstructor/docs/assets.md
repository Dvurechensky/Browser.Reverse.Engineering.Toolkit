<!-- doc-nav:start -->
<div align="center">
[Project README](../README.md) | [Docs Index](./index.md) | [Root README](../../README.md) | [Russian version](./assets.ru.md)
</div>
<!-- doc-nav:end -->

<h1 align="center">Assets Mode</h1>

Use `--assets` when you want the report to include an asset manifest and prepared folder layout for later resource work.

## Run

```bash
npm run reconstruct -- --input <capture-folder> --assets
```

## Output

- `data/asset_manifest.json`
- `downloaded_assets/css/`
- `downloaded_assets/js/`
- `downloaded_assets/img/`
- `downloaded_assets/fonts/`
- `downloaded_assets/media/`
- `downloaded_assets/json/`
- `downloaded_assets/other/`
