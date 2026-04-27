;(function SiteSnapshotterConfidenceModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.confidence = {
    name: "confidence",
    output: "confidence.json",
    description: "Registry-модуль confidence scores для ключевых архитектурных выводов.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ mode: "intel", download: false }).then(function (pack) {
        return pack.files["confidence.json"];
      });
    }
  };
})(window);
