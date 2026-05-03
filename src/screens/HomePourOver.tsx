import { useMemo, useState } from "react";
import type {
  BrewMethod,
  PourOverOutput,
  Roast,
  Strength,
  Unit,
} from "../lib/types";
import Drawer, { type DrawerOption } from "../components/Drawer";
import OneOhOneOverlay from "../components/OneOhOneOverlay";

type Screen = "method-select" | "home" | "brew" | "complete";

type Props = {
  method: BrewMethod;
  waterMl: number;
  roast: Roast;
  strength: Strength;
  unit: Unit;
  recipe: PourOverOutput;
  setWaterMl: (ml: number) => void;
  setRoast: (r: Roast) => void;
  setStrength: (s: Strength) => void;
  setUnit: (u: Unit) => void;
  onNavigate: (s: Screen) => void;
  onBack: () => void;
  onOpenSave: () => void;
  onOpenSavedRecipes: () => void;
};

type DrawerKey = null | "water" | "strength" | "roast";

const METHOD_LABEL: Record<BrewMethod, string> = {
  "french-press": "French Press",
  "pour-over": "Pour Over",
  drip: "Drip",
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

const OZ_PER_ML = 0.033814;

type WaterPreset = "small" | "medium" | "large";

const WATER_PRESETS: Record<WaterPreset, number> = {
  small: 250,
  medium: 350,
  large: 500,
};

const WATER_LABEL: Record<WaterPreset, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

function waterPresetFromMl(ml: number): WaterPreset {
  if (ml === 250) return "small";
  if (ml === 500) return "large";
  return "medium";
}

function waterOptionsFor(unit: Unit): DrawerOption<WaterPreset>[] {
  const size = (ml: number) =>
    unit === "metric" ? `${ml} ml` : `${Math.round(ml * OZ_PER_ML)} fl oz`;
  return [
    {
      value: "small",
      label: "Small",
      secondary: `1 cup · ${size(250)}`,
    },
    {
      value: "medium",
      label: "Medium",
      secondary: `2 cups · ${size(350)}`,
    },
    {
      value: "large",
      label: "Large",
      secondary: `3 cups · ${size(500)}`,
    },
  ];
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatCoffeeG(g: number) {
  return g.toFixed(1).replace(/\.0$/, "");
}

export default function HomePourOver({
  method,
  waterMl,
  roast,
  strength,
  unit,
  recipe,
  setWaterMl,
  setRoast,
  setStrength,
  setUnit,
  onNavigate,
  onBack,
  onOpenSave,
  onOpenSavedRecipes,
}: Props) {
  const [openDrawer, setOpenDrawer] = useState<DrawerKey>(null);
  const [oneOhOneOpen, setOneOhOneOpen] = useState(false);

  const isMetric = unit === "metric";
  const waterPreset = waterPresetFromMl(waterMl);

  const strengthOptions = useMemo(
    () => (isMetric ? STRENGTH_OPTIONS_METRIC : STRENGTH_OPTIONS_IMPERIAL),
    [isMetric],
  );
  const waterOptions = useMemo(() => waterOptionsFor(unit), [unit]);

  // Total brew time: bloom + 2 timed pours + drain
  const totalSec = recipe.bloomSec + 45 + 45 + recipe.drainSec;

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5">
        <header className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
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
          </div>
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
          <section className="mt-2 flex flex-col gap-1 pb-2">
            <OutputRow
              label="Coffee"
              primary={
                isMetric
                  ? formatCoffeeG(recipe.coffeeG)
                  : recipe.coffeeTbsp.toString()
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
              label="Total brew"
              primary={formatTime(totalSec)}
              primaryUnit=""
              mono
            />
          </section>

          <section className="flex flex-col divide-y divide-hairline">
            <InputRow
              label="Water"
              value={`${WATER_LABEL[waterPreset]} · ${
                isMetric
                  ? `${waterMl} ml`
                  : `${Math.round(waterMl * OZ_PER_ML)} fl oz`
              }`}
              onClick={() => setOpenDrawer("water")}
            />
            <InputRow
              label="Strength"
              value={STRENGTH_LABEL[strength]}
              onClick={() => setOpenDrawer("strength")}
            />
            <InputRow
              label="Roast"
              value={ROAST_LABEL[roast]}
              onClick={() => setOpenDrawer("roast")}
            />
          </section>

          <p className="px-1 text-xs text-muted">
            Grind medium-fine, like table salt.
          </p>

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
        open={openDrawer === "water"}
        title="Water"
        options={waterOptions}
        activeValue={waterPreset}
        onSelect={(preset) => setWaterMl(WATER_PRESETS[preset])}
        onClose={() => setOpenDrawer(null)}
      />
      <Drawer
        open={openDrawer === "strength"}
        title="Strength"
        options={strengthOptions}
        activeValue={strength}
        onSelect={setStrength}
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

      <OneOhOneOverlay
        open={oneOhOneOpen}
        onClose={() => setOneOhOneOpen(false)}
      />
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
