"use strict";

const fs = require("fs");
const path = require("path");

function safeRemoveGeneratedDir(rootDir, targetDir, allowedName) {
  const root = path.resolve(rootDir);
  const target = path.resolve(targetDir);
  if (!target.startsWith(`${root}${path.sep}`) || path.basename(target) !== allowedName) {
    throw new Error(`Refusing to remove generated directory outside report output: ${target}`);
  }
  if (fs.existsSync(target)) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      makeWritableRecursive(target);
      fs.rmSync(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      if (!fs.existsSync(target)) return;
    }
    throw new Error(`Failed to remove generated directory: ${target}`);
  }
}

function safeRemoveGeneratedFile(rootDir, targetFile, allowedNames) {
  const root = path.resolve(rootDir);
  const target = path.resolve(targetFile);
  const allowed = new Set(allowedNames || []);
  if (!target.startsWith(`${root}${path.sep}`) || !allowed.has(path.basename(target))) {
    throw new Error(`Refusing to remove generated file outside report output: ${target}`);
  }
  if (fs.existsSync(target)) {
    fs.rmSync(target, { force: true });
  }
}

function makeWritableRecursive(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  const stat = fs.lstatSync(targetPath);
  fs.chmodSync(targetPath, stat.mode | 0o600);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(targetPath)) {
      makeWritableRecursive(path.join(targetPath, entry));
    }
  }
}

module.exports = {
  safeRemoveGeneratedDir,
  safeRemoveGeneratedFile,
};
