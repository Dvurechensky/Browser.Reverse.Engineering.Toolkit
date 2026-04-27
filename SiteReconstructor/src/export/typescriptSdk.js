"use strict";

const fs = require("fs");
const path = require("path");
const { compressArchive } = require("./archive");
const { safeRemoveGeneratedDir } = require("../fs/safeRemove");

function writeTypeScriptSdkExport(outputDir, apiMap, apiTopology, site) {
  const exportsDir = path.join(outputDir, "exports");
  const sdkDir = path.join(exportsDir, "typescript-sdk");
  const archivePath = path.join(exportsDir, "typescript-sdk.zip");
  const endpoints = flattenApiEndpoints(apiMap);
  const result = {
    status: "skipped",
    generator: "SiteReconstructor TypeScript SDK",
    output_dir: normalizeRelativePath(path.relative(outputDir, sdkDir)),
    bundle: normalizeRelativePath(path.relative(outputDir, archivePath)),
    files: [],
    endpoint_count: endpoints.length,
    warnings: [],
  };

  safeRemoveGeneratedDir(outputDir, sdkDir, "typescript-sdk");
  ensureDir(path.join(sdkDir, "src"));

  const context = buildSdkContext(endpoints, apiTopology, site);
  const files = {
    "package.json": JSON.stringify(packageJson(context), null, 2) + "\n",
    "tsconfig.json": JSON.stringify(tsconfigJson(), null, 2) + "\n",
    "README.md": readme(context),
    "src/index.ts": "export * from './client';\nexport * from './endpoints';\nexport * from './types';\n",
    "src/types.ts": renderTypes(context),
    "src/client.ts": renderClient(context),
    "src/endpoints.ts": renderEndpoints(context),
  };

  for (const [relativePath, content] of Object.entries(files)) {
    const filePath = path.join(sdkDir, ...relativePath.split("/"));
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content, "utf8");
    result.files.push(normalizeRelativePath(path.relative(outputDir, filePath)));
  }

  result.status = "ready";
  fs.writeFileSync(path.join(sdkDir, "manifest.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
  result.files.push(normalizeRelativePath(path.relative(outputDir, path.join(sdkDir, "manifest.json"))));

  const zipped = compressArchive(sdkDir, archivePath);
  if (!zipped.ok) {
    result.status = "bundle_failed";
    result.warnings.push(zipped.error);
    fs.writeFileSync(path.join(sdkDir, "manifest.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
  }
  return result;
}

function buildSdkContext(endpoints, apiTopology, site) {
  const seenOperations = new Map();
  const operations = endpoints.map((endpoint, index) => {
    const baseOperationName = uniqueOperationName(endpoint, index);
    const seenCount = seenOperations.get(baseOperationName) || 0;
    seenOperations.set(baseOperationName, seenCount + 1);
    const operationName = seenCount ? `${baseOperationName}${seenCount + 1}` : baseOperationName;
    return {
      endpoint,
      operationName,
      requestType: `${pascal(operationName)}Request`,
      responseType: `${pascal(operationName)}Response`,
      path: endpoint.path || pathFromUrl(endpoint.url),
      baseKey: baseKey(endpoint),
    };
  });
  return {
    packageName: `sitereconstructor-${safeName(site?.host || "site")}-sdk`,
    target: site?.host || site?.url || "site",
    baseUrls: {
      base: apiTopology?.frontend_domain ? `https://${apiTopology.frontend_domain}` : "",
      api: apiTopology?.primary_api_url || "",
      auth: apiTopology?.primary_auth_url || "",
      media: apiTopology?.primary_media_url || "",
      telemetry: apiTopology?.primary_telemetry_url || "",
    },
    operations,
  };
}

function packageJson(context) {
  return {
    name: context.packageName,
    version: "0.1.0",
    private: true,
    type: "module",
    main: "dist/index.js",
    types: "dist/index.d.ts",
    scripts: {
      build: "tsc -p tsconfig.json",
      typecheck: "tsc -p tsconfig.json --noEmit",
    },
    devDependencies: {
      typescript: "^5.0.0",
    },
  };
}

function tsconfigJson() {
  return {
    compilerOptions: {
      target: "ES2020",
      module: "ES2020",
      moduleResolution: "Bundler",
      declaration: true,
      outDir: "dist",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
    },
    include: ["src/**/*.ts"],
  };
}

function readme(context) {
  return `# ${context.packageName}

Generated TypeScript SDK draft from SiteReconstructor passive capture evidence.

## Install

\`\`\`bash
npm install
npm run typecheck
\`\`\`

## Usage

\`\`\`ts
import { createSiteClient } from './src';

const client = createSiteClient({
  baseUrl: '${context.baseUrls.base || "https://example.test"}',
  apiBaseUrl: '${context.baseUrls.api || context.baseUrls.base || "https://example.test"}',
  accessToken: process.env.ACCESS_TOKEN,
  sessionCookie: process.env.SESSION_COOKIE,
});

// Example:
// const result = await client.${context.operations[0]?.operationName || "request"}({});
\`\`\`

## Notes

- Schemas and endpoint names are inferred drafts.
- Sensitive values are represented as options/placeholders and are not embedded.
- Review auth, cookies, CSRF, and request bodies before production use.
`;
}

function renderTypes(context) {
  const lines = [
    "export type Primitive = string | number | boolean | null;",
    "export type JsonValue = Primitive | JsonValue[] | { [key: string]: JsonValue };",
    "",
    "export interface SiteClientOptions {",
    "  baseUrl?: string;",
    "  apiBaseUrl?: string;",
    "  authBaseUrl?: string;",
    "  mediaBaseUrl?: string;",
    "  telemetryBaseUrl?: string;",
    "  accessToken?: string;",
    "  sessionCookie?: string;",
    "  csrfToken?: string;",
    "  defaultHeaders?: Record<string, string>;",
    "  fetchImpl?: typeof fetch;",
    "}",
    "",
    "export interface RequestOptions {",
    "  query?: Record<string, string | number | boolean | undefined>;",
    "  headers?: Record<string, string>;",
    "  signal?: AbortSignal;",
    "}",
    "",
  ];

  for (const op of context.operations) {
    lines.push(`export interface ${op.requestType} extends RequestOptions {`);
    if (["POST", "PUT", "PATCH"].includes(op.endpoint.method)) {
      lines.push(`  body?: ${schemaType(op.endpoint.request_schema)};`);
    }
    lines.push("}");
    lines.push(`export type ${op.responseType} = ${schemaType(op.endpoint.response_schema)};`);
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function renderClient(context) {
  return `import type { SiteClientOptions } from './types';
import { endpoints, type SiteEndpoints } from './endpoints';

export interface SiteClient extends SiteEndpoints {}

export function createSiteClient(options: SiteClientOptions = {}): SiteClient {
  const fetchImpl = options.fetchImpl || fetch;
  const baseUrls = {
    base: options.baseUrl || ${JSON.stringify(context.baseUrls.base || "https://example.test")},
    api: options.apiBaseUrl || ${JSON.stringify(context.baseUrls.api || context.baseUrls.base || "https://example.test")},
    auth: options.authBaseUrl || ${JSON.stringify(context.baseUrls.auth || context.baseUrls.api || context.baseUrls.base || "https://example.test")},
    media: options.mediaBaseUrl || ${JSON.stringify(context.baseUrls.media || context.baseUrls.base || "https://example.test")},
    telemetry: options.telemetryBaseUrl || ${JSON.stringify(context.baseUrls.telemetry || context.baseUrls.base || "https://example.test")},
  };

  return endpoints({
    fetchImpl,
    baseUrls,
    accessToken: options.accessToken,
    sessionCookie: options.sessionCookie,
    csrfToken: options.csrfToken,
    defaultHeaders: options.defaultHeaders || {},
  });
}
`;
}

function renderEndpoints(context) {
  const imports = context.operations.flatMap((op) => [op.requestType, op.responseType]);
  const lines = [
    `import type { ${imports.join(", ")} } from './types';`,
    "",
    "interface EndpointRuntime {",
    "  fetchImpl: typeof fetch;",
    "  baseUrls: Record<string, string>;",
    "  accessToken?: string;",
    "  sessionCookie?: string;",
    "  csrfToken?: string;",
    "  defaultHeaders: Record<string, string>;",
    "}",
    "",
    "async function request<T>(runtime: EndpointRuntime, baseKey: string, method: string, path: string, input: { query?: Record<string, unknown>; headers?: Record<string, string>; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {",
    "  const baseUrl = runtime.baseUrls[baseKey] || runtime.baseUrls.base;",
    "  const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);",
    "  for (const [key, value] of Object.entries(input.query || {})) {",
    "    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));",
    "  }",
    "  const headers: Record<string, string> = { ...runtime.defaultHeaders, ...(input.headers || {}) };",
    "  if (runtime.accessToken && !headers.Authorization) headers.Authorization = `Bearer ${runtime.accessToken}`;",
    "  if (runtime.sessionCookie && !headers.Cookie) headers.Cookie = runtime.sessionCookie;",
    "  if (runtime.csrfToken && !headers['X-CSRF-Token']) headers['X-CSRF-Token'] = runtime.csrfToken;",
    "  const init: RequestInit = { method, headers, signal: input.signal };",
    "  if (!['GET', 'HEAD'].includes(method) && input.body !== undefined) {",
    "    headers['Content-Type'] = headers['Content-Type'] || 'application/json';",
    "    init.body = typeof input.body === 'string' ? input.body : JSON.stringify(input.body);",
    "  }",
    "  const response = await runtime.fetchImpl(url, init);",
    "  const contentType = response.headers.get('content-type') || '';",
    "  const payload = contentType.includes('application/json') ? await response.json() : await response.text();",
    "  if (!response.ok) throw Object.assign(new Error(`HTTP ${response.status}`), { response, payload });",
    "  return payload as T;",
    "}",
    "",
    "export interface SiteEndpoints {",
  ];

  for (const op of context.operations) {
    lines.push(`  ${op.operationName}(input?: ${op.requestType}): Promise<${op.responseType}>;`);
  }
  lines.push("}");
  lines.push("");
  lines.push("export function endpoints(runtime: EndpointRuntime): SiteEndpoints {");
  lines.push("  return {");
  for (const op of context.operations) {
    const bodyValue = ["POST", "PUT", "PATCH"].includes(op.endpoint.method) ? "input.body" : "undefined";
    lines.push(`    ${op.operationName}: (input = {}) => request<${op.responseType}>(runtime, ${JSON.stringify(op.baseKey)}, ${JSON.stringify(op.endpoint.method)}, ${JSON.stringify(op.path)}, {`);
    lines.push(`      query: { ${queryEntries(op.endpoint.query_params || [])} ...(input.query || {}) },`);
    lines.push("      headers: input.headers,");
    lines.push(`      body: ${bodyValue},`);
    lines.push("      signal: input.signal,");
    lines.push("    }),");
  }
  lines.push("  };");
  lines.push("}");
  return `${lines.join("\n")}\n`;
}

function queryEntries(queryParams) {
  return queryParams.map((key) => `${JSON.stringify(key)}: input.query?.[${JSON.stringify(key)}],`).join(" ");
}

function schemaType(schema) {
  if (!schema) return "JsonValue";
  if (Array.isArray(schema)) return `${schemaType(schema[0])}[]`;
  if (typeof schema === "string") return primitiveType(schema);
  if (typeof schema !== "object") return "JsonValue";
  const entries = Object.entries(schema).slice(0, 80);
  if (!entries.length) return "{ [key: string]: JsonValue }";
  return `{\n${entries.map(([key, value]) => `  ${safeProperty(key)}?: ${schemaType(value)};`).join("\n")}\n}`;
}

function primitiveType(value) {
  const text = String(value || "").toLowerCase();
  if (/int|number|float|double|decimal|count|id/.test(text)) return "number";
  if (/bool/.test(text)) return "boolean";
  if (/array|list/.test(text)) return "JsonValue[]";
  if (/object|map|record/.test(text)) return "{ [key: string]: JsonValue }";
  if (/unknown|null/.test(text)) return "JsonValue";
  return "string";
}

function safeProperty(key) {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}

function flattenApiEndpoints(apiMap) {
  return (apiMap?.groups || []).flatMap((group) => group.endpoints || []);
}

function uniqueOperationName(endpoint, index) {
  const raw = `${String(endpoint.method || "GET").toLowerCase()} ${endpoint.path || endpoint.url || `endpoint-${index}`}`;
  const base = camel(raw.replace(/\{[^}]+\}|:[a-z0-9_]+/gi, " by id").replace(/[^a-z0-9]+/gi, " "));
  return base || `call${index}`;
}

function baseKey(endpoint) {
  if (endpoint.server_kind === "auth" || endpoint.category === "auth") return "auth";
  if (endpoint.server_kind === "media" || ["media", "upload"].includes(endpoint.category)) return "media";
  if (endpoint.server_kind === "telemetry" || endpoint.category === "telemetry") return "telemetry";
  if (endpoint.server_kind === "api" || /^\/method\//i.test(endpoint.path || "")) return "api";
  return "base";
}

function pathFromUrl(url) {
  try {
    return new URL(url, "https://local.invalid").pathname || "/";
  } catch {
    return String(url || "/").split("?")[0] || "/";
  }
}

function safeName(value) {
  return String(value || "site").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "site";
}

function camel(value) {
  const words = String(value || "").trim().split(/\s+/).filter(Boolean);
  return words.map((word, index) => {
    const lower = word.toLowerCase();
    return index === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join("").replace(/^[^A-Za-z_$]+/, "");
}

function pascal(value) {
  const text = camel(value);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function normalizeRelativePath(value) {
  return String(value || "").replace(/\\/g, "/");
}

module.exports = {
  writeTypeScriptSdkExport,
};
