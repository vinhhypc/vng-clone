"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { CONTEST_URL } from "./constants";
import contestData from "./data/contest.json";

type Entry = { id: string; titleVi: string; team: string; thumbnailUrl: string; url: string };

const ENTRIES = contestData as Entry[];
const INTERVAL_MS = 3800;

export function ContestSection() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const reduced = useReducedMotion();

  const advance = useCallback(() => {
    const gallery = galleryRef.current;
    const card = gallery?.querySelector(".gallery-card");
    if (!gallery || !card) return;
    const step = card.getBoundingClientRect().width + 12;
    const atEnd = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 0.65 * step;
    gallery.scrollTo({ left: atEnd ? 0 : gallery.scrollLeft + step, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (hovered || reduced) return;
    const id = window.setInterval(advance, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [hovered, reduced, advance]);

  return (
    <section id="contest" aria-labelledby="contest-title" className="max-w-page mx-auto px-6 py-32">
      <div className="flex flex-wrap items-end justify-between gap-10">
        <div className="max-w-copy">
          <h2 id="contest-title" className="text-title font-display hover-gradient-text w-fit cursor-default">
            Kể câu chuyện 22 năm của bạn
          </h2>
          <p className="text-body-lg text-ink-brand font-display mt-6">
            Nếu HUMAN² được kể bằng chính trí tưởng tượng của bạn, câu chuyện ấy sẽ trông như thế nào?
          </p>
          <p className="text-body text-muted mt-6">
            Khám phá khả năng sáng tạo cùng AI, biến những góc nhìn riêng về Human² thành câu chuyện sống động — và bình
            chọn cho tác phẩm khiến bạn ấn tượng nhất.
          </p>
        </div>
        <a
          href={CONTEST_URL}
          target="_blank"
          rel="noreferrer"
          className="bg-accent text-on-invert rounded-pill inline-flex min-h-[52px] items-center gap-3 px-7 text-[15px] font-medium"
        >
          Đến trang cuộc thi <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="relative mt-14">
        <div
          ref={galleryRef}
          className="gallery pb-4"
          aria-label="Gallery video dự thi"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setHovered(true)}
          onBlurCapture={() => setHovered(false)}
        >
          {ENTRIES.map((entry, i) => (
            <a
              key={entry.id}
              href={entry.url}
              target="_blank"
              rel="noreferrer"
              className={`gallery-card shot ${i % 4 === 0 ? "gallery-card-tall" : ""}`}
            >
              <div
                className={`bg-surface-sunken relative h-[190px] overflow-hidden ${i % 2 === 0 ? "card-a" : "card-b"}`}
              >
                <img
                  src={entry.thumbnailUrl}
                  alt=""
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  className="shot-media h-full w-full object-cover"
                />
                <span
                  aria-hidden="true"
                  className="bg-paper text-ink-brand absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full text-[13px]"
                >
                  ▶
                </span>
              </div>
              <div className="pt-3">
                <p className="text-[16px] leading-tight font-bold tracking-tight">{entry.titleVi}</p>
                {entry.team ? <p className="text-muted mt-1 text-[13px]">{entry.team}</p> : null}
              </div>
            </a>
          ))}
        </div>
        <button
          type="button"
          onClick={advance}
          aria-label="Xem video tiếp theo"
          className="bg-paper text-ink absolute top-[75px] -right-2 grid h-12 w-12 place-items-center rounded-full border border-[color:var(--color-rule)] text-2xl shadow-lg"
        >
          ›
        </button>
      </div>
    </section>
  );
}
