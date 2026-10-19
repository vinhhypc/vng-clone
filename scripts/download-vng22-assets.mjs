// Downloads the assets used by the VNG22 homepage clone into public/sites/vng22/.
// Usage: node scripts/download-vng22-assets.mjs
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "sites", "vng22");
const origin = "https://0909.vng.com.vn";
const blob = "https://cpzqnhw1cy9ug4hx.public.blob.vercel-storage.com";

const survivors = JSON.parse(
  await readFile(join(root, "docs/research/vng22/data/api-survivors.json"), "utf8"),
).items;
const contest = JSON.parse(
  await readFile(join(root, "docs/research/vng22/data/api-contest-videos.json"), "utf8"),
).items;

const momentIds = ["316", "341", "37", "07", "191", "158", "60", "376", "394", "333"];

/** [source URL, local path relative to public/sites/vng22] */
const jobs = [
  ...[
    "/brand/logo-wordmark.webp",
    "/video/hero.webm",
    "/video/hero-poster.webp",
    "/video/hero-logo.webp",
    "/video/hero-logo-still.webp",
    "/founder/bg.webp",
    "/founder/minh.webp",
    "/ripple/plate-a.webp",
    "/ripple/plate-b.webp",
    "/ripple/plate-c.webp",
    "/ripple/plate-d.webp",
    "/celebrate/hoi-thao.webp",
    "/celebrate/run-your-22.webp",
    "/celebrate/ai-video-contest.webp",
    "/celebrate/esports.webp",
    "/celebrate/22-dieu.webp",
    "/survivors/bg.png",
    "/survivors/bg-highlight.png",
    "/survivors/logo-survivor.webp",
    "/frames/frame-1x1.webp",
    "/frames/frame-9x16.webp",
    "/fonts/google-sans-flex-400.woff2",
    "/fonts/google-sans-flex-700.woff2",
    "/fonts/svn-gilroy-400.woff2",
    "/fonts/svn-gilroy-500.woff2",
    "/fonts/svn-gilroy-700.woff2",
    "/icon.png",
    "/apple-icon.png",
  ].map((p) => [origin + p, p]),
  ...survivors.map((s) => [origin + s.image, s.image]),
  [`${blob}/vng22-film/loop-vi.mp4`, "/film/loop-vi.mp4"],
  [`${blob}/vng22-film/poster-vi.webp`, "/film/poster-vi.webp"],
  ...momentIds.map((id) => [`${blob}/moments/thumb/${id}.webp`, `/moments/${id}.webp`]),
  ...contest.map((c) => [c.thumbnailUrl, `/contest/${c.id}${c.thumbnailUrl.match(/\.\w+$/)[0]}`]),
];

async function exists(path) {
  try {
    return (await stat(path)).size > 0;
  } catch {
    return false;
  }
}

const failures = [];
let next = 0;
async function worker() {
  while (next < jobs.length) {
    const [url, rel] = jobs[next++];
    const dest = join(out, rel);
    if (await exists(dest)) continue;
    try {
      const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, Buffer.from(await res.arrayBuffer()));
    } catch (err) {
      failures.push(`${url} -> ${rel}: ${err.message}`);
    }
  }
}

await Promise.all(Array.from({ length: 8 }, worker));
console.log(`${jobs.length - failures.length}/${jobs.length} assets present in ${out}`);
if (failures.length) {
  console.log("Failed:\n" + failures.join("\n"));
  process.exitCode = 1;
}
