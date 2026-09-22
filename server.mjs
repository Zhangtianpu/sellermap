import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8"
};

const send = (response, status, body, contentType = "text/plain; charset=utf-8") => {
  response.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store"
  });
  response.end(body);
};

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    const pathname = decodeURIComponent(requestUrl.pathname);
    let filePath = resolve(root, `.${pathname}`);

    if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
      send(response, 403, "Forbidden");
      return;
    }

    let fileStat = await stat(filePath).catch(() => null);
    if (fileStat?.isDirectory()) {
      filePath = resolve(filePath, "index.html");
      fileStat = await stat(filePath).catch(() => null);
    }

    if (!fileStat?.isFile()) {
      const notFoundPath = resolve(root, "404.html");
      const notFoundBody = await readFile(notFoundPath).catch(() => "404 - File not found");
      send(response, 404, notFoundBody, "text/html; charset=utf-8");
      return;
    }

    const body = await readFile(filePath);
    send(response, 200, body, mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream");
  } catch (error) {
    console.error(error);
    send(response, 500, "Internal server error");
  }
});

server.listen(port, host, () => {
  console.log(`SellerMap is running at http://${host}:${port}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
