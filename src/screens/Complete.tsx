import { useEffect, useState } from "react";
import type {
  Grind,
  PressSize,
  RecipeOutput,
  Roast,
  SavedRecipe,
  Strength,
  Unit,
} from "../lib/types";
import SaveRecipeModal from "../components/SaveRecipeModal";
import { saveRecipe } from "../lib/storage";
import { configSummary } from "../lib/format";

type Screen = "home" | "brew" | "complete";

type Props = {
  recipe: RecipeOutput;
  unit: Unit;
  strength: Strength;
  press: PressSize;
  grind: Grind;
  roast: Roast;
  onNavigate: (screen: Screen) => void;
};

const STRENGTH_LABEL: Record<Strength, string> = {
  weak: "Weak",
  mild: "Mild",
  balanced: "Balanced",
  strong: "Strong",
  bold: "Bold",
};

const GRIND_LABEL: Record<Grind, string> = {
  "extra-fine": "Extra fine",
  fine: "Fine",
  medium: "Medium",
  coarse: "Coarse",
  "extra-coarse": "Extra coarse",
};

const ROAST_LABEL: Record<Roast, string> = {
  light: "Light",
  medium: "Medium",
  dark: "Dark",
};

const PRESS_LABEL: Record<PressSize["preset"], string> = {
  small: "Small",
  standard: "Standard",
  large: "Large",
  custom: "Custom",
};

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatCoffeeG(g: number) {
  return g.toFixed(1).replace(/\.0$/, "");
}

export default function Complete({
  recipe,
  unit,
  strength,
  press,
  grind,
  roast,
  onNavigate,
}: Props) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(id);
  }, [toast]);

  const saveSummary = configSummary({ roast, strength, press, grind }, unit);

  const handleSaveRecipe = (name: string) => {
    const recipe: SavedRecipe = {
      id: crypto.randomUUID(),
      name,
      strength,
      press,
      grind,
      roast,
      createdAt: Date.now(),
    };
    saveRecipe(recipe);
    setSaveOpen(false);
    setToast(`Saved “${name}”`);
  };

  const isMetric = unit === "metric";
  const coffeeDisplay = isMetric
    ? `${formatCoffeeG(recipe.coffeeG)} g`
    : `${recipe.coffeeTbsp} tbsp`;
  const waterDisplay = isMetric
    ? `${recipe.waterMl} ml`
    : `${recipe.waterOz} fl oz`;
  const tempDisplay = isMetric ? `${recipe.tempC}°C` : `${recipe.tempF}°F`;
  const steepDisplay = formatTime(recipe.steepSec);

  const summary = `${STRENGTH_LABEL[strength]} · ${PRESS_LABEL[press.preset]} · ${GRIND_LABEL[grind]} grind · ${ROAST_LABEL[roast]} roast`;

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
              <p className="text-sm text-muted">
                Decant now to avoid over-extraction.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 rounded-2xl bg-hairline/40 px-5 py-6">
            <span className="text-xs uppercase tracking-[0.15em] text-muted">
              Recipe
            </span>
            <div className="flex flex-col gap-3 text-left">
              <RecapRow label="Coffee" value={coffeeDisplay} />
              <RecapRow label="Water" value={`${waterDisplay} at ${tempDisplay}`} />
              <RecapRow label="Steep" value={steepDisplay} mono />
            </div>
            <p className="pt-2 text-xs text-muted">{summary}</p>
          </div>
        </main>

        <footer className="flex flex-col items-center gap-3 py-6">
          <button
            type="button"
            onClick={() => setSaveOpen(true)}
            className="w-full rounded-full bg-ink py-4 text-base font-medium text-cream hover:opacity-90"
          >
            Save recipe
          </button>
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

      <SaveRecipeModal
        open={saveOpen}
        summary={saveSummary}
        onCancel={() => setSaveOpen(false)}
        onSave={handleSaveRecipe}
      />

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

function RecapRow({
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
