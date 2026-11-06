import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { dismissProjectIntroduction } from "./helpers";

test("project introduction opens after loading, can reopen and preserves the edited cover", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "El proyecto",
    exact: true,
  });
  const dialog = page.getByRole("dialog", { name: "El proyecto", exact: true });
  await dismissProjectIntroduction(page);
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Restablecer" })).toBeEnabled();
  await page.getByLabel("Título", { exact: true }).fill("Mis próximas ideas");
  const url = page.url();
  await trigger.click();
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole("button", { name: "Cerrar El proyecto" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: "Ir al editor" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.getByLabel("Título", { exact: true })).toHaveValue(
    "Mis próximas ideas",
  );
  expect(page.url()).toBe(url);
  for (const label of ["Cerrar El proyecto", "Ir al editor"]) {
    await trigger.click();
    await dialog.getByRole("button", { name: label }).click();
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(page.getByLabel("Título", { exact: true })).toHaveValue(
      "Mis próximas ideas",
    );
  }
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.overflow))
    .not.toBe("hidden");
});

test("dialog matches responsive widths and keeps actions accessible in short windows", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 834, height: 1000 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
    { width: 667, height: 280 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const dialog = page.getByRole("dialog", {
      name: "El proyecto",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    const box = (await dialog.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    await expect(
      dialog.getByRole("button", { name: "Cerrar El proyecto" }),
    ).toBeInViewport();
    await expect(
      dialog.getByRole("button", { name: "Ir al editor" }),
    ).toBeInViewport();
    await expect(dialog.getByText(/SVG|sin registro/i)).toHaveCount(0);
    if (viewport.height === 280) {
      const region = dialog.getByRole("region", {
        name: "Información de Dear Paper",
      });
      expect(
        await region.evaluate(
          (element) => element.scrollHeight > element.clientHeight,
        ),
      ).toBe(true);
      await region.focus();
      await page.keyboard.press("End");
      await expect(
        dialog.getByRole("button", { name: "Ir al editor" }),
      ).toBeInViewport();
    }
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.keyboard.press("Escape");
  }
});
