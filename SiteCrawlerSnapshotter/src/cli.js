"use strict";

const path = require("path");

function parseArgs(argv) {
  const args = {
    auth: "auto",
    mode: "intel",
    maxPages: 50,
    maxDepth: 3,
    waitUntil: "domcontentloaded",
    settleMs: 1200,
    headless: false,
    sameOrigin: true,
    reconstruct: false,
    startCapture: "immediately",
    profile: null,
    out: null,
    config: null,
    login: false,
    crawl: true,
    provided: new Set(),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    const next = () => argv[++i];
    if (item === "--url") setArg(args, "url", next());
    else if (item === "--auth") setArg(args, "auth", next());
    else if (item === "--mode") setArg(args, "mode", next());
    else if (item === "--profile") setArg(args, "profile", next());
    else if (item === "--out") setArg(args, "out", next());
    else if (item === "--config") setArg(args, "config", next());
    else if (item === "--max-pages") setArg(args, "maxPages", Number(next()));
    else if (item === "--max-depth") setArg(args, "maxDepth", Number(next()));
    else if (item === "--settle-ms") setArg(args, "settleMs", Number(next()));
    else if (item === "--wait-until") setArg(args, "waitUntil", next());
    else if (item === "--start-capture") setArg(args, "startCapture", next());
    else if (item === "--headless") setArg(args, "headless", true);
    else if (item === "--no-crawl") setArg(args, "crawl", false);
    else if (item === "--cross-origin") setArg(args, "sameOrigin", false);
    else if (item === "--reconstruct") setArg(args, "reconstruct", true);
    else if (item === "--login") {
      setArg(args, "login", true);
      setArg(args, "auth", "manual");
      setArg(args, "crawl", false);
    } else if (item === "--help" || item === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${item}`);
    }
  }

  return args;
}

function mergeConfig(args, fileConfig) {
  const provided = args.provided || new Set();
  const cleanArgs = Object.assign({}, args);
  delete cleanArgs.provided;
  const cliOverrides = {};
  provided.forEach((key) => { cliOverrides[key] = cleanArgs[key]; });
  const merged = Object.assign({}, fileConfig || {}, cliOverrides);
  merged.auth = Object.assign({}, authObject(fileConfig && fileConfig.auth), provided.has("auth") ? { mode: args.auth } : {});
  merged.crawl = Object.assign({}, crawlObject(fileConfig && fileConfig.crawl));
  merged.paths = Object.assign({}, fileConfig && fileConfig.paths);
  if (provided.has("crawl")) merged.crawl.enabled = args.crawl;
  if (provided.has("url")) merged.url = args.url;
  if (provided.has("profile")) merged.profile = args.profile;
  if (provided.has("out")) merged.out = args.out;
  if (provided.has("reconstruct")) merged.reconstruct = true;
  return normalizeConfig(merged);
}

function setArg(args, key, value) {
  args[key] = value;
  args.provided.add(key);
}

function normalizeConfig(config) {
  const target = config.target || config.url;
  if (!target) throw new Error("Missing --url or config.target");
  const parsed = new URL(target);
  const slug = parsed.hostname.replace(/^www\./, "").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").toLowerCase();
  const root = path.resolve(__dirname, "..", "..");
  return {
    target,
    siteSlug: slug || "site",
    auth: Object.assign({
      mode: config.auth?.mode || config.auth || "auto",
      startCapture: config.auth?.startCapture || config.startCapture || "immediately",
      readySignal: config.auth?.readySignal || "user-confirm",
      loginUrlPatterns: config.auth?.loginUrlPatterns || ["/login", "/signin", "/auth", "/account/login"],
      loggedInSelectors: config.auth?.loggedInSelectors || [".avatar", "[data-user-menu]", "a[href*='logout']", "button[aria-label*='profile' i]"],
      loggedOutSelectors: config.auth?.loggedOutSelectors || ["input[type='password']", "form[action*='login' i]", "a[href*='signin' i]"],
    }, authObject(config.auth)),
    crawl: Object.assign({
      enabled: config.crawl?.enabled !== false,
      sameOrigin: config.sameOrigin !== false,
      maxPages: Number(config.maxPages || config.crawl?.maxPages || 50),
      maxDepth: Number(config.maxDepth || config.crawl?.maxDepth || 3),
      waitUntil: config.waitUntil || config.crawl?.waitUntil || "domcontentloaded",
      settleMs: Number(config.settleMs || config.crawl?.settleMs || 1200),
      denyPatterns: config.crawl?.denyPatterns || ["/logout", "/signout", "/delete", "/remove", "/payment", "/checkout"],
      allowPatterns: config.crawl?.allowPatterns || [],
    }, crawlObject(config.crawl)),
    snapshotter: {
      mode: config.mode || config.snapshotter?.mode || "intel",
      options: config.snapshotter?.options || {},
    },
    browser: {
      headless: Boolean(config.headless || config.browser?.headless),
      slowMo: Number(config.browser?.slowMo || 0),
    },
    profile: path.resolve(config.profile || path.join(root, "SiteCrawlerSnapshotter", "profiles", slug)),
    out: path.resolve(config.out || path.join(root, "SiteCrawlerSnapshotter", "captures", slug)),
    paths: {
      snapshotter: path.resolve(config.paths?.snapshotter || path.join(root, "SiteSnapshotter", "injector.js")),
      reconstructor: path.resolve(config.paths?.reconstructor || path.join(root, "SiteReconstructor", "index.js")),
      reports: path.resolve(config.paths?.reports || path.join(root, "SiteReconstructor", "reports", slug)),
    },
    reconstruct: Boolean(config.reconstruct),
    loginOnly: Boolean(config.login),
  };
}

function authObject(value) {
  if (!value) return {};
  if (typeof value === "string") return { mode: value };
  return value;
}

function crawlObject(value) {
  if (!value || typeof value !== "object") return {};
  return value;
}

function printUsage() {
  console.log(`SiteCrawlerSnapshotter

Usage:
  node SiteCrawlerSnapshotter/src/index.js --url https://example.com --auth none
  node SiteCrawlerSnapshotter/src/index.js --url https://app.example.com --auth manual --profile ./profiles/app --reconstruct
  node SiteCrawlerSnapshotter/src/index.js --config ./sitecrawler.config.json

Options:
  --url <url>                 Target URL.
  --auth none|manual|auto|profile
  --profile <dir>             Persistent Chromium profile directory.
  --out <dir>                 Capture output directory.
  --max-pages <n>             Crawl page limit. Default: 50.
  --max-depth <n>             Link depth limit. Default: 3.
  --start-capture <mode>      immediately|before-login|after-login.
  --login                     Open profile and wait for manual login only.
  --reconstruct               Run SiteReconstructor after capture.
  --headless                  Run browser headless.
`);
}

module.exports = {
  parseArgs,
  mergeConfig,
  printUsage,
};
