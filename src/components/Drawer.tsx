import { useEffect, type ReactNode } from "react";

export type DrawerOption<T extends string> = {
  value: T;
  label: string;
  secondary?: string;
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
};

type Props<T extends string> = {
  open: boolean;
  title: string;
  options: DrawerOption<T>[];
  activeValue: T;
  onSelect: (value: T) => void;
  onClose: () => void;
};

export default function Drawer<T extends string>({
  open,
  title,
  options,
  activeValue,
  onSelect,
  onClose,
}: Props<T>) {
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
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 animate-[fade-in_180ms_ease-out]"
      />
      <div className="relative w-full max-w-[480px] rounded-t-3xl bg-cream pb-8 pt-3 shadow-2xl animate-[slide-up_220ms_cubic-bezier(0.2,0.8,0.2,1)]">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-hairline" />
        <div className="px-6 pb-3">
          <h2 className="text-lg font-medium text-ink">{title}</h2>
        </div>
        <ul className="divide-y divide-hairline border-t border-hairline">
          {options.map((opt) => {
            const isActive = opt.value === activeValue;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(opt.value);
                    onClose();
                  }}
                  className={`flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-hairline/30 ${
                    isActive ? "text-accent" : "text-ink"
                  }`}
                >
                  {opt.leftAdornment && (
                    <span className="shrink-0">{opt.leftAdornment}</span>
                  )}
                  <span className="flex-1">
                    <span className="block font-medium">{opt.label}</span>
                    {opt.secondary && (
                      <span className="block text-sm text-muted">
                        {opt.secondary}
                      </span>
                    )}
                  </span>
                  {opt.rightAdornment && (
                    <span className="shrink-0">{opt.rightAdornment}</span>
                  )}
                  {isActive && (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-accent"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
