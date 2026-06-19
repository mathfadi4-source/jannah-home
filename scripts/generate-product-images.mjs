// Generates first-party, on-brand product artwork (SVG) for the seed catalog.
// Run with: node scripts/generate-product-images.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "images", "products");
mkdirSync(outDir, { recursive: true });

/**
 * Elegant "made bed" illustration in the Jannah Home palette.
 * @param {object} p palette
 * @param {boolean} sheen add a satin highlight (used for parures)
 */
function bedSvg(p, sheen = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 750" width="1000" height="750" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.bg1}"/>
      <stop offset="1" stop-color="${p.bg2}"/>
    </linearGradient>
    <linearGradient id="duvet" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.duvet}"/>
      <stop offset="1" stop-color="${p.duvetShade}"/>
    </linearGradient>
    <pattern id="weave" width="16" height="16" patternUnits="userSpaceOnUse">
      <path d="M0 8 H16 M8 0 V16" stroke="${p.frame}" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1000" height="750" fill="url(#bg)"/>
  <rect width="1000" height="750" fill="url(#weave)"/>

  <!-- arch backdrop -->
  <path d="M250 470 V250 a250 250 0 0 1 500 0 V470 Z" fill="${p.arch}" opacity="0.55"/>

  <!-- floor shadow -->
  <ellipse cx="500" cy="648" rx="368" ry="34" fill="#4a2d0e" opacity="0.08"/>

  <!-- headboard -->
  <rect x="208" y="168" width="584" height="214" rx="36" fill="${p.frame}"/>
  <rect x="208" y="168" width="584" height="214" rx="36" fill="#ffffff" opacity="0.06"/>

  <!-- pillows -->
  <rect x="258" y="296" width="214" height="116" rx="36" fill="${p.pillow}"/>
  <rect x="258" y="296" width="214" height="116" rx="36" fill="none" stroke="${p.pillowShade}" stroke-opacity="0.6" stroke-width="3"/>
  <rect x="528" y="296" width="214" height="116" rx="36" fill="${p.pillow}"/>
  <rect x="528" y="296" width="214" height="116" rx="36" fill="none" stroke="${p.pillowShade}" stroke-opacity="0.6" stroke-width="3"/>

  <!-- mattress base -->
  <rect x="168" y="430" width="664" height="156" rx="30" fill="${p.base}"/>

  <!-- duvet -->
  <rect x="180" y="402" width="640" height="150" rx="28" fill="url(#duvet)"/>
  <!-- turn-down fold -->
  <rect x="180" y="402" width="640" height="40" rx="18" fill="${p.pillow}" opacity="0.85"/>
  ${sheen ? `<path d="M180 402 L520 402 L300 552 L180 552 Z" fill="#ffffff" opacity="0.10"/>` : ""}

  <!-- stitched stripes -->
  <g stroke="${p.stripe}" stroke-opacity="0.55" stroke-width="6" stroke-linecap="round">
    <line x1="232" y1="478" x2="768" y2="478"/>
    <line x1="232" y1="506" x2="768" y2="506"/>
    <line x1="232" y1="534" x2="768" y2="534"/>
  </g>
</svg>
`;
}

const palettes = {
  "couette-sable": { bg1: "#faf6f0", bg2: "#f1e4cf", arch: "#e8d5b8", frame: "#7a4b1a", base: "#6b421a", duvet: "#c07b3a", duvetShade: "#a05f29", pillow: "#f5ede0", pillowShade: "#e8d5b8", stripe: "#d9935a" },
  "couette-lin": { bg1: "#faf7f2", bg2: "#efe1ca", arch: "#efe2cd", frame: "#8a6f57", base: "#75593f", duvet: "#e8d5b8", duvetShade: "#d3bc94", pillow: "#faf6f0", pillowShade: "#e0cba6", stripe: "#c07b3a" },
  "couette-terracotta": { bg1: "#faf6f0", bg2: "#f0e0c8", arch: "#ead7bd", frame: "#7a4b1a", base: "#6b421a", duvet: "#d9935a", duvetShade: "#bf7a3a", pillow: "#f5ede0", pillowShade: "#e8d5b8", stripe: "#7a4b1a" },
  "drap-blanc": { bg1: "#faf7f2", bg2: "#f2e6d2", arch: "#f0e2cd", frame: "#c07b3a", base: "#a05f29", duvet: "#ffffff", duvetShade: "#efe6d7", pillow: "#f5ede0", pillowShade: "#e2cdaf", stripe: "#c07b3a" },
  "drap-caramel": { bg1: "#f7efe4", bg2: "#e9d6ba", arch: "#e3cdb0", frame: "#4a2d0e", base: "#3a2208", duvet: "#c07b3a", duvetShade: "#9a5a26", pillow: "#faf6f0", pillowShade: "#e8d5b8", stripe: "#faf6f0" },
  "drap-nuit": { bg1: "#f3e9da", bg2: "#e3cdb0", arch: "#d9c19b", frame: "#4a2d0e", base: "#3a2208", duvet: "#7a4b1a", duvetShade: "#5e3a14", pillow: "#d9935a", pillowShade: "#c07b3a", stripe: "#e8d5b8" },
  "parure-satin": { bg1: "#faf7f2", bg2: "#efe1cb", arch: "#efe1cb", frame: "#c07b3a", base: "#a05f29", duvet: "#fbf7f1", duvetShade: "#ece0cf", pillow: "#f5ede0", pillowShade: "#d9c19b", stripe: "#d9935a" },
  "parure-caramel": { bg1: "#faf6f0", bg2: "#f1e4cf", arch: "#e8d5b8", frame: "#7a4b1a", base: "#5e3a14", duvet: "#c07b3a", duvetShade: "#9a5a26", pillow: "#faf6f0", pillowShade: "#e8d5b8", stripe: "#d9935a" },
  "parure-nuit": { bg1: "#f3e9da", bg2: "#e0c9a6", arch: "#d9c19b", frame: "#3a2208", base: "#2c1906", duvet: "#7a4b1a", duvetShade: "#5e3a14", pillow: "#d9935a", pillowShade: "#c07b3a", stripe: "#f5ede0" },
};

const sheenSet = new Set(["parure-satin", "parure-caramel", "parure-nuit"]);

let count = 0;
for (const [name, palette] of Object.entries(palettes)) {
  writeFileSync(join(outDir, `${name}.svg`), bedSvg(palette, sheenSet.has(name)), "utf8");
  count++;
}
console.log(`Generated ${count} product images in public/images/products/`);
