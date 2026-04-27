;(function SiteSnapshotterSourceMapsModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.source_maps = {
    name: "source_maps",
    output: "source_maps.json",
    description: "Поиск sourceMappingURL hints, *.map ресурсов и вероятных hidden source map paths.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ mode: "intel", download: false }).then(function (pack) {
        return pack.files["source_maps.json"];
      });
    }
  };
})(window);
