import type { Grind, PressSize, Roast, Strength, Unit } from "./types";

const STRENGTH_LABEL: Record<Strength, string> = {
  weak: "Weak",
  mild: "Mild",
  balanced: "Balanced",
  strong: "Strong",
  bold: "Bold",
};

const GRIND_LABEL: Record<Grind, string> = {
  "extra-fine": "Extra fine",
  fine: "Fine",
  medium: "Medium",
  coarse: "Coarse",
  "extra-coarse": "Extra coarse",
};

const ROAST_LABEL: Record<Roast, string> = {
  light: "Light",
  medium: "Medium",
  dark: "Dark",
};

const OZ_PER_ML = 0.033814;

export function formatPressVolume(press: PressSize, unit: Unit): string {
  return unit === "metric"
    ? `${press.ml} ml`
    : `${Math.round(press.ml * OZ_PER_ML)} fl oz`;
}

export function configSummary(
  config: { roast: Roast; strength: Strength; press: PressSize; grind: Grind },
  unit: Unit,
): string {
  const { roast, strength, press, grind } = config;
  return `${ROAST_LABEL[roast]} roast · ${STRENGTH_LABEL[strength]} · ${formatPressVolume(
    press,
    unit,
  )} · ${GRIND_LABEL[grind]} grind`;
}
