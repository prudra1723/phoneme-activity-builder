import { expect, test } from "@playwright/test";

type StoredWord = {
  id: string;
  english: string;
};

test("teacher can create, update and delete a word", async ({
  page,
  request,
}) => {
  const uniqueWord = `e2e-word-${Date.now()}`;
  const originalHint = "Created automatically by Playwright";
  const updatedHint = "Updated automatically by Playwright";

  try {
    await page.goto("/manage");

    await expect(
      page.getByRole("heading", { name: "Add a new word" }),
    ).toBeVisible();

    await page.getByLabel("English spelling").fill(uniqueWord);
    await page.getByLabel("Phonetic transcription").fill("/p/");
    await page.getByLabel("Teaching hint (optional)").fill(originalHint);

    await page.getByRole("button", { name: "Add phoneme" }).click();

    await expect(page.getByText("Sequence:").locator("..")).not.toContainText(
      "No phonemes selected",
    );

    await page.getByRole("button", { name: "Save new word" }).click();

    await expect(page.getByRole("status")).toContainText(
      `Created “${uniqueWord}” successfully.`,
    );

    const createdWord = page
      .locator(".managed-word-list > li")
      .filter({ hasText: uniqueWord });

    await expect(createdWord).toHaveCount(1);
    await expect(createdWord).toContainText(originalHint);

    await createdWord.getByRole("button", { name: "Edit" }).click();

    await expect(
      page.getByRole("heading", { name: "Edit word" }),
    ).toBeVisible();

    await expect(page.getByLabel("English spelling")).toHaveValue(uniqueWord);

    await page.getByLabel("Teaching hint (optional)").fill(updatedHint);

    await page.getByRole("button", { name: "Update word" }).click();

    await expect(page.getByRole("status")).toContainText(
      `Updated “${uniqueWord}” successfully.`,
    );

    const updatedWord = page
      .locator(".managed-word-list > li")
      .filter({ hasText: uniqueWord });

    await expect(updatedWord).toHaveCount(1);
    await expect(updatedWord).toContainText(updatedHint);

    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      expect(dialog.message()).toContain(uniqueWord);
      await dialog.accept();
    });

    await updatedWord.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByRole("status")).toContainText(
      `Deleted “${uniqueWord}” successfully.`,
    );

    await expect(
      page.locator(".managed-word-list > li").filter({ hasText: uniqueWord }),
    ).toHaveCount(0);
  } finally {
    // Safety cleanup if the browser test fails before reaching Delete.
    const wordsResponse = await request.get("/api/words");

    if (wordsResponse.ok()) {
      const result = (await wordsResponse.json()) as {
        data?: StoredWord[];
      };

      const remainingTestWord = result.data?.find(
        (word) => word.english === uniqueWord,
      );

      if (remainingTestWord) {
        await request.delete(`/api/words/${remainingTestWord.id}`);
      }
    }
  }
});
