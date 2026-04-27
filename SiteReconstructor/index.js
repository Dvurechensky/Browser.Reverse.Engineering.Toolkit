#!/usr/bin/env node
"use strict";

const { runCli } = require("./src/reconstructor/cli");

runCli().catch((error) => {
  console.error(`[SiteReconstructor] ${error.stack || error.message}`);
  process.exitCode = 1;
});
