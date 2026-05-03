import type {
  DripConfig,
  DripOutput,
  Grind,
  PourOverConfig,
  PourOverOutput,
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

// Pour over uses the same strength ratio table as French press but a different
// brew structure: 3:1 bloom, three timed pours, total brew time set by roast.
const POUR_OVER_BLOOM_SEC = 45;
const POUR_OVER_POUR_WAIT_SEC = 45;
const POUR_OVER_TOTAL_SEC: Record<Roast, number> = {
  light: 210, // 3:30
  medium: 180, // 3:00
  dark: 150, // 2:30
};

export function calculatePourOverRecipe(config: PourOverConfig): PourOverOutput {
  const { waterMl, roast, strength } = config;

  const coffeeG = (waterMl * STRENGTH_RATIO[strength]) / 100;
  const bloomMl = coffeeG * 3;

  const remaining = waterMl - bloomMl;
  const pour1Ml = remaining * 0.4;
  const pour2Ml = remaining * 0.35;
  const pour3Ml = remaining - pour1Ml - pour2Ml;

  // Drain after pour 3 fills out the remainder of the total brew window.
  const drainSec =
    POUR_OVER_TOTAL_SEC[roast] -
    POUR_OVER_BLOOM_SEC -
    2 * POUR_OVER_POUR_WAIT_SEC;

  const coffeeTbsp = Math.round((coffeeG / GRAMS_PER_TBSP) * 2) / 2;
  const waterOz = Math.round(waterMl * OZ_PER_ML);

  return {
    coffeeG,
    coffeeTbsp,
    waterMl,
    waterOz,
    tempC: TEMP_C[roast],
    tempF: TEMP_F[roast],
    bloomMl,
    bloomSec: POUR_OVER_BLOOM_SEC,
    pour1Ml,
    pour1Oz: Math.round(pour1Ml * OZ_PER_ML),
    pour2Ml,
    pour2Oz: Math.round(pour2Ml * OZ_PER_ML),
    pour3Ml,
    pour3Oz: Math.round(pour3Ml * OZ_PER_ML),
    drainSec,
  };
}

// Drip is the simplest method — the machine controls temperature and pour.
// Only the dose, water volume, and total brew time matter.
const DRIP_BREW_SEC: Record<Roast, number> = {
  light: 360, // 6:00
  medium: 300, // 5:00
  dark: 270, // 4:30
};

export function calculateDripRecipe(config: DripConfig): DripOutput {
  const { waterMl, roast, strength } = config;

  const coffeeG = (waterMl * STRENGTH_RATIO[strength]) / 100;
  const coffeeTbsp = Math.round((coffeeG / GRAMS_PER_TBSP) * 2) / 2;
  const waterOz = Math.round(waterMl * OZ_PER_ML);

  return {
    coffeeG,
    coffeeTbsp,
    waterMl,
    waterOz,
    brewSec: DRIP_BREW_SEC[roast],
  };
}
