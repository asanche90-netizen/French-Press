export type Strength = "weak" | "mild" | "balanced" | "strong" | "bold";

export type Roast = "light" | "medium" | "dark";

export type Grind =
  | "extra-fine"
  | "fine"
  | "medium"
  | "coarse"
  | "extra-coarse";

export type PressPreset = "small" | "standard" | "large" | "custom";

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

export type SavedRecipe = {
  id: string;
  name: string;
  config: {
    strength: Strength;
    press: PressSize;
    grind: Grind;
    roast: Roast;
  };
  createdAt: number;
};
