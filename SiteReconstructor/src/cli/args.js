"use strict";

const path = require("path");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (current.startsWith("--")) {
      const key = current.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        args[key] = true;
      } else {
        args[key] = next;
        i += 1;
      }
    }
  }
  return args;
}

function printUsage() {
  console.log("Usage: node SiteReconstructor/index.js --input ./capture [--output ./reports/site] [--serve] [--assets] [--strict] [--port 5177]");
}

function defaultOutputDir(inputDir) {
  const base = path.basename(path.resolve(inputDir)).replace(/[^a-z0-9_-]+/gi, "_") || "report";
  return path.join(process.cwd(), "reports", base);
}

module.exports = {
  parseArgs,
  printUsage,
  defaultOutputDir,
};
