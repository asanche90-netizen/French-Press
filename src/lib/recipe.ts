import type { RecipeInput, RecipeOutput } from "./types";

// Stub — real math lands in Phase 2.
// Returns placeholder values so the app type-checks and the UI can render.
export function calculateRecipe(_input: RecipeInput): RecipeOutput {
  return {
    coffeeGrams: 0,
    waterMl: 0,
    bloomMl: 0,
    waterTempC: 0,
    steepSeconds: 0,
  };
}
