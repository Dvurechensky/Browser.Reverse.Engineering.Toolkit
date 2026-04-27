;(function SiteSnapshotterStateMapModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.state_map = {
    name: "state_map",
    output: "state_map.json",
    description: "Registry-модуль карты runtime state stores: тип, источник, ключи, masking и confidence.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ mode: "intel", download: false }).then(function (pack) {
        return pack.files["state_map.json"];
      });
    }
  };
})(window);
