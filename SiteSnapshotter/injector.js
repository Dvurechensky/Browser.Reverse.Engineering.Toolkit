;(function SiteSnapshotterV3() {
  "use strict";

  var VERSION = "0.4.0";
  var GLOBAL_NAME = "SiteSnapshotter";
  var INTERNAL = "__SiteSnapshotterV3State__";
  var SENSITIVE_RE = /(token|jwt|bearer|authorization|auth|secret|password|passwd|cookie|session|sid|refresh|csrf|xsrf|api[_-]?key|apikey|access_token|refresh_token)/i;

  if (window[GLOBAL_NAME] && window[GLOBAL_NAME].version === VERSION) {
    console.info("[SiteSnapshotter] v4 already installed.");
    return window[GLOBAL_NAME];
  }

  var defaults = {
    mode: "quick",
    download: true,
    minify: false,
    exportChunksOnRun: false,
    includeFullHtml: false,
    includeCssRules: false,
    includeComputedStyles: false,
    includeShadowDom: true,
    installHooks: false,
    htmlLimit: 2500000,
    valuePreviewLimit: 2048,
    responsePreviewLimit: 4096,
    indexedDBRecordLimit: 40,
    indexedDBStoreLimit: 80,
    indexedDBDatabaseLimit: 20,
    maxElements: 6000,
    maxCssRules: 25000,
    fileName: null,
    mineRuntimeState: false,
    mineFeatureFlags: false
  };

  var state = window[INTERNAL] || {
    installedAt: new Date().toISOString(),
    sessionStartedAt: null,
    hooksInstalled: false,
    watching: false,
    network: [],
    scenario: [],
    clickEvents: [],
    submitEvents: [],
    routes: [],
    domMutations: [],
    storageEvents: [],
    authChanges: [],
    modalEvents: [],
    timeline: [],
    originals: {},
    observers: [],
    lastPackage: null,
    overlay: null
  };
  window[INTERNAL] = state;

  function assign(target) {
    for (var i = 1; i < arguments.length; i += 1) {
      var source = arguments[i] || {};
      Object.keys(source).forEach(function (key) { target[key] = source[key]; });
    }
    return target;
  }

  function safe(label, fn, fallback) {
    try {
      return fn();
    } catch (error) {
      return fallback === undefined ? { error: label + ": " + String(error && error.message || error) } : fallback;
    }
  }

  async function asyncSafe(label, fn, fallback) {
    try {
      return await fn();
    } catch (error) {
      return fallback === undefined ? { error: label + ": " + String(error && error.message || error) } : fallback;
    }
  }

  function asArray(value) {
    return safe("asArray", function () { return Array.prototype.slice.call(value || []); }, []);
  }

  function now() {
    return new Date().toISOString();
  }

  function sessionT() {
    var base = state.sessionStartedAt ? Date.parse(state.sessionStartedAt) : Date.parse(state.installedAt);
    return Math.max(0, Math.round((Date.now() - base) / 100) / 10);
  }

  function addTimeline(event, data) {
    var item = assign({ t: sessionT(), event: event, timestamp: now() }, data || {});
    state.timeline.push(item);
    if (state.timeline.length > 5000) state.timeline.splice(0, state.timeline.length - 5000);
    return item;
  }

  function truncate(value, limit) {
    if (value == null) return value;
    var text = typeof value === "string" ? value : safe("stringify", function () { return JSON.stringify(value); }, String(value));
    if (text.length <= limit) return text;
      return text.slice(0, limit) + "...[truncated " + (text.length - limit) + " chars]";
  }

  function maskValue(key, value, limit) {
    if (value == null) return value;
    var text = String(value);
    if (SENSITIVE_RE.test(String(key || "")) || isSensitiveValue(text)) return "{masked}";
    return truncate(text, limit || defaults.valuePreviewLimit);
  }

  function isSensitiveValue(value) {
    var text = String(value || "");
    return isJwt(text) || /Bearer\s+[a-z0-9._~+/-]+=*/i.test(text) || /(?:access|refresh|id)?_?token["'=:\s]+[a-z0-9._~+/-]{16,}/i.test(text) || /[a-z0-9_-]{24,}\.[a-z0-9_-]{24,}/i.test(text);
  }

  function sanitize(value, key) {
    return deepMask(value, key || "", 0);
  }

  function tryParseJson(value) {
    if (value == null) return null;
    if (typeof value === "object") return value;
    var text = String(value).trim();
    if (!/^[\[{]/.test(text)) return null;
    return safe("parseJson", function () { return JSON.parse(text); }, null);
  }

  function deepMask(value, key, depth) {
    if (depth > 6) return "[max-depth]";
    if (value == null) return value;
    if (typeof value !== "object") return maskValue(key, value, defaults.valuePreviewLimit);
    if (Array.isArray(value)) return value.slice(0, 50).map(function (item) { return deepMask(item, key, depth + 1); });
    var out = {};
    Object.keys(value).slice(0, 200).forEach(function (childKey) {
      out[childKey] = SENSITIVE_RE.test(childKey) ? "{masked}" : deepMask(value[childKey], childKey, depth + 1);
    });
    return out;
  }

  function shapeOf(value, seen) {
    seen = seen || [];
    if (value == null) return "null";
    if (Array.isArray(value)) {
      if (!value.length) return ["unknown"];
      return [shapeOf(value[0], seen)];
    }
    if (typeof value === "object") {
      if (seen.indexOf(value) >= 0) return "[Circular]";
      seen.push(value);
      var out = {};
      Object.keys(value).slice(0, 120).forEach(function (key) {
        out[key] = shapeOf(value[key], seen.slice());
      });
      return out;
    }
    return typeof value;
  }

  function extractJsonSignals(value) {
    var json = tryParseJson(value);
    if (!json) return null;
    return {
      shape: shapeOf(json),
      keys: collectJsonKeys(json).slice(0, 200),
      entities: extractEntityNamesFromJson(json).slice(0, 100),
      pagination: detectPagination(json),
      idFields: collectJsonKeys(json).filter(function (key) { return /(^id$|_id$|Id$|uuid|guid)/.test(key); }).slice(0, 50)
    };
  }

  function collectJsonKeys(value, prefix, out, depth) {
    out = out || [];
    prefix = prefix || "";
    depth = depth || 0;
    if (!value || typeof value !== "object" || depth > 5) return out;
    if (Array.isArray(value)) {
      value.slice(0, 5).forEach(function (item) { collectJsonKeys(item, prefix, out, depth + 1); });
      return out;
    }
    Object.keys(value).slice(0, 100).forEach(function (key) {
      var path = prefix ? prefix + "." + key : key;
      out.push(path);
      collectJsonKeys(value[key], path, out, depth + 1);
    });
    return Array.from(new Set(out));
  }

  function detectPagination(value) {
    var keys = collectJsonKeys(value).join(" ");
    return /(page|per_page|pageSize|limit|offset|cursor|next|prev|total|has_more|hasMore)/.test(keys);
  }

  function isJwt(value) {
    return /\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/.test(String(value || ""));
  }

  function absoluteUrl(value) {
    if (!value) return value;
    return safe("absoluteUrl", function () { return new URL(value, location.href).href; }, value);
  }

  function pathFromUrl(value) {
    return safe("pathFromUrl", function () {
      var url = new URL(value, location.href);
      return url.pathname + url.search + url.hash;
    }, value);
  }

  function queryAll(selector, root) {
    return safe("queryAll " + selector, function () { return asArray((root || document).querySelectorAll(selector)); }, []);
  }

  function textOf(element, limit) {
    return truncate(((element && (element.innerText || element.textContent)) || "").trim().replace(/\s+/g, " "), limit || 300);
  }

  function attrs(element) {
    var out = {};
    asArray(element && element.attributes).forEach(function (attr) {
      out[attr.name] = SENSITIVE_RE.test(attr.name) ? maskValue(attr.name, attr.value) : truncate(attr.value, 1000);
    });
    return out;
  }

  function elementSummary(element) {
    if (!element) return null;
    var rect = safe("rect", function () {
      var r = element.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
    }, null);
    return {
      tag: element.tagName ? element.tagName.toLowerCase() : null,
      id: element.id || "",
      className: typeof element.className === "string" ? truncate(element.className, 500) : "",
      name: element.getAttribute && element.getAttribute("name") || "",
      type: element.getAttribute && element.getAttribute("type") || "",
      role: element.getAttribute && element.getAttribute("role") || "",
      text: textOf(element, 300),
      hidden: isHidden(element),
      rect: rect,
      attributes: attrs(element)
    };
  }

  function isHidden(element) {
    return safe("isHidden", function () {
      if (!element) return false;
      var style = getComputedStyle(element);
      return !!(element.hidden || element.getAttribute("aria-hidden") === "true" || style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0);
    }, false);
  }

  function domainSlug() {
    return (location.hostname || "unknown").replace(/^www\./, "").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").toLowerCase() || "unknown";
  }

  function stamp() {
    var d = new Date();
    function pad(n) { return String(n).padStart(2, "0"); }
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "_" + pad(d.getHours()) + "-" + pad(d.getMinutes()) + "-" + pad(d.getSeconds());
  }

  function captureFolder(captureStamp) {
    return "captures/" + domainSlug() + "/" + captureStamp + "/";
  }

  function normalizeConfig(options) {
    var config = assign({}, defaults);
    if (typeof options === "string") {
      config.mode = options;
    } else {
      assign(config, options || {});
    }
    if (config.mode === "deep") {
      config.includeFullHtml = true;
      config.includeCssRules = true;
      config.installHooks = true;
    }
    if (config.mode === "session" || config.mode === "intel") {
      config.includeFullHtml = true;
      config.includeCssRules = true;
      config.installHooks = true;
    }
    if (config.mode === "intel") {
      config.includeFullHtml = true;
      config.includeCssRules = true;
      config.includeComputedStyles = false;
      config.installHooks = true;
      config.mineRuntimeState = true;
      config.mineFeatureFlags = true;
      config.responsePreviewLimit = Math.max(config.responsePreviewLimit, 12000);
      config.valuePreviewLimit = Math.max(config.valuePreviewLimit, 4096);
    }
    if (config.mode === "quick") {
      config.includeFullHtml = false;
      config.includeCssRules = false;
      config.installHooks = !!config.installHooks;
    }
    return config;
  }

  function createRegistry() {
    var modules = [];
    function validate(module) {
      if (!module || !module.id || !module.file || !module.modes || typeof module.order !== "number" || typeof module.collect !== "function") {
        throw new Error("Invalid SiteSnapshotter module registration");
      }
    }
    return {
      register: function (module) {
        validate(module);
        modules = modules.filter(function (item) { return item.id !== module.id && item.file !== module.file; });
        modules.push(module);
        modules.sort(function (a, b) { return a.order - b.order || a.id.localeCompare(b.id); });
        return module;
      },
      get: function (idOrFile) {
        return modules.filter(function (module) { return module.id === idOrFile || module.file === idOrFile; })[0] || null;
      },
      list: function () {
        return modules.slice().sort(function (a, b) { return a.order - b.order || a.id.localeCompare(b.id); });
      },
      files: function () {
        return this.list().map(function (module) { return module.file; });
      },
      forMode: function (mode) {
        return this.list().filter(function (module) { return module.modes.indexOf(mode) >= 0 || module.modes.indexOf("*") >= 0; });
      }
    };
  }

  var registry = createRegistry();

  function collectPage(capturedAt) {
    return {
      url: location.href,
      host: location.host,
      hostname: location.hostname,
      title: document.title,
      timestamp: capturedAt,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        scrollX: window.scrollX,
        scrollY: window.scrollY
      },
      language: document.documentElement.lang || navigator.language || "",
      referrer: document.referrer || "",
      userAgent: navigator.userAgent,
      charset: document.characterSet || "",
      visibilityState: document.visibilityState || ""
    };
  }

  function collectDom(config) {
    var all = queryAll("*");
    var limited = all.slice(0, config.maxElements);
    var semanticSelectors = [
      "main", "header", "nav", "aside", "footer", "section", "article",
      "[role='main']", "[role='navigation']", "[role='complementary']", "[role='banner']", "[role='contentinfo']"
    ].join(",");
    var hidden = limited.filter(isHidden).slice(0, 500).map(elementSummary);
    var custom = limited.filter(function (el) { return el.tagName && el.tagName.indexOf("-") > -1; }).slice(0, 500).map(elementSummary);
    var shadowDom = [];

    if (config.includeShadowDom) {
      limited.forEach(function (el) {
        if (el.shadowRoot) {
          shadowDom.push({
            host: elementSummary(el),
            html: truncate(el.shadowRoot.innerHTML || "", config.htmlLimit)
          });
        }
      });
    }

    return {
      doctype: document.doctype ? "<!DOCTYPE " + document.doctype.name + ">" : null,
      html: config.includeFullHtml ? truncate(document.documentElement.outerHTML || "", config.htmlLimit) : null,
      head: truncate(document.head ? document.head.innerHTML : "", config.includeFullHtml ? config.htmlLimit : 50000),
      bodyPreview: truncate(document.body ? document.body.innerHTML : "", config.includeFullHtml ? config.htmlLimit : 100000),
      counts: {
        elements: all.length,
        hidden: hidden.length,
        customElements: custom.length,
        buttons: queryAll("button, input[type='button'], input[type='submit'], input[type='reset'], [role='button']").length,
        links: queryAll("a[href]").length,
        forms: queryAll("form").length,
        tables: queryAll("table").length,
        iframes: queryAll("iframe").length,
        dialogs: queryAll("dialog, [role='dialog'], [aria-modal='true']").length
      },
      semanticBlocks: queryAll(semanticSelectors).map(elementSummary),
      buttons: queryAll("button, input[type='button'], input[type='submit'], input[type='reset'], [role='button']").map(elementSummary),
      links: queryAll("a[href]").map(function (a) { return assign(elementSummary(a), { href: absoluteUrl(a.getAttribute("href")) }); }),
      forms: queryAll("form").map(formSummary),
      tables: queryAll("table").map(function (table) {
        return assign(elementSummary(table), {
          rows: queryAll("tr", table).length,
          headers: queryAll("th", table).map(function (th) { return textOf(th, 200); })
        });
      }),
      dialogs: queryAll("dialog, [role='dialog'], [aria-modal='true']").map(elementSummary),
      hiddenSections: hidden,
      iframes: queryAll("iframe").map(function (iframe) {
        return assign(elementSummary(iframe), {
          src: absoluteUrl(iframe.getAttribute("src")),
          sandbox: iframe.getAttribute("sandbox") || ""
        });
      }),
      customElements: custom,
      layout: {
        navbar: queryAll("nav, [role='navigation'], header nav").map(elementSummary),
        sidebar: queryAll("aside, [class*='sidebar'], [id*='sidebar'], [class*='drawer'], [class*='sidenav']").map(elementSummary),
        footer: queryAll("footer, [role='contentinfo']").map(elementSummary),
        cards: queryAll("[class*='card'], [class*='tile'], [class*='panel'], article").slice(0, 300).map(elementSummary),
        pagination: queryAll("[class*='pagination'], [aria-label*='pagination' i], nav a[rel='next'], nav a[rel='prev']").map(elementSummary),
        dashboardBlocks: queryAll("[class*='dashboard'], [class*='widget'], [class*='metric'], [class*='stat'], [class*='chart']").slice(0, 300).map(elementSummary)
      },
      shadowDom: shadowDom
    };
  }

  function formSummary(form) {
    return assign(elementSummary(form), {
      action: absoluteUrl(form.getAttribute("action") || location.href),
      method: (form.getAttribute("method") || "get").toUpperCase(),
      inputs: queryAll("input, select, textarea", form).map(function (input) {
        return assign(elementSummary(input), {
          valuePreview: input.type === "password" ? "{masked}" : maskValue(input.name || input.id || input.type, input.value),
          required: !!input.required,
          placeholder: input.getAttribute("placeholder") || ""
        });
      }),
      buttons: queryAll("button, input[type='button'], input[type='submit'], input[type='reset']", form).map(elementSummary),
      classification: classifyForm(form)
    });
  }

  function collectForms() {
    var forms = queryAll("form").map(formSummary);
    return {
      count: forms.length,
      forms: forms,
      loginForms: forms.filter(function (f) { return f.classification === "login"; }),
      registerForms: forms.filter(function (f) { return f.classification === "register"; }),
      searchForms: forms.filter(function (f) { return f.classification === "search"; }),
      paymentForms: forms.filter(function (f) { return f.classification === "payment"; }),
      adminFilterForms: forms.filter(function (f) { return f.classification === "admin_filter"; })
    };
  }

  function classifyForm(form) {
    var text = ((form.outerHTML || "") + " " + textOf(form, 2000)).toLowerCase();
    if (/password|login|sign in|signin|log in|username/.test(text)) return "login";
    if (/register|signup|sign up|create account/.test(text)) return "register";
    if (/search|query|поиск/.test(text)) return "search";
    if (/card|payment|checkout|billing|cvv|stripe|paypal/.test(text)) return "payment";
    if (/filter|admin|status|date from|date to|role|permission/.test(text)) return "admin_filter";
    return "generic";
  }

  function collectCss(config) {
    var rules = [];
    var mediaQueries = [];
    var fontFaces = [];
    var sheets = asArray(document.styleSheets).map(function (sheet) {
      var item = {
        href: sheet.href || null,
        disabled: sheet.disabled,
        ownerNode: sheet.ownerNode ? elementSummary(sheet.ownerNode) : null,
        rulesReadable: false,
        ruleCount: 0,
        error: null
      };
      if (config.includeCssRules) {
        safe("cssRules", function () {
          var cssRules = asArray(sheet.cssRules);
          item.rulesReadable = true;
          item.ruleCount = cssRules.length;
          cssRules.slice(0, Math.max(0, config.maxCssRules - rules.length)).forEach(function (rule) {
            var text = truncate(rule.cssText || "", 3000);
            rules.push(text);
            if (window.CSSRule && rule.type === CSSRule.MEDIA_RULE) mediaQueries.push(text);
            if (window.CSSRule && rule.type === CSSRule.FONT_FACE_RULE) fontFaces.push(text);
          });
        }, null);
      } else {
        safe("cssRuleCount", function () {
          item.ruleCount = sheet.cssRules ? sheet.cssRules.length : 0;
          item.rulesReadable = true;
        }, null);
      }
      if (!item.rulesReadable && sheet.href) item.error = "cssRules blocked or skipped";
      return item;
    });
    var html = document.documentElement.outerHTML.slice(0, 600000);
    return {
      stylesheetUrls: queryAll('link[rel~="stylesheet"]').map(function (link) { return absoluteUrl(link.getAttribute("href")); }),
      inlineStyles: queryAll("style").map(function (style) { return truncate(style.textContent || "", config.includeCssRules ? config.htmlLimit : 10000); }),
      styleSheets: sheets,
      rules: rules,
      fontFace: fontFaces,
      mediaQueries: mediaQueries,
      utilityFrameworks: detectUtilityFrameworks(html),
      usedClasses: countClasses(config.maxElements),
      computedStyles: config.includeComputedStyles ? collectComputedStyles() : null
    };
  }

  function detectUtilityFrameworks(html) {
    return {
      Tailwind: scoreBool(/(?:^|\s)(flex|grid|hidden|container|mx-auto|text-\w+|bg-\w+|p-\d|m-\d|rounded|shadow)(?:\s|")/.test(html) || /tailwind/i.test(html)),
      Bootstrap: scoreBool(/bootstrap(?:\.min)?\.(?:css|js)|\bcontainer-fluid\b|\brow\b|\bcol-/i.test(html) || !!window.bootstrap),
      "Material UI": scoreBool(/\bMui[A-Z]|data-mui|material-ui/i.test(html)),
      Chakra: scoreBool(/chakra-ui|data-theme|css-[a-z0-9]{5,}/i.test(html) && /chakra/i.test(html)),
      "Ant Design": scoreBool(/ant-layout|ant-btn|antd|ant-design/i.test(html))
    };
  }

  function scoreBool(value) {
    return value ? 100 : 0;
  }

  function countClasses(max) {
    var out = {};
    queryAll("*").slice(0, max).forEach(function (el) {
      asArray(el.classList).forEach(function (name) { out[name] = (out[name] || 0) + 1; });
    });
    return out;
  }

  function collectComputedStyles() {
    return queryAll("*").slice(0, 500).map(function (el) {
      return safe("computedStyle", function () {
        var s = getComputedStyle(el);
        return {
          element: elementSummary(el),
          display: s.display,
          position: s.position,
          color: s.color,
          backgroundColor: s.backgroundColor,
          fontFamily: s.fontFamily,
          fontSize: s.fontSize
        };
      }, null);
    }).filter(Boolean);
  }

  function collectJsEnv() {
    var keys = safe("windowKeys", function () { return Object.keys(window).sort(); }, []);
    return {
      windowKeyCount: keys.length,
      windowKeys: keys,
      knownGlobals: knownGlobals(),
      stateContainers: detectStateContainers(keys),
      buildHints: detectBuildHints(keys),
      runtimeConfigs: keys.filter(function (key) { return /config|settings|env|runtime|public/i.test(key); }).slice(0, 100).map(function (key) {
        return { key: key, type: typeof window[key], preview: maskValue(key, safe("globalValue", function () { return window[key]; }, null), 1000) };
      })
    };
  }

  function knownGlobals() {
    var names = ["React", "ReactDOM", "Vue", "angular", "jQuery", "$", "Svelte", "Shopify", "__NEXT_DATA__", "__NUXT__", "__REACT_DEVTOOLS_GLOBAL_HOOK__", "__VUE_DEVTOOLS_GLOBAL_HOOK__"];
    var out = {};
    names.forEach(function (name) { out[name] = typeof window[name] !== "undefined"; });
    return out;
  }

  function detectStateContainers(keys) {
    return {
      redux: keys.filter(function (key) { return /redux|store/i.test(key); }).slice(0, 50),
      apollo: keys.filter(function (key) { return /apollo/i.test(key); }).slice(0, 50),
      relay: keys.filter(function (key) { return /relay/i.test(key); }).slice(0, 50),
      mobx: keys.filter(function (key) { return /mobx/i.test(key); }).slice(0, 50),
      zustand: keys.filter(function (key) { return /zustand/i.test(key); }).slice(0, 50),
      pinia: keys.filter(function (key) { return /pinia/i.test(key); }).slice(0, 50)
    };
  }

  function detectBuildHints(keys) {
    var html = document.documentElement.outerHTML.slice(0, 600000);
    return {
      webpack: keys.filter(function (key) { return /webpack|webpackChunk|webpackJsonp/i.test(key); }).slice(0, 100),
      vite: /\/@vite\/|vite\/client|type="module"|__vite/i.test(html),
      rollup: /rollup/i.test(html),
      parcel: /parcelRequire|__parcel/i.test(html) || keys.some(function (key) { return /parcel/i.test(key); }),
      chunks: keys.filter(function (key) { return /chunk|webpack|vite|parcel/i.test(key); }).slice(0, 100)
    };
  }

  async function collectStorage(config) {
    return {
      cookies: parseCookies(config),
      localStorage: readStorage(safe("localStorageRef", function () { return window.localStorage; }, null), config),
      sessionStorage: readStorage(safe("sessionStorageRef", function () { return window.sessionStorage; }, null), config),
      indexedDB: await collectIndexedDB(config),
      cacheStorage: await collectCacheStorage(),
      serviceWorkers: await collectServiceWorkers()
    };
  }

  function parseCookies(config) {
    return safe("cookies", function () {
      if (!document.cookie) return [];
      return document.cookie.split(";").map(function (part) {
        var index = part.indexOf("=");
        var name = decodeURIComponent((index >= 0 ? part.slice(0, index) : part).trim());
        var value = index >= 0 ? part.slice(index + 1) : "";
        return {
          name: name,
          value: maskValue(name, value, config.valuePreviewLimit),
          sensitive: SENSITIVE_RE.test(name) || isJwt(value),
          hints: cookieHints(name, value)
        };
      });
    }, []);
  }

  function cookieHints(name, value) {
    return {
      jwt: isJwt(value),
      session: /session|sid|jsessionid|phpsessid|laravel_session|aspnet/i.test(name),
      csrf: /csrf|xsrf/i.test(name)
    };
  }

  function readStorage(storage, config) {
    if (!storage) return { error: "unavailable" };
    return safe("readStorage", function () {
      var out = {};
      for (var i = 0; i < storage.length; i += 1) {
        var key = storage.key(i);
        out[key] = maskValue(key, storage.getItem(key), config.valuePreviewLimit);
      }
      return out;
    }, { error: "unavailable" });
  }

  async function collectIndexedDB(config) {
    return asyncSafe("indexedDB", async function () {
      if (!window.indexedDB) return { supported: false, databases: [], note: "indexedDB is unavailable in this browser context" };
      var metadata = indexedDB.databases ? await indexedDB.databases() : [];
      var databases = [];
      for (var i = 0; i < metadata.slice(0, config.indexedDBDatabaseLimit).length; i += 1) {
        var item = metadata[i] || {};
        if (!item.name) {
          databases.push({ name: null, version: item.version || null, readable: false, error: "database name is not exposed by the browser" });
          continue;
        }
        databases.push(await inspectIndexedDatabase(item.name, item.version, config));
      }
      return {
        supported: true,
        enumerationSupported: !!indexedDB.databases,
        databaseLimit: config.indexedDBDatabaseLimit,
        storeLimit: config.indexedDBStoreLimit,
        recordLimitPerStore: config.indexedDBRecordLimit,
        databases: databases,
        truncated: metadata.length > config.indexedDBDatabaseLimit,
        totalKnownDatabases: metadata.length
      };
    }, { supported: !!window.indexedDB, databases: [], error: "indexedDB unavailable" });
  }

  async function inspectIndexedDatabase(name, version, config) {
    var opened = await openIndexedDatabase(name);
    if (!opened.ok) return { name: name, version: version || null, readable: false, error: opened.error };
    var db = opened.db;
    var storeNames = asArray(db.objectStoreNames);
    var stores = [];
    for (var i = 0; i < storeNames.slice(0, config.indexedDBStoreLimit).length; i += 1) {
      stores.push(await inspectObjectStore(db, storeNames[i], config));
    }
    db.close();
    return {
      name: name,
      version: db.version || version || null,
      readable: true,
      storeCount: storeNames.length,
      stores: stores,
      truncated: storeNames.length > config.indexedDBStoreLimit
    };
  }

  function openIndexedDatabase(name) {
    return new Promise(function (resolve) {
      var done = false;
      var timer = setTimeout(function () {
        if (!done) {
          done = true;
          resolve({ ok: false, error: "open timeout" });
        }
      }, 2500);
      var req = safe("indexedDB.open", function () { return indexedDB.open(name); }, null);
      if (!req) {
        clearTimeout(timer);
        resolve({ ok: false, error: "open failed" });
        return;
      }
      req.onsuccess = function () {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve({ ok: true, db: req.result });
      };
      req.onerror = function () {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve({ ok: false, error: String(req.error && req.error.message || req.error || "open error") });
      };
      req.onblocked = function () {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve({ ok: false, error: "open blocked" });
      };
    });
  }

  async function inspectObjectStore(db, storeName, config) {
    return asyncSafe("indexedDB.store." + storeName, async function () {
      var tx = db.transaction(storeName, "readonly");
      var store = tx.objectStore(storeName);
      var indexNames = asArray(store.indexNames);
      return {
        name: storeName,
        keyPath: store.keyPath || null,
        autoIncrement: !!store.autoIncrement,
        count: await idbRequest(store.count()),
        indexes: indexNames.map(function (indexName) {
          var index = store.index(indexName);
          return { name: index.name, keyPath: index.keyPath, unique: !!index.unique, multiEntry: !!index.multiEntry };
        }),
        records: await sampleObjectStoreRecords(store, config),
        recordSampleLimit: config.indexedDBRecordLimit
      };
    }, { name: storeName, error: "store read failed", records: [] });
  }

  function idbRequest(req) {
    return new Promise(function (resolve, reject) {
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function sampleObjectStoreRecords(store, config) {
    return new Promise(function (resolve) {
      var records = [];
      var req = store.openCursor();
      req.onsuccess = function (event) {
        var cursor = event.target.result;
        if (!cursor || records.length >= config.indexedDBRecordLimit) {
          resolve(records);
          return;
        }
        records.push({
          key: serializeIDBValue(cursor.key, "key", config),
          primaryKey: serializeIDBValue(cursor.primaryKey, "primaryKey", config),
          value: serializeIDBValue(cursor.value, "", config),
          signals: extractIndexedDBSignals(cursor.value)
        });
        cursor.continue();
      };
      req.onerror = function () { resolve(records); };
    });
  }

  function serializeIDBValue(value, key, config) {
    if (value == null) return value;
    if (value instanceof Date) return { type: "Date", value: value.toISOString() };
    if (typeof Blob !== "undefined" && value instanceof Blob) {
      var isFile = typeof File !== "undefined" && value instanceof File;
      return { type: isFile ? "File" : "Blob", size: value.size, mime: value.type || null, name: value.name || null };
    }
    if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) return { type: "ArrayBuffer", byteLength: value.byteLength };
    if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView && ArrayBuffer.isView(value)) return { type: value.constructor && value.constructor.name || "TypedArray", byteLength: value.byteLength };
    if (typeof value !== "object") return maskValue(key, value, config.valuePreviewLimit);
    return deepMask(value, key || "", 0);
  }

  function extractIndexedDBSignals(value) {
    var asText = typeof value === "string" ? value : safe("idbStringify", function () { return JSON.stringify(value); }, "");
    var json = typeof value === "object" ? value : tryParseJson(value);
    return {
      type: value == null ? "null" : Array.isArray(value) ? "array" : typeof value,
      keys: json && typeof json === "object" ? collectJsonKeys(json).slice(0, 80) : [],
      entities: json && typeof json === "object" ? extractEntityNamesFromJson(json).slice(0, 40) : [],
      routes: uniqueStrings((asText.match(/["'](\/[a-z0-9][^"'?#\s]{1,120})["']/gi) || []).map(function (item) { return item.replace(/^["']|["']$/g, ""); })).slice(0, 30),
      urls: uniqueStrings((asText.match(/https?:\/\/[^\s"'<>\\]+/gi) || [])).slice(0, 30),
      hasPagination: json ? detectPagination(json) : false,
      hasSensitiveKeys: collectJsonKeys(json || {}).some(function (k) { return SENSITIVE_RE.test(k); })
    };
  }

  function uniqueStrings(items) {
    return Array.from(new Set((items || []).filter(Boolean)));
  }

  async function collectCacheStorage() {
    return asyncSafe("cacheStorage", async function () {
      if (!window.caches) return { supported: false, names: [] };
      return { supported: true, names: await caches.keys() };
    }, { supported: !!window.caches, names: [] });
  }

  async function collectServiceWorkers() {
    return asyncSafe("serviceWorkers", async function () {
      if (!navigator.serviceWorker) return { supported: false, registrations: [] };
      var registrations = await navigator.serviceWorker.getRegistrations();
      return {
        supported: true,
        controller: navigator.serviceWorker.controller ? navigator.serviceWorker.controller.scriptURL : null,
        registrations: registrations.map(function (reg) {
          return {
            scope: reg.scope,
            active: reg.active && reg.active.scriptURL || null,
            installing: reg.installing && reg.installing.scriptURL || null,
            waiting: reg.waiting && reg.waiting.scriptURL || null
          };
        })
      };
    }, { supported: !!navigator.serviceWorker, registrations: [] });
  }

  function collectNetwork() {
    var passive = collectPerformance().resources.map(function (entry) {
      return assign({}, entry, { category: classifyUrl(entry.name, entry.initiatorType) });
    });
    var active = state.network.map(function (entry) {
      var enriched = assign({}, entry);
      enriched.category = entry.category || classifyNetworkEntry(entry);
      enriched.schema = entry.responseJsonSignals || entry.requestJsonSignals || null;
      return enriched;
    });
    return {
      passive: passive,
      active: active,
      counts: countBy([].concat(passive, active), function (entry) { return entry.category || classifyUrl(entry.url || entry.name, entry.type || entry.initiatorType); })
    };
  }

  function classifyUrl(url, type) {
    var value = String(url || "").toLowerCase();
    if (/graphql/.test(value)) return "graphql";
    if (/login|logout|auth|oauth|openid|token|session|csrf|sso/.test(value)) return "auth";
    if (/upload|attach|multipart|file_upload/.test(value)) return "upload";
    if (/download|export|attachment/.test(value)) return "download";
    if (/chat|message|im\/|messenger|conversation|dialog/.test(value)) return "chat";
    if (/presence|online|typing|heartbeat|longpoll|long_poll/.test(value)) return "presence";
    if (/poll|lp\?|longpoll|stream/.test(value)) return "polling";
    if (/config|settings|bootstrap|manifest|feature|experiment|abtest/.test(value)) return "config";
    if (/\/api\/|\/rest\/|\/v\d+\/|application\/json/.test(value)) return "api";
    if (/google-analytics|googletagmanager|gtag|metrika|analytics|segment|mixpanel|amplitude/.test(value)) return "analytics";
    if (/doubleclick|googlesyndication|adservice|adsystem|facebook\.com\/tr|pixel/.test(value)) return "ads";
    if (/sentry|datadog|newrelic|logrocket|telemetry|beacon|collect/.test(value)) return "telemetry";
    if (/\.(png|jpe?g|gif|webp|svg|mp4|webm|mp3|wav|m4a)(\?|#|$)/.test(value) || /image|video|audio/.test(type || "")) return "media";
    if (/\.(js|css|woff2?|ttf|otf|map)(\?|#|$)/.test(value) || /script|css|font/.test(type || "")) return "static";
    return "other";
  }

  function classifyNetworkEntry(entry) {
    var haystack = [
      entry.url,
      entry.type,
      entry.method,
      entry.requestBodyPreview,
      entry.responsePreview,
      JSON.stringify(entry.requestHeaders || {}),
      JSON.stringify(entry.responseHeaders || {})
    ].join(" ").toLowerCase();
    if (/graphql|operationname|query\s*{/.test(haystack)) return "graphql";
    if (/upload|multipart\/form-data|filename=/.test(haystack)) return "upload";
    if (/download|content-disposition|attachment/.test(haystack)) return "download";
    if (/chat|message|conversation|typing|dialog/.test(haystack)) return "chat";
    if (/presence|online|heartbeat/.test(haystack)) return "presence";
    if (/poll|longpoll|long_poll|stream/.test(haystack)) return "polling";
    if (/config|feature|experiment|abtest|flags/.test(haystack)) return "config";
    return classifyUrl(entry.url, entry.type);
  }

  function countBy(items, fn) {
    var out = {};
    items.forEach(function (item) {
      var key = fn(item);
      out[key] = (out[key] || 0) + 1;
    });
    return out;
  }

  function collectTelemetry(network) {
    var entries = (network.active || []).concat(network.passive || []);
    var events = entries.filter(function (entry) {
      var category = entry.category || classifyUrl(entry.url || entry.name, entry.type || entry.initiatorType);
      return category === "analytics" || category === "telemetry" || entry.type === "sendBeacon" || /stats|metric|event|collect|diagnostic|trace|perf|benchmark/i.test(entry.url || entry.name || "");
    }).map(function (entry) {
      var payload = tryParseJson(entry.requestBodyPreview) || tryParseQueryPayload(entry.requestBodyPreview) || {};
      var eventName = detectTelemetryEventName(payload, entry);
      var modules = detectModulesFromText(JSON.stringify(payload) + " " + (entry.url || entry.name || ""));
      return {
        provider: detectTelemetryProvider(entry.url || entry.name || ""),
        endpoint: pathFromUrl(entry.url || entry.name || ""),
        event_name: eventName,
        modules: modules,
        raw_type: entry.type || entry.initiatorType || "resource",
        category: entry.category || classifyUrl(entry.url || entry.name, entry.type || entry.initiatorType),
        confidence: entry.type === "sendBeacon" ? 0.9 : entry.category === "telemetry" || entry.category === "analytics" ? 0.82 : 0.62,
        timestamp: entry.timestamp || null,
        payload_keys: collectJsonKeys(payload).slice(0, 50)
      };
    });
    return {
      events: events,
      aggregates: {
        top_modules: topValues(events.reduce(function (items, event) { return items.concat(event.modules || []); }, [])),
        top_events: topValues(events.map(function (event) { return event.event_name; }).filter(Boolean)),
        providers: topValues(events.map(function (event) { return event.provider; }).filter(Boolean))
      }
    };
  }

  function tryParseQueryPayload(value) {
    if (!value || typeof value !== "string") return null;
    if (value.indexOf("=") < 0) return null;
    return safe("queryPayload", function () {
      var out = {};
      String(value).split("&").slice(0, 100).forEach(function (part) {
        var pair = part.split("=");
        out[decodeURIComponent(pair[0] || "")] = maskValue(pair[0], decodeURIComponent(pair.slice(1).join("=") || ""), 1000);
      });
      return out;
    }, null);
  }

  function detectTelemetryProvider(url) {
    var value = String(url || "").toLowerCase();
    if (/google-analytics|gtag|googletagmanager/.test(value)) return "Google Analytics";
    if (/metrika|yandex/.test(value)) return "Yandex Metrika";
    if (/sentry/.test(value)) return "Sentry";
    if (/datadog/.test(value)) return "Datadog";
    if (/newrelic/.test(value)) return "New Relic";
    if (/segment/.test(value)) return "Segment";
    if (/mixpanel/.test(value)) return "Mixpanel";
    if (/amplitude/.test(value)) return "Amplitude";
    if (/facebook\.com\/tr|pixel/.test(value)) return "Meta Pixel";
    return "internal";
  }

  function detectTelemetryEventName(payload, entry) {
    var keys = ["event", "event_name", "eventName", "name", "type", "metric", "action", "e", "en"];
    for (var i = 0; i < keys.length; i += 1) {
      if (payload && payload[keys[i]]) return String(payload[keys[i]]).slice(0, 200);
    }
    var text = [entry.url, entry.requestBodyPreview, entry.responsePreview].join(" ");
    var match = text.match(/(event|metric|perf|benchmark|notify|storyView|click|scrollDepth|error|trace|session|experiment)[\w.-]*/i);
    return match ? match[0] : pathFromUrl(entry.url || entry.name || "");
  }

  function topValues(values) {
    var counts = {};
    values.forEach(function (value) {
      if (!value) return;
      counts[value] = (counts[value] || 0) + 1;
    });
    return Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 25).map(function (name) {
      return { name: name, count: counts[name] };
    });
  }

  function collectSchemas(network) {
    var schemas = {};
    (network.active || []).forEach(function (entry) {
      var key = pathFromUrl(entry.url || "");
      if (!key) return;
      schemas[key] = schemas[key] || {};
      if (entry.requestJsonSignals) {
        schemas[key].request_shape = entry.requestJsonSignals.shape;
        schemas[key].request_keys = entry.requestJsonSignals.keys;
      }
      if (entry.responseJsonSignals) {
        schemas[key].response_shape = entry.responseJsonSignals.shape;
        schemas[key].response_keys = entry.responseJsonSignals.keys;
        schemas[key].entities = entry.responseJsonSignals.entities;
        schemas[key].pagination = entry.responseJsonSignals.pagination;
        schemas[key].id_fields = entry.responseJsonSignals.idFields;
      }
      schemas[key].category = entry.category || classifyNetworkEntry(entry);
      schemas[key].methods = Array.from(new Set((schemas[key].methods || []).concat(entry.method || "GET")));
      schemas[key].samples = (schemas[key].samples || 0) + 1;
    });
    return schemas;
  }

  function collectRuntimeState(config) {
    var keys = safe("windowKeys", function () { return Object.keys(window); }, []);
    var known = {};
    [
      "__INITIAL_STATE__", "__NEXT_DATA__", "__NUXT__", "__APOLLO_STATE__",
      "__REACT_QUERY_STATE__", "__REDUX_STATE__", "__PRELOADED_STATE__"
    ].forEach(function (key) {
      if (typeof window[key] !== "undefined") known[key] = deepMask(window[key], key, 0);
    });
    var containers = keys.filter(function (key) {
      return /redux|apollo|queryClient|reactQuery|pinia|zustand|mobx|store|state/i.test(key);
    }).slice(0, config.mode === "intel" ? 200 : 60).map(function (key) {
      return {
        key: key,
        type: typeof window[key],
        preview: config.mineRuntimeState ? deepMask(safe("runtimeState", function () { return window[key]; }, null), key, 0) : maskValue(key, safe("runtimePreview", function () { return window[key]; }, null), 1000)
      };
    });
    return {
      known: known,
      containers: containers,
      stateStoresFound: containers.map(function (item) { return item.key; }),
      nextDataPresent: !!window.__NEXT_DATA__,
      nuxtStatePresent: !!window.__NUXT__
    };
  }

  function collectFeatureFlags(config, network) {
    var flags = {};
    var sources = [];
    function scanObject(source, object) {
      if (!object || typeof object !== "object") return;
      collectJsonKeys(object).forEach(function (key) {
        if (/(flag|feature|experiment|variant|abtest|beta|enabled|disabled|toggle|gate|rollout|admin)/i.test(key)) {
          var value = key.split(".").reduce(function (cursor, part) { return cursor && cursor[part]; }, object);
          flags[key] = typeof value === "boolean" ? value : maskValue(key, value, 300);
          sources.push({ source: source, key: key });
        }
      });
    }
    ["localStorage", "sessionStorage"].forEach(function (area) {
      var storage = safe(area, function () { return window[area]; }, null);
      if (!storage) return;
      for (var i = 0; i < storage.length; i += 1) {
        var key = storage.key(i);
        var value = safe("storageFlag", function () { return storage.getItem(key); }, "");
        if (/(flag|feature|experiment|variant|abtest|beta|toggle|gate|rollout|admin)/i.test(key + " " + value)) {
          flags[key] = maskValue(key, value, 500);
          sources.push({ source: area, key: key });
        }
        scanObject(area + ":" + key, tryParseJson(value));
      }
    });
    safe("globalsFlags", function () {
      Object.keys(window).filter(function (key) { return /(flag|feature|experiment|config|settings|runtime|toggle)/i.test(key); }).slice(0, config.mode === "intel" ? 150 : 40).forEach(function (key) {
        flags[key] = config.mineFeatureFlags ? deepMask(window[key], key, 0) : maskValue(key, window[key], 700);
        sources.push({ source: "window", key: key });
        scanObject("window:" + key, window[key]);
      });
    }, null);
    (network.active || []).forEach(function (entry) {
      if (entry.category === "config" || /feature|experiment|config|flags/i.test(entry.url || "")) {
        scanObject("network:" + pathFromUrl(entry.url), tryParseJson(entry.responsePreview));
      }
    });
    return { flags: flags, count: Object.keys(flags).length, sources: sources.slice(0, 500) };
  }

  function collectModuleGraph(files) {
    var buckets = {};
    function add(source, names) {
      names.map(normalizeModuleName).filter(isLikelyModuleName).forEach(function (name) {
        var key = name.toLowerCase();
        buckets[key] = buckets[key] || { name: name, sources: {}, evidence_count: 0 };
        buckets[key].sources[source] = true;
        buckets[key].evidence_count += 1;
      });
    }
    add("telemetry", detectModulesFromText(JSON.stringify(files["telemetry.json"] || {})));
    add("routes", detectModulesFromText(JSON.stringify(files["routes.json"] || {})));
    add("network", detectModulesFromText(JSON.stringify(files["network.json"] || {})));
    add("globals", detectModulesFromText(JSON.stringify(files["jsenv.json"] && files["jsenv.json"].buildHints || {})));
    add("assets", (files["performance.json"].chunkLoadOrder || []).map(function (r) { return moduleNameFromUrl(r.name); }).filter(Boolean));
    var modules = Object.keys(buckets).map(function (key) {
      var item = buckets[key];
      var sourceCount = Object.keys(item.sources).length;
      return {
        name: item.name,
        score: Math.min(0.99, Math.round((0.25 + item.evidence_count * 0.05 + sourceCount * 0.16) * 100) / 100),
        sources: Object.keys(item.sources),
        evidence_count: item.evidence_count
      };
    }).sort(function (a, b) {
      return b.score - a.score || b.evidence_count - a.evidence_count;
    });
    return {
      modules: modules.slice(0, 100),
      edges: inferModuleEdges(modules.map(function (m) { return m.name; }), files)
    };
  }

  function isLikelyModuleName(name) {
    if (!name) return false;
    if (name.length < 3 || name.length > 48) return false;
    if (/^[a-f0-9]{10,}$/i.test(name)) return false;
    if (/^\d+$/.test(name)) return false;
    if (/^(Function|Object|Array|Promise|String|Number|Boolean|Window|Document|HTML|JSON|Error|Event|Request|Response|Undefined|Null|True|False|Static|Chunk|Index|Main|Common|Vendor)$/i.test(name)) return false;
    return true;
  }

  function detectModulesFromText(text) {
    var out = [];
    String(text || "").replace(/([A-Z][A-Za-z0-9]+(?:[._-]?[A-Z][A-Za-z0-9]+)+)/g, function (_, name) {
      if (name.length > 2 && name.length < 80) out.push(name);
      return _;
    });
    [
      "Messenger", "Messages", "PushNotifier", "DesktopNotifications", "Stories", "Payments",
      "Feed", "Friends", "Groups", "Notifications", "MediaUpload", "Search", "Profile", "Auth"
    ].forEach(function (name) {
      if (new RegExp(name, "i").test(text || "")) out.push(name);
    });
    return out.slice(0, 500);
  }

  function moduleNameFromUrl(url) {
    var path = pathFromUrl(url || "");
    var file = path.split("/").pop() || "";
    file = file.replace(/\.[a-f0-9]{6,}\./i, ".").replace(/\.(min\.)?js(\?.*)?$/i, "");
    if (!file || /^\d+$/.test(file)) return null;
    return file;
  }

  function normalizeModuleName(name) {
    return String(name || "").replace(/[_-]+/g, " ").replace(/\s+(\w)/g, function (_, c) { return c.toUpperCase(); }).replace(/\s/g, "");
  }

  function inferModuleEdges(modules, files) {
    var edges = [];
    var routes = JSON.stringify(files["routes.json"] || {});
    modules.slice(0, 30).forEach(function (name) {
      if (new RegExp(name, "i").test(routes)) edges.push({ from: "Routes", to: name, reason: "route text match" });
    });
    (files["telemetry.json"].events || []).forEach(function (event) {
      (event.modules || []).forEach(function (name) {
        edges.push({ from: name, to: "Telemetry", reason: event.event_name });
      });
    });
    return edges.slice(0, 200);
  }

  function collectScenario() {
    var steps = state.scenario.slice();
    state.routes.forEach(function (route) {
      steps.push({ t: route.t || 0, action: "route_change", value: pathFromUrl(route.url), timestamp: route.timestamp });
    });
    state.network.forEach(function (entry) {
      steps.push({ t: entry.t || 0, action: "api", value: pathFromUrl(entry.url), category: entry.category, after: entry.after || null, delay_ms: entry.delayMs || null, timestamp: entry.timestamp });
    });
    state.modalEvents.forEach(function (event) {
      steps.push({ t: event.t || 0, action: event.event, target: event.element && event.element.text, timestamp: event.timestamp });
    });
    return steps.sort(function (a, b) { return a.t - b.t; }).map(function (step, index) {
      return assign({ step: index + 1 }, step);
    }).slice(0, 2000);
  }

  function nearestUserAction(t) {
    var actions = state.scenario.filter(function (step) {
      return /click|submit|input|change/.test(step.action) && typeof step.t === "number" && t - step.t >= 0 && t - step.t <= 3;
    }).sort(function (a, b) { return b.t - a.t; });
    if (!actions.length) return null;
    var action = actions[0];
    return {
      after: action.action + ":" + (action.target || action.value || "element"),
      delayMs: Math.round((t - action.t) * 1000)
    };
  }

  function collectSourceMaps(files) {
    var scripts = (files["assets.json"].scripts || []).map(function (script) { return script.src; }).filter(Boolean);
    var resources = (files["performance.json"].resources || []).map(function (r) { return r.name; });
    var urls = Array.from(new Set(scripts.concat(resources)));
    var mapCandidates = urls.filter(function (url) { return /\.map(\?|#|$)/i.test(url); });
    var sourceMappingHints = queryAll("script").map(function (script) {
      var text = script.src ? "" : script.textContent || "";
      var match = text.match(/sourceMappingURL=([^\s*]+)/);
      return match ? match[1] : null;
    }).filter(Boolean);
    return {
      present: mapCandidates.length > 0 || sourceMappingHints.length > 0,
      mapFiles: mapCandidates,
      sourceMappingURLHints: sourceMappingHints,
      probableHiddenMaps: scripts.map(function (src) { return src + ".map"; }).slice(0, 200)
    };
  }

  function buildIntelligence(files) {
    var framework = files["framework.json"];
    var telemetry = files["telemetry.json"];
    var modules = files["module_graph.json"].modules || [];
    var networkCounts = files["network.json"].counts || {};
    var stateStores = files["runtime_state.json"].stateStoresFound || [];
    return {
      site_type: guessSiteType(files),
      frontend_stack: Object.keys(framework.frontend || {}).slice(0, 4).join(" + ") || "Unknown",
      backend_guess: Object.keys(framework.backend_guess || {})[0] || "Unknown",
      live_features: inferLiveFeatures(files, modules),
      telemetry_level: telemetry.events.length > 40 ? "Heavy" : telemetry.events.length > 10 ? "Medium" : telemetry.events.length ? "Light" : "None",
      telemetry_providers: (telemetry.aggregates.providers || []).map(function (p) { return p.name; }),
      state_management: stateStores.length ? "Detected: " + stateStores.slice(0, 5).join(", ") : inferStateManagement(framework),
      api_complexity: (networkCounts.api || 0) + (networkCounts.graphql || 0) + (networkCounts.auth || 0) > 30 ? "High" : "Medium",
      main_modules: modules.slice(0, 20).map(function (module) { return typeof module === "string" ? module : module.name; }),
      feature_flags_count: files["feature_flags.json"].count,
      scenario_steps: files["scenario.json"].length,
      risk_score: computeRiskScore(files)
    };
  }

  function collectEndpoints(files) {
    var endpoints = {};
    var scenario = files["scenario.json"] || [];
    (files["network.json"].active || []).forEach(function (entry) {
      var endpoint = normalizeEndpoint(entry.url || entry.responseURL || "");
      if (!endpoint) return;
      var method = entry.method || "GET";
      var key = method + " " + endpoint;
      var item = endpoints[key] || {
        url: endpoint,
        method: method,
        category: entry.category || classifyNetworkEntry(entry),
        count: 0,
        request_schema: null,
        response_schema: null,
        entities: [],
        triggered_by: [],
        confidence: 0
      };
      item.count += 1;
      item.request_schema = item.request_schema || entry.requestJsonSignals && entry.requestJsonSignals.shape || null;
      item.response_schema = item.response_schema || entry.responseJsonSignals && entry.responseJsonSignals.shape || null;
      item.entities = Array.from(new Set(item.entities.concat(entry.requestJsonSignals && entry.requestJsonSignals.entities || [], entry.responseJsonSignals && entry.responseJsonSignals.entities || [])));
      if (entry.after) item.triggered_by = Array.from(new Set(item.triggered_by.concat(entry.after)));
      item.confidence = Math.min(0.98, 0.45 + Math.min(item.count, 10) * 0.04 + (item.response_schema ? 0.2 : 0) + (item.triggered_by.length ? 0.1 : 0));
      endpoints[key] = item;
    });
    scenario.forEach(function (step) {
      if (step.action !== "api") return;
      var endpoint = normalizeEndpoint(step.value);
      Object.keys(endpoints).forEach(function (key) {
        if (endpoints[key].url === endpoint && step.after) endpoints[key].triggered_by = Array.from(new Set(endpoints[key].triggered_by.concat(step.after)));
      });
    });
    return { endpoints: Object.keys(endpoints).sort().map(function (key) { return endpoints[key]; }) };
  }

  function normalizeEndpoint(value) {
    return safe("normalizeEndpoint", function () {
      if (!value) return "";
      var url = new URL(value, location.href);
      var path = url.pathname.replace(/\/\d{2,}(?=\/|$)/g, "/:id").replace(/[a-f0-9]{24,}/ig, ":hash");
      return path || "/";
    }, String(value || "").split("?")[0]);
  }

  function collectStateMap(files) {
    var runtime = files["runtime_state.json"] || {};
    var stores = (runtime.containers || []).map(function (item) {
      return {
        type: inferStoreType(item.key),
        source: "window." + item.key,
        keys: item.preview && typeof item.preview === "object" ? Object.keys(item.preview).slice(0, 80) : [],
        masked: true,
        confidence: inferStoreType(item.key) === "custom" ? 0.45 : 0.8
      };
    });
    Object.keys(runtime.known || {}).forEach(function (key) {
      stores.push({
        type: inferStoreType(key),
        source: "window." + key,
        keys: runtime.known[key] && typeof runtime.known[key] === "object" ? Object.keys(runtime.known[key]).slice(0, 80) : [],
        masked: true,
        confidence: 0.85
      });
    });
    return { stores: stores };
  }

  function inferStoreType(key) {
    if (/redux|preloaded/i.test(key)) return "redux";
    if (/apollo/i.test(key)) return "apollo";
    if (/query/i.test(key)) return "react_query";
    if (/pinia/i.test(key)) return "pinia";
    if (/zustand/i.test(key)) return "zustand";
    if (/mobx/i.test(key)) return "mobx";
    if (/next/i.test(key)) return "next_data";
    if (/nuxt/i.test(key)) return "nuxt_state";
    return "custom";
  }

  function collectTechTree(files) {
    var frontend = files["framework.json"].frontend || {};
    var security = files["security.json"] || {};
    var telemetry = files["telemetry.json"] || {};
    return {
      frontend: {
        ui: Object.keys(frontend).filter(function (name) { return /Bootstrap|Tailwind|Material|Chakra|Ant/.test(name); }),
        framework: Object.keys(frontend).filter(function (name) { return /React|Vue|Angular|Next|Nuxt|Svelte|Custom SPA/.test(name); }),
        bundlers: Object.keys(frontend).filter(function (name) { return /Webpack|Vite|Rollup|Parcel/.test(name); }),
        state: (files["state_map.json"].stores || []).map(function (store) { return store.type; }),
        telemetry: (telemetry.aggregates && telemetry.aggregates.providers || []).map(function (p) { return p.name; })
      },
      backend: {
        guess: Object.keys(files["framework.json"].backend_guess || {})[0] || "Unknown",
        evidence: files["framework.json"].evidence || []
      },
      security: {
        captcha: security.captchaPresence ? ["captcha marker"] : [],
        oauth: security.oauthProviders || [],
        monitoring: security.sentry ? ["Sentry"] : []
      }
    };
  }

  function collectEvidence(files) {
    var items = [];
    Object.keys(files["framework.json"].frontend || {}).forEach(function (name) {
      items.push({ type: "framework", claim: name + " detected", evidence: "framework scoring engine matched browser-visible signals", source: "framework.json", confidence: (files["framework.json"].frontend[name] || 0) / 100 });
    });
    Object.keys(files["framework.json"].backend_guess || {}).forEach(function (name) {
      items.push({ type: "backend_guess", claim: name + " guessed", evidence: "cookie/html/url heuristic matched", source: "framework.json", confidence: (files["framework.json"].backend_guess[name] || 0) / 100 });
    });
    (files["telemetry.json"].events || []).slice(0, 50).forEach(function (event) {
      items.push({ type: "telemetry", claim: event.provider + " telemetry event", evidence: event.endpoint + " " + event.event_name, source: "telemetry.json", confidence: event.confidence || 0.7 });
    });
    (files["source_maps.json"].mapFiles || []).forEach(function (url) {
      items.push({ type: "source_map", claim: "Source map visible", evidence: url, source: "source_maps.json", confidence: 0.9 });
    });
    return { items: items };
  }

  function collectConfidence(files) {
    var backend = Object.keys(files["framework.json"].backend_guess || {})[0] || "Unknown";
    var frontendStack = files["intelligence.json"].frontend_stack || "Unknown";
    return {
      backend_guess: {
        value: backend,
        confidence: backend === "Unknown" ? 0 : (files["framework.json"].backend_guess[backend] || 0) / 100,
        evidence: (files["evidence.json"].items || []).filter(function (item) { return item.type === "backend_guess"; }).map(function (item) { return item.evidence; }).slice(0, 10)
      },
      frontend_stack: {
        value: frontendStack,
        confidence: Object.keys(files["framework.json"].frontend || {}).length ? 0.74 : 0.2,
        evidence: (files["evidence.json"].items || []).filter(function (item) { return item.type === "framework"; }).map(function (item) { return item.claim; }).slice(0, 10)
      },
      telemetry_level: {
        value: files["intelligence.json"].telemetry_level,
        confidence: (files["telemetry.json"].events || []).length ? 0.85 : 0.35,
        evidence: ["telemetry events: " + (files["telemetry.json"].events || []).length]
      }
    };
  }

  function collectRoutes() {
    var anchors = queryAll("a[href]").map(function (a) {
      return { href: absoluteUrl(a.getAttribute("href")), text: textOf(a, 160), target: a.target || "" };
    });
    var sameOrigin = anchors.filter(function (a) {
      return safe("sameOrigin", function () { return new URL(a.href).origin === location.origin; }, false);
    }).map(function (a) { return pathFromUrl(a.href); });
    return {
      current: {
        href: location.href,
        pathname: location.pathname,
        search: location.search,
        hash: location.hash
      },
      anchors: anchors,
      sameOriginRoutes: Array.from(new Set(sameOrigin)),
      historyChanges: state.routes.slice(),
      spaTransitions: state.routes.filter(function (r) { return /pushState|replaceState|popstate|hashchange/.test(r.type); })
    };
  }

  function collectAuth(config) {
    var storage = {
      cookies: parseCookies(config),
      localStorage: readStorage(safe("localStorageRef", function () { return window.localStorage; }, null), config),
      sessionStorage: readStorage(safe("sessionStorageRef", function () { return window.sessionStorage; }, null), config)
    };
    var forms = collectForms().forms;
    var html = document.documentElement.outerHTML.slice(0, 600000);
    return {
      jwtMarkers: findMarkers(storage, "jwt").concat(isJwt(html) ? [{ source: "dom", value: "{masked}" }] : []),
      csrfTokens: queryAll("input[name], meta[name], meta[property]").filter(function (el) {
        return /csrf|xsrf/i.test(el.getAttribute("name") || el.getAttribute("property") || "");
      }).map(function (el) {
        var key = el.getAttribute("name") || el.getAttribute("property");
        return { source: "dom", key: key, value: maskValue(key, el.getAttribute("content") || el.getAttribute("value") || "") };
      }),
      oauthProviders: detectOauthProviders(html),
      loginForms: forms.filter(function (form) { return form.classification === "login"; }),
      sessionCookies: storage.cookies.filter(function (cookie) { return cookie.hints.session; }).map(function (cookie) { return cookie.name; }),
      refreshTokenMarkers: findMarkers(storage, "refresh"),
      authChanges: state.authChanges.slice()
    };
  }

  function findMarkers(storage, word) {
    var out = [];
    Object.keys(storage).forEach(function (area) {
      var value = storage[area];
      if (Array.isArray(value)) {
        value.forEach(function (item) {
          if (new RegExp(word, "i").test(JSON.stringify(item))) out.push({ source: area, key: item.name || item.key || "", value: "{masked}" });
        });
      } else if (value && typeof value === "object") {
        Object.keys(value).forEach(function (key) {
          if (new RegExp(word, "i").test(key + " " + value[key])) out.push({ source: area, key: key, value: "{masked}" });
        });
      }
    });
    return out;
  }

  function detectOauthProviders(html) {
    var providers = [];
    [
      ["Google", /accounts\.google\.com|googleusercontent|signin with google/i],
      ["Microsoft", /login\.microsoftonline\.com|microsoftonline|azuread/i],
      ["GitHub", /github\.com\/login|github oauth/i],
      ["Facebook", /facebook\.com\/.*oauth|connect\.facebook/i],
      ["Auth0", /auth0\.com|auth0/i],
      ["Okta", /okta\.com|okta/i],
      ["Keycloak", /keycloak/i]
    ].forEach(function (pair) {
      if (pair[1].test(html)) providers.push(pair[0]);
    });
    return providers;
  }

  function collectFramework() {
    var html = document.documentElement.outerHTML.slice(0, 700000);
    var keys = safe("windowKeys", function () { return Object.keys(window); }, []);
    var frontend = {};
    var backend = {};
    score(frontend, "React", 45, !!window.React || !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
    score(frontend, "React", 35, /__react(Fiber|Props)|data-reactroot|react/i.test(html));
    score(frontend, "Next.js", 96, !!window.__NEXT_DATA__ || !!document.getElementById("__next"));
    score(frontend, "Vue", 70, !!window.Vue || !!window.__VUE_DEVTOOLS_GLOBAL_HOOK__ || /data-v-|__vue__/i.test(html));
    score(frontend, "Nuxt", 92, !!window.__NUXT__ || !!document.getElementById("__nuxt"));
    score(frontend, "Angular", 85, !!window.angular || !!document.querySelector("[ng-version], [ng-app], [data-ng-app]"));
    score(frontend, "Svelte", 65, /svelte-[a-z0-9]+/i.test(html));
    score(frontend, "Webpack", 88, keys.some(function (key) { return /webpack|webpackChunk|webpackJsonp/i.test(key); }) || /webpackChunk|webpackJsonp/i.test(html));
    score(frontend, "Vite", 82, /\/@vite\/|vite\/client|__vite|type="module"/i.test(html));
    score(frontend, "Rollup", 45, /rollup/i.test(html));
    score(frontend, "Parcel", 60, /parcelRequire|__parcel/i.test(html));
    score(frontend, "Custom SPA Runtime", 55, state.routes.length > 0 || keys.some(function (key) { return /router|route|store|runtime|app/i.test(key); }));
    score(frontend, "jQuery", 80, !!window.jQuery || !!(window.$ && window.$.fn && window.$.fn.jquery));
    score(frontend, "Tailwind", detectUtilityFrameworks(html).Tailwind, detectUtilityFrameworks(html).Tailwind > 0);
    score(frontend, "Bootstrap", detectUtilityFrameworks(html).Bootstrap, detectUtilityFrameworks(html).Bootstrap > 0);
    score(frontend, "Material UI", detectUtilityFrameworks(html)["Material UI"], detectUtilityFrameworks(html)["Material UI"] > 0);
    score(frontend, "Chakra", detectUtilityFrameworks(html).Chakra, detectUtilityFrameworks(html).Chakra > 0);
    score(frontend, "Ant Design", detectUtilityFrameworks(html)["Ant Design"], detectUtilityFrameworks(html)["Ant Design"] > 0);

    var cookies = document.cookie || "";
    score(backend, "ASP.NET Core", 81, /\.AspNetCore|ASPXAUTH|aspnet/i.test(cookies + html));
    score(backend, "Laravel", 80, /laravel_session|XSRF-TOKEN/i.test(cookies + html));
    score(backend, "Django", 72, /csrftoken|django/i.test(cookies + html));
    score(backend, "Java/Spring", 70, /JSESSIONID|spring/i.test(cookies + html));
    score(backend, "PHP", 65, /PHPSESSID|\.php(?:\?|")/i.test(cookies + html));
    score(backend, "Node/Express", 45, /connect\.sid|express/i.test(cookies + html));
    score(backend, "WordPress", 90, /wp-content|wp-includes|wp-json|wordpress/i.test(html));
    score(backend, "Shopify", 90, !!window.Shopify || /cdn\.shopify|Shopify\.theme/i.test(html));

    return {
      frontend: sortScores(frontend),
      backend_guess: sortScores(backend),
      evidence: {
        nextData: !!window.__NEXT_DATA__,
        nuxtState: !!window.__NUXT__,
        webpackKeys: keys.filter(function (key) { return /webpack|chunk/i.test(key); }).slice(0, 30),
        cookies: parseCookies(normalizeConfig()).map(function (cookie) { return cookie.name; })
      }
    };
  }

  function score(target, name, points, condition) {
    if (!condition) return;
    target[name] = Math.max(target[name] || 0, Math.min(100, points));
  }

  function sortScores(scores) {
    var out = {};
    Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; }).forEach(function (key) { out[key] = scores[key]; });
    return out;
  }

  function collectEntities(network) {
    var dictionary = [
      "users", "user", "orders", "order", "products", "product", "payments", "payment",
      "courses", "course", "students", "student", "tickets", "ticket", "roles", "role",
      "permissions", "permission", "events", "event", "customers", "customer", "invoices",
      "invoice", "projects", "project", "tasks", "task", "reports", "report", "dashboard",
      "messages", "message", "friends", "friend", "groups", "group", "stories", "story",
      "notifications", "notification", "profiles", "profile", "comments", "comment",
      "likes", "like", "feeds", "feed", "uploads", "upload", "files", "file"
    ];
    var counts = {};
    var sources = [];
    var text = (document.body && document.body.innerText || "").toLowerCase();
    dictionary.forEach(function (word) {
      var re = new RegExp("\\b" + word + "\\b", "gi");
      var matches = text.match(re);
      if (matches) {
        counts[word] = (counts[word] || 0) + matches.length;
        sources.push({ entity: word, source: "ui_text", count: matches.length });
      }
    });
    (network.active || []).concat(network.passive || []).forEach(function (entry) {
      var url = String(entry.url || entry.name || "").toLowerCase();
      dictionary.forEach(function (word) {
        if (new RegExp("[/_-]" + word + "s?([/?#_-]|$)", "i").test(url)) {
          counts[word] = (counts[word] || 0) + 3;
          sources.push({ entity: word, source: "network", url: entry.url || entry.name });
        }
      });
      var signals = entry.responseJsonSignals || entry.requestJsonSignals;
      (signals && signals.entities || []).forEach(function (entity) {
        counts[entity] = (counts[entity] || 0) + 4;
        sources.push({ entity: entity, source: "json_schema", url: entry.url || entry.name });
      });
    });
    return {
      entities: Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).map(function (name) {
        return { name: name, score: counts[name] };
      }),
      sources: sources.slice(0, 500)
    };
  }

  function extractEntityNamesFromJson(value) {
    var keys = collectJsonKeys(value);
    var out = [];
    keys.forEach(function (key) {
      key.split(".").forEach(function (part) {
        var clean = part.replace(/[^a-zA-Z0-9_]/g, "");
        if (/^(users?|messages?|friends?|groups?|products?|orders?|payments?|courses?|students?|tickets?|stories?|notifications?|roles?|permissions?|events?|profiles?|comments?|likes?|feeds?|uploads?|files?)$/i.test(clean)) {
          out.push(clean.toLowerCase());
        }
      });
    });
    return Array.from(new Set(out));
  }

  function inferLiveFeatures(files, modules) {
    var moduleNames = modules.map(function (module) { return typeof module === "string" ? module : module.name; });
    var text = [
      (files["routes.json"].sameOriginRoutes || []).join(" "),
      (files["entities.json"].entities || []).map(function (e) { return e.name; }).join(" "),
      moduleNames.join(" "),
      JSON.stringify(files["network.json"].counts || {})
    ].join(" ").toLowerCase();
    var features = [];
    [
      ["messaging", /message|messenger|chat|dialog|im/],
      ["notifications", /notification|notify|push|badge/],
      ["feed", /feed|timeline|wall|post/],
      ["media upload", /upload|attach|photo|video|media/],
      ["payments", /payment|billing|invoice|checkout/],
      ["search", /search|query/],
      ["groups", /group|community/],
      ["stories", /story|stories/],
      ["admin", /admin|role|permission|dashboard/]
    ].forEach(function (pair) {
      if (pair[1].test(text)) features.push(pair[0]);
    });
    return features;
  }

  function inferStateManagement(framework) {
    var frontend = Object.keys(framework.frontend || {}).join(" ");
    if (/React|Next/.test(frontend)) return "React runtime, store not directly visible";
    if (/Vue|Nuxt/.test(frontend)) return "Vue runtime, store not directly visible";
    return "Unknown";
  }

  function computeRiskScore(files) {
    var score = 0;
    if (files["auth.json"].jwtMarkers.length) score += 20;
    if (files["security.json"].captchaPresence) score += 10;
    if ((files["telemetry.json"].events || []).length > 30) score += 10;
    if ((files["source_maps.json"].mapFiles || []).length) score += 15;
    if ((files["feature_flags.json"].count || 0) > 10) score += 10;
    if ((files["network.json"].counts.auth || 0) > 0) score += 10;
    return Math.min(100, score);
  }

  function collectSecurity(config) {
    var cookies = parseCookies(config);
    var html = document.documentElement.outerHTML.slice(0, 700000);
    return {
      cspMeta: queryAll("meta[http-equiv]").filter(function (meta) {
        return /content-security-policy/i.test(meta.getAttribute("http-equiv") || "");
      }).map(function (meta) { return meta.getAttribute("content") || ""; }),
      iframeSandbox: queryAll("iframe").map(function (iframe) {
        return { src: absoluteUrl(iframe.getAttribute("src")), sandbox: iframe.getAttribute("sandbox") || null };
      }),
      captchaPresence: /captcha|recaptcha|hcaptcha|turnstile/i.test(html),
      cloudflareChallengeMarkers: /cf-chl|cloudflare|challenge-platform|turnstile/i.test(html),
      recaptcha: /google\.com\/recaptcha|grecaptcha/i.test(html),
      sentry: /sentry|__SENTRY__|sentry_key|sentry_dsn/i.test(html),
      oauthProviders: detectOauthProviders(html),
      publicKeys: extractPublicKeys(html),
      analyticsVendors: detectAnalyticsVendors(html),
      sameSiteCookies: cookies.filter(function (cookie) { return /samesite/i.test(JSON.stringify(cookie)); }).map(function (cookie) { return cookie.name; }),
      secureCookies: cookies.filter(function (cookie) { return /secure/i.test(JSON.stringify(cookie)); }).map(function (cookie) { return cookie.name; }),
      visibleHeaderLimitations: "HTTP response security headers are usually not visible to in-page JavaScript unless duplicated in meta tags or exposed by fetch hooks."
    };
  }

  function extractPublicKeys(html) {
    var out = [];
    (html.match(/(?:pk_live_|pk_test_|AIza[0-9A-Za-z_-]{20,}|-----BEGIN PUBLIC KEY-----[\s\S]{0,400}?-----END PUBLIC KEY-----)/g) || []).slice(0, 50).forEach(function (key) {
      out.push(truncate(key, 80));
    });
    return Array.from(new Set(out));
  }

  function detectAnalyticsVendors(html) {
    var vendors = [];
    [
      ["Google Analytics", /google-analytics|googletagmanager|gtag/i],
      ["Yandex Metrika", /mc\.yandex|metrika/i],
      ["Meta Pixel", /facebook\.com\/tr|fbq\(/i],
      ["Sentry", /sentry/i],
      ["Datadog", /datadog/i],
      ["New Relic", /newrelic/i],
      ["Segment", /segment/i],
      ["Amplitude", /amplitude/i],
      ["Mixpanel", /mixpanel/i]
    ].forEach(function (pair) {
      if (pair[1].test(html)) vendors.push(pair[0]);
    });
    return vendors;
  }

  function collectPerformance() {
    var entries = safe("performanceEntries", function () { return performance.getEntries(); }, []);
    var resources = entries.filter(function (e) { return e.entryType === "resource"; }).map(performanceEntry);
    var navigation = entries.filter(function (e) { return e.entryType === "navigation"; }).map(performanceEntry);
    return {
      timeOrigin: performance.timeOrigin || null,
      navigation: navigation,
      resources: resources,
      firstResources: resources.slice().sort(function (a, b) { return a.startTime - b.startTime; }).slice(0, 50),
      chunkLoadOrder: resources.filter(function (r) { return /\.js(\?|#|$)/i.test(r.name); }).sort(function (a, b) { return a.startTime - b.startTime; }),
      slowRequests: resources.filter(function (r) { return r.duration > 1000; }).sort(function (a, b) { return b.duration - a.duration; }).slice(0, 100),
      lazyLoadedBundles: resources.filter(function (r) { return /\.js(\?|#|$)/i.test(r.name) && r.startTime > 2000; }),
      countsByType: countBy(resources, function (r) { return r.initiatorType || "unknown"; })
    };
  }

  function performanceEntry(entry) {
    return {
      name: entry.name,
      entryType: entry.entryType,
      initiatorType: entry.initiatorType || null,
      startTime: Math.round(entry.startTime),
      duration: Math.round(entry.duration),
      transferSize: entry.transferSize || 0,
      encodedBodySize: entry.encodedBodySize || 0,
      decodedBodySize: entry.decodedBodySize || 0
    };
  }

  function collectAssets() {
    var bgUrls = [];
    queryAll("*").slice(0, 2500).forEach(function (el) {
      safe("bg", function () {
        var value = getComputedStyle(el).backgroundImage || "";
        (value.match(/url\((["']?)(.*?)\1\)/g) || []).forEach(function (match) {
          bgUrls.push(absoluteUrl(match.replace(/^url\((["']?)/, "").replace(/(["']?)\)$/, "")));
        });
      }, null);
    });
    var resources = collectPerformance().resources;
    return {
      images: queryAll("img, picture source").map(function (el) { return absoluteUrl(el.currentSrc || el.src || el.srcset || el.getAttribute("src") || el.getAttribute("srcset")); }).filter(Boolean),
      svgInlineCount: queryAll("svg").length,
      svgInlineSamples: queryAll("svg").slice(0, 50).map(function (svg) { return truncate(svg.outerHTML, 5000); }),
      fonts: resources.filter(function (r) { return /\.(woff2?|ttf|otf|eot)(\?|#|$)/i.test(r.name); }),
      favicons: queryAll('link[rel~="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').map(function (el) { return absoluteUrl(el.getAttribute("href")); }),
      manifest: queryAll('link[rel="manifest"]').map(function (el) { return absoluteUrl(el.getAttribute("href")); }),
      scripts: queryAll("script").map(function (script) {
        return { src: absoluteUrl(script.getAttribute("src")), type: script.type || "", async: script.async, defer: script.defer, inlinePreview: script.src ? null : truncate(script.textContent || "", 2000) };
      }),
      styles: queryAll('link[rel~="stylesheet"], style').map(function (el) { return el.tagName.toLowerCase() === "link" ? { href: absoluteUrl(el.getAttribute("href")) } : { inlinePreview: truncate(el.textContent || "", 2000) }; }),
      backgroundImageUrls: Array.from(new Set(bgUrls)),
      videoUrls: queryAll("video, video source").map(function (el) { return absoluteUrl(el.currentSrc || el.src || el.getAttribute("src")); }).filter(Boolean),
      audioUrls: queryAll("audio, audio source").map(function (el) { return absoluteUrl(el.currentSrc || el.src || el.getAttribute("src")); }).filter(Boolean)
    };
  }

  function collectScreenshotMeta() {
    return {
      captured: false,
      reason: "In-page DevTools Console JavaScript cannot capture a real screenshot file without browser permissions or external automation.",
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        scrollX: window.scrollX,
        scrollY: window.scrollY
      },
      documentSize: {
        width: Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0),
        height: Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0)
      }
    };
  }

  function buildAnalysis(files) {
    var frontendScores = files["framework.json"].frontend || {};
    var backendScores = files["framework.json"].backend_guess || {};
    var frontend = Object.keys(frontendScores).slice(0, 3).join(" + ") || "Unknown";
    var backend = Object.keys(backendScores)[0] || "Unknown";
    var auth = [];
    if (files["auth.json"].sessionCookies.length) auth.push("Cookie");
    if (files["auth.json"].jwtMarkers.length) auth.push("JWT");
    if (files["auth.json"].csrfTokens.length) auth.push("CSRF");
    var apiCount = (files["network.json"].active || []).filter(function (n) { return n.category === "api" || n.category === "graphql" || n.category === "auth"; }).length +
      (files["network.json"].passive || []).filter(function (n) { return n.category === "api" || n.category === "graphql" || n.category === "auth"; }).length;
    return {
      site_type: guessSiteType(files),
      frontend: frontend,
      backend_guess: backend,
      auth: auth.join(" + ") || "Unknown",
      main_entities: files["entities.json"].entities.slice(0, 10).map(function (e) { return e.name; }),
      api_count: apiCount,
      pages_seen: files["routes.json"].sameOriginRoutes.length,
      risks: analysisRisks(files),
      notes: [
        "Capture contains browser-visible evidence only.",
        "Server source code and hidden backend logic cannot be recovered from DevTools JavaScript.",
        "Network hooks capture only requests made after SiteSnapshotter.watch() or deep/session hooks were installed."
      ]
    };
  }

  function guessSiteType(files) {
    var text = (document.body && document.body.innerText || "").toLowerCase();
    var routes = files["routes.json"].sameOriginRoutes.join(" ").toLowerCase();
    if (/dashboard|admin|users|roles|permissions|reports|settings/.test(text + routes)) return "SaaS Dashboard";
    if (/cart|checkout|product|catalog|shop|order/.test(text + routes)) return "E-commerce";
    if (/course|lesson|student|teacher|quiz/.test(text + routes)) return "Learning Platform";
    if (/ticket|support|issue|incident/.test(text + routes)) return "Support Portal";
    if (/blog|article|post|category/.test(text + routes)) return "Content Site";
    return "Web Application";
  }

  function analysisRisks(files) {
    var risks = [];
    if (files["auth.json"].jwtMarkers.length) risks.push("JWT markers are present; values are masked in exports.");
    if (files["security.json"].captchaPresence) risks.push("Captcha/challenge markers can block automated replay.");
    if (!files["security.json"].cspMeta.length) risks.push("CSP was not visible through meta tags; HTTP headers may still define it.");
    return risks;
  }

  function registerDefaultModules() {
    if (registry.list().length) return;
    var all = ["quick", "deep", "session", "intel"];
    var rich = ["deep", "session", "intel"];
    function reg(module) { registry.register(module); }
    reg({ id: "page", file: "page.json", modes: all, order: 10, collect: async function (ctx) { return collectPage(ctx.capturedAt); } });
    reg({ id: "dom", file: "dom.json", modes: all, order: 20, collect: async function (ctx) { return collectDom(ctx.config); } });
    reg({ id: "forms", file: "forms.json", modes: all, order: 30, collect: async function () { return collectForms(); } });
    reg({ id: "css", file: "css.json", modes: all, order: 40, collect: async function (ctx) { return collectCss(ctx.config); } });
    reg({ id: "jsenv", file: "jsenv.json", modes: all, order: 50, collect: async function () { return collectJsEnv(); } });
    reg({ id: "storage", file: "storage.json", modes: all, order: 60, collect: async function (ctx) { return collectStorage(ctx.config); } });
    reg({ id: "network", file: "network.json", modes: all, order: 70, collect: async function () { return collectNetwork(); }, report: function (data, reportCtx) { reportCtx.summary["API count"] = (data.counts.api || 0) + (data.counts.graphql || 0) + (data.counts.auth || 0); } });
    reg({ id: "assets", file: "assets.json", modes: all, order: 80, collect: async function () { return collectAssets(); } });
    reg({ id: "routes", file: "routes.json", modes: all, order: 90, collect: async function () { return collectRoutes(); } });
    reg({ id: "auth", file: "auth.json", modes: all, order: 100, collect: async function (ctx) { return collectAuth(ctx.config); } });
    reg({ id: "framework", file: "framework.json", modes: all, order: 110, collect: async function () { return collectFramework(); } });
    reg({ id: "security", file: "security.json", modes: all, order: 120, collect: async function (ctx) { return collectSecurity(ctx.config); }, report: function (data, reportCtx) { if (data.captchaPresence) reportCtx.risk += 10; } });
    reg({ id: "entities", file: "entities.json", modes: all, order: 130, collect: async function (ctx) { return collectEntities(ctx.files["network.json"] || { active: [], passive: [] }); } });
    reg({ id: "performance", file: "performance.json", modes: all, order: 140, collect: async function () { return collectPerformance(); } });
    reg({ id: "timeline", file: "timeline.json", modes: all, order: 150, collect: async function (ctx) { return buildTimeline(ctx.config); } });
    reg({ id: "telemetry", file: "telemetry.json", modes: rich, order: 200, collect: async function (ctx) { return collectTelemetry(ctx.files["network.json"] || { active: [], passive: [] }); }, inspect: function (data) { return { events: data.events && data.events.length || 0, aggregates: data.aggregates }; }, report: function (data, reportCtx) { reportCtx.summary["Telemetry providers"] = ((data.aggregates && data.aggregates.providers) || []).map(function (p) { return p.name; }).join(", "); } });
    reg({ id: "schemas", file: "schemas.json", modes: rich, order: 210, collect: async function (ctx) { return collectSchemas(ctx.files["network.json"] || { active: [] }); } });
    reg({ id: "runtime_state", file: "runtime_state.json", modes: rich, order: 220, collect: async function (ctx) { return collectRuntimeState(ctx.config); }, report: function (data, reportCtx) { reportCtx.summary["State stores found"] = (data.stateStoresFound || []).length; } });
    reg({ id: "feature_flags", file: "feature_flags.json", modes: rich, order: 230, collect: async function (ctx) { return collectFeatureFlags(ctx.config, ctx.files["network.json"] || { active: [] }); }, report: function (data, reportCtx) { reportCtx.summary["Feature flags count"] = data.count || 0; } });
    reg({ id: "module_graph", file: "module_graph.json", modes: rich, order: 240, collect: async function (ctx) { return collectModuleGraph(ctx.files); }, report: function (data, reportCtx) { reportCtx.summary["Main modules"] = (data.modules || []).slice(0, 8).map(function (m) { return typeof m === "string" ? m : m.name; }).join(", "); } });
    reg({ id: "scenario", file: "scenario.json", modes: rich, order: 250, collect: async function () { return collectScenario(); }, report: function (data, reportCtx) { reportCtx.summary["Scenario steps"] = data.length || 0; } });
    reg({ id: "source_maps", file: "source_maps.json", modes: rich, order: 260, collect: async function (ctx) { return collectSourceMaps(ctx.files); } });
    reg({ id: "intelligence", file: "intelligence.json", modes: rich, order: 270, collect: async function (ctx) { return buildIntelligence(ctx.files); }, inspect: function (data) { return data; }, report: function (data, reportCtx) { reportCtx.summary["Frontend stack"] = data.frontend_stack || "Unknown"; reportCtx.summary["Backend guess"] = data.backend_guess || "Unknown"; reportCtx.summary["Risk score"] = data.risk_score || 0; } });
    reg({ id: "analysis", file: "analysis.json", modes: all, order: 280, collect: async function (ctx) { return buildAnalysis(ctx.files); } });
    reg({ id: "endpoints", file: "endpoints.json", modes: rich, order: 290, collect: async function (ctx) { return collectEndpoints(ctx.files); } });
    reg({ id: "state_map", file: "state_map.json", modes: rich, order: 300, collect: async function (ctx) { return collectStateMap(ctx.files); } });
    reg({ id: "tech_tree", file: "tech_tree.json", modes: rich, order: 310, collect: async function (ctx) { return collectTechTree(ctx.files); } });
    reg({ id: "evidence", file: "evidence.json", modes: rich, order: 320, collect: async function (ctx) { return collectEvidence(ctx.files); } });
    reg({ id: "confidence", file: "confidence.json", modes: rich, order: 330, collect: async function (ctx) { return collectConfidence(ctx.files); } });
    reg({ id: "screenshot_meta", file: "screenshot_meta.json", modes: all, order: 340, collect: async function () { return collectScreenshotMeta(); } });
  }

  async function buildCapturePackage(options) {
    var config = normalizeConfig(options);
    if (config.mode === "deep" || config.mode === "session" || config.mode === "intel" || config.installHooks) installHooks(config);
    var capturedAt = now();
    var captureStamp = stamp();
    var folder = captureFolder(captureStamp);
    addTimeline("capture_started", { mode: config.mode, url: location.href });
    registerDefaultModules();
    var files = {};
    var errors = [];
    var ctx = {
      config: config,
      mode: config.mode,
      capturedAt: capturedAt,
      captureRoot: folder,
      files: files,
      state: state,
      registry: registry,
      sanitize: sanitize
    };
    var modules = registry.forMode(config.mode);
    for (var i = 0; i < modules.length; i += 1) {
      var module = modules[i];
      try {
        files[module.file] = await module.collect(ctx);
      } catch (error) {
        files[module.file] = {
          error: true,
          module: module.id,
          message: String(error && error.message || error)
        };
        errors.push(files[module.file]);
      }
    }

    var pack = {
      schema: "site-snapshotter.capture-package.v4",
      version: VERSION,
      mode: config.mode,
      createdAt: capturedAt,
      captureRoot: folder,
      files: files,
      meta: {
        modules: modules.map(function (module) { return { id: module.id, file: module.file, order: module.order, tags: module.tags || [] }; }),
        errors: errors,
        durationMs: null
      },
      manifest: {
        domain: domainSlug(),
        folder: folder,
        fileNames: Object.keys(files),
        registryFiles: modules.map(function (module) { return module.file; }),
        zipReady: true,
        exportHint: "Use SiteSnapshotter.exportChunks() to download one JSON file per capture module."
      }
    };

    pack.meta.durationMs = Date.now() - Date.parse(capturedAt);
    state.lastPackage = pack;
    addTimeline("capture_completed", { mode: config.mode, files: Object.keys(files).length });
    if (config.download) {
      exportChunks(pack, config);
    }
    console.info("[SiteSnapshotter] Capture package created:", pack);
    return pack;
  }

  function buildTimeline(config) {
    var timeline = state.timeline.slice();
    if (!timeline.length) timeline.push({ t: 0, event: "page_loaded", timestamp: state.installedAt, url: location.href });
    if (config.mode === "session") {
      state.routes.forEach(function (route) {
        timeline.push({ t: route.t || 0, event: "route_change:" + pathFromUrl(route.url), timestamp: route.timestamp, url: route.url, type: route.type });
      });
      state.network.forEach(function (entry) {
        timeline.push({ t: entry.t || 0, event: (entry.type || "request") + ":" + pathFromUrl(entry.url), timestamp: entry.timestamp, url: entry.url, category: entry.category });
      });
    }
    return timeline.sort(function (a, b) { return a.t - b.t; });
  }

  function installHooks(config) {
    if (state.hooksInstalled) return;
    state.hooksInstalled = true;
    if (!state.sessionStartedAt) state.sessionStartedAt = now();
    addTimeline("hooks_installed", { url: location.href });

    if (window.fetch) hookFetch(config);
    if (window.XMLHttpRequest) hookXhr(config);
    if (window.WebSocket) hookWebSocket(config);
    if (navigator.sendBeacon) hookBeacon(config);
    hookHistory();
    observeActions();
    console.info("[SiteSnapshotter] Active hooks installed.");
  }

  function hookFetch(config) {
    state.originals.fetch = window.fetch;
    window.fetch = async function snapshotterFetch(input, init) {
      var started = Date.now();
      var url = absoluteUrl(typeof input === "string" ? input : input && input.url);
      var entry = {
        type: "fetch",
        method: String(init && init.method || input && input.method || "GET").toUpperCase(),
        url: url,
        status: null,
        category: classifyUrl(url, "fetch"),
        requestHeaders: maskObject(headersToObject(init && init.headers || input && input.headers), config),
        requestBodyPreview: maskValue("body", init && init.body, config.valuePreviewLimit),
        timestamp: now(),
        t: sessionT()
      };
      assign(entry, nearestUserAction(entry.t) || {});
      entry.requestJsonSignals = extractJsonSignals(init && init.body);
      try {
        var response = await state.originals.fetch.apply(this, arguments);
        entry.status = response.status;
        entry.ok = response.ok;
        entry.durationMs = Date.now() - started;
        entry.responseHeaders = maskObject(headersToObject(response.headers), config);
        safe("fetchPreview", function () {
          var clone = response.clone();
          var type = clone.headers.get("content-type") || "";
          if (/json|text|javascript|xml|html|css/i.test(type)) {
            clone.text().then(function (text) {
              entry.responsePreview = maskValue("response", text, config.responsePreviewLimit);
              entry.responseJsonSignals = extractJsonSignals(text);
              entry.category = classifyNetworkEntry(entry);
            }).catch(function (error) {
              entry.responsePreviewError = String(error && error.message || error);
            });
          }
        }, null);
        state.network.push(entry);
        addTimeline("fetch:" + pathFromUrl(url), { url: url, status: entry.status, category: entry.category });
        return response;
      } catch (error) {
        entry.error = String(error && error.message || error);
        entry.durationMs = Date.now() - started;
        state.network.push(entry);
        addTimeline("fetch_error:" + pathFromUrl(url), { url: url, category: entry.category });
        throw error;
      }
    };
  }

  function hookXhr(config) {
    state.originals.xhrOpen = XMLHttpRequest.prototype.open;
    state.originals.xhrSend = XMLHttpRequest.prototype.send;
    state.originals.xhrSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.open = function snapshotterXhrOpen(method, url) {
      this.__siteSnapshotterEntry = {
        type: "XMLHttpRequest",
        method: String(method || "GET").toUpperCase(),
        url: absoluteUrl(url),
        requestHeaders: {},
        timestamp: now(),
        t: sessionT()
      };
      this.__siteSnapshotterEntry.category = classifyUrl(this.__siteSnapshotterEntry.url, "xhr");
      return state.originals.xhrOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.setRequestHeader = function snapshotterXhrHeader(name, value) {
      if (this.__siteSnapshotterEntry) this.__siteSnapshotterEntry.requestHeaders[name] = maskValue(name, value, config.valuePreviewLimit);
      return state.originals.xhrSetRequestHeader.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function snapshotterXhrSend(body) {
      var entry = this.__siteSnapshotterEntry || { type: "XMLHttpRequest", timestamp: now(), t: sessionT() };
      var started = Date.now();
      assign(entry, nearestUserAction(entry.t) || {});
      entry.requestBodyPreview = maskValue("body", body, config.valuePreviewLimit);
      entry.requestJsonSignals = extractJsonSignals(body);
      this.addEventListener("loadend", function () {
        entry.status = this.status;
        entry.durationMs = Date.now() - started;
        entry.responseURL = this.responseURL || null;
        entry.responsePreview = maskValue("response", safe("xhrText", function () {
          return this.responseType && this.responseType !== "text" ? "[non-text responseType: " + this.responseType + "]" : this.responseText || "";
        }.bind(this), ""), config.responsePreviewLimit);
        entry.responseJsonSignals = extractJsonSignals(safe("xhrJsonSignals", function () {
          return this.responseType && this.responseType !== "text" ? "" : this.responseText || "";
        }.bind(this), ""));
        entry.category = classifyNetworkEntry(entry);
        state.network.push(entry);
        addTimeline("xhr:" + pathFromUrl(entry.url), { url: entry.url, status: entry.status, category: entry.category });
      });
      this.addEventListener("error", function () {
        entry.error = "XMLHttpRequest error";
        state.network.push(entry);
      });
      return state.originals.xhrSend.apply(this, arguments);
    };
  }

  function hookWebSocket(config) {
    state.originals.WebSocket = window.WebSocket;
    window.WebSocket = function SnapshotterWebSocket(url, protocols) {
      var ws = protocols === undefined ? new state.originals.WebSocket(url) : new state.originals.WebSocket(url, protocols);
      var entry = { type: "WebSocket", method: "GET", url: absoluteUrl(url), status: null, category: "api", timestamp: now(), t: sessionT(), events: [] };
      state.network.push(entry);
      addTimeline("websocket:" + pathFromUrl(url), { url: entry.url, category: entry.category });
      ws.addEventListener("open", function () { entry.events.push({ event: "open", timestamp: now(), t: sessionT() }); });
      ws.addEventListener("message", function (event) { entry.events.push({ event: "message", timestamp: now(), t: sessionT(), dataPreview: maskValue("message", event.data, config.responsePreviewLimit) }); });
      ws.addEventListener("close", function (event) { entry.events.push({ event: "close", timestamp: now(), t: sessionT(), code: event.code, reason: event.reason }); });
      ws.addEventListener("error", function () { entry.events.push({ event: "error", timestamp: now(), t: sessionT() }); });
      return ws;
    };
    window.WebSocket.prototype = state.originals.WebSocket.prototype;
  }

  function hookBeacon(config) {
    state.originals.sendBeacon = navigator.sendBeacon;
    navigator.sendBeacon = function snapshotterBeacon(url, data) {
      var entry = {
        type: "sendBeacon",
        method: "POST",
        url: absoluteUrl(url),
        status: null,
        category: classifyUrl(url, "beacon"),
        requestBodyPreview: maskValue("body", data, config.valuePreviewLimit),
        requestJsonSignals: extractJsonSignals(data),
        timestamp: now(),
        t: sessionT()
      };
      assign(entry, nearestUserAction(entry.t) || {});
      state.network.push(entry);
      addTimeline("beacon:" + pathFromUrl(url), { url: entry.url, category: entry.category });
      return state.originals.sendBeacon.apply(this, arguments);
    };
  }

  function hookHistory() {
    if (!state.originals.pushState) state.originals.pushState = history.pushState;
    if (!state.originals.replaceState) state.originals.replaceState = history.replaceState;
    history.pushState = function snapshotterPushState(data, title, url) {
      var result = state.originals.pushState.apply(this, arguments);
      recordRoute("pushState", url, data);
      return result;
    };
    history.replaceState = function snapshotterReplaceState(data, title, url) {
      var result = state.originals.replaceState.apply(this, arguments);
      recordRoute("replaceState", url, data);
      return result;
    };
    if (!state.historyListenersInstalled) {
      window.addEventListener("popstate", function (event) { recordRoute("popstate", location.href, event.state); });
      window.addEventListener("hashchange", function () { recordRoute("hashchange", location.href, null); });
      state.historyListenersInstalled = true;
    }
  }

  function recordRoute(type, url, data) {
    var entry = { type: type, url: absoluteUrl(url || location.href), statePreview: maskValue("history_state", data, 1000), timestamp: now(), t: sessionT() };
    state.routes.push(entry);
    state.scenario.push({ t: entry.t, action: "route_change", value: pathFromUrl(entry.url), timestamp: entry.timestamp });
    addTimeline("route_change:" + pathFromUrl(entry.url), { url: entry.url, type: type });
  }

  function headersToObject(headers) {
    var out = {};
    if (!headers) return out;
    safe("headers", function () {
      if (headers.forEach) headers.forEach(function (value, key) { out[key] = value; });
      else if (Array.isArray(headers)) headers.forEach(function (pair) { out[pair[0]] = pair[1]; });
      else out = assign({}, headers);
    }, null);
    return out;
  }

  function maskObject(object, config) {
    var out = {};
    Object.keys(object || {}).forEach(function (key) { out[key] = maskValue(key, object[key], config.valuePreviewLimit); });
    return out;
  }

  function startWatch(options) {
    var config = normalizeConfig(assign({ mode: "session", download: false }, options || {}));
    if (!state.sessionStartedAt) state.sessionStartedAt = now();
    state.watching = true;
    installHooks(config);
    observeDom(config);
    observeStorage(config);
    observeActions();
    addTimeline("watch_started", { url: location.href });
    console.info("[SiteSnapshotter] Session watch is active. Interact with the site, then run: await SiteSnapshotter.run('session')");
    return api;
  }

  function observeActions() {
    if (state.actionListenersInstalled) return;
    state.actionListenersInstalled = true;
    document.addEventListener("click", function (event) {
      var target = event.target && event.target.closest ? event.target.closest("a, button, input, [role='button'], [data-testid], [aria-label]") : event.target;
      var summary = elementSummary(target);
      var entry = { t: sessionT(), action: "click", target: summary && (summary.text || summary.attributes["aria-label"] || summary.id || summary.className || summary.tag), element: summary, timestamp: now() };
      state.clickEvents.push(entry);
      state.scenario.push(entry);
      addTimeline("click:" + (entry.target || "element"), { target: entry.target });
    }, true);
    document.addEventListener("submit", function (event) {
      var summary = formSummary(event.target);
      var entry = { t: sessionT(), action: "submit", target: summary && (summary.text || summary.action), form: summary, timestamp: now() };
      state.submitEvents.push(entry);
      state.scenario.push(entry);
      addTimeline("submit:" + (entry.target || "form"), { target: entry.target });
    }, true);
    ["input", "change"].forEach(function (type) {
      document.addEventListener(type, function (event) {
        var target = event.target;
        if (!target || !/INPUT|SELECT|TEXTAREA/.test(target.tagName || "")) return;
        var summary = elementSummary(target);
        var entry = {
          t: sessionT(),
          action: type,
          target: summary && (summary.name || summary.id || summary.attributes.placeholder || summary.type || summary.tag),
          valuePreview: target.type === "password" ? "{masked}" : maskValue(summary && (summary.name || summary.id || summary.type), target.value, 120),
          element: summary,
          timestamp: now()
        };
        state.scenario.push(entry);
        addTimeline(type + ":" + (entry.target || "field"), { target: entry.target });
      }, true);
    });
  }

  function observeDom(config) {
    if (!window.MutationObserver || state.mutationObserver) return;
    var observer = new MutationObserver(function (mutations) {
      mutations.slice(0, 150).forEach(function (mutation) {
        var entry = {
          type: mutation.type,
          target: elementSummary(mutation.target),
          added: mutation.addedNodes ? mutation.addedNodes.length : 0,
          removed: mutation.removedNodes ? mutation.removedNodes.length : 0,
          attributeName: mutation.attributeName || null,
          timestamp: now(),
          t: sessionT()
        };
        state.domMutations.push(entry);
        detectModalMutation(mutation);
      });
      if (state.domMutations.length > 3000) state.domMutations.splice(0, state.domMutations.length - 3000);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "open", "aria-hidden", "aria-modal", "role"] });
    state.mutationObserver = observer;
    state.observers.push(observer);
  }

  function detectModalMutation(mutation) {
    var target = mutation.target && mutation.target.nodeType === 1 ? mutation.target : null;
    if (!target) return;
    if (target.matches && target.matches("dialog, [role='dialog'], [aria-modal='true'], [class*='modal']")) {
      var entry = { event: isHidden(target) ? "modal_hidden" : "modal_opened", element: elementSummary(target), timestamp: now(), t: sessionT() };
      state.modalEvents.push(entry);
      addTimeline(entry.event, { text: entry.element && entry.element.text });
    }
  }

  function observeStorage(config) {
    if (state.storagePatched) return;
    state.storagePatched = true;
    patchStorageArea("localStorage", config);
    patchStorageArea("sessionStorage", config);
    if (!state.storageListener) {
      state.storageListener = function (event) {
        var entry = { area: "storage_event", key: event.key, oldValue: maskValue(event.key, event.oldValue, config.valuePreviewLimit), newValue: maskValue(event.key, event.newValue, config.valuePreviewLimit), url: event.url, timestamp: now(), t: sessionT() };
        state.storageEvents.push(entry);
        if (SENSITIVE_RE.test(event.key || "")) state.authChanges.push(entry);
        addTimeline("storage_change:" + event.key, { key: event.key });
      };
      window.addEventListener("storage", state.storageListener);
    }
  }

  function patchStorageArea(name, config) {
    safe("patchStorageArea", function () {
      var storage = window[name];
      if (!storage || state.originals[name + ".setItem"]) return;
      state.originals[name + ".setItem"] = storage.setItem;
      state.originals[name + ".removeItem"] = storage.removeItem;
      storage.setItem = function snapshotterSetItem(key, value) {
        var oldValue = safe("oldStorage", function () { return storage.getItem(key); }, null);
        var result = state.originals[name + ".setItem"].apply(this, arguments);
        var entry = { area: name, action: "setItem", key: key, oldValue: maskValue(key, oldValue, config.valuePreviewLimit), newValue: maskValue(key, value, config.valuePreviewLimit), timestamp: now(), t: sessionT() };
        state.storageEvents.push(entry);
        if (SENSITIVE_RE.test(key || "")) state.authChanges.push(entry);
        addTimeline("storage_change:" + key, { area: name, action: "setItem" });
        return result;
      };
      storage.removeItem = function snapshotterRemoveItem(key) {
        var oldValue = safe("oldStorage", function () { return storage.getItem(key); }, null);
        var result = state.originals[name + ".removeItem"].apply(this, arguments);
        var entry = { area: name, action: "removeItem", key: key, oldValue: maskValue(key, oldValue, config.valuePreviewLimit), newValue: null, timestamp: now(), t: sessionT() };
        state.storageEvents.push(entry);
        if (SENSITIVE_RE.test(key || "")) state.authChanges.push(entry);
        addTimeline("storage_change:" + key, { area: name, action: "removeItem" });
        return result;
      };
    }, null);
  }

  function stop() {
    state.watching = false;
    state.observers.forEach(function (observer) { safe("disconnect", function () { observer.disconnect(); }, null); });
    state.observers = [];
    state.mutationObserver = null;
    if (state.storageListener) window.removeEventListener("storage", state.storageListener);
    state.storageListener = null;
    restoreHooks();
    addTimeline("watch_stopped", { url: location.href });
    console.info("[SiteSnapshotter] Stopped.");
    return api;
  }

  function restoreHooks() {
    if (state.originals.fetch) window.fetch = state.originals.fetch;
    if (state.originals.xhrOpen) XMLHttpRequest.prototype.open = state.originals.xhrOpen;
    if (state.originals.xhrSend) XMLHttpRequest.prototype.send = state.originals.xhrSend;
    if (state.originals.xhrSetRequestHeader) XMLHttpRequest.prototype.setRequestHeader = state.originals.xhrSetRequestHeader;
    if (state.originals.WebSocket) window.WebSocket = state.originals.WebSocket;
    if (state.originals.sendBeacon) navigator.sendBeacon = state.originals.sendBeacon;
    if (state.originals.pushState) history.pushState = state.originals.pushState;
    if (state.originals.replaceState) history.replaceState = state.originals.replaceState;
    ["localStorage", "sessionStorage"].forEach(function (name) {
      safe("restoreStorage", function () {
        var storage = window[name];
        if (storage && state.originals[name + ".setItem"]) storage.setItem = state.originals[name + ".setItem"];
        if (storage && state.originals[name + ".removeItem"]) storage.removeItem = state.originals[name + ".removeItem"];
      }, null);
    });
    state.hooksInstalled = false;
    state.storagePatched = false;
  }

  function stringify(data, minify) {
    return JSON.stringify(data, null, minify ? 0 : 2);
  }

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function downloadJson(data, fileName, minify) {
    var blob = new Blob([stringify(data, minify)], { type: "application/json;charset=utf-8" });
    downloadBlob(blob, fileName);
  }

  function downloadBlob(blob, fileName) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.documentElement.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function folderToFileName(folder, name) {
    return folder.replace(/^captures\//, "captures__").replace(/[\/\\]+/g, "__") + name;
  }

  function exportPackage(options) {
    var config = normalizeConfig(options);
    var pack = state.lastPackage;
    if (!pack) return buildCapturePackage(assign(config, { download: true }));
    downloadJson(pack, config.fileName || folderToFileName(pack.captureRoot, "capture.package.json"), config.minify);
    return pack;
  }

  function orderedExportEntries(target) {
    registerDefaultModules();
    var exported = {};
    var entries = [];
    registry.list().map(function (module) { return module.file; }).forEach(function (name) {
      if (!target.files || !Object.prototype.hasOwnProperty.call(target.files, name)) return;
      exported[name] = true;
      entries.push([name, target.files[name]]);
    });
    Object.entries(target.files || {}).forEach(function (entry) {
      if (exported[entry[0]]) return;
      entries.push(entry);
    });
    if (target.manifest) entries.push(["manifest.json", target.manifest]);
    return entries;
  }

  async function exportChunks(pack, options) {
    var target = pack && pack.files ? pack : state.lastPackage;
    var config = normalizeConfig(options);
    if (!target) throw new Error("No capture package available. Run SiteSnapshotter.run({download:false}) first.");
    var delay = Math.max(300, Number(config.downloadDelayMs || 400));
    var entries = orderedExportEntries(target);
    console.info("[SiteSnapshotter] Exporting " + entries.length + " JSON files with " + delay + "ms delay. If the browser blocks multiple downloads, use SiteSnapshotter.exportZip(pack).");
    try {
      for (var i = 0; i < entries.length; i += 1) {
        var name = entries[i][0];
        var data = entries[i][1];
        console.info("[SiteSnapshotter] Download " + (i + 1) + "/" + entries.length + ": " + name);
        downloadJson(data, folderToFileName(target.captureRoot, name), config.minify);
        await sleep(delay);
      }
      console.info("[SiteSnapshotter] Export queue finished.");
    } catch (error) {
      console.warn("[SiteSnapshotter] Chunk export failed, falling back to ZIP export.", error);
      exportZip(target, config);
    }
    return target;
  }

  function exportZip(pack, options) {
    var target = pack && pack.files ? pack : state.lastPackage;
    var config = normalizeConfig(options);
    if (!target) throw new Error("No capture package available. Run SiteSnapshotter.run({download:false}) first.");
    var entries = orderedExportEntries(target).map(function (entry) {
      return {
        name: (target.captureRoot || "captures/unknown/").replace(/^\/+/, "") + entry[0],
        data: stringify(entry[1], config.minify)
      };
    });
    var blob = buildZip(entries);
    downloadBlob(blob, folderToFileName(target.captureRoot || "captures/unknown/", "capture.zip"));
    console.info("[SiteSnapshotter] ZIP export created:", entries.length, "files");
    return target;
  }

  function buildZip(entries) {
    var files = [];
    var central = [];
    var offset = 0;
    entries.forEach(function (entry) {
      var nameBytes = utf8Bytes(entry.name);
      var dataBytes = utf8Bytes(entry.data);
      var crc = crc32(dataBytes);
      var local = concatBytes(
        u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc),
        u32(dataBytes.length), u32(dataBytes.length), u16(nameBytes.length), u16(0), nameBytes, dataBytes
      );
      var centralEntry = concatBytes(
        u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc),
        u32(dataBytes.length), u32(dataBytes.length), u16(nameBytes.length), u16(0), u16(0),
        u16(0), u16(0), u32(0), u32(offset), nameBytes
      );
      files.push(local);
      central.push(centralEntry);
      offset += local.length;
    });
    var centralBytes = concatBytes.apply(null, central);
    var end = concatBytes(
      u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length),
      u32(centralBytes.length), u32(offset), u16(0)
    );
    return new Blob([concatBytes(concatBytes.apply(null, files), centralBytes, end)], { type: "application/zip" });
  }

  function utf8Bytes(text) {
    return new TextEncoder().encode(String(text));
  }

  function u16(value) {
    var bytes = new Uint8Array(2);
    bytes[0] = value & 255;
    bytes[1] = value >>> 8 & 255;
    return bytes;
  }

  function u32(value) {
    var bytes = new Uint8Array(4);
    bytes[0] = value & 255;
    bytes[1] = value >>> 8 & 255;
    bytes[2] = value >>> 16 & 255;
    bytes[3] = value >>> 24 & 255;
    return bytes;
  }

  function concatBytes() {
    var arrays = Array.prototype.slice.call(arguments);
    var length = arrays.reduce(function (sum, arr) { return sum + arr.length; }, 0);
    var out = new Uint8Array(length);
    var offset = 0;
    arrays.forEach(function (arr) {
      out.set(arr, offset);
      offset += arr.length;
    });
    return out;
  }

  var crcTable = null;
  function crc32(bytes) {
    if (!crcTable) {
      crcTable = [];
      for (var n = 0; n < 256; n += 1) {
        var c = n;
        for (var k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ c >>> 1 : c >>> 1;
        crcTable[n] = c >>> 0;
      }
    }
    var crc = -1;
    for (var i = 0; i < bytes.length; i += 1) crc = crcTable[(crc ^ bytes[i]) & 255] ^ crc >>> 8;
    return (crc ^ -1) >>> 0;
  }

  async function copy(pack) {
    var target = pack || state.lastPackage || await buildCapturePackage({ download: false });
    var text = stringify(target, false);
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

  function report() {
    var pack = state.lastPackage;
    if (!pack) {
      console.info("[SiteSnapshotter] No capture yet. Run: await SiteSnapshotter.run({download:false})");
      return null;
    }
    registerDefaultModules();
    var summary = {
      "Frontend stack": "Unknown",
      "Backend guess": "Unknown",
      "API count": 0,
      "Telemetry providers": "",
      "Main modules": "",
      "Feature flags count": 0,
      "State stores found": 0,
      "Scenario steps": 0,
      "Risk score": 0,
      "Files count": Object.keys(pack.files || {}).length,
      "Errors count": Object.keys(pack.files || {}).filter(function (name) { return pack.files[name] && pack.files[name].error; }).length
    };
    var reportCtx = { pack: pack, files: pack.files, summary: summary, risk: 0 };
    registry.list().forEach(function (module) {
      var data = pack.files[module.file];
      if (data && typeof module.report === "function") {
        safe("moduleReport:" + module.id, function () { module.report(data, reportCtx); }, null);
      }
    });
    summary["Risk score"] = Math.max(summary["Risk score"] || 0, reportCtx.risk || 0);
    console.table(summary);
    return summary;
  }

  function inspect(target) {
    var pack = state.lastPackage;
    if (!pack) {
      console.info("[SiteSnapshotter] No capture yet. Run: await SiteSnapshotter.run('intel')");
      return null;
    }
    registerDefaultModules();
    var files = pack.files;
    if (!target) {
      var overview = {
        intelligence: files["intelligence.json"],
        telemetry: files["telemetry.json"] && files["telemetry.json"].aggregates,
        modules: files["module_graph.json"] && files["module_graph.json"].modules,
        schemas: Object.keys(files["schemas.json"] || {}).slice(0, 30),
        featureFlags: files["feature_flags.json"] && files["feature_flags.json"].count,
        registry: registry.list().map(function (module) { return { id: module.id, file: module.file, order: module.order }; })
      };
      console.log("[SiteSnapshotter.inspect]", overview);
      return overview;
    }
    var module = registry.get(target) || registry.get(/\.json$/.test(target) ? target : target + ".json");
    var fileName = module ? module.file : (/\.json$/.test(target) ? target : target + ".json");
    var data = files[fileName];
    var output = module && typeof module.inspect === "function" ? module.inspect(data, { pack: pack, files: files, module: module }) : data;
    console.log("[SiteSnapshotter.inspect:" + (module ? module.id : fileName) + "]", output);
    return output || null;
  }

  function createOverlay() {
    if (state.overlay) return state.overlay;
    var root = document.createElement("div");
    root.style.cssText = [
      "position:fixed",
      "right:16px",
      "bottom:16px",
      "z-index:2147483647",
      "display:grid",
      "gap:6px",
      "padding:8px",
      "background:#0b1220",
      "color:#f8fafc",
      "font:12px/1.2 system-ui,-apple-system,Segoe UI,sans-serif",
      "border:1px solid rgba(255,255,255,.2)",
      "box-shadow:0 16px 44px rgba(0,0,0,.34)"
    ].join(";");
    var stats = document.createElement("div");
    stats.style.cssText = "display:grid;grid-template-columns:auto auto;gap:4px 10px;min-width:220px";
    function refreshStats() {
      var files = state.lastPackage && state.lastPackage.files || {};
      var intel = files["intelligence.json"] || {};
      var rows = {
        Mode: state.lastPackage && state.lastPackage.mode || "watch",
        Requests: state.network.length,
        "Telemetry events": files["telemetry.json"] && files["telemetry.json"].events && files["telemetry.json"].events.length || 0,
        "Feature flags": files["feature_flags.json"] && files["feature_flags.json"].count || 0,
        "State stores": files["runtime_state.json"] && files["runtime_state.json"].stateStoresFound && files["runtime_state.json"].stateStoresFound.length || 0,
        "Scenario steps": files["scenario.json"] && files["scenario.json"].length || state.scenario.length,
        "Risk score": intel.risk_score || 0
      };
      stats.innerHTML = Object.keys(rows).map(function (key) {
        return "<span style='opacity:.72'>" + key + "</span><strong style='text-align:right'>" + rows[key] + "</strong>";
      }).join("");
    }
    refreshStats();
    root.appendChild(stats);
    setInterval(function () { if (state.overlay === root) refreshStats(); }, 1500);
    var buttons = document.createElement("div");
    buttons.style.cssText = "display:flex;gap:6px;flex-wrap:wrap";
    [
      ["Quick", function () { buildCapturePackage("quick"); }],
      ["Deep", function () { buildCapturePackage("deep"); }],
      ["Intel", function () { buildCapturePackage("intel"); }],
      ["Session", function () { startWatch(); }],
      ["Export", function () { exportChunks(); }],
      ["Report", function () { report(); }],
      ["Stop", function () { stop(); root.remove(); state.overlay = null; }]
    ].forEach(function (item) {
      var button = document.createElement("button");
      button.textContent = item[0];
      button.style.cssText = "border:0;background:#f8fafc;color:#0b1220;padding:7px 9px;cursor:pointer;font:inherit";
      button.addEventListener("click", item[1]);
      buttons.appendChild(button);
    });
    root.appendChild(buttons);
    document.documentElement.appendChild(root);
    state.overlay = root;
    return root;
  }

  registerDefaultModules();

  var api = {
    version: VERSION,
    state: state,
    registry: registry,
    sanitize: sanitize,
    run: buildCapturePackage,
    watch: startWatch,
    stop: stop,
    export: exportPackage,
    exportChunks: exportChunks,
    exportZip: exportZip,
    copy: copy,
    report: report,
    inspect: inspect,
    overlay: createOverlay
  };

  window[GLOBAL_NAME] = api;
  addTimeline("page_loaded", { url: location.href });
  console.info("[SiteSnapshotter] v4 installed. Try: await SiteSnapshotter.run('intel'), SiteSnapshotter.registry.list(), SiteSnapshotter.inspect('telemetry').");
  return api;
})();
