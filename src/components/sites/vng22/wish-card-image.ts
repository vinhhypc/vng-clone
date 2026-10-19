import { ASSET } from "./constants";

type CardWish = { id?: number; name: string; text: string; image_url?: string };
type TextBlock = { fontSize: number; lines: string[]; lineHeight: number; height: number };

const W = 1080;
const H = 1920;
const FONT = '"Google Sans Flex", "Google Sans", system-ui, sans-serif';
const LOGO_RATIO = 1200 / 721;

/** Greedy word wrap that also breaks words longer than the line. */
function wrapText(text: string, maxWidth: number, size: number, measure: (s: string, size: number) => number) {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (measure(candidate, size) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      if (measure(word, size) > maxWidth) {
        let part = "";
        for (const ch of word) {
          if (measure(part + ch, size) <= maxWidth) part += ch;
          else {
            if (part) lines.push(part);
            part = ch;
          }
        }
        line = part;
      } else line = word;
    }
    if (line) lines.push(line);
  }
  return lines;
}

/** Largest font size (54 → 26) whose wrapped text fits the box. */
function fitText(text: string, maxWidth: number, maxHeight: number, measure: (s: string, size: number) => number) {
  let best: TextBlock | null = null;
  for (let size = 54; size >= 26; size -= 2) {
    const lines = wrapText(text, maxWidth, size, measure);
    const lineHeight = Math.round(1.42 * size);
    best = { fontSize: size, lines, lineHeight, height: lines.length * lineHeight };
    if (best.height <= maxHeight) return best;
  }
  return best as TextBlock;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const iw = img.width * scale;
  const ih = img.height * scale;
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}

async function renderCard(wish: CardWish) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");
  await document.fonts?.ready;

  const [plate, logo, photo] = await Promise.all([
    loadImage(`${ASSET}/ripple/plate-hero.webp`).catch(() => null),
    loadImage(`${ASSET}/brand/logo-lockup.webp`).catch(() => null),
    wish.image_url ? loadImage(wish.image_url).catch(() => null) : Promise.resolve(null),
  ]);
  const measure = (s: string, size: number) => {
    ctx.font = `500 ${size}px ${FONT}`;
    return ctx.measureText(s).width;
  };
  const ratio = logo ? logo.width / logo.height : LOGO_RATIO;
  const logoBox = { x: 360, y: 72, w: 360, h: Math.round(360 / (ratio > 0 ? ratio : LOGO_RATIO)) };

  const css = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  const colors = {
    paper: token("--color-paper", "#ffffff"),
    ink: token("--color-ink", "#0a0a0a"),
    onInvert: token("--color-on-invert", "#ffffff"),
    inkBrand: token("--color-ink-brand", "#003e89"),
    sunken: token("--color-surface-sunken", "#f5f5f5"),
  };

  ctx.fillStyle = colors.sunken;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  roundRect(ctx, 0, 0, W, H, 56);
  ctx.clip();
  ctx.fillStyle = colors.paper;
  ctx.fillRect(0, 0, W, H);
  if (plate) cover(ctx, plate, 0, 0, W, H);

  let text: TextBlock & { x: number; y: number };
  let nameAt: { x: number; y: number };
  if (photo) {
    // Photo card: full-bleed photo, darkened bottom, white text.
    cover(ctx, photo, 0, 0, W, H);
    const top = ctx.createLinearGradient(0, 0, 0, 520);
    top.addColorStop(0, "rgb(255 255 255 / 0.82)");
    top.addColorStop(0.55, "rgb(255 255 255 / 0.35)");
    top.addColorStop(1, "rgb(255 255 255 / 0)");
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, W, 520);
    const block = fitText(wish.text, 936, 640, measure);
    const y = 1786 - block.height;
    text = { ...block, x: 72, y };
    nameAt = { x: 72, y: 1848 };
    const fadeTop = Math.max(0, y - 220);
    const shade = ctx.createLinearGradient(0, fadeTop, 0, H);
    shade.addColorStop(0, "rgb(0 0 0 / 0)");
    shade.addColorStop(0.45, "rgb(0 0 0 / 0.55)");
    shade.addColorStop(1, "rgb(0 0 0 / 0.88)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, fadeTop, W, H - fadeTop);
  } else {
    // Quote card: white rounded box centred under the logo.
    const block = fitText(wish.text, 840, 960, measure);
    const boxH = 48 + block.height + 30 + 32 + 48;
    const minY = logoBox.y + logoBox.h + 56;
    const boxY = Math.max(minY, Math.round(minY + (1848 - minY - boxH) / 2));
    const y = boxY + 48;
    text = { ...block, x: 120, y };
    nameAt = { x: 120, y: y + block.height + 30 + 32 };
    ctx.save();
    roundRect(ctx, 72, boxY, 936, boxH, 32);
    ctx.fillStyle = colors.paper;
    ctx.fill();
    ctx.restore();
  }

  if (logo) ctx.drawImage(logo, logoBox.x, logoBox.y, logoBox.w, logoBox.h);
  ctx.fillStyle = photo ? colors.onInvert : colors.ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = `500 ${text.fontSize}px ${FONT}`;
  text.lines.forEach((line, i) => ctx.fillText(line, text.x, text.y + i * text.lineHeight));
  ctx.fillStyle = photo ? colors.onInvert : colors.inkBrand;
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 32px ${FONT}`;
  ctx.fillText(`— ${wish.name}`, nameAt.x, nameAt.y);
  ctx.restore();

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("canvas.toBlob returned null"))), "image/jpeg", 0.8),
  );
}

/** Render a 1080×1920 story card for a wish and download it as JPEG. */
export async function downloadWishCard(wish: CardWish) {
  const blob = await renderCard(wish);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `vng22-loi-chuc-${wish.id ?? "moi"}.jpg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
