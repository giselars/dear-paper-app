import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { compositions, initialCover } from "./initial-cover";
import { palettes, mixPaletteColor, paletteAsset } from "./palettes";
import { validateConfiguration } from "./configuration";
import { createCoverScene, estimateText } from "./cover-scene";
import { createDesignLink, decodeDesignLink } from "./design-links";
import {
  customizerReducer,
  initialCustomizerState,
} from "./customizer-reducer";

const encode = (version: number, configuration: unknown) =>
  `?design=${encodeURIComponent(JSON.stringify({ version, configuration }))}`;
const legacy = {
  compositionId: "dunes",
  coverColorId: "sage",
  typographyId: "literary",
  textTone: "light",
  title: "Legado",
  subtitle: "Original",
};
const withoutPaints = (source: string) =>
  source.replace(/(fill|stroke)="#[\da-f]{6}"/gi, '$1="PAINT"');

describe("coordinated palettes", () => {
  for (const composition of compositions) {
    for (const palette of palettes) {
      it(`${composition.id}/${palette.id}: coordinates all paints and shares a v3 snapshot`, () => {
        const configuration = {
          ...initialCover,
          compositionId: composition.id,
          paletteId: palette.id,
        };
        expect(validateConfiguration(configuration)).toEqual({
          valid: true,
          configuration,
        });
        const scene = createCoverScene(configuration, estimateText);
        expect(scene).toMatchObject({
          background: palette.background,
          ink: palette.accent,
          spine: palette.accent,
          separator: palette.accent,
          motifAsset: paletteAsset("motifs", composition.id, palette.id),
        });
        expect(scene.contrast).toBeGreaterThanOrEqual(4.5);
        const url = new URL(
          createDesignLink(configuration, "https://dear.test"),
        );
        expect(JSON.parse(url.searchParams.get("design")!).version).toBe(3);
        expect(decodeDesignLink(url.search)).toEqual({
          status: "valid",
          configuration,
        });
      });
      it(`${composition.id}/${palette.id}: derived assets preserve geometry and only use palette paints`, () => {
        for (const kind of ["motifs", "thumbnails"] as const) {
          const original = readFileSync(
            `public/assets/${kind}/${composition.id}.svg`,
            "utf8",
          );
          const derived = readFileSync(
            `public${paletteAsset(kind, composition.id, palette.id)}`,
            "utf8",
          );
          expect(withoutPaints(derived)).toBe(withoutPaints(original));
          const allowed = [
            palette.background,
            ...[0.35, 0.65, 0.7, 1].map((amount) =>
              mixPaletteColor(palette, amount),
            ),
          ];
          for (const [, color] of derived.matchAll(
            /(?:fill|stroke)="(#[\da-f]{6})"/gi,
          ))
            expect(allowed).toContain(color);
        }
      });
    }
  }
  it.each([undefined, "unknown", "#ffffff", null])(
    "rejects invalid v3 palette %s",
    (paletteId) => {
      expect(
        decodeDesignLink(encode(3, { ...initialCover, paletteId })),
      ).toEqual({ status: "invalid" });
    },
  );
  it.each([1, 2])(
    "keeps v%s received paints and adapts only the editor",
    (version) => {
      const configuration =
        version === 1
          ? legacy
          : {
              ...legacy,
              coverColorId: "rose",
              textTone: "dark",
              spineColorId: "olive",
            };
      const design = decodeDesignLink(encode(version, configuration));
      if (design.status !== "valid")
        throw new Error("Expected valid legacy link");
      const scene = createCoverScene(design.configuration, estimateText);
      expect(scene).toMatchObject({
        background: version === 1 ? "#A8B29A" : "#D7B6A6",
        ink: version === 1 ? "#F5F0E6" : "#252520",
        spine: version === 1 ? "#AC6044" : "#777860",
        separator: "#AC6044",
        motifAsset: "/assets/motifs/dunes.svg",
      });
      const state = customizerReducer(initialCustomizerState, {
        type: "initialize",
        design,
      });
      expect(state.configuration).toEqual({
        compositionId: "dunes",
        typographyId: "literary",
        paletteId: "ivory-terracotta",
        title: "Legado",
        subtitle: "Original",
      });
      expect(state.colorNotice).toContain("Hemos adaptado");
      expect(() =>
        createDesignLink(state.configuration, "https://dear.test"),
      ).not.toThrow();
    },
  );
  it("preserves shared Lino snapshots and migrates them only for editing", () => {
    const configuration = {
      ...initialCover,
      paletteId: "linen-terracotta" as const,
    };
    const design = decodeDesignLink(encode(3, configuration));
    expect(design).toEqual({ status: "valid", configuration });
    expect(createCoverScene(configuration, estimateText)).toMatchObject({
      background: "#EFE1CD",
      ink: "#8A4635",
      motifAsset: "/assets/motifs/palettes/linen-terracotta/botanical.svg",
    });
    expect(validateConfiguration(configuration).valid).toBe(false);
    const state = customizerReducer(initialCustomizerState, {
      type: "initialize",
      design,
    });
    expect(state.configuration.paletteId).toBe("ivory-terracotta");
    expect(state.colorNotice).toContain("Terracota y Marfil");
    expect(state.configuration.title).toBe(configuration.title);
  });
  it("retains strict historical v2 validation", () => {
    expect(decodeDesignLink(encode(2, legacy))).toEqual({ status: "invalid" });
    expect(
      decodeDesignLink(encode(2, { ...legacy, spineColorId: "unknown" })),
    ).toEqual({ status: "invalid" });
    expect(
      decodeDesignLink(encode(2, { ...legacy, spineColorId: "terracotta" })),
    ).toEqual({ status: "invalid" });
  });
  it.each(palettes)(
    "preserves v3 $label on initialization and motif changes",
    (palette) => {
      const configuration = {
        ...initialCover,
        paletteId: palette.id,
      };
      const state = customizerReducer(initialCustomizerState, {
        type: "initialize",
        design: { status: "valid", configuration },
      });
      expect(state.colorNotice).toBeNull();
      expect(
        customizerReducer(state, {
          type: "change",
          field: "compositionId",
          value: "dunes",
        }).configuration,
      ).toEqual({ ...configuration, compositionId: "dunes" });
    },
  );
});
