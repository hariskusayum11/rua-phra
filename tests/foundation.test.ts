import assert from "node:assert/strict";
import test from "node:test";
import { archiveQuery, hotspotCoordinates } from "../src/lib/validations/archive";
import { mediaUrl } from "../src/lib/services/media";
import { contrastRatio, palette } from "../src/lib/design/contrast";

test("archive filters handle malformed input, Thai search and future years", () => {
  assert.deepEqual(archiveQuery.parse({}), { q: "" });
  assert.equal(archiveQuery.parse({ q: "  เรือพระ  " }).q, "เรือพระ");
  assert.equal(archiveQuery.parse({ year: "2600" }).year, "2600");
  assert.equal(archiveQuery.parse({ year: "25ab" }).year, undefined);
  assert.equal(archiveQuery.parse({ temple: "  " }).temple, undefined);
  assert.equal(archiveQuery.parse({ q: ["unexpected"] }).q, "");
});

test("hotspots reject out-of-image and non-finite coordinates", () => {
  assert.equal(hotspotCoordinates.safeParse({ x: 0, y: 100 }).success, true);
  for (const x of [-1, 101, NaN, Infinity]) {
    assert.equal(hotspotCoordinates.safeParse({ x, y: 50 }).success, false);
  }
});

test("media returns null for absent assets and unsafe URL forms", () => {
  for (const value of [undefined, null, "", "  ", "//evil.example/image", "javascript:alert(1)", "data:image/svg+xml,test", "/\\evil.example", "https://user:password@example.com/image"]) {
    assert.equal(mediaUrl(value), null);
  }
  assert.equal(mediaUrl("/photos/boat.webp"), "/photos/boat.webp");
  assert.equal(mediaUrl(" https://cdn.example.com/boat.webp "), "https://cdn.example.com/boat.webp");
});

test("every palette pair that carries text clears WCAG AA", () => {
  const { background, surfaceWarm, dark, primary, foreground, muted, onDark, onDarkMuted, accentText, craft } = palette;
  const text: [string, string, string][] = [
    ["body copy on off-white", foreground, background],
    ["body copy on the warm surface", foreground, surfaceWarm],
    ["body copy on the gallery surface", foreground, palette.surface],
    ["secondary copy on the gallery surface", muted, palette.surface],
    ["section index on the gallery surface", accentText, palette.surface],
    ["secondary copy on off-white", muted, background],
    ["secondary copy on the warm surface", muted, surfaceWarm],
    ["section index on off-white", accentText, background],
    ["section index on the warm surface", accentText, surfaceWarm],
    ["heritage green headings on off-white", primary, background],
    ["off-white on the heritage green band", onDark, dark],
    ["secondary copy on the heritage green band", onDarkMuted, dark],
    ["craft gold labels on the heritage green band", craft, dark],
    ["off-white on the heritage green button", background, primary],
  ];
  for (const [name, foregroundColour, backgroundColour] of text) {
    const ratio = contrastRatio(foregroundColour, backgroundColour);
    assert.ok(ratio >= 4.5, `${name} is ${ratio.toFixed(2)}:1, below the 4.5:1 minimum`);
  }
});

test("the decorative tones are kept away from text", () => {
  // Craft gold is 2.47:1 on the off-white and terracotta is 3.54:1, which is why the gold
  // is limited to rules and markers on light, and small accent text uses --accent-text.
  assert.ok(contrastRatio(palette.craft, palette.background) < 4.5);
  assert.ok(contrastRatio(palette.accent, palette.background) < 4.5);
  // Terracotta cannot carry text on the heritage green either; the gold does that there.
  assert.ok(contrastRatio(palette.accent, palette.dark) < 4.5);
});
