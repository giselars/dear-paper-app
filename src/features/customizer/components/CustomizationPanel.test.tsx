// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CustomizationPanel } from "./CustomizationPanel";
import { useCustomizer } from "../hooks/useCustomizer";

afterEach(cleanup);
const Editor = () => {
  const editor = useCustomizer();
  return (
    <>
      <CustomizationPanel {...editor} ready onShare={() => {}} />
      <pre data-testid="configuration">
        {JSON.stringify(editor.configuration)}
      </pre>
    </>
  );
};
const configuration = () =>
  JSON.parse(screen.getByTestId("configuration").textContent!);

describe("customization controls (CU-01–CU-06)", () => {
  it("changes selections while preserving the user's text", async () => {
    const user = userEvent.setup();
    render(<Editor />);
    await user.clear(screen.getByLabelText("Título"));
    await user.type(screen.getByLabelText("Título"), "Mi cuaderno");
    await user.click(screen.getByRole("radio", { name: "Dunas" }));
    await user.click(screen.getByRole("radio", { name: "Arena y Nogal" }));
    expect(configuration()).toMatchObject({
      compositionId: "dunes",
      paletteId: "sand-walnut",
      title: "Mi cuaderno",
    });
    expect(screen.getByRole("radio", { name: "Dunas" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Arena y Nogal" })).toBeChecked();
    expect(screen.queryByLabelText("Color de texto")).not.toBeInTheDocument();
    expect(screen.getAllByRole("option", { name: "Literaria" })).toHaveLength(
      1,
    );
  });
  it("preserves the palette across motifs and restores defaults", async () => {
    const user = userEvent.setup();
    render(<Editor />);
    await user.click(screen.getByRole("radio", { name: "Arena y Nogal" }));
    for (const name of ["Dunas", "Marco", "Botánica"]) {
      await user.click(screen.getByRole("radio", { name }));
      expect(configuration().paletteId).toBe("sand-walnut");
      expect(
        screen.getByRole("radio", { name: "Arena y Nogal" }),
      ).toBeChecked();
    }
    expect(screen.getAllByRole("radio")).toHaveLength(6);
    await user.click(screen.getByRole("button", { name: "Restablecer" }));
    expect(configuration().paletteId).toBe("ivory-terracotta");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
  it("supports keyboard selection of coordinated palettes", async () => {
    const user = userEvent.setup();
    render(<Editor />);
    const options = screen.getAllByRole("radio").slice(3);
    expect(options.map((option) => option.getAttribute("aria-label"))).toEqual([
      "Terracota y Marfil",
      "Marfil y Oliva",
      "Arena y Nogal",
    ]);
    expect(options[0]).toBeChecked();
    options[0].focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Marfil y Oliva" })).toHaveFocus();
    expect(configuration().paletteId).toBe("ivory-olive");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Arena y Nogal" })).toHaveFocus();
    expect(configuration().paletteId).toBe("sand-walnut");
  });
  it("keeps an over-limit draft visible and preserves the last valid cover", async () => {
    const user = userEvent.setup();
    render(<Editor />);
    const field = screen.getByLabelText("Título");
    fireEvent.change(field, { target: { value: "🌿".repeat(40) } });
    expect(configuration().title).toBe("🌿".repeat(40));
    fireEvent.change(field, { target: { value: "🌿".repeat(41) } });
    expect(field).toHaveValue("🌿".repeat(41));
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Máximo 40 caracteres.",
    );
    expect(configuration().title).toBe("🌿".repeat(40));
    await user.clear(field);
    expect(configuration().title).toBe("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("does not commit unfinished IME composition", () => {
    render(<Editor />);
    const field = screen.getByLabelText("Título");
    const original = configuration().title;
    fireEvent.compositionStart(field);
    fireEvent.change(field, { target: { value: "Árbol" } });
    expect(configuration().title).toBe(original);
    fireEvent.compositionEnd(field, { data: "Árbol" });
    expect(configuration().title).toBe("Árbol");
  });
  it("rejects multiline paste before the input can silently strip it", () => {
    render(<Editor />);
    const field = screen.getByLabelText("Título");
    const original = configuration().title;
    const accepted = fireEvent.paste(field, {
      clipboardData: { getData: () => "Dos\nlíneas" },
    });
    expect(accepted).toBe(false);
    expect(configuration().title).toBe(original);
    expect(screen.getByRole("alert")).toHaveTextContent("una sola línea");
  });
  it("resets valid selections and invalid drafts while keeping button focus", async () => {
    const user = userEvent.setup();
    render(<Editor />);
    await user.click(screen.getByRole("radio", { name: "Marco" }));
    fireEvent.change(screen.getByLabelText("Subtítulo"), {
      target: { value: "W".repeat(81) },
    });
    const reset = screen.getByRole("button", { name: "Restablecer" });
    await user.click(reset);
    expect(reset).toHaveFocus();
    expect(configuration().compositionId).toBe("botanical");
    expect(screen.getByLabelText("Subtítulo")).toHaveValue(
      "Notas para lo que viene",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("supports native keyboard radio navigation", async () => {
    const user = userEvent.setup();
    render(<Editor />);
    screen.getByRole("radio", { name: "Botánica" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Dunas" })).toHaveFocus();
    expect(configuration().compositionId).toBe("dunes");
  });
});
