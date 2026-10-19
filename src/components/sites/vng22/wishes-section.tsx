import { sourceUrl } from "./constants";
import wishesData from "./data/wishes.json";

type Wish = { id: number; name: string; text: string; team?: string };

const DURATIONS = [92, 116, 104];

/** Repeat the approved wishes until the 3×4 wall is full. */
function fillWall(items: Wish[], columns = 3, rows = 4) {
  const target = columns * rows;
  if (items.length === 0 || items.length >= target) return items;
  const out: Wish[] = [];
  while (out.length < target) out.push(...items);
  return out.slice(0, target);
}

const WALL = fillWall(wishesData as Wish[]);

function WishCard({ wish, hidden }: { wish: Wish; hidden: boolean }) {
  return (
    <article
      aria-hidden={hidden ? "true" : undefined}
      className="bg-paper rounded-tight relative overflow-hidden border border-[color:var(--color-rule)]"
    >
      <div className="p-5">
        <p className="text-[15px] leading-normal break-words">{wish.text}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="eyebrow text-ink-brand">
            — {wish.name}
            {wish.team ? ` · ${wish.team}` : ""}
          </p>
        </div>
      </div>
    </article>
  );
}

export function WishesSection() {
  return (
    <section id="wishes" aria-labelledby="wishes-title" className="max-w-page mx-auto px-6 py-32">
      <div className="grid gap-16 md:grid-cols-[0.7fr_1.3fr] md:items-center">
        <div>
          <h2
            id="wishes-title"
            className="text-title font-display hover-gradient-text w-fit cursor-default leading-[1.25]"
          >
            Lời chúc VNG22
          </h2>
          <div className="mt-8">
            <a
              href={sourceUrl("/wish-wall")}
              className="bg-accent text-on-invert rounded-pill inline-flex min-h-[52px] items-center gap-3 px-7 text-[15px] font-medium"
            >
              Gửi lời chúc đến VNG <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <div className="wish-wall stage h-[600px]">
          <div className="grid h-full grid-cols-2 items-start gap-3 lg:grid-cols-3">
            {DURATIONS.map((duration, column) => {
              const items = WALL.filter((_, i) => i % 3 === column);
              return (
                <div
                  key={column}
                  className={`wish-track ${column === 2 ? "hidden lg:flex" : ""}`}
                  style={{
                    animationName: column % 2 === 1 ? "wish-drift-down" : "wish-drift-up",
                    animationDuration: `${duration}s`,
                  }}
                >
                  {[false, true].map((hidden) =>
                    items.map((wish, i) => (
                      <WishCard key={`${hidden ? "clone" : "row"}-${i}-${wish.id}`} wish={wish} hidden={hidden} />
                    )),
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
