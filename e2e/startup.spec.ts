import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { dismissProjectIntroduction } from "./helpers";

test("shows the Pencil loading screen until initialization finishes, then opens the editor or a read-only shared design", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const load = document.fonts.load.bind(document.fonts);
    document.fonts.load = async (...args) => {
      const faces = await load(...args);
      await new Promise<void>((resolve) => {
        window.addEventListener("release-test-fonts", () => resolve(), {
          once: true,
        });
      });
      return faces;
    };
  });
  for (const width of [320, 390, 834, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    const loading = page.getByRole("main", {
      name: "Preparación del editor",
    });
    await expect(loading).toBeVisible();
    await expect(page.getByRole("status")).toHaveText("Cargando el editor…");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "El proyecto", exact: true }),
    ).not.toBeVisible();
    await expect(page.getByLabel("Título", { exact: true })).not.toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await loading
        .getByRole("heading", { name: "Dear Paper" })
        .evaluate((heading) => {
          const range = document.createRange();
          range.selectNodeContents(heading);
          return range.getClientRects().length;
        }),
    ).toBe(1);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.evaluate(() => {
      window.dispatchEvent(new Event("release-test-fonts"));
    });
    await expect(loading).not.toBeVisible();
    await dismissProjectIntroduction(page);
    await expect(page.getByLabel("Título", { exact: true })).toBeEnabled();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  }
  await page.getByLabel("Título", { exact: true }).fill("Mi editor preparado");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => Promise.reject(new Error("Denied")) },
    });
  });
  await page.getByRole("button", { name: "Compartir diseño" }).click();
  await page.getByRole("button", { name: "Copiar enlace" }).click();
  const url = await page.getByLabel("Enlace de tu diseño").inputValue();
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("status")).toHaveText("Cargando el editor…");
  await page.evaluate(() => {
    window.dispatchEvent(new Event("release-test-fonts"));
  });
  await expect(
    page.getByRole("heading", { name: "Vista previa de la portada" }),
  ).toBeVisible();
  await expect(page.locator("main figure svg desc")).toContainText(
    "Mi editor preparado",
  );
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("uses a static loading indicator when reduced motion is requested", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route(/\/_next\/static\/media\/.*\.(woff2?|ttf)/, () => {});
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const loading = page.getByRole("main", { name: "Preparación del editor" });
  await expect(loading).toBeVisible();
  expect(
    await loading.evaluate(
      (element) => element.getAnimations({ subtree: true }).length,
    ),
  ).toBe(0);
});
