import { getPalette } from "./palettes";
import type { SharedDesign } from "./design-links";
import { initialCover } from "./initial-cover";
import {
  type CoverConfiguration,
  validateConfiguration,
} from "./configuration";

export type CustomizerState = {
  configuration: CoverConfiguration;
  resetRevision: number;
  initialized: boolean;
  linkWarning: string | null;
  colorNotice: string | null;
};
export type ConfigurationChange = {
  [Field in keyof CoverConfiguration]: {
    field: Field;
    value: CoverConfiguration[Field];
  };
}[keyof CoverConfiguration];
export type CustomizerAction =
  | ({ type: "change" } & ConfigurationChange)
  | { type: "reset" }
  | { type: "initialize"; design: SharedDesign }
  | { type: "link-warning"; message: string };
export const initialCustomizerState: CustomizerState = {
  configuration: { ...initialCover },
  resetRevision: 0,
  initialized: false,
  linkWarning: null,
  colorNotice: null,
};
export const customizerReducer = (
  state: CustomizerState,
  action: CustomizerAction,
): CustomizerState => {
  if (action.type === "initialize") {
    if (state.initialized) return state;
    const incoming =
      action.design.status === "valid"
        ? action.design.configuration
        : { ...initialCover };
    const legacy =
      !("paletteId" in incoming) || incoming.paletteId === "linen-terracotta";
    const configuration: CoverConfiguration = legacy
      ? {
          compositionId: incoming.compositionId,
          typographyId: incoming.typographyId,
          title: incoming.title,
          subtitle: incoming.subtitle,
          paletteId: initialCover.paletteId,
        }
      : incoming;
    return {
      ...state,
      initialized: true,
      colorNotice: legacy
        ? `Hemos adaptado este diseño a la paleta ${getPalette(initialCover.paletteId).label}. Tus textos se conservan.`
        : null,
      configuration,
      resetRevision: state.resetRevision + 1,
      linkWarning:
        action.design.status === "invalid"
          ? "Este enlace no es válido. Hemos abierto el diseño inicial."
          : null,
    };
  }
  if (action.type === "link-warning")
    return { ...state, linkWarning: action.message };
  if (!state.initialized) return state;
  if (action.type === "reset")
    return {
      ...state,
      linkWarning: null,
      colorNotice: null,
      configuration: { ...initialCover },
      resetRevision: state.resetRevision + 1,
    };
  const candidate = {
    ...state.configuration,
    [action.field]: action.value,
  };
  const result = validateConfiguration(candidate);
  if (!result.valid || state.configuration[action.field] === action.value)
    return state;
  return {
    ...state,
    configuration: result.configuration,
    colorNotice: null,
  };
};
