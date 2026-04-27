;(function SiteSnapshotterTelemetryModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.telemetry = {
    name: "telemetry",
    output: "telemetry.json",
    description: "Глубокий парсер sendBeacon, analytics, stats, metrics и diagnostics events.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ mode: "intel", download: false }).then(function (pack) {
        return pack.files["telemetry.json"];
      });
    }
  };
})(window);
