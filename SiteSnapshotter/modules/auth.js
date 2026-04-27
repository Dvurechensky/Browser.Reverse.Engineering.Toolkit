;(function SiteSnapshotterAuthModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.auth = {
    name: "auth",
    output: "auth.json",
    description: "Детектор auth markers: JWT, bearer, CSRF, OAuth providers, login forms, session cookies, refresh tokens и auth changes.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ download: false }).then(function (pack) {
        return pack.files["auth.json"];
      });
    }
  };
})(window);
