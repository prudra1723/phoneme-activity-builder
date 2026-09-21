import { expect, test } from "@playwright/test";

function isSuccessfulGenerationResponse(
  response: import("@playwright/test").Response,
) {
  const request = response.request();

  return (
    response.url().endsWith("/api/events") &&
    request.method() === "POST" &&
    request.postData()?.includes("GENERATION_SUCCESS") === true
  );
}

test.describe("Database activity generation", () => {
  test("loads and downloads a saved Wordle activity", async ({ page }) => {
    await page.goto("/wordle");

    const savedActivity = page.getByLabel("Load a saved database activity");

    await expect(savedActivity).toBeEnabled();
    await savedActivity.selectOption({ label: "Core Phoneme Wordle" });

    await page.getByRole("button", { name: "Load saved activity" }).click();

    await expect(
      page.locator(".builder-panel").getByRole("status"),
    ).toContainText('Loaded "Core Phoneme Wordle" from the database.');

    const downloadPromise = page.waitForEvent("download");
    const trackingPromise = page.waitForResponse(
      isSuccessfulGenerationResponse,
    );

    await page.getByRole("button", { name: "Download playable HTML" }).click();

    const [download, trackingResponse] = await Promise.all([
      downloadPromise,
      trackingPromise,
    ]);

    expect(download.suggestedFilename()).toBe("core-phoneme-wordle.html");

    expect(trackingResponse.status()).toBe(201);
  });

  test("loads and downloads a saved Word Search activity", async ({ page }) => {
    await page.goto("/word-search");

    const savedActivity = page.getByLabel("Load a saved database activity");

    await expect(savedActivity).toBeEnabled();
    await savedActivity.selectOption({
      label: "Core Phoneme Word Search",
    });

    await page.getByRole("button", { name: "Load saved activity" }).click();

    await expect(
      page.locator(".builder-panel").getByRole("status"),
    ).toContainText('Loaded "Core Phoneme Word Search" from the database');

    const downloadPromise = page.waitForEvent("download");
    const trackingPromise = page.waitForResponse(
      isSuccessfulGenerationResponse,
    );

    await page.getByRole("button", { name: "Download playable HTML" }).click();

    const [download, trackingResponse] = await Promise.all([
      downloadPromise,
      trackingPromise,
    ]);

    expect(download.suggestedFilename()).toBe("core-phoneme-word-search.html");

    expect(trackingResponse.status()).toBe(201);
  });
});
