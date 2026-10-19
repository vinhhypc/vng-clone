/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { Suspense } from "react";
import { ASSET } from "@/components/sites/vng22/constants";
import { SiteFooter } from "@/components/sites/vng22/site-footer";
import { SharedWish, WishWall } from "@/components/sites/vng22/wish-wall";

export const metadata: Metadata = {
  title: "Wishes — VNG22 Human²",
  description: "Mỗi lời chúc là một chương nhỏ trong hành trình 22 năm của VNG.",
};

export default function WishWallPage() {
  return (
    <main id="top" className="relative">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 opacity-[var(--ripple-plate-opacity)]">
        <img
          src={`${ASSET}/ripple/plate-hero.webp`}
          alt=""
          aria-hidden="true"
          className="pointer-events-none h-full w-full object-cover"
        />
      </div>
      <WishWall
        sharedWish={
          <Suspense fallback={null}>
            <SharedWish />
          </Suspense>
        }
      />
      <SiteFooter />
    </main>
  );
}
