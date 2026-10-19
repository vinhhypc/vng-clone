"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ROUTES } from "./constants";
import { LETTERS, hasOwnPage, letterContent, type Letter } from "./letters";

function LetterCard({ letter, index, onSelect }: { letter: Letter; index: number; onSelect: (l: Letter) => void }) {
  const { excerpt } = letterContent(letter);
  const shape =
    index % 2 === 1
      ? "rounded-tr-[40px] rounded-bl-[24px] rounded-tl-[8px] rounded-br-[8px]"
      : "rounded-tl-[40px] rounded-br-[24px] rounded-tr-[8px] rounded-bl-[8px]";
  const className = `group relative bg-paper border border-rule ${shape} p-6 md:p-8 transition-all duration-300 hover:border-vng-orange/50 hover:shadow-xl cursor-pointer flex flex-col justify-between gap-4 w-full text-left`;
  const label = `Đọc thư: ${letter.subject}`;
  const body = (
    <div>
      <h3 className="font-display text-ink group-hover:text-vng-orange mb-3 text-xl leading-snug font-bold transition-colors md:text-2xl">
        {letter.subject}
      </h3>
      <p className="font-body text-muted line-clamp-2 text-base leading-relaxed">{excerpt}</p>
    </div>
  );

  return hasOwnPage(letter) ? (
    <Link href={ROUTES.letter2026} aria-label={label} className={className}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={() => onSelect(letter)} aria-label={label} className={className}>
      {body}
    </button>
  );
}

function LetterModal({ letter, onClose }: { letter: Letter; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const { body, lang } = letterContent(letter);

  return (
    <div
      className="bg-ink/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md md:p-8"
      onClick={onClose}
    >
      <div
        className="bg-paper border-rule relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-rule bg-vng-mist/40 flex items-start justify-between gap-4 border-b p-6 md:p-8">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="bg-vng-orange/10 text-vng-orange rounded-full px-2.5 py-0.5 font-mono text-xs font-medium">
                Sinh Nhật VNG {letter.year}
              </span>
            </div>
            <h2 className="font-display text-ink text-2xl leading-tight font-bold md:text-3xl">{letter.subject}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="border-rule bg-paper text-muted hover:text-ink hover:border-vng-orange flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="font-body text-ink flex-1 overflow-y-auto p-6 text-base leading-relaxed md:p-8">
          {/* Letter HTML comes from the snapshot of the source site's own content. */}
          <div lang={lang} dangerouslySetInnerHTML={{ __html: body }} className="email-rendered-body" />
        </div>
        <div className="border-rule bg-vng-mist/40 flex items-center justify-end border-t p-4 px-6 md:px-8">
          <button
            onClick={onClose}
            className="bg-vng-orange text-paper hover:bg-vng-orange/90 rounded-lg px-4 py-2 font-mono text-xs font-semibold transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
}

export function LettersTimeline() {
  const [selected, setSelected] = useState<Letter | null>(null);
  const byYear = useMemo(() => {
    const groups = new Map<number, Letter[]>();
    for (const letter of LETTERS) {
      const list = groups.get(letter.year) ?? [];
      list.push(letter);
      groups.set(letter.year, list);
    }
    return [...groups.entries()].sort((a, b) => b[0] - a[0]);
  }, []);

  return (
    <>
      <section className="mx-auto max-w-[760px] px-6 pt-16 pb-24">
        <div className="relative space-y-16 pl-6 md:pl-10">
          <div className="from-vng-orange via-vng-blue to-vng-yellow/50 absolute top-4 bottom-4 left-2.5 w-0.5 rounded-full bg-gradient-to-b md:left-4" />
          {byYear.map(([year, letters]) => (
            <div key={year} className="group relative">
              <div className="bg-paper border-vng-orange absolute top-0.5 -left-6 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-md md:-left-10">
                <div className="bg-vng-orange h-2.5 w-2.5 rounded-full" />
              </div>
              <div className="mb-6">
                <h2 className="font-display text-ink text-2xl font-bold tracking-tight tabular-nums md:text-3xl">{year}</h2>
              </div>
              <div className="flex w-full flex-col gap-6">
                {letters.map((letter, i) => (
                  <LetterCard key={letter.id} letter={letter} index={i} onSelect={setSelected} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      {selected ? <LetterModal letter={selected} onClose={() => setSelected(null)} /> : null}
    </>
  );
}
