import { coverColors, textTones } from "./initial-cover";
import type {
  CompositionId,
  CoverColorId,
  LegacyCoverConfiguration,
} from "./legacy-configuration";
import { contrastRatio } from "./color-contrast";

export const minimumTextContrast = 4.5;
// Product visibility criterion for the principal artwork color, not a text standard.
const minimumMotifContrast = 1.5;
const principalMotifColors: Record<CompositionId, string> = {
  botanical: "#767D56",
  dunes: "#B98A62",
  frame: "#898E67",
};
export const availableTextTones = (colorId: CoverColorId) => {
  const background = coverColors.find((color) => color.id === colorId)!.value;
  return textTones.filter(
    (tone) => contrastRatio(tone.value, background) >= minimumTextContrast,
  );
};
export const availableCoverColors = (compositionId: CompositionId) =>
  coverColors.filter(
    (color) =>
      availableTextTones(color.id).length > 0 &&
      contrastRatio(principalMotifColors[compositionId], color.value) >=
        minimumMotifContrast,
  );
export const isColorCombinationAllowed = (
  configuration: LegacyCoverConfiguration,
) =>
  availableCoverColors(configuration.compositionId).some(
    (color) => color.id === configuration.coverColorId,
  ) &&
  availableTextTones(configuration.coverColorId).some(
    (tone) => tone.id === configuration.textTone,
  );
