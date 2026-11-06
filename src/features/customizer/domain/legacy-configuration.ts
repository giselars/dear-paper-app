import { validateCoverText } from "./cover-text";
import { isColorCombinationAllowed } from "./color-rules";
import {
  compositions,
  coverColors,
  spineColors,
  textTones,
} from "./initial-cover";

export type CompositionId = (typeof compositions)[number]["id"];
export type CoverColorId = (typeof coverColors)[number]["id"];
export type SpineColorId = (typeof spineColors)[number]["id"];
export type TextTone = "dark" | "light";
export type LegacyCoverConfiguration = {
  compositionId: CompositionId;
  coverColorId: CoverColorId;
  typographyId: "literary";
  textTone: TextTone;
  spineColorId: SpineColorId;
  title: string;
  subtitle: string;
};
type ValidationResult =
  { valid: true; configuration: LegacyCoverConfiguration } | { valid: false };
export const validateLegacyConfiguration = (
  input: unknown,
  options: { allowLegacyColors?: boolean } = {},
): ValidationResult => {
  if (!input || typeof input !== "object" || Array.isArray(input))
    return { valid: false };
  const value = input as Record<string, unknown>;
  if (
    !compositions.some((option) => option.id === value.compositionId) ||
    !coverColors.some((option) => option.id === value.coverColorId) ||
    value.typographyId !== "literary" ||
    !spineColors.some((option) => option.id === value.spineColorId) ||
    !textTones.some((option) => option.id === value.textTone) ||
    typeof value.title !== "string" ||
    typeof value.subtitle !== "string" ||
    validateCoverText(value.title, "title") ||
    validateCoverText(value.subtitle, "subtitle")
  )
    return { valid: false };
  const configuration: LegacyCoverConfiguration = {
    compositionId: value.compositionId as CompositionId,
    coverColorId: value.coverColorId as CoverColorId,
    typographyId: "literary",
    textTone: value.textTone as TextTone,
    spineColorId: value.spineColorId as SpineColorId,
    title: value.title,
    subtitle: value.subtitle,
  };
  if (!options.allowLegacyColors && !isColorCombinationAllowed(configuration))
    return { valid: false };
  return { valid: true, configuration };
};
