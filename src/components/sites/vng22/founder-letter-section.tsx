/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ASSET, ROUTES } from "./constants";

const QUOTE = [
  "Theo anh, hãy để công nghệ đảm nhận ngày càng nhiều những việc máy móc có thể làm tốt, để con người có thêm thời gian và năng lực cho những điều thực sự có ý nghĩa. Đó có thể là thêm thời gian để suy nghĩ và sáng tạo, để hiểu đồng đội, gia đình và người dùng của mình hơn, để xây dựng những mối quan hệ sâu sắc hơn và giải quyết những vấn đề thực sự có ý nghĩa.",
  "Hãy luôn tự hỏi: Điều này có giúp con người kết nối với nhau nhiều hơn và sống tốt hơn không?",
];

export function FounderLetterSection() {
  return (
    <section id="founder-letter" aria-labelledby="founder-letter-title" className="max-w-page mx-auto px-6 pb-32">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-16">
        <div className="relative aspect-[2/3] w-full">
          <img
            src={`${ASSET}/founder/bg.webp`}
            alt=""
            aria-hidden="true"
            className="card-a bg-surface-sunken absolute bottom-0 left-0 aspect-square w-full object-cover"
          />
          <img
            src={`${ASSET}/founder/minh.webp`}
            alt="Anh Lê Hồng Minh, Nhà sáng lập VNG"
            width={1000}
            height={1655}
            className="absolute bottom-0 left-1/2 h-full w-auto -translate-x-1/2 object-contain object-bottom"
          />
        </div>
        <div>
          <h2 id="founder-letter-title" className="text-title font-display leading-[1.25] font-bold tracking-tight">
            Thư VNG22
          </h2>
          <p className="text-body text-muted mt-6 leading-relaxed">
            Nhân dịp VNG bước sang tuổi 22, anh Lê Hồng Minh – Nhà sáng lập &amp; Chủ tịch VNG – đã chia sẻ những suy nghĩ
            về AI, về con người và lý do HUMAN² được chọn làm chủ đề cho hành trình năm nay.
          </p>
          <blockquote className="mt-6 flex flex-col gap-4 border-l-2 border-[color:var(--color-accent)] pl-5">
            <p className="text-body text-ink-brand leading-relaxed">{QUOTE[0]}</p>
            <p className="text-body-lg text-ink-brand font-display leading-relaxed font-medium">{QUOTE[1]}</p>
          </blockquote>
          <Link
            href={ROUTES.letter2026}
            className="eyebrow text-accent hover:text-ink-brand mt-6 inline-flex items-center gap-2 bg-transparent transition-colors"
          >
            Đọc thư VNG22<span aria-hidden="true">→</span>
          </Link>
          <div className="mt-10">
            <Link
              href={ROUTES.letters}
              className="bg-accent text-on-invert rounded-pill inline-flex min-h-[52px] items-center gap-3 px-7 text-[15px] font-medium"
            >
              Thư Nhà sáng lập qua các năm<span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
