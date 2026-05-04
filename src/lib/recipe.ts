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

// Pour over follows the SCAA Golden Cup rhythm: bloom + three pours.
// Bloom uses a 2.3:1 water-to-coffee ratio; pours 2 and 3 each take 30 %
// of the post-bloom water; pour 4 absorbs the remainder. Step durations
// are static (bloom 45 s, pour-2 30 s, pour-3 30 s, final pour 45 s).
const POUR_OVER_BLOOM_RATIO = 2.3;
const POUR_OVER_BLOOM_SEC = 45;
const POUR_OVER_DRAIN_SEC = 45;
const POUR_OVER_POUR_FRACTION = 0.3;

export function calculatePourOverRecipe(config: PourOverConfig): PourOverOutput {
  const { waterMl, roast, strength } = config;

  const coffeeG = (waterMl * STRENGTH_RATIO[strength]) / 100;
  const bloomMl = Math.round(coffeeG * POUR_OVER_BLOOM_RATIO);

  const remaining = waterMl - bloomMl;
  const pour2Ml = Math.round(remaining * POUR_OVER_POUR_FRACTION);
  const pour3Ml = Math.round(remaining * POUR_OVER_POUR_FRACTION);
  // pour4 absorbs rounding so the four water additions sum exactly to waterMl.
  const pour4Ml = remaining - pour2Ml - pour3Ml;

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
    bloomOz: Math.round(bloomMl * OZ_PER_ML),
    bloomSec: POUR_OVER_BLOOM_SEC,
    pour2Ml,
    pour2Oz: Math.round(pour2Ml * OZ_PER_ML),
    pour3Ml,
    pour3Oz: Math.round(pour3Ml * OZ_PER_ML),
    pour4Ml,
    pour4Oz: Math.round(pour4Ml * OZ_PER_ML),
    drainSec: POUR_OVER_DRAIN_SEC,
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
