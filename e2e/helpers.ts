import { expect, type Page } from "@playwright/test";

export const dismissProjectIntroduction = async (page: Page) => {
  const dialog = page.getByRole("dialog", { name: "El proyecto", exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Ir al editor" }).click();
  await expect(dialog).not.toBeVisible();
};
