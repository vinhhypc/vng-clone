import type { Metadata } from "next";
import { LettersTimeline } from "@/components/sites/vng22/letters-timeline";
import { PageHeader } from "@/components/sites/vng22/page-header";
import { SiteFooter } from "@/components/sites/vng22/site-footer";

export const metadata: Metadata = {
  title: "Thư Nhà sáng lập — VNG22 Human²",
  description: "Những lời nhắn gửi từ anh Lê Hồng Minh qua từng cột mốc sinh nhật VNG.",
};

export default function BirthdayLettersPage() {
  return (
    <main id="top" className="bg-paper text-ink">
      <PageHeader
        plate="hero"
        wideDescription
        name="Thư Nhà sáng lập"
        description={["Những lời nhắn gửi từ anh Lê Hồng Minh qua từng cột mốc sinh nhật VNG."]}
      />
      <LettersTimeline />
      <SiteFooter />
    </main>
  );
}
