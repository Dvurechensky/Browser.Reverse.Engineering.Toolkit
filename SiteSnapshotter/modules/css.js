;(function SiteSnapshotterCssModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.css = {
    name: "css",
    output: "css.json",
    description: "Сборщик CSS: stylesheet URLs, inline styles, CSS rules, font-face, media queries, classes и utility framework hints.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ download: false }).then(function (pack) {
        return pack.files["css.json"];
      });
    }
  };
})(window);
