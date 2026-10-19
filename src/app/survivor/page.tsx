import type { Metadata } from "next";
import { SURVIVOR_FILM } from "@/components/sites/vng22/constants";
import { SiteFooter } from "@/components/sites/vng22/site-footer";
import { CloudSection } from "@/components/sites/vng22/survivor-page/cloud-section";
import { HonorSection } from "@/components/sites/vng22/survivor-page/honor-section";
import { NewsSection } from "@/components/sites/vng22/survivor-page/news-section";
import { StorySection } from "@/components/sites/vng22/survivor-page/story-section";
import { SurvivorHero } from "@/components/sites/vng22/survivor-page/survivor-hero";

export const metadata: Metadata = {
  title: "VNG Survivor — VNG22 Human²",
  description: "Hành trình 22 năm được bồi đắp bởi sự đồng hành của tập thể",
};

export default function SurvivorPage() {
  return (
    <main id="top">
      <SurvivorHero />
      <section aria-label="Phim VNG Survivor" className="bg-paper rule-top border-[color:var(--color-rule)]">
        <div className="max-w-page mx-auto px-6 py-16 md:py-20">
          <div className="shot rounded-tight bg-surface-sunken aspect-video overflow-hidden">
            <video
              src={SURVIVOR_FILM.src}
              poster={SURVIVOR_FILM.poster}
              controls
              playsInline
              preload="none"
              aria-label="Phim VNG Survivor"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>
      <HonorSection />
      <NewsSection />
      <StorySection />
      <CloudSection />
      <SiteFooter />
    </main>
  );
}
