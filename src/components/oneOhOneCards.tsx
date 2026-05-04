import type { ReactNode } from "react";
import RatioIllustration from "./illustrations/RatioIllustration";
import TemperatureIllustration from "./illustrations/TemperatureIllustration";
import GrindIllustration from "./illustrations/GrindIllustration";
import BloomIllustration from "./illustrations/BloomIllustration";
import ExtractionIllustration from "./illustrations/ExtractionIllustration";
import PourIllustration from "./illustrations/PourIllustration";

export type CardData = {
  headline: string;
  body: string;
  illustration?: ReactNode;
  illustrationLabel?: string;
};

export const FRENCH_PRESS_CARDS: CardData[] = [
  {
    headline: "How strong is strong?",
    body: "The ratio of coffee to water decides how your brew tastes. More coffee per water makes a bolder cup. Less makes a brighter, lighter one. Everything else — temperature, time, grind — balances around this one decision.",
    illustration: <RatioIllustration />,
    illustrationLabel:
      "A balance scale with coffee on one pan and water on the other, tilting and settling level.",
  },
  {
    headline: "Hot, but not too hot.",
    body: "Water temperature controls how fast coffee extracts. Hotter water pulls flavor quickly — great for dense dark roasts, harsh on delicate light ones. Lighter roasts want near-boiling water. Darker roasts want slightly cooler. The app picks the right temp for your beans.",
    illustration: <TemperatureIllustration />,
    illustrationLabel:
      "A thermometer with light roast at the hot end and dark roast at the cooler end.",
  },
  {
    headline: "Bigger grind, slower brew.",
    body: "In a French press, coffee sits in water for minutes. Coarse grind is essential — fine grind over-extracts, turns bitter, and slips past the mesh filter. Think sea salt, not table salt.",
    illustration: <GrindIllustration />,
    illustrationLabel:
      "A row of circles growing from fine to coarse, with the coarse end highlighted as the French press zone.",
  },
  {
    headline: "Let it breathe.",
    body: "Fresh coffee holds trapped CO₂ from roasting. Pour a little water first and the grounds puff up, releasing gas. Skip this, and the gas blocks even extraction. The first 45 seconds of the brew are just the coffee breathing out.",
    illustration: <BloomIllustration />,
    illustrationLabel:
      "Coffee grounds in a press with bubbles rising from the surface as the bloom releases gas.",
  },
  {
    headline: "Four minutes to flavor.",
    body: "Different compounds extract at different rates. Sweetness and body come out first; bitterness comes out last. Four minutes is the sweet spot where the good stuff is in the cup and the harsh stuff hasn't arrived yet.",
    illustration: <ExtractionIllustration />,
    illustrationLabel:
      "Three extraction curves over time — sweetness peaks early, body in the middle, bitterness rises steeply at the end, with the four-minute mark highlighted.",
  },
  {
    headline: "Don't leave it sitting.",
    body: "Plunging doesn't stop extraction — it just separates the bulk of the grounds from the filter. Any coffee left in the press keeps brewing, and keeps getting bitter. Pour it all out when you're done. The second cup waits in a mug, not the press.",
    illustration: <PourIllustration />,
    illustrationLabel:
      "Coffee streams from a French press into a mug — the press empties as the mug fills.",
  },
];

export const POUR_OVER_CARDS: CardData[] = [
  {
    headline: "What makes pour over different",
    body: "Pour over is a manual brewing method where you control the water flow yourself. Because you're pouring in stages, you can ensure every ground is evenly saturated — which produces a clean, bright, and nuanced cup.",
  },
  {
    headline: "The bloom",
    body: "The first pour is called the bloom. Fresh coffee releases CO₂ gas when it meets hot water. Letting the grounds bloom for 45 seconds allows this gas to escape, which gives the following pours a cleaner path through the coffee bed and improves extraction.",
  },
  {
    headline: "Why the pour pattern matters",
    body: "Pouring in slow, even circles keeps the coffee bed flat and ensures water contacts all the grounds equally. Pouring too fast or in one spot can channel — where water finds a path of least resistance and bypasses grounds, leading to uneven extraction.",
  },
  {
    headline: "Grind size",
    body: "Pour over uses a medium-fine grind, similar to table salt. Too coarse and the water drains too fast (weak, watery coffee). Too fine and it drains too slowly (bitter, over-extracted coffee). The drain time is your best feedback signal — a 2:30–3:00 total brew time is your target.",
  },
];

export const DRIP_CARDS: CardData[] = [
  {
    headline: "What makes drip different",
    body: "Drip coffee is the most hands-off brewing method — once you set it up, the machine handles the water flow and timing. The trade-off is less control, but with good coffee and the right ratio, a drip machine consistently produces a smooth, approachable cup.",
  },
  {
    headline: "What you can control",
    body: "You don't control the pour, but you do control three things that matter: the grind size, the coffee-to-water ratio, and the coffee itself. Freshly ground coffee at a medium grind (like kosher salt) makes a significant difference even in an automatic machine.",
  },
  {
    headline: "Filter shape affects flavor",
    body: "Drip machines use either a flat-bottom or cone-shaped filter basket. Flat bottom baskets have a larger surface area — water moves through faster, producing a smoother, milder cup. Cone baskets concentrate water flow, slowing it down for a richer, more complex flavor. Neither is better — it depends on what you prefer.",
  },
  {
    headline: "The Golden Ratio",
    body: "The SCA recommends 1–2 tablespoons of ground coffee per 6 oz of water. This app uses that baseline. If your coffee tastes weak, try a slightly finer grind before adding more coffee — grind size has more impact than most people expect.",
  },
];
