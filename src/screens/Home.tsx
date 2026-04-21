import { useEffect, useMemo, useState } from "react";
import type {
  Grind,
  PressPreset,
  PressSize,
  RecipeOutput,
  Roast,
  SavedRecipe,
  Strength,
  Unit,
} from "../lib/types";
import Drawer, { type DrawerOption } from "../components/Drawer";
import SaveRecipeModal from "../components/SaveRecipeModal";
import SavedRecipesOverlay from "../components/SavedRecipesOverlay";
import { deleteRecipe, getSavedRecipes, saveRecipe } from "../lib/storage";
import { configSummary } from "../lib/format";

type Screen = "home" | "brew" | "complete";
type Props = {
  strength: Strength;
  press: PressSize;
  grind: Grind;
  roast: Roast;
  unit: Unit;
  recipe: RecipeOutput;
  setStrength: (s: Strength) => void;
  setPress: (p: PressSize) => void;
  setGrind: (g: Grind) => void;
  setRoast: (r: Roast) => void;
  setUnit: (u: Unit) => void;
  onNavigate: (s: Screen) => void;
};
type DrawerKey = null | "strength" | "press" | "grind" | "roast";

const PRESS_PRESETS: Record<"small" | "standard" | "large", PressSize> = {
  small: { preset: "small", ml: 350 },
  standard: { preset: "standard", ml: 500 },
  large: { preset: "large", ml: 1000 },
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

const PRESS_LABEL: Record<PressPreset, string> = {
  small: "Small",
  standard: "Standard",
  large: "Large",
};

const STRENGTH_OPTIONS_METRIC: DrawerOption<Strength>[] = [
  { value: "weak", label: "Weak", secondary: "5.5 g / 100 ml" },
  { value: "mild", label: "Mild", secondary: "6 g / 100 ml" },
  { value: "balanced", label: "Balanced", secondary: "6.5 g / 100 ml" },
  { value: "strong", label: "Strong", secondary: "7.5 g / 100 ml" },
  { value: "bold", label: "Bold", secondary: "8.5 g / 100 ml" },
];

const STRENGTH_OPTIONS_IMPERIAL: DrawerOption<Strength>[] = [
  { value: "weak", label: "Weak", secondary: "1 tbsp / 3.4 fl oz" },
  { value: "mild", label: "Mild", secondary: "1 tbsp / 3.1 fl oz" },
  { value: "balanced", label: "Balanced", secondary: "1 tbsp / 2.9 fl oz" },
  { value: "strong", label: "Strong", secondary: "1 tbsp / 2.5 fl oz" },
  { value: "bold", label: "Bold", secondary: "1 tbsp / 2.2 fl oz" },
];

const OZ_PER_ML = 0.033814;

function pressOptionsFor(unit: Unit): DrawerOption<PressPreset>[] {
  const size = (ml: number) =>
    unit === "metric" ? `${ml} ml` : `${Math.round(ml * OZ_PER_ML)} fl oz`;
  return [
    { value: "small", label: "Small", secondary: `2 cups · ${size(350)}` },
    { value: "standard", label: "Standard", secondary: `3 cups · ${size(500)}` },
    { value: "large", label: "Large", secondary: `6 cups · ${size(1000)}` },
  ];
}

function Dots({ filled, total = 5 }: { filled: number; total?: number }) {
  return (
    <span className="flex gap-1" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${
            i < filled ? "bg-ink" : "bg-hairline"
          }`}
        />
      ))}
    </span>
  );
}

const grindOptions: DrawerOption<Grind>[] = [
  { value: "extra-fine", label: "Extra fine", rightAdornment: <Dots filled={1} /> },
  { value: "fine", label: "Fine", rightAdornment: <Dots filled={2} /> },
  { value: "medium", label: "Medium", rightAdornment: <Dots filled={3} /> },
  { value: "coarse", label: "Coarse", rightAdornment: <Dots filled={4} /> },
  { value: "extra-coarse", label: "Extra coarse", rightAdornment: <Dots filled={5} /> },
];

function RoastDot({ color }: { color: string }) {
  return (
    <span
      className="h-3.5 w-3.5 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

const roastOptions: DrawerOption<Roast>[] = [
  {
    value: "light",
    label: "Light",
    secondary: "Bright, acidic, complex",
    leftAdornment: <RoastDot color="#c8a477" />,
  },
  {
    value: "medium",
    label: "Medium",
    secondary: "Balanced, smooth, sweet",
    leftAdornment: <RoastDot color="#8b5a2b" />,
  },
  {
    value: "dark",
    label: "Dark",
    secondary: "Bold, low acidity, heavy body",
    leftAdornment: <RoastDot color="#3a241a" />,
  },
];

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatCoffeeG(g: number) {
  return g.toFixed(1).replace(/\.0$/, "");
}

export default function Home({
  strength,
  press,
  grind,
  roast,
  unit,
  recipe,
  setStrength,
  setPress,
  setGrind,
  setRoast,
  setUnit,
  onNavigate,
}: Props) {
  const [openDrawer, setOpenDrawer] = useState<DrawerKey>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [recipes, setRecipes] = useState<SavedRecipe[]>(() => getSavedRecipes());
  const [toast, setToast] = useState<string | null>(null);

  const isMetric = unit === "metric";

  const strengthOptions = useMemo(
    () => (isMetric ? STRENGTH_OPTIONS_METRIC : STRENGTH_OPTIONS_IMPERIAL),
    [isMetric],
  );
  const pressOptions = useMemo(() => pressOptionsFor(unit), [unit]);

  const summary = configSummary({ roast, strength, press, grind }, unit);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(id);
  }, [toast]);

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
    setRecipes(getSavedRecipes());
    setSaveOpen(false);
    setToast(`Saved “${name}”`);
  };

  const handleLoadRecipe = (r: SavedRecipe) => {
    setStrength(r.strength);
    setPress(r.press);
    setGrind(r.grind);
    setRoast(r.roast);
    setToast(`Loaded “${r.name}”`);
  };

  const handleDeleteRecipe = (id: string) => {
    deleteRecipe(id);
    setRecipes(getSavedRecipes());
  };

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5">
        <header className="flex items-center justify-between py-3">
          <div className="inline-flex rounded-full border border-hairline p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setUnit("metric")}
              className={`rounded-full px-3 py-1 transition-colors ${
                isMetric ? "bg-ink text-cream" : "text-muted"
              }`}
            >
              Metric
            </button>
            <button
              type="button"
              onClick={() => setUnit("imperial")}
              className={`rounded-full px-3 py-1 transition-colors ${
                !isMetric ? "bg-ink text-cream" : "text-muted"
              }`}
            >
              Imperial
            </button>
          </div>
          <h1 className="text-sm font-medium tracking-wide text-ink">
            French Press
          </h1>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-sm text-muted hover:text-ink"
          >
            101
          </a>
        </header>

        <main className="flex flex-col gap-4">
          <section className="mt-2 flex flex-col gap-1 pb-2">
            <OutputRow
              label="Coffee"
              primary={
                isMetric ? formatCoffeeG(recipe.coffeeG) : recipe.coffeeTbsp.toString()
              }
              primaryUnit={isMetric ? "g" : "tbsp"}
            />
            <OutputRow
              label="Water"
              primary={isMetric ? recipe.waterMl.toString() : recipe.waterOz.toString()}
              primaryUnit={isMetric ? "ml" : "fl oz"}
            />
            <OutputRow
              label="Water temp"
              primary={isMetric ? recipe.tempC.toString() : recipe.tempF.toString()}
              primaryUnit={isMetric ? "°C" : "°F"}
            />
            <OutputRow
              label="Steep"
              primary={formatTime(recipe.steepSec)}
              primaryUnit=""
              mono
            />
          </section>

          <section className="flex flex-col divide-y divide-hairline border-b border-hairline">
            <InputRow
              label="Strength"
              value={STRENGTH_LABEL[strength]}
              onClick={() => setOpenDrawer("strength")}
            />
            <InputRow
              label="Press"
              value={`${PRESS_LABEL[press.preset]} · ${
                isMetric
                  ? `${press.ml} ml`
                  : `${Math.round(press.ml * OZ_PER_ML)} fl oz`
              }`}
              onClick={() => setOpenDrawer("press")}
            />
            <InputRow
              label="Grind"
              value={GRIND_LABEL[grind]}
              onClick={() => setOpenDrawer("grind")}
            />
            <InputRow
              label="Roast"
              value={ROAST_LABEL[roast]}
              onClick={() => setOpenDrawer("roast")}
            />
          </section>

          <div className="mt-2 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate("brew")}
              className="w-full rounded-full bg-accent py-3.5 text-base font-medium text-cream transition-opacity hover:opacity-90 active:opacity-80"
            >
              Begin brew
            </button>
            <button
              type="button"
              onClick={() => setSaveOpen(true)}
              className="py-1 text-sm font-medium text-ink underline decoration-hairline underline-offset-4 hover:decoration-ink"
            >
              Save as recipe
            </button>
          </div>

          <div className="mt-4 flex justify-center pb-6">
            <button
              type="button"
              onClick={() => setSavedOpen(true)}
              className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Saved recipes
            </button>
          </div>
        </main>
      </div>

      <Drawer
        open={openDrawer === "strength"}
        title="Strength"
        options={strengthOptions}
        activeValue={strength}
        onSelect={setStrength}
        onClose={() => setOpenDrawer(null)}
      />
      <Drawer
        open={openDrawer === "press"}
        title="Press size"
        options={pressOptions}
        activeValue={press.preset}
        onSelect={(preset) => setPress(PRESS_PRESETS[preset])}
        onClose={() => setOpenDrawer(null)}
      />
      <Drawer
        open={openDrawer === "grind"}
        title="Grind size"
        options={grindOptions}
        activeValue={grind}
        onSelect={setGrind}
        onClose={() => setOpenDrawer(null)}
      />
      <Drawer
        open={openDrawer === "roast"}
        title="Roast"
        options={roastOptions}
        activeValue={roast}
        onSelect={setRoast}
        onClose={() => setOpenDrawer(null)}
      />

      <SaveRecipeModal
        open={saveOpen}
        summary={summary}
        onCancel={() => setSaveOpen(false)}
        onSave={handleSaveRecipe}
      />

      <SavedRecipesOverlay
        open={savedOpen}
        recipes={recipes}
        unit={unit}
        onClose={() => setSavedOpen(false)}
        onLoad={handleLoadRecipe}
        onDelete={handleDeleteRecipe}
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

function OutputRow({
  label,
  primary,
  primaryUnit,
  mono = false,
}: {
  label: string;
  primary: string;
  primaryUnit: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-[0.15em] text-muted">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span
          className={`text-[64px] font-light leading-none text-ink ${
            mono ? "font-mono tabular-nums" : ""
          }`}
        >
          {primary}
        </span>
        {primaryUnit && (
          <span className="text-base text-muted">{primaryUnit}</span>
        )}
      </div>
    </div>
  );
}

function InputRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-4 py-3 text-left transition-colors hover:bg-hairline/20"
    >
      <span className="text-sm text-muted">{label}</span>
      <span className="flex items-center gap-2 text-ink">
        {value}
        <span aria-hidden="true" className="text-muted">
          ›
        </span>
      </span>
    </button>
  );
}
