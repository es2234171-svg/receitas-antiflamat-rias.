const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = 8000;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

process.on("uncaughtException", (error) => {
  console.error("[local-server] uncaughtException:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("[local-server] unhandledRejection:", error);
});

const server = http.createServer((request, response) => {
  try {
    let urlPath = decodeURIComponent(request.url.split("?")[0]);
    if (urlPath === "/") urlPath = "/index.html";

    const filePath = path.resolve(root, "." + urlPath);
    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(404, {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store"
        });
        response.end("Not found");
        return;
      }

      response.writeHead(200, {
        "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        "Surrogate-Control": "no-store"
      });
      response.end(data);
    });
  } catch (error) {
    response.writeHead(500, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    });
    response.end("Server error");
    console.error("[local-server] request error:", error);
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`[local-server] Port ${port} is already in use.`);
      return;
    }
  console.error("[local-server] server error:", error);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`[local-server] http://127.0.0.1:${port}/`);
});
