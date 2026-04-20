import type { SavedRecipe, Unit } from "./types";

const RECIPES_KEY = "frenchpress:recipes";
const UNIT_KEY = "fp.unit";

// All accessors are wrapped in try/catch. localStorage can throw in Safari
// private mode, when the quota is exceeded, or when storage is disabled.
// Reads return a safe default; writes log and silently fail so the app
// still works without persistence.

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
    const existing = getSavedRecipes().filter((r) => r.name !== recipe.name);
    const next = [...existing, recipe];
    localStorage.setItem(RECIPES_KEY, JSON.stringify(next));
  } catch (err) {
    console.error("saveRecipe failed; storage unavailable", err);
  }
}

export function deleteRecipe(id: string): void {
  try {
    const next = getSavedRecipes().filter((r) => r.id !== id);
    localStorage.setItem(RECIPES_KEY, JSON.stringify(next));
  } catch (err) {
    console.error("deleteRecipe failed; storage unavailable", err);
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
