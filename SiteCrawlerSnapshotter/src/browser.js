"use strict";

const fs = require("fs");
const { ensureDir, readText } = require("./fs");

async function launchBrowser(config) {
  const { chromium } = require("playwright");
  ensureDir(config.profile);
  const context = await chromium.launchPersistentContext(config.profile, {
    headless: config.browser.headless,
    slowMo: config.browser.slowMo,
    viewport: { width: 1440, height: 1000 },
    acceptDownloads: true,
  });
  await installSnapshotter(context, config);
  return context;
}

async function installSnapshotter(context, config) {
  if (!fs.existsSync(config.paths.snapshotter)) {
    throw new Error(`SiteSnapshotter injector not found: ${config.paths.snapshotter}`);
  }
  const source = readText(config.paths.snapshotter);
  await context.addInitScript({ content: source });
  await context.addInitScript({
    content: `
      (() => {
        window.__SiteCrawlerSnapshotter = window.__SiteCrawlerSnapshotter || { installedAt: new Date().toISOString(), navigations: [], autoWatch: ${JSON.stringify(config.auth.startCapture !== "after-login")} };
        window.addEventListener("DOMContentLoaded", () => {
          window.__SiteCrawlerSnapshotter.navigations.push({ url: location.href, at: new Date().toISOString(), type: "domcontentloaded" });
          if (window.__SiteCrawlerSnapshotter.autoWatch && window.SiteSnapshotter && window.SiteSnapshotter.watch) {
            try { window.SiteSnapshotter.watch(); } catch (error) {}
          }
        });
      })();
    `,
  });
}

async function ensureSnapshotterOnPage(page) {
  return page.evaluate(() => {
    if (window.__SiteCrawlerSnapshotter && window.__SiteCrawlerSnapshotter.autoWatch && window.SiteSnapshotter && window.SiteSnapshotter.watch) {
      window.SiteSnapshotter.watch();
      return { ok: true, version: window.SiteSnapshotter.version || null };
    }
    return { ok: false, error: "SiteSnapshotter is not available on page" };
  }).catch((error) => ({ ok: false, error: error.message }));
}

async function waitForPageReady(page, config) {
  await page.waitForLoadState(config.crawl.waitUntil).catch(() => {});
  await page.waitForTimeout(config.crawl.settleMs);
  await ensureSnapshotterOnPage(page);
}

async function startRecording(page) {
  return page.evaluate(() => {
    window.__SiteCrawlerSnapshotter = window.__SiteCrawlerSnapshotter || {};
    window.__SiteCrawlerSnapshotter.autoWatch = true;
    if (window.SiteSnapshotter && window.SiteSnapshotter.watch) {
      window.SiteSnapshotter.watch();
      return { ok: true };
    }
    return { ok: false, error: "SiteSnapshotter is not available on page" };
  }).catch((error) => ({ ok: false, error: error.message }));
}

async function stopRecording(page) {
  return page.evaluate(() => {
    window.__SiteCrawlerSnapshotter = window.__SiteCrawlerSnapshotter || {};
    window.__SiteCrawlerSnapshotter.autoWatch = false;
    if (window.SiteSnapshotter && window.SiteSnapshotter.stop) {
      window.SiteSnapshotter.stop();
      return { ok: true };
    }
    return { ok: false, error: "SiteSnapshotter.stop is not available on page" };
  }).catch((error) => ({ ok: false, error: error.message }));
}

module.exports = {
  launchBrowser,
  ensureSnapshotterOnPage,
  waitForPageReady,
  startRecording,
  stopRecording,
};
