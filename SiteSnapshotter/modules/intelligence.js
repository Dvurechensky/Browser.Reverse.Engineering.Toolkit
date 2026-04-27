;(function SiteSnapshotterIntelligenceModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.intelligence = {
    name: "intelligence",
    output: "intelligence.json",
    description: "Высокоуровневый intelligence-отчёт: site type, stack, backend guess, live features, telemetry level, state management, API complexity и risk score.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ mode: "intel", download: false }).then(function (pack) {
        return pack.files["intelligence.json"];
      });
    }
  };
})(window);
