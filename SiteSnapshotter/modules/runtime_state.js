;(function SiteSnapshotterRuntimeStateModule(global) {
  "use strict";

  global.SiteSnapshotterModules = global.SiteSnapshotterModules || {};
  global.SiteSnapshotterModules.runtime_state = {
    name: "runtime_state",
    output: "runtime_state.json",
    description: "Майнинг runtime state: Redux/Apollo/React Query/Pinia/Zustand/MobX и initial state globals с маскированием секретов.",
    run: function () {
      return global.SiteSnapshotter && global.SiteSnapshotter.run({ mode: "intel", download: false }).then(function (pack) {
        return pack.files["runtime_state.json"];
      });
    }
  };
})(window);
