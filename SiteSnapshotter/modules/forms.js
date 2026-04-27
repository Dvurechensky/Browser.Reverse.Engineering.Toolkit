;(function SiteSnapshotterFormsModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.forms = {
    name: "forms",
    output: "forms.json",
    description: "Инвентаризация и классификация форм: login, register, search, payment и admin filter.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ download: false }).then(function (pack) {
        return pack.files["forms.json"];
      });
    }
  };
})(window);
