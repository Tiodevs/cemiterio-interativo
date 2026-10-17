import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const root = fileURLToPath(new URL("..", import.meta.url));
const publicDir = join(root, "public");
const chrome =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".css": "text/css",
};

function startServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      const relative = normalize(decodeURIComponent(url.pathname))
        .replace(/^[/\\]+/, "")
        .replace(/^(\.\.[/\\])+/, "");
      const filePath = relative
        ? join(publicDir, relative)
        : join(root, "scripts/compile.html");
      if (relative && !filePath.startsWith(publicDir)) {
        res.writeHead(403);
        res.end("forbidden");
        return;
      }
      try {
        const body = await readFile(filePath);
        res.writeHead(200, {
          "Content-Type": types[extname(filePath)] ?? "application/octet-stream",
        });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end("not found");
      }
    });
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, port: address.port });
    });
  });
}

const { server, port } = await startServer();
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=metal"],
});

try {
  const page = await browser.newPage();
  page.setDefaultTimeout(120000);
  page.on("console", (message) => {
    console.log(`[chrome] ${message.text()}`);
  });
  page.on("pageerror", (error) => {
    console.error(`[chrome] ${error.message}`);
  });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle0" });
  await page.waitForFunction(() => window.__result || window.__error, {
    timeout: 120000,
  });
  const outcome = await page.evaluate(() => ({
    error: window.__error ?? null,
    png: window.__result?.png ?? null,
    mind: window.__result?.mind ?? null,
  }));
  if (outcome.error || !outcome.png || !outcome.mind) {
    throw new Error(outcome.error ?? "compilação sem arquivo");
  }
  await mkdir(join(publicDir, "markers"), { recursive: true });
  await mkdir(join(publicDir, "targets"), { recursive: true });
  await writeFile(
    join(publicDir, "markers/centro.png"),
    Buffer.from(outcome.png, "base64"),
  );
  await writeFile(
    join(publicDir, "targets/centro.mind"),
    Buffer.from(outcome.mind, "base64"),
  );
  console.log("brasão compilado em public/markers/centro.png e public/targets/centro.mind");
} finally {
  await browser.close();
  server.close();
}
