;(function SiteSnapshotterRoutesModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.routes = {
    name: "routes",
    output: "routes.json",
    description: "Сборщик routes: current route, anchors, same-origin routes, history changes и SPA transitions.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ download: false }).then(function (pack) {
        return pack.files["routes.json"];
      });
    }
  };
})(window);
