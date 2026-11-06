import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { dismissProjectIntroduction } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await dismissProjectIntroduction(page);
  await expect(page.getByRole("button", { name: "Restablecer" })).toBeEnabled();
});

test("customize, preserve invalid draft and reset without reloading", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  const title = page.getByLabel("Título", { exact: true });
  const subtitle = page.getByLabel("Subtítulo", { exact: true });
  const artwork = page.locator("main figure svg");
  await title.fill("Mi jardín de ideas");
  await subtitle.fill("Árboles & <posibilidades>");
  await page.getByRole("radio", { name: "Dunas", exact: true }).check();
  await page.getByRole("radio", { name: "Arena y Nogal", exact: true }).check();
  await expect(artwork.locator("desc")).toContainText("Mi jardín de ideas");
  await expect(artwork.locator("image")).toHaveAttribute(
    "href",
    "/assets/motifs/palettes/sand-walnut/dunes.svg",
  );
  await expect(artwork.locator("rect")).toHaveAttribute("fill", "#F3E8D4");
  await expect(page.getByLabel("Color de texto")).toHaveCount(0);
  await expect(artwork.locator("..").locator("[aria-hidden=true]")).toHaveCSS(
    "background-color",
    "rgb(96, 71, 53)",
  );
  await expect(artwork.locator("path")).toHaveAttribute("stroke", "#604735");
  await expect(artwork.locator("script")).toHaveCount(0);
  await title.fill("W".repeat(41));
  await expect(title).toHaveAttribute("aria-invalid", "true");
  await expect(artwork.locator("desc")).toContainText("Mi jardín de ideas");
  const reset = page.getByRole("button", { name: "Restablecer" });
  await reset.click();
  await expect(reset).toBeFocused();
  await expect(title).toHaveValue("Ideas que toman forma");
  await expect(subtitle).toHaveValue("Notas para lo que viene");
  await expect(
    page.getByRole("radio", { name: "Botánica", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("radio", { name: "Terracota y Marfil", exact: true }),
  ).toBeChecked();
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Compartir diseño" }),
  ).toBeEnabled();
  await expect(artwork).toHaveAttribute("viewBox", "0 0 148 210");
});

test("fits maximum unbroken text in every motif using the loaded fonts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.getByLabel("Título", { exact: true }).fill("W".repeat(40));
  await page.getByLabel("Subtítulo", { exact: true }).fill("W".repeat(80));
  for (const name of ["Botánica", "Dunas", "Marco"]) {
    await page.getByRole("radio", { name, exact: true }).check();
    await expect(page.locator("main figure svg desc")).toContainText(
      "W".repeat(80),
    );
    const bounds = await page
      .locator("main figure svg text")
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const box = (node as SVGGraphicsElement).getBBox();
          return {
            text: node.textContent,
            x: box.x,
            y: box.y,
            right: box.x + box.width,
            bottom: box.y + box.height,
          };
        }),
      );
    for (const box of bounds) {
      expect(box.x, `${name}: ${box.text}`).toBeGreaterThanOrEqual(-0.1);
      expect(box.y).toBeGreaterThanOrEqual(-0.1);
      expect(box.right).toBeLessThanOrEqual(148.1);
      expect(box.bottom).toBeLessThanOrEqual(210.1);
    }
    expect(
      await page.locator("main figure svg text tspan").allTextContents(),
    ).toEqual(expect.arrayContaining([expect.stringContaining("W")]));
  }
});

test("keyboard selection and accessible editor at reference widths", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  const botanical = page.getByRole("radio", { name: "Botánica", exact: true });
  await botanical.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("radio", { name: "Dunas", exact: true }),
  ).toBeChecked();
  for (const width of [320, 390, 720, 834, 1440]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `/tmp/dear-paper-contrast-${width}.png`,
      fullPage: true,
    });
    const ratio = await page.locator("main figure svg").evaluate((svg) => {
      const box = svg.getBoundingClientRect();
      return box.width / box.height;
    });
    expect(ratio).toBeCloseTo(148 / 210, 2);
    if ([390, 834, 1440].includes(width)) {
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(result.violations).toEqual([]);
    }
  }
});

test("mobile preview expands, closes with Escape and preserves edits and focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("radio", { name: "Arena y Nogal", exact: true }).check();
  await page
    .locator("#tus-palabras")
    .evaluate((element) => element.scrollIntoView({ block: "start" }));
  await page.getByLabel("Título", { exact: true }).fill("Mi libreta móvil");
  const compact = page.getByRole("complementary", {
    name: "Vista previa de tu portada",
  });
  await expect(compact).toBeVisible();
  await expect(compact.locator("svg desc")).toContainText("Mi libreta móvil");
  const expand = compact.getByRole("button", { name: "Ampliar portada" });
  await expand.click();
  const dialog = page.getByRole("dialog", { name: "Tu portada" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("svg desc")).toContainText("Mi libreta móvil");
  await expect(
    dialog.locator("svg").locator("..").locator("[aria-hidden=true]"),
  ).toHaveCSS("background-color", "rgb(96, 71, 53)");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(expand).toBeFocused();
  await expect(page.getByLabel("Título", { exact: true })).toHaveValue(
    "Mi libreta móvil",
  );
});

test("mobile keyboard viewport reduces preview to a recoverable bar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .locator("#tus-palabras")
    .evaluate((element) => element.scrollIntoView({ block: "start" }));
  await page.getByLabel("Título", { exact: true }).focus();
  const compact = page.getByRole("complementary", {
    name: "Vista previa de tu portada",
  });
  await expect(compact.locator("svg")).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(window.visualViewport, "height", {
      configurable: true,
      value: 500,
    });
    window.visualViewport!.dispatchEvent(new Event("resize"));
  });
  await expect(
    compact.getByRole("button", { name: "Ver portada" }),
  ).toBeVisible();
  await expect(compact.locator("svg")).toHaveCount(0);
  await page.evaluate(() => {
    Reflect.deleteProperty(window.visualViewport!, "height");
    window.visualViewport!.dispatchEvent(new Event("resize"));
  });
  await expect(compact.locator("svg")).toBeVisible();
});

test("missing fonts keep editing disabled and offer a retry", async ({
  browser,
}) => {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    const fontPattern = /\/_next\/static\/media\/.*\.(woff2?|ttf)/;
    await page.route(fontPattern, (route) => route.abort());
    await page.goto("/");
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "No se pudo cargar la tipografía",
    );
    await expect(
      page.getByRole("button", { name: "Restablecer" }),
    ).not.toBeVisible();
    await page.unroute(fontPattern);
    await page.getByRole("button", { name: "Reintentar" }).click();
    await dismissProjectIntroduction(page);
    await expect(
      page.getByRole("button", { name: "Restablecer" }),
    ).toBeEnabled();
  } finally {
    await context.close();
  }
});

test("all palettes coordinate every motif and retain selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  for (const [paletteName, paletteId, background, accent, ink] of [
    ["Marfil y Oliva", "ivory-olive", "#F5F0E6", "rgb(70, 80, 57)", "#465039"],
    ["Arena y Nogal", "sand-walnut", "#F3E8D4", "rgb(96, 71, 53)", "#604735"],
    [
      "Terracota y Marfil",
      "ivory-terracotta",
      "#F5F0E6",
      "rgb(138, 70, 53)",
      "#8A4635",
    ],
  ]) {
    const palette = page.getByRole("radio", { name: paletteName, exact: true });
    await palette.focus();
    await page.keyboard.press("Space");
    for (const [name, motif] of [
      ["Botánica", "botanical"],
      ["Dunas", "dunes"],
      ["Marco", "frame"],
    ]) {
      await page.getByRole("radio", { name, exact: true }).check();
      await expect(palette).toBeChecked();
      const artwork = page.locator("main figure svg");
      await expect(artwork.locator("rect")).toHaveAttribute("fill", background);
      await expect(artwork).toHaveCSS("color", accent);
      await expect(
        artwork.locator("..").locator("[aria-hidden=true]"),
      ).toHaveCSS("background-color", accent);
      await expect(artwork.locator("image")).toHaveAttribute(
        "href",
        `/assets/motifs/palettes/${paletteId}/${motif}.svg`,
      );
      await expect(artwork.locator("path")).toHaveAttribute("stroke", ink);
      const thumbnail = page
        .getByRole("radio", { name, exact: true })
        .locator("..")
        .locator("img");
      await expect(thumbnail).toHaveAttribute(
        "src",
        `/assets/thumbnails/palettes/${paletteId}/${motif}.svg`,
      );
      await expect
        .poll(() =>
          thumbnail.evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
        )
        .toBe(true);
      const response = await page.request.get(
        `/assets/motifs/palettes/${paletteId}/${motif}.svg`,
      );
      expect(response.ok()).toBe(true);
      await page.locator("main figure").screenshot({
        path: `/tmp/dear-paper-palette-${paletteId}-${motif}.png`,
      });
    }
  }
});
