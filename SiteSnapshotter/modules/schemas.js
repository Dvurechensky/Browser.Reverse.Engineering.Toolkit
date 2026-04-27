;(function SiteSnapshotterSchemasModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.schemas = {
    name: "schemas",
    output: "schemas.json",
    description: "Извлечение схем JSON-запросов и ответов: shape, keys, nested fields, arrays, ids и pagination hints.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ mode: "intel", download: false }).then(function (pack) {
        return pack.files["schemas.json"];
      });
    }
  };
})(window);
