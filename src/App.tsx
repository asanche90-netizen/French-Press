import { useEffect, useMemo, useState } from "react";
import Home from "./screens/Home";
import HomePourOver from "./screens/HomePourOver";
import HomeDrip from "./screens/HomeDrip";
import Brew from "./screens/Brew";
import Complete, { type RecapRow } from "./screens/Complete";
import MethodSelect from "./screens/MethodSelect";
import SaveRecipeModal from "./components/SaveRecipeModal";
import SavedRecipesOverlay from "./components/SavedRecipesOverlay";
import {
  calculateDripRecipe,
  calculatePourOverRecipe,
  calculateRecipe,
} from "./lib/recipe";
import {
  deleteRecipe as storageDeleteRecipe,
  getSavedRecipes,
  getUnitPreference,
  saveRecipe as storageSaveRecipe,
  setUnitPreference,
} from "./lib/storage";
import {
  buildDripSteps,
  buildFrenchPressSteps,
  buildPourOverSteps,
  type Step,
} from "./lib/steps";
import { configSummary } from "./lib/format";
import type {
  BrewMethod,
  Grind,
  PressSize,
  Roast,
  SavedRecipe,
  Strength,
  Unit,
} from "./lib/types";

type Screen = "method-select" | "home" | "brew" | "complete";

const DEFAULT_PRESS: PressSize = { preset: "standard", ml: 500 };
const DEFAULT_WATER_ML = 500;
const OZ_PER_ML = 0.033814;

const ROAST_LABEL: Record<Roast, string> = {
  light: "Light",
  medium: "Medium",
  dark: "Dark",
};
const STRENGTH_LABEL: Record<Strength, string> = {
  weak: "Weak",
  mild: "Mild",
  balanced: "Balanced",
  strong: "Strong",
  bold: "Bold",
};
const METHOD_LABEL: Record<BrewMethod, string> = {
  "french-press": "French Press",
  "pour-over": "Pour Over",
  drip: "Drip",
};

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatCoffeeG(g: number) {
  return g.toFixed(1).replace(/\.0$/, "");
}

function formatVolume(ml: number, unit: Unit): string {
  return unit === "metric"
    ? `${ml} ml`
    : `${Math.round(ml * OZ_PER_ML)} fl oz`;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("method-select");
  const [method, setMethod] = useState<BrewMethod | null>(null);
  const [strength, setStrength] = useState<Strength>("balanced");
  const [press, setPress] = useState<PressSize>(DEFAULT_PRESS);
  const [grind, setGrind] = useState<Grind>("coarse");
  const [roast, setRoast] = useState<Roast>("medium");
  const [waterMl, setWaterMl] = useState<number>(DEFAULT_WATER_ML);
  const [unit, setUnit] = useState<Unit>(() => getUnitPreference());

  // Cross-method save UI state lives here so it doesn't reset when the
  // user switches between method flows.
  const [recipes, setRecipes] = useState<SavedRecipe[]>(() =>
    getSavedRecipes(),
  );
  const [saveOpen, setSaveOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setUnitPreference(unit);
  }, [unit]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(id);
  }, [toast]);

  const recipe = useMemo(
    () => calculateRecipe({ strength, press, grind, roast, units: unit }),
    [strength, press, grind, roast, unit],
  );
  const pourOverRecipe = useMemo(
    () => calculatePourOverRecipe({ waterMl, roast, strength }),
    [waterMl, roast, strength],
  );
  const dripRecipe = useMemo(
    () => calculateDripRecipe({ waterMl, roast, strength }),
    [waterMl, roast, strength],
  );

  // Summary string shown in the Save Recipe modal — describes the config
  // about to be saved. Format mirrors the saved-list meta line.
  const saveSummary = useMemo(() => {
    if (method === null) return "";
    if (method === "french-press") {
      return configSummary({ roast, strength, press, grind }, unit);
    }
    return `${ROAST_LABEL[roast]} roast · ${STRENGTH_LABEL[strength]} · ${formatVolume(
      waterMl,
      unit,
    )} · ${METHOD_LABEL[method]}`;
  }, [method, roast, strength, press, grind, waterMl, unit]);

  const handleSave = (name: string) => {
    if (method === null) return;
    let r: SavedRecipe;
    if (method === "french-press") {
      r = {
        id: crypto.randomUUID(),
        name,
        method: "french-press",
        strength,
        press,
        grind,
        roast,
        createdAt: Date.now(),
      };
    } else if (method === "pour-over") {
      r = {
        id: crypto.randomUUID(),
        name,
        method: "pour-over",
        strength,
        waterMl,
        roast,
        createdAt: Date.now(),
      };
    } else {
      r = {
        id: crypto.randomUUID(),
        name,
        method: "drip",
        strength,
        waterMl,
        roast,
        createdAt: Date.now(),
      };
    }
    storageSaveRecipe(r);
    setRecipes(getSavedRecipes());
    setSaveOpen(false);
    setToast(`Saved “${name}”`);
  };

  const handleLoad = (r: SavedRecipe) => {
    setStrength(r.strength);
    setRoast(r.roast);
    if (r.method === "french-press") {
      setPress(r.press);
      setGrind(r.grind);
    } else {
      setWaterMl(r.waterMl);
    }
    setMethod(r.method);
    setScreen("home");
    setSavedOpen(false);
    setToast(`Loaded “${r.name}”`);
  };

  const handleDelete = (id: string) => {
    storageDeleteRecipe(id);
    setRecipes(getSavedRecipes());
  };

  const goBackToMethodSelect = () => {
    setMethod(null);
    setScreen("method-select");
  };

  const openSave = () => setSaveOpen(true);
  const openSaved = () => setSavedOpen(true);

  // ---- Routing ----------------------------------------------------------

  let flow;
  if (method === null || screen === "method-select") {
    flow = (
      <MethodSelect
        onSelect={(m) => {
          setMethod(m);
          setScreen("home");
          // Per-method defaults: pour-over standard single serve is Medium
          // (350 ml); drip stays on the previous Large default (500 ml).
          if (m === "pour-over") setWaterMl(350);
          else if (m === "drip") setWaterMl(500);
        }}
      />
    );
  } else if (method === "french-press") {
    flow = (
      <FrenchPressFlow
        screen={screen}
        setScreen={setScreen}
        method={method}
        recipe={recipe}
        unit={unit}
        strength={strength}
        press={press}
        grind={grind}
        roast={roast}
        setStrength={setStrength}
        setPress={setPress}
        setGrind={setGrind}
        setRoast={setRoast}
        setUnit={setUnit}
        onBack={goBackToMethodSelect}
        onOpenSave={openSave}
        onOpenSavedRecipes={openSaved}
      />
    );
  } else if (method === "pour-over") {
    flow = (
      <PourOverFlow
        screen={screen}
        setScreen={setScreen}
        method={method}
        recipe={pourOverRecipe}
        unit={unit}
        strength={strength}
        roast={roast}
        waterMl={waterMl}
        setStrength={setStrength}
        setRoast={setRoast}
        setWaterMl={setWaterMl}
        setUnit={setUnit}
        onBack={goBackToMethodSelect}
        onOpenSave={openSave}
        onOpenSavedRecipes={openSaved}
      />
    );
  } else {
    flow = (
      <DripFlow
        screen={screen}
        setScreen={setScreen}
        method={method}
        recipe={dripRecipe}
        unit={unit}
        strength={strength}
        roast={roast}
        waterMl={waterMl}
        setStrength={setStrength}
        setRoast={setRoast}
        setWaterMl={setWaterMl}
        setUnit={setUnit}
        onBack={goBackToMethodSelect}
        onOpenSave={openSave}
        onOpenSavedRecipes={openSaved}
      />
    );
  }

  return (
    <>
      {flow}

      <SaveRecipeModal
        open={saveOpen}
        summary={saveSummary}
        onCancel={() => setSaveOpen(false)}
        onSave={handleSave}
      />

      <SavedRecipesOverlay
        open={savedOpen}
        recipes={recipes}
        unit={unit}
        onClose={() => setSavedOpen(false)}
        onLoad={handleLoad}
        onDelete={handleDelete}
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
    </>
  );
}

// --- French press --------------------------------------------------------

type FrenchPressFlowProps = {
  screen: Screen;
  setScreen: (s: Screen) => void;
  method: BrewMethod;
  recipe: ReturnType<typeof calculateRecipe>;
  unit: Unit;
  strength: Strength;
  press: PressSize;
  grind: Grind;
  roast: Roast;
  setStrength: (s: Strength) => void;
  setPress: (p: PressSize) => void;
  setGrind: (g: Grind) => void;
  setRoast: (r: Roast) => void;
  setUnit: (u: Unit) => void;
  onBack: () => void;
  onOpenSave: () => void;
  onOpenSavedRecipes: () => void;
};

function FrenchPressFlow({
  screen,
  setScreen,
  method,
  recipe,
  unit,
  strength,
  press,
  grind,
  roast,
  setStrength,
  setPress,
  setGrind,
  setRoast,
  setUnit,
  onBack,
  onOpenSave,
  onOpenSavedRecipes,
}: FrenchPressFlowProps) {
  const steps = useMemo<Step[]>(
    () => buildFrenchPressSteps(recipe, unit, roast),
    [recipe, unit, roast],
  );

  if (screen === "brew") {
    return <Brew steps={steps} onNavigate={setScreen} />;
  }
  if (screen === "complete") {
    const isMetric = unit === "metric";
    const recap: RecapRow[] = [
      {
        label: "Coffee",
        value: isMetric
          ? `${formatCoffeeG(recipe.coffeeG)} g`
          : `${recipe.coffeeTbsp} tbsp`,
      },
      {
        label: "Water",
        value: `${
          isMetric ? `${recipe.waterMl} ml` : `${recipe.waterOz} fl oz`
        } at ${isMetric ? `${recipe.tempC}°C` : `${recipe.tempF}°F`}`,
      },
      { label: "Steep", value: formatTime(recipe.steepSec), mono: true },
    ];
    const summary = configSummary({ roast, strength, press, grind }, unit);
    return (
      <Complete
        recap={recap}
        summary={summary}
        onOpenSave={onOpenSave}
        onNavigate={setScreen}
      />
    );
  }

  return (
    <Home
      method={method}
      strength={strength}
      press={press}
      grind={grind}
      roast={roast}
      unit={unit}
      recipe={recipe}
      setStrength={setStrength}
      setPress={setPress}
      setGrind={setGrind}
      setRoast={setRoast}
      setUnit={setUnit}
      onNavigate={setScreen}
      onBack={onBack}
      onOpenSave={onOpenSave}
      onOpenSavedRecipes={onOpenSavedRecipes}
    />
  );
}

// --- Pour over -----------------------------------------------------------

type PourOverFlowProps = {
  screen: Screen;
  setScreen: (s: Screen) => void;
  method: BrewMethod;
  recipe: ReturnType<typeof calculatePourOverRecipe>;
  unit: Unit;
  strength: Strength;
  roast: Roast;
  waterMl: number;
  setStrength: (s: Strength) => void;
  setRoast: (r: Roast) => void;
  setWaterMl: (ml: number) => void;
  setUnit: (u: Unit) => void;
  onBack: () => void;
  onOpenSave: () => void;
  onOpenSavedRecipes: () => void;
};

function PourOverFlow({
  screen,
  setScreen,
  method,
  recipe,
  unit,
  strength,
  roast,
  waterMl,
  setStrength,
  setRoast,
  setWaterMl,
  setUnit,
  onBack,
  onOpenSave,
  onOpenSavedRecipes,
}: PourOverFlowProps) {
  const steps = useMemo<Step[]>(
    () => buildPourOverSteps(recipe, unit, roast),
    [recipe, unit, roast],
  );

  if (screen === "brew") {
    return <Brew steps={steps} onNavigate={setScreen} />;
  }
  if (screen === "complete") {
    const isMetric = unit === "metric";
    // Brew window: bloom + two intermediate pours + final-pour drain.
    const totalSec = recipe.bloomSec + 30 + 30 + recipe.drainSec;
    const recap: RecapRow[] = [
      {
        label: "Coffee",
        value: isMetric
          ? `${formatCoffeeG(recipe.coffeeG)} g`
          : `${recipe.coffeeTbsp} tbsp`,
      },
      {
        label: "Water",
        value: `${
          isMetric ? `${recipe.waterMl} ml` : `${recipe.waterOz} fl oz`
        } at ${isMetric ? `${recipe.tempC}°C` : `${recipe.tempF}°F`}`,
      },
      { label: "Total", value: formatTime(totalSec), mono: true },
    ];
    const summary = `${ROAST_LABEL[roast]} roast · ${STRENGTH_LABEL[strength]} · ${formatVolume(
      waterMl,
      unit,
    )} · Pour over`;
    return (
      <Complete
        recap={recap}
        summary={summary}
        onOpenSave={onOpenSave}
        onNavigate={setScreen}
      />
    );
  }

  return (
    <HomePourOver
      method={method}
      waterMl={waterMl}
      roast={roast}
      strength={strength}
      unit={unit}
      recipe={recipe}
      setWaterMl={setWaterMl}
      setRoast={setRoast}
      setStrength={setStrength}
      setUnit={setUnit}
      onNavigate={setScreen}
      onBack={onBack}
      onOpenSave={onOpenSave}
      onOpenSavedRecipes={onOpenSavedRecipes}
    />
  );
}

// --- Drip ----------------------------------------------------------------

type DripFlowProps = {
  screen: Screen;
  setScreen: (s: Screen) => void;
  method: BrewMethod;
  recipe: ReturnType<typeof calculateDripRecipe>;
  unit: Unit;
  strength: Strength;
  roast: Roast;
  waterMl: number;
  setStrength: (s: Strength) => void;
  setRoast: (r: Roast) => void;
  setWaterMl: (ml: number) => void;
  setUnit: (u: Unit) => void;
  onBack: () => void;
  onOpenSave: () => void;
  onOpenSavedRecipes: () => void;
};

function DripFlow({
  screen,
  setScreen,
  method,
  recipe,
  unit,
  strength,
  roast,
  waterMl,
  setStrength,
  setRoast,
  setWaterMl,
  setUnit,
  onBack,
  onOpenSave,
  onOpenSavedRecipes,
}: DripFlowProps) {
  const steps = useMemo<Step[]>(
    () => buildDripSteps(recipe, unit),
    [recipe, unit],
  );

  if (screen === "brew") {
    return <Brew steps={steps} onNavigate={setScreen} />;
  }
  if (screen === "complete") {
    const isMetric = unit === "metric";
    const recap: RecapRow[] = [
      {
        label: "Coffee",
        value: isMetric
          ? `${formatCoffeeG(recipe.coffeeG)} g`
          : `${recipe.coffeeTbsp} tbsp`,
      },
      {
        label: "Water",
        value: isMetric ? `${recipe.waterMl} ml` : `${recipe.waterOz} fl oz`,
      },
      { label: "Brew", value: formatTime(recipe.brewSec), mono: true },
    ];
    const summary = `${ROAST_LABEL[roast]} roast · ${STRENGTH_LABEL[strength]} · ${formatVolume(
      waterMl,
      unit,
    )} · Drip`;
    return (
      <Complete
        recap={recap}
        summary={summary}
        onOpenSave={onOpenSave}
        onNavigate={setScreen}
      />
    );
  }

  return (
    <HomeDrip
      method={method}
      waterMl={waterMl}
      roast={roast}
      strength={strength}
      unit={unit}
      recipe={recipe}
      setWaterMl={setWaterMl}
      setRoast={setRoast}
      setStrength={setStrength}
      setUnit={setUnit}
      onNavigate={setScreen}
      onBack={onBack}
      onOpenSave={onOpenSave}
      onOpenSavedRecipes={onOpenSavedRecipes}
    />
  );
}
