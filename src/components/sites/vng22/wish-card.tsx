"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

export type WishItem = { id?: number; name: string; text: string; image_url?: string; team?: string };

export function ShareWishButton({
  wish,
  variant = "link",
  label = "Chia sẻ ↓",
}: {
  wish: WishItem;
  variant?: "link" | "button";
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  if (wish.id === undefined) return null;

  const download = async () => {
    setBusy(true);
    try {
      const { downloadWishCard } = await import("./wish-card-image");
      await downloadWishCard(wish);
    } catch {
      // Rendering is best-effort; the button simply re-enables.
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={download}
      disabled={busy}
      aria-label="Tải lời chúc này về dưới dạng ảnh"
      className={
        variant === "button"
          ? "bg-accent text-on-invert rounded-pill inline-flex min-h-[44px] items-center justify-center gap-2 px-6 text-[14px] font-medium disabled:opacity-50"
          : "text-muted hover:text-ink-brand shrink-0 text-[13px] disabled:opacity-50"
      }
    >
      {busy ? "Đang tạo ảnh…" : label}
    </button>
  );
}

export function WishCard({
  wish,
  hidden = false,
  highlighted = false,
  showShare = false,
}: {
  wish: WishItem;
  hidden?: boolean;
  highlighted?: boolean;
  showShare?: boolean;
}) {
  return (
    <article
      aria-hidden={hidden ? "true" : undefined}
      className={`bg-paper rounded-tight relative overflow-hidden border ${
        highlighted ? "border-accent border-2" : "border border-[color:var(--color-rule)]"
      }`}
    >
      {wish.image_url ? <img src={wish.image_url} alt="" loading="lazy" className="block h-auto w-full" /> : null}
      <div className="p-5">
        <p className="text-[15px] leading-normal break-words">{wish.text}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="eyebrow text-ink-brand">
            — {wish.name}
            {wish.team ? ` · ${wish.team}` : ""}
          </p>
          {showShare ? <ShareWishButton wish={wish} /> : null}
        </div>
      </div>
    </article>
  );
}
