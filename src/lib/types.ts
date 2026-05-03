export type BrewMethod = "french-press" | "pour-over" | "drip";

export type Strength = "weak" | "mild" | "balanced" | "strong" | "bold";

export type Roast = "light" | "medium" | "dark";

export type Grind =
  | "extra-fine"
  | "fine"
  | "medium"
  | "coarse"
  | "extra-coarse";

export type PressPreset = "small" | "standard" | "large";

export type PressSize = {
  preset: PressPreset;
  ml: number;
};

export type Unit = "metric" | "imperial";

export type RecipeConfig = {
  strength: Strength;
  press: PressSize;
  grind: Grind;
  roast: Roast;
  units: Unit;
};

export type RecipeOutput = {
  coffeeG: number;
  coffeeTbsp: number;
  waterMl: number;
  waterOz: number;
  tempC: number;
  tempF: number;
  steepSec: number;
  bloomMl: number;
};

export type PourOverConfig = {
  waterMl: number;
  roast: Roast;
  strength: Strength;
};

export type PourOverOutput = {
  coffeeG: number;
  coffeeTbsp: number;
  waterMl: number;
  waterOz: number;
  tempC: number;
  tempF: number;
  bloomMl: number;
  bloomSec: number;
  pour1Ml: number;
  pour1Oz: number;
  pour2Ml: number;
  pour2Oz: number;
  pour3Ml: number;
  pour3Oz: number;
  drainSec: number;
};

export type DripConfig = {
  waterMl: number;
  roast: Roast;
  strength: Strength;
};

export type DripOutput = {
  coffeeG: number;
  coffeeTbsp: number;
  waterMl: number;
  waterOz: number;
  brewSec: number;
};

type SavedRecipeBase = {
  id: string;
  name: string;
  strength: Strength;
  roast: Roast;
  createdAt: number;
};

export type SavedRecipe =
  | (SavedRecipeBase & {
      method: "french-press";
      press: PressSize;
      grind: Grind;
    })
  | (SavedRecipeBase & {
      method: "pour-over";
      waterMl: number;
    })
  | (SavedRecipeBase & {
      method: "drip";
      waterMl: number;
    });
