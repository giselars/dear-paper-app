import { describe, expect, it } from "vitest";
import { initialCover } from "./initial-cover";
import { validateConfiguration, validateCoverText } from "./configuration";
import {
  customizerReducer,
  initialCustomizerState,
} from "./customizer-reducer";

describe("cover configuration boundaries (CU-01, CU-02, CU-04, CU-05)", () => {
  it("accepts defaults and projects only known fields", () => {
    expect(
      validateConfiguration({ ...initialCover, script: "ignored" }),
    ).toEqual({ valid: true, configuration: initialCover });
  });
  it.each([
    null,
    [],
    {},
    { ...initialCover, compositionId: "unknown" },
    { ...initialCover, paletteId: "#fff" },
    { ...initialCover, typographyId: "lora" },
    { ...initialCover, paletteId: undefined },
    { ...initialCover, title: 12 },
    { ...initialCover, subtitle: "W".repeat(81) },
  ])("rejects invalid external configuration %j", (input) => {
    expect(validateConfiguration(input)).toEqual({ valid: false });
  });
  it("counts supplementary characters as code points and accepts empty/accented text", () => {
    expect(validateCoverText("🌿".repeat(40), "title")).toBeUndefined();
    expect(validateCoverText("🌿".repeat(41), "title")).toBe(
      "Máximo 40 caracteres.",
    );
    expect(validateCoverText("", "subtitle")).toBeUndefined();
    expect(
      validateCoverText("Árbol, ñandú, ¿qué? ¡Sí!", "title"),
    ).toBeUndefined();
  });
  it.each([
    "line\nbreak",
    "line\rbreak",
    "\u0000",
    "\ud800",
    "\udc00",
    "\uffff",
    "\u2028",
  ])("rejects non-single-line/XML text %j", (title) => {
    expect(validateConfiguration({ ...initialCover, title }).valid).toBe(false);
  });
  it("changes only the selected field and refuses invalid edits", () => {
    const changed = customizerReducer(
      { ...initialCustomizerState, initialized: true },
      {
        type: "change",
        field: "compositionId",
        value: "frame",
      },
    );
    expect(changed.configuration).toEqual({
      ...initialCover,
      compositionId: "frame",
    });
    expect(
      customizerReducer(changed, {
        type: "change",
        field: "title",
        value: "W".repeat(41),
      }),
    ).toBe(changed);
  });
  it("resets every field and invalidates transient input drafts", () => {
    const edited = {
      ...initialCustomizerState,
      initialized: true,
      configuration: {
        ...initialCover,
        title: "Otro título",
        paletteId: "sand-walnut" as const,
        compositionId: "dunes" as const,
      },
      resetRevision: 0,
    };
    expect(customizerReducer(edited, { type: "reset" })).toEqual({
      configuration: initialCover,
      resetRevision: 1,
      initialized: true,
      linkWarning: null,
      colorNotice: null,
    });
  });
});
