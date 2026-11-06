import { describe, expect, it } from "vitest";
import {
  createDesignLink,
  decodeDesignLink,
  maximumDesignLength,
} from "./design-links";
import { initialCover } from "./initial-cover";
import {
  customizerReducer,
  initialCustomizerState,
} from "./customizer-reducer";

describe("shared design codec (SH-01, SH-03)", () => {
  it.each([
    { ...initialCover },
    { ...initialCover, title: "", subtitle: "" },
    {
      ...initialCover,
      title: "Árboles & <ideas> + 50%",
      subtitle: '  ¿Qué viene? "Más" #🌿  ',
    },
    { ...initialCover, title: "🌿".repeat(40), subtitle: "W".repeat(80) },
  ])("round trips all fields without trimming: $title", (configuration) => {
    const url = new URL(
      createDesignLink(
        configuration,
        "https://dear.test/taller?utm=old#preview",
      ),
    );
    expect(url.pathname).toBe("/shared");
    expect([...url.searchParams.keys()]).toEqual(["design"]);
    expect(url.hash).toBe("");
    expect(decodeDesignLink(url.search)).toEqual({
      status: "valid",
      configuration,
    });
  });
  const encode = (value: unknown) =>
    `?design=${encodeURIComponent(JSON.stringify(value))}`;
  it.each([
    "?design=",
    "?design",
    "?design=%",
    "?design=%E0%A4",
    "?design={bad}",
    "?design=&design=",
    "?design=null",
    "?design=[]",
    encode({ version: 4, configuration: initialCover }),
    encode({
      version: 1,
      configuration: { ...initialCover, compositionId: "other" },
    }),
    encode({
      version: 1,
      configuration: { ...initialCover, title: "W".repeat(41) },
    }),
    encode({ version: 1, configuration: { title: "partial" } }),
    `?design=${"x".repeat(maximumDesignLength + 1)}`,
    `?design=${"%20".repeat(maximumDesignLength * 3 + 1)}`,
  ])("rejects malformed, unsupported or oversized input", (search) => {
    expect(decodeDesignLink(search)).toEqual({ status: "invalid" });
  });
  it("rejects duplicates even when a parameter name is encoded", () => {
    const search = new URL(createDesignLink(initialCover, "https://dear.test"))
      .search;
    expect(decodeDesignLink(`${search}&de%73ign=other`)).toEqual({
      status: "invalid",
    });
  });
  it("ignores unrelated query parameters", () => {
    expect(decodeDesignLink("?utm=demo")).toEqual({ status: "absent" });
    expect(decodeDesignLink("")).toEqual({ status: "absent" });
  });
  it("restores once and cannot overwrite subsequent edits during repeated setup", () => {
    const restored = customizerReducer(initialCustomizerState, {
      type: "initialize",
      design: {
        status: "valid",
        configuration: { ...initialCover, title: "Compartido" },
      },
    });
    const edited = customizerReducer(restored, {
      type: "change",
      field: "title",
      value: "Editado",
    });
    expect(
      customizerReducer(edited, {
        type: "initialize",
        design: { status: "absent" },
      }),
    ).toBe(edited);
    expect(edited.configuration.title).toBe("Editado");
    expect(
      customizerReducer(initialCustomizerState, {
        type: "change",
        field: "title",
        value: "Prematuro",
      }),
    ).toBe(initialCustomizerState);
  });
});
