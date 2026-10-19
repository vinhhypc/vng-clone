"use client";

/* eslint-disable @next/next/no-img-element */
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { ASSET } from "./constants";

export function HeroSection() {
  const reduced = useReducedMotion();

  return (
    <section
      aria-label="VNG22 Human²"
      className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-36 pb-20 text-center"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {reduced ? (
          <img src={`${ASSET}/video/hero-poster.webp`} alt="" className="h-full w-full object-cover" />
        ) : (
          <video
            src={`${ASSET}/video/hero.webm`}
            poster={`${ASSET}/video/hero-poster.webp`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <p className="font-display text-ink-brand text-[clamp(2.5rem,9vw,8rem)] leading-[1.05] font-bold tracking-tight">
        <span className="greeting-word">Happy</span> <span className="greeting-word">Birthday</span>
      </p>
      <h1 className="mt-6 w-full">
        <img
          src={reduced ? `${ASSET}/video/hero-logo-still.webp` : `${ASSET}/video/hero-logo.webp`}
          alt="VNG22 Human²"
          width={402}
          height={90}
          className="mx-auto h-auto w-[min(560px,86%)]"
        />
      </h1>
    </section>
  );
}
