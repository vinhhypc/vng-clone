"use client";

import { useCallback, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CarouselArrows } from "./carousel-arrows";
import { SURVIVORS, SurvivorCard, TenureTabs, useColumnTicker, wrap } from "./survivor-shared";

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

/** Card indices rendered per column: one above, the two visible, one below. */
const windowFor = (offset: number) => [offset - 1, offset, offset + 1, offset + 2];

function slotFor(index: number, offset: number) {
  const rel = index - offset;
  if (rel < 0) return { top: -CARD, opacity: 0 };
  if (rel >= SLOTS.length) return { top: STAGE_HEIGHT, opacity: 0 };
  return { top: SLOTS[rel], opacity: 1 };
}

export function SurvivorSection() {
  const [tenure, setTenure] = useState(10);
  const [dragging, setDragging] = useState(false);
  const [carried, setCarried] = useState(0);
  const { offsets, setOffsets, setPaused, pauseHandlers } = useColumnTicker(COLUMNS, INTERVAL_MS);
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
        <TenureTabs tenure={tenure} onChoose={setTenure} hideCount />
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
        {...pauseHandlers}
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
