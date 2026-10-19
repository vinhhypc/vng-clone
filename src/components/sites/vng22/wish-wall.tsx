"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";
import { ASSET } from "./constants";
import { ShareWishButton, WishCard, type WishItem } from "./wish-card";

type Page = { items: WishItem[]; nextCursor: string | null; total: number | null };

const PAGE_SIZE = 60;
const BREAKPOINTS = [
  { query: "(min-width: 1280px)", columns: 6 },
  { query: "(min-width: 1024px)", columns: 5 },
  { query: "(min-width: 768px)", columns: 4 },
  { query: "(min-width: 640px)", columns: 3 },
];

function subscribeColumns(onChange: () => void) {
  const lists = BREAKPOINTS.map((b) => window.matchMedia(b.query));
  lists.forEach((l) => l.addEventListener("change", onChange));
  return () => lists.forEach((l) => l.removeEventListener("change", onChange));
}
const readColumns = () => BREAKPOINTS.find((b) => window.matchMedia(b.query).matches)?.columns ?? 2;
const useColumnCount = () => useSyncExternalStore(subscribeColumns, readColumns, () => 2);

/** Estimated card height, used to balance masonry columns before the cards render. */
const estimateHeight = (wish: WishItem, width = 320) =>
  (wish.image_url ? width * 0.75 : 0) + 40 + 22.5 * Math.max(1, Math.ceil(wish.text.length / 37)) + 16 + 20;

function Masonry({ items }: { items: WishItem[] }) {
  const columns = useColumnCount();
  const stacks = useMemo(() => {
    const out = Array.from({ length: Math.max(1, columns) }, () => ({ items: [] as WishItem[], height: 0 }));
    for (const wish of items) {
      let shortest = 0;
      for (let i = 1; i < out.length; i++) if (out[i].height < out[shortest].height) shortest = i;
      out[shortest].items.push(wish);
      out[shortest].height += estimateHeight(wish);
    }
    return out;
  }, [items, columns]);

  return (
    <div className="flex items-start gap-4" data-column-count={columns}>
      {stacks.map((stack, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col gap-4">
          {stack.items.map((wish) => (
            <div
              key={wish.id ?? wish.text}
              style={{ contentVisibility: "auto", containIntrinsicHeight: `auto ${Math.round(estimateHeight(wish))}px` }}
            >
              <WishCard wish={wish} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const randomSeed = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(36).padStart(2, "0")).join("");

/** Paged wishes from the local API; unsearched lists are shuffled with a per-visit seed. */
function useWishes(search: string) {
  const [seed] = useState(randomSeed);
  const [page, setPage] = useState<Page>({ items: [], nextCursor: null, total: null });
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (cursor: string | null): Promise<Page> => {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
      if (cursor) params.set("cursor", cursor);
      if (search) params.set("q", search);
      else params.set("seed", seed);
      const res = await fetch(`/api/wishes?${params}`);
      if (!res.ok) throw new Error(`wishes request failed (${res.status})`);
      return res.json();
    },
    [search, seed],
  );

  useEffect(() => {
    let cancelled = false;
    fetchPage(null)
      .then((first) => {
        if (cancelled) return;
        setPage(first);
        setLoaded(true);
        setError(null);
      })
      .catch((err: Error) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!page.nextCursor || loading) return;
    setLoading(true);
    try {
      const next = await fetchPage(page.nextCursor);
      setPage((prev) => ({ ...next, items: [...prev.items, ...next.items] }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [fetchPage, page.nextCursor, loading]);

  return { items: page.items, loading, setLoading, loaded, error, hasMore: page.nextCursor !== null, loadMore };
}

function useInfiniteSentinel(hasMore: boolean, loading: boolean, onLoadMore: () => void) {
  const state = useRef({ hasMore, loading, onLoadMore });
  useEffect(() => {
    state.current = { hasMore, loading, onLoadMore };
  });
  const observer = useRef<IntersectionObserver | null>(null);
  useEffect(() => () => observer.current?.disconnect(), []);
  return useCallback((el: HTMLDivElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const { hasMore: more, loading: busy, onLoadMore: load } = state.current;
        if (entry?.isIntersecting && more && !busy) load();
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    observer.current = io;
  }, []);
}

/** Downscale to ≤2048px WebP before upload, falling back to the original file. */
async function shrinkImage(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

type SubmitStatus = "idle" | "uploading" | "submitting" | "success" | "error";

function SubmitModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [submitted, setSubmitted] = useState<WishItem | null>(null);
  const [message, setMessage] = useState("");

  const pickFile = async (picked: File | undefined) => {
    if (!picked) return;
    if (picked.size > 20 * 1024 * 1024) {
      setMessage("Dung lượng ảnh tối đa là 20MB.");
      setStatus("error");
      return;
    }
    const shrunk = await shrinkImage(picked);
    setFile(shrunk);
    setPreview(URL.createObjectURL(shrunk));
    if (status === "error") {
      setStatus("idle");
      setMessage("");
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !text.trim()) {
      setMessage("Vui lòng điền đầy đủ tên và lời chúc.");
      setStatus("error");
      return;
    }
    try {
      let imageUrl = "";
      if (file) {
        setStatus("uploading");
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error || "Không thể upload hình ảnh.");
        }
        imageUrl = (await res.json()).url;
      }
      setStatus("submitting");
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text, image_url: imageUrl }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Không thể gửi lời chúc.");
      }
      const saved = await res.json().catch(() => null);
      setSubmitted(saved?.id !== undefined ? saved : { name, text, image_url: imageUrl });
      setStatus("success");
      setName("");
      setText("");
      setFile(null);
      setPreview(null);
    } catch (err) {
      setMessage((err as Error).message);
      setStatus("error");
    }
  };

  const fieldLabel = "block text-xs font-semibold uppercase tracking-wider text-muted";
  const fieldInput =
    "mt-2 w-full rounded-md border border-[color:var(--color-rule)] bg-surface-sunken px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent";
  const busy = status === "uploading" || status === "submitting" || status === "success";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-paper rounded-soft relative z-10 w-full max-w-md overflow-hidden border border-[color:var(--color-rule)] p-8 shadow-2xl">
        <button onClick={onClose} className="text-muted hover:text-ink absolute top-4 right-4 text-2xl" aria-label="Đóng">
          ×
        </button>
        <h3 className="font-display text-2xl font-bold tracking-tight">Gửi lời chúc VNG22</h3>
        <p className="text-muted mt-2 text-sm">Lời chúc của bạn sẽ được hiển thị ở trang Wishes sau khi được duyệt.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className={fieldLabel}>Tên của bạn</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldInput}
              placeholder="Nhập tên..."
            />
          </div>
          <div>
            <label className={fieldLabel}>Lời chúc</label>
            <textarea
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`${fieldInput} h-24 resize-none`}
              placeholder="Nhập lời chúc của bạn..."
            />
          </div>
          <div>
            <label className={fieldLabel}>Hình ảnh kèm theo (Không bắt buộc)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => pickFile(e.target.files?.[0])}
              className="text-muted file:bg-surface-sunken file:text-ink hover:file:bg-paper mt-2 w-full text-sm file:mr-4 file:rounded-md file:border file:border-[color:var(--color-rule)] file:px-4 file:py-2 file:text-xs file:font-semibold"
            />
            {preview ? (
              <div className="relative mt-4 h-24 w-fit overflow-hidden rounded-md border border-[color:var(--color-rule)]">
                <img src={preview} alt="Preview" className="h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ) : null}
          </div>
          {status === "error" ? <p className="text-xs font-semibold text-red-500">{message}</p> : null}
          {status === "success" ? (
            <div className="rounded-tight bg-surface-sunken flex flex-col gap-3 p-4">
              <p className="text-xs font-semibold text-green-600">Gửi lời chúc thành công! Đang chờ kiểm duyệt…</p>
              {submitted ? (
                <>
                  <p className="text-muted text-xs">Bạn có thể tải lời chúc của mình về ngay bây giờ.</p>
                  <ShareWishButton wish={submitted} variant="button" label="Tải lời chúc của tôi ↓" />
                </>
              ) : null}
            </div>
          ) : null}
          <div className="pt-2">
            <button
              type="submit"
              disabled={busy}
              className="bg-accent text-on-invert rounded-pill flex min-h-[50px] w-full items-center justify-center gap-3 px-7 text-[15px] font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "uploading" ? "Đang tải ảnh..." : status === "submitting" ? "Đang lưu lời chúc..." : "Gửi lời chúc"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SearchInput({ onSearch }: { onSearch: (value: string) => void }) {
  const [value, setValue] = useState("");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => onSearch(next.trim()), 300);
        }}
        placeholder="Tìm theo tên hoặc nội dung lời chúc…"
        aria-label="Tìm lời chúc"
        className="bg-paper rounded-pill focus:ring-accent w-full border border-[color:var(--color-rule)] py-3 pr-4 pl-5 text-[15px] focus:ring-2 focus:outline-none"
      />
    </div>
  );
}

/** Shows the wish named by `?wish=<id>` above the wall (used by shared links). */
export function SharedWish() {
  const id = useSearchParams().get("wish");
  const [state, setState] = useState<{ id: string | null; wish: WishItem | null; error: boolean }>({
    id: null,
    wish: null,
    error: false,
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/wishes/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`not found (${res.status})`);
        return res.json();
      })
      .then((wish: WishItem) => !cancelled && setState({ id, wish, error: false }))
      .catch(() => !cancelled && setState({ id, wish: null, error: true }));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) return null;
  const current = state.id === id ? state : { wish: null, error: false };
  return (
    <div className="mx-auto mb-12 flex max-w-sm flex-col items-center">
      {current.wish ? (
        <>
          <p className="eyebrow text-muted mb-4">Lời chúc bạn đang tìm</p>
          <div className="w-full">
            <WishCard wish={current.wish} highlighted />
          </div>
        </>
      ) : current.error ? (
        <p className="text-body text-muted text-center">
          Không tìm thấy lời chúc này — có thể chưa được duyệt hoặc đã bị xoá.
        </p>
      ) : (
        <p className="text-body text-muted">Đang tìm lời chúc…</p>
      )}
    </div>
  );
}

export function WishWall({ sharedWish }: { sharedWish?: ReactNode }) {
  const [search, setSearch] = useState("");
  const [composing, setComposing] = useState(false);
  const { items, loading, setLoading, loaded, error, hasMore, loadMore } = useWishes(search);
  const sentinel = useInfiniteSentinel(hasMore, loading, loadMore);
  const searching = search.length > 0;

  return (
    <>
      <div className="sticky top-[64px] z-30 flex justify-center pt-6 pb-4">
        <Link
          href="/"
          aria-label="VNG22 Human² — về trang chủ"
          className="bg-paper/80 rounded-pill border border-[color:var(--color-rule)] px-7 py-3 shadow-sm backdrop-blur-md"
        >
          <img src={`${ASSET}/brand/logo-lockup.webp`} alt="VNG22 Human²" className="h-12 w-auto sm:h-14" />
        </Link>
      </div>
      <section aria-label="Tất cả lời chúc" className="px-4 sm:px-6">
        {sharedWish}
        {error ? (
          <p className="text-body text-muted py-20 text-center">Không tải được lời chúc — thử lại sau.</p>
        ) : !loaded ? (
          <p className="text-body text-muted py-20 text-center">Đang tải…</p>
        ) : items.length === 0 ? (
          <p className="text-body text-muted py-20 text-center">
            {searching ? `Không tìm thấy lời chúc nào khớp "${search}".` : "Chưa có lời chúc nào được duyệt."}
          </p>
        ) : (
          <>
            <Masonry items={items} />
            <div ref={sentinel} aria-hidden="true" className="h-px" />
            {loading ? (
              <p className="text-muted py-10 text-center text-sm">Đang tải thêm…</p>
            ) : hasMore ? null : (
              <p className="text-muted py-10 text-center text-sm">Bạn đã xem hết lời chúc.</p>
            )}
          </>
        )}
        <div className="pointer-events-none sticky bottom-0 z-30">
          <div className="flex justify-center px-4 pt-6 pb-5">
            <div className="bg-paper/85 rounded-soft pointer-events-auto w-full max-w-2xl border border-[color:var(--color-rule)] p-3 shadow-lg backdrop-blur-md">
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={() => setComposing(true)}
                  className="bg-accent text-on-invert rounded-pill inline-flex min-h-[48px] shrink-0 items-center justify-center gap-3 px-6 text-[15px] font-medium"
                >
                  Gửi lời chúc <span aria-hidden="true">↗</span>
                </button>
                <div className="flex-1">
                  <SearchInput
                    onSearch={(value) => {
                      if (value === search) return;
                      setLoading(true);
                      setSearch(value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {composing ? <SubmitModal onClose={() => setComposing(false)} /> : null}
    </>
  );
}
