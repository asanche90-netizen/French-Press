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
): Step[] {
  const bloomStr = mlOrOz(recipe.bloomMl, unit);
  const waterStr =
    unit === "metric" ? `${recipe.waterMl} ml` : `${recipe.waterOz} fl oz`;

  return [
    {
      id: "bloom-pour",
      name: "Pour bloom water",
      title: "Pour bloom water.",
      subtitle: `Pour ${bloomStr} slowly over grounds.`,
      duration: 10,
    },
    {
      id: "bloom",
      name: "Bloom",
      title: "Bloom.",
      subtitle: "Swirl gently. CO₂ is releasing.",
      duration: 45,
    },
    {
      id: "pour-remaining",
      name: "Pour remaining water",
      title: "Pour remaining water.",
      subtitle: `Top up to ${waterStr} in a spiral.`,
      duration: 15,
    },
    {
      id: "steep",
      name: "Steep",
      title: "Steep.",
      subtitle: "Lid on. Plunger up. Wait.",
      midSubtitle: "Break the crust, skim the foam.",
      duration: Math.max(0, recipe.steepSec - 70),
    },
    {
      id: "press",
      name: "Press",
      title: "Press.",
      subtitle: "Slow and steady, about 20 seconds.",
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
      title: "Rinse your filter.",
      subtitle: "Pour through to warm the dripper.",
      duration: 15,
    },
    {
      id: "add-coffee",
      name: "Add coffee",
      title: "Add coffee.",
      subtitle: `${formatCoffeeG(recipe.coffeeG)}g, medium-fine grind.`,
      duration: 0,
    },
    {
      id: "bloom",
      name: "Bloom",
      title: "Bloom pour.",
      subtitle: `Pour ${mlOrOz(recipe.bloomMl, unit)} to saturate.`,
      duration: recipe.bloomSec,
    },
    {
      id: "pour-1",
      name: "First pour",
      title: "First pour.",
      subtitle: `Add ${mlOrOz(recipe.pour1Ml, unit)} in spirals.`,
      duration: 45,
    },
    {
      id: "pour-2",
      name: "Second pour",
      title: "Second pour.",
      subtitle: `Add ${mlOrOz(recipe.pour2Ml, unit)} steadily.`,
      duration: 45,
    },
    {
      id: "pour-3",
      name: "Final pour",
      title: "Final pour.",
      subtitle: `Add ${mlOrOz(recipe.pour3Ml, unit)}. Let drain.`,
      duration: recipe.drainSec,
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
      subtitle: "Let it run until the carafe is full.",
      duration: recipe.brewSec,
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
