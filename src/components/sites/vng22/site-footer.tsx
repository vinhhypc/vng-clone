/* eslint-disable @next/next/no-img-element */
import { ASSET } from "./constants";

const SOCIALS = [
  {
    href: "https://www.facebook.com/LifeAtVNG",
    label: "Fanpage Life at VNG",
    path: "M15 3h-2a5 5 0 0 0-5 5v2H6v4h2v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3z",
  },
  {
    href: "https://www.linkedin.com/company/vng-group/",
    label: "LinkedIn VNG",
    path: "M4.98 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3 9h4v12H3zM10 9h3.8v1.7h.1c.5-1 1.9-2 3.9-2 4.2 0 5 2.7 5 6.3V21h-4v-5.5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21h-4z",
  },
  {
    href: "https://www.tiktok.com/@lifeatvng",
    label: "TikTok Life at VNG",
    path: "M14 3h3a5 5 0 0 0 4 4v3a8 8 0 0 1-4-1.1V15a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.2A3 3 0 1 0 14 15z",
  },
  {
    href: "https://www.instagram.com/life_at_vng/",
    label: "Instagram Life at VNG",
    path: "M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3zm4 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm4.5-3.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z",
  },
  {
    href: "https://www.youtube.com/@LifeatVNG",
    label: "YouTube Life at VNG",
    path: "M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.5 12 4.5 12 4.5s-5.7 0-7.5.6a3 3 0 0 0-2.1 2.1C2 9 2 12 2 12s0 3 .4 4.8a3 3 0 0 0 2.1 2.1c1.8.6 7.5.6 7.5.6s5.7 0 7.5-.6a3 3 0 0 0 2.1-2.1C22 15 22 12 22 12s0-3-.4-4.8zM10 15.5v-7l6 3.5z",
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-surface-sunken px-6 pt-14 pb-12">
      <div className="max-w-page mx-auto flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-center gap-4 sm:items-start">
          <img src={`${ASSET}/brand/logo-wordmark.webp`} alt="VNG22" className="w-[160px] opacity-80" />
          <p className="text-muted text-eyebrow">© 2026 VNG. All rights reserved.</p>
        </div>
        <ul className="flex items-center gap-4">
          {SOCIALS.map((social) => (
            <li key={social.href}>
              <a
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="bg-paper text-ink hover:text-accent flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-rule)] transition-colors"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d={social.path} />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
