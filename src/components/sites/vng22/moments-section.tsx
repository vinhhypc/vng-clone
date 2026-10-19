/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ASSET, ROUTES } from "./constants";

const PHOTOS = ["316", "341", "37", "07", "191", "158", "60", "376", "394", "333"].map(
  (id) => `${ASSET}/moments/${id}.webp`,
);

function MarqueeRow({ cloned }: { cloned: boolean }) {
  return (
    <div aria-hidden={cloned ? "true" : undefined} className="flex gap-6 pr-6">
      {PHOTOS.map((src) => (
        <div key={src} className="shot card-plain bg-surface-sunken aspect-3/2 w-[320px] shrink-0">
          <img src={src} alt="" loading="lazy" className="shot-media h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
}

export function MomentsSection() {
  return (
    <section id="moments" aria-labelledby="moments-title" className="pb-32">
      <div className="max-w-page mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <div className="max-w-copy">
            <h2 id="moments-title" className="text-title font-display hover-gradient-text w-fit cursor-default">
              Khoảnh khắc VNG22
            </h2>
            <p className="text-body text-muted mt-6">
              Những hình ảnh ghi lại không khí mùa sinh nhật — từ bộ quà, văn phòng khoác áo mới, đến các khoảnh khắc
              trong sự kiện.
            </p>
          </div>
          <Link
            href={ROUTES.moments}
            className="bg-accent text-on-invert rounded-pill inline-flex min-h-[52px] shrink-0 items-center gap-3 px-7 text-[15px] font-medium"
          >
            Xem thêm<span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <div className="mt-12">
        <section id="moments-rail" aria-label="Hình ảnh mùa sinh nhật VNG22" className="marquee-wrap py-8">
          <div className="marquee-track">
            <MarqueeRow cloned={false} />
            <MarqueeRow cloned />
          </div>
        </section>
      </div>
    </section>
  );
}
