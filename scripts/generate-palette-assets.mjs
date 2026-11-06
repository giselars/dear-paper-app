import { readFile, mkdir, writeFile } from "node:fs/promises";
import {
  palettes,
  mixPaletteColor,
} from "../src/features/customizer/domain/palettes.ts";

// Run from web/: pnpm exec node scripts/generate-palette-assets.mjs
// Only paints change; source geometry and legacy assets remain intact.
const paints = {
  botanical: {
    "#767D56": 1,
    "#989C7A": 0.7,
    "#929777": 0.7,
    "#7B8060": 1,
    "#777D5F": 1,
    "#767B5B": 1,
    "#737859": 1,
  },
  dunes: { "#D8C5A9": 0.35, "#CAAA84": 0.65, "#B98A62": 1 },
  frame: { "#81885F": 1, "#898E67": 0.7 },
};
for (const kind of ["motifs", "thumbnails"]) {
  for (const [motif, mapping] of Object.entries(paints)) {
    const source = await readFile(
      new URL(`../public/assets/${kind}/${motif}.svg`, import.meta.url),
      "utf8",
    );
    for (const palette of palettes) {
      const result = source.replace(
        /(fill|stroke)="(#[\da-f]{6})"/gi,
        (_, attribute, color) => {
          const value = color.toUpperCase();
          if (value === "#F3E8D4")
            return `${attribute}="${palette.background}"`;
          if (!(value in mapping))
            throw new Error(`Unmapped paint ${value} in ${kind}/${motif}`);
          return `${attribute}="${mixPaletteColor(palette, mapping[value])}"`;
        },
      );
      const directory = new URL(
        `../public/assets/${kind}/palettes/${palette.id}/`,
        import.meta.url,
      );
      await mkdir(directory, { recursive: true });
      await writeFile(new URL(`${motif}.svg`, directory), result);
    }
  }
}
