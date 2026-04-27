;(function SiteSnapshotterConfig(global) {
  "use strict";

  global.SiteSnapshotterConfig = {
    mode: "quick",
    download: true,
    minify: false,
    exportChunksOnRun: false,
    includeComputedStyles: false,
    includeFullHtml: false,
    includeCssRules: false,
    includeShadowDom: true,
    installHooks: false,
    responsePreviewLimit: 4096,
    valuePreviewLimit: 2048,
    htmlLimit: 2500000,
    maxElements: 6000,
    maxCssRules: 25000,
    fileName: null,
    mineRuntimeState: false,
    mineFeatureFlags: false,
    packageSchema: "site-snapshotter.capture-package.v4"
  };
})(window);
