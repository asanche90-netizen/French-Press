import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

// Small contextual hint pill used wherever a "did you know" / "no
// thermometer?" style note appears. Sits as an inline-flex chip with
// a built-in top margin so it visually detaches from whatever
// measurement or step subtitle precedes it.
export default function TipCallout({ children }: Props) {
  return (
    <div className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-hairline px-3 py-1.5">
      <InfoIcon />
      <span className="text-xs text-muted">{children}</span>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-muted"
    >
      <circle
        cx="7"
        cy="7"
        r="6"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="7" cy="4.2" r="0.8" fill="currentColor" />
      <line
        x1="7"
        y1="6"
        x2="7"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
