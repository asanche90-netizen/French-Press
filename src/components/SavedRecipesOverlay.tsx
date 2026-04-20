import { useEffect, useState } from "react";
import type { Roast, SavedRecipe, Strength, Unit } from "../lib/types";
import { formatPressVolume } from "../lib/format";

type Props = {
  open: boolean;
  recipes: SavedRecipe[];
  unit: Unit;
  onClose: () => void;
  onLoad: (recipe: SavedRecipe) => void;
  onDelete: (id: string) => void;
};

const STRENGTH_LABEL: Record<Strength, string> = {
  weak: "Weak",
  mild: "Mild",
  balanced: "Balanced",
  strong: "Strong",
  bold: "Bold",
};

const ROAST_LABEL: Record<Roast, string> = {
  light: "Light",
  medium: "Medium",
  dark: "Dark",
};

function metaLine(recipe: SavedRecipe, unit: Unit): string {
  return `${ROAST_LABEL[recipe.roast]} · ${STRENGTH_LABEL[recipe.strength]} · ${formatPressVolume(
    recipe.press,
    unit,
  )}`;
}

export default function SavedRecipesOverlay(props: Props) {
  if (!props.open) return null;
  return <Overlay {...props} />;
}

function Overlay({
  recipes,
  unit,
  onClose,
  onLoad,
  onDelete,
}: Props) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
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
  }, [onClose]);

  const sorted = [...recipes].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Saved recipes"
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
          <h2 className="text-lg font-medium text-ink">Saved recipes</h2>
        </div>
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-1 px-6 pb-6 pt-10 text-center">
            <p className="text-base text-ink">No saved recipes yet.</p>
            <p className="text-sm text-muted">Save a brew to see it here.</p>
          </div>
        ) : (
          <ul className="max-h-[60vh] divide-y divide-hairline overflow-y-auto border-t border-hairline">
            {sorted.map((r) => {
              const confirming = confirmingId === r.id;
              return (
                <li key={r.id}>
                  {confirming ? (
                    <div className="flex items-center gap-2 px-6 py-4">
                      <span className="flex-1 truncate text-sm text-ink">
                        Delete “{r.name}”?
                      </span>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="rounded-full px-3 py-1.5 text-sm text-muted hover:text-ink"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(r.id);
                          setConfirmingId(null);
                        }}
                        className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-cream hover:opacity-90"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          onLoad(r);
                          onClose();
                        }}
                        className="flex flex-1 flex-col items-start gap-1 px-6 py-4 text-left transition-colors hover:bg-hairline/30"
                      >
                        <span className="text-base font-medium text-ink">
                          {r.name}
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                          {metaLine(r, unit)}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${r.name}`}
                        onClick={() => setConfirmingId(r.id)}
                        className="mr-3 rounded-full p-2 text-muted transition-colors hover:bg-hairline/40 hover:text-ink"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6m-6 0v9.5A1.5 1.5 0 0 0 7.5 17h5a1.5 1.5 0 0 0 1.5-1.5V6M8.5 9.5v4M11.5 9.5v4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
