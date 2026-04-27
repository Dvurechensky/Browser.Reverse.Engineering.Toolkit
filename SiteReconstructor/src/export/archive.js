"use strict";

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

function compressArchive(sourcePath, archivePath) {
  ensureDir(path.dirname(archivePath));
  const powershell = process.platform === "win32" ? "powershell.exe" : "pwsh";
  const command = `Compress-Archive -LiteralPath ${powerShellLiteral(sourcePath)} -DestinationPath ${powerShellLiteral(archivePath)} -Force`;
  const result = childProcess.spawnSync(
    powershell,
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command],
    { encoding: "utf8", timeout: 5 * 60 * 1000 }
  );
  if (result.error) return { ok: false, error: result.error.message };
  if (result.status !== 0) return { ok: false, error: String(result.stderr || result.stdout || `exit ${result.status}`).trim() };
  return { ok: true };
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function powerShellLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

module.exports = {
  compressArchive,
};
