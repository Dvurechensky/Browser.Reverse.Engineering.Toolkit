;(function SiteSnapshotterExporter(global) {
  "use strict";

  function stringify(data, minify) {
    return JSON.stringify(data, null, minify ? 0 : 2);
  }

  function downloadJson(data, fileName, minify) {
    var blob = new Blob([stringify(data, minify)], { type: "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = fileName || "snapshot.json";
    document.documentElement.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  async function copyJson(data) {
    var text = stringify(data, false);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    var ok = document.execCommand("copy");
    textarea.remove();
    return ok;
  }

  global.SiteSnapshotterExporter = {
    stringify: stringify,
    downloadJson: downloadJson,
    copyJson: copyJson
  };
})(window);
