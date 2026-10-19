"use client";

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CarouselArrows } from "../carousel-arrows";
import {
  SURVIVORS,
  SurvivorCard,
  TenureTabs,
  searchKey,
  survivorHandle,
  useColumnTicker,
  wrap,
  type Survivor,
} from "../survivor-shared";

const ROWS = 2;
const SLOTS_PER_ROW = 8;
const INTERVAL_MS = 2600;
/** Like the homepage stage, the source's width measurement never attaches, so cards stay at the 268px fallback. */
const CARD = 268;
const STEP = CARD + 24;
const ROW_HEIGHT = Math.floor((9 * CARD) / 8);

const matches = (person: Survivor, key: string) =>
  searchKey(person.name).includes(key) || searchKey(survivorHandle(person)).includes(key);

/** Move `current` to the nearest offset congruent to `target` modulo `len`. */
function nearestOffset(current: number, target: number, len: number) {
  const forward = (((target - current) % len) + len) % len;
  const backward = forward - len;
  return current + (Math.abs(forward) < Math.abs(backward) ? forward : backward);
}

function SearchBox({ query, onChange, resultCount }: { query: string; onChange: (v: string) => void; resultCount: number }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <label className="min-w-[280px] flex-1">
        <span className="sr-only">Tìm theo tên hoặc domain</span>
        <input
          type="search"
          value={query}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Tìm theo tên hoặc domain — ví dụ: Nguyễn, vng.tha"
          className="bg-surface-sunken rounded-pill text-ink w-full border border-[color:var(--color-rule)] px-6 py-4 text-[15px] outline-none placeholder:text-[color:var(--color-vng-ash)] focus-visible:border-[color:var(--color-accent)]"
        />
      </label>
      {query.trim() ? (
        <button type="button" onClick={() => onChange("")} className="eyebrow text-muted whitespace-nowrap">
          Xoá tìm kiếm ✕
        </button>
      ) : null}
      <p aria-live="polite" className="sr-only">
        {resultCount} kết quả
      </p>
    </div>
  );
}

export function HonorSection() {
  const [tenure, setTenure] = useState(10);
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);
  const [carried, setCarried] = useState(0);
  const { offsets, setOffsets, setPaused, pauseHandlers } = useColumnTicker(ROWS, INTERVAL_MS);
  const drag = useRef<{ x: number; carried: number } | null>(null);

  const pool = useMemo(() => SURVIVORS.filter((s) => s.tenure === tenure), [tenure]);
  const key = searchKey(query.trim());
  const searching = key !== "";
  const people = useMemo(() => (key ? pool.filter((p) => matches(p, key)) : pool), [pool, key]);
  const matchedIndex = useMemo(() => (key ? pool.findIndex((p) => matches(p, key)) : -1), [pool, key]);
  const focusMatch = searching && matchedIndex !== -1;
  // A match keeps the whole tenure in the rail and scrolls the hit into view.
  const shown = focusMatch ? pool : people;
  const scrollable = shown.length > 10;

  /** Pause the rail and bring the first match into view (or resume when nothing matches). */
  const applySearch = (nextTenure: number, nextQuery: string) => {
    const nextPool = SURVIVORS.filter((s) => s.tenure === nextTenure);
    const nextKey = searchKey(nextQuery.trim());
    const index = nextKey ? nextPool.findIndex((p) => matches(p, nextKey)) : -1;
    if (index === -1) {
      setPaused(false);
      return;
    }
    setPaused(true);
    const row = index % 2;
    const target = row === 0 ? (index - 2) / 2 : (index - 3) / 2;
    setOffsets((prev) => prev.map((value, i) => (i === row ? nearestOffset(value, target, nextPool.length) : value)));
  };

  const shift = (by: number) => setOffsets((prev) => prev.map((value) => value + by));

  const endDrag = () => {
    const state = drag.current;
    if (!state) return;
    drag.current = null;
    const steps = Math.round(-state.carried / STEP);
    if (steps !== 0) shift(steps);
    setCarried(0);
    setDragging(false);
    if (!focusMatch) setPaused(false);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!scrollable) return;
    drag.current = { x: event.clientX, carried: 0 };
    setCarried(0);
    setDragging(true);
    setPaused(true);
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

  const duration = dragging ? "duration-0" : focusMatch ? "duration-[450ms]" : "duration-[900ms]";

  return (
    <section id="honor" aria-labelledby="honor-title" className="max-w-page mx-auto px-6 pt-24 pb-32">
      <div>
        <h2
          id="honor-title"
          className="text-title font-display hover-gradient-text mt-6 w-fit cursor-default leading-[1.25]"
        >
          Tri ân 190 Survivors đã vững tin
          <br />
          cùng VNG qua những cột mốc
        </h2>
      </div>
      <div className="mt-14">
        <TenureTabs
          tenure={tenure}
          onChoose={(next) => {
            setTenure(next);
            setQuery("");
            applySearch(next, "");
          }}
        />
      </div>
      <div className="rule-bottom mt-10 pb-8">
        <SearchBox
          query={query}
          onChange={(next) => {
            setQuery(next);
            applySearch(tenure, next);
          }}
          resultCount={people.length}
        />
        {scrollable ? (
          <div className="mt-4 flex items-center justify-between gap-6">
            <p className="eyebrow text-muted/70">Giữ &amp; kéo sang hai bên để xem thêm</p>
            <CarouselArrows
              onLeft={() => shift(1)}
              onRight={() => shift(-1)}
              leftLabel="Xem thêm Survivor"
              rightLabel="Xem các Survivor trước"
              className="shrink-0"
            />
          </div>
        ) : null}
      </div>

      {people.length === 0 ? (
        <p className="text-body text-muted py-20 text-center">
          {searching
            ? `Không tìm thấy ai khớp với “${query}” ở cột mốc ${tenure} năm.`
            : `Chưa có Survivor nào ở cột mốc ${tenure} năm.`}
        </p>
      ) : scrollable ? (
        <div
          {...pauseHandlers}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
          aria-live="polite"
          className={`mt-12 flex touch-pan-y flex-col gap-10 overflow-hidden select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        >
          {Array.from({ length: ROWS }, (_, row) => {
            const offset = offsets[row] ?? 0;
            return (
              <div key={row} className="relative" style={{ height: ROW_HEIGHT }}>
                <div
                  className={`absolute inset-y-0 left-0 transition-transform ease-[var(--ease-brand)] ${duration}`}
                  style={{ transform: `translateX(${-offset * STEP + carried}px)` }}
                >
                  {Array.from({ length: SLOTS_PER_ROW }, (_, r) => {
                    const slot = offset + r;
                    const index = wrap(2 * slot + row, shown.length);
                    const person = shown[index];
                    return (
                      <div key={slot} className="absolute top-0" style={{ left: slot * STEP, width: CARD }}>
                        <SurvivorCard
                          key={person.username}
                          person={person}
                          isHighlighted={focusMatch && index === matchedIndex}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {people.map((person) => (
            <li key={person.username}>
              <SurvivorCard
                person={person}
                isHighlighted={focusMatch && pool.indexOf(person) === matchedIndex}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
