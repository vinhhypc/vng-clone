"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ASSET } from "./constants";

type Ratio = "1:1" | "9:16";
type Rect = { x: number; y: number; width: number; height: number };
type Transform = { zoom: number; offsetXFrac: number; offsetYFrac: number };

const FRAMES: Record<Ratio, { label: string; src: string; width: number; height: number; window: Rect }> = {
  "1:1": {
    label: "Vuông",
    src: `${ASSET}/frames/frame-1x1.webp`,
    width: 1080,
    height: 1080,
    window: { x: 177, y: 177, width: 726, height: 719 },
  },
  "9:16": {
    label: "Dọc",
    src: `${ASSET}/frames/frame-9x16.webp`,
    width: 1080,
    height: 1920,
    window: { x: 149, y: 151, width: 783, height: 1601 },
  },
};

const RESET: Transform = { zoom: 1, offsetXFrac: 0, offsetYFrac: 0 };
const MAX_BYTES = 20 * 1024 * 1024;

const clamp = (value: number, limit: number) => Math.min(Math.max(value, -limit), limit);
const clampZoom = (zoom: number) => (Number.isFinite(zoom) ? Math.min(Math.max(zoom, 1), 3) : 1);
/** Maximum offset that still keeps the photo covering the window. */
const slack = (scaled: number, box: number) => Math.max(0, (scaled - box) / 2) + 0.5 * box;
const coverScale = (w: number, h: number, boxW: number, boxH: number) =>
  w <= 0 || h <= 0 || boxW <= 0 || boxH <= 0 ? 1 : Math.max(boxW / w, boxH / h);

function placePhoto(w: number, h: number, boxW: number, boxH: number, t: Transform): Rect {
  const scale = coverScale(w, h, boxW, boxH) * clampZoom(t.zoom);
  const width = w * scale;
  const height = h * scale;
  const dx = clamp(t.offsetXFrac * boxW, slack(width, boxW));
  const dy = clamp(t.offsetYFrac * boxH, slack(height, boxH));
  return { x: (boxW - width) / 2 + dx, y: (boxH - height) / 2 + dy, width, height };
}

/** The photo window, padded by 4px so no seam shows under the frame artwork. */
function photoWindow(frame: (typeof FRAMES)[Ratio]): Rect {
  const x = Math.max(0, frame.window.x - 4);
  const y = Math.max(0, frame.window.y - 4);
  return {
    x,
    y,
    width: Math.min(frame.width - x, frame.window.width + 8),
    height: Math.min(frame.height - y, frame.window.height + 8),
  };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Không thể tải ảnh."));
    img.src = src;
  });
}

export function FrameStudio() {
  const [ratio, setRatio] = useState<Ratio>("1:1");
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [transform, setTransform] = useState<Transform>(RESET);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const frame = FRAMES[ratio];
  const win = photoWindow(frame);
  const box = { width: (size.width * win.width) / frame.width, height: (size.height * win.height) / frame.height };
  const placed = photo ? placePhoto(photo.naturalWidth, photo.naturalHeight, box.width, box.height, transform) : null;

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.contentBoxSize?.[0];
      setSize(box ? { width: box.inlineSize, height: box.blockSize } : { width: el.clientWidth, height: el.clientHeight });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ratio]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  useEffect(() => {
    const el = stageRef.current;
    if (!el || !photo) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setTransform((t) => ({ ...t, zoom: clampZoom(t.zoom - 0.001 * event.deltaY) }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [photo]);

  const choose = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) return setError("Vui lòng chọn một tệp ảnh.");
    if (file.size > MAX_BYTES) return setError("Ảnh quá lớn (tối đa 20MB).");
    try {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setPhoto(await loadImage(url));
      setTransform(RESET);
    } catch {
      setError("Không đọc được ảnh này, thử ảnh khác nhé.");
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!photo) return;
    (event.target as Element).setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY };
    setDragging(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const last = dragRef.current;
    if (!photo || !last || size.width === 0) return;
    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    dragRef.current = { x: event.clientX, y: event.clientY };
    setTransform((t) => {
      const scale = coverScale(photo.naturalWidth, photo.naturalHeight, box.width, box.height) * clampZoom(t.zoom);
      const limitX = box.width > 0 ? slack(photo.naturalWidth * scale, box.width) / box.width : 0;
      const limitY = box.height > 0 ? slack(photo.naturalHeight * scale, box.height) / box.height : 0;
      return {
        ...t,
        offsetXFrac: clamp(t.offsetXFrac + dx / (box.width || 1), limitX),
        offsetYFrac: clamp(t.offsetYFrac + dy / (box.height || 1), limitY),
      };
    });
  };

  const endDrag = () => {
    dragRef.current = null;
    setDragging(false);
  };

  const download = async () => {
    if (!photo) return;
    setExporting(true);
    setError("");
    try {
      const art = await loadImage(frame.src);
      const canvas = document.createElement("canvas");
      canvas.width = frame.width;
      canvas.height = frame.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas không khả dụng.");
      const rect = placePhoto(photo.naturalWidth, photo.naturalHeight, win.width, win.height, transform);
      ctx.save();
      ctx.beginPath();
      ctx.rect(win.x, win.y, win.width, win.height);
      ctx.clip();
      ctx.drawImage(photo, win.x + rect.x, win.y + rect.y, rect.width, rect.height);
      ctx.restore();
      ctx.drawImage(art, 0, 0, frame.width, frame.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Không xuất được ảnh.");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vng22-khung-${ratio === "1:1" ? "vuong" : "doc"}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Không xuất được ảnh, thử lại nhé.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <p className="text-body text-muted max-w-copy">
        Bạn có thể chọn tỷ lệ khung ảnh mong muốn, tải ảnh lên, căn chỉnh phù hợp và tải ảnh đã có khung VNG22 về máy.
        Đừng quên lan tỏa trên các kênh mạng xã hội kèm hashtag{" "}
        <span className="text-accent font-semibold">#LifeatVNG #VNG22</span> để cùng VNG chúc mừng cột mốc tuổi 22 nhé!
      </p>
      <div className="mt-6 flex flex-col items-start gap-10 lg:flex-row">
        <div className="flex flex-col items-center gap-4">
          <div
            ref={stageRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="rounded-soft relative w-[min(80vw,420px)] touch-none overflow-hidden border border-[color:var(--color-rule)] bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#ffffff_0%_50%)] bg-[length:24px_24px] select-none"
            style={{ aspectRatio: `${frame.width} / ${frame.height}` }}
          >
            {photo && placed ? (
              <div
                className="absolute overflow-hidden"
                style={{
                  left: `${(win.x / frame.width) * 100}%`,
                  top: `${(win.y / frame.height) * 100}%`,
                  width: `${(win.width / frame.width) * 100}%`,
                  height: `${(win.height / frame.height) * 100}%`,
                }}
              >
                <img
                  src={photo.src}
                  alt=""
                  draggable={false}
                  className={`absolute ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
                  style={{
                    left: placed.x,
                    top: placed.y,
                    width: placed.width,
                    height: placed.height,
                    maxWidth: "none",
                    maxHeight: "none",
                  }}
                />
              </div>
            ) : null}
            <img src={frame.src} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
          </div>
          {photo ? (
            <div className="flex w-[min(80vw,420px)] items-center gap-3">
              <span className="eyebrow text-muted shrink-0">Phóng to</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={transform.zoom}
                onChange={(event) => setTransform((t) => ({ ...t, zoom: clampZoom(Number(event.target.value)) }))}
                className="w-full"
                aria-label="Phóng to ảnh"
              />
            </div>
          ) : null}
        </div>
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div>
            <p className="eyebrow text-muted mb-3">Tỉ lệ khung</p>
            <div className="flex gap-3">
              {(Object.keys(FRAMES) as Ratio[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setRatio(key);
                    setTransform(RESET);
                  }}
                  aria-pressed={ratio === key}
                  className={`rounded-pill border px-5 py-2.5 text-sm font-semibold transition-colors ${
                    ratio === key
                      ? "bg-accent text-on-invert border-transparent"
                      : "text-ink border-[color:var(--color-rule)]"
                  }`}
                >
                  {FRAMES[key].label} ({key})
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="eyebrow text-muted mb-3 block">{photo ? "Chọn ảnh khác" : "Chọn ảnh"}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => choose(event.target.files?.[0])}
              className="text-muted file:bg-surface-sunken file:text-ink hover:file:bg-paper w-full text-sm file:mr-4 file:rounded-md file:border file:border-[color:var(--color-rule)] file:px-4 file:py-2 file:text-xs file:font-semibold"
            />
          </div>
          {error ? <p className="text-xs font-semibold text-red-500">{error}</p> : null}
          {photo ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setTransform(RESET)}
                className="rounded-pill text-ink border border-[color:var(--color-rule)] px-5 py-2.5 text-sm font-semibold"
              >
                Đặt lại
              </button>
              <button
                type="button"
                onClick={download}
                disabled={exporting}
                className="bg-accent text-on-invert rounded-pill px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting ? "Đang xuất..." : "Tải ảnh xuống"}
              </button>
            </div>
          ) : null}
          <p className="text-muted text-xs">Ảnh được xử lý trực tiếp trên trình duyệt của bạn và không lưu trên máy chủ.</p>
        </div>
      </div>
    </>
  );
}
