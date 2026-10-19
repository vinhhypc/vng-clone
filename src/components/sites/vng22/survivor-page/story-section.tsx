"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import storiesData from "../data/survivor-stories.json";

type Story = { title: string; lead: string; body: string; images: string[] };

const STORIES = storiesData as Story[];

function ImageCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const reduced = useReducedMotion(false);

  useEffect(() => {
    if (hovered || reduced) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % images.length), 5000);
    return () => window.clearInterval(id);
  }, [hovered, reduced, images.length]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      <div className="shot bg-surface-sunken rounded-tight aspect-3/2 overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-[var(--ease-brand)]"
          style={{ transform: `translateX(-${100 * index}%)` }}
        >
          {images.map((src) => (
            <img key={src} src={src} alt="" className="shot-media h-full w-full flex-none object-contain" />
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`Ảnh ${i + 1}/${images.length}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${i === index ? "bg-accent" : "bg-[color:var(--color-rule)]"}`}
          />
        ))}
      </div>
    </div>
  );
}

export function StorySection() {
  const [active, setActive] = useState(0);
  // With reduced motion every story stays open instead of following the scroll position.
  const reduced = useReducedMotion(false);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (reduced) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.story);
          if (!Number.isNaN(index)) setActive(index);
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );
    for (const el of refs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <section id="story" aria-labelledby="story-title" className="max-w-page mx-auto px-6 py-32">
      <div className="max-w-copy">
        <h2 id="story-title" className="text-title font-display hover-gradient-text mt-6 w-fit cursor-default">
          Những dấu ấn đáng nhớ
        </h2>
      </div>
      <div className="mt-14">
        {STORIES.map((story, i) => {
          const open = reduced || i === active;
          return (
            <div
              key={story.title}
              data-story={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="rule-top py-10"
            >
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={open}
                className="flex w-full flex-wrap items-baseline gap-8 text-left"
              >
                <span
                  className={`font-display min-w-[300px] flex-1 text-[clamp(26px,3.6vw,48px)] leading-tight font-bold tracking-tight whitespace-pre-line transition-colors ${open ? "text-accent" : "text-ink"}`}
                >
                  {story.title}
                </span>
              </button>
              <div
                className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-700 ease-[var(--ease-brand)]"
                style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
              >
                <div className="min-h-0">
                  <div className="grid gap-14 pt-10 lg:grid-cols-2 lg:items-start">
                    <div className="flex flex-col gap-8">
                      <p className="text-body whitespace-pre-line italic">{story.lead}</p>
                      <p className="text-body text-muted">{story.body}</p>
                    </div>
                    <ImageCarousel images={story.images} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
