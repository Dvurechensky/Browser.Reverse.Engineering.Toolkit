;(function SiteSnapshotterStorageModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.storage = {
    name: "storage",
    output: "storage.json",
    description: "Сборщик storage: cookies, localStorage, sessionStorage, IndexedDB names, Cache Storage names и service worker registrations с маскированием чувствительных значений.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ download: false }).then(function (pack) {
        return pack.files["storage.json"];
      });
    }
  };
})(window);
