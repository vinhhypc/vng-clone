# VNG22 — Human² (https://0909.vng.com.vn/)

Source is a Next.js + Tailwind v4 site. Tokens, keyframes and component classes were read from
`/_next/static/css/0183fc1d05ae3fb2.css`; behavior from the page chunks (`5100`, `2302`, `9460`, layout).

## Route map
| Source | Local | Owner |
| --- | --- | --- |
| `/` | `/` | `src/app/page.tsx` → `src/components/sites/vng22/*` |

Out-of-scope destinations (link back to the source origin): `/survivor`, `/wish-wall`, `/moments`,
`/VNG-Birthday-Email`, `/VNG22-Letter`, `/celebrate/*`, `/en`, `/ai-video-contest/*`.

## Page-wide
- Fonts: Google Sans Flex 400/700 (display), SVN-Gilroy 400/500/700 (body), eyebrow uses the system mono stack.
- Body `#fff`, ink `#0a0a0a`, muted `#525252`, accent `#f05a22`, ink-brand `#003e89`, rule `rgba(0,0,0,.1)`.
- Page width 1280px, gutter 24px. Body tracking -0.02em.
- Fixed header (bg white/95, blur, px-6 py-5, z 100). Mobile (<768) hamburger toggles a dropdown nav.
- Cursor follower `.cursor-dot` 32px brand-gradient dot, lerp 0.28 per frame; grows 1.8× over links/buttons,
  turns blue 1.5× with ripples over survivor portraits. Only with `(pointer: fine)`.
- Grain overlay: fixed SVG turbulence, multiply, opacity .055, z 90.

## Sections (desktop 1440)
1. Hero — min-h-screen, background `hero.webm` (poster `hero-poster.webp`), "Happy Birthday" (clamp(2.5rem,9vw,8rem),
   ink-brand) words rise in with 0.14s stagger, then animated `hero-logo.webp` (w min(560px,86%)).
2. Human² — "Human × AI = Human²/AI-Native" (swaps every 3s with 300ms fade); `text-mega` "Human²" with gradient on hover;
   2-col: looping film preview button (opens modal with full film) + 7-line copy.
3. Founder letter — 360px portrait column (bg plate + cut-out), title, lead, blockquote, links.
4. Celebrate — horizontal snap rail of 5 cards (320px, 168px art), prev/next arrows scroll by one card,
   "Tạo khung ảnh VNG22" opens the frame-studio modal.
5. Moments — marquee of 10 photos (320px, 3:2), 34s linear, pauses on hover.
6. Survivor — tenure tabs (10/15/20), count line, 5 columns × 2 visible cards; one column advances every 3.2s
   round-robin; drag horizontally to shift; pause on hover.
7. Wishes — 3 columns of wish cards drifting up/down (92s/116s/104s), masked top/bottom, pause on hover.
8. Contest — gallery of 10 video cards (every 4th is 190px wide), auto-advance 3.8s, "›" button.
9. Footer — sunken bg, logo 160px @80%, copyright, 5 social icons.

## Data snapshots
`src/components/sites/vng22/data/` — survivors (190, from `/api/survivors`), wishes (12, from `/api/wishes`),
contest (10, from `/api/contest-videos`), captured 2026-10-19.

Assets: `public/sites/vng22/`, mapping in `asset-map.json`. The full film (`vng22-film/vi.mp4`, 52 MB) streams
from the source CDN.
