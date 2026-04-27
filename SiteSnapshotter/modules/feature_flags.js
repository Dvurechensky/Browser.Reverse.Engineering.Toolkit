;(function SiteSnapshotterFeatureFlagsModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.feature_flags = {
    name: "feature_flags",
    output: "feature_flags.json",
    description: "Поиск beta flags, experiments, A/B tests, role gates, hidden features и config toggles.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ mode: "intel", download: false }).then(function (pack) {
        return pack.files["feature_flags.json"];
      });
    }
  };
})(window);
