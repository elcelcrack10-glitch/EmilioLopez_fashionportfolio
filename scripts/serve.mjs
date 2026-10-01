import http from "node:http";
import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { createGzip } from "node:zlib";

const root = path.resolve("dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".json": "application/json",
  ".woff2": "font/woff2",
};
http
  .createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      let file = path.resolve(root, "." + pathname);
      if (file !== root && !file.startsWith(root + path.sep)) {
        res.writeHead(403).end();
        return;
      }
      let info = await stat(file);
      if (info.isDirectory()) {
        file = path.join(file, "index.html");
        info = await stat(file);
      }
      const headers = {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Accept-Ranges": "bytes",
        "Cache-Control":
          path.extname(file) === ".html" ? "no-cache" : "public, max-age=3600",
      };
      const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      if (range) {
        const start = Number(range[1]);
        const end = range[2]
          ? Math.min(Number(range[2]), info.size - 1)
          : info.size - 1;
        if (start > end || start >= info.size) {
          res.writeHead(416, { "Content-Range": `bytes */${info.size}` }).end();
          return;
        }
        res.writeHead(206, {
          ...headers,
          "Content-Range": `bytes ${start}-${end}/${info.size}`,
          "Content-Length": end - start + 1,
        });
        createReadStream(file, { start, end }).pipe(res);
      } else {
        const compress =
          /\.(html|css|js|json|svg)$/.test(file) &&
          req.headers["accept-encoding"]?.includes("gzip");
        if (compress) {
          res.writeHead(200, {
            ...headers,
            "Content-Encoding": "gzip",
            Vary: "Accept-Encoding",
          });
          if (req.method === "HEAD") res.end();
          else createReadStream(file).pipe(createGzip()).pipe(res);
        } else {
          res.writeHead(200, { ...headers, "Content-Length": info.size });
          if (req.method === "HEAD") res.end();
          else createReadStream(file).pipe(res);
        }
      }
    } catch {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      createReadStream(path.join(root, "404.html")).pipe(res);
    }
  })
  .listen(Number(process.env.PORT || 4173), "127.0.0.1", () =>
    console.log(`Portfolio: http://localhost:${process.env.PORT || 4173}`),
  );
