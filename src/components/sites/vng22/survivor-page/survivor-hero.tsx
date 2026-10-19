/* eslint-disable @next/next/no-img-element */
import { ASSET } from "../constants";
import survivors from "../data/survivors.json";

const STRIP = survivors.map((s) => s.username).join("   ·   ");

const STATS = [
  { value: "550", label: "VNG Survivors" },
  { value: "13%", label: "tổng số nhân viên" },
  { value: "+101", label: "Survivors trong năm 2026" },
];

const PLATE_MASK =
  "linear-gradient(to right, transparent 0%, rgb(0 0 0 / 0.35) 18%, rgb(0 0 0 / 1) 46%), linear-gradient(to bottom, transparent 0%, rgb(0 0 0 / 1) 16%)";

/** Ten rows of drifting Survivor handles, alternating direction, size and tint. */
function CodeMarquee() {
  return (
    <div
      aria-hidden="true"
      className="code-marquee pointer-events-none absolute inset-0 flex flex-col justify-center gap-2 overflow-hidden select-none"
    >
      {Array.from({ length: 10 }, (_, i) => {
        const odd = i % 2 === 1;
        return (
          <div key={i} className="overflow-hidden">
            <div
              className="code-row"
              style={{
                animationName: odd ? "marquee-drift-reverse" : "marquee-drift",
                animationDuration: `${190 + 23 * i}s`,
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
                fontFamily: "var(--font-mono)",
                fontSize: odd ? "19px" : "17px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: odd
                  ? "color-mix(in oklab, var(--color-accent) 68%, transparent)"
                  : "color-mix(in oklab, var(--color-ink) 42%, transparent)",
              }}
            >
              <span>{STRIP}</span>
              <span>{STRIP}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SurvivorHero() {
  return (
    <section aria-label="VNG Survivor" className="relative isolate flex min-h-[1100px] flex-col overflow-hidden">
      <div className="relative flex-1 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 -z-20 aspect-[1800/1520] opacity-[var(--ripple-plate-opacity-hero)]"
          style={{
            maskImage: PLATE_MASK,
            maskComposite: "intersect",
            WebkitMaskImage: PLATE_MASK,
            WebkitMaskComposite: "source-in",
          }}
        >
          <img
            src={`${ASSET}/ripple/plate-survivor-bg.webp`}
            alt=""
            className="pointer-events-none h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 -z-10">
          <CodeMarquee />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(100deg, var(--color-paper) 0%, var(--color-paper) 34%, color-mix(in oklab, var(--color-paper) 62%, transparent) 52%, color-mix(in oklab, var(--color-paper) 18%, transparent) 72%, transparent 92%)",
          }}
        />
        <div className="max-w-page mx-auto flex h-full w-full flex-col justify-center px-6 pt-40 pb-20">
          <h1 className="font-display text-[clamp(3.5rem,12vw,11rem)] leading-[0.95] font-bold tracking-tight">
            <span className="reveal-line">
              <span>VNG</span>
            </span>
            <span className="reveal-line">
              <span className="text-accent uppercase">Survivor</span>
            </span>
          </h1>
          <p className="text-muted mt-8 max-w-[620px] text-[1.75rem] leading-snug">
            <span className="block">Hành trình 22 năm được bồi đắp bởi</span>
            <span className="block">sự đồng hành của tập thể</span>
          </p>
        </div>
      </div>
      <div className="bg-paper rule-top relative">
        <dl className="max-w-page mx-auto grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="px-8 py-9 lg:border-r lg:border-[color:var(--color-rule)]">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="font-display block text-[clamp(34px,4.4vw,68px)] leading-none font-bold tracking-tight">
                  {stat.value}
                </span>
                <span className="eyebrow text-muted mt-3.5 block">{stat.label}</span>
              </dd>
            </div>
          ))}
          <div className="px-8 py-9">
            <p className="text-body text-ink font-medium">
              Mang tinh thần Survivor là không ngừng cống hiến và phát triển.
            </p>
          </div>
        </dl>
        <div className="max-w-page rule-top mx-auto px-6 py-9">
          <p className="text-body text-muted max-w-[760px]">
            Sau 22 năm dẫn đầu nhiều làn sóng công nghệ, VNG đang bước vào kỷ nguyên AI. Trên hành trình này, chúng tôi
            tự hào khi có những chiến binh đồng hành suốt 10, 15, thậm chí 20 năm một cách bền bỉ. Họ được gọi gần gũi
            là Survivor - những người đã nhiều lần chọn cùng VNG đón nhận thách thức và tiếp tục trưởng thành.
          </p>
        </div>
      </div>
    </section>
  );
}
