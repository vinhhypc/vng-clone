"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";
import { ASSET, NAV_ITEMS, sourceUrl } from "./constants";

const navLinkClass = "eyebrow text-ink w-full py-2.5 md:w-auto md:py-0";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="z-header fixed inset-x-0 top-0">
      <div className="bg-paper/95 flex items-center justify-between px-6 py-5 backdrop-blur-sm">
        <Link href="/" aria-label="VNG22 — trang chủ" className="isolate shrink-0">
          <img src={`${ASSET}/brand/logo-wordmark.webp`} alt="VNG22" className="h-6 w-auto" />
        </Link>
        <nav
          aria-label="Điều hướng chính"
          className={`${open ? "flex" : "hidden"} bg-paper absolute inset-x-0 top-full flex-col items-start gap-1 px-6 py-4 md:static md:flex md:flex-row md:items-center md:gap-8 md:bg-transparent md:p-0`}
        >
          {NAV_ITEMS.map((item) =>
            item.external ? (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className={navLinkClass}>
                {item.label}
              </a>
            ) : (
              <a key={item.label} href={item.href} className={navLinkClass}>
                {item.label}
              </a>
            ),
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-3 md:ml-8">
          <div
            role="group"
            aria-label="Ngôn ngữ"
            className="rounded-pill inline-flex items-center border border-[color:var(--color-rule)] p-1"
          >
            <Link
              href="/"
              hrefLang="vi"
              aria-current="true"
              className="rounded-pill bg-accent text-on-invert px-3 py-1 text-xs font-semibold tracking-wide transition-colors"
            >
              VI
            </Link>
            <a
              href={sourceUrl("/en")}
              hrefLang="en"
              className="rounded-pill text-muted hover:text-ink px-3 py-1 text-xs font-semibold tracking-wide transition-colors"
            >
              EN
            </a>
          </div>
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? "Đóng menu" : "Mở menu"}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-6 w-6 shrink-0 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span
              className={`bg-ink block h-[1.5px] w-5 transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`bg-ink block h-[1.5px] w-5 transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
