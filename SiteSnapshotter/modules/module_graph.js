;(function SiteSnapshotterModuleGraphModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.module_graph = {
    name: "module_graph",
    output: "module_graph.json",
    description: "Инференс внутренних frontend-подсистем по telemetry names, globals, chunks, routes и event names.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ mode: "intel", download: false }).then(function (pack) {
        return pack.files["module_graph.json"];
      });
    }
  };
})(window);
