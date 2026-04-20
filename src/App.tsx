import { useEffect, useMemo, useState } from "react";
import Home from "./screens/Home";
import Brew from "./screens/Brew";
import Complete from "./screens/Complete";
import { calculateRecipe } from "./lib/recipe";
import { getUnitPreference, setUnitPreference } from "./lib/storage";
import type {
  Grind,
  PressSize,
  Roast,
  Strength,
  Unit,
} from "./lib/types";

type Screen = "home" | "brew" | "complete";

const DEFAULT_PRESS: PressSize = { preset: "standard", ml: 500 };

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
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
    />
  );
}
