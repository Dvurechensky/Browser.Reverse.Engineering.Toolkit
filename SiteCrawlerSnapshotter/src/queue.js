"use strict";

class CrawlQueue {
  constructor(seed) {
    this.items = [];
    this.seen = new Set();
    this.push(seed, 0, "seed");
  }

  push(url, depth, source) {
    if (!url || this.seen.has(url)) return false;
    this.seen.add(url);
    this.items.push({ url, depth, source: source || "unknown" });
    return true;
  }

  shift() {
    return this.items.shift();
  }

  get length() {
    return this.items.length;
  }
}

function normalizeUrl(value, base) {
  try {
    const url = new URL(value, base);
    url.hash = "";
    if (url.pathname !== "/" && url.pathname.endsWith("/")) url.pathname = url.pathname.slice(0, -1);
    const noisy = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid", "yclid"];
    noisy.forEach((key) => url.searchParams.delete(key));
    return url.href;
  } catch {
    return null;
  }
}

function allowedUrl(url, config) {
  const target = new URL(config.target);
  const parsed = new URL(url);
  if (config.crawl.sameOrigin && parsed.origin !== target.origin) return false;
  const text = parsed.pathname + parsed.search;
  if ((config.crawl.allowPatterns || []).length) {
    const allowed = config.crawl.allowPatterns.some((pattern) => matchesPattern(text, pattern));
    if (!allowed) return false;
  }
  return !(config.crawl.denyPatterns || []).some((pattern) => matchesPattern(text, pattern));
}

function matchesPattern(text, pattern) {
  if (pattern instanceof RegExp) return pattern.test(text);
  const raw = String(pattern || "");
  if (raw.startsWith("/") && raw.endsWith("/") && raw.length > 2) {
    return new RegExp(raw.slice(1, -1), "i").test(text);
  }
  return text.toLowerCase().includes(raw.toLowerCase());
}

module.exports = {
  CrawlQueue,
  normalizeUrl,
  allowedUrl,
};
