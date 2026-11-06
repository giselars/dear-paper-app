export const palettes = [
  {
    id: "ivory-terracotta",
    label: "Terracota y Marfil",
    background: "#F5F0E6",
    accent: "#8A4635",
  },
  {
    id: "ivory-olive",
    label: "Marfil y Oliva",
    background: "#F5F0E6",
    accent: "#465039",
  },
  {
    id: "sand-walnut",
    label: "Arena y Nogal",
    background: "#F3E8D4",
    accent: "#604735",
  },
] as const;
// Retained only to render previously shared v3 snapshots faithfully.
export const retiredTerracottaPalette = {
  id: "linen-terracotta",
  label: "Lino y Terracota",
  background: "#EFE1CD",
  accent: "#8A4635",
} as const;
export const readablePalettes = [
  ...palettes,
  retiredTerracottaPalette,
] as const;
export type PaletteId = (typeof readablePalettes)[number]["id"];
export type CoverPalette = (typeof readablePalettes)[number];
export const getPalette = (id: PaletteId): CoverPalette =>
  readablePalettes.find((palette) => palette.id === id)!;
export const paletteAsset = (
  kind: "motifs" | "thumbnails",
  motif: string,
  paletteId: PaletteId,
) => `/assets/${kind}/palettes/${paletteId}/${motif}.svg`;
export const mixPaletteColor = (palette: CoverPalette, proportion: number) =>
  "#" +
  [1, 3, 5]
    .map((offset) => {
      const foreground = parseInt(palette.accent.slice(offset, offset + 2), 16);
      const background = parseInt(
        palette.background.slice(offset, offset + 2),
        16,
      );
      return Math.round(foreground * proportion + background * (1 - proportion))
        .toString(16)
        .padStart(2, "0");
    })
    .join("")
    .toUpperCase();
