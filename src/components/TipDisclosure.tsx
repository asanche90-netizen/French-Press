import type { ReactNode } from "react";

// Inline tappable info glyph used to disclose contextual tips
// (currently the "no thermometer?" hint). The icon itself is small
// for visual quietness; a `before:` pseudo-element extends the hit
// area to 44×44 so it stays reliably tappable on touch.
export function TipToggleIcon({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={open ? "Hide tip" : "Show tip"}
      aria-expanded={open}
      className={`relative flex h-5 w-5 items-center justify-center transition-colors before:absolute before:-inset-3 before:content-[''] ${
        open ? "text-accent" : "text-muted hover:text-ink"
      }`}
    >
      <InfoIcon />
    </button>
  );
}

// The disclosed tip text. Renders only when open; fades in on mount.
export function TipReveal({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs text-muted animate-[fade-in_180ms_ease-out]">
      {children}
    </p>
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
      className="shrink-0"
    >
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
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
