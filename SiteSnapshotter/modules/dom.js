;(function SiteSnapshotterDomModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.dom = {
    name: "dom",
    output: "dom.json",
    description: "Сборщик DOM: полный HTML, semantic blocks, buttons, links, tables, dialogs, hidden sections, iframes, custom elements и layout hints.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ download: false }).then(function (pack) {
        return pack.files["dom.json"];
      });
    }
  };
})(window);
