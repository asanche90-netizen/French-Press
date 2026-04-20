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

export type RecipeInput = {
  press: PressSize;
  roast: Roast;
  grind: Grind;
  strength: Strength;
};

export type RecipeOutput = {
  coffeeGrams: number;
  waterMl: number;
  bloomMl: number;
  waterTempC: number;
  steepSeconds: number;
};

export type SavedRecipe = {
  id: string;
  name: string;
  input: RecipeInput;
  createdAt: number;
};
