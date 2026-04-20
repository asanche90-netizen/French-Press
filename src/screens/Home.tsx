import { useState } from "react";
import type {
  Grind,
  PressPreset,
  PressSize,
  RecipeOutput,
  Roast,
  Strength,
  Unit,
} from "../lib/types";
import Drawer, { type DrawerOption } from "../components/Drawer";

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
  custom: "Custom",
};

const strengthOptions: DrawerOption<Strength>[] = [
  { value: "weak", label: "Weak", secondary: "5.5 g / 100 ml" },
  { value: "mild", label: "Mild", secondary: "6 g / 100 ml" },
  { value: "balanced", label: "Balanced", secondary: "6.5 g / 100 ml" },
  { value: "strong", label: "Strong", secondary: "7.5 g / 100 ml" },
  { value: "bold", label: "Bold", secondary: "8.5 g / 100 ml" },
];

const pressOptions: DrawerOption<PressPreset>[] = [
  { value: "small", label: "Small", secondary: "2 cups · 350 ml" },
  { value: "standard", label: "Standard", secondary: "3 cups · 500 ml" },
  { value: "large", label: "Large", secondary: "6 cups · 1000 ml" },
  { value: "custom", label: "Other", secondary: "Custom size" },
];

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

  const isMetric = unit === "metric";

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5">
        <header className="flex items-center justify-between py-4">
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

        <main className="flex flex-1 flex-col gap-6">
          <section className="mt-6 flex flex-col gap-6 border-b border-hairline pb-8">
            <OutputRow
              label="Coffee"
              primary={
                isMetric ? formatCoffeeG(recipe.coffeeG) : recipe.coffeeTbsp.toString()
              }
              primaryUnit={isMetric ? "g" : "tbsp"}
              secondary={
                isMetric ? undefined : `${formatCoffeeG(recipe.coffeeG)} g`
              }
            />
            <OutputRow
              label="Water"
              primary={isMetric ? recipe.waterMl.toString() : recipe.waterOz.toString()}
              primaryUnit={isMetric ? "ml" : "fl oz"}
              secondary={isMetric ? `${recipe.tempC}°C` : `${recipe.tempF}°F`}
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
              value={`${PRESS_LABEL[press.preset]} · ${press.ml} ml`}
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
              className="w-full rounded-full bg-accent py-4 text-base font-medium text-cream transition-opacity hover:opacity-90 active:opacity-80"
            >
              Begin brew
            </button>
            <button
              type="button"
              onClick={() => console.log("save recipe")}
              className="py-1 text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Save as recipe
            </button>
          </div>
        </main>

        <footer className="py-6 text-center">
          <button
            type="button"
            onClick={() => console.log("saved recipes")}
            className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Saved recipes
          </button>
        </footer>
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
        onSelect={(preset) => {
          if (preset === "custom") return;
          setPress(PRESS_PRESETS[preset]);
        }}
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
    </div>
  );
}

function OutputRow({
  label,
  primary,
  primaryUnit,
  secondary,
  mono = false,
}: {
  label: string;
  primary: string;
  primaryUnit: string;
  secondary?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-xs uppercase tracking-[0.15em] text-muted">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span
          className={`text-5xl font-light leading-none text-ink ${
            mono ? "font-mono tabular-nums" : ""
          }`}
        >
          {primary}
        </span>
        {primaryUnit && (
          <span className="text-base text-muted">{primaryUnit}</span>
        )}
        {secondary && (
          <span className="text-sm text-muted">· {secondary}</span>
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
      className="flex items-center justify-between gap-4 py-4 text-left transition-colors hover:bg-hairline/20"
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
