;(function SiteSnapshotterJsEnvModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.jsenv = {
    name: "jsenv",
    output: "jsenv.json",
    description: "Сборщик JavaScript runtime: window keys, known globals, state containers, build hints и runtime configs.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ download: false }).then(function (pack) {
        return pack.files["jsenv.json"];
      });
    }
  };
})(window);
