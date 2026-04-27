"use strict";

const path = require("path");
const { ensureDir, safeFilePart, writeJson } = require("./fs");

async function captureSession(page, config, sessionMeta) {
  const result = await page.evaluate(async (options) => {
    if (!window.SiteSnapshotter) throw new Error("SiteSnapshotter is not available");
    if (window.SiteSnapshotter.watch) window.SiteSnapshotter.watch();
    return window.SiteSnapshotter.run(Object.assign({}, options, { download: false }));
  }, Object.assign({ mode: config.snapshotter.mode }, config.snapshotter.options));

  const screenshot = await tryScreenshot(page, config, result);
  const written = writeSessionPackage(result, config, screenshot, sessionMeta);
  return Object.assign({}, written, {
    url: page.url(),
    title: await page.title().catch(() => ""),
    screenshot,
    packSummary: {
      schema: result.schema,
      version: result.version,
      mode: result.mode,
      createdAt: result.createdAt,
      fileCount: Object.keys(result.files || {}).length,
      errors: result.meta?.errors || [],
    },
    files: result.files || {},
  });
}

function writeSessionPackage(pack, config, screenshot, sessionMeta) {
  const createdAt = pack.createdAt || new Date().toISOString();
  const stamp = createdAt.replace(/[:.]/g, "-");
  const folder = path.join(config.out, "session", stamp);
  ensureDir(folder);

  const prefix = `captures__${config.siteSlug}__${stamp}`;
  const files = pack.files || {};
  Object.entries(files).forEach(([fileName, data]) => {
    writeJson(path.join(folder, `${prefix}__${fileName}`), data);
  });

  const manifest = {
    target: config.target,
    finalUrl: sessionMeta.finalUrl || config.target,
    createdAt,
    captureRoot: pack.captureRoot,
    files: Object.keys(files).map((fileName) => `${prefix}__${fileName}`),
    screenshot,
    snapshotter: {
      schema: pack.schema,
      version: pack.version,
      mode: pack.mode,
      durationMs: pack.meta?.durationMs || null,
      errors: pack.meta?.errors || [],
    },
    crawler: sessionMeta,
  };

  writeJson(path.join(folder, `${prefix}__manifest.json`), manifest);
  writeJson(path.join(folder, `${prefix}__crawler_session.json`), sessionMeta);
  return { folder, manifest };
}

async function tryScreenshot(page, config, pack) {
  const stamp = (pack.createdAt || new Date().toISOString()).replace(/[:.]/g, "-");
  const fileName = `${safeFilePart(config.siteSlug)}__${stamp}.png`;
  const filePath = path.join(config.out, "session", stamp, fileName);
  ensureDir(path.dirname(filePath));
  try {
    await page.screenshot({ path: filePath, fullPage: true });
    return filePath;
  } catch {
    return null;
  }
}

module.exports = {
  captureSession,
};
