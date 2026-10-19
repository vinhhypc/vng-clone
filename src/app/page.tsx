import { CelebrateSection } from "@/components/sites/vng22/celebrate-section";
import { ContestSection } from "@/components/sites/vng22/contest-section";
import { CursorDot } from "@/components/sites/vng22/cursor-dot";
import { FounderLetterSection } from "@/components/sites/vng22/founder-letter-section";
import { HeroSection } from "@/components/sites/vng22/hero-section";
import { Human2Section } from "@/components/sites/vng22/human2-section";
import { MomentsSection } from "@/components/sites/vng22/moments-section";
import { SiteFooter } from "@/components/sites/vng22/site-footer";
import { SiteHeader } from "@/components/sites/vng22/site-header";
import { SurvivorSection } from "@/components/sites/vng22/survivor-section";
import { WishesSection } from "@/components/sites/vng22/wishes-section";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <HeroSection />
        <Human2Section />
        <FounderLetterSection />
        <CelebrateSection />
        <MomentsSection />
        <SurvivorSection />
        <WishesSection />
        <ContestSection />
      </main>
      <SiteFooter />
      <div aria-hidden="true" className="grain-overlay" />
      <CursorDot />
    </>
  );
}
