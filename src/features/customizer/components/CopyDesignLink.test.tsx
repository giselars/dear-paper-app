// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyDesignLink } from "./CopyDesignLink";
import { initialCover } from "../domain/initial-cover";
import { copyDesignLink } from "../adapters/browser-sharing";
import { decodeDesignLink } from "../domain/design-links";
vi.mock("../adapters/browser-sharing", () => ({ copyDesignLink: vi.fn() }));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("sharing feedback (SH-04)", () => {
  it("reports copied only after clipboard success, using the captured snapshot", async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    vi.mocked(copyDesignLink).mockImplementation(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    const { rerender } = render(
      <CopyDesignLink configuration={initialCover} ready />,
    );
    await user.click(screen.getByRole("button", { name: "Copiar enlace" }));
    expect(screen.getByRole("status")).not.toHaveTextContent("Enlace copiado.");
    expect(screen.getByRole("button")).toBeDisabled();
    rerender(
      <CopyDesignLink
        configuration={{ ...initialCover, title: "Después" }}
        ready
      />,
    );
    const url = vi.mocked(copyDesignLink).mock.calls[0][0];
    expect(decodeDesignLink(new URL(url).search)).toEqual({
      status: "valid",
      configuration: initialCover,
    });
    await act(async () => resolve());
    expect(screen.getByRole("status")).toHaveTextContent("Enlace copiado.");
    expect(screen.getByRole("button")).toBeEnabled();
  });
  it("exposes and selects a manual link if copying fails, then retries the newest design", async () => {
    const user = userEvent.setup();
    vi.mocked(copyDesignLink)
      .mockRejectedValueOnce(new Error("Denied"))
      .mockResolvedValueOnce(undefined);
    const { rerender } = render(
      <CopyDesignLink configuration={initialCover} ready />,
    );
    await user.click(screen.getByRole("button", { name: "Copiar enlace" }));
    const field = screen.getByLabelText(
      "Enlace de tu diseño",
    ) as HTMLInputElement;
    await waitFor(() => expect(field).toHaveFocus());
    expect(field.selectionStart).toBe(0);
    expect(field.selectionEnd).toBe(field.value.length);
    expect(screen.getByRole("status")).not.toHaveTextContent("Enlace copiado.");
    rerender(
      <CopyDesignLink
        configuration={{ ...initialCover, title: "Nuevo" }}
        ready
      />,
    );
    await user.click(screen.getByRole("button", { name: "Copiar enlace" }));
    expect(
      decodeDesignLink(
        new URL(vi.mocked(copyDesignLink).mock.calls[1][0]).search,
      ),
    ).toEqual({
      status: "valid",
      configuration: { ...initialCover, title: "Nuevo" },
    });
  });
});
