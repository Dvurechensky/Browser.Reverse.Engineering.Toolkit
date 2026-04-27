"use strict";

const path = require("path");
const { ensureDir, writeJson, writeText } = require("./fs");

function writeSessionSummary(config, authResult, crawlResult, outputs) {
  ensureDir(config.out);
  const summary = {
    schema: "site-crawler-snapshotter.session.v2",
    target: config.target,
    siteSlug: config.siteSlug,
    createdAt: new Date().toISOString(),
    profile: config.profile,
    output: config.out,
    auth: authResult,
    crawl: crawlResult,
    outputs: outputs || null,
    config: {
      auth: config.auth,
      crawl: config.crawl,
      snapshotter: config.snapshotter,
      browser: config.browser,
      paths: config.paths,
    },
  };
  const filePath = path.join(config.out, "session_manifest.json");
  writeJson(filePath, summary);
  writeText(path.join(config.out, "index.html"), buildSessionHtml(summary));
  return filePath;
}

function buildSessionHtml(summary) {
  const visited = summary.crawl?.visited || [];
  const capture = summary.outputs?.capture || null;
  const report = summary.outputs?.report || null;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SiteCrawlerSnapshotter Session</title>
  <style>
    :root{--bg:#f4efe6;--ink:#1f2937;--muted:#6b7280;--panel:#fffdf8;--line:#d6c7b2;--accent:#0f766e;--accent2:#b45309}
    *{box-sizing:border-box}body{margin:0;font-family:Georgia,"Times New Roman",serif;background:linear-gradient(180deg,#f8f3ea,#efe7d8);color:var(--ink)}
    main{max-width:1180px;margin:0 auto;padding:28px 22px 48px}.hero{display:grid;gap:12px;margin-bottom:24px}
    h1,h2{margin:0}p{margin:0;color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
    .panel,.metric,.row{background:var(--panel);border:1px solid var(--line);border-radius:8px}.panel{padding:18px}.metric{padding:14px}
    .label{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}.value{margin-top:8px;font-size:28px;color:var(--accent)}
    .list{display:grid;gap:10px;margin-top:12px}.row{padding:14px}.row a{color:var(--accent);text-decoration:none}.row a:hover{text-decoration:underline}
    .meta{font-family:Consolas,monospace;font-size:12px;color:var(--muted);overflow-wrap:anywhere}.badge{display:inline-block;padding:3px 8px;border-radius:999px;border:1px solid var(--line);font-size:12px;color:var(--accent2);margin-right:6px}
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <h1>SiteCrawlerSnapshotter Session</h1>
      <p>${escapeHtml(summary.target || "")}</p>
      <div class="meta">${escapeHtml(summary.createdAt || "")}</div>
    </section>
    <section class="grid">
      ${metric("Visited Pages", String(visited.length))}
      ${metric("Auth Mode", escapeHtml(summary.auth?.mode || summary.config?.auth?.mode || "unknown"))}
      ${metric("Capture Files", String(capture?.fileCount || 0))}
      ${metric("Final URL", escapeHtml(capture?.finalUrl || capture?.folder || ""))}
    </section>
    <section class="panel" style="margin-top:18px">
      <h2>Outputs</h2>
      <div class="list">
        ${capture ? `
          <article class="row">
            <div><span class="badge">capture</span>Single streaming capture</div>
            <div class="meta">${escapeHtml(capture.folder || "")}</div>
            <div><a href="${relativePath(summary.output, capture.folder)}">Open capture folder</a></div>
          </article>
        ` : `<div class="row">No capture generated.</div>`}
        ${report ? `
          <article class="row">
            <div><span class="badge">report</span>Reconstructed report</div>
            <div class="meta">${escapeHtml(report.output || "")}</div>
            <div><a href="${relativePath(summary.output, report.index)}">Open report</a></div>
          </article>
        ` : ``}
      </div>
    </section>
    <section class="panel" style="margin-top:18px">
      <h2>Visited Pages</h2>
      <div class="list">
        ${visited.map((item, index) => `
          <article class="row">
            <div><span class="badge">#${index + 1}</span>${escapeHtml(item.title || item.finalUrl || item.requestedUrl || "")}</div>
            <div class="meta">${escapeHtml(item.finalUrl || item.requestedUrl || "")}</div>
            <div class="meta">depth=${escapeHtml(String(item.depth || 0))} status=${escapeHtml(String(item.status || ""))} discovered=${escapeHtml(String(item.discoveredCount || 0))}</div>
          </article>
        `).join("") || `<div class="row">No visited pages were recorded.</div>`}
      </div>
    </section>
  </main>
</body>
</html>
`;
}

function metric(label, value) {
  return `<article class="metric"><div class="label">${label}</div><div class="value">${value}</div></article>`;
}

function relativePath(fromDir, toPath) {
  return path.relative(fromDir, toPath).replace(/\\/g, "/") || ".";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = {
  writeSessionSummary,
};
