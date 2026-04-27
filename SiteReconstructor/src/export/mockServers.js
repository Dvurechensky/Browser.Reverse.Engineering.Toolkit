"use strict";

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const { compressArchive } = require("./archive");
const { safeRemoveGeneratedDir, safeRemoveGeneratedFile } = require("../fs/safeRemove");

function materializeDotnetifyMockServers(outputDir, swaggerDir, dotnetMockDir, data) {
  const scriptsDir = path.resolve(__dirname, "..", "..", "..", "scripts");
  const builderSource = path.join(scriptsDir, "dotnet_builder.ps1");
  const dotnetifySource = path.join(scriptsDir, "Dotnetify.exe");
  const builderTarget = path.join(swaggerDir, "dotnet_builder.ps1");
  const dotnetifyTarget = path.join(swaggerDir, "Dotnetify.exe");
  const workDir = path.join(path.dirname(dotnetMockDir), ".mock-servers-build");
  const bundlePath = path.join(path.dirname(dotnetMockDir), "mock-servers.zip");
  const outputRelative = (filePath) => normalizeRelativePath(path.relative(outputDir, filePath));
  const projectPrefix = dotnetProjectPrefix(data?.normalized?.site);
  const result = {
    status: "skipped",
    generator: "Dotnetify",
    project_prefix: projectPrefix,
    script: outputRelative(builderTarget),
    executable: outputRelative(dotnetifyTarget),
    archives: [],
    bundle: null,
    warnings: [],
  };

  if (!fs.existsSync(builderSource) || !fs.existsSync(dotnetifySource)) {
    result.warnings.push("scripts/dotnet_builder.ps1 or scripts/Dotnetify.exe was not found");
    writeJson(path.join(dotnetMockDir, "manifest.json"), result);
    return result;
  }

  try {
    removeGeneratedMockArchives(dotnetMockDir);
    safeRemoveGeneratedFile(outputDir, bundlePath, ["mock-servers.zip"]);
    fs.copyFileSync(builderSource, builderTarget);
    fs.copyFileSync(dotnetifySource, dotnetifyTarget);
    safeRemoveGeneratedDir(outputDir, workDir, ".mock-servers-build");
    ensureDir(workDir);
    fs.copyFileSync(builderSource, path.join(workDir, "dotnet_builder.ps1"));
    fs.copyFileSync(dotnetifySource, path.join(workDir, "Dotnetify.exe"));
    for (const fileName of fs.readdirSync(swaggerDir)) {
      if (/^swagger-[^.]+\.json$/i.test(fileName)) {
        fs.copyFileSync(path.join(swaggerDir, fileName), path.join(workDir, fileName));
      }
    }
  } catch (error) {
    result.status = "copy_failed";
    result.warnings.push(error.message);
    writeJson(path.join(dotnetMockDir, "manifest.json"), result);
    return result;
  }

  const powershell = process.platform === "win32" ? "powershell.exe" : "pwsh";
  const generatedDir = path.join(workDir, "Output");
  const generation = childProcess.spawnSync(
    powershell,
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path.join(workDir, "dotnet_builder.ps1"), "-Project", projectPrefix],
    { cwd: workDir, encoding: "utf8", timeout: 10 * 60 * 1000 }
  );

  result.exit_code = generation.status;
  if (generation.error) result.warnings.push(generation.error.message);
  if (generation.stderr) result.warnings.push(generation.stderr.trim());
  result.log = String(generation.stdout || "").split(/\r?\n/).filter(Boolean).slice(-80);

  const projectDirs = fs.existsSync(generatedDir)
    ? fs.readdirSync(generatedDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(generatedDir, entry.name))
      .filter((dir) => fs.existsSync(path.join(dir, "Program.cs")) || fs.readdirSync(dir).some((name) => /\.csproj$/i.test(name)))
    : [];

  for (const projectDir of projectDirs) {
    const archivePath = path.join(dotnetMockDir, `${safeExportFileName(path.basename(projectDir))}.zip`);
    const zipped = compressArchive(projectDir, archivePath);
    if (zipped.ok) {
      result.archives.push(outputRelative(archivePath));
    } else {
      result.warnings.push(`Failed to archive ${path.basename(projectDir)}: ${zipped.error}`);
    }
  }

  if (!result.archives.length) {
    result.archives = collectArchiveEntries(dotnetMockDir, outputRelative);
  }

  if (result.archives.length) {
    const bundled = compressArchive(dotnetMockDir, bundlePath);
    if (bundled.ok) {
      result.bundle = outputRelative(bundlePath);
      result.status = generation.status === 0 ? "ready" : "generated_with_warnings";
    } else {
      result.status = "archives_ready_bundle_failed";
      result.warnings.push(`Failed to create all-servers archive: ${bundled.error}`);
    }
  } else {
    result.status = generation.status === 0 ? "no_projects" : "generation_failed";
  }

  safeRemoveGeneratedDir(outputDir, workDir, ".mock-servers-build");
  safeRemoveGeneratedDir(outputDir, path.join(swaggerDir, "Output"), "Output");
  safeRemoveGeneratedFile(outputDir, builderTarget, ["dotnet_builder.ps1", "Dotnetify.exe"]);
  safeRemoveGeneratedFile(outputDir, dotnetifyTarget, ["dotnet_builder.ps1", "Dotnetify.exe"]);
  writeJson(path.join(dotnetMockDir, "manifest.json"), result);
  return result;
}

function dotnetProjectPrefix(site) {
  const host = String(site?.host || hostFromMaybeUrl(site?.url) || "Mock");
  const prefixSource = meaningfulHostLabel(host);
  const prefix = titleCase(prefixSource.replace(/[^a-z0-9]+/gi, " ")).replace(/[^a-z0-9]/gi, "");
  return /^[A-Za-z]/.test(prefix) ? prefix : `Site${prefix || "Mock"}`;
}

function meaningfulHostLabel(host) {
  const labels = String(host || "")
    .toLowerCase()
    .split(".")
    .filter(Boolean);
  const ignored = new Set(["www", "app", "m", "mobile", "web", "site"]);
  const filtered = labels.filter((label) => !ignored.has(label));
  if (filtered.length >= 2 && filtered[filtered.length - 1].length <= 3) {
    return filtered[0] || "mock";
  }
  return filtered[0] || labels[0] || "mock";
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function safeExportFileName(name) {
  return String(name || "untitled").replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");
}

function titleCase(value) {
  return String(value || "unknown")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeRelativePath(value) {
  return String(value || "").replace(/\\/g, "/");
}

function removeGeneratedMockArchives(dotnetMockDir) {
  if (!fs.existsSync(dotnetMockDir)) return;
  for (const fileName of fs.readdirSync(dotnetMockDir)) {
    if (/\.zip$/i.test(fileName)) {
      fs.rmSync(path.join(dotnetMockDir, fileName), { force: true });
    }
  }
}

function collectArchiveEntries(dotnetMockDir, outputRelative) {
  if (!fs.existsSync(dotnetMockDir)) return [];
  return fs.readdirSync(dotnetMockDir)
    .filter((fileName) => /\.zip$/i.test(fileName))
    .sort((a, b) => a.localeCompare(b))
    .map((fileName) => outputRelative(path.join(dotnetMockDir, fileName)));
}

function hostFromMaybeUrl(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

module.exports = {
  materializeDotnetifyMockServers,
};
