"use client";

import { useEffect, useState } from "react";
import keywordsData from "../data/survivor-keywords.json";
import quotesData from "../data/survivor-quotes.json";

type Keyword = { label: string; count: number };
type Quote = { quote: string; author: string; tier: string | null };
type Placed = { label: string; width: number; height: number; x: number; y: number };

const KEYWORDS = keywordsData as Keyword[];
const QUOTES = quotesData as Quote[];
const BOARD_W = 700;
const BOARD_H = 620;
const PAD = 5;
const MAX = Math.max(...KEYWORDS.map((k) => k.count));
const MIN = Math.min(...KEYWORDS.map((k) => k.count));
const HIDDEN = new Set(["Yoga"]);
const VISIBLE = KEYWORDS.filter((k) => !HIDDEN.has(k.label)).sort((a, b) => b.count - a.count);
const COUNTS = new Map(VISIBLE.map((k) => [k.label, k.count]));

/** Size grows with sqrt(count); the top band is blue, the middle orange, the rest muted. */
function keywordStyle(count: number) {
  const fontSize = 13 + 33 * Math.sqrt(MAX === MIN ? 1 : (count - MIN) / (MAX - MIN));
  if (count >= 0.55 * MAX) return { fontSize, fontWeight: 800, color: "var(--color-accent-cool)" };
  if (count >= 0.22 * MAX) return { fontSize, fontWeight: 700, color: "var(--color-accent)" };
  return {
    fontSize,
    fontWeight: 500,
    color: "color-mix(in oklab, var(--color-accent-cool) 45%, var(--color-faint))",
  };
}

const collides = (x: number, y: number, box: { width: number; height: number }, placed: Placed[]) => {
  const hw = box.width / 2 + PAD;
  const hh = box.height / 2 + PAD;
  return placed.some((p) => Math.abs(x - p.x) < hw + p.width / 2 + PAD && Math.abs(y - p.y) < hh + p.height / 2 + PAD);
};

/** Place words on an elliptical spiral from the centre, largest first, skipping overlaps. */
function layout(boxes: { label: string; width: number; height: number }[]): Placed[] {
  const radius = Math.hypot(BOARD_W, BOARD_H) / 2;
  const placed: Placed[] = [];
  boxes.forEach((box, n) => {
    let x = BOARD_W / 2;
    let y = BOARD_H / 2;
    let found = false;
    for (let r = 0; r <= radius && !found; r += 4) {
      const steps = Math.max(10, Math.floor(r / 4));
      for (let s = 0; s < steps; s++) {
        const angle = (s / steps) * Math.PI * 2 + 0.6 * n;
        const cx = BOARD_W / 2 + r * Math.cos(angle);
        const cy = BOARD_H / 2 + r * Math.sin(angle) * 0.82;
        const inside =
          cx - box.width / 2 >= 0 && cx + box.width / 2 <= BOARD_W && cy - box.height / 2 >= 0 && cy + box.height / 2 <= BOARD_H;
        if (inside && !collides(cx, cy, box, placed)) {
          x = cx;
          y = cy;
          found = true;
          break;
        }
      }
    }
    placed.push({ ...box, x, y });
  });
  return placed;
}

function KeywordCloud() {
  const [words, setWords] = useState<Placed[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const ctx = document.createElement("canvas").getContext("2d");
      const family = getComputedStyle(document.documentElement).getPropertyValue("--font-display") || "sans-serif";
      const boxes = VISIBLE.map((k) => {
        const { fontSize, fontWeight } = keywordStyle(k.count);
        let width = k.label.length * fontSize * 0.55;
        if (ctx) {
          ctx.font = `${fontWeight} ${fontSize}px ${family}`;
          width = ctx.measureText(k.label).width;
        }
        return { label: k.label, width, height: 1.15 * fontSize };
      });
      setWords(layout(boxes));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="py-6">
      <div
        className="relative mx-auto w-full max-w-[560px]"
        style={{ aspectRatio: `${BOARD_W} / ${BOARD_H}`, containerType: "inline-size" }}
      >
        {words?.map((word, i) => {
          const { fontSize, ...rest } = keywordStyle(COUNTS.get(word.label) ?? MIN);
          return (
            <span
              key={word.label}
              className="font-display tracking-tight"
              style={{
                ...rest,
                fontSize: `${(fontSize / BOARD_W) * 100}cqw`,
                position: "absolute",
                left: `${(word.x / BOARD_W) * 100}%`,
                top: `${(word.y / BOARD_H) * 100}%`,
                zIndex: words.length - i,
                transform: "translate(-50%, -50%)",
                whiteSpace: "nowrap",
              }}
            >
              {word.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function QuoteCard({ item, hidden }: { item: Quote; hidden: boolean }) {
  return (
    <article
      aria-hidden={hidden ? "true" : undefined}
      className="bg-paper rounded-tight border border-[color:var(--color-rule)] p-5"
    >
      <p className="text-[15px] leading-normal">“{item.quote}”</p>
      <p className="eyebrow text-ink-brand mt-4">
        — {item.author}
        {item.tier ? ` · ${item.tier}` : ""}
      </p>
    </article>
  );
}

const QUOTE_DURATIONS = [110, 128];

function QuoteWall() {
  return (
    <div className="wish-wall stage h-[600px] overflow-y-auto overscroll-contain">
      <div className="grid min-h-full grid-cols-2 gap-4">
        {QUOTE_DURATIONS.map((duration, column) => {
          const items = QUOTES.filter((_, i) => i % 2 === column);
          return (
            <div
              key={column}
              className="wish-track"
              style={{ animationName: "wish-drift-up", animationDuration: `${duration}s` }}
            >
              {[false, true].map((hidden) =>
                items.map((item, i) => (
                  <QuoteCard key={`${hidden ? "clone" : "row"}-${item.author}-${i}`} item={item} hidden={hidden} />
                )),
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CloudSection() {
  const [tab, setTab] = useState<"cloud" | "quotes">("cloud");
  const tabClass = (active: boolean) =>
    `eyebrow pb-2 ${active ? "text-ink-brand border-b-2 border-[color:var(--color-accent-cool)]" : "text-muted"}`;

  return (
    <section id="cloud" aria-labelledby="cloud-title" className="max-w-page mx-auto px-6 py-32">
      <div className="max-w-copy">
        <h2 id="cloud-title" className="text-title font-display hover-gradient-text w-fit cursor-default">
          Đối với Survivor, VNG là...
        </h2>
      </div>
      <div className="mt-8 flex gap-6 lg:hidden">
        <button type="button" onClick={() => setTab("cloud")} className={tabClass(tab === "cloud")}>
          Từ khoá
        </button>
        <button type="button" onClick={() => setTab("quotes")} className={tabClass(tab === "quotes")}>
          Chia sẻ
        </button>
      </div>
      <div className="mt-8 grid gap-14 lg:mt-14 lg:grid-cols-2 lg:items-start">
        <div className={tab === "cloud" ? "block" : "hidden lg:block"}>
          <KeywordCloud />
        </div>
        <div className={tab === "quotes" ? "block" : "hidden lg:block"}>
          <QuoteWall />
        </div>
      </div>
    </section>
  );
}
