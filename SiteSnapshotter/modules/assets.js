;(function SiteSnapshotterAssetsModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.assets = {
    name: "assets",
    output: "assets.json",
    description: "Сборщик assets: images, SVG, fonts, favicons, manifest, scripts, styles, background images, video и audio.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ download: false }).then(function (pack) {
        return pack.files["assets.json"];
      });
    }
  };
})(window);
