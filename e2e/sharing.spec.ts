import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { dismissProjectIntroduction } from "./helpers";
import { initialCover } from "../src/features/customizer/domain/initial-cover";
import { createDesignLink } from "../src/features/customizer/domain/design-links";

test("previews a snapshot, preserves drafts on return, and opens a read-only recipient", async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto("/");
  await dismissProjectIntroduction(page);
  await page
    .getByLabel("Título", { exact: true })
    .fill("Árboles & posibilidades");
  await page.getByLabel("Subtítulo", { exact: true }).fill("");
  await page.getByRole("radio", { name: "Marco", exact: true }).check();
  await page.getByRole("radio", { name: "Arena y Nogal", exact: true }).check();
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (url: string) => {
          document.documentElement.dataset.sharedUrl = url;
        },
      },
    });
  });
  await page.getByRole("button", { name: "Compartir diseño" }).click();
  await expect(
    page.getByRole("heading", { name: "Tu diseño, listo para compartir." }),
  ).toBeFocused();
  await expect(page.getByLabel("Título", { exact: true })).not.toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.dataset.sharedUrl),
  ).toBeUndefined();
  await expect(page.locator("main:visible figure svg desc")).toContainText(
    "Árboles & posibilidades",
  );
  await page.getByRole("button", { name: "Copiar enlace" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Enlace copiado." }),
  ).toBeVisible();
  const url = await page.evaluate(
    () => document.documentElement.dataset.sharedUrl!,
  );
  expect(JSON.parse(new URL(url).searchParams.get("design")!).version).toBe(3);
  await expect(
    page
      .locator("main:visible figure svg")
      .locator("..")
      .locator("[aria-hidden=true]"),
  ).toHaveCSS("background-color", "rgb(96, 71, 53)");
  expect(new URL(url).origin).toBe(new URL(baseURL!).origin);
  expect(new URL(url).pathname).toBe("/shared");
  await page.getByRole("button", { name: "Volver al editor" }).click();
  await expect(
    page.getByRole("button", { name: "Compartir diseño" }),
  ).toBeFocused();
  await expect(page.getByLabel("Título", { exact: true })).toHaveValue(
    "Árboles & posibilidades",
  );
  await expect(
    page.getByRole("radio", { name: "Marco", exact: true }),
  ).toBeChecked();
  await page.getByLabel("Título", { exact: true }).fill("Otra versión");
  const recipient = await browser.newContext();
  try {
    const received = await recipient.newPage();
    await received.goto(url);
    await expect(
      received.getByRole("heading", { name: "Vista previa de la portada" }),
    ).toBeVisible();
    await expect(received.getByRole("dialog")).not.toBeVisible();
    await expect(received.getByRole("textbox")).toHaveCount(0);
    await expect(received.getByRole("radio")).toHaveCount(0);
    await expect(
      received.getByRole("button", { name: /Restablecer|Compartir|Copiar/ }),
    ).toHaveCount(0);
    await expect(received.locator("main figure svg desc")).toContainText(
      "Árboles & posibilidades",
    );
    await expect(received.locator("main figure svg desc")).toContainText(
      "Arena y Nogal",
    );
    await expect(
      received
        .locator("main figure svg")
        .locator("..")
        .locator("[aria-hidden=true]"),
    ).toHaveCSS("background-color", "rgb(96, 71, 53)");
    await received.reload();
    await expect(received.locator("main figure svg desc")).toContainText(
      "Árboles & posibilidades",
    );
    await received
      .getByRole("button", { name: "El proyecto", exact: true })
      .click();
    await received.getByRole("button", { name: "Volver al diseño" }).click();
    await expect(
      received.getByRole("button", { name: "El proyecto", exact: true }),
    ).toBeFocused();
    expect(await received.evaluate(() => localStorage.length)).toBe(0);
  } finally {
    await recipient.close();
  }
});

test("denied clipboard offers a focused manual link for the current design", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await dismissProjectIntroduction(page);
  await expect(
    page.getByRole("button", { name: "Compartir diseño" }),
  ).toBeEnabled();
  await page.getByLabel("Título", { exact: true }).fill("Mi enlace manual");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Denied");
        },
      },
    });
  });
  await page.getByRole("button", { name: "Compartir diseño" }).click();
  await page.getByRole("button", { name: "Copiar enlace" }).click();
  const manual = page.getByLabel("Enlace de tu diseño");
  await expect(manual).toBeFocused();
  expect(
    await manual.evaluate(
      (input: HTMLInputElement) =>
        input.selectionStart === 0 && input.selectionEnd === input.value.length,
    ),
  ).toBe(true);
  const url = await manual.inputValue();
  expect(
    JSON.parse(new URL(url).searchParams.get("design")!).configuration.title,
  ).toBe("Mi enlace manual");
  await expect(
    page.getByRole("status").filter({ hasText: "Enlace copiado." }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Descargar", exact: false }),
  ).toHaveCount(0);
});

test("invalid links fall back entirely without reading or writing storage", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: () => {
        throw new Error("Storage must not be used");
      },
    });
  });
  await page.goto("/?design=%7Bbroken");
  await dismissProjectIntroduction(page);
  await expect(page.getByRole("button", { name: "Restablecer" })).toBeEnabled();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Este enlace no es válido",
  );
  await expect(page.getByLabel("Título", { exact: true })).toHaveValue(
    initialCover.title,
  );
  await page.getByLabel("Título", { exact: true }).fill("Sigo editando");
  await expect(page.locator("main figure svg desc")).toContainText(
    "Sigo editando",
  );
});

test("history failure warns without losing the reset design", async ({
  page,
  baseURL,
}) => {
  await page.goto(
    "/" +
      new URL(
        createDesignLink({ ...initialCover, title: "Compartido" }, baseURL!),
      ).search,
  );
  await dismissProjectIntroduction(page);
  await expect(page.getByRole("button", { name: "Restablecer" })).toBeEnabled();
  await page.evaluate(() => {
    history.replaceState = () => {
      throw new Error("Denied");
    };
  });
  await page.getByRole("button", { name: "Restablecer" }).click();
  await expect(page.getByLabel("Título", { exact: true })).toHaveValue(
    initialCover.title,
  );
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "no se pudo actualizar la dirección",
  );
});

test("shared view rejects missing, invalid and duplicate designs without showing a substitute cover", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get: () => {
        throw new Error("Storage must not be used");
      },
    });
  });
  for (const path of [
    "/shared",
    "/shared?design=%7Bbroken",
    "/shared?design=&design=",
  ]) {
    await page.goto(path);
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "El enlace no es válido",
    );
    await expect(page.getByRole("img", { name: /Tu portada/ })).toHaveCount(0);
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "Ir al editor" }),
    ).toHaveAttribute("href", "/");
  }
});

test("returning from preview preserves invalid drafts and a new preview shares the newest valid cover", async ({
  page,
}) => {
  await page.goto("/");
  await dismissProjectIntroduction(page);
  await page.getByLabel("Título", { exact: true }).fill("Versión uno");
  await page.getByLabel("Subtítulo", { exact: true }).fill("W".repeat(81));
  await page.getByRole("button", { name: "Compartir diseño" }).click();
  await expect(page.locator("main:visible figure svg desc")).toContainText(
    "Notas para lo que viene",
  );
  await page.getByRole("button", { name: "Volver al editor" }).click();
  await expect(page.getByLabel("Subtítulo", { exact: true })).toHaveValue(
    "W".repeat(81),
  );
  await expect(page.getByLabel("Subtítulo", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page.getByLabel("Título", { exact: true }).fill("Versión dos");
  await page.getByRole("button", { name: "Compartir diseño" }).click();
  await expect(page.locator("main:visible figure svg desc")).toContainText(
    "Versión dos",
  );
});

test("preview and received design follow responsive layouts with accessible keyboard actions", async ({
  page,
  baseURL,
}) => {
  for (const width of [320, 390, 720, 834, 1440]) {
    await page.setViewportSize({ width, height: width === 1440 ? 960 : 844 });
    await page.goto("/");
    await dismissProjectIntroduction(page);
    const share = page.getByRole("button", { name: "Compartir diseño" });
    await expect(share).toBeEnabled();
    await share.focus();
    await expect(share).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", { name: "Tu diseño, listo para compartir." }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "Copiar enlace" }),
    ).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: `/tmp/dear-paper-share-${width}.png`,
      fullPage: true,
    });
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "Volver al editor" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(share).toBeFocused();
    await page.goto(createDesignLink(initialCover, baseURL!));
    await expect(
      page.getByRole("heading", { name: "Vista previa de la portada" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: `/tmp/dear-paper-received-${width}.png`,
      fullPage: true,
    });
  }
});

test("copies a real read-only link to the browser clipboard", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await dismissProjectIntroduction(page);
  await page.getByRole("button", { name: "Compartir diseño" }).click();
  await page.getByRole("button", { name: "Copiar enlace" }).click();
  await expect(page.getByRole("status")).toContainText("Enlace copiado.");
  const url = new URL(
    await page.evaluate(() => navigator.clipboard.readText()),
  );
  expect(url.pathname).toBe("/shared");
  expect(JSON.parse(url.searchParams.get("design")!).configuration).toEqual(
    initialCover,
  );
});

for (const version of [1, 2]) {
  test(`v${version} links retain received colors and adapt only in the editor`, async ({
    page,
  }) => {
    const search = `?design=${encodeURIComponent(
      JSON.stringify({
        version,
        configuration: {
          compositionId: "dunes",
          coverColorId: version === 1 ? "sage" : "rose",
          typographyId: "literary",
          textTone: version === 1 ? "light" : "dark",
          title: "Diseño antiguo",
          subtitle: "Sin cambios",
          ...(version === 2 ? { spineColorId: "olive" } : {}),
        },
      }),
    )}`;
    await page.goto(`/shared${search}`);
    const artwork = page.locator("main figure svg");
    await expect(artwork.locator("rect")).toHaveAttribute(
      "fill",
      version === 1 ? "#A8B29A" : "#D7B6A6",
    );
    await expect(artwork).toHaveCSS(
      "color",
      version === 1 ? "rgb(245, 240, 230)" : "rgb(37, 37, 32)",
    );
    await expect(artwork.locator("image")).toHaveAttribute(
      "href",
      "/assets/motifs/dunes.svg",
    );
    await expect(artwork.locator("..").locator("[aria-hidden=true]")).toHaveCSS(
      "background-color",
      version === 1 ? "rgb(172, 96, 68)" : "rgb(119, 120, 96)",
    );
    await page.goto(`/${search}`);
    await dismissProjectIntroduction(page);
    await expect(
      page.getByRole("status").filter({ hasText: "Hemos adaptado" }),
    ).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Terracota y Marfil", exact: true }),
    ).toBeChecked();
    await expect(page.getByLabel("Título", { exact: true })).toHaveValue(
      "Diseño antiguo",
    );
    await expect(artwork.locator("rect")).toHaveAttribute("fill", "#F5F0E6");
    await expect(artwork.locator("image")).toHaveAttribute(
      "href",
      "/assets/motifs/palettes/ivory-terracotta/dunes.svg",
    );
  });
}

test("retired Lino snapshots retain their appearance and migrate when edited", async ({
  page,
}) => {
  const search = `?design=${encodeURIComponent(
    JSON.stringify({
      version: 3,
      configuration: {
        compositionId: "botanical",
        paletteId: "linen-terracotta",
        typographyId: "literary",
        title: "Diseño Lino",
        subtitle: "Original",
      },
    }),
  )}`;
  await page.goto(`/shared${search}`);
  await expect(page.locator("main figure svg rect")).toHaveAttribute(
    "fill",
    "#EFE1CD",
  );
  await expect(page.locator("main figure svg image")).toHaveAttribute(
    "href",
    "/assets/motifs/palettes/linen-terracotta/botanical.svg",
  );
  await page.goto(`/${search}`);
  await dismissProjectIntroduction(page);
  await expect(
    page.getByRole("radio", { name: "Terracota y Marfil", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("radio", { name: "Lino y Terracota", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("status").filter({ hasText: "Hemos adaptado" }),
  ).toContainText("Terracota y Marfil");
  await expect(page.locator("main figure svg rect")).toHaveAttribute(
    "fill",
    "#F5F0E6",
  );
  await expect(page.getByLabel("Título", { exact: true })).toHaveValue(
    "Diseño Lino",
  );
});
