export const SOURCE_ORIGIN = "https://0909.vng.com.vn";
export const ASSET = "/sites/vng22";

/** Routes outside the cloned homepage keep pointing at the source site. */
export const sourceUrl = (path: string) => `${SOURCE_ORIGIN}${path}`;

export const CONTEST_URL = `${SOURCE_ORIGIN}/ai-video-contest/`;

export const NAV_ITEMS: { href: string; label: string; external?: boolean }[] = [
  { href: sourceUrl("/survivor"), label: "Survivor" },
  { href: sourceUrl("/wish-wall"), label: "Wishes" },
  { href: CONTEST_URL, label: "AI Video Contest", external: true },
  { href: sourceUrl("/moments"), label: "Moments" },
  { href: sourceUrl("/VNG-Birthday-Email"), label: "VNG's Birthday Letter" },
];

const FILM_BASE = "https://cpzqnhw1cy9ug4hx.public.blob.vercel-storage.com/vng22-film";

export const FILM = {
  /** 52 MB feature film — streamed from the source CDN rather than bundled. */
  full: `${FILM_BASE}/vi.mp4`,
  loop: `${ASSET}/film/loop-vi.mp4`,
  poster: `${ASSET}/film/poster-vi.webp`,
};
