import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function OneOhOneOverlay({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
      <div className="relative flex w-full max-w-[480px] flex-col rounded-t-3xl bg-cream shadow-2xl animate-[slide-up_260ms_cubic-bezier(0.2,0.8,0.2,1)] h-[88dvh]">
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
        <div className="px-6 pt-4">
          <span className="text-xs uppercase tracking-[0.2em] text-muted">
            101
          </span>
        </div>
        <div className="flex-1" />
      </div>
    </div>
  );
}
