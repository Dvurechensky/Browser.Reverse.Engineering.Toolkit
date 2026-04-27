"use strict";

const path = require("path");
const { parseArgs, printUsage } = require("../cli/args");
const { writeTypeScriptSdkExport } = require("../export/typescriptSdk");
const { portalHtml, portalCssV2, portalJsV2 } = require("../portal");
const { serve } = require("../server/staticServer");
const {
  inferOutputDir,
  loadCapture,
  normalizeCapture,
} = require("./capture");
const {
  buildArchitecture,
  buildApiMap,
  buildApiTopology,
  buildSwaggerSpecs,
  buildPostmanExport,
  buildQualityScores,
  buildTelemetryReport,
  buildPrivacySignals,
  buildStorageAnalysis,
  buildExportBundle,
  buildScenarioGraph,
  buildModuleGraph,
  buildEntityMap,
  buildSecurityReport,
  buildVulnerabilityHints,
  buildOsintReport,
  buildAssetManifest,
} = require("./analysis");
const {
  dataFileNames,
  writeExportBundle,
} = require("./reportWriter");
const {
  ensureDir,
  writeJson,
  writeText,
} = require("./utils");

async function runCli(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (!args.input) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const inputDir = path.resolve(args.input);
  const rulesPath = path.join(__dirname, "..", "..", "rules", "security_rules.json");

  const loaded = loadCapture(inputDir);
  const outputDir = path.resolve(args.output || inferOutputDir(inputDir, loaded));
  if (args.strict && loaded.warnings.length) {
    throw new Error(`Strict mode failed:\n${loaded.warnings.join("\n")}`);
  }

  ensureDir(outputDir);
  ensureDir(path.join(outputDir, "data"));
  ensureDir(path.join(outputDir, "assets"));

  const normalized = normalizeCapture(loaded);
  const architecture = buildArchitecture(normalized, loaded);
  const apiMap = buildApiMap(normalized, loaded);
  const apiTopology = buildApiTopology(normalized, loaded, apiMap);
  const telemetryReport = buildTelemetryReport(normalized, loaded, apiMap, apiTopology);
  const scenarioGraph = buildScenarioGraph(normalized, loaded, apiMap, telemetryReport);
  const moduleGraph = buildModuleGraph(normalized, loaded, apiMap);
  const entityMap = buildEntityMap(normalized, loaded, apiMap);
  const securityReport = buildSecurityReport(normalized, loaded);
  const privacySignals = buildPrivacySignals(normalized, loaded, securityReport, apiTopology, telemetryReport);
  const storageAnalysis = buildStorageAnalysis(loaded.files.storage || {});
  const vulnerabilityHints = buildVulnerabilityHints(normalized, loaded, securityReport, rulesPath);
  const osintReport = buildOsintReport(normalized, loaded, architecture, apiMap, moduleGraph, securityReport);
  const swaggerSpecs = buildSwaggerSpecs(apiMap, apiTopology);
  const postmanExport = buildPostmanExport(apiMap, apiTopology, storageAnalysis);
  const qualityScores = buildQualityScores(normalized, apiMap, moduleGraph, entityMap, swaggerSpecs, postmanExport);

  const data = {
    normalized,
    architecture,
    api_map: apiMap,
    api_topology: apiTopology,
    telemetry_report: telemetryReport,
    module_graph: moduleGraph,
    scenario_graph: scenarioGraph,
    entity_map: entityMap,
    security_report: securityReport,
    privacy_signals: privacySignals,
    storage_analysis: storageAnalysis,
    vulnerability_hints: vulnerabilityHints,
    osint_report: osintReport,
    swagger_specs: swaggerSpecs,
    postman_export: postmanExport,
    quality_scores: qualityScores,
  };

  writeJson(path.join(outputDir, "data", "normalized.json"), normalized);
  writeJson(path.join(outputDir, "data", "architecture.json"), architecture);
  writeJson(path.join(outputDir, "data", "api_map.json"), apiMap);
  writeJson(path.join(outputDir, "data", "api_topology.json"), apiTopology);
  writeJson(path.join(outputDir, "data", "telemetry_report.json"), telemetryReport);
  writeJson(path.join(outputDir, "data", "module_graph.json"), moduleGraph);
  writeJson(path.join(outputDir, "data", "scenario_graph.json"), scenarioGraph);
  writeJson(path.join(outputDir, "data", "entity_map.json"), entityMap);
  writeJson(path.join(outputDir, "data", "security_report.json"), securityReport);
  writeJson(path.join(outputDir, "data", "privacy_signals.json"), privacySignals);
  writeJson(path.join(outputDir, "data", "storage_analysis.json"), storageAnalysis);
  writeJson(path.join(outputDir, "data", "vulnerability_hints.json"), vulnerabilityHints);
  writeJson(path.join(outputDir, "data", "osint_report.json"), osintReport);
  writeJson(path.join(outputDir, "data", "quality_scores.json"), qualityScores);
  const typeScriptSdkExport = writeTypeScriptSdkExport(outputDir, apiMap, apiTopology, normalized.site);
  data.typescript_sdk_export = typeScriptSdkExport;
  const mockServerExport = writeExportBundle(outputDir, swaggerSpecs, postmanExport, moduleGraph, entityMap, data);
  data.mock_server_export = mockServerExport;
  data.export_bundle = buildExportBundle(swaggerSpecs, postmanExport, typeScriptSdkExport, mockServerExport, moduleGraph, entityMap, dataFileNames());
  writeJson(path.join(outputDir, "data", "typescript_sdk_export.json"), typeScriptSdkExport);
  writeJson(path.join(outputDir, "data", "mock_server_export.json"), mockServerExport);
  writeJson(path.join(outputDir, "data", "export_bundle.json"), data.export_bundle);

  if (args.assets) {
    const assetManifest = buildAssetManifest(loaded.files.assets || {});
    writeJson(path.join(outputDir, "data", "asset_manifest.json"), assetManifest);
    for (const folder of ["css", "js", "img", "fonts", "media", "json", "other"]) {
      ensureDir(path.join(outputDir, "downloaded_assets", folder));
    }
    data.asset_manifest = assetManifest;
  }

  writeText(path.join(outputDir, "assets", "app.css"), portalCssV2());
  writeText(path.join(outputDir, "assets", "app.js"), portalJsV2());
  writeText(path.join(outputDir, "index.html"), portalHtml(data));

  console.log(`[SiteReconstructor] Report written: ${outputDir}`);
  console.log(`[SiteReconstructor] Warnings: ${normalized.warnings.length}`);

  if (args.serve) {
    await serve(outputDir, Number(args.port || 5177));
  }
}

module.exports = {
  runCli,
};
