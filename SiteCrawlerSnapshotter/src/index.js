#!/usr/bin/env node
"use strict";

const fs = require("fs");
const { parseArgs, mergeConfig, printUsage } = require("./cli");
const { readJson } = require("./fs");
const { launchBrowser, waitForPageReady, startRecording, stopRecording } = require("./browser");
const { handleAuth } = require("./auth");
const { crawlSite } = require("./crawler");
const { captureSession } = require("./capture");
const { runReconstructor } = require("./reconstructor");
const { writeSessionSummary } = require("./session");

main().catch((error) => {
  console.error(`[SiteCrawlerSnapshotter] ${error.stack || error.message}`);
  process.exitCode = 1;
});

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return;
  }

  const fileConfig = args.config ? readJson(args.config) : {};
  const config = mergeConfig(args, fileConfig);
  if (!fs.existsSync(config.paths.snapshotter)) {
    throw new Error(`Snapshotter injector not found: ${config.paths.snapshotter}`);
  }

  console.log(`[SiteCrawlerSnapshotter] Target: ${config.target}`);
  console.log(`[SiteCrawlerSnapshotter] Profile: ${config.profile}`);
  console.log(`[SiteCrawlerSnapshotter] Output: ${config.out}`);

  const context = await launchBrowser(config);
  const page = context.pages()[0] || await context.newPage();
  const navEvents = [];
  const httpEvents = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) navEvents.push({ url: frame.url(), at: new Date().toISOString() });
  });
  page.on("response", (response) => {
    const status = response.status();
    if (status >= 300 && status < 400 || response.request().isNavigationRequest()) {
      const from = response.request().redirectedFrom();
      httpEvents.push({
        url: response.url(),
        status,
        redirectedFrom: from ? from.url() : null,
        at: new Date().toISOString(),
      });
    }
  });

  try {
    await page.goto(config.target, { waitUntil: config.crawl.waitUntil, timeout: 45000 }).catch((error) => {
      console.warn(`[SiteCrawlerSnapshotter] Initial navigation warning: ${error.message}`);
    });
    await waitForPageReady(page, config);
    if (config.auth.startCapture === "after-login") {
      await stopRecording(page);
    } else {
      await startRecording(page);
    }
    const authResult = await handleAuth(page, config);
    if (config.auth.startCapture === "after-login") {
      await startRecording(page);
    }

    if (config.loginOnly) {
      console.log("[SiteCrawlerSnapshotter] Login profile saved. No session capture requested.");
      const manifestPath = writeSessionSummary(config, authResult, emptyCrawlResult(config), null);
      console.log(`[SiteCrawlerSnapshotter] Session manifest: ${manifestPath}`);
      return;
    }

    const crawlResult = config.crawl.enabled
      ? await crawlSite(page, config)
      : emptyCrawlResult(config);
    crawlResult.navigations = navEvents;
    crawlResult.httpEvents = httpEvents;

    const sessionCapture = await captureSession(page, config, {
      target: config.target,
      finalUrl: page.url(),
      auth: authResult,
      visited: crawlResult.visited || [],
      queueEvents: crawlResult.queueEvents || [],
      navigationEvents: navEvents,
      httpEvents,
      errors: crawlResult.errors || [],
      limits: crawlResult.limits || {},
    });

    const reconstruction = await runReconstructor(config, sessionCapture.folder);
    const manifestPath = writeSessionSummary(config, authResult, crawlResult, {
      capture: {
        folder: sessionCapture.folder,
        screenshot: sessionCapture.screenshot,
        finalUrl: sessionCapture.url,
        fileCount: sessionCapture.packSummary.fileCount,
        errors: sessionCapture.packSummary.errors,
      },
      report: reconstruction,
    });

    console.log(`[SiteCrawlerSnapshotter] Session manifest: ${manifestPath}`);
    console.log(`[SiteCrawlerSnapshotter] Session capture: ${sessionCapture.folder}`);
    if (reconstruction) console.log(`[SiteCrawlerSnapshotter] Report: ${reconstruction.index}`);
  } finally {
    await context.close();
  }
}

function emptyCrawlResult(config) {
  return {
    target: config.target,
    capturedAt: new Date().toISOString(),
    visited: [],
    queueEvents: [],
    errors: [],
    limits: {
      maxPages: config.crawl.maxPages,
      maxDepth: config.crawl.maxDepth,
    },
  };
}
