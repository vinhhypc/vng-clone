import type { Metadata } from "next";
import Link from "next/link";
import { ASSET, ROUTES } from "@/components/sites/vng22/constants";
import { LETTERS, hasOwnPage, letterContent } from "@/components/sites/vng22/letters";
import { PageHeader } from "@/components/sites/vng22/page-header";
import { SiteFooter } from "@/components/sites/vng22/site-footer";

const LEAD =
  "Nhân dịp VNG bước sang tuổi 22, anh Lê Hồng Minh – Nhà sáng lập & Chủ tịch VNG – đã gửi thư đến toàn thể Starter, chia sẻ những suy nghĩ về AI và con người.";

export const metadata: Metadata = {
  title: "Thư VNG22 — VNG22 Human²",
  description: LEAD,
};

const letter = LETTERS.find(hasOwnPage);

export default function Vng22LetterPage() {
  const content = letter ? letterContent(letter) : null;
  return (
    <main id="top" className="bg-paper text-ink">
      <div className="pb-16 md:pb-20">
        <PageHeader banner={`${ASSET}/vng22-letter/banner.webp`} name="Thư VNG22" description={[LEAD]} align="center" />
      </div>
      <div className="bg-surface-sunken">
        <div className="mx-auto max-w-[820px] px-6 pt-14 pb-16 md:pt-16 md:pb-24">
          <article className="letter-sheet px-6 py-12 sm:px-10 md:px-16 md:py-20">
            {content ? (
              // Letter HTML comes from the snapshot of the source site's own content.
              <div
                lang={content.lang}
                className="email-rendered-body font-body text-ink text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content.body }}
              />
            ) : null}
          </article>
          <div className="mt-12 text-center">
            <Link
              href={ROUTES.letters}
              className="eyebrow text-accent hover:text-ink-brand inline-flex items-center gap-2 transition-colors"
            >
              <span aria-hidden="true">←</span>Thư Nhà sáng lập qua các năm
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
