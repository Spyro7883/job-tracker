import { test, expect } from "@playwright/test";

test("login bypass (E2E) → create application → appears in table", async ({ page }) => {
  const uniq = Date.now();
  const company = `E2E Co ${uniq}`;
  const role = `E2E Role ${uniq}`;

  await page.goto("/app/applications/new");

  await page.locator('input[name="roleTitle"]').fill(role);

  await page.locator('select[name="companyId"]').selectOption("__new");
  await page.locator('input[name="newCompanyName"]').fill(company);

  await page.getByRole("button", { name: /create/i }).click();

  await expect(page).toHaveURL(/\/app\/applications\/.+/);
  await expect(page.getByLabel(/role title/i)).toBeVisible();

  await page.goto("/app/applications");

  await expect(page.getByText(company)).toBeVisible();
  await expect(page.getByText(role)).toBeVisible();
});