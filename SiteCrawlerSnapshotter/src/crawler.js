"use strict";

const { CrawlQueue, normalizeUrl, allowedUrl } = require("./queue");
const { waitForPageReady } = require("./browser");
const { discoverLinks } = require("./discovery");

async function crawlSite(page, config) {
  const seed = normalizeUrl(config.target, config.target);
  const queue = new CrawlQueue(seed);
  const visited = [];
  const errors = [];
  const queueEvents = [];

  while (queue.length && visited.length < config.crawl.maxPages) {
    const item = queue.shift();
    if (!item || item.depth > config.crawl.maxDepth) continue;

    console.log(`[SiteCrawlerSnapshotter] Visiting ${visited.length + 1}/${config.crawl.maxPages}: ${item.url}`);
    try {
      const response = await page.goto(item.url, { waitUntil: config.crawl.waitUntil, timeout: 45000 }).catch((error) => {
        errors.push({ url: item.url, phase: "goto", message: error.message });
        return null;
      });
      await waitForPageReady(page, config);
      const finalUrl = page.url();

      if (!allowedUrl(finalUrl, config)) {
        console.log(`[SiteCrawlerSnapshotter] Skipping cross/denied final URL: ${finalUrl}`);
        continue;
      }

      const discovered = await discoverLinks(page, null, config);
      let enqueued = 0;
      for (const link of discovered) {
        if (queue.push(link.url, item.depth + 1, link.source)) {
          enqueued += 1;
          queueEvents.push({ url: link.url, depth: item.depth + 1, source: link.source, discoveredFrom: finalUrl });
        }
      }

      visited.push({
        requestedUrl: item.url,
        finalUrl,
        title: await page.title().catch(() => ""),
        depth: item.depth,
        source: item.source,
        status: response ? response.status() : null,
        discoveredCount: discovered.length,
        enqueuedCount: enqueued,
        at: new Date().toISOString(),
      });
      console.log(`[SiteCrawlerSnapshotter] Visited ${finalUrl}, discovered ${discovered.length}, queued ${enqueued}.`);
    } catch (error) {
      errors.push({ url: item.url, phase: "crawl", message: error.stack || error.message });
      console.warn(`[SiteCrawlerSnapshotter] Crawl step failed: ${item.url}: ${error.message}`);
    }
  }

  return {
    target: config.target,
    capturedAt: new Date().toISOString(),
    visited,
    queueEvents,
    errors,
    limits: {
      maxPages: config.crawl.maxPages,
      maxDepth: config.crawl.maxDepth,
    },
  };
}

module.exports = {
  crawlSite,
};
