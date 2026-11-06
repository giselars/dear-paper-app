import { contrastRatio } from "./color-contrast";
export { contrastRatio } from "./color-contrast";
import { compositions, coverColors, spineColors } from "./initial-cover";
import { textTones } from "./initial-cover";
import { getPalette, paletteAsset } from "./palettes";
import type { CoverSnapshot } from "./design-links";

export type FontRole = "title" | "subtitle";
export type TextMetrics = { width: number; ascent: number; descent: number };
export type MeasureText = (
  text: string,
  fontSize: number,
  role: FontRole,
) => TextMetrics;
type TextBox = { x: number; y: number; width: number; height: number };
export type TextLayout = {
  fontSize: number;
  lines: { text: string; x: number; y: number }[];
};
export type CoverScene = {
  width: 148;
  height: 210;
  background: string;
  ink: string;
  spine: string;
  separator: string;
  motifAsset: string;
  motif: string;
  description: string;
  title: TextLayout;
  subtitle: TextLayout;
  contrast: number;
};

const wrap = (
  text: string,
  width: number,
  fontSize: number,
  role: FontRole,
  measure: MeasureText,
): string[] => {
  const lines: string[] = [];
  let line = "";
  for (const character of Array.from(text)) {
    if (line && measure(line + character, fontSize, role).width > width) {
      const breakAt = line.lastIndexOf(" ");
      if (breakAt >= 0 && breakAt < line.length - 1) {
        lines.push(line.slice(0, breakAt + 1));
        line = line.slice(breakAt + 1);
      } else {
        lines.push(line);
        line = "";
      }
      // A broken word can still fill a line when the preceding space was narrow.
      if (line && measure(line + character, fontSize, role).width > width) {
        lines.push(line);
        line = "";
      }
    }
    line += character;
  }
  if (line) lines.push(line);
  return lines;
};

export const fitCoverText = (
  text: string,
  box: TextBox,
  role: FontRole,
  measure: MeasureText,
): TextLayout => {
  const maximum = role === "title" ? 17.44 : 5.65;
  const minimum = role === "title" ? 6 : 2.5;
  if (!text) return { fontSize: maximum, lines: [] };
  for (
    let size = maximum;
    size >= minimum - 0.001;
    size = Math.max(minimum, size - 0.25)
  ) {
    const lines = wrap(text, box.width, size, role, measure);
    const metrics = lines.map((line) => measure(line, size, role));
    const ascent = Math.max(...metrics.map((metric) => metric.ascent));
    const descent = Math.max(...metrics.map((metric) => metric.descent));
    const step = size * 1.2;
    const height = ascent + descent + (lines.length - 1) * step;
    if (
      metrics.every((metric) => metric.width <= box.width) &&
      height <= box.height
    ) {
      const firstBaseline = box.y + (box.height - height) / 2 + ascent;
      return {
        fontSize: size,
        lines: lines.map((line, index) => ({
          text: line,
          x: box.x + box.width / 2,
          y: firstBaseline + index * step,
        })),
      };
    }
    if (size === minimum) break;
  }
  throw new Error("El texto no cabe en el área de la portada.");
};

export const createCoverScene = (
  configuration: CoverSnapshot,
  measure: MeasureText,
): CoverScene => {
  const composition = compositions.find(
    (option) => option.id === configuration.compositionId,
  )!;
  const modern = "paletteId" in configuration;
  const palette = modern ? getPalette(configuration.paletteId) : null;
  const background =
    palette?.background ??
    coverColors.find(
      (option) => !modern && option.id === configuration.coverColorId,
    )!.value;
  const ink =
    palette?.accent ??
    textTones.find((option) => !modern && option.id === configuration.textTone)!
      .value;
  const spine =
    palette?.accent ??
    spineColors.find(
      (option) => !modern && option.id === configuration.spineColorId,
    )!.value;
  const description = palette
    ? `paleta ${palette.label}`
    : `color ${coverColors.find((option) => !modern && option.id === configuration.coverColorId)!.label}, texto ${textTones.find((option) => !modern && option.id === configuration.textTone)!.label}, lomo ${spineColors.find((option) => !modern && option.id === configuration.spineColorId)!.label}`;
  // The artwork and typography follow the same safe areas in every renderer.
  const titleBox =
    configuration.compositionId === "dunes"
      ? { x: 22, y: 56, width: 104, height: 48 }
      : { x: 25, y: 72, width: 98, height: 45 };
  const subtitleBox =
    configuration.compositionId === "dunes"
      ? { x: 24, y: 113, width: 100, height: 16 }
      : { x: 32, y: 126, width: 84, height: 28 };
  return {
    width: 148,
    height: 210,
    background,
    ink,
    spine,
    separator: palette?.accent ?? "#AC6044",
    motifAsset: modern
      ? paletteAsset(
          "motifs",
          configuration.compositionId,
          configuration.paletteId,
        )
      : `/assets/motifs/${configuration.compositionId}.svg`,
    motif: configuration.compositionId,
    description: `Portada ${composition.label}, ${description}. ${configuration.title}. ${configuration.subtitle}`,
    title: fitCoverText(configuration.title, titleBox, "title", measure),
    subtitle: fitCoverText(
      configuration.subtitle,
      subtitleBox,
      "subtitle",
      measure,
    ),
    contrast: contrastRatio(ink, background),
  };
};

// Used only for the initial, non-editable server render while real fonts load.
export const estimateText: MeasureText = (text, size) => ({
  width: Array.from(text).length * size * 0.47,
  ascent: size * 0.75,
  descent: size * 0.2,
});
