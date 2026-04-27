;(function SiteSnapshotterNetworkModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.network = {
    name: "network",
    output: "network.json",
    description: "Сборщик network: passive performance entries, active fetch/XHR/WebSocket/beacon hooks и категоризация запросов.",
    watch: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.watch();
    },
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ download: false }).then(function (pack) {
        return pack.files["network.json"];
      });
    }
  };
})(window);
