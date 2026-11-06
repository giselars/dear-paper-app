// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { EditorStartup, useEditorStartup } from "./EditorStartup";

const Session = ({ phase }: { phase: "loading" | "ready" | "error" }) => {
  useEditorStartup(phase);
  return <button>Editar portada</button>;
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("keeps fast loads visible for 800 ms before opening the editor", () => {
  vi.useFakeTimers();
  render(
    <EditorStartup>
      <Session phase="ready" />
    </EditorStartup>,
  );
  act(() => vi.advanceTimersByTime(799));
  expect(screen.getByRole("status")).toHaveTextContent("Cargando el editor…");
  expect(screen.queryByRole("button", { name: "Editar portada" })).toBeNull();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("button", { name: "Editar portada" })).toBeVisible();
});

it("continues waiting after 800 ms when initialization is still pending", () => {
  vi.useFakeTimers();
  const { rerender } = render(
    <EditorStartup>
      <Session phase="loading" />
    </EditorStartup>,
  );
  act(() => vi.advanceTimersByTime(2000));
  expect(screen.getByRole("status")).toBeVisible();
  rerender(
    <EditorStartup>
      <Session phase="ready" />
    </EditorStartup>,
  );
  expect(screen.getByRole("button", { name: "Editar portada" })).toBeVisible();
});

it("shows errors and retry immediately without waiting for the minimum", () => {
  vi.useFakeTimers();
  render(
    <EditorStartup>
      <Session phase="error" />
    </EditorStartup>,
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "No se pudo cargar la tipografía.",
  );
  expect(screen.getByRole("button", { name: "Reintentar" })).toBeVisible();
  act(() => vi.advanceTimersByTime(800));
  expect(screen.queryByRole("button", { name: "Editar portada" })).toBeNull();
});
