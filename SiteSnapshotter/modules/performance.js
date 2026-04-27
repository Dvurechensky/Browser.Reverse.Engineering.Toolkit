;(function SiteSnapshotterPerformanceModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.performance = {
    name: "performance",
    output: "performance.json",
    description: "Сборщик performance: load timing, first resources, chunk load order, slow requests и lazy loaded bundles.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ download: false }).then(function (pack) {
        return pack.files["performance.json"];
      });
    }
  };
})(window);
