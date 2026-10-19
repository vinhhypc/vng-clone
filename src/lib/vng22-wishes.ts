import wishesData from "@/components/sites/vng22/data/wishes-all.json";

export type Wish = { id: number; name: string; text: string; image_url?: string; created_at: string };

/** Approved wishes captured from the source site on 2026-10-19. */
const APPROVED = (wishesData as Wish[]).toSorted((a, b) => b.created_at.localeCompare(a.created_at));

/**
 * New submissions wait here for moderation, like on the source site. There is no database in this
 * clone, so they live only in this server process and never appear on the public wall.
 */
const pending: Wish[] = [];
let nextId = Math.max(...APPROVED.map((w) => w.id)) + 1;

const fold = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[Đđ]/g, "d")
    .toLowerCase();

/** Deterministic shuffle keyed by the client's seed so pages stay consistent while scrolling. */
function shuffled(items: Wish[], seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function listWishes({ limit, cursor, q, seed }: { limit: number; cursor: string | null; q: string; seed: string | null }) {
  const key = fold(q.trim());
  let items = key ? APPROVED.filter((w) => fold(w.name).includes(key) || fold(w.text).includes(key)) : APPROVED;
  if (seed) items = shuffled(items, seed);
  const start = cursor ? Math.max(0, Number.parseInt(cursor, 10) || 0) : 0;
  const page = items.slice(start, start + limit);
  const end = start + page.length;
  return { items: page, nextCursor: end < items.length ? String(end) : null, total: items.length };
}

export function findWish(id: number) {
  return APPROVED.find((w) => w.id === id) ?? pending.find((w) => w.id === id) ?? null;
}

export function submitWish(input: { name: string; text: string; image_url?: string }) {
  const wish: Wish = {
    id: nextId++,
    name: input.name.trim().slice(0, 80),
    text: input.text.trim().slice(0, 2000),
    ...(input.image_url ? { image_url: input.image_url } : {}),
    created_at: new Date().toISOString(),
  };
  pending.push(wish);
  return wish;
}
