;(function SiteSnapshotterScenarioModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.scenario = {
    name: "scenario",
    output: "scenario.json",
    description: "Граф пользовательских действий: clicks, submits, route changes, modals, API after click и DOM mutation bursts.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ mode: "session", download: false }).then(function (pack) {
        return pack.files["scenario.json"];
      });
    }
  };
})(window);
