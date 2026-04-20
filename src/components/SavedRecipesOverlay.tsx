import { useEffect } from "react";
import type { Roast, SavedRecipe, Strength, Unit } from "../lib/types";
import { formatPressVolume } from "../lib/format";

type Props = {
  open: boolean;
  recipes: SavedRecipe[];
  unit: Unit;
  onClose: () => void;
  onLoad: (recipe: SavedRecipe) => void;
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

export default function SavedRecipesOverlay({
  open,
  recipes,
  unit,
  onClose,
  onLoad,
}: Props) {
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
            {sorted.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => {
                    onLoad(r);
                    onClose();
                  }}
                  className="flex w-full flex-col items-start gap-1 px-6 py-4 text-left transition-colors hover:bg-hairline/30"
                >
                  <span className="text-base font-medium text-ink">
                    {r.name}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                    {metaLine(r, unit)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
