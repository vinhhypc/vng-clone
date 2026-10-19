"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { CarouselArrows } from "./carousel-arrows";
import { ASSET } from "./constants";
import survivorsData from "./data/survivors.json";

type Survivor = { username: string; name: string; image: string; tenure: number; bu: string };

const SURVIVORS = survivorsData as Survivor[];
const TENURES = [10, 15, 20];
const COLUMNS = 5;
const INTERVAL_MS = 3200;
/**
 * The source sizes cards from a ResizeObserver that never attaches (its data loads after mount),
 * so every card slot renders at the 320px fallback. Matching that observed result.
 */
const CARD = 320;
const STEP = CARD + 20;
const SLOTS = [0, STEP];
const STAGE_HEIGHT = 2 * STEP - 20;
const COLUMN_VISIBILITY = ["", "", "hidden sm:block", "hidden lg:block", "hidden lg:block"];
const LOGO = `${ASSET}/survivors/logo-survivor.webp`;

const wrap = (n: number, len: number) => ((n % len) + len) % len;

/** Card indices rendered per column: one above, the two visible, one below. */
const windowFor = (offset: number) => [offset - 1, offset, offset + 1, offset + 2];

function slotFor(index: number, offset: number) {
  const rel = index - offset;
  if (rel < 0) return { top: -CARD, opacity: 0 };
  if (rel >= SLOTS.length) return { top: STAGE_HEIGHT, opacity: 0 };
  return { top: SLOTS[rel], opacity: 1 };
}

function useColumnTicker(paused: boolean) {
  const reduced = useReducedMotion();
  const [offsets, setOffsets] = useState<number[]>(() => Array(COLUMNS).fill(0));
  const counter = useRef(0);

  useEffect(() => {
    if (paused || reduced) return;
    const id = window.setInterval(() => {
      const column = counter.current % COLUMNS;
      counter.current += 1;
      setOffsets((prev) => prev.map((value, i) => (i === column ? value + 1 : value)));
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, reduced]);

  return { offsets, setOffsets };
}

function SurvivorCard({ person }: { person: Survivor }) {
  const [hovered, setHovered] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = failed ? LOGO : person.image;
  const isLogo = src === LOGO;

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
        style={{ opacity: hovered ? 0 : 1 }}
      />
      <img
        src={`${ASSET}/survivors/bg-highlight.png`}
        alt=""
        className="pointer-events-none absolute bottom-0 left-1/2 z-0 aspect-square w-full -translate-x-1/2 object-cover transition-opacity duration-500"
        style={{ opacity: hovered ? 1 : 0 }}
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
        <p
          className="mt-0.5 truncate leading-tight text-white/80 drop-shadow"
          style={{ fontSize: "clamp(9px, 4.48cqw, 12px)" }}
        >
          {person.bu}
        </p>
        <span className="sr-only">vng.{person.username}</span>
      </div>
    </div>
  );
}

export function SurvivorSection() {
  const [tenure, setTenure] = useState(10);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [carried, setCarried] = useState(0);
  const { offsets, setOffsets } = useColumnTicker(paused);
  const drag = useRef<{ x: number; carried: number } | null>(null);

  const people = useMemo(() => SURVIVORS.filter((s) => s.tenure === tenure), [tenure]);
  const shift = useCallback(
    (by: number) => setOffsets((prev) => prev.map((value) => value + by)),
    [setOffsets],
  );

  const endDrag = () => {
    const state = drag.current;
    if (!state) return;
    drag.current = null;
    const steps = Math.round(-state.carried / STEP);
    if (steps !== 0) shift(steps);
    setCarried(0);
    setDragging(false);
    setPaused(false);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = { x: event.clientX, carried: 0 };
    setCarried(0);
    setDragging(true);
    setPaused(true);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is best-effort.
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state) return;
    state.carried += event.clientX - state.x;
    state.x = event.clientX;
    const steps = Math.trunc(-state.carried / STEP);
    if (steps !== 0) {
      state.carried += steps * STEP;
      shift(steps);
    }
    setCarried(state.carried);
  };

  return (
    <section id="survivor" aria-labelledby="survivor-title" className="max-w-page mx-auto px-6 py-32">
      <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-end">
        <div>
          <h2 id="survivor-title" className="text-title font-display hover-gradient-text w-fit cursor-default">
            VNG Survivor
          </h2>
        </div>
        <p className="text-body text-muted max-w-copy">
          <strong className="text-accent font-semibold">VNG Survivor</strong> là danh hiệu VNG trân quý tôn vinh các
          Starter gắn bó trên 10 năm, đồng hành và góp phần tạo nên VNG hôm nay.
        </p>
      </div>

      <div className="mt-14">
        <div role="tablist" aria-label="Số năm gắn bó" className="rule-top flex flex-wrap">
          {TENURES.map((value, i) => {
            const selected = value === tenure;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTenure(value)}
                className={`flex min-w-[180px] flex-1 items-baseline justify-between gap-5 py-7 text-left ${
                  i > 0 ? "border-l border-[color:var(--color-rule)] pl-6" : ""
                } ${i < TENURES.length - 1 ? "pr-6" : ""}`}
              >
                <span
                  className={`font-display text-[clamp(24px,3vw,40px)] leading-none font-bold tracking-tight transition-colors ${
                    selected ? "gradient-text" : "text-[color:var(--color-vng-ash)]"
                  }`}
                >
                  {value} năm
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rule-bottom mt-10 flex items-end justify-between gap-6 pb-5">
        <p className="eyebrow text-muted">
          +{people.length} Survivors đạt cột mốc {tenure} năm
        </p>
        {people.length > 10 ? (
          <CarouselArrows
            onLeft={() => shift(1)}
            onRight={() => shift(-1)}
            leftLabel="Xem thêm Survivor"
            rightLabel="Xem các Survivor trước"
            className="shrink-0"
          />
        ) : null}
      </div>

      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        className={`rounded-soft mt-10 touch-pan-y overflow-hidden select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ height: STAGE_HEIGHT }}
      >
        <div aria-live="polite" className="grid h-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: COLUMNS }, (_, column) => {
            const offset = offsets[column] ?? 0;
            return (
              <div
                key={column}
                className={`stage-column ${COLUMN_VISIBILITY[column]}`}
                style={carried ? { transform: `translateY(${carried}px)` } : undefined}
              >
                {windowFor(offset).map((index) => {
                  const person = people[wrap(2 * column + index, people.length)];
                  const { top, opacity } = slotFor(index, offset);
                  return (
                    <article
                      key={`${column}-${index}`}
                      className="stage-card flex items-center justify-center"
                      style={{ top, opacity, height: CARD, transition: dragging ? "none" : undefined }}
                    >
                      <div className="w-full">
                        <SurvivorCard key={person.username} person={person} />
                      </div>
                    </article>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
