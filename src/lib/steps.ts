import type {
  DripOutput,
  PourOverOutput,
  RecipeOutput,
  Roast,
  Unit,
} from "./types";
import { tempTip } from "./format";

// A brew step shown on the Brew screen. Steps with duration 0 render with no
// active timer; the user advances them with the Next button. The LAST step
// in a steps array is treated as a terminal sentinel: Brew never displays
// it, instead navigating to the Complete screen when reached.
export type Step = {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  // Optional alternate subtitle shown when 0 < timerSec <= duration/2. Used
  // for the French press steep "break the crust, skim the foam" prompt.
  midSubtitle?: string;
  // Optional supplementary helper note shown under the subtitle in muted
  // small text. Currently used by the pour-over Heat water step.
  tip?: string;
  duration: number;
};

const OZ_PER_ML = 0.033814;

function mlOrOz(ml: number, unit: Unit): string {
  return unit === "metric"
    ? `${Math.round(ml)} ml`
    : `${Math.round(ml * OZ_PER_ML)} fl oz`;
}

function tempLabel(tempC: number, tempF: number, unit: Unit): string {
  return unit === "metric" ? `${tempC}°C` : `${tempF}°F`;
}

function formatCoffeeG(g: number): string {
  return g.toFixed(1).replace(/\.0$/, "");
}

export function buildFrenchPressSteps(
  recipe: RecipeOutput,
  unit: Unit,
  roast: Roast,
): Step[] {
  const temp = tempLabel(recipe.tempC, recipe.tempF, unit);
  const bloomStr = mlOrOz(recipe.bloomMl, unit);
  // remainingMl = waterMl - bloomMl (computed here, not in recipe.ts)
  const remainingStr = mlOrOz(recipe.waterMl - recipe.bloomMl, unit);
  const coffeeG = formatCoffeeG(recipe.coffeeG);
  const coffeeTbsp = recipe.coffeeTbsp;

  return [
    {
      id: "heat-water",
      name: "Heat water",
      title: "Heat water.",
      subtitle: `Bring water to ${temp}.`,
      tip: tempTip(roast),
      duration: 0,
    },
    {
      id: "rinse-press",
      name: "Rinse press",
      title: "Rinse and warm your press.",
      subtitle:
        "Pour a small amount of hot water into the press, swirl, and discard.",
      duration: 0,
    },
    {
      id: "add-coffee",
      name: "Add coffee",
      title: "Add coffee.",
      subtitle: `Add ${coffeeG}g (${coffeeTbsp} tbsp) of coarsely ground coffee.`,
      duration: 0,
    },
    {
      id: "bloom-pour",
      name: "Pour bloom water",
      title: "Pour bloom water.",
      subtitle: `Pour ${bloomStr} over grounds in a slow circle. Stir gently to saturate all grounds.`,
      duration: 30,
    },
    {
      id: "pour-remaining",
      name: "Pour remaining water",
      title: "Pour remaining water.",
      subtitle: `Pour remaining ${remainingStr} slowly over the grounds.`,
      duration: 15,
    },
    {
      id: "steep",
      name: "Steep",
      title: "Steep.",
      subtitle: "Place the plunger lightly on top to cover. Do not press yet.",
      duration: recipe.steepSec,
    },
    {
      id: "press",
      name: "Press",
      title: "Press.",
      subtitle: "Press the plunger down slowly and steadily.",
      duration: 20,
    },
    {
      // Terminal sentinel: navigates to Complete instead of displaying.
      id: "fp-complete",
      name: "Enjoy",
      title: "Enjoy.",
      subtitle: "Decant now to avoid over-extraction.",
      duration: 0,
    },
  ];
}

export function buildPourOverSteps(
  recipe: PourOverOutput,
  unit: Unit,
  roast: Roast,
): Step[] {
  const temp = tempLabel(recipe.tempC, recipe.tempF, unit);
  const coffeeG = formatCoffeeG(recipe.coffeeG);

  return [
    {
      id: "heat-water",
      name: "Heat water",
      title: "Heat water.",
      subtitle: `Bring water to ${temp}.`,
      tip: tempTip(roast),
      duration: 0,
    },
    {
      id: "rinse-filter",
      name: "Rinse filter",
      title: "Rinse filter.",
      subtitle: "Pour hot water through the filter into your carafe.",
      duration: 15,
    },
    {
      id: "discard-rinse",
      name: "Discard rinse",
      title: "Discard rinse water.",
      subtitle:
        "Pour out the rinse water from your carafe. This removes papery taste and keeps your brew temperature stable.",
      duration: 0,
    },
    {
      id: "add-coffee",
      name: "Add coffee",
      title: "Add coffee.",
      subtitle: `Add ${coffeeG}g of medium-fine ground coffee. Shake gently to level the bed.`,
      duration: 0,
    },
    {
      id: "bloom",
      name: "Bloom",
      title: "Bloom pour.",
      subtitle: `Pour ${recipe.bloomMl}g of water in a slow circle. Make sure all grounds are saturated.`,
      duration: 45,
    },
    {
      id: "pour-2",
      name: "Second pour",
      title: "Second pour.",
      subtitle: `Pour ${recipe.pour2Ml}g of water slowly in circles. Avoid the edges of the filter.`,
      duration: 30,
    },
    {
      id: "pour-3",
      name: "Third pour",
      title: "Third pour.",
      subtitle: `Pour ${recipe.pour3Ml}g of water in the same pattern.`,
      duration: 30,
    },
    {
      id: "pour-4",
      name: "Final pour",
      title: "Final pour.",
      subtitle: `Add remaining ${recipe.pour4Ml}g of water and allow to drain fully.`,
      duration: 45,
    },
    {
      // Terminal sentinel: navigates to Complete instead of displaying.
      id: "po-complete",
      name: "Enjoy",
      title: "Enjoy.",
      subtitle: "Decant and serve.",
      duration: 0,
    },
  ];
}

export function buildDripSteps(recipe: DripOutput, unit: Unit): Step[] {
  const waterStr =
    unit === "metric" ? `${recipe.waterMl} ml` : `${recipe.waterOz} fl oz`;

  return [
    {
      id: "grind",
      name: "Grind coffee",
      title: "Grind coffee.",
      subtitle: "Medium grind, like sea salt.",
      duration: 0,
    },
    {
      id: "filter",
      name: "Add filter",
      title: "Add paper filter.",
      subtitle: "Drop a fresh filter into the basket.",
      duration: 0,
    },
    {
      id: "add-coffee",
      name: "Add coffee",
      title: "Add coffee.",
      subtitle: `Pour ${formatCoffeeG(recipe.coffeeG)}g into the basket.`,
      duration: 0,
    },
    {
      id: "add-water",
      name: "Add water",
      title: "Fill reservoir.",
      subtitle: `Pour ${waterStr} into the water tank.`,
      duration: 0,
    },
    {
      id: "brew",
      name: "Brew",
      title: "Start your machine.",
      // The user can't control how long the machine takes, so this is a
      // tap-next-when-ready step rather than a countdown.
      subtitle:
        "Start your machine and wait for the brew cycle to complete. Most machines take 4–6 minutes — your machine will signal when it's done.",
      duration: 0,
    },
    {
      // Terminal sentinel: navigates to Complete instead of displaying.
      id: "drip-complete",
      name: "Enjoy",
      title: "Enjoy.",
      subtitle: "Pour and serve.",
      duration: 0,
    },
  ];
}
