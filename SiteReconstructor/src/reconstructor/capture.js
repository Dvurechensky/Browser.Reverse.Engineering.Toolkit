"use strict";

const fs = require("fs");
const path = require("path");
const { defaultOutputDir } = require("../cli/args");
const { REQUIRED_FILES } = require("./constants");
const {
  arrayFrom,
  maskSensitive,
} = require("./utils");

function inferOutputDir(inputDir, loaded) {
  const slug = inferSiteSlug(loaded);
  if (slug) {
    return path.join(process.cwd(), "reports", slug);
  }
  return defaultOutputDir(inputDir);
}

function inferSiteSlug(loaded) {
  const site = loaded && loaded.files && loaded.files.page && loaded.files.page.site;
  const directCandidates = [
    site && site.host,
    site && site.domain,
    site && site.hostname,
    site && site.url,
  ];
  for (const candidate of directCandidates) {
    const slug = sanitizeSiteSlug(candidate);
    if (slug) {
      return slug;
    }
  }

  const manifestFile = loaded && loaded.files && loaded.files.manifest;
  const manifestCandidates = [
    manifestFile && manifestFile.site && manifestFile.site.host,
    manifestFile && manifestFile.site && manifestFile.site.url,
    manifestFile && manifestFile.meta && manifestFile.meta.site && manifestFile.meta.site.host,
  ];
  for (const candidate of manifestCandidates) {
    const slug = sanitizeSiteSlug(candidate);
    if (slug) {
      return slug;
    }
  }

  return "";
}

function sanitizeSiteSlug(value) {
  if (!value) {
    return "";
  }
  try {
    const url = new URL(String(value));
    const host = url.hostname || "";
    return host.replace(/[^a-z0-9.-]+/gi, "_").replace(/\.+$/g, "");
  } catch (_) {
    return String(value).trim().replace(/^https?:\/\//i, "").replace(/[\/?#].*$/g, "").replace(/[^a-z0-9.-]+/gi, "_").replace(/\.+$/g, "");
  }
}

function loadCapture(inputDir) {
  if (!fs.existsSync(inputDir) || !fs.statSync(inputDir).isDirectory()) {
    throw new Error(`Input folder does not exist: ${inputDir}`);
  }

  const warnings = [];
  const files = {};
  const rawFiles = {};
  const byModule = new Map();

  const jsonFiles = fs.readdirSync(inputDir)
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  for (const fileName of jsonFiles) {
    const moduleName = detectModuleName(fileName);
    const filePath = path.join(inputDir, fileName);
    const raw = fs.readFileSync(filePath, "utf8");
    rawFiles[moduleName] = raw;
    const parsed = safeJsonParse(raw, fileName, warnings);
    if (parsed.ok) {
      byModule.set(moduleName, { fileName, filePath, data: parsed.value });
      files[moduleName] = parsed.value;
    }
  }

  for (const required of REQUIRED_FILES) {
    const moduleName = required.replace(/\.json$/i, "");
    if (!byModule.has(moduleName)) {
      warnings.push(`Missing required capture file: ${required}`);
    }
  }

  return {
    inputDir,
    warnings,
    files,
    rawFiles,
    manifest: Array.from(byModule.values()).map((item) => ({
      module: detectModuleName(item.fileName),
      file: item.fileName,
      path: item.filePath,
    })),
  };
}

function detectModuleName(fileName) {
  const base = path.basename(fileName).replace(/\.json$/i, "");
  const parts = base.split("__");
  return sanitizeModuleName(parts[parts.length - 1]);
}

function sanitizeModuleName(name) {
  return String(name || "").replace(/[^a-z0-9_]+/gi, "_").toLowerCase();
}

function safeJsonParse(raw, label, warnings) {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (error) {
    warnings.push(`Invalid JSON in ${label}: ${error.message}`);
    return { ok: false, value: null };
  }
}

function normalizeCapture(loaded) {
  const f = loaded.files;
  const normalized = {
    site: {
      url: f.page?.url || f.manifest?.url || null,
      host: f.page?.host || f.page?.hostname || null,
      title: f.page?.title || null,
      timestamp: f.page?.timestamp || f.manifest?.timestamp || null,
      language: f.page?.language || null,
      userAgent: f.page?.userAgent || null,
    },
    frontend: {
      framework: f.framework || {},
      tech_tree: f.tech_tree || {},
      assets: f.assets || {},
      routes: f.routes || {},
      state: f.runtime_state || f.state_map || {},
      feature_flags: f.feature_flags || {},
    },
    backend: {
      intelligence: f.intelligence || {},
      network_counts: f.network?.counts || {},
    },
    api: {
      endpoints: arrayFrom(f.endpoints?.endpoints || f.endpoints),
      network: arrayFrom(f.network?.active || f.network?.requests || f.network?.passive || f.network),
      schemas: f.schemas || {},
    },
    modules: f.module_graph || {},
    entities: f.entities || {},
    telemetry: f.telemetry || {},
    security: {
      security: f.security || {},
      auth: f.auth || {},
      storage: f.storage || {},
      jsenv: f.jsenv || {},
      source_maps: f.source_maps || {},
    },
    scenarios: f.scenario || {},
    evidence: arrayFrom(f.evidence?.items || f.evidence?.evidence || f.evidence),
    warnings: loaded.warnings.slice().sort(),
    capture_manifest: loaded.manifest,
  };

  return maskSensitive(normalized);
}

module.exports = {
  inferOutputDir,
  loadCapture,
  normalizeCapture,
};
