;(function SiteSnapshotterEndpointsModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.endpoints = {
    name: "endpoints",
    output: "endpoints.json",
    description: "Registry-модуль карты API endpoints: группировка URL без query noise, schema hints, entities, triggers и confidence.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ mode: "intel", download: false }).then(function (pack) {
        return pack.files["endpoints.json"];
      });
    }
  };
})(window);
