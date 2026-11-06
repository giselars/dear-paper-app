import { compositions } from "./initial-cover";
import { palettes, readablePalettes, type PaletteId } from "./palettes";
import { validateCoverText } from "./cover-text";
export {
  validateCoverText,
  textLimits,
  type TextFieldName,
} from "./cover-text";
export type CompositionId = (typeof compositions)[number]["id"];
export type CoverConfiguration = {
  compositionId: CompositionId;
  paletteId: PaletteId;
  typographyId: "literary";
  title: string;
  subtitle: string;
};
type ValidationResult =
  { valid: true; configuration: CoverConfiguration } | { valid: false };
export const validateConfiguration = (
  input: unknown,
  options: { allowRetiredPalette?: boolean } = {},
): ValidationResult => {
  if (!input || typeof input !== "object" || Array.isArray(input))
    return { valid: false };
  const value = input as Record<string, unknown>;
  if (
    !compositions.some((option) => option.id === value.compositionId) ||
    !(options.allowRetiredPalette ? readablePalettes : palettes).some(
      (option) => option.id === value.paletteId,
    ) ||
    value.typographyId !== "literary" ||
    typeof value.title !== "string" ||
    typeof value.subtitle !== "string" ||
    validateCoverText(value.title, "title") ||
    validateCoverText(value.subtitle, "subtitle")
  )
    return { valid: false };
  return {
    valid: true,
    configuration: {
      compositionId: value.compositionId as CompositionId,
      paletteId: value.paletteId as PaletteId,
      typographyId: "literary",
      title: value.title,
      subtitle: value.subtitle,
    },
  };
};
