import type {
  Grind,
  RecipeConfig,
  RecipeOutput,
  Roast,
  Strength,
} from "./types";

const STRENGTH_RATIO: Record<Strength, number> = {
  weak: 5.5,
  mild: 6,
  balanced: 6.5,
  strong: 7.5,
  bold: 8.5,
};

const TEMP_C: Record<Roast, number> = { light: 96, medium: 93, dark: 90 };
const TEMP_F: Record<Roast, number> = { light: 205, medium: 200, dark: 195 };

const BASE_STEEP_SEC: Record<Roast, number> = {
  light: 270,
  medium: 240,
  dark: 210,
};

const GRIND_ADJUST_SEC: Record<Grind, number> = {
  "extra-fine": -90,
  fine: -60,
  medium: -30,
  coarse: 0,
  "extra-coarse": 30,
};

const MIN_STEEP_SEC = 90;
const GRAMS_PER_TBSP = 5.5;
const OZ_PER_ML = 0.033814;

export function calculateRecipe(config: RecipeConfig): RecipeOutput {
  const { strength, press, grind, roast } = config;

  const waterMl = press.ml;
  const coffeeG = (waterMl * STRENGTH_RATIO[strength]) / 100;
  const bloomMl = coffeeG * 2;

  const rawSteep = BASE_STEEP_SEC[roast] + GRIND_ADJUST_SEC[grind];
  const steepSec = Math.max(MIN_STEEP_SEC, rawSteep);

  const coffeeTbsp = Math.round((coffeeG / GRAMS_PER_TBSP) * 2) / 2;
  const waterOz = Math.round(waterMl * OZ_PER_ML);

  return {
    coffeeG,
    coffeeTbsp,
    waterMl,
    waterOz,
    tempC: TEMP_C[roast],
    tempF: TEMP_F[roast],
    steepSec,
    bloomMl,
  };
}
