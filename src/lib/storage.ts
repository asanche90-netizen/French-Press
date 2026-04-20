import type { SavedRecipe, Unit } from "./types";

const RECIPES_KEY = "fp.recipes";
const UNIT_KEY = "fp.unit";

// All accessors are wrapped in try/catch. localStorage can throw in Safari
// private mode, when the quota is exceeded, or when storage is disabled.
// Reads return a safe default; writes silently fail so the app still works.

export function getSavedRecipes(): SavedRecipe[] {
  try {
    const raw = localStorage.getItem(RECIPES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedRecipe[]) : [];
  } catch {
    return [];
  }
}

export function saveRecipe(recipe: SavedRecipe): void {
  try {
    const existing = getSavedRecipes().filter((r) => r.id !== recipe.id);
    const next = [...existing, recipe];
    localStorage.setItem(RECIPES_KEY, JSON.stringify(next));
  } catch {
    // no-op: storage unavailable
  }
}

export function getUnitPreference(): Unit {
  try {
    const raw = localStorage.getItem(UNIT_KEY);
    return raw === "imperial" ? "imperial" : "metric";
  } catch {
    return "metric";
  }
}

export function setUnitPreference(unit: Unit): void {
  try {
    localStorage.setItem(UNIT_KEY, unit);
  } catch {
    // no-op: storage unavailable
  }
}
