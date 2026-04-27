"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");

function serve(root, port) {
  const server = http.createServer((req, res) => {
    const requestPath = decodeURIComponent(new URL(req.url, `http://localhost:${port}`).pathname);
    const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
    const safePath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(root, safePath);
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    fs.readFile(filePath, (error, body) => {
      if (error) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": contentType(filePath) });
      res.end(body);
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`[SiteReconstructor] Serving http://localhost:${port}`);
      resolve();
    });
  });
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
  }[ext] || "application/octet-stream";
}

module.exports = {
  serve,
};
