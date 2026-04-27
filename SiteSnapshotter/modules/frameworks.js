;(function SiteSnapshotterFrameworksModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.frameworks = {
    name: "framework",
    output: "framework.json",
    description: "Scoring engine для frontend technologies и backend guesses на основе видимых браузеру эвристик.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ download: false }).then(function (pack) {
        return pack.files["framework.json"];
      });
    }
  };
})(window);
