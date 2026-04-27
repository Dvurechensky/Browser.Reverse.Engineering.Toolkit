"use strict";

const fs = require("fs");
const { SENSITIVE_KEYS } = require("./constants");

function collectStrings(values) {
  const strings = [];
  walk(values, (value) => {
    if (typeof value === "string" && value.trim()) strings.push(value.trim());
  });
  return strings;
}

function collectObjectKeys(value) {
  const keys = [];
  walk(value, (_value, key) => {
    if (key) keys.push(String(key));
  });
  return unique(keys);
}

function walk(value, visit, key = "") {
  visit(value, key);
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visit, String(index)));
  } else if (value && typeof value === "object") {
    Object.keys(value).forEach((childKey) => walk(value[childKey], visit, childKey));
  }
}

function findObjectByKey(value, keyName) {
  let found = null;
  walk(value, (node, key) => {
    if (!found && String(key).toLowerCase() === String(keyName).toLowerCase()) {
      found = Array.isArray(node) ? node[0] : node;
    }
  });
  return found;
}

function maskSensitive(value, key = "") {
  if (Array.isArray(value)) return value.map((item) => maskSensitive(item, key));
  if (value && typeof value === "object") {
    const out = {};
    for (const childKey of Object.keys(value).sort()) {
      out[childKey] = maskSensitive(value[childKey], childKey);
    }
    return out;
  }
  if (hasSensitiveName(key)) return maskValue(value);
  if (typeof value === "string") return maskSensitiveString(value);
  return value;
}

function hasSensitiveName(name) {
  const lower = String(name || "").toLowerCase();
  if (/^(auth_base_url|primary_auth_url|auth_url|auth_hint|auth_requirement_estimate)$/.test(lower)) {
    return false;
  }
  if (/(access_token|refresh_token|api_key|apikey|authorization|bearer|password|passwd|cookie|session|secret|csrf|xsrf|jwt)/i.test(lower)) {
    return true;
  }
  if (/(^|[^a-z0-9])(token|sid|auth|phone|email|bdate|address)([^a-z0-9]|$)/i.test(lower)) {
    return true;
  }
  return false;
}

function maskValue(value) {
  if (value == null || value === "") return value;
  if (typeof value === "string") return `${value.slice(0, 3)}...[masked]`;
  return "[masked]";
}

function maskSensitiveString(value) {
  const sensitivePattern = SENSITIVE_KEYS.map(escapeRegExp).join("|");
  return value
    .replace(new RegExp(`([?&][^=&#\\s"]*(?:${sensitivePattern})[^=&#\\s"]*=)[^&#\\s"]+`, "gi"), "$1[masked]")
    .replace(new RegExp(`(["']?[^"'{}:,]*(?:${sensitivePattern})[^"'{}:,]*["']?\\s*:\\s*")([^"]*)(")`, "gi"), "$1[masked]$3")
    .replace(new RegExp(`(["']?[^"'{}:,]*(?:${sensitivePattern})[^"'{}:,]*["']?\\s*:\\s*')([^']*)(')`, "gi"), "$1[masked]$3")
    .replace(/(bearer\s+)[a-z0-9._-]+/gi, "$1[masked]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email masked]");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeModuleName(name) {
  return String(name || "").replace(/[^a-z0-9_]+/gi, "_").toLowerCase();
}

function safeJsonParse(raw, label, warnings = []) {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (error) {
    warnings.push(`Invalid JSON in ${label}: ${error.message}`);
    return { ok: false, value: null };
  }
}

function arrayFrom(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function unique(values) {
  return Array.from(new Set(values.filter((value) => value !== undefined && value !== null && value !== "")));
}

function groupBy(items, keyFn) {
  const grouped = {};
  for (const item of items) {
    const key = keyFn(item) || "unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item.url || item.id || item.name || item);
  }
  return sortObject(grouped);
}

function groupFullBy(items, keyFn) {
  const grouped = {};
  for (const item of items || []) {
    const key = keyFn(item) || "unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }
  return Object.fromEntries(Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)));
}

function groupByMany(items, keyFn) {
  const grouped = {};
  for (const item of items) {
    for (const key of arrayFrom(keyFn(item))) {
      const groupKey = key || "unknown";
      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push(item.url || item.id || item.name || item);
    }
  }
  return sortObject(grouped);
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
  }
  return sortObject(counts);
}

function sortObject(object) {
  return Object.fromEntries(Object.keys(object).sort().map((key) => [key, object[key]]));
}

function dedupeEdges(edges) {
  const seen = new Set();
  return edges.filter((edge) => {
    if (!edge.from || !edge.to || edge.from === edge.to) return false;
    const key = `${edge.from}\n${edge.to}\n${edge.reason}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => `${a.from}${a.to}`.localeCompare(`${b.from}${b.to}`));
}

function dedupeHints(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.title}\n${item.severity}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function compareHints(a, b) {
  const order = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
  return (order[b.severity] || 0) - (order[a.severity] || 0) || b.confidence - a.confidence || a.title.localeCompare(b.title);
}

function compareEndpoints(a, b) {
  return a.category.localeCompare(b.category) || a.url.localeCompare(b.url) || a.method.localeCompare(b.method);
}

function numberOr(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function titleCase(value) {
  return String(value || "unknown")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function hostFromMaybeUrl(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

function parseUrl(value) {
  const text = String(value || "");
  if (!text) return null;
  try {
    return new URL(text);
  } catch {
    if (text.startsWith("/")) {
      try {
        return new URL(text, "https://local.invalid");
      } catch {
        return null;
      }
    }
    return null;
  }
}

function pathPrefix(url) {
  const pathname = parseUrl(url)?.pathname || String(url || "").split("?")[0] || "";
  const parts = pathname.split("/").filter(Boolean);
  return parts.length ? `/${parts[0]}` : "/";
}

function isTelemetryText(value) {
  return /analytics|telemetry|stat|track|event|metric|crash|sentry|beacon|pixel|counter|apptracer|datadog|newrelic|clarity|hotjar|fullstory|logrocket/i.test(String(value || ""));
}

function telemetryVendors(urls, apiTopology) {
  const topologyHosts = arrayFrom(apiTopology.domains).filter((node) => node.kind === "telemetry").map((node) => node.host);
  const hosts = unique(urls.map(hostFromMaybeUrl).filter(Boolean).concat(topologyHosts)).sort();
  return hosts.map((host) => {
    const examples = urls.filter((url) => hostFromMaybeUrl(url) === host).slice(0, 8);
    return {
      host,
      vendor: knownTelemetryVendor(host),
      kind: apiTopology.vendors?.some((node) => node.host === host) ? "third-party" : "first-party_or_unknown",
      request_count: examples.length,
      examples,
      confidence: clamp(0.55 + Math.min(0.32, examples.length * 0.04) + (knownTelemetryVendor(host) !== "unknown" ? 0.1 : 0), 0, 0.96),
    };
  });
}

function knownTelemetryVendor(host) {
  const text = String(host || "").toLowerCase();
  if (/google-analytics|googletagmanager|doubleclick|gstatic/.test(text)) return "Google Analytics / Tag Manager";
  if (/datadog/.test(text)) return "Datadog";
  if (/newrelic/.test(text)) return "New Relic";
  if (/sentry/.test(text)) return "Sentry";
  if (/clarity/.test(text)) return "Microsoft Clarity";
  if (/hotjar/.test(text)) return "Hotjar";
  if (/fullstory/.test(text)) return "FullStory";
  if (/logrocket/.test(text)) return "LogRocket";
  if (/apptracer/.test(text)) return "AppTracer";
  if (/mail\.ru|mradx|top-fwz/.test(text)) return "VK/Mail.ru analytics";
  return "unknown";
}

function telemetryTaxonomy(values) {
  const categories = [
    ["route_change", /route|navigation|pageview|screen|spa/i],
    ["performance", /performance|beacon|web-vital|lcp|cls|fid|tti|timing/i],
    ["crash", /crash|exception|error|sentry|stacktrace/i],
    ["session_replay", /session.?replay|rrweb|fullstory|hotjar|clarity|mouse|record/i],
    ["engagement", /click|view|impression|scroll|hover|open|close/i],
    ["commerce", /cart|checkout|purchase|order|payment|billing/i],
    ["auth", /login|auth|oauth|session|token/i],
  ];
  return categories.map(([category, pattern]) => {
    const hits = values.filter((value) => pattern.test(String(value)));
    return { category, count: hits.length, examples: unique(hits.map(shortSignal)).slice(0, 12) };
  }).filter((item) => item.count > 0).sort((a, b) => b.count - a.count);
}

function significantTokens(value) {
  return unique(String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4 && !/^\d+$/.test(token))
    .slice(0, 12));
}

function buildRouteToEventMap(loaded, endpoints, values) {
  const routes = unique(collectStrings([loaded.files.routes, loaded.files.scenario, loaded.files.timeline])
    .filter((value) => /^\//.test(value))
    .map((value) => String(value).split("?")[0]))
    .slice(0, 100);
  return routes.map((route) => {
    const tokens = significantTokens(route);
    const events = unique(values.concat(endpoints.map((endpoint) => endpoint.url))
      .filter((value) => tokens.some((token) => String(value).toLowerCase().includes(token)) || isTelemetryText(value)))
      .slice(0, 20);
    return { route, events: events.map(shortSignal), confidence: pctNumber(events.length ? 0.62 : 0.38) };
  }).filter((item) => item.events.length);
}

function duplicateTelemetryCandidates(values) {
  const counts = countBy(values.map((value) => telemetrySignature(value)), (value) => value);
  return Object.entries(counts)
    .filter(([, count]) => count > 1)
    .map(([signature, count]) => ({ signature, count, confidence: pctNumber(Math.min(0.9, 0.45 + count * 0.08)) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 80);
}

function noisyTelemetryCandidates(endpoints, urls) {
  const rows = Object.entries(countBy(endpoints.concat(urls.map((url) => ({ url, count: 1 }))), (item) => hostFromMaybeUrl(item.url) || pathPrefix(item.url)))
    .map(([target, count]) => ({ target, count, reason: count > 20 ? "high observed volume" : "repeated telemetry target", confidence: pctNumber(Math.min(0.86, 0.42 + count * 0.03)) }))
    .filter((item) => item.count >= 3)
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
  return rows;
}

function telemetrySignature(value) {
  const text = String(value || "");
  const parsed = parseUrl(text);
  if (parsed) {
    const host = parsed.hostname === "local.invalid" ? "relative" : parsed.hostname;
    return `${host}${parsed.pathname}`.toLowerCase();
  }
  return text.toLowerCase().replace(/[0-9a-f]{8,}|\d+/gi, "{id}").slice(0, 140);
}

function telemetryEventCategory(value) {
  const text = String(value || "");
  if (/route|navigation|pageview|screen/i.test(text)) return "route_change";
  if (/performance|beacon|web-vital|timing/i.test(text)) return "performance";
  if (/crash|error|exception|sentry/i.test(text)) return "crash";
  if (/replay|rrweb|hotjar|clarity|fullstory/i.test(text)) return "session_replay";
  if (/click|view|impression|scroll/i.test(text)) return "engagement";
  if (/auth|login|session/i.test(text)) return "auth";
  return "analytics";
}

function shortSignal(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 240 ? `${text.slice(0, 237)}...` : text;
}

function pctNumber(value) {
  return `${Math.round(clamp(value, 0, 1) * 100)}%`;
}

function telemetryConfidence(endpoints, urls, vendors) {
  return clamp(0.42 + Math.min(0.25, endpoints.length * 0.025) + Math.min(0.18, urls.length * 0.006) + Math.min(0.12, vendors.length * 0.035), 0, 0.94);
}

function affectedFromEvidence(evidence) {
  const values = arrayFrom(evidence);
  const hosts = unique(values.map((item) => hostFromMaybeUrl(typeof item === "string" ? item : JSON.stringify(item))).filter(Boolean)).slice(0, 10);
  const routes = unique(values.map((item) => String(item)).filter((item) => /^\//.test(item)).slice(0, 10));
  return { hosts, routes };
}

function severityWeight(severity) {
  return { high: 3, medium: 2, low: 1, info: 0 }[severity] || 0;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, value) {
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, text) {
  fs.writeFileSync(filePath, text, "utf8");
}

module.exports = {
  collectStrings,
  collectObjectKeys,
  walk,
  findObjectByKey,
  maskSensitive,
  hasSensitiveName,
  maskValue,
  maskSensitiveString,
  escapeRegExp,
  sanitizeModuleName,
  safeJsonParse,
  arrayFrom,
  unique,
  groupBy,
  groupFullBy,
  groupByMany,
  countBy,
  sortObject,
  dedupeEdges,
  dedupeHints,
  compareHints,
  compareEndpoints,
  numberOr,
  clamp,
  titleCase,
  hostFromMaybeUrl,
  isTelemetryText,
  telemetryVendors,
  knownTelemetryVendor,
  telemetryTaxonomy,
  buildRouteToEventMap,
  duplicateTelemetryCandidates,
  noisyTelemetryCandidates,
  telemetrySignature,
  telemetryEventCategory,
  shortSignal,
  telemetryConfidence,
  affectedFromEvidence,
  severityWeight,
  ensureDir,
  writeJson,
  writeText
};
