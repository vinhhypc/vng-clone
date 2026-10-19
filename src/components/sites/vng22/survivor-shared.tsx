"use client";

/* eslint-disable @next/next/no-img-element */
import { memo, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { ASSET } from "./constants";
import survivorsData from "./data/survivors.json";

export type Survivor = { username: string; name: string; image: string; tenure: number; bu: string };

export const SURVIVORS = survivorsData as Survivor[];

export const TENURES = [
  { tenure: 10, count: 101 },
  { tenure: 15, count: 64 },
  { tenure: 20, count: 25 },
];

const LOGO = `${ASSET}/survivors/logo-survivor.webp`;

export const wrap = (n: number, len: number) => ((n % len) + len) % len;

export const survivorHandle = (person: Survivor) => `vng.${person.username}`;

/** Accent- and case-insensitive key used by the Survivor search. */
export const searchKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[Đđ]/g, "d")
    .toLowerCase();

/** Advances one column offset per tick, round-robin; pauses on hover/focus and for reduced motion. */
export function useColumnTicker(columns: number, intervalMs: number) {
  const reduced = useReducedMotion();
  const [offsets, setOffsets] = useState<number[]>(() => Array(columns).fill(0));
  const [paused, setPaused] = useState(false);
  const counter = useRef(0);

  useEffect(() => {
    if (paused || reduced) return;
    const id = window.setInterval(() => {
      const column = counter.current % columns;
      counter.current += 1;
      setOffsets((prev) => prev.map((value, i) => (i === column ? value + 1 : value)));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [columns, intervalMs, paused, reduced]);

  const pauseHandlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocusCapture: () => setPaused(true),
    onBlurCapture: () => setPaused(false),
  };

  return { offsets, setOffsets, paused, setPaused, pauseHandlers };
}

export function TenureTabs({
  tenure,
  onChoose,
  hideCount = false,
}: {
  tenure: number;
  onChoose: (tenure: number) => void;
  hideCount?: boolean;
}) {
  return (
    <div role="tablist" aria-label="Số năm gắn bó" className="rule-top flex flex-wrap">
      {TENURES.map((item, i) => {
        const selected = item.tenure === tenure;
        return (
          <button
            key={item.tenure}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChoose(item.tenure)}
            className={`flex min-w-[180px] flex-1 items-baseline justify-between gap-5 py-7 text-left ${
              i > 0 ? "border-l border-[color:var(--color-rule)] pl-6" : ""
            } ${i < TENURES.length - 1 ? "pr-6" : ""}`}
          >
            <span
              className={`font-display text-[clamp(24px,3vw,40px)] leading-none font-bold tracking-tight transition-colors ${
                selected ? "gradient-text" : "text-[color:var(--color-vng-ash)]"
              }`}
            >
              {item.tenure} năm
            </span>
            {hideCount ? null : <span className="eyebrow text-muted">+{item.count} Survivors</span>}
          </button>
        );
      })}
    </div>
  );
}

export const SurvivorCard = memo(function SurvivorCard({
  person,
  isHighlighted = false,
}: {
  person: Survivor;
  isHighlighted?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = failed ? LOGO : person.image;
  const isLogo = src === LOGO;
  const lit = isHighlighted || hovered;

  return (
    <div
      data-cursor-mode="portrait"
      className="shot group relative aspect-[8/9] w-full overflow-hidden rounded-md bg-transparent"
      style={{ containerType: "inline-size" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={`${ASSET}/survivors/bg.png`}
        alt=""
        className="pointer-events-none absolute bottom-0 left-1/2 z-0 aspect-square w-full -translate-x-1/2 object-cover transition-opacity duration-500"
        style={{ opacity: lit ? 0 : 1 }}
      />
      <img
        src={`${ASSET}/survivors/bg-highlight.png`}
        alt=""
        className="pointer-events-none absolute bottom-0 left-1/2 z-0 aspect-square w-full -translate-x-1/2 object-cover transition-opacity duration-500"
        style={{ opacity: lit ? 1 : 0 }}
      />
      {isLogo ? (
        <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 flex aspect-square w-full -translate-x-1/2 items-center justify-center px-[15%]">
          <img src={src} alt="VNG Survivor" className="max-h-full max-w-full object-contain" />
        </div>
      ) : (
        <img
          src={src}
          alt={person.name}
          onError={() => setFailed(true)}
          className="pointer-events-none absolute bottom-0 left-1/2 z-10 h-full w-auto -translate-x-1/2 object-contain object-bottom"
        />
      )}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 h-1/4 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
      <div className="absolute right-0 bottom-0 left-0 z-30 flex flex-col justify-end p-[5.97cqw] text-white">
        <p
          className="leading-tight font-bold tracking-tight text-white drop-shadow"
          style={{ fontSize: "clamp(11px, 5.6cqw, 15px)" }}
        >
          {person.name}
        </p>
        {person.bu ? (
          <p
            className="mt-0.5 truncate leading-tight text-white/80 drop-shadow"
            style={{ fontSize: "clamp(9px, 4.48cqw, 12px)" }}
          >
            {person.bu}
          </p>
        ) : null}
        <span className="sr-only">{survivorHandle(person)}</span>
      </div>
    </div>
  );
});
