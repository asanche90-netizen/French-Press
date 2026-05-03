import { useEffect, useMemo, useState } from "react";
import Home from "./screens/Home";
import HomePourOver from "./screens/HomePourOver";
import Brew from "./screens/Brew";
import Complete, { type RecapRow } from "./screens/Complete";
import MethodSelect from "./screens/MethodSelect";
import { calculatePourOverRecipe, calculateRecipe } from "./lib/recipe";
import { getUnitPreference, saveRecipe, setUnitPreference } from "./lib/storage";
import {
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

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatCoffeeG(g: number) {
  return g.toFixed(1).replace(/\.0$/, "");
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

  useEffect(() => {
    setUnitPreference(unit);
  }, [unit]);

  const recipe = useMemo(
    () => calculateRecipe({ strength, press, grind, roast, units: unit }),
    [strength, press, grind, roast, unit],
  );
  const pourOverRecipe = useMemo(
    () => calculatePourOverRecipe({ waterMl, roast, strength }),
    [waterMl, roast, strength],
  );

  // No method picked yet — show the picker regardless of screen state.
  if (method === null || screen === "method-select") {
    return (
      <MethodSelect
        onSelect={(m) => {
          setMethod(m);
          setScreen("home");
        }}
      />
    );
  }

  const goBackToMethodSelect = () => {
    setMethod(null);
    setScreen("method-select");
  };

  if (method === "french-press") {
    return (
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
      />
    );
  }

  if (method === "pour-over") {
    return (
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
      />
    );
  }

  // Drip arrives in Step 4; for now route back to the picker.
  return (
    <MethodSelect
      onSelect={(m) => {
        setMethod(m);
        setScreen("home");
      }}
    />
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
}: FrenchPressFlowProps) {
  const steps = useMemo<Step[]>(
    () => buildFrenchPressSteps(recipe, unit),
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
        value: `${
          isMetric ? `${recipe.waterMl} ml` : `${recipe.waterOz} fl oz`
        } at ${isMetric ? `${recipe.tempC}°C` : `${recipe.tempF}°F`}`,
      },
      { label: "Steep", value: formatTime(recipe.steepSec), mono: true },
    ];
    const saveSummary = configSummary(
      { roast, strength, press, grind },
      unit,
    );
    const handleSave = (name: string) => {
      const r: SavedRecipe = {
        id: crypto.randomUUID(),
        name,
        method,
        strength,
        press,
        grind,
        roast,
        createdAt: Date.now(),
      };
      saveRecipe(r);
    };
    return (
      <Complete
        recap={recap}
        summary={saveSummary}
        canSave
        saveSummary={saveSummary}
        onSave={handleSave}
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
}: PourOverFlowProps) {
  const steps = useMemo<Step[]>(
    () => buildPourOverSteps(recipe, unit),
    [recipe, unit],
  );

  if (screen === "brew") {
    return <Brew steps={steps} onNavigate={setScreen} />;
  }
  if (screen === "complete") {
    const isMetric = unit === "metric";
    const totalSec = recipe.bloomSec + 45 + 45 + recipe.drainSec;
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
    const summary = `${ROAST_LABEL[roast]} roast · ${STRENGTH_LABEL[strength]} · ${
      isMetric
        ? `${recipe.waterMl} ml`
        : `${recipe.waterOz} fl oz`
    } · Pour over`;
    return (
      <Complete
        recap={recap}
        summary={summary}
        canSave={false}
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
    />
  );
}
