;(function SiteSnapshotterPageModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.page = {
    name: "page",
    output: "page.json",
    description: "Сборщик метаданных страницы: URL, host, title, timestamp, viewport, language, referrer и browser hints.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ download: false }).then(function (pack) {
        return pack.files["page.json"];
      });
    }
  };
})(window);
