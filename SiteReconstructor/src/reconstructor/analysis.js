"use strict";

const fs = require("fs");
const path = require("path");
const {
  BUSINESS_MODULE_TAXONOMY,
  PUBLIC_ASSET_PROTOCOLS,
} = require("./constants");
const {
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
} = require("./utils");

function buildArchitecture(normalized, loaded) {
  const f = loaded.files;
  const endpoints = arrayFrom(f.endpoints?.endpoints || f.endpoints);
  const modules = arrayFrom(f.module_graph?.modules || f.module_graph?.nodes || f.module_graph);
  const techValues = collectStrings([f.framework, f.tech_tree, f.assets]).filter(isTechSignal);
  const stateValues = collectStrings([f.runtime_state, f.state_map, f.assets])
    .filter((value) => /redux|mobx|vuex|pinia|zustand|state|store/i.test(value));
  const routeValues = collectStrings([f.routes]).slice(0, 80);

  return maskSensitive({
    site_type: inferSiteType(f, endpoints),
    frontend_stack: unique(techValues).slice(0, 40),
    backend_guess: inferBackend(f, endpoints),
    state_management: unique(stateValues).slice(0, 30),
    routing: unique(routeValues).slice(0, 80),
    modules: modules.map((module) => ({
      name: module.name || module.id || String(module),
      score: numberOr(module.score, 0.5),
      sources: arrayFrom(module.sources),
    })).slice(0, 120),
    data_flows: inferDataFlows(endpoints),
    confidence: f.confidence || {},
  });
}

function buildApiMap(normalized, loaded) {
  const observedEndpoints = arrayFrom(loaded.files.endpoints?.endpoints || loaded.files.endpoints)
    .concat(networkEvidenceEndpoints(loaded.files.network));
  const endpointMap = new Map();
  for (const endpoint of observedEndpoints.map((item) => normalizeEndpoint(item))) {
    const key = endpointKey(endpoint);
    endpointMap.set(key, mergeEndpointEvidence(endpointMap.get(key), endpoint));
  }
  const endpoints = Array.from(endpointMap.values()).sort(compareEndpoints);

  const groupMap = new Map();
  for (const endpoint of endpoints) {
    const groupName = endpoint.category || methodNamespace(endpoint.url) || pathPrefix(endpoint.url) || "other";
    if (!groupMap.has(groupName)) groupMap.set(groupName, []);
    groupMap.get(groupName).push(endpoint);
  }

  const groups = Array.from(groupMap.entries())
    .map(([name, items]) => ({ name: titleCase(name), endpoints: items }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const byPrefix = groupBy(endpoints, (endpoint) => pathPrefix(endpoint.url));
  const byNamespace = groupBy(endpoints, (endpoint) => methodNamespace(endpoint.url));
  const byEntity = groupByMany(endpoints, (endpoint) => endpoint.entities);
  const byTrigger = groupByMany(endpoints, (endpoint) => endpoint.triggered_by);

  return maskSensitive({
    summary: {
      endpoint_count: endpoints.length,
      method_counts: countBy(endpoints, (endpoint) => endpoint.method || "GET"),
      category_counts: countBy(endpoints, (endpoint) => endpoint.category || "other"),
      auth_surface: countBy(endpoints, (endpoint) => endpoint.auth_hint || "unknown"),
      endpoints_with_request_headers: endpoints.filter((endpoint) => endpoint.headers.length).length,
      endpoints_with_request_body_preview: endpoints.filter((endpoint) => endpoint.request_body_preview).length,
    },
    groups,
    indexes: {
      by_category: groupBy(endpoints, (endpoint) => endpoint.category || "other"),
      by_path_prefix: byPrefix,
      by_method_namespace: byNamespace,
      by_entities: byEntity,
      by_triggered_by: byTrigger,
    },
  });
}

function networkEvidenceEndpoints(network) {
  return arrayFrom(network?.active || network?.requests || [])
    .filter((entry) => entry && (entry.url || entry.name))
    .map((entry) => ({
      url: entry.url || entry.name,
      method: entry.method || "GET",
      category: entry.category,
      count: 1,
      request_headers: entry.requestHeaders || entry.request_headers,
      response_headers: entry.responseHeaders || entry.response_headers,
      request_body_preview: entry.requestBodyPreview,
      response_preview: entry.responsePreview,
      request_schema: entry.requestJsonSignals?.shape,
      response_schema: entry.responseJsonSignals?.shape || entry.schema?.shape,
      status_code: entry.status,
      triggered_by: [entry.after, entry.action].filter(Boolean),
      confidence: entry.responseJsonSignals?.shape ? 0.82 : 0.68,
      source: entry.type || "network",
    }));
}

function endpointKey(endpoint) {
  return `${endpoint.method || "GET"} ${endpoint.path || pathFromUrl(endpoint.url)}`;
}

function mergeEndpointEvidence(base, next) {
  if (!base) return next;
  return {
    ...base,
    count: numberOr(base.count, 1) + numberOr(next.count, 1),
    host: base.host || next.host,
    server_kind: rankServerKind(next.server_kind) > rankServerKind(base.server_kind) ? next.server_kind : base.server_kind,
    category: base.category === "other" ? next.category : base.category,
    query_params: unique((base.query_params || []).concat(next.query_params || [])).sort(),
    path_params: unique((base.path_params || []).concat(next.path_params || [])).sort(),
    headers: unique((base.headers || []).concat(next.headers || [])),
    response_headers: unique((base.response_headers || []).concat(next.response_headers || [])),
    request_body_preview: preferPreview(base.request_body_preview, next.request_body_preview),
    response_preview: preferPreview(base.response_preview, next.response_preview),
    request_schema: base.request_schema || next.request_schema,
    response_schema: base.response_schema || next.response_schema,
    status_codes: unique((base.status_codes || []).concat(next.status_codes || []).filter(Boolean)).sort(),
    entities: unique((base.entities || []).concat(next.entities || [])).sort(),
    triggered_by: unique((base.triggered_by || []).concat(next.triggered_by || [])).sort(),
    auth_hint: base.auth_hint !== "none observed" ? base.auth_hint : next.auth_hint,
    content_type: base.content_type !== "application/json" ? base.content_type : next.content_type,
    confidence: Math.max(base.confidence || 0, next.confidence || 0),
    evidence_sources: unique((base.evidence_sources || []).concat(next.evidence_sources || [])),
  };
}

function preferPreview(current, incoming) {
  if (current && !/^\{masked\}$|\[masked\]/i.test(String(current))) return current;
  return incoming || current || null;
}

function buildApiTopology(normalized, loaded, apiMap) {
  const siteHost = normalized.site.host || parseUrl(normalized.site.url)?.hostname || null;
  const endpoints = flattenApiEndpoints(apiMap);
  const urls = unique(
    endpoints.map((endpoint) => endpoint.url)
      .concat(collectStrings([loaded.files.network, loaded.files.assets, loaded.files.telemetry]).filter((value) => /^https?:\/\//i.test(value)))
  );
  const domains = new Map();
  const addDomain = (host, url, kind, confidence, evidence) => {
    if (!host) return;
    const current = domains.get(host) || {
      host,
      kind,
      confidence: 0,
      request_count: 0,
      examples: [],
      evidence: [],
    };
    current.kind = rankServerKind(kind) > rankServerKind(current.kind) ? kind : current.kind;
    current.confidence = Math.max(current.confidence, confidence);
    current.request_count += 1;
    if (url && current.examples.length < 8) current.examples.push(url);
    current.evidence = unique(current.evidence.concat(evidence || [])).slice(0, 10);
    domains.set(host, current);
  };

  if (siteHost) addDomain(siteHost, normalized.site.url, "frontend", 0.92, ["page.json"]);
  for (const endpoint of endpoints) {
    const parsedHost = parseUrl(endpoint.url)?.hostname;
    const host = endpoint.host || (parsedHost === "local.invalid" ? null : parsedHost) || siteHost;
    addDomain(host, endpoint.url, endpoint.server_kind || inferServerKind(endpoint.url, endpoint.category), endpoint.confidence || 0.55, ["endpoints.json"]);
  }
  for (const url of urls) {
    const parsed = parseUrl(url);
    if (!parsed) continue;
    if (parsed.hostname === "local.invalid") continue;
    addDomain(parsed.hostname, url, inferServerKind(url), 0.6, [/telemetry|stat|track|event|crash/i.test(url) ? "telemetry.json" : "network/assets"]);
  }

  const nodes = Array.from(domains.values())
    .map((domain) => ({
      ...domain,
      examples: unique(domain.examples),
      confidence: clamp(domain.confidence + Math.min(0.08, domain.request_count / 400), 0, 0.98),
    }))
    .sort((a, b) => rankServerKind(b.kind) - rankServerKind(a.kind) || b.request_count - a.request_count || a.host.localeCompare(b.host));

  const edges = nodes
    .filter((node) => siteHost && node.host !== siteHost)
    .map((node) => ({
      from: siteHost,
      to: node.host,
      kind: node.kind,
      count: node.request_count,
      confidence: node.confidence,
      examples: node.examples.slice(0, 5),
    }));

  return maskSensitive({
    frontend_domain: siteHost,
    primary_api_url: serviceBaseUrl(nodes, "api") || (siteHost ? `https://${siteHost}` : null),
    primary_auth_url: serviceBaseUrl(nodes, "auth") || serviceBaseUrl(nodes, "api") || (siteHost ? `https://${siteHost}` : null),
    primary_media_url: serviceBaseUrl(nodes, "media") || (siteHost ? `https://${siteHost}` : null),
    primary_telemetry_url: serviceBaseUrl(nodes, "telemetry") || (siteHost ? `https://${siteHost}` : null),
    domains: nodes,
    edges,
    by_kind: groupBy(nodes, (node) => node.kind),
    service_map: {
      frontend: nodes.filter((node) => node.kind === "frontend"),
      api: nodes.filter((node) => node.kind === "api"),
      auth: nodes.filter((node) => node.kind === "auth"),
      cdn: nodes.filter((node) => node.kind === "media" && /cdn|static|assets|st\./i.test(node.host)),
      media: nodes.filter((node) => node.kind === "media"),
      telemetry: nodes.filter((node) => node.kind === "telemetry"),
      third_party: nodes.filter((node) => node.kind === "third-party"),
    },
    vendors: nodes.filter((node) => node.kind === "third-party" || (siteHost && !sameRegistrableDomain(siteHost, node.host))),
  });
}

function buildSwaggerSpecs(apiMap, apiTopology) {
  const endpoints = flattenApiEndpoints(apiMap);
  const specs = {};
  for (const bucket of buildSwaggerBuckets(endpoints, apiMap)) {
    const openApi30 = openApiSpecFor(bucket, apiTopology, { version: "3.0.3" });
    const openApi31 = openApiSpecFor(bucket, apiTopology, { version: "3.1.0" });
    specs[`openapi-${bucket.key}.json`] = openApi30;
    specs[`openapi-3.0-${bucket.key}.json`] = openApi30;
    specs[`openapi-3.1-${bucket.key}.json`] = openApi31;
    specs[`swagger-${bucket.key}.json`] = openApi30;
    specs[`swagger-2.0-${bucket.key}.json`] = swagger2SpecFor(bucket, apiTopology);
  }
  return specs;
}

function buildSwaggerBuckets(endpoints, apiMap) {
  const map = new Map();
  const groupLabels = new Map(arrayFrom(apiMap.groups).map((group) => [sanitizeSwaggerBucketKey(group.name), group.name]));
  for (const endpoint of endpoints) {
    const key = swaggerBucketKey(endpoint);
    const label = swaggerBucketLabel(endpoint, groupLabels.get(key));
    if (!map.has(key)) {
      map.set(key, {
        key,
        label,
        endpoints: [],
      });
    }
    map.get(key).endpoints.push(endpoint);
  }
  return Array.from(map.values())
    .filter((bucket) => bucket.endpoints.length > 0)
    .sort((a, b) => swaggerBucketRank(a) - swaggerBucketRank(b) || b.endpoints.length - a.endpoints.length || a.key.localeCompare(b.key));
}

function swaggerBucketKey(endpoint) {
  const category = sanitizeSwaggerBucketKey(endpoint.category);
  const kind = sanitizeSwaggerBucketKey(endpoint.server_kind);
  if (category === "admin") return "admin";
  if (category === "auth" || kind === "auth") return "auth";
  if (["media", "upload"].includes(category) || kind === "media") return "media";
  if (category === "telemetry" || kind === "telemetry") return "telemetry";
  if (kind === "third_party") return "thirdparty";
  if (kind === "api") return "api";
  if (kind === "public" || kind === "frontend") return "public";
  if (category && category !== "other" && category.length > 2) return category;
  if (kind) return kind;
  const namespace = sanitizeSwaggerBucketKey(methodNamespace(endpoint.url) || pathPrefix(endpoint.url));
  if (namespace && namespace !== "other") return namespace;
  return "public";
}

function swaggerBucketLabel(endpoint, preferred) {
  if (preferred) return preferred;
  const key = swaggerBucketKey(endpoint);
  if (key === "thirdparty") return "Third-party";
  return titleCase(key.replace(/_/g, " "));
}

function sanitizeSwaggerBucketKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function swaggerBucketRank(bucket) {
  return {
    public: 1,
    api: 2,
    auth: 3,
    media: 4,
    telemetry: 5,
    admin: 6,
    thirdparty: 7,
  }[bucket.key] || 50;
}

function buildPostmanExport(apiMap, apiTopology, storageAnalysis = {}) {
  const endpoints = flattenApiEndpoints(apiMap);
  const baseHost = apiTopology.frontend_domain || "example.test";
  const folderOrder = ["Public API", "Auth", "Media", "Telemetry", "Admin", "Third-party"];
  const grouped = groupFullBy(endpoints, (endpoint) => postmanFolderName(endpoint));
  const folders = folderOrder
    .filter((name) => grouped[name]?.length)
    .concat(Object.keys(grouped).filter((name) => !folderOrder.includes(name)).sort())
    .map((name) => ({
      name,
      item: grouped[name].map((endpoint) => postmanItem(endpoint, storageAnalysis)),
      description: postmanFolderDescription(name, grouped[name]),
    }));
  return {
    collection: {
      info: {
        name: "SiteReconstructor API Intelligence",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        description: "Generated from authorized passive capture evidence. Requests, schemas, and auth are inferred drafts.",
      },
      variable: [
        { key: "base_url", value: `https://${baseHost}` },
        { key: "api_base_url", value: apiTopology.primary_api_url || `https://${baseHost}` },
        { key: "auth_base_url", value: apiTopology.primary_auth_url || `https://${baseHost}` },
        { key: "media_base_url", value: apiTopology.primary_media_url || `https://${baseHost}` },
        { key: "telemetry_base_url", value: apiTopology.primary_telemetry_url || `https://${baseHost}` },
        { key: "access_token", value: "" },
        { key: "session_cookie", value: "" },
        { key: "csrf_token", value: "" },
        { key: "tenant_id", value: "" },
        { key: "user_id", value: "" },
      ],
      auth: {
        type: "bearer",
        bearer: [{ key: "token", value: "{{access_token}}", type: "string" }],
      },
      item: folders,
    },
    environments: [
      {
        name: `${baseHost} environment`,
        values: [
          { key: "base_url", value: `https://${baseHost}`, enabled: true },
          { key: "api_base_url", value: apiTopology.primary_api_url || `https://${baseHost}`, enabled: true },
          { key: "auth_base_url", value: apiTopology.primary_auth_url || `https://${baseHost}`, enabled: true },
          { key: "media_base_url", value: apiTopology.primary_media_url || `https://${baseHost}`, enabled: true },
          { key: "telemetry_base_url", value: apiTopology.primary_telemetry_url || `https://${baseHost}`, enabled: true },
          { key: "access_token", value: "", enabled: true, type: "secret" },
          { key: "session_cookie", value: "", enabled: true, type: "secret" },
          { key: "csrf_token", value: "", enabled: true, type: "secret" },
          { key: "tenant_id", value: "", enabled: true },
          { key: "user_id", value: "", enabled: true },
        ],
      },
    ],
  };
}

function buildQualityScores(normalized, apiMap, moduleGraph, entityMap, swaggerSpecs, postmanExport) {
  const endpoints = flattenApiEndpoints(apiMap);
  const endpointConfidence = average(endpoints.map((endpoint) => endpoint.confidence));
  const moduleConfidence = average((moduleGraph.clusters || moduleGraph.nodes || []).map((item) => item.score || item.confidence));
  const entityConfidence = entityMap.relationships?.length ? 0.66 : average(entityMap.entities.map((entity) => entity.seen_in_endpoints.length ? 0.64 : 0.42));
  const warningPenalty = Math.min(0.18, (normalized.warnings || []).length * 0.025);
  return {
    swagger_accuracy: pctNumber(endpointConfidence * 0.75 + hasAnyPath(swaggerSpecs) * 0.2 - warningPenalty),
    postman_accuracy: pctNumber(endpointConfidence * 0.7 + (postmanExport.collection.item.length ? 0.22 : 0) - warningPenalty),
    module_inference: pctNumber(moduleConfidence - warningPenalty / 2),
    entity_graph: pctNumber(entityConfidence - warningPenalty / 2),
    topology_detection: pctNumber(Math.min(0.92, average(endpoints.map((endpoint) => endpoint.host ? 0.75 : 0.52)) + 0.12)),
  };
}

function buildTelemetryReport(normalized, loaded, apiMap, apiTopology) {
  const endpoints = flattenApiEndpoints(apiMap).filter((endpoint) => endpoint.server_kind === "telemetry" || endpoint.category === "telemetry" || isTelemetryText(`${endpoint.url} ${endpoint.category}`));
  const telemetryStrings = collectStrings([loaded.files.telemetry, loaded.files.network, loaded.files.assets])
    .filter((value) => isTelemetryText(value) || /^https?:\/\//i.test(value))
    .slice(0, 5000);
  const telemetryUrls = unique(endpoints.map((endpoint) => endpoint.url).concat(telemetryStrings.filter((value) => /^https?:\/\//i.test(value) && isTelemetryText(value))));
  const vendors = telemetryVendors(telemetryUrls, apiTopology);
  const eventRows = telemetryStrings.concat(endpoints.map((endpoint) => endpoint.url));
  const eventTaxonomy = telemetryTaxonomy(eventRows);
  const routeToEventMap = buildRouteToEventMap(loaded, endpoints, eventRows);
  const duplicates = duplicateTelemetryCandidates(telemetryUrls.concat(endpoints.map((endpoint) => endpoint.path)));
  const noisy = noisyTelemetryCandidates(endpoints, telemetryUrls);
  const routeBased = routeToEventMap.filter((item) => item.events.length > 0);
  const sessionReplaySignals = telemetryStrings.filter((value) => /session.?replay|replay|rrweb|fullstory|hotjar|clarity|mouseflow|logrocket/i.test(value));
  const performanceSignals = telemetryStrings.filter((value) => /beacon|navigationtiming|performance|web-vital|lcp|cls|fid|tti|resource timing/i.test(value));

  return maskSensitive({
    summary: {
      analytics_endpoint_count: endpoints.length,
      event_volume: eventRows.length,
      telemetry_vendor_count: vendors.length,
      duplicate_event_candidates: duplicates.length,
      noisy_telemetry_candidates: noisy.length,
      route_based_tracking: routeBased.length,
      session_replay_signal_count: sessionReplaySignals.length,
      performance_beacon_signal_count: performanceSignals.length,
      confidence: pctNumber(telemetryConfidence(endpoints, telemetryUrls, vendors)),
    },
    vendors,
    event_taxonomy: eventTaxonomy,
    route_to_event_map: routeToEventMap,
    duplicate_event_candidates: duplicates,
    noisy_telemetry_candidates: noisy,
    session_replay_signals: unique(sessionReplaySignals).slice(0, 40),
    performance_beacon_behavior: unique(performanceSignals).slice(0, 40),
    endpoints: endpoints.slice(0, 200),
  });
}

function buildPrivacySignals(normalized, loaded, securityReport, apiTopology, telemetryReport) {
  const f = loaded.files;
  const strings = collectStrings([f.network, f.assets, f.source_maps, f.storage, f.jsenv, f.security, f.auth]);
  const signals = [];
  const add = (id, title, severity, confidence, evidence, reviewAction, businessImpact) => {
    signals.push({
      id,
      title,
      severity,
      confidence,
      evidence: arrayFrom(evidence).slice(0, 30),
      affected: affectedFromEvidence(evidence),
      suggested_review_action: reviewAction,
      business_impact: businessImpact,
    });
  };
  const surfaces = securityReport.surfaces || {};
  if (surfaces.tokens_in_urls?.length) {
    add("sensitive_values_in_query_string", "Sensitive values in query string", "high", 0.78, surfaces.tokens_in_urls, "Review URL parameters, logging paths, and retention policies; move sensitive values to headers or body where appropriate.", "URLs can be copied into logs, analytics tools, referrers, and support tickets.");
  }
  if (surfaces.debug_globals?.length) {
    add("verbose_debug_assets", "Verbose debug assets or runtime globals", "low", 0.62, surfaces.debug_globals, "Review production build flags and remove unnecessary debug/runtime metadata.", "Extra runtime metadata can slow due diligence and expose implementation details to client teams.");
  }
  if (surfaces.exposed_source_maps || f.source_maps?.probableHiddenMaps?.length) {
    add("public_source_maps", "Public source map signals", "medium", 0.7, f.source_maps?.probableHiddenMaps || f.source_maps, "Confirm whether source maps are intentionally published and restrict them if not required for operations.", "Source maps can increase review scope and reveal frontend internals during vendor assessment.");
  }
  const storageKeys = collectObjectKeys(f.storage);
  const legacyStorage = storageKeys.filter((key) => /localstorage|sessionstorage|cookie|token|sid|legacy|cache|profile|user/i.test(key));
  if (legacyStorage.length) {
    add("legacy_storage_patterns", "Legacy storage patterns", storageKeys.some(hasSensitiveName) ? "high" : "medium", 0.66, legacyStorage, "Review browser storage keys for lifecycle, retention, and sensitive data minimization.", "Long-lived client storage may create privacy review and migration concerns.");
  }
  const excessiveTrackers = (telemetryReport.vendors || []).filter((vendor) => vendor.kind === "third-party" || vendor.request_count > 10);
  if (excessiveTrackers.length >= 3 || (telemetryReport.summary?.telemetry_vendor_count || 0) >= 3) {
    add("excessive_third_party_trackers", "Excessive third-party trackers", "medium", 0.68, excessiveTrackers, "Review vendor list, data processing purposes, and route-level tracking behavior.", "Vendor concentration and broad tracking can affect privacy posture and enterprise procurement.");
  }
  const credentialLikeParams = strings.filter((value) => /[?&][^=]*(token|secret|password|sid|session|auth|jwt|key)=/i.test(value)).slice(0, 50);
  if (credentialLikeParams.length) {
    add("credential_like_parameters", "Credential-like parameters", "high", 0.76, credentialLikeParams, "Review whether these parameters are credentials, session identifiers, or harmless opaque IDs.", "Credential-like URL fields often require extra log hygiene and integration review.");
  }
  const cacheSignals = strings.filter((value) => /cache-control|etag|expires|max-age|no-store|no-cache/i.test(value)).slice(0, 50);
  const weakCache = cacheSignals.filter((value) => /max-age=\d{5,}|public/i.test(value) && !/no-store|private/i.test(value));
  if (weakCache.length) {
    add("misconfigured_cache_headers", "Misconfigured cache header signals", "medium", 0.58, weakCache, "Review cache headers for pages and responses carrying user-specific or sensitive data.", "Incorrect caching can complicate compliance review and shared-device behavior.");
  }
  return maskSensitive({
    language: "privacy_and_configuration_signals",
    authorized_review_only: true,
    summary: {
      total: signals.length,
      high: signals.filter((item) => item.severity === "high").length,
      medium: signals.filter((item) => item.severity === "medium").length,
      low: signals.filter((item) => item.severity === "low").length,
      confidence: pctNumber(average(signals.map((item) => item.confidence))),
    },
    signals: signals.sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity) || b.confidence - a.confidence),
  });
}

function buildStorageAnalysis(storage) {
  const cookies = arrayFrom(storage.cookies).map((cookie) => ({
    name: cookie.name,
    value_preview: cookie.value,
    sensitive: Boolean(cookie.sensitive),
    jwt: Boolean(cookie.hints?.jwt),
    session: Boolean(cookie.hints?.session) || /session|sid|stid|auth|token/i.test(cookie.name || ""),
    csrf: Boolean(cookie.hints?.csrf),
    purpose: classifyStoragePurpose(cookie.name),
  }));
  const localEntries = storageEntries(storage.localStorage);
  const sessionEntries = storageEntries(storage.sessionStorage);
  const indexedDbAnalysis = analyzeIndexedDB(storage.indexedDB || {});
  const indexedDatabases = indexedDbAnalysis.databases;
  const cacheNames = arrayFrom(storage.cacheStorage?.names).map((name) => ({
    name,
    purpose: classifyStoragePurpose(name),
  }));
  const serviceWorkers = arrayFrom(storage.serviceWorkers?.registrations).map((reg) => ({
    scope: reg.scope,
    active: reg.active,
    installing: reg.installing,
    waiting: reg.waiting,
  }));
  const riskSignals = [];
  const sensitiveCookies = cookies.filter((cookie) => cookie.sensitive || cookie.session || cookie.jwt || cookie.csrf);
  if (sensitiveCookies.length) riskSignals.push({ severity: "medium", title: "Session/auth-like cookies observed", evidence: sensitiveCookies.map((item) => item.name).slice(0, 30) });
  const sensitiveStorage = localEntries.concat(sessionEntries).filter((item) => item.sensitive);
  if (sensitiveStorage.length) riskSignals.push({ severity: "high", title: "Sensitive-looking browser storage keys", evidence: sensitiveStorage.map((item) => `${item.scope}:${item.key}`).slice(0, 30) });
  const draftDatabases = indexedDatabases.filter((db) => /draft|post|message|offline|cache|keyval|sync/i.test(db.name));
  if (draftDatabases.length) riskSignals.push({ severity: "info", title: "IndexedDB cache/draft databases observed", evidence: draftDatabases.map((db) => db.name).slice(0, 30) });
  if (indexedDbAnalysis.summary.sensitive_store_count || indexedDbAnalysis.summary.sensitive_record_count) {
    riskSignals.push({ severity: "high", title: "Sensitive-looking IndexedDB keys or records", evidence: indexedDbAnalysis.sensitive_evidence.slice(0, 30) });
  }
  if (indexedDbAnalysis.summary.api_payload_store_count) {
    riskSignals.push({ severity: "info", title: "IndexedDB contains API/cache payload signals", evidence: indexedDbAnalysis.api_payload_evidence.slice(0, 30) });
  }

  return maskSensitive({
    summary: {
      cookie_count: cookies.length,
      sensitive_cookie_count: sensitiveCookies.length,
      local_storage_keys: localEntries.length,
      session_storage_keys: sessionEntries.length,
      indexed_db_supported: Boolean(storage.indexedDB?.supported),
      indexed_db_count: indexedDatabases.length,
      indexed_db_store_count: indexedDbAnalysis.summary.store_count,
      indexed_db_record_samples: indexedDbAnalysis.summary.record_sample_count,
      indexed_db_entities: indexedDbAnalysis.summary.entity_count,
      indexed_db_routes: indexedDbAnalysis.summary.route_count,
      indexed_db_urls: indexedDbAnalysis.summary.url_count,
      indexed_db_intelligence_score: indexedDbAnalysis.intelligence_score,
      cache_storage_count: cacheNames.length,
      service_worker_count: serviceWorkers.length,
    },
    cookies,
    local_storage: localEntries,
    session_storage: sessionEntries,
    indexed_db: {
      supported: Boolean(storage.indexedDB?.supported),
      enumeration_supported: Boolean(storage.indexedDB?.enumerationSupported),
      total_known_databases: storage.indexedDB?.totalKnownDatabases || indexedDatabases.length,
      databases: indexedDatabases,
      stores: indexedDbAnalysis.stores,
      record_samples: indexedDbAnalysis.record_samples,
      value_summary: indexedDbAnalysis.value_summary,
      reconstruction_hints: indexedDbAnalysis.reconstruction_hints,
      intelligence_score: indexedDbAnalysis.intelligence_score,
      note: indexedDbAnalysis.note,
    },
    cache_storage: {
      supported: Boolean(storage.cacheStorage?.supported),
      caches: cacheNames,
    },
    service_workers: {
      supported: Boolean(storage.serviceWorkers?.supported),
      controller: storage.serviceWorkers?.controller || null,
      registrations: serviceWorkers,
    },
    risk_signals: riskSignals,
  });
}

function analyzeIndexedDB(indexedDB) {
  const rawDatabases = arrayFrom(indexedDB.databases);
  const stores = [];
  const recordSamples = [];
  const sensitiveEvidence = [];
  const apiPayloadEvidence = [];
  const entities = new Set();
  const routes = new Set();
  const urls = new Set();
  const keys = new Set();
  const valueTypes = {};
  let sensitiveStoreCount = 0;
  let sensitiveRecordCount = 0;
  let apiPayloadStoreCount = 0;

  const databases = rawDatabases.map((db) => {
    const databaseName = db.name || "unnamed";
    const dbStores = arrayFrom(db.stores);
    let dbRecordSamples = 0;
    const dbStoreSummaries = dbStores.map((store) => {
      const storeName = store.name || "unnamed";
      const indexNames = arrayFrom(store.indexes).map((index) => index.name).filter(Boolean);
      const records = arrayFrom(store.records);
      const storeSignals = collectStoreSignals(databaseName, storeName, store, records);
      storeSignals.keys.forEach((key) => keys.add(key));
      storeSignals.entities.forEach((entity) => entities.add(entity));
      storeSignals.routes.forEach((route) => routes.add(route));
      storeSignals.urls.forEach((url) => urls.add(url));
      storeSignals.valueTypes.forEach((type) => { valueTypes[type] = (valueTypes[type] || 0) + 1; });
      dbRecordSamples += records.length;

      const sensitive = hasSensitiveName(storeName) || storeSignals.sensitive;
      if (sensitive) {
        sensitiveStoreCount += 1;
        sensitiveEvidence.push(`${databaseName}.${storeName}`);
      }
      const apiPayload = /api|response|request|cache|query|graphql|rest|endpoint|payload/i.test(`${databaseName} ${storeName} ${storeSignals.keys.join(" ")}`) || storeSignals.urls.length > 0;
      if (apiPayload) {
        apiPayloadStoreCount += 1;
        apiPayloadEvidence.push(`${databaseName}.${storeName}`);
      }
      if (storeSignals.sensitiveRecordCount) sensitiveRecordCount += storeSignals.sensitiveRecordCount;

      const summary = {
        database: databaseName,
        name: storeName,
        purpose: classifyStoragePurpose(`${databaseName} ${storeName}`),
        keyPath: store.keyPath || null,
        autoIncrement: Boolean(store.autoIncrement),
        count: Number.isFinite(Number(store.count)) ? Number(store.count) : null,
        sample_count: records.length,
        indexes: indexNames,
        value_types: storeSignals.valueTypes,
        top_keys: storeSignals.keys.slice(0, 18),
        entities: storeSignals.entities.slice(0, 12),
        routes: storeSignals.routes.slice(0, 12),
        urls: storeSignals.urls.slice(0, 12),
        sensitive,
        api_payload: apiPayload,
      };
      stores.push(summary);
      records.slice(0, 12).forEach((record, index) => {
        recordSamples.push({
          database: databaseName,
          store: storeName,
          sample_index: index,
          key: record.key,
          primaryKey: record.primaryKey,
          type: record.signals?.type || inferValueType(record.value),
          keys: arrayFrom(record.signals?.keys).slice(0, 20),
          entities: arrayFrom(record.signals?.entities).slice(0, 12),
          routes: arrayFrom(record.signals?.routes).slice(0, 10),
          urls: arrayFrom(record.signals?.urls).slice(0, 10),
          hasPagination: Boolean(record.signals?.hasPagination),
          hasSensitiveKeys: Boolean(record.signals?.hasSensitiveKeys),
          value_preview: record.value,
        });
      });
      return summary;
    });
    return {
      name: databaseName,
      version: db.version || null,
      purpose: classifyStoragePurpose(databaseName),
      readable: db.readable === false ? false : Array.isArray(db.stores) ? true : null,
      store_count: Number.isFinite(Number(db.storeCount)) ? Number(db.storeCount) : dbStores.length,
      sample_count: dbRecordSamples,
      stores: dbStoreSummaries.map((store) => store.name).slice(0, 50),
      error: db.error || null,
    };
  });

  const reconstructionHints = buildIndexedDBReconstructionHints({ stores, entities, routes, urls, keys });
  const hasDeepSamples = stores.length > 0 || recordSamples.length > 0;
  const score = hasDeepSamples
    ? Math.min(100, Math.round(
      databases.length * 8 +
      stores.length * 5 +
      recordSamples.length * 1.4 +
      entities.size * 2 +
      routes.size * 2 +
      urls.size * 1.5 +
      apiPayloadStoreCount * 7
    ))
    : Math.min(40, Math.round(databases.length * 3));

  return maskSensitive({
    summary: {
      database_count: databases.length,
      store_count: stores.length,
      record_sample_count: recordSamples.length,
      entity_count: entities.size,
      route_count: routes.size,
      url_count: urls.size,
      sensitive_store_count: sensitiveStoreCount,
      sensitive_record_count: sensitiveRecordCount,
      api_payload_store_count: apiPayloadStoreCount,
    },
    databases,
    stores: stores.sort((a, b) => Number(b.api_payload) - Number(a.api_payload) || (b.sample_count || 0) - (a.sample_count || 0)),
    record_samples: recordSamples.slice(0, 250),
    sensitive_evidence: sensitiveEvidence,
    api_payload_evidence: apiPayloadEvidence,
    value_summary: {
      value_types: valueTypes,
      top_keys: Array.from(keys).slice(0, 150),
      entities: Array.from(entities).slice(0, 150),
      routes: Array.from(routes).slice(0, 150),
      urls: Array.from(urls).slice(0, 150),
    },
    reconstruction_hints: reconstructionHints,
    intelligence_score: score,
    note: hasDeepSamples
      ? "Deep IndexedDB capture is available: object stores, indexes and bounded record samples were analyzed."
      : "Only IndexedDB database metadata is available. Run a fresh SiteSnapshotter capture with the updated injector for object stores and record samples.",
  });
}

function collectStoreSignals(databaseName, storeName, store, records) {
  const keys = new Set();
  const entities = new Set();
  const routes = new Set();
  const urls = new Set();
  const valueTypes = new Set();
  let sensitive = false;
  let sensitiveRecordCount = 0;
  const add = (set, values) => arrayFrom(values).forEach((value) => { if (value) set.add(String(value)); });

  add(keys, [store.keyPath, storeName].concat(arrayFrom(store.indexes).flatMap((index) => [index.name, index.keyPath])));
  records.forEach((record) => {
    const signals = record.signals || {};
    add(keys, signals.keys);
    add(entities, signals.entities);
    add(routes, signals.routes);
    add(urls, signals.urls);
    valueTypes.add(signals.type || inferValueType(record.value));
    if (signals.hasSensitiveKeys || hasSensitiveName(JSON.stringify(record.key || ""))) {
      sensitive = true;
      sensitiveRecordCount += 1;
    }
  });

  return {
    keys: Array.from(keys).filter(Boolean),
    entities: Array.from(entities).filter(Boolean),
    routes: Array.from(routes).filter(Boolean),
    urls: Array.from(urls).filter(Boolean),
    valueTypes: Array.from(valueTypes).filter(Boolean),
    sensitive,
    sensitiveRecordCount,
  };
}

function buildIndexedDBReconstructionHints(context) {
  const stores = context.stores || [];
  const hints = [];
  const add = (kind, title, confidence, evidence, action) => {
    hints.push({ kind, title, confidence, evidence: arrayFrom(evidence).slice(0, 30), action });
  };
  const apiStores = stores.filter((store) => store.api_payload);
  if (apiStores.length) add("api-cache", "API response cache can enrich endpoint schemas", 0.78, apiStores.map((store) => `${store.database}.${store.name}`), "Compare record samples with network captures to recover response fields, pagination, IDs and offline payloads.");
  const routeStores = stores.filter((store) => store.routes?.length);
  if (routeStores.length || context.routes?.size) add("routing", "Client routes discovered in IndexedDB records", 0.7, Array.from(context.routes || []).slice(0, 30), "Use these route strings as crawl candidates and SPA reconstruction checkpoints.");
  const entityStores = stores.filter((store) => store.entities?.length);
  if (entityStores.length || context.entities?.size) add("entities", "Business entities appear in local database records", 0.74, Array.from(context.entities || []).slice(0, 30), "Merge these entity names with schemas/endpoints to improve domain model reconstruction.");
  const offlineStores = stores.filter((store) => /offline|cache|sync|queue|draft|workbox|pouch|dexie|localforage/i.test(`${store.database} ${store.name}`));
  if (offlineStores.length) add("offline", "Offline/cache-first storage layer detected", 0.72, offlineStores.map((store) => `${store.database}.${store.name}`), "Inspect cache freshness, sync queues and draft stores before judging what the server returns live.");
  const authStores = stores.filter((store) => store.sensitive || /auth|token|session|user|profile/i.test(`${store.database} ${store.name} ${store.top_keys?.join(" ")}`));
  if (authStores.length) add("privacy", "Auth/profile-like records require careful handling", 0.76, authStores.map((store) => `${store.database}.${store.name}`), "Keep masked exports by default and avoid using captured personal records as public examples.");
  return hints;
}

function inferValueType(value) {
  if (value == null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object" && value.type) return value.type;
  return typeof value;
}

function storageEntries(value, scope = "") {
  if (!value || typeof value !== "object" || value.error) return [];
  return Object.entries(value).map(([key, itemValue]) => ({
    scope: scope || "browser",
    key,
    value_preview: itemValue,
    sensitive: hasSensitiveName(key),
    purpose: classifyStoragePurpose(key),
  }));
}

function classifyStoragePurpose(value) {
  const text = String(value || "").toLowerCase();
  if (/auth|token|session|sid|csrf|xsrf|login/.test(text)) return "auth/session";
  if (/draft|postponed|posting|compose|message/.test(text)) return "draft/content";
  if (/cache|keyval|sync|data_cache|offline/.test(text)) return "offline/cache";
  if (/analytics|stat|track|fpid|tmr|pixel/.test(text)) return "analytics/tracking";
  if (/emoji|sticker|gift|media|image/.test(text)) return "media/ui cache";
  if (/theme|lang|locale|hint|settings|pref/.test(text)) return "preferences";
  return "application state";
}

function buildExportBundle(swaggerSpecs, postmanExport, typeScriptSdkExport, mockServerExport, moduleGraph, entityMap, jsonFiles) {
  return {
    root: "exports",
    postman: ["exports/postman/collection.json", "exports/postman/environment.json"],
    swagger: Object.keys(swaggerSpecs).map((name) => `exports/swagger/${name}`),
    graphs: ["exports/graphs/module_graph.json", "exports/graphs/entity_graph.json"],
    pdf: ["exports/pdf/report-print.html"],
    json: jsonFiles.map((name) => `exports/json/${name}`),
    typescript_sdk: typeScriptSdkExport?.files || [],
    typescript_sdk_bundle: typeScriptSdkExport?.bundle || null,
    mock_servers: mockServerExport?.archives || [],
    mock_servers_bundle: mockServerExport?.bundle || null,
    counts: {
      swagger_specs: Object.keys(swaggerSpecs).length,
      postman_folders: postmanExport.collection.item.length,
      typescript_sdk_files: typeScriptSdkExport?.files?.length || 0,
      dotnet_mock_archives: mockServerExport?.archives?.length || 0,
      module_nodes: moduleGraph.nodes.length,
      entity_nodes: entityMap.entities.length,
      storage_json_files: jsonFiles.includes("storage_analysis.json") ? 1 : 0,
    },
  };
}

function normalizeEndpoint(endpoint) {
  const url = endpoint?.url || endpoint?.name || "";
  const parsed = parseUrl(url);
  const host = parsed?.hostname === "local.invalid" ? null : parsed?.hostname || null;
  const query = parsed ? Array.from(parsed.searchParams.keys()).sort() : [];
  const headers = normalizeHeaders(endpoint?.headers || endpoint?.request_headers);
  const responseHeaders = normalizeHeaders(endpoint?.response_headers);
  return {
    url,
    path: parsed ? parsed.pathname || "/" : String(url).split("?")[0] || "/",
    host,
    server_kind: inferServerKind(url, endpoint?.category),
    method: String(endpoint?.method || "GET").toUpperCase(),
    category: endpoint?.category || inferEndpointCategory(url),
    count: numberOr(endpoint?.count, 1),
    query_params: unique(arrayFrom(endpoint?.query_params || endpoint?.queryParams).concat(query).map(String)).sort(),
    path_params: inferPathParams(parsed ? parsed.pathname : url),
    headers,
    response_headers: responseHeaders,
    auth_hint: inferAuthHint(url, headers, endpoint),
    content_type: inferContentType(headers, endpoint),
    request_schema: endpoint?.request_schema || endpoint?.requestJsonSignals?.shape || null,
    response_schema: endpoint?.response_schema || endpoint?.responseJsonSignals?.shape || endpoint?.schema?.shape || null,
    request_body_preview: endpoint?.request_body_preview || endpoint?.requestBodyPreview || null,
    response_preview: endpoint?.response_preview || endpoint?.responsePreview || null,
    status_codes: endpoint?.status_code ? [endpoint.status_code] : [],
    entities: unique(arrayFrom(endpoint?.entities).map(String)).sort(),
    triggered_by: unique(arrayFrom(endpoint?.triggered_by).map(String)).sort(),
    confidence: clamp(numberOr(endpoint?.confidence, 0.55), 0, 1),
    evidence_sources: unique(arrayFrom(endpoint?.source || endpoint?.evidence_source || "endpoints.json")).map(String),
  };
}

function buildScenarioGraph(normalized, loaded, apiMap, telemetryReport) {
  const scenario = loaded.files.scenario || {};
  const timeline = arrayFrom(scenario.steps || scenario.timeline || loaded.files.timeline?.items || loaded.files.timeline);
  const nodes = [];

  if (timeline.length) {
    timeline.forEach((step, index) => nodes.push(scenarioNode(step, index)));
  } else {
    const triggers = [];
    for (const group of apiMap.groups) {
      for (const endpoint of group.endpoints) {
        for (const trigger of endpoint.triggered_by) {
          triggers.push({ type: trigger.split(":")[0] || "trigger", label: trigger });
        }
        nodes.push(scenarioNode({
          type: "api",
          label: endpoint.url,
          timestamp: null,
          related_entities: endpoint.entities,
        }, nodes.length));
      }
    }
    triggers.slice(0, 80).forEach((trigger, index) => nodes.splice(index, 0, scenarioNode(trigger, index)));
  }

  const dedupedNodes = nodes.map((node, index) => ({ ...node, id: `step_${index + 1}` }));
  const edges = [];
  for (let i = 0; i < dedupedNodes.length - 1; i += 1) {
    edges.push({ from: dedupedNodes[i].id, to: dedupedNodes[i + 1].id, reason: "observed order" });
  }

  const story = dedupedNodes.map((node, index) => scenarioStoryItem(node, index, apiMap, telemetryReport));
  return maskSensitive({
    nodes: dedupedNodes,
    edges,
    story,
    views: {
      timeline: story,
      user_journey_story: story.map((item) => item.text),
      route_sequence: story.filter((item) => item.type === "route_change" || item.route).map((item) => ({ timestamp: item.timestamp, text: item.text, route: item.route })),
      endpoint_sequence: story.filter((item) => item.endpoint).map((item) => ({ timestamp: item.timestamp, text: item.text, endpoint: item.endpoint })),
      telemetry_sequence: story.filter((item) => item.type === "telemetry" || item.telemetry).map((item) => ({ timestamp: item.timestamp, text: item.text, telemetry: item.telemetry })),
    },
    filters: {
      types: unique(dedupedNodes.map((node) => node.type)).sort(),
      entities: unique(dedupedNodes.flatMap((node) => node.related_entities)).sort(),
      modules: unique(dedupedNodes.flatMap((node) => node.related_modules)).sort(),
    },
  });
}

function scenarioNode(step, index) {
  const type = step.type || step.kind || inferStepType(step);
  return {
    id: `step_${index + 1}`,
    type,
    label: step.label || step.url || step.name || step.action || step.event || type,
    timestamp: step.timestamp || step.time || step.t || null,
    related_entities: unique(arrayFrom(step.related_entities || step.entities)).sort(),
    related_modules: unique(arrayFrom(step.related_modules || step.modules)).sort(),
  };
}

function buildModuleGraph(normalized, loaded, apiMap) {
  const raw = loaded.files.module_graph || {};
  const rawModules = arrayFrom(raw.nodes || raw.modules || raw);
  const endpoints = flattenApiEndpoints(apiMap || { groups: [] });
  const allRoutes = collectStrings([loaded.files.routes, loaded.files.timeline, loaded.files.scenario]).filter((value) => /^\//.test(value) || /^https?:/i.test(value));
  const assetSignals = collectStrings([loaded.files.assets, loaded.files.css, loaded.files.manifest]).slice(0, 2000);
  const telemetrySignals = collectStrings([loaded.files.telemetry]).slice(0, 2000);
  const rawEdges = arrayFrom(raw.edges);
  const nodes = rawModules
    .map((module, index) => {
      const id = module.id || module.name || String(module);
      const relatedEndpoints = relatedEndpointsForModule(id, endpoints).slice(0, 40);
      const evidenceBundle = moduleEvidenceBundle(id, module, relatedEndpoints, allRoutes, assetSignals, telemetrySignals, rawEdges);
      const classifications = scoreModuleLabels(evidenceBundle);
      const best = classifications[0] || unknownClassification(index);
      return {
        id,
        type: module.type || "module",
        score: clamp(numberOr(module.score, 0.5), 0, 1),
        sources: unique(arrayFrom(module.sources)).sort(),
        label: best.label,
        confidence: best.score,
        classifications,
        evidence: best.evidence,
        related_endpoints: relatedEndpoints.map((endpoint) => endpoint.url),
      };
    })
    .filter((node) => node.id && node.id !== "[object Object]")
    .sort((a, b) => b.confidence - a.confidence || b.score - a.score || a.id.localeCompare(b.id));

  const existingEdges = rawEdges.map((edge) => ({
    from: edge.from,
    to: edge.to,
    reason: edge.reason || "capture edge",
  }));

  const classificationEdges = nodes
    .filter((node) => !/^Unknown Cluster /.test(node.label))
    .map((node) => ({ from: node.id, to: node.label, reason: `classification ${Math.round(node.confidence * 100)}%` }));
  const clusters = moduleClassificationClusters(nodes);
  const edges = dedupeEdges(existingEdges.concat(inferModuleEdges(nodes)).concat(classificationEdges));
  return maskSensitive({ nodes, edges, clusters, taxonomy: BUSINESS_MODULE_TAXONOMY.map((item) => item.label) });
}

function buildEntityMap(normalized, loaded, apiMap) {
  const endpoints = flattenApiEndpoints(apiMap);
  const entityNames = new Set();
  for (const endpoint of endpoints) {
    for (const entity of endpoint.entities) entityNames.add(entity);
    collectSchemaEntityNames(endpoint.response_schema).forEach((name) => entityNames.add(name));
    collectSchemaEntityNames(endpoint.request_schema).forEach((name) => entityNames.add(name));
  }
  collectStrings([loaded.files.entities]).filter(isEntityName).forEach((name) => entityNames.add(name));

  const entities = Array.from(entityNames).sort().map((name) => {
    const seen = endpoints.filter((endpoint) => endpoint.entities.includes(name) || schemaHasKey(endpoint.response_schema, name) || schemaHasKey(endpoint.request_schema, name));
    const fields = mergeFields(seen.map((endpoint) => endpoint.response_schema), name);
    return {
      name: titleCase(String(name)),
      canonical: canonicalEntityName(name),
      fields: maskSensitive(fields),
      seen_in_endpoints: seen.map((endpoint) => endpoint.url).sort(),
      related_entities: relatedEntitiesFromEndpoints(name, seen),
      sensitivity: inferSensitivity(name, fields),
      confidence: clamp((seen.length ? 0.48 : 0.3) + Math.min(0.34, seen.length * 0.035) + (Object.keys(fields).length ? 0.12 : 0), 0, 0.94),
      evidence: seen.slice(0, 12).map((endpoint) => ({ endpoint: endpoint.url, method: endpoint.method, category: endpoint.category })),
    };
  });

  const relationships = inferEntityRelationships(entities, endpoints, loaded);
  const graph = {
    nodes: entities.map((entity) => ({ id: entity.name, type: "entity", sensitivity: entity.sensitivity, confidence: entity.confidence })),
    edges: relationships.map((relation) => ({ from: relation.from, to: relation.to, label: relation.relation, confidence: relation.confidence })),
  };
  return maskSensitive({ entities, relationships, graph });
}

function buildSecurityReport(normalized, loaded) {
  const f = loaded.files;
  const strings = collectStrings([f.security, f.auth, f.storage, f.jsenv, f.network, f.source_maps, f.assets]);
  const networkEntries = arrayFrom(f.network?.active || f.network?.requests || f.network?.passive || f.network);
  const urls = unique(strings.filter((value) => /^https?:\/\//i.test(value)).concat(networkEntries.map((entry) => entry.url || entry.name).filter(Boolean)));

  const csp = findHeader(networkEntries, "content-security-policy") || findHeader(networkEntries, "csp");
  const storageKeys = collectObjectKeys(f.storage);
  const globals = collectObjectKeys(f.jsenv).concat(strings.filter((value) => /^(__|webpack|debug|dev)/i.test(value)));
  const sourceMapPresent = Boolean(f.source_maps?.present || strings.some((value) => /\.map($|\?)/i.test(value)));
  const tokenUrls = urls.filter((url) => hasSensitiveName(url));
  const monitoring = strings.filter((value) => /sentry|rollbar|datadog|newrelic|crash|monitor/i.test(value));
  const oauth = strings.filter((value) => /oauth|openid|sso|google|facebook|apple|vkid/i.test(value));
  const captcha = strings.filter((value) => /captcha|recaptcha|hcaptcha/i.test(value));
  const mixedContent = urls.filter((url) => /^http:\/\//i.test(url));
  const suspiciousThirdParty = urls.filter((url) => isSuspiciousThirdParty(url, f.page?.hostname));

  const checks = [
    securityCheck("csp", Boolean(csp), csp ? "CSP header observed" : "No CSP signal in capture", csp || null),
    securityCheck("mixed_content", mixedContent.length === 0, `${mixedContent.length} HTTP asset/request URLs observed`, mixedContent.slice(0, 20)),
    securityCheck("source_maps", !sourceMapPresent, sourceMapPresent ? "Source map signal observed" : "No public source map signal", f.source_maps || null),
    securityCheck("oauth", oauth.length > 0, `${oauth.length} OAuth/SSO-like signals`, oauth.slice(0, 20)),
    securityCheck("monitoring", monitoring.length > 0, `${monitoring.length} monitoring/crash signals`, monitoring.slice(0, 20)),
    securityCheck("captcha", captcha.length > 0, `${captcha.length} captcha signals`, captcha.slice(0, 20)),
    securityCheck("tokens_in_urls", tokenUrls.length === 0, `${tokenUrls.length} sensitive-looking URL parameters`, tokenUrls.slice(0, 20)),
    securityCheck("sensitive_storage", !storageKeys.some(hasSensitiveName), "Sensitive-looking storage keys", storageKeys.filter(hasSensitiveName)),
    securityCheck("debug_globals", !globals.some((key) => /debug|devtools|webpack|__REACT|__VUE/i.test(key)), "Debug/runtime globals", globals.filter((key) => /debug|devtools|webpack|__REACT|__VUE/i.test(key)).slice(0, 30)),
    securityCheck("third_party_scripts", suspiciousThirdParty.length === 0, `${suspiciousThirdParty.length} third-party script/resource signals`, suspiciousThirdParty.slice(0, 30)),
  ];

  const riskScore = Math.min(100, checks.reduce((score, check) => score + (check.status === "warn" ? 11 : 0), 0));
  return maskSensitive({
    passive_only: true,
    risk_score: riskScore,
    checks,
    surfaces: {
      csp: csp || null,
      mixed_content: mixedContent,
      exposed_source_maps: sourceMapPresent,
      oauth_providers: unique(oauth).slice(0, 30),
      monitoring: unique(monitoring).slice(0, 30),
      captcha: unique(captcha).slice(0, 30),
      tokens_in_urls: tokenUrls,
      sensitive_storage_keys: storageKeys.filter(hasSensitiveName),
      debug_globals: globals.filter((key) => /debug|devtools|webpack|__REACT|__VUE/i.test(key)).slice(0, 50),
      suspicious_third_party_scripts: suspiciousThirdParty,
    },
  });
}

function buildVulnerabilityHints(normalized, loaded, securityReport, rulesPath) {
  const items = [];
  const add = (title, severity, confidence, evidence, recommendation) => {
    items.push({ title, severity, confidence, evidence: arrayFrom(evidence).slice(0, 20), recommendation });
  };

  const s = securityReport.surfaces;
  if (!s.csp) add("Weak or missing CSP signal", "medium", 0.65, ["No CSP header was captured"], "Set a restrictive Content-Security-Policy and monitor report-only violations before enforcing.");
  if (s.exposed_source_maps) add("Possible exposed source maps", "medium", 0.7, [loaded.files.source_maps], "Disable public source maps in production or restrict access.");
  if (s.tokens_in_urls.length) add("Auth or tracking tokens in query strings", "high", 0.75, s.tokens_in_urls, "Move sensitive values out of URLs and rotate affected tokens if these URLs reached logs.");
  if (s.sensitive_storage_keys.length) add("Sensitive-looking keys in browser storage", "high", 0.72, s.sensitive_storage_keys, "Avoid storing long-lived secrets or PII in localStorage/sessionStorage.");
  if (s.mixed_content.length) add("Mixed content signals", "medium", 0.7, s.mixed_content, "Serve all resources over HTTPS.");
  if (s.debug_globals.length) add("Debug/runtime globals exposed", "low", 0.6, s.debug_globals, "Remove debug globals and production source metadata from public builds.");
  if (s.monitoring.length > 20) add("Verbose monitoring metadata", "low", 0.55, s.monitoring.slice(0, 20), "Limit public error telemetry metadata to operationally necessary values.");

  for (const endpoint of arrayFrom(loaded.files.endpoints?.endpoints || loaded.files.endpoints)) {
    const schemaStrings = collectStrings([endpoint.request_schema, endpoint.response_schema]);
    if (schemaStrings.some((value) => /phone|email|bdate|address|passport|birth/i.test(value))) {
      add("PII-like fields in API schemas", "medium", 0.68, [endpoint.url], "Review response minimization and field-level authorization for personal data.");
    }
  }

  for (const ruleItem of evaluateRules(loaded, rulesPath)) {
    add(ruleItem.title, ruleItem.severity, ruleItem.confidence, ruleItem.evidence, ruleItem.recommendation);
  }

  return maskSensitive({ items: dedupeHints(items).sort(compareHints) });
}

function evaluateRules(loaded, rulesPath) {
  if (!fs.existsSync(rulesPath)) return [];
  const warnings = [];
  const parsed = safeJsonParse(fs.readFileSync(rulesPath, "utf8"), rulesPath, warnings);
  if (!parsed.ok) return [];
  const rules = arrayFrom(parsed.value.rules || parsed.value);
  const matches = [];
  for (const rule of rules) {
    const fileKey = sanitizeModuleName(String(rule.match?.file || "").replace(/\.json$/i, ""));
    const data = loaded.files[fileKey];
    const actual = getByPath(data, rule.match?.path || "");
    if (matchesRule(actual, rule.match)) {
      matches.push({
        title: rule.title,
        severity: rule.severity || "info",
        confidence: numberOr(rule.confidence, 0.65),
        evidence: [{ rule: rule.id, value: actual }],
        recommendation: rule.recommendation || "Review this passive signal.",
      });
    }
  }
  return matches;
}

function buildOsintReport(normalized, loaded, architecture, apiMap, moduleGraph, securityReport) {
  const hosts = unique(collectStrings([loaded.files.network, loaded.files.assets])
    .map(hostFromMaybeUrl)
    .filter(Boolean))
    .sort();

  return maskSensitive({
    site: normalized.site,
    summary: [
      `Observed ${apiMap.summary.endpoint_count} normalized endpoints.`,
      `Identified ${moduleGraph.nodes.length} frontend module signals.`,
      `Passive risk score: ${securityReport.risk_score}/100.`,
    ],
    observed_hosts: hosts.slice(0, 80),
    likely_architecture: {
      site_type: architecture.site_type,
      frontend_stack: architecture.frontend_stack.slice(0, 20),
      backend_guess: architecture.backend_guess,
    },
    confidence_notes: normalized.warnings.length
      ? ["Some expected capture files were missing or invalid; lower confidence for affected sections."]
      : ["All required capture modules were present."],
    offline_only: true,
  });
}

function buildAssetManifest(assetsData) {
  const assets = [];
  const seen = new Set();
  const candidates = collectStrings([assetsData]).filter((value) => /^https?:\/\//i.test(value));
  for (const url of candidates.sort()) {
    if (seen.has(url)) continue;
    seen.add(url);
    const type = assetType(url);
    const ext = extensionFromUrl(url);
    assets.push({
      url,
      type,
      ext,
      route_seen: [],
      downloadable: isPublicAssetUrl(url),
      local_path: `downloaded_assets/${assetFolder(type, ext)}/${safeAssetName(url, ext)}`,
    });
  }
  return maskSensitive({ assets });
}

function inferSiteType(f, endpoints) {
  const text = collectStrings([f.page, f.routes, f.assets, f.endpoints]).join(" ").toLowerCase();
  if (/cart|checkout|payment|catalog|product/.test(text)) return "Commerce / Marketplace";
  if (/conversation|message|chat|friends|groups|profile|feed/.test(text)) return "Social / Communication App";
  if (/dashboard|admin|analytics|report/.test(text)) return "SaaS Dashboard";
  if (endpoints.length > 25) return "SPA / API-backed Web App";
  return "Web Application";
}

function inferBackend(f, endpoints) {
  const urls = endpoints.map((endpoint) => endpoint.url || "");
  const php = urls.filter((url) => /\.php($|\?)/i.test(url)).length;
  const methodApi = urls.filter((url) => /\/method\//i.test(url)).length;
  return {
    likely_patterns: [
      php ? { name: "PHP endpoints", count: php } : null,
      methodApi ? { name: "RPC method namespace", count: methodApi } : null,
    ].filter(Boolean),
    hosts: unique(collectStrings([f.network, f.assets]).map(hostFromMaybeUrl).filter(Boolean)).slice(0, 30),
    confidence: endpoints.length ? 0.68 : 0.35,
  };
}

function inferDataFlows(endpoints) {
  return endpoints.slice(0, 80).map((endpoint) => ({
    from: endpoint.triggered_by?.[0] || "runtime",
    via: `${endpoint.method || "GET"} ${endpoint.url}`,
    to: endpoint.entities?.length ? endpoint.entities.join(", ") : endpoint.category || "unknown",
    confidence: endpoint.confidence || 0.5,
  }));
}

function inferEndpointCategory(url) {
  if (/message|chat|im/i.test(url)) return "chat";
  if (/auth|login|token|oauth/i.test(url)) return "auth";
  if (/admin|moderation|manage|dashboard|settings/i.test(url)) return "admin";
  if (/upload/i.test(url)) return "upload";
  if (/\.(png|jpe?g|gif|webp|svg|mp4|mp3|m4a|json)($|\?)/i.test(url)) return "media";
  if (/stat|telemetry|track|event|crash/i.test(url)) return "telemetry";
  return "other";
}

function inferServerKind(url, category = "") {
  const text = `${url || ""} ${category || ""}`.toLowerCase();
  const host = parseUrl(url)?.hostname || "";
  if (/auth|login|oauth|sso|token|captcha|session/.test(text) || /^login\.|\.login\.|^auth\.|\.auth\./.test(host)) return "auth";
  if (/telemetry|analytics|stat|track|event|metric|crash|sentry|apptracer/.test(text)) return "telemetry";
  if (/cdn|static|assets|img|image|photo|video|audio|media|upload|userapi|sun\d*-/.test(text)) return "media";
  if (/api|method|graphql|rpc|ajax|xhr|fetch/.test(text) || /^api\.|\.api\./.test(host)) return "api";
  if (host && !/^(www\.)?/.test(host) && !/vk\.com$|localhost|127\.0\.0\.1/.test(host)) return "third-party";
  return "public";
}

function parseUrl(value) {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    try {
      return new URL(value, "https://local.invalid");
    } catch {
      return null;
    }
  }
}

function normalizeHeaders(headers) {
  if (!headers || typeof headers !== "object") return [];
  if (Array.isArray(headers)) {
    return headers.map((header) => typeof header === "string" ? header : `${header.name || header.key || ""}: ${header.value || ""}`).filter(Boolean);
  }
  return Object.entries(headers).map(([key, value]) => `${key}: ${String(value)}`);
}

function inferPathParams(urlPath) {
  const clean = String(urlPath || "").split("?")[0];
  return unique(clean.split("/").filter((part) => /^:\w+|\{\w+\}$/.test(part) || /^[0-9a-f-]{8,}$/i.test(part) || /^\d+$/.test(part))
    .map((part, index) => part.replace(/^[:{]|}$/g, "") || `id${index + 1}`));
}

function inferAuthHint(url, headers, endpoint) {
  const text = `${url || ""} ${headers.join(" ")} ${JSON.stringify(endpoint || {})}`.toLowerCase();
  if (/bearer|authorization|access_token|jwt/.test(text)) return "bearer token";
  if (/cookie|session|sid|csrf|xsrf/.test(text)) return "cookie/session";
  if (/oauth|login|auth|token/.test(text)) return "auth likely";
  return "none observed";
}

function inferContentType(headers, endpoint) {
  const joined = headers.join("\n");
  const match = joined.match(/content-type:\s*([^;\n]+)/i);
  if (match) return match[1].trim();
  if (endpoint?.request_schema || endpoint?.requestJsonSignals || endpoint?.response_schema || endpoint?.responseJsonSignals) return "application/json";
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(endpoint?.url || "")) return "image/*";
  if (/\.(mp4|webm|mp3|m4a)$/i.test(endpoint?.url || "")) return "media/*";
  return "application/json";
}

function rankServerKind(kind) {
  return { frontend: 7, auth: 6, api: 5, media: 4, telemetry: 3, "third-party": 2, public: 1 }[kind] || 0;
}

function serviceBaseUrl(nodes, kind) {
  const candidates = (nodes || []).filter((item) => item.host && item.host !== "local.invalid");
  const node = kind === "api"
    ? candidates.find((item) => item.kind === "api")
      || candidates.find((item) => /^api\.|\.api\./i.test(item.host))
      || candidates.find((item) => (item.examples || []).some((url) => /\/method\/|\/api\/|graphql|rpc/i.test(url)))
    : candidates.find((item) => item.kind === kind);
  return node?.host ? `https://${node.host}` : null;
}

function sameRegistrableDomain(a, b) {
  const tail = (host) => String(host || "").split(".").slice(-2).join(".");
  return tail(a) && tail(a) === tail(b);
}

function methodNamespace(url) {
  const match = String(url || "").match(/\/method\/([a-z0-9_]+)\./i);
  return match ? match[1] : "";
}

function pathPrefix(url) {
  const clean = String(url || "").replace(/^https?:\/\/[^/]+/i, "");
  const parts = clean.split("?")[0].split("/").filter(Boolean);
  if (!parts.length) return "/";
  if (parts[0] === "method" && parts[1]) return `/method/${parts[1].split(".")[0]}`;
  return `/${parts[0]}`;
}

function inferStepType(step) {
  const text = JSON.stringify(step || "").toLowerCase();
  if (/click/.test(text)) return "click";
  if (/route/.test(text)) return "route_change";
  if (/telemetry|stat|event/.test(text)) return "telemetry";
  if (/mutation|dom/.test(text)) return "dom_mutation";
  if (/https?:|\/method\/|xhr|fetch/.test(text)) return "api";
  return "step";
}

function scenarioStoryItem(node, index, apiMap, telemetryReport) {
  const label = String(node.label || "");
  const endpoint = findScenarioEndpoint(label, apiMap);
  const route = /^\/[^/]/.test(label) && !endpoint ? label : null;
  const telemetry = isTelemetryText(label) ? label : null;
  return {
    id: node.id,
    index: index + 1,
    timestamp: node.timestamp || null,
    type: node.type,
    text: humanScenarioText(node, endpoint, telemetry, route),
    route,
    endpoint: endpoint ? { method: endpoint.method, url: endpoint.url, category: endpoint.category } : null,
    telemetry: telemetry ? { signal: telemetry, category: telemetryEventCategory(telemetry) } : null,
    links: {
      route,
      endpoint: endpoint?.url || null,
    },
    confidence: scenarioConfidence(node, endpoint, telemetryReport),
    related_entities: node.related_entities || [],
    related_modules: node.related_modules || [],
  };
}

function humanScenarioText(node, endpoint, telemetry, route) {
  const label = String(node.label || "");
  if (endpoint) {
    if (endpoint.category === "auth" || endpoint.server_kind === "auth") return `Login or auth request observed: ${endpoint.path}`;
    if (endpoint.category === "telemetry" || endpoint.server_kind === "telemetry") return `Usage analytics sent: ${endpoint.path}`;
    if (/message|conversation|chat/i.test(endpoint.path)) return `Loaded messages or conversations via ${endpoint.path}`;
    if (/profile|account|user/i.test(endpoint.path)) return `Profile data loaded via ${endpoint.path}`;
    return `API request observed: ${endpoint.method} ${endpoint.path}`;
  }
  if (telemetry) return `Telemetry sent: ${telemetryEventCategory(telemetry)}`;
  if (route) return `Router changed to ${route}`;
  if (/home|main|index|page/i.test(label) && node.type === "step") return "User opened homepage";
  if (/click/i.test(`${node.type} ${label}`)) return `User interaction observed: ${label}`;
  if (/modal/i.test(label)) return `Modal opened: ${label}`;
  if (/dashboard/i.test(label)) return "Dashboard loaded";
  return label ? `Observed ${node.type}: ${label}` : `Observed session step ${node.id}`;
}

function findScenarioEndpoint(label, apiMap) {
  const endpoints = flattenApiEndpoints(apiMap);
  return endpoints.find((endpoint) => label === endpoint.url || label === endpoint.path || label.includes(endpoint.path) || endpoint.url.includes(label));
}

function scenarioConfidence(node, endpoint, telemetryReport) {
  if (endpoint) return pctNumber(endpoint.confidence || 0.62);
  if (isTelemetryText(node.label) && telemetryReport.summary?.confidence) return telemetryReport.summary.confidence;
  if (node.timestamp) return "62%";
  return "52%";
}

function inferModuleEdges(nodes) {
  const edges = [];
  const sourceMap = new Map();
  for (const node of nodes) {
    for (const source of node.sources) {
      if (!sourceMap.has(source)) sourceMap.set(source, []);
      sourceMap.get(source).push(node.id);
    }
  }
  for (const [source, ids] of sourceMap.entries()) {
    ids.slice(0, 12).forEach((id) => {
      if (id !== titleCase(source)) edges.push({ from: id, to: titleCase(source), reason: `shared ${source} signal` });
    });
  }
  return edges;
}

function relatedEndpointsForModule(moduleId, endpoints) {
  const tokens = significantTokens(moduleId);
  if (!tokens.length) return [];
  return endpoints.filter((endpoint) => {
    const text = `${endpoint.url} ${endpoint.path} ${endpoint.category} ${endpoint.server_kind} ${endpoint.entities.join(" ")}`.toLowerCase();
    return tokens.some((token) => text.includes(token));
  });
}

function moduleEvidenceBundle(moduleId, module, endpoints, routes, assets, telemetry, edges) {
  const tokens = significantTokens(moduleId);
  const near = (values) => values.filter((value) => tokens.some((token) => String(value).toLowerCase().includes(token))).slice(0, 20);
  return {
    module_names: [moduleId, module.name, module.type].filter(Boolean),
    sources: arrayFrom(module.sources),
    endpoints: endpoints.map((endpoint) => `${endpoint.method} ${endpoint.url} ${endpoint.category} ${endpoint.entities.join(" ")}`),
    routes: near(routes),
    assets: near(assets),
    telemetry: near(telemetry),
    graph_relations: edges
      .filter((edge) => String(edge.from || "").includes(moduleId) || String(edge.to || "").includes(moduleId))
      .map((edge) => `${edge.from} ${edge.to} ${edge.reason || ""}`)
      .slice(0, 20),
  };
}

function scoreModuleLabels(evidenceBundle) {
  const weightedSources = [
    ["module_names", 1.2],
    ["endpoints", 1.1],
    ["routes", 0.85],
    ["telemetry", 0.9],
    ["assets", 0.65],
    ["graph_relations", 0.75],
    ["sources", 0.55],
  ];
  const labels = [];
  for (const taxonomy of BUSINESS_MODULE_TAXONOMY) {
    let score = 0;
    const evidence = [];
    for (const [sourceName, sourceWeight] of weightedSources) {
      for (const value of arrayFrom(evidenceBundle[sourceName])) {
        const text = String(value || "");
        const hits = taxonomy.patterns.filter((pattern) => pattern.test(text));
        if (!hits.length) continue;
        score += Math.min(0.18, hits.length * 0.055 * sourceWeight * taxonomy.weight);
        if (evidence.length < 8) evidence.push({ source: sourceName, value: text.slice(0, 180) });
      }
    }
    if (score > 0) labels.push({ label: taxonomy.label, score: clamp(score, 0, 0.96), evidence });
  }
  const sorted = labels.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  if (!sorted.length || sorted[0].score < 0.24) return [unknownClassification(0)];
  return sorted.slice(0, 4);
}

function unknownClassification(index) {
  return { label: `Unknown Cluster ${String.fromCharCode(65 + (index % 26))}`, score: 0.22, evidence: [] };
}

function moduleClassificationClusters(nodes) {
  return Object.entries(groupFullBy(nodes, (node) => node.label || "Unknown Cluster A"))
    .map(([label, rows]) => ({
      label,
      confidence: average(rows.map((row) => row.confidence)),
      modules: rows.map((row) => row.id).slice(0, 80),
      module_count: rows.length,
      top_alternatives: Object.entries(countBy(rows.flatMap((row) => row.classifications.slice(1).map((item) => item.label)), (value) => value))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
    }))
    .sort((a, b) => b.module_count - a.module_count || b.confidence - a.confidence);
}

function significantTokens(value) {
  return unique(String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4 && !/^\d+$/.test(token))
    .slice(0, 12));
}

function collectSchemaEntityNames(schema) {
  const names = [];
  walk(schema, (value, key) => {
    if (isEntityName(key)) names.push(key);
    if (typeof value === "string" && isEntityName(value)) names.push(value);
  });
  return unique(names);
}

function schemaHasKey(schema, name) {
  let found = false;
  walk(schema, (_value, key) => {
    if (String(key).toLowerCase() === String(name).toLowerCase()) found = true;
  });
  return found;
}

function mergeFields(schemas, entityName) {
  const fields = {};
  for (const schema of schemas) {
    const node = findObjectByKey(schema, entityName);
    if (node && typeof node === "object" && !Array.isArray(node)) {
      for (const key of Object.keys(node).sort()) fields[key] = node[key];
    }
  }
  return fields;
}

function relatedEntitiesFromEndpoints(name, endpoints) {
  const related = new Set();
  for (const endpoint of endpoints) {
    for (const entity of endpoint.entities) {
      if (String(entity).toLowerCase() !== String(name).toLowerCase()) related.add(entity);
    }
  }
  return Array.from(related).sort();
}

function inferEntityRelationships(entities, endpoints, loaded) {
  const byCanonical = new Map(entities.map((entity) => [entity.canonical, entity]));
  const relations = [];
  const add = (from, relation, to, confidence, evidence) => {
    if (!from || !to || from === to) return;
    const key = `${from}|${relation}|${to}`;
    if (relations.some((item) => item.key === key)) return;
    relations.push({ key, from, relation, to, confidence: clamp(confidence, 0, 0.95), evidence: arrayFrom(evidence).slice(0, 8) });
  };

  const canonicalName = (value) => byCanonical.get(canonicalEntityName(value))?.name || titleCase(value);
  for (const endpoint of endpoints) {
    const endpointEntities = unique(endpoint.entities.concat(collectSchemaEntityNames(endpoint.request_schema), collectSchemaEntityNames(endpoint.response_schema)));
    for (const entity of endpointEntities) {
      const source = canonicalName(entity);
      const pathText = `${endpoint.path} ${endpoint.url}`.toLowerCase();
      for (const other of endpointEntities) {
        if (canonicalEntityName(entity) === canonicalEntityName(other)) continue;
        const target = canonicalName(other);
        add(source, inferRelationVerb(entity, other, pathText), target, endpoint.confidence * 0.78, { endpoint: endpoint.url, method: endpoint.method });
      }
    }
  }

  const strings = collectStrings([loaded.files.forms, loaded.files.routes, loaded.files.storage, loaded.files.telemetry]).slice(0, 1000);
  for (const value of strings) {
    const hits = entities.filter((entity) => significantTokens(entity.name).some((token) => String(value).toLowerCase().includes(token))).slice(0, 5);
    for (let i = 0; i < hits.length - 1; i += 1) {
      add(hits[i].name, inferRelationVerb(hits[i].name, hits[i + 1].name, value), hits[i + 1].name, 0.52, { signal: String(value).slice(0, 180) });
    }
  }

  return relations
    .map(({ key, ...item }) => item)
    .sort((a, b) => b.confidence - a.confidence || a.from.localeCompare(b.from))
    .slice(0, 300);
}

function inferRelationVerb(from, to, context) {
  const text = `${from} ${to} ${context || ""}`.toLowerCase();
  if (/conversation|dialog/.test(text) && /message/.test(text)) return "contains";
  if (/cart/.test(text) && /product|item/.test(text)) return "contains";
  if (/order|invoice|payment/.test(text) && /user|customer|profile/.test(text)) return "belongs_to";
  if (/profile|user|account/.test(text) && /notification|message/.test(text)) return "receives";
  if (/media|photo|video|file|attachment/.test(text) && /post|message|comment/.test(text)) return "attached_to";
  if (/category/.test(text) && /product|item/.test(text)) return "groups";
  if (/like|reaction/.test(text)) return "reacts_to";
  if (/comment/.test(text)) return "comments_on";
  if (/owner|author|creator|user|profile/.test(text)) return "owns";
  return "relates_to";
}

function canonicalEntityName(value) {
  const text = String(value || "").toLowerCase();
  if (/users?|profiles?|account|owner|author|creator|customer/.test(text)) return "user";
  if (/messages?|chat_message/.test(text)) return "message";
  if (/conversation|dialog|chat/.test(text)) return "conversation";
  if (/photos?|videos?|audio|media|files?|attachment/.test(text)) return "media";
  if (/products?|items?|catalog/.test(text)) return "product";
  if (/cart|basket/.test(text)) return "cart";
  if (/orders?/.test(text)) return "order";
  if (/tickets?|support/.test(text)) return "ticket";
  if (/invoices?|billing|payment/.test(text)) return "invoice";
  if (/comments?/.test(text)) return "comment";
  if (/notifications?|push/.test(text)) return "notification";
  return text.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function inferSensitivity(name, fields) {
  const text = `${name} ${Object.keys(fields || {}).join(" ")}`;
  if (/phone|email|bdate|address|token|secret|password|session|auth/i.test(text)) return "high";
  if (/user|profile|payment|message|conversation|friend/i.test(text)) return "medium";
  return "low";
}

function securityCheck(id, passed, summary, evidence) {
  return { id, status: passed ? "ok" : "warn", summary, evidence };
}

function findHeader(entries, headerName) {
  for (const entry of entries) {
    const headers = entry.responseHeaders || entry.headers || {};
    for (const key of Object.keys(headers)) {
      if (key.toLowerCase() === headerName.toLowerCase()) return headers[key];
    }
  }
  return null;
}

function matchesRule(actual, match) {
  if (!match) return false;
  if (Object.prototype.hasOwnProperty.call(match, "equals")) return actual === match.equals;
  if (match.exists) return actual !== undefined && actual !== null;
  if (match.contains) return String(actual || "").includes(match.contains);
  if (match.regex) return new RegExp(match.regex, "i").test(String(actual || ""));
  return false;
}

function getByPath(data, pathExpr) {
  if (!pathExpr) return data;
  return String(pathExpr).split(".").filter(Boolean).reduce((value, key) => {
    if (value == null) return undefined;
    return value[key];
  }, data);
}

function isSuspiciousThirdParty(url, firstPartyHost) {
  const host = hostFromMaybeUrl(url);
  if (!host || !firstPartyHost) return false;
  if (host === firstPartyHost || host.endsWith(`.${firstPartyHost}`)) return false;
  return /\.(js|mjs)($|\?)/i.test(url) || /script|track|pixel|tag|analytics/i.test(url);
}

function isTechSignal(value) {
  return /react|vue|angular|svelte|webpack|vite|rollup|parcel|mobx|redux|pinia|vkui|core_spa|spa|typescript|babel/i.test(value);
}

function isEntityName(value) {
  return /^[a-z][a-z0-9_]{2,40}$/i.test(String(value || "")) && /user|profile|group|message|conversation|payment|notification|comment|like|friend|story|file|event|order|post/i.test(value);
}

function isPublicAssetUrl(url) {
  try {
    const parsed = new URL(url);
    return PUBLIC_ASSET_PROTOCOLS.has(parsed.protocol) && !hasSensitiveName(parsed.search);
  } catch {
    return false;
  }
}

function assetType(url) {
  const ext = extensionFromUrl(url);
  if (ext === "css") return "style";
  if (["js", "mjs"].includes(ext)) return "script";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "ico", "avif"].includes(ext)) return "image";
  if (["woff", "woff2", "ttf", "otf", "eot"].includes(ext)) return "font";
  if (["mp4", "webm", "mp3", "m4a", "ogg", "wav"].includes(ext)) return "media";
  if (ext === "json") return "json";
  return "other";
}

function assetFolder(type, ext) {
  if (type === "style") return "css";
  if (type === "script") return "js";
  if (type === "image") return "img";
  if (type === "font") return "fonts";
  if (type === "media") return "media";
  if (ext === "json") return "json";
  return "other";
}

function extensionFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).replace(".", "").toLowerCase();
    return ext || "bin";
  } catch {
    return "bin";
  }
}

function safeAssetName(url, ext) {
  const parsed = new URL(url);
  const base = path.basename(parsed.pathname) || "asset";
  const safe = base.replace(/[^a-z0-9._-]+/gi, "_").slice(0, 80);
  return safe.includes(".") ? safe : `${safe}.${ext || "bin"}`;
}

function flattenApiEndpoints(apiMap) {
  return apiMap.groups.flatMap((group) => group.endpoints);
}

function openApiSpecFor(bucket, apiTopology, options = {}) {
  const name = bucket.key;
  const label = bucket.label;
  const endpoints = bucket.endpoints;
  const version = options.version || "3.0.3";
  const paths = {};
  for (const endpoint of endpoints) {
    const pathName = toOpenApiPath(endpoint.path || endpoint.url);
    if (!paths[pathName]) paths[pathName] = {};
    paths[pathName][endpoint.method.toLowerCase()] = {
      tags: unique([titleCase(endpoint.category || name), titleCase(endpoint.server_kind || "api")]),
      summary: `${endpoint.method} ${endpoint.path || endpoint.url}`,
      description: `Inferred from passive capture. Auth hint: ${endpoint.auth_hint}. Confidence: ${Math.round((endpoint.confidence || 0.55) * 100)}%.`,
      parameters: openApiParameters(endpoint),
      requestBody: ["POST", "PUT", "PATCH"].includes(endpoint.method) ? {
        required: false,
        content: {
          [endpoint.content_type || "application/json"]: {
            schema: schemaToOpenApi(endpoint.request_schema),
            example: sampleFromSchema(endpoint.request_schema),
          },
        },
      } : undefined,
      responses: {
        "200": {
          description: "Captured or inferred response shape",
          content: {
            "application/json": {
              schema: schemaToOpenApi(endpoint.response_schema),
              example: sampleFromSchema(endpoint.response_schema),
            },
          },
        },
      },
      security: endpoint.auth_hint && endpoint.auth_hint !== "none observed" ? [{ bearerAuth: [] }] : [],
      "x-sitereconstructor": {
        confidence: endpoint.confidence,
        server_kind: endpoint.server_kind,
        category: endpoint.category,
        auth_hint: endpoint.auth_hint,
        observed_status_codes: endpoint.observed_status_codes || [200],
        inferred_schema: true,
        draft: true,
        source_url: endpoint.url,
      },
    };
    if (!paths[pathName][endpoint.method.toLowerCase()].requestBody) delete paths[pathName][endpoint.method.toLowerCase()].requestBody;
  }
  return {
    openapi: version,
    info: {
      title: `SiteReconstructor ${label} API`,
      version: "0.1.0",
      description: "Generated from authorized passive website capture evidence. Schemas are inferred drafts until validated.",
    },
    servers: swaggerServersForBucket(bucket, apiTopology),
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer" },
      },
    },
    paths,
  };
}

function swagger2SpecFor(bucket, apiTopology) {
  const name = bucket.key;
  const label = bucket.label;
  const endpoints = bucket.endpoints;
  const firstServer = swaggerServersForBucket(bucket, apiTopology)[0];
  const paths = {};
  for (const endpoint of endpoints) {
    const pathName = toOpenApiPath(endpoint.path || endpoint.url);
    if (!paths[pathName]) paths[pathName] = {};
    paths[pathName][endpoint.method.toLowerCase()] = {
      tags: unique([titleCase(endpoint.category || name), titleCase(endpoint.server_kind || "api")]),
      summary: `${endpoint.method} ${endpoint.path || endpoint.url}`,
      description: `Swagger 2.0 compatibility draft. Auth hint: ${endpoint.auth_hint}. Confidence: ${Math.round((endpoint.confidence || 0.55) * 100)}%.`,
      consumes: [endpoint.content_type || "application/json"],
      produces: ["application/json"],
      parameters: swagger2Parameters(endpoint),
      responses: {
        "200": {
          description: "Captured or inferred response shape",
          schema: schemaToOpenApi(endpoint.response_schema),
        },
      },
      security: endpoint.auth_hint && endpoint.auth_hint !== "none observed" ? [{ bearerAuth: [] }] : [],
      "x-sitereconstructor": {
        confidence: endpoint.confidence,
        server_kind: endpoint.server_kind,
        category: endpoint.category,
        source_url: endpoint.url,
        draft: true,
      },
    };
  }
  return {
    swagger: "2.0",
    info: {
      title: `SiteReconstructor ${label} API`,
      version: "0.1.0",
      description: "Swagger 2.0 compatibility export generated from authorized passive capture evidence.",
    },
    host: parseUrl(firstServer?.url || "")?.host || apiTopology.frontend_domain || "example.test",
    schemes: ["https"],
    basePath: "/",
    securityDefinitions: {
      bearerAuth: { type: "apiKey", name: "Authorization", in: "header" },
    },
    paths,
  };
}

function swagger2Parameters(endpoint) {
  const params = openApiParameters(endpoint).map((param) => ({
    name: param.name,
    in: param.in,
    required: param.required,
    type: param.schema?.type || "string",
    description: param.description,
  }));
  if (["POST", "PUT", "PATCH"].includes(endpoint.method)) {
    params.push({
      name: "body",
      in: "body",
      required: false,
      schema: schemaToOpenApi(endpoint.request_schema),
    });
  }
  return params;
}

function swaggerServersForBucket(bucket, apiTopology) {
  const endpointHosts = unique(bucket.endpoints.map((endpoint) => endpoint.host || parseUrl(endpoint.url)?.hostname).filter(Boolean));
  const topologyMatches = arrayFrom(apiTopology.domains)
    .filter((domain) => endpointHosts.includes(domain.host) || bucket.endpoints.some((endpoint) => sameSwaggerBucketForDomain(endpoint, domain, bucket.key)))
    .slice(0, 8)
    .map((domain) => ({ url: `https://${domain.host}`, description: domain.kind }));
  if (topologyMatches.length) return topologyMatches;
  return endpointHosts.slice(0, 8).map((host) => ({ url: `https://${host}`, description: "observed host" }));
}

function sameSwaggerBucketForDomain(endpoint, domain, bucketKey) {
  const endpointBucket = swaggerBucketKey(endpoint);
  if (endpointBucket === bucketKey && domain.host === (endpoint.host || parseUrl(endpoint.url)?.hostname)) return true;
  if (bucketKey === "thirdparty" && domain.kind === "third-party") return true;
  return false;
}

function postmanFolderName(endpoint) {
  if (endpoint.category === "admin") return "Admin";
  if (endpoint.server_kind === "auth" || endpoint.category === "auth") return "Auth";
  if (endpoint.server_kind === "media" || ["media", "upload"].includes(endpoint.category)) return "Media";
  if (endpoint.server_kind === "telemetry" || endpoint.category === "telemetry") return "Telemetry";
  if (endpoint.server_kind === "third-party") return "Third-party";
  return "Public API";
}

function postmanFolderDescription(name, endpoints) {
  const count = endpoints.length;
  const headerCount = endpoints.reduce((sum, endpoint) => sum + (endpoint.headers || []).length, 0);
  const suffix = headerCount
    ? ` ${headerCount} observed headers were exported as values or safe placeholders.`
    : " No request headers were present in the passive endpoint evidence; default Accept/Content-Type/auth placeholders were added where useful.";
  if (name === "Telemetry") {
    return `${count} telemetry request${count === 1 ? "" : "s"} inferred from analytics/stat/event capture evidence.${suffix}`;
  }
  return `${count} inferred requests. Review generated bodies and auth placeholders before production use.${suffix}`;
}

function postmanItem(endpoint, storageAnalysis = {}) {
  const parsed = parseUrl(endpoint.url);
  const pathParts = (parsed?.pathname || endpoint.path || "/").split("/").filter(Boolean);
  const query = endpoint.query_params.map((key) => ({ key, value: `{{${key}}}`, disabled: false }));
  const baseVariable = postmanBaseVariable(endpoint);
  const pathName = parsed?.pathname || endpoint.path || "/";
  const rawUrl = `${baseVariable}${pathName}${query.length ? `?${query.map((item) => `${encodeURIComponent(item.key)}=${item.value}`).join("&")}` : ""}`;
  return {
    name: `${endpoint.method} ${endpoint.path || endpoint.url}`,
    event: [{
      listen: "test",
      script: {
        type: "text/javascript",
        exec: [
          "pm.test('status is below 500', function () {",
          "  pm.expect(pm.response.code).to.be.below(500);",
          "});",
        ],
      },
    }],
    request: {
      auth: endpoint.auth_hint && endpoint.auth_hint !== "none observed" ? {
        type: "bearer",
        bearer: [{ key: "token", value: "{{access_token}}", type: "string" }],
      } : undefined,
      method: endpoint.method,
      header: postmanHeaders(endpoint, storageAnalysis),
      url: {
        raw: rawUrl,
        host: [baseVariable],
        path: pathParts,
        query,
      },
      body: postmanBody(endpoint),
      description: `Category: ${endpoint.category}. Server: ${endpoint.server_kind}. Auth: ${endpoint.auth_hint}. Confidence: ${Math.round((endpoint.confidence || 0.55) * 100)}%. Request headers: ${(endpoint.headers || []).length}. Request body preview: ${endpoint.request_body_preview ? "observed" : "not observed"}. Generated from observed metadata; review before production use.`,
    },
    response: [{
      name: "Inferred 200",
      originalRequest: { method: endpoint.method, url: endpoint.url },
      status: "OK",
      code: 200,
      body: JSON.stringify(sampleFromSchema(endpoint.response_schema), null, 2),
    }],
  };
}

function postmanHeaders(endpoint, storageAnalysis = {}) {
  const isBodyMethod = ["POST", "PUT", "PATCH"].includes(endpoint.method);
  const headers = new Map();
  const add = (key, value, options = {}) => {
    if (!key) return;
    const normalizedKey = titleCaseHeader(key);
    headers.set(normalizedKey.toLowerCase(), {
      key: normalizedKey,
      value: String(value ?? ""),
      disabled: Boolean(options.disabled),
      description: options.description,
    });
  };

  add("Accept", "application/json");
  if (isBodyMethod || endpoint.content_type) {
    add("Content-Type", endpoint.content_type || "application/json");
  }

  for (const headerLine of endpoint.headers || []) {
    const parsed = parseHeaderLine(headerLine);
    if (!parsed) continue;
    const placeholder = postmanHeaderPlaceholder(parsed.key, parsed.value);
    add(parsed.key, placeholder.value, {
      disabled: false,
      description: placeholder.description,
    });
  }

  if (endpoint.auth_hint === "cookie/session" && !headers.has("cookie")) {
    add("Cookie", "{{session_cookie}}", { description: "Session cookie placeholder captured as sensitive evidence." });
  }
  if (!headers.has("cookie") && shouldAttachCookiePlaceholder(endpoint, storageAnalysis)) {
    add("Cookie", "{{session_cookie}}", {
      disabled: false,
      description: "Browser would attach applicable cookies automatically; captured values are represented by session_cookie.",
    });
  }
  if (/bearer|token|auth/i.test(endpoint.auth_hint || "") && !headers.has("authorization")) {
    add("Authorization", "Bearer {{access_token}}", { description: "Authorization placeholder; captured token values are intentionally not exported." });
  }

  return Array.from(headers.values()).sort((a, b) => {
    const order = ["accept", "content-type", "authorization", "cookie"];
    return (order.indexOf(a.key.toLowerCase()) === -1 ? 99 : order.indexOf(a.key.toLowerCase()))
      - (order.indexOf(b.key.toLowerCase()) === -1 ? 99 : order.indexOf(b.key.toLowerCase()))
      || a.key.localeCompare(b.key);
  });
}

function shouldAttachCookiePlaceholder(endpoint, storageAnalysis) {
  const summary = storageAnalysis.summary || {};
  if (!summary.cookie_count) return false;
  if (endpoint.server_kind === "third-party" || endpoint.server_kind === "media") return false;
  return endpoint.server_kind === "api" || endpoint.server_kind === "auth" || endpoint.server_kind === "public" || endpoint.host === null;
}

function postmanBody(endpoint) {
  if (!["POST", "PUT", "PATCH"].includes(endpoint.method)) return undefined;
  const preview = endpoint.request_body_preview;
  const contentType = endpoint.content_type || "";
  if (preview && !/^\{masked\}$|\[masked\]/i.test(String(preview))) {
    return {
      mode: "raw",
      raw: String(preview),
      options: { raw: { language: /json/i.test(contentType) ? "json" : "text" } },
    };
  }
  if (/x-www-form-urlencoded/i.test(contentType)) {
    return {
      mode: "urlencoded",
      urlencoded: [{ key: "example", value: "", disabled: true, description: "Captured body was masked or unavailable. Fill observed form fields manually." }],
    };
  }
  return {
    mode: "raw",
    raw: JSON.stringify(sampleFromSchema(endpoint.request_schema), null, 2),
    options: { raw: { language: "json" } },
  };
}

function parseHeaderLine(headerLine) {
  const match = String(headerLine || "").match(/^([^:]+):\s*(.*)$/);
  if (!match) return null;
  return { key: match[1].trim(), value: match[2].trim() };
}

function postmanHeaderPlaceholder(key, value) {
  const lower = String(key || "").toLowerCase();
  if (lower === "authorization") return { value: "Bearer {{access_token}}", description: "Sensitive captured value replaced with access_token variable." };
  if (lower === "cookie") return { value: "{{session_cookie}}", description: "Sensitive captured value replaced with session_cookie variable." };
  if (/csrf|xsrf/.test(lower)) return { value: "{{csrf_token}}", description: "Sensitive captured value replaced with csrf_token variable." };
  if (/token|secret|session|sid|api[-_]?key/.test(lower)) return { value: `{{${postmanVariableName(key)}}}`, description: "Sensitive captured value replaced with a variable placeholder." };
  if (!value || /\[masked\]|\{masked\}/i.test(String(value))) return { value: `{{${postmanVariableName(key)}}}`, description: "Captured value was unavailable or masked; fill this environment variable before sending." };
  return { value, description: "Observed request header from passive capture." };
}

function postmanVariableName(key) {
  return String(key || "header")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "header";
}

function titleCaseHeader(key) {
  return String(key || "")
    .split("-")
    .map((part) => part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part)
    .join("-");
}

function postmanBaseVariable(endpoint) {
  if (endpoint.server_kind === "auth" || endpoint.category === "auth") return "{{auth_base_url}}";
  if (endpoint.server_kind === "media" || ["media", "upload"].includes(endpoint.category)) return "{{media_base_url}}";
  if (endpoint.server_kind === "telemetry" || endpoint.category === "telemetry") return "{{telemetry_base_url}}";
  if (endpoint.server_kind === "api" || /^\/method\//i.test(endpoint.path || "")) return "{{api_base_url}}";
  return "{{base_url}}";
}

function toOpenApiPath(value) {
  const pathName = parseUrl(value)?.pathname || String(value || "/").split("?")[0] || "/";
  let index = 0;
  return pathName.replace(/\/(\d+|[0-9a-f-]{8,})(?=\/|$)/gi, () => {
    index += 1;
    return `/id${index}`;
  }).replace(/\/id(\d+)/g, "/{id$1}");
}

function openApiParameters(endpoint) {
  const params = [];
  for (const name of endpoint.path_params || []) {
    params.push({ name, in: "path", required: true, schema: { type: "string" } });
  }
  for (const name of endpoint.query_params || []) {
    params.push({ name, in: "query", required: false, schema: { type: "string" } });
  }
  if (endpoint.auth_hint && endpoint.auth_hint !== "none observed") {
    params.push({ name: "Authorization", in: "header", required: false, schema: { type: "string" }, example: "Bearer {{access_token}}" });
  }
  return params;
}

function schemaToOpenApi(schema) {
  if (!schema) return { type: "object", additionalProperties: true };
  if (typeof schema === "string") return { type: primitiveSchemaType(schema) };
  if (Array.isArray(schema)) return { type: "array", items: schemaToOpenApi(schema[0]) };
  if (typeof schema !== "object") return { type: primitiveSchemaType(typeof schema) };
  const properties = {};
  for (const [key, value] of Object.entries(schema).slice(0, 80)) {
    properties[key] = schemaToOpenApi(value);
  }
  return { type: "object", properties };
}

function sampleFromSchema(schema) {
  if (!schema) return {};
  if (Array.isArray(schema)) return [sampleFromSchema(schema[0])];
  if (typeof schema === "string") {
    if (/number|integer|count|id/i.test(schema)) return 1;
    if (/boolean|bool/i.test(schema)) return true;
    return schema.length > 30 ? "string" : schema;
  }
  if (typeof schema !== "object") return schema;
  const sample = {};
  for (const [key, value] of Object.entries(schema).slice(0, 20)) {
    sample[key] = sampleFromSchema(value);
  }
  return sample;
}

function primitiveSchemaType(value) {
  const text = String(value || "").toLowerCase();
  if (/int|number|float|double|decimal/.test(text)) return "number";
  if (/bool/.test(text)) return "boolean";
  if (/array|list/.test(text)) return "array";
  if (/object|map|record/.test(text)) return "object";
  return "string";
}

function average(values) {
  const nums = (values || []).map(Number).filter(Number.isFinite);
  return nums.length ? nums.reduce((sum, value) => sum + value, 0) / nums.length : 0.55;
}

function pctNumber(value) {
  return `${Math.round(clamp(value, 0, 1) * 100)}%`;
}

function hasAnyPath(swaggerSpecs) {
  return Object.values(swaggerSpecs || {}).some((spec) => Object.keys(spec.paths || {}).length) ? 1 : 0;
}

module.exports = {
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
  flattenApiEndpoints,
};
