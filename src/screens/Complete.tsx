import { useEffect, useState } from "react";
import SaveRecipeModal from "../components/SaveRecipeModal";

type Screen = "method-select" | "home" | "brew" | "complete";

export type RecapRow = {
  label: string;
  value: string;
  mono?: boolean;
};

type SaveProps =
  | {
      canSave: false;
    }
  | {
      canSave: true;
      saveSummary: string;
      onSave: (name: string) => void;
    };

type Props = {
  recap: RecapRow[];
  summary: string;
  onNavigate: (screen: Screen) => void;
} & SaveProps;

export default function Complete(props: Props) {
  const { recap, summary, onNavigate } = props;
  const [saveOpen, setSaveOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(id);
  }, [toast]);

  const handleSave = (name: string) => {
    if (!props.canSave) return;
    props.onSave(name);
    setSaveOpen(false);
    setToast(`Saved “${name}”`);
  };

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5">
        <header className="flex items-center justify-between py-4">
          <span aria-hidden="true" />
          <span className="text-sm text-muted">Done</span>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
          <div className="flex flex-col items-center gap-6">
            <CheckBadge />
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-light tracking-tight text-ink">
                Enjoy.
              </h1>
              <p className="text-sm text-muted">Brew complete.</p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 rounded-2xl bg-hairline/40 px-5 py-6">
            <span className="text-xs uppercase tracking-[0.15em] text-muted">
              Recipe
            </span>
            <div className="flex flex-col gap-3 text-left">
              {recap.map((r) => (
                <RecapRowView key={r.label} {...r} />
              ))}
            </div>
            <p className="pt-2 text-xs text-muted">{summary}</p>
          </div>
        </main>

        <footer className="flex flex-col items-center gap-3 py-6">
          {props.canSave && (
            <button
              type="button"
              onClick={() => setSaveOpen(true)}
              className="w-full rounded-full bg-ink py-4 text-base font-medium text-cream hover:opacity-90"
            >
              Save recipe
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate("brew")}
            className="py-1 text-sm text-ink underline-offset-4 hover:underline"
          >
            Brew again
          </button>
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="py-1 text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Home
          </button>
        </footer>
      </div>

      {props.canSave && (
        <SaveRecipeModal
          open={saveOpen}
          summary={props.saveSummary}
          onCancel={() => setSaveOpen(false)}
          onSave={handleSave}
        />
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
        >
          <div className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-cream shadow-lg animate-[fade-in_180ms_ease-out]">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function RecapRowView({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-xs uppercase tracking-[0.15em] text-muted">
        {label}
      </span>
      <span
        className={`text-lg text-ink ${mono ? "font-mono tabular-nums" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function CheckBadge() {
  return (
    <span
      className="flex h-14 w-14 items-center justify-center rounded-full border border-accent text-accent"
      aria-hidden="true"
    >
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path
          d="M5 12.5 L10 17 L19 7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
