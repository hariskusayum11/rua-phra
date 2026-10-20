/**
 * WCAG 2.1 relative luminance and contrast, used to keep the palette honest.
 *
 * The design tokens in globals.css are not free-floating decisions: every pair that
 * carries text has to clear 4.5:1, and every pair that carries a meaningful graphic has
 * to clear 3:1. tests/foundation.test.ts asserts the pairs the site actually renders.
 */
function channel(value: number) {
  const ratio = value / 255;
  return ratio <= 0.04045 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string) {
  const value = hex.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(value)) throw new Error(`Expected a six-digit hex colour, received "${hex}"`);
  const packed = Number.parseInt(value, 16);
  return (
    0.2126 * channel((packed >> 16) & 255) +
    0.7152 * channel((packed >> 8) & 255) +
    0.0722 * channel(packed & 255)
  );
}

export function contrastRatio(foreground: string, background: string) {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

/** The tokens defined in src/app/globals.css, mirrored so tests can reason about them. */
export const palette = {
  background: "#f8f4ea",
  surface: "#fffdf8",
  surfaceMist: "#e6edef",
  dark: "#1c2f5a",
  darkRaised: "#26407a",
  deep: "#0f1f3d",
  primary: "#244a86",
  foreground: "#18202f",
  muted: "#575f6e",
  onDark: "#fbf8f1",
  onDarkMuted: "#c3cde0",
  accent: "#eb8036",
  accentText: "#a4461a",
  accentDeep: "#8a3a14",
  accentInk: "#3a1803",
  sea: "#21606a",
  craft: "#e8c47c",
} as const;
