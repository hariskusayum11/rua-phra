# Create studio redesign

- Local typeface: IBM Plex Sans Thai; dark body text, deep green selection, burnt-orange primary action.
- Desktop workspace sized to viewport. Pattern list scrolls independently; whole colouring sheet fits at 1x. Mobile tools wrap and the primary action stays near the work.
- Credits remain accessible in disclosure panels.
- Product preview dynamically loads Three.js. Procedural ceramic mug, fabric tote and decorative boat miniature use studio lighting, PBR materials, shadows and OrbitControls.
- Products use the maker's coloured motifs as a repeating print, fitted from actual SVG path bounds. The original paper shape and saved placements are unchanged. Print density is adjustable.
- Product images export the current camera angle at 1800px width with creator name and source credits. Unsupported WebGL shows an explicit fallback to the original paper.
- The boat is a decorative miniature for experimenting with patterns, not a historically accurate replica of a particular boat.
- No external model/image assets or uploads are required.

References:
- https://threejs.org/docs/pages/CanvasTexture.html
- https://threejs.org/docs/pages/MeshStandardMaterial.html
- https://threejs.org/docs/pages/OrbitControls.html

Validation:
- npm run lint
- npm run build
- CREATE_REVIEW_URL=http://localhost:3111 node scripts/reviews/check-create-studio.mjs
- Chrome desktop and emulated 360 / 768 / 1440 / 1920 widths: all four stages, 1x sheet fit, product controls, nonblank 1800px PNGs, primary desktop actions within viewport, no horizontal overflow, no page errors.
- WebGL-disabled browser context: fallback to original sheet still exports PNG.
- Actual iOS / Android devices and Safari have not been tested.
