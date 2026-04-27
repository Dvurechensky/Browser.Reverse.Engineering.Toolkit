;(function SiteSnapshotterTechTreeModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.tech_tree = {
    name: "tech_tree",
    output: "tech_tree.json",
    description: "Registry-модуль дерева технических слоёв: UI, framework, bundlers, state, telemetry, backend и security.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ mode: "intel", download: false }).then(function (pack) {
        return pack.files["tech_tree.json"];
      });
    }
  };
})(window);
