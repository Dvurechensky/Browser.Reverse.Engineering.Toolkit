"use strict";

const { spawn } = require("child_process");
const fs = require("fs");

async function runReconstructor(config, captureFolder) {
  if (!config.reconstruct) return null;
  if (!fs.existsSync(config.paths.reconstructor)) {
    throw new Error(`SiteReconstructor entry not found: ${config.paths.reconstructor}`);
  }
  const args = [
    config.paths.reconstructor,
    "--input",
    captureFolder,
    "--output",
    config.paths.reports,
  ];
  console.log(`[SiteCrawlerSnapshotter] Running Reconstructor: node ${args.join(" ")}`);
  await spawnNode(args);
  return {
    input: captureFolder,
    output: config.paths.reports,
    index: `${config.paths.reports}/index.html`,
  };
}

function spawnNode(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      stdio: "inherit",
      shell: false,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Reconstructor exited with code ${code}`));
    });
  });
}

module.exports = {
  runReconstructor,
};
