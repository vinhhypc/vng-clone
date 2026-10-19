"use client";

import { useEffect, useRef } from "react";

/** Gradient dot that trails the pointer (lerp 0.28/frame) and reacts to links and portraits. */
export function CursorDot() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    document.body.setAttribute("data-cursor", "on");
    const dot = ref.current;
    if (!dot) return () => document.body.removeAttribute("data-cursor");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let mode = "";
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      const target = event.target instanceof Element ? event.target : null;
      const portrait = target?.closest('[data-cursor-mode="portrait"]');
      const grow = !portrait && target?.closest("a,button,[data-cursor-grow]");
      const next = portrait ? "portrait" : grow ? "grow" : "";
      if (next !== mode) {
        mode = next;
        dot.dataset.mode = mode;
      }
    };

    const tick = () => {
      x += (targetX - x) * 0.28;
      y += (targetY - y) * 0.28;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    tick();
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      document.body.removeAttribute("data-cursor");
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="cursor-dot" data-mode="" />;
}
