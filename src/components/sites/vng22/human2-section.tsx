"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { FILM } from "./constants";

type Segment = { text: string; accent?: boolean };

const COPY: Segment[][] = [
  [{ text: "Bước sang tuổi 22 giữa làn sóng chuyển mình mạnh mẽ" }],
  [{ text: "của AI, VNG lựa chọn " }, { text: "Human²", accent: true }, { text: " như một lời khẳng định" }],
  [{ text: "con người vẫn luôn là điểm khởi đầu và chủ thể dẫn dắt" }],
  [{ text: "mọi đổi mới. Khi " }, { text: "con người và AI cùng cộng hưởng", accent: true }, { text: "," }],
  [{ text: "công nghệ trở thành năng lực khuếch đại để mỗi người" }],
  [{ text: "hình dung xa hơn, thích nghi nhanh hơn và bền bỉ" }],
  [{ text: "biến ý tưởng thành những giá trị tốt đẹp." }],
];

const FILM_LABEL = "Xem video VNG22";

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <path d="M3 1.5v11l9-5.5z" />
    </svg>
  );
}

function FilmModal({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={FILM_LABEL}
      tabIndex={-1}
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      className="z-modal fixed inset-0 flex items-center justify-center bg-black/90 p-4 sm:p-8"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="rounded-tight aspect-video w-full max-w-[1200px] overflow-hidden bg-black shadow-2xl"
      >
        <video
          src={FILM.full}
          poster={FILM.poster}
          controls
          autoPlay
          playsInline
          preload="auto"
          aria-label={FILM_LABEL}
          className="h-full w-full"
        />
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className="text-on-invert absolute top-5 right-5 grid h-11 w-11 place-items-center rounded-full border border-[color:var(--color-rule-invert)] text-xl"
      >
        ×
      </button>
    </div>,
    document.body,
  );
}

function FilmTeaser() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={FILM_LABEL}
        className="shot rounded-tight bg-surface-sunken group relative block aspect-video w-full cursor-pointer overflow-hidden text-left"
      >
        {reduced ? (
          <img src={FILM.poster} alt="" className="h-full w-full object-cover" />
        ) : (
          <video
            src={FILM.loop}
            poster={FILM.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        )}
        <span className="pointer-events-none absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/50 via-transparent to-transparent p-5 sm:p-6">
          <span className="text-on-invert rounded-pill inline-flex min-h-[44px] items-center gap-3 border border-white/40 bg-black/40 px-5 text-[15px] font-semibold backdrop-blur-sm transition-colors group-hover:bg-black/60">
            <PlayIcon />
            Xem video
          </span>
        </span>
      </button>
      {open ? <FilmModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}

export function Human2Section() {
  const [word, setWord] = useState("Human²");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let swap: ReturnType<typeof setTimeout> | undefined;
    const id = setInterval(() => {
      setVisible(false);
      swap = setTimeout(() => {
        setWord((current) => (current === "Human²" ? "AI-Native" : "Human²"));
        setVisible(true);
      }, 300);
    }, 3000);
    return () => {
      clearInterval(id);
      clearTimeout(swap);
    };
  }, []);

  return (
    <section id="human2" aria-labelledby="human2-title" className="relative isolate overflow-hidden py-24 sm:py-32">
      <div className="max-w-page relative mx-auto px-6">
        <p className="text-body sm:text-body-lg text-muted flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <span className="text-ink font-display font-bold">Human</span>
          <span>×</span>
          <span className="text-ink font-display font-bold">AI</span>
          <span>=</span>
          <span
            className={`text-ink font-display font-bold transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
          >
            {word}
          </span>
        </p>
        <h2
          id="human2-title"
          className="text-mega font-display hover-gradient-text mx-auto mt-8 w-fit cursor-default sm:mt-12"
        >
          Human<sup className="sup-mark">2</sup>
        </h2>
        <div className="mt-12 grid items-center gap-10 sm:mt-16 lg:grid-cols-2 lg:gap-14">
          <FilmTeaser />
          <div>
            <p className="text-body text-accent font-medium">Ngày 09/09/2026 là kỷ niệm 22 năm thành lập VNG.</p>
            <p className="text-muted text-body mt-5 leading-relaxed">
              {COPY.map((line, i) => (
                <span key={i} className="block">
                  {line.map((segment, j) =>
                    segment.accent ? (
                      <strong key={j} className="text-accent font-bold">
                        {segment.text}
                      </strong>
                    ) : (
                      <span key={j}>{segment.text}</span>
                    ),
                  )}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
