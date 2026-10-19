/* eslint-disable @next/next/no-img-element */
import { ASSET } from "./constants";

/** Subpage masthead: either a banner image or a ripple plate, then title and lead copy. */
export function PageHeader({
  banner,
  plate = "hero",
  name,
  description = [],
  wideDescription = false,
  align = "start",
}: {
  banner?: string;
  plate?: string;
  name: string;
  description?: string[];
  wideDescription?: boolean;
  align?: "start" | "center";
}) {
  const centered = align === "center";
  return (
    <header className={`max-w-page mx-auto px-6 pt-32 ${centered ? "text-center" : ""}`}>
      {banner ? (
        <div className="shot rounded-tight bg-surface-sunken overflow-hidden">
          <img src={banner} alt="" className="block h-auto w-full" />
        </div>
      ) : (
        <div className="shot rounded-tight bg-surface-sunken relative h-[240px] overflow-hidden sm:h-[380px]">
          <div aria-hidden="true" className="absolute inset-0">
            <img
              src={`${ASSET}/ripple/plate-${plate}.webp`}
              alt=""
              aria-hidden="true"
              className="pointer-events-none h-full w-full object-cover"
            />
          </div>
        </div>
      )}
      <h1
        className={`font-display mt-10 font-bold tracking-tight ${
          name.length > 40 ? "text-[clamp(1.75rem,3.6vw,3.25rem)] leading-[1.15]" : "text-display"
        }`}
      >
        {name}
      </h1>
      {description.length > 0 ? (
        <div
          className={`mt-6 flex flex-col gap-5 ${wideDescription ? "" : "max-w-copy"} ${centered && !wideDescription ? "mx-auto" : ""}`}
        >
          {description.map((line, i) => (
            <p key={i} className={i === 0 ? "text-body-lg" : "text-body text-muted"}>
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </header>
  );
}
