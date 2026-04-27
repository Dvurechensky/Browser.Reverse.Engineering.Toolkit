;(function SiteSnapshotterSecurityModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.security = {
    name: "security",
    output: "security.json",
    description: "Детектор security markers: CSP meta, iframe sandbox, captcha, Cloudflare challenge, recaptcha и видимые cookie hints.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ download: false }).then(function (pack) {
        return pack.files["security.json"];
      });
    }
  };
})(window);
