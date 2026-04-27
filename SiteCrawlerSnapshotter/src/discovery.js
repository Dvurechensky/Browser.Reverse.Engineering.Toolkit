"use strict";

const { normalizeUrl, allowedUrl } = require("./queue");

const FETCH_LIMITS = {
  auxiliaryFiles: 12,
  scriptFiles: 8,
  sourceMapFiles: 8,
  cacheEntries: 100,
};

async function discoverLinks(page, capture, config) {
  const current = page.url();
  const urls = new Map();
  const add = (url, source) => {
    const normalized = normalizeUrl(url, current);
    if (normalized && allowedUrl(normalized, config) && isLikelyNavigableUrl(normalized) && !urls.has(normalized)) urls.set(normalized, source);
  };
  const addMany = (values, source) => (values || []).forEach((value) => add(value, source));

  const domSignals = await readDomSignals(page);
  addMany(domSignals.links, "dom");
  addMany(domSignals.forms, "form");
  addMany(domSignals.manifests, "manifest-link");

  const captureSignals = collectCaptureCandidates(capture);
  Object.entries(captureSignals).forEach(([source, values]) => addMany(values, source));

  const auxiliaryFetchSignals = await fetchAuxiliaryDiscoveryFiles(page, current, captureSignals.auxiliary_files || []);
  Object.entries(auxiliaryFetchSignals).forEach(([source, values]) => addMany(values, source));

  const runtimeSignals = await collectRuntimeDiscovery(page);
  Object.entries(runtimeSignals).forEach(([source, values]) => addMany(values, source));

  const codeSignals = await fetchCodeDiscovery(page, current, captureSignals);
  Object.entries(codeSignals).forEach(([source, values]) => addMany(values, source));

  return Array.from(urls.entries()).map(([url, source]) => ({ url, source }));
}

async function readDomSignals(page) {
  return page.evaluate(() => {
    const values = { links: [], forms: [], manifests: [] };
    document.querySelectorAll("a[href], area[href], link[href]").forEach((node) => {
      const href = node.href || node.getAttribute("href");
      if (href) values.links.push(href);
    });
    document.querySelectorAll("[data-href], [data-url], [to]").forEach((node) => {
      const href = node.getAttribute("data-href") || node.getAttribute("data-url") || node.getAttribute("to");
      if (href) values.links.push(href);
    });
    document.querySelectorAll("form").forEach((form) => {
      const action = form.action || form.getAttribute("action");
      if (action) values.forms.push(action);
    });
    document.querySelectorAll('link[rel="manifest"]').forEach((node) => {
      const href = node.href || node.getAttribute("href");
      if (href) values.manifests.push(href);
    });
    return values;
  }).catch(() => ({ links: [], forms: [], manifests: [] }));
}

function collectCaptureCandidates(capture) {
  if (!capture || !capture.files) {
    return {
      routes_json: [],
      network_json: [],
      forms_json: [],
      manifest_json: [],
      cache_service_worker: [],
      indexeddb_route: [],
      indexeddb_url: [],
      source_maps_json: [],
      scripts_json: [],
      auxiliary_files: ["/robots.txt", "/sitemap.xml", "/sitemap_index.xml", "/manifest.json", "/site.webmanifest"],
      generic_capture: [],
    };
  }
  const files = capture.files || {};
  const routes = files["routes.json"] || {};
  const network = files["network.json"] || {};
  const assets = files["assets.json"] || {};
  const forms = files["forms.json"] || {};
  const storage = files["storage.json"] || {};
  const sourceMaps = files["source_maps.json"] || {};

  const out = {
    routes_json: [],
    network_json: [],
    forms_json: [],
    manifest_json: [],
    cache_service_worker: [],
    indexeddb_route: [],
    indexeddb_url: [],
    source_maps_json: [],
    scripts_json: [],
    auxiliary_files: [],
    generic_capture: [],
  };

  addUnique(out.routes_json, arrayFrom(routes.sameOriginRoutes));
  addUnique(out.routes_json, arrayFrom(routes.anchors).map((item) => item && (item.href || item.url || item.path)).filter(Boolean));
  addUnique(out.routes_json, arrayFrom(routes.historyChanges).map((item) => item && item.url).filter(Boolean));
  addUnique(out.routes_json, arrayFrom(routes.spaTransitions).map((item) => item && item.url).filter(Boolean));

  addUnique(out.network_json, arrayFrom(network.active).map((entry) => entry && entry.url).filter(Boolean));
  addUnique(out.network_json, arrayFrom(network.passive).map((entry) => entry && (entry.url || entry.name)).filter(Boolean));

  addUnique(out.forms_json, arrayFrom(forms.forms).map((form) => form && form.action).filter(Boolean));

  addUnique(out.manifest_json, arrayFrom(assets.manifest));
  addUnique(out.scripts_json, arrayFrom(assets.scripts).map((script) => script && script.src).filter(Boolean));

  addUnique(out.cache_service_worker, arrayFrom(storage.serviceWorkers && storage.serviceWorkers.registrations).flatMap((reg) => [reg && reg.scope, reg && reg.active, reg && reg.installing, reg && reg.waiting]));
  addUnique(out.cache_service_worker, arrayFrom([storage.serviceWorkers && storage.serviceWorkers.controller]).filter(Boolean));

  const databases = arrayFrom(storage.indexedDB && storage.indexedDB.databases);
  databases.forEach((db) => {
    arrayFrom(db.stores).forEach((store) => {
      arrayFrom(store.records).forEach((record) => {
        addUnique(out.indexeddb_route, arrayFrom(record.signals && record.signals.routes));
        addUnique(out.indexeddb_url, arrayFrom(record.signals && record.signals.urls));
      });
    });
  });

  addUnique(out.source_maps_json, arrayFrom(sourceMaps.mapFiles));
  addUnique(out.source_maps_json, arrayFrom(sourceMaps.probableHiddenMaps));

  addUnique(out.auxiliary_files, [
    "/robots.txt",
    "/sitemap.xml",
    "/sitemap_index.xml",
    "/manifest.json",
    "/site.webmanifest",
  ]);
  addUnique(out.auxiliary_files, arrayFrom(assets.manifest));

  collectStrings(capture).forEach((text) => {
    if (/^https?:\/\//i.test(text) || text.startsWith("/")) out.generic_capture.push(text);
  });

  Object.keys(out).forEach((key) => {
    out[key] = unique(out[key]);
  });
  return out;
}

async function fetchAuxiliaryDiscoveryFiles(page, baseUrl, auxiliaryFiles) {
  const targets = unique(auxiliaryFiles).slice(0, FETCH_LIMITS.auxiliaryFiles);
  if (!targets.length) return { auxiliary_fetch: [] };
  return page.evaluate(async ({ targets, baseUrl }) => {
    const urls = [];
    const extract = (text) => {
      const matches = String(text || "").match(/https?:\/\/[^\s"'<>\\]+|\/[a-z0-9][a-z0-9/_.,;:@%?&=+-]{1,220}/gi);
      return matches ? Array.from(new Set(matches)) : [];
    };
    for (const target of targets) {
      try {
        const href = new URL(target, baseUrl).href;
        const res = await fetch(href, { credentials: "include" });
        if (!res.ok) continue;
        const contentType = res.headers.get("content-type") || "";
        const text = await res.text();
        urls.push(...extract(text));
        if (/json/i.test(contentType)) {
          try {
            const data = JSON.parse(text);
            const startUrl = data.start_url || data.scope;
            if (startUrl) urls.push(startUrl);
          } catch {}
        }
      } catch {}
    }
    return { auxiliary_fetch: Array.from(new Set(urls)) };
  }, { targets, baseUrl }).catch(() => ({ auxiliary_fetch: [] }));
}

async function collectRuntimeDiscovery(page) {
  return page.evaluate(async (limits) => {
    const out = {
      cache_runtime: [],
      service_worker_runtime: [],
    };
    try {
      if (window.caches && caches.keys) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          try {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            requests.slice(0, limits.cacheEntries).forEach((request) => out.cache_runtime.push(request.url));
          } catch {}
        }
      }
    } catch {}
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        registrations.forEach((registration) => {
          [registration.scope, registration.active && registration.active.scriptURL, registration.waiting && registration.waiting.scriptURL, registration.installing && registration.installing.scriptURL]
            .filter(Boolean)
            .forEach((value) => out.service_worker_runtime.push(value));
        });
      }
    } catch {}
    out.cache_runtime = Array.from(new Set(out.cache_runtime));
    out.service_worker_runtime = Array.from(new Set(out.service_worker_runtime));
    return out;
  }, FETCH_LIMITS).catch(() => ({ cache_runtime: [], service_worker_runtime: [] }));
}

async function fetchCodeDiscovery(page, baseUrl, captureSignals) {
  const scriptTargets = unique(captureSignals.scripts_json || []).slice(0, FETCH_LIMITS.scriptFiles);
  const mapTargets = unique(captureSignals.source_maps_json || []).slice(0, FETCH_LIMITS.sourceMapFiles);
  return page.evaluate(async ({ baseUrl, scriptTargets, mapTargets }) => {
    const out = {
      js_fetch: [],
      source_map_fetch: [],
    };
    const extract = (text) => {
      const matches = String(text || "").match(/https?:\/\/[^\s"'<>\\]+|\/[a-z0-9][a-z0-9/_.,;:@%?&=+-]{1,220}/gi);
      return matches ? Array.from(new Set(matches)) : [];
    };
    const fetchText = async (target) => {
      const href = new URL(target, baseUrl).href;
      const res = await fetch(href, { credentials: "include" });
      if (!res.ok) return "";
      return await res.text();
    };
    for (const target of scriptTargets) {
      try {
        out.js_fetch.push(...extract(await fetchText(target)));
      } catch {}
    }
    for (const target of mapTargets) {
      try {
        out.source_map_fetch.push(...extract(await fetchText(target)));
      } catch {}
    }
    out.js_fetch = Array.from(new Set(out.js_fetch));
    out.source_map_fetch = Array.from(new Set(out.source_map_fetch));
    return out;
  }, { baseUrl, scriptTargets, mapTargets }).catch(() => ({ js_fetch: [], source_map_fetch: [] }));
}

function collectStrings(value, out = [], depth = 0) {
  if (depth > 6 || out.length > 6000) return out;
  if (typeof value === "string") {
    const matches = value.match(/https?:\/\/[^\s"'<>\\]+|\/[a-z0-9][a-z0-9/_.,;:@%?&=+-]{1,220}/gi);
    if (matches) out.push(...matches);
    return out;
  }
  if (Array.isArray(value)) {
    value.slice(0, 220).forEach((item) => collectStrings(item, out, depth + 1));
    return out;
  }
  if (value && typeof value === "object") {
    Object.values(value).slice(0, 220).forEach((item) => collectStrings(item, out, depth + 1));
  }
  return out;
}

function arrayFrom(value) {
  return Array.isArray(value) ? value : [];
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function addUnique(target, values) {
  arrayFrom(values).forEach((value) => {
    if (value) target.push(value);
  });
}

function isLikelyNavigableUrl(value) {
  try {
    const url = new URL(value);
    if (!/^https?:$/i.test(url.protocol)) return false;
    if (/\.(?:js|mjs|css|map|json|xml|txt|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|eot|mp4|mp3|webm|pdf|zip)$/i.test(url.pathname)) return false;
    if (/\/(?:api|graphql|assets|static|build|dist|images?|img|fonts?)\b/i.test(url.pathname)) return false;
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  discoverLinks,
};
