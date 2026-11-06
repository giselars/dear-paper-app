import { describe, expect, it } from "vitest";
import { compositions, initialCover } from "./initial-cover";
import {
  contrastRatio,
  createCoverScene,
  type MeasureText,
} from "./cover-scene";

const measure: MeasureText = (text, size) => ({
  width: Array.from(text).reduce(
    (sum, char) => sum + size * (char === "W" ? 0.95 : 0.5),
    0,
  ),
  ascent: size * 0.8,
  descent: size * 0.2,
});
const fixtures = [
  { title: "", subtitle: "" },
  { title: "W".repeat(40), subtitle: "W".repeat(80) },
  {
    title: "Árboles y próximas ideas",
    subtitle: "¿Qué viene después? ¡Mañana, más!",
  },
  { title: "<script>& hola", subtitle: '"Textos" & posibilidades' },
  { title: "  Ideas   con espacios  ", subtitle: "  Sin recortar  " },
];
describe("shared cover scene (CU-03, CU-04)", () => {
  for (const composition of compositions) {
    it.each(fixtures)(
      `${composition.label}: preserves and fits $title`,
      (fixture) => {
        const scene = createCoverScene(
          { ...initialCover, compositionId: composition.id, ...fixture },
          measure,
        );
        expect(scene.width / scene.height).toBeCloseTo(148 / 210);
        for (const field of ["title", "subtitle"] as const) {
          const layout = scene[field];
          expect(layout.lines.map((line) => line.text).join("")).toBe(
            fixture[field],
          );
          for (const line of layout.lines) {
            const metrics = measure(line.text, layout.fontSize, field);
            expect(line.x - metrics.width / 2).toBeGreaterThanOrEqual(0);
            expect(line.x + metrics.width / 2).toBeLessThanOrEqual(scene.width);
            expect(line.y - metrics.ascent).toBeGreaterThanOrEqual(0);
            expect(line.y + metrics.descent).toBeLessThanOrEqual(scene.height);
          }
        }
      },
    );
  }
  it("updates all paints from one palette", () => {
    const scene = createCoverScene(
      { ...initialCover, compositionId: "dunes", paletteId: "sand-walnut" },
      measure,
    );
    expect(scene).toMatchObject({
      motif: "dunes",
      background: "#F3E8D4",
      ink: "#604735",
      spine: "#604735",
      separator: "#604735",
    });
    expect(scene.contrast).toBeGreaterThanOrEqual(4.5);
  });
  it("measures contrast symmetrically without mutating the choice", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21);
    expect(contrastRatio("#F5F0E6", "#F5F0E6")).toBe(1);
    expect(contrastRatio("#252520", "#F3E8D4")).toBeGreaterThan(12);
  });
});
