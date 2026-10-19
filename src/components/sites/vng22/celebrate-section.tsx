"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { CarouselArrows } from "./carousel-arrows";
import { ASSET, sourceUrl } from "./constants";
import { FrameStudio } from "./frame-studio";

const ACTIVITIES = [
  { kicker: "Giải thể thao nội bộ", title: "Hội thao VNG 2026", icon: "hoi-thao", slug: "hoi-thao-vng-2026" },
  { kicker: "Thử thách chạy bộ", title: "Run Your 22", icon: "run-your-22", slug: "run-your-22" },
  { kicker: "Cuộc thi sáng tạo", title: "VNG22 AI Video Contest", icon: "ai-video-contest", slug: "ai-video-contest" },
  { kicker: "Giải đấu eSports nội bộ", title: "VNG22 eSports", icon: "esports", slug: "esports" },
  { kicker: "22 điều", title: "TIẾP NỐI MỘT TINH THẦN VNG", icon: "22-dieu", slug: "22-dieu" },
];

const PLATES = ["a", "b", "c", "d"];
const FRAME_LABEL = "Tạo khung ảnh VNG22";

function FrameStudioButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-accent text-on-invert rounded-pill inline-flex min-h-[52px] items-center gap-3 px-7 text-[15px] font-medium"
      >
        {FRAME_LABEL}
        <span aria-hidden="true">↗</span>
      </button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={FRAME_LABEL}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="bg-paper rounded-soft relative z-10 my-auto w-full max-w-3xl border border-[color:var(--color-rule)] p-6 shadow-2xl sm:p-8">
            <button
              onClick={() => setOpen(false)}
              className="text-muted hover:text-ink absolute top-4 right-4 text-2xl"
              aria-label="Đóng"
            >
              ×
            </button>
            <h3 className="font-display max-w-[80%] text-2xl font-bold tracking-tight">{FRAME_LABEL}</h3>
            <div className="mt-4">
              <FrameStudio />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function CelebrateSection() {
  const railRef = useRef<HTMLUListElement>(null);

  const scrollByCard = (direction: number) => {
    const rail = railRef.current;
    const card = rail?.querySelector("li");
    if (!rail || !card) return;
    rail.scrollBy({ left: direction * (card.getBoundingClientRect().width + 24) });
  };

  return (
    <section id="celebrate" aria-labelledby="celebrate-title" className="max-w-page mx-auto px-6 pb-32">
      <div className="flex flex-wrap items-end justify-between gap-10">
        <div className="max-w-copy">
          <h2 id="celebrate-title" className="text-title font-display hover-gradient-text w-fit cursor-default">
            Sinh nhật VNG22
          </h2>
          <p className="text-body text-muted mt-6">
            VNG chào đón tuổi 22 với một mùa sinh nhật tràn đầy năng lượng qua đa dạng hoạt động sáng tạo, kết nối và sẻ
            chia. Cùng hòa nhịp và cộng hưởng để tạo nên những khoảnh khắc đáng nhớ!
          </p>
        </div>
        <div className="flex items-center gap-4">
          <FrameStudioButton />
          {/* The source wires the left-pointing arrow to advance and the right one to go back. */}
          <CarouselArrows
            onLeft={() => scrollByCard(1)}
            onRight={() => scrollByCard(-1)}
            leftLabel="Xem hoạt động tiếp theo"
            rightLabel="Xem hoạt động trước"
            className="shrink-0"
          />
        </div>
      </div>
      <ul
        ref={railRef}
        className="hide-scrollbar mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 motion-safe:scroll-smooth"
      >
        {ACTIVITIES.map((activity, i) => (
          <li key={activity.title} className="w-[280px] shrink-0 snap-start sm:w-[320px]">
            <a
              href={sourceUrl(`/celebrate/${activity.slug}`)}
              className={`shot block overflow-hidden ${i % 2 === 0 ? "card-a" : "card-b"} border border-[color:var(--color-rule)]`}
            >
              <div aria-hidden="true" className="relative h-[168px]">
                <img
                  src={`${ASSET}/ripple/plate-${PLATES[i % PLATES.length]}.webp`}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[color:var(--color-accent)]/75 via-[color:var(--color-accent)]/40 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={`${ASSET}/celebrate/${activity.icon}.webp`}
                    alt=""
                    className="h-1/2 w-auto object-contain"
                  />
                </div>
              </div>
              <div className="bg-paper p-5">
                <p className="text-[18px] leading-tight tracking-tight">
                  <span className="text-muted block font-medium">{activity.kicker}</span>
                  <span className="block font-bold">{activity.title}</span>
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
