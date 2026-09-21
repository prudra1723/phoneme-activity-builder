import { expect, test } from "@playwright/test";

test.describe("Phoneme Activity Builder smoke tests", () => {
  test("health endpoint reports a connected database", async ({ request }) => {
    const response = await request.get("/health");

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.status).toBe("ok");
    expect(body.database).toBe("connected");
  });

  test("Manage Words page loads database content", async ({ page }) => {
    await page.goto("/manage");

    await expect(
      page.getByRole("heading", { name: "Add a new word" }),
    ).toBeVisible();

    await expect(page.getByLabel("English spelling")).toBeVisible();
    await expect(page.getByLabel("Phonetic transcription")).toBeVisible();
    await expect(page.getByLabel("Phoneme to add")).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Save new word" }),
    ).toBeVisible();
  });
});
