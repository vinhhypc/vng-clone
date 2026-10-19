"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import photosData from "./data/moments.json";

type Photo = { src: string; thumb: string; w: number; h: number };

const PHOTOS = photosData as Photo[];
const PER_PAGE = 20;
const PAGES = Math.max(1, Math.ceil(PHOTOS.length / PER_PAGE));

/** Page buttons with ellipses: first five, last five, or a window around the current page. */
function pageList(current: number, total: number): (number | "gap")[] {
  if (total < 8) return Array.from({ length: total }, (_, i) => i);
  const last = total - 1;
  const run = (start: number, n: number) => Array.from({ length: n }, (_, i) => start + i);
  if (current <= 3) return [...run(0, 5), "gap", last];
  if (current >= total - 4) return [0, "gap", ...run(total - 5, 5)];
  return [0, "gap", current - 1, current, current + 1, "gap", last];
}

function Lightbox({ index, onClose, onStep }: { index: number; onClose: () => void; onStep: (by: number) => void }) {
  const photo = PHOTOS[index];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh"
      tabIndex={-1}
      ref={(el) => el?.focus()}
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
        if (event.key === "ArrowRight") onStep(1);
        if (event.key === "ArrowLeft") onStep(-1);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    >
      <img
        src={photo.src}
        alt=""
        width={photo.w}
        height={photo.h}
        onClick={(event) => event.stopPropagation()}
        className="max-h-full w-auto max-w-full object-contain"
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className="text-on-invert absolute top-5 right-5 grid h-11 w-11 place-items-center rounded-full border border-[color:var(--color-rule-invert)] text-xl"
      >
        ×
      </button>
      <p className="text-on-invert absolute bottom-5 left-1/2 -translate-x-1/2 text-sm tabular-nums">
        {index + 1}/{PHOTOS.length}
      </p>
    </div>
  );
}

export function MomentsGallery() {
  const [open, setOpen] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);
  const first = page * PER_PAGE;
  const visible = PHOTOS.slice(first, first + PER_PAGE);

  const goTo = (next: number) => {
    setPage(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const step = (by: number) =>
    setOpen((current) => {
      if (current === null) return current;
      const next = (current + by + PHOTOS.length) % PHOTOS.length;
      setPage(Math.floor(next / PER_PAGE));
      return next;
    });

  const arrowClass =
    "text-ink grid h-11 w-11 place-items-center rounded-full border border-[color:var(--color-rule)] text-xl disabled:opacity-30";

  return (
    <>
      <div ref={topRef} className="scroll-mt-32" />
      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((photo, i) => (
          <li key={photo.src}>
            <button
              type="button"
              onClick={() => setOpen(first + i)}
              aria-label={`Xem ảnh ${first + i + 1}/${PHOTOS.length}`}
              className="shot bg-surface-sunken card-plain block w-full overflow-hidden"
            >
              <img
                src={photo.thumb}
                alt=""
                loading="lazy"
                width={photo.w}
                height={photo.h}
                className="shot-media aspect-3/2 h-full w-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>
      {PAGES > 1 ? (
        <nav aria-label="Lật trang hình ảnh" className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <button type="button" onClick={() => goTo(page - 1)} disabled={page === 0} aria-label="Trang trước" className={arrowClass}>
            <span aria-hidden="true">←</span>
          </button>
          {pageList(page, PAGES).map((item, i) =>
            item === "gap" ? (
              <span key={`gap-${i}`} aria-hidden="true" className="text-muted px-1 text-sm">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => goTo(item)}
                aria-current={item === page ? "page" : undefined}
                className={`grid h-11 w-11 place-items-center rounded-full text-sm tabular-nums ${
                  item === page ? "bg-ink text-on-invert" : "text-ink border border-[color:var(--color-rule)]"
                }`}
              >
                {item + 1}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={page === PAGES - 1}
            aria-label="Trang sau"
            className={arrowClass}
          >
            <span aria-hidden="true">→</span>
          </button>
          <p aria-live="polite" className="sr-only">
            Trang {page + 1}/{PAGES}
          </p>
        </nav>
      ) : null}
      {open !== null ? <Lightbox index={open} onClose={() => setOpen(null)} onStep={step} /> : null}
    </>
  );
}
