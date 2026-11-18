// Render video: node render.mjs [--still t1,t2,...]
// Butuh: playwright (chromium), ffmpeg. Jalankan dari folder mana saja.
import { createRequire } from "node:module";
import { spawn, execFileSync } from "node:child_process";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = createRequire(import.meta.url)("playwright");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const FPS = 30, DUR = 60;
const OUT = path.join(ROOT, "assets/videos/langit-biru-tidak-tidur-60s.mp4");

// Potongan VO mentah -> posisi di video (detik). Sama dengan off() di timeline.js.
const SEGMENTS = [[0, 4.6, 0.6], [4.6, 29.7, 1.4], [29.7, 50.1, 2.4], [50.1, 54.4, 3.2]];

function buildAudio() {
  const out = path.join(HERE, "audio-final.mp3");
  const parts = SEGMENTS.map(([a, b, o], i) =>
    `[0:a]atrim=${a}:${b},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st=${(b - a - 0.04).toFixed(2)}:d=0.04,adelay=${Math.round((a + o) * 1000)}:all=1[s${i}]`);
  const mix = `${SEGMENTS.map((_, i) => `[s${i}]`).join("")}amix=inputs=${SEGMENTS.length}:normalize=0,apad=whole_dur=${DUR},atrim=0:${DUR},loudnorm=I=-16:TP=-1.5[a]`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(HERE, "vo-raw.mp3"), "-filter_complex", [...parts, mix].join(";"), "-map", "[a]", "-ar", "48000", "-b:a", "192k", out]);
  return out;
}

const MIME = { ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml", ".ttf": "font/ttf", ".mp3": "audio/mpeg" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on("pageerror", e => console.error("pageerror:", e.message));
await page.goto(`http://localhost:${port}/projects/langit-biru-tidak-tidur/index.html?render`);
await page.evaluate(() => window.READY);
const stage = page.locator("#stage");

const stillArg = process.argv.indexOf("--still");
if (stillArg > 0) {
  const dir = process.argv[stillArg + 2] || HERE;
  for (const t of process.argv[stillArg + 1].split(",").map(Number)) {
    // seek dari 0 berurutan agar state fromTo konsisten
    for (let x = 0; x <= t; x += 0.5) await page.evaluate(v => window.seek(v), x);
    await page.evaluate(v => window.seek(v), t);
    await stage.screenshot({ path: path.join(dir, `still-${String(t).padStart(5, "0")}.jpg`), type: "jpeg", quality: 80 });
  }
} else {
  const audio = buildAudio();
  const silent = path.join(HERE, ".frames.mp4");
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", silent], { stdio: ["pipe", "inherit", "inherit"] });
  const N = FPS * DUR;
  for (let f = 0; f < N; f++) {
    await page.evaluate(v => window.seek(v), f / FPS);
    const buf = await stage.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (f % 150 === 0) console.log(`frame ${f}/${N}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", silent, "-i", audio, "-c:v", "copy", "-af", "apad", "-c:a", "aac", "-b:a", "192k", "-t", String(DUR), "-movflags", "+faststart", OUT]);
  fs.unlinkSync(silent);
  console.log("selesai:", OUT);
}
await browser.close();
server.close();
