import { useMemo, useState } from "react";
import type {
  BrewMethod,
  Grind,
  PressPreset,
  PressSize,
  RecipeOutput,
  Roast,
  Strength,
  Unit,
} from "../lib/types";
import Drawer, { type DrawerOption } from "../components/Drawer";
import OneOhOneOverlay from "../components/OneOhOneOverlay";
import { FRENCH_PRESS_CARDS } from "../components/oneOhOneCards";
import { tempTip } from "../lib/format";

type Screen = "method-select" | "home" | "brew" | "complete";
type Props = {
  method: BrewMethod;
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
  onBack: () => void;
  onOpenSave: () => void;
  onOpenSavedRecipes: () => void;
};

const METHOD_LABEL: Record<BrewMethod, string> = {
  "french-press": "French Press",
  "pour-over": "Pour Over",
  drip: "Drip",
};
type DrawerKey = null | "strength" | "press" | "grind" | "roast";

const PRESS_PRESETS: Record<PressPreset, PressSize> = {
  small: { preset: "small", ml: 350 },
  standard: { preset: "standard", ml: 500 },
  large: { preset: "large", ml: 1000 },
  xlarge: { preset: "xlarge", ml: 1500 },
};

const STRENGTH_LABEL: Record<Strength, string> = {
  weak: "Weak",
  mild: "Mild",
  balanced: "Balanced",
  strong: "Strong",
  bold: "Bold",
};

const GRIND_LABEL: Record<Grind, string> = {
  "extra-fine": "Extra Fine",
  fine: "Fine",
  "medium-fine": "Medium Fine",
  medium: "Medium",
  "medium-coarse": "Medium Coarse",
  coarse: "Coarse",
  "extra-coarse": "Extra Coarse",
};

// Position on the seven-step grind scale. Used to fill the Dots indicator
// in the Drawer so visual scale stays consistent across methods.
const GRIND_INDEX: Record<Grind, number> = {
  "extra-fine": 1,
  fine: 2,
  "medium-fine": 3,
  medium: 4,
  "medium-coarse": 5,
  coarse: 6,
  "extra-coarse": 7,
};

const FRENCH_PRESS_GRINDS: Grind[] = [
  "extra-fine",
  "fine",
  "medium-fine",
  "medium",
  "medium-coarse",
  "coarse",
  "extra-coarse",
];

// Roast-driven grind suggestion. Lighter roasts dissolve more slowly so they
// like a slightly finer grind; darker roasts dissolve faster and want it
// coarser. Purely a hint — the user's selection is never overridden.
const FRENCH_PRESS_RECOMMENDED_GRIND: Record<Roast, Grind> = {
  light: "medium-coarse",
  medium: "coarse",
  dark: "extra-coarse",
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
  xlarge: "12 Cup",
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
    { value: "xlarge", label: "12 Cup", secondary: `12 cups · ${size(1500)}` },
  ];
}

function Dots({ filled, total = 5 }: { filled: number; total?: number }) {
  return (
    <span className="flex gap-1" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${
            i < filled
              ? "bg-ink group-data-[active=true]:bg-cream"
              : "bg-hairline group-data-[active=true]:bg-cream/40"
          }`}
        />
      ))}
    </span>
  );
}

function frenchPressGrindOptions(roast: Roast): DrawerOption<Grind>[] {
  const recommended = FRENCH_PRESS_RECOMMENDED_GRIND[roast];
  return FRENCH_PRESS_GRINDS.map((g) => ({
    value: g,
    label: GRIND_LABEL[g],
    note: g === recommended ? "Recommended for your roast" : undefined,
    rightAdornment: <Dots filled={GRIND_INDEX[g]} total={7} />,
  }));
}

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
  method,
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
  onBack,
  onOpenSave,
  onOpenSavedRecipes,
}: Props) {
  const [openDrawer, setOpenDrawer] = useState<DrawerKey>(null);
  const [oneOhOneOpen, setOneOhOneOpen] = useState(false);

  const isMetric = unit === "metric";

  const strengthOptions = useMemo(
    () => (isMetric ? STRENGTH_OPTIONS_METRIC : STRENGTH_OPTIONS_IMPERIAL),
    [isMetric],
  );
  const pressOptions = useMemo(() => pressOptionsFor(unit), [unit]);
  const grindOptions = useMemo(() => frenchPressGrindOptions(roast), [roast]);

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5">
        <header className="flex items-center justify-between py-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to method picker"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-hairline/40 hover:text-ink"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="text-sm font-medium tracking-wide text-ink">
            {METHOD_LABEL[method]}
          </h1>
          <button
            type="button"
            onClick={() => setOneOhOneOpen(true)}
            className="text-sm text-muted transition-colors hover:text-ink"
          >
            101
          </button>
        </header>

        <main className="flex flex-col gap-4">
          <div className="mt-2 inline-flex w-fit rounded-full border border-hairline p-0.5 text-xs">
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

          <section className="flex flex-col gap-1 pb-2">
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
              tip={tempTip(roast)}
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
              onClick={onOpenSave}
              className="py-1 text-sm font-medium text-ink underline decoration-hairline underline-offset-4 hover:decoration-ink"
            >
              Save as recipe
            </button>
          </div>

          <div className="mt-4 flex justify-center pb-6">
            <button
              type="button"
              onClick={onOpenSavedRecipes}
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
        selectedVariant="row"
      />
      <Drawer
        open={openDrawer === "roast"}
        title="Roast"
        options={roastOptions}
        activeValue={roast}
        onSelect={setRoast}
        onClose={() => setOpenDrawer(null)}
      />

      <OneOhOneOverlay
        open={oneOhOneOpen}
        onClose={() => setOneOhOneOpen(false)}
        title="French Press 101"
        cards={FRENCH_PRESS_CARDS}
      />
    </div>
  );
}

function OutputRow({
  label,
  primary,
  primaryUnit,
  mono = false,
  tip,
}: {
  label: string;
  primary: string;
  primaryUnit: string;
  mono?: boolean;
  tip?: string;
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
      {tip && <p className="text-xs text-muted">{tip}</p>}
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
