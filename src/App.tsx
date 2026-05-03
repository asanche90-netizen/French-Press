import { useEffect, useMemo, useState } from "react";
import Home from "./screens/Home";
import Brew from "./screens/Brew";
import Complete from "./screens/Complete";
import MethodSelect from "./screens/MethodSelect";
import { calculateRecipe } from "./lib/recipe";
import { getUnitPreference, setUnitPreference } from "./lib/storage";
import type {
  BrewMethod,
  Grind,
  PressSize,
  Roast,
  Strength,
  Unit,
} from "./lib/types";

type Screen = "method-select" | "home" | "brew" | "complete";

const DEFAULT_PRESS: PressSize = { preset: "standard", ml: 500 };

export default function App() {
  const [screen, setScreen] = useState<Screen>("method-select");
  const [method, setMethod] = useState<BrewMethod | null>(null);
  const [strength, setStrength] = useState<Strength>("balanced");
  const [press, setPress] = useState<PressSize>(DEFAULT_PRESS);
  const [grind, setGrind] = useState<Grind>("coarse");
  const [roast, setRoast] = useState<Roast>("medium");
  const [unit, setUnit] = useState<Unit>(() => getUnitPreference());

  useEffect(() => {
    setUnitPreference(unit);
  }, [unit]);

  const recipe = useMemo(
    () => calculateRecipe({ strength, press, grind, roast, units: unit }),
    [strength, press, grind, roast, unit],
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

  if (screen === "brew") {
    return (
      <Brew
        recipe={recipe}
        unit={unit}
        onNavigate={setScreen}
      />
    );
  }
  if (screen === "complete") {
    return (
      <Complete
        recipe={recipe}
        unit={unit}
        method={method}
        strength={strength}
        press={press}
        grind={grind}
        roast={roast}
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
      onBack={goBackToMethodSelect}
    />
  );
}
