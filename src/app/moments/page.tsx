import type { Metadata } from "next";
import { MomentsGallery } from "@/components/sites/vng22/moments-gallery";
import photos from "@/components/sites/vng22/data/moments.json";
import { SiteFooter } from "@/components/sites/vng22/site-footer";

export const metadata: Metadata = {
  title: "Khoảnh khắc VNG22 — VNG22 Human²",
  description:
    "Những hình ảnh ghi lại không khí mùa sinh nhật VNG22 — bộ quà, văn phòng khoác áo mới, và các khoảnh khắc trong sự kiện.",
};

const DRIVE_URL = "https://drive.google.com/drive/folders/1YAvkJp-RDMR_hW40DY-eXC6J8SxdJ9BH?usp=sharing";

export default function MomentsPage() {
  return (
    <main id="top">
      <section className="max-w-page mx-auto px-6 pt-40 pb-24">
        <h1 className="text-title font-display leading-[1.25] font-bold tracking-tight">Khoảnh khắc VNG22</h1>
        <p className="text-body text-muted max-w-copy mt-6">
          Những hình ảnh ghi lại không khí mùa sinh nhật — từ bộ quà, văn phòng khoác áo mới, đến các khoảnh khắc trong
          sự kiện.
        </p>
        <div className="mt-10">
          <a
            href={DRIVE_URL}
            target="_blank"
            rel="noreferrer"
            className="bg-accent text-on-invert rounded-pill inline-flex min-h-[52px] items-center gap-3 px-7 text-[15px] font-medium"
          >
            Xem toàn bộ hình ảnh<span aria-hidden="true">↗</span>
          </a>
        </div>
        <p className="eyebrow text-muted/70 mt-8">{photos.length} hình ảnh · Bấm vào một tấm để xem lớn</p>
      </section>
      <section aria-label="Toàn bộ hình ảnh" className="max-w-page mx-auto px-6 pb-32">
        <MomentsGallery />
      </section>
      <SiteFooter />
    </main>
  );
}
