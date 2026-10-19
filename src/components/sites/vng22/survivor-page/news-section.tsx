"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef } from "react";
import { ASSET, sourceUrl } from "../constants";

const STORIES = [
  {
    slug: "nhung-chia-se-truyen-cam-hung",
    title: "Những chia sẻ truyền cảm hứng của các thế hệ VNG Survivor",
    cover: `${ASSET}/survivor-inspiring/banner.webp`,
    // Story sub-pages are not part of this clone; they open on the source site.
    href: sourceUrl("/survivor/nhung-chia-se-truyen-cam-hung"),
    external: false,
  },
  {
    slug: "ngay-ay-bay-gio",
    title: "Survivor ngày ấy & bây giờ",
    cover: `${ASSET}/survivor-thennow/banner.webp`,
    href: sourceUrl("/survivor/ngay-ay-bay-gio"),
    external: false,
  },
  {
    slug: "bo-qua-vng-survivor",
    title: "Bộ quà VNG Survivor: Tri ân những nỗ lực bền bỉ",
    cover: `${ASSET}/ripple/plate-c.webp`,
    href: "https://www.facebook.com/share/p/1HZfzH3mcA/",
    external: true,
  },
];

export function NewsSection() {
  const galleryRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: number) => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const card = gallery.querySelector(".gallery-card");
    const step = card ? card.getBoundingClientRect().width + 24 : gallery.clientWidth;
    gallery.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return (
    <section id="news" aria-labelledby="news-title" className="max-w-page mx-auto px-6 py-32">
      <div className="max-w-copy">
        <h2 id="news-title" className="text-title font-display hover-gradient-text mt-6 w-fit cursor-default">
          Câu chuyện VNG Survivor
        </h2>
      </div>
      <div className="relative mt-14">
        <div ref={galleryRef} className="gallery gap-6 pb-4" aria-label="Câu chuyện VNG Survivor">
          {STORIES.map((story, i) => (
            <a
              key={story.slug}
              href={story.href}
              {...(story.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className={`gallery-card shot bg-paper flex flex-col overflow-hidden border border-[color:var(--color-rule)] ${i % 2 === 0 ? "card-a" : "card-b"}`}
            >
              <div className="bg-surface-sunken aspect-4/3 overflow-hidden">
                <img src={story.cover} alt="" loading="lazy" className="shot-media h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-[19px] leading-tight font-bold tracking-tight">{story.title}</h3>
                <div className="rule-top mt-auto pt-4">
                  <span className="eyebrow text-accent whitespace-nowrap">
                    {story.external ? "Xem bài đăng ↗" : "Xem thêm →"}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Thẻ trước"
          className="bg-paper text-ink absolute top-1/2 -left-3 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-[color:var(--color-rule)] text-2xl shadow-lg"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Thẻ tiếp theo"
          className="bg-paper text-ink absolute top-1/2 -right-3 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-[color:var(--color-rule)] text-2xl shadow-lg"
        >
          ›
        </button>
      </div>
    </section>
  );
}
