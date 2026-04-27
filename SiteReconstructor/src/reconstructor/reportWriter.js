"use strict";

const path = require("path");
const { materializeDotnetifyMockServers } = require("../export/mockServers");
const { safeRemoveGeneratedDir } = require("../fs/safeRemove");
const { flattenApiEndpoints } = require("./analysis");
const {
  arrayFrom,
  ensureDir,
  titleCase,
  writeJson,
  writeText,
} = require("./utils");

function dataFileNames() {
  return [
    "normalized.json",
    "architecture.json",
    "api_map.json",
    "api_topology.json",
    "telemetry_report.json",
    "module_graph.json",
    "scenario_graph.json",
    "entity_map.json",
    "security_report.json",
    "privacy_signals.json",
    "storage_analysis.json",
    "vulnerability_hints.json",
    "osint_report.json",
    "quality_scores.json",
    "typescript_sdk_export.json",
    "mock_server_export.json",
  ];
}

function writeExportBundle(outputDir, swaggerSpecs, postmanExport, moduleGraph, entityMap, data) {
  const exportsDir = path.join(outputDir, "exports");
  const postmanDir = path.join(exportsDir, "postman");
  const swaggerDir = path.join(exportsDir, "swagger");
  const graphsDir = path.join(exportsDir, "graphs");
  const pdfDir = path.join(exportsDir, "pdf");
  const jsonDir = path.join(exportsDir, "json");
  const dotnetMockDir = path.join(exportsDir, "mock-servers");

  [exportsDir, postmanDir, swaggerDir, graphsDir, pdfDir, jsonDir, dotnetMockDir].forEach(ensureDir);
  safeRemoveGeneratedDir(outputDir, path.join(exportsDir, "mock-server"), "mock-server");
  safeRemoveGeneratedDir(outputDir, path.join(swaggerDir, "Output"), "Output");

  writeJson(path.join(postmanDir, "collection.json"), postmanExport.collection || {});
  writeJson(path.join(postmanDir, "environment.json"), postmanExport.environments?.[0] || {});

  for (const [fileName, spec] of Object.entries(swaggerSpecs || {})) {
    writeJson(path.join(swaggerDir, safeExportFileName(fileName)), spec);
  }

  const dotnetMockExport = materializeDotnetifyMockServers(outputDir, swaggerDir, dotnetMockDir, data);
  data.mock_server_export = dotnetMockExport;

  writeJson(path.join(graphsDir, "module_graph.json"), moduleGraph || {});
  writeJson(path.join(graphsDir, "entity_graph.json"), entityMap || {});

  for (const fileName of dataFileNames()) {
    const key = fileName.replace(/\.json$/i, "");
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      writeJson(path.join(jsonDir, fileName), data[key]);
    }
  }

  writeText(path.join(pdfDir, "report-print.html"), printableReportHtml(data));
  safeRemoveGeneratedDir(outputDir, path.join(swaggerDir, "Output"), "Output");
  return dotnetMockExport;
}

function safeExportFileName(name) {
  return String(name || "untitled").replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function printableReportHtml(data) {
  const architecture = data.architecture || {};
  const quality = data.quality_scores || {};
  const topology = data.api_topology || {};
  const dependencies = arrayFrom(topology.dependencies || topology.edges || []).slice(0, 40);
  const qualityRows = Object.entries(quality)
    .map(([key, value]) => `<tr><th>${escapeHtml(titleCase(key))}</th><td>${escapeHtml(value)}</td></tr>`)
    .join("");
  const dependencyRows = dependencies
    .map((item) => `<tr><td>${escapeHtml(item.source || item.from || item.host || "")}</td><td>${escapeHtml(item.target || item.to || item.kind || item.vendor || "")}</td></tr>`)
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>SiteReconstructor Report</title>
  <style>
    body{font-family:Arial,sans-serif;margin:40px;color:#111827;line-height:1.45}
    h1,h2{margin:0 0 14px}
    section{margin:28px 0}
    table{border-collapse:collapse;width:100%;margin-top:10px}
    th,td{border:1px solid #d1d5db;padding:8px 10px;text-align:left;vertical-align:top}
    th{background:#f3f4f6;width:32%}
    code{background:#f3f4f6;padding:2px 4px;border-radius:4px}
  </style>
</head>
<body>
  <h1>SiteReconstructor Report</h1>
  <p>Generated architecture intelligence and API documentation recovery summary.</p>
  <section>
    <h2>Architecture</h2>
    <table>
      <tr><th>Frontend domain</th><td>${escapeHtml(topology.frontend_domain || architecture.domain || "unknown")}</td></tr>
      <tr><th>Endpoints</th><td>${escapeHtml(data.api_map?.summary?.total_endpoints || flattenApiEndpoints(data.api_map || {}).length || 0)}</td></tr>
      <tr><th>Modules</th><td>${escapeHtml(data.module_graph?.nodes?.length || 0)}</td></tr>
      <tr><th>Entities</th><td>${escapeHtml(data.entity_map?.entities?.length || 0)}</td></tr>
    </table>
  </section>
  <section>
    <h2>Quality</h2>
    <table>${qualityRows || "<tr><td>No quality scores generated.</td></tr>"}</table>
  </section>
  <section>
    <h2>Dependencies</h2>
    <table>${dependencyRows || "<tr><td>No dependency edges detected.</td></tr>"}</table>
  </section>
</body>
</html>
`;
}

module.exports = {
  dataFileNames,
  writeExportBundle,
};
