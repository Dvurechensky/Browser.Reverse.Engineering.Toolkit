;(function SiteSnapshotterTimelineModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.timeline = {
    name: "timeline",
    output: "timeline.json",
    description: "Сборщик session timeline: page load, route changes, network requests, DOM changes, storage changes и modal events.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ mode: "session", download: false }).then(function (pack) {
        return pack.files["timeline.json"];
      });
    }
  };
})(window);
