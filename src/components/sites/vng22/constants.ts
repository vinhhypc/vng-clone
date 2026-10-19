export const SOURCE_ORIGIN = "https://0909.vng.com.vn";
export const ASSET = "/sites/vng22";

/** Routes outside the cloned homepage keep pointing at the source site. */
export const sourceUrl = (path: string) => `${SOURCE_ORIGIN}${path}`;

export const CONTEST_URL = `${SOURCE_ORIGIN}/ai-video-contest/`;

export const ROUTES = {
  survivor: "/survivor",
  wishes: "/wish-wall",
  moments: "/moments",
  letters: "/VNG-Birthday-Email",
  letter2026: "/VNG22-Letter",
};

export const NAV_ITEMS: { href: string; label: string; external?: boolean }[] = [
  { href: ROUTES.survivor, label: "Survivor" },
  { href: ROUTES.wishes, label: "Wishes" },
  { href: CONTEST_URL, label: "AI Video Contest", external: true },
  { href: ROUTES.moments, label: "Moments" },
  { href: ROUTES.letters, label: "VNG's Birthday Letter" },
];

const FILM_BASE = "https://cpzqnhw1cy9ug4hx.public.blob.vercel-storage.com/vng22-film";

/** 57 MB documentary — streamed from the source CDN rather than bundled. */
export const SURVIVOR_FILM = {
  src: `${FILM_BASE.replace("vng22-film", "survivor-film")}/vi.mp4`,
  poster: `${ASSET}/film/survivor-poster.webp`,
};

export const FILM = {
  /** 52 MB feature film — streamed from the source CDN rather than bundled. */
  full: `${FILM_BASE}/vi.mp4`,
  loop: `${ASSET}/film/loop-vi.mp4`,
  poster: `${ASSET}/film/poster-vi.webp`,
};
