;(function SiteSnapshotterEvidenceModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.evidence = {
    name: "evidence",
    output: "evidence.json",
    description: "Registry-модуль доказательств для framework, backend, telemetry, source maps и других важных выводов.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ mode: "intel", download: false }).then(function (pack) {
        return pack.files["evidence.json"];
      });
    }
  };
})(window);
