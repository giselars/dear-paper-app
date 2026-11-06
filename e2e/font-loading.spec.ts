import { expect, test } from "@playwright/test";
import { dismissProjectIntroduction } from "./helpers";
import { createDesignLink } from "../src/features/customizer/domain/design-links";
import { initialCover } from "../src/features/customizer/domain/initial-cover";

test("initializes editor and shared design without installed system fallback fonts", async ({
  page,
  baseURL,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let replacedFallbacks = 0;
  await page.route("**/_next/static/**/*.css", async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      /src:\s*local\([^)]*\)/g,
      () => {
        replacedFallbacks += 1;
        return 'src:local("Unavailable Dear Paper System Font")';
      },
    );
    await route.fulfill({ response, body });
  });
  await page.goto("/");
  await dismissProjectIntroduction(page);
  expect(replacedFallbacks).toBeGreaterThan(0);
  await expect(page.getByRole("button", { name: "Restablecer" })).toBeEnabled();
  await page
    .getByLabel("Título", { exact: true })
    .fill("Árboles y próximas ideas");
  await expect(page.locator("main figure svg desc")).toContainText(
    "Árboles y próximas ideas",
  );
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "No se pudo cargar la tipografía" }),
  ).toHaveCount(0);

  await page.goto(
    createDesignLink(
      { ...initialCover, title: "Una portada compartida" },
      baseURL!,
    ),
  );
  await expect(
    page.getByRole("heading", { name: "Vista previa de la portada" }),
  ).toBeVisible();
  await expect(page.locator("main figure svg desc")).toContainText(
    "Una portada compartida",
  );
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
