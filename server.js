// Zero-dependency OCTO test proxy. Requires Node 18+.
// Usage: OCTO_API_KEY=xxxx node server.js   (then open http://localhost:3000)
const http = require("http");
const fs = require("fs");
const path = require("path");

// Minimal .env loader (no dependencies). Real env vars take precedence.
try {
  for (const line of fs.readFileSync(path.join(__dirname, ".env"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !line.trim().startsWith("#") && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const PORT = process.env.PORT || 3000;
const DEFAULT_ENDPOINT = process.env.OCTO_ENDPOINT || "https://api.ventrata.com/octo";
const DEFAULT_KEY = process.env.OCTO_API_KEY || "";

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/" || url.pathname === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(fs.readFileSync(path.join(__dirname, "index.html")));
  }

  if (url.pathname === "/config") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ endpoint: DEFAULT_ENDPOINT, hasKey: !!DEFAULT_KEY }));
  }

  if (url.pathname.startsWith("/proxy/")) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = Buffer.concat(chunks);
    const endpoint = (req.headers["x-octo-endpoint"] || DEFAULT_ENDPOINT).replace(/\/$/, "");
    const key = req.headers["x-octo-key"] || DEFAULT_KEY;
    const target = endpoint + url.pathname.replace("/proxy", "") + url.search;
    const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
    if (req.headers["x-octo-capabilities"]) headers["Octo-Capabilities"] = req.headers["x-octo-capabilities"];
    const started = Date.now();
    try {
      const r = await fetch(target, {
        method: req.method,
        headers,
        body: ["GET", "HEAD"].includes(req.method) || !body.length ? undefined : body,
      });
      const text = await r.text();
      res.writeHead(200, { "Content-Type": "application/json" });
      let parsed; try { parsed = JSON.parse(text); } catch { parsed = text; }
      return res.end(JSON.stringify({ status: r.status, ms: Date.now() - started, target, body: parsed }));
    } catch (e) {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: 0, ms: Date.now() - started, target, body: { error: String(e) } }));
    }
  }

  res.writeHead(404); res.end("Not found");
}).listen(PORT, () => console.log(`OCTO tester running at http://localhost:${PORT}`));
