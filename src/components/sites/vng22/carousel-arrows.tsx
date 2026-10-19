const buttonClass =
  "text-muted hover:text-accent hover:border-accent grid h-8 w-8 place-items-center rounded-full border border-[color:var(--color-rule)] transition-colors";

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={direction === "left" ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function CarouselArrows({
  onLeft,
  onRight,
  leftLabel,
  rightLabel,
  className = "",
}: {
  onLeft: () => void;
  onRight: () => void;
  leftLabel: string;
  rightLabel: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button type="button" aria-label={leftLabel} onClick={onLeft} className={buttonClass}>
        <Chevron direction="left" />
      </button>
      <button type="button" aria-label={rightLabel} onClick={onRight} className={buttonClass}>
        <Chevron direction="right" />
      </button>
    </div>
  );
}
