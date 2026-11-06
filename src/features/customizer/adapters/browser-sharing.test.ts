// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { copyDesignLink, removeDesignParameter } from "./browser-sharing";
afterEach(() => vi.restoreAllMocks());
it("removes only design and preserves router state, other parameters and hash", () => {
  history.replaceState({ marker: 1 }, "", "/?design=old&utm=keep#preview");
  expect(removeDesignParameter()).toBe(true);
  expect(location.search).toBe("?utm=keep");
  expect(location.hash).toBe("#preview");
  expect(history.state).toEqual({ marker: 1 });
});
it("returns a recoverable history failure", () => {
  history.replaceState(null, "", "/?design=old");
  vi.spyOn(history, "replaceState").mockImplementation(() => {
    throw new Error("Denied");
  });
  expect(removeDesignParameter()).toBe(false);
});
it("rejects missing clipboard capability instead of reporting success", async () => {
  vi.stubGlobal("navigator", {});
  try {
    await expect(copyDesignLink("https://dear.test")).rejects.toThrow(
      "Clipboard unavailable",
    );
  } finally {
    vi.unstubAllGlobals();
  }
});
