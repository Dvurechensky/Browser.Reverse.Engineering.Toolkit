"use strict";

const fs = require("fs");
const path = require("path");

const assetsDir = path.join(__dirname, "assets");

function portalHtml(data) {
  const embedded = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SiteReconstructor Report</title>
  <link rel="stylesheet" href="assets/app.css">
</head>
<body>
  <header class="topbar">
    <div>
      <h1>SiteReconstructor</h1>
      <p id="site-subtitle"></p>
    </div>
    <nav id="tabs"></nav>
  </header>
  <main id="app"></main>
  <script id="recon-data" type="application/json">${embedded}</script>
  <script src="assets/app.js"></script>
</body>
</html>
`;
}

function portalCssV2() {
  return readAsset("app.css");
}

function portalJsV2() {
  return readAsset("app.js");
}

function readAsset(name) {
  return fs.readFileSync(path.join(assetsDir, name), "utf8");
}

module.exports = {
  portalHtml,
  portalCssV2,
  portalJsV2,
};
