;(function SiteSnapshotterEntitiesModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.entities = {
    name: "entities",
    output: "entities.json",
    description: "Извлекатель бизнес-сущностей из UI text и API/resource URLs.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ download: false }).then(function (pack) {
        return pack.files["entities.json"];
      });
    }
  };
})(window);
