import { useEffect, useRef, useState, type ReactNode } from "react";
import OneOhOneCard from "./OneOhOneCard";
import RatioIllustration from "./illustrations/RatioIllustration";

type Props = {
  open: boolean;
  onClose: () => void;
};

type CardData = {
  headline: string;
  body: string;
  illustration?: ReactNode;
  illustrationLabel?: string;
};

const CARDS: CardData[] = [
  {
    headline: "How strong is strong?",
    body: "The ratio of coffee to water decides how your brew tastes. More coffee per water makes a bolder cup. Less makes a brighter, lighter one. Everything else — temperature, time, grind — balances around this one decision.",
    illustration: <RatioIllustration />,
    illustrationLabel:
      "A balance scale with coffee on one pan and water on the other, tilting and settling level.",
  },
  {
    headline: "Hot, but not too hot.",
    body: "Water temperature controls how fast coffee extracts. Hotter water pulls flavor quickly — great for dense dark roasts, harsh on delicate light ones. Lighter roasts want near-boiling water. Darker roasts want slightly cooler. The app picks the right temp for your beans.",
  },
  {
    headline: "Bigger grind, slower brew.",
    body: "In a French press, coffee sits in water for minutes. Coarse grind is essential — fine grind over-extracts, turns bitter, and slips past the mesh filter. Think sea salt, not table salt.",
  },
  {
    headline: "Let it breathe.",
    body: "Fresh coffee holds trapped CO₂ from roasting. Pour a little water first and the grounds puff up, releasing gas. Skip this, and the gas blocks even extraction. The first 45 seconds of the brew are just the coffee breathing out.",
  },
  {
    headline: "Four minutes to flavor.",
    body: "Different compounds extract at different rates. Sweetness and body come out first; bitterness comes out last. Four minutes is the sweet spot where the good stuff is in the cup and the harsh stuff hasn't arrived yet.",
  },
  {
    headline: "Don't leave it sitting.",
    body: "Plunging doesn't stop extraction — it just separates the bulk of the grounds from the filter. Any coffee left in the press keeps brewing, and keeps getting bitter. Pour it all out when you're done. The second cup waits in a mug, not the press.",
  },
];

const SWIPE_THRESHOLD_PX = 50;

export default function OneOhOneOverlay({ open, onClose }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") {
        setActiveIndex((i) => Math.min(i + 1, CARDS.length - 1));
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const card = CARDS[activeIndex];
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < CARDS.length - 1;

  const goPrev = () => canPrev && setActiveIndex((i) => i - 1);
  const goNext = () => {
    if (canNext) setActiveIndex((i) => i + 1);
    else onClose();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    const delta = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    if (delta <= -SWIPE_THRESHOLD_PX) goNext();
    else if (delta >= SWIPE_THRESHOLD_PX) goPrev();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="French Press 101"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 animate-[fade-in_180ms_ease-out]"
      />
      <div className="relative flex h-[88dvh] w-full max-w-[480px] flex-col rounded-t-3xl bg-cream shadow-2xl animate-[slide-up_260ms_cubic-bezier(0.2,0.8,0.2,1)]">
        <div className="relative pt-3">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-hairline" />
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-2 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-hairline/40 hover:text-ink"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M3 3 L13 13 M13 3 L3 13" />
            </svg>
          </button>
        </div>
        <div className="px-6 pb-3 pt-4">
          <span className="text-xs uppercase tracking-[0.2em] text-muted">
            101
          </span>
        </div>

        <div
          className="relative flex min-h-0 flex-1"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <NavChevron
            direction="prev"
            visible={canPrev}
            onClick={goPrev}
          />
          <div key={activeIndex} className="flex min-w-0 flex-1">
            <OneOhOneCard
              headline={card.headline}
              body={card.body}
              illustration={card.illustration}
              illustrationLabel={card.illustrationLabel}
            />
          </div>
          <NavChevron
            direction="next"
            visible={canNext}
            onClick={goNext}
          />
        </div>

        <div className="flex items-center justify-center gap-2 pb-6 pt-4">
          {CARDS.map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                type="button"
                aria-label={`Go to card ${i + 1}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => setActiveIndex(i)}
                className="flex h-6 w-6 items-center justify-center"
              >
                <span
                  className={`h-2 w-2 rounded-full transition-colors ${
                    isActive ? "bg-accent" : "bg-hairline"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NavChevron({
  direction,
  visible,
  onClick,
}: {
  direction: "prev" | "next";
  visible: boolean;
  onClick: () => void;
}) {
  if (!visible) return <span className="w-6 shrink-0 md:w-10" aria-hidden />;
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      aria-label={isPrev ? "Previous card" : "Next card"}
      onClick={onClick}
      className={`hidden shrink-0 items-center justify-center self-center text-muted transition-colors hover:text-ink md:flex md:w-10 ${
        isPrev ? "" : ""
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {isPrev ? (
          <path d="M11 3 L5 9 L11 15" />
        ) : (
          <path d="M7 3 L13 9 L7 15" />
        )}
      </svg>
    </button>
  );
}
