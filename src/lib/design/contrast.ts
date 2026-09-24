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
  background: "#f7f5f0",
  surface: "#ffffff",
  surfaceWarm: "#eee9df",
  dark: "#0e2723",
  primary: "#173b34",
  foreground: "#171a18",
  muted: "#686a64",
  onDark: "#f7f5f0",
  onDarkMuted: "#b9c2bd",
  accent: "#c36a3d",
  accentText: "#a2512a",
  accentDeep: "#8d4429",
  craft: "#b79a61",
} as const;
