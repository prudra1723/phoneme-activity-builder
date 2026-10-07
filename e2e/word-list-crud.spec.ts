import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

type WordList = {
  id: string;
  name: string;
  description: string | null;
  words: Array<{
    wordId: string;
    position: number;
  }>;
};

test("builder word list supports create, read, update and delete", async ({
  request,
}) => {
  let listId: string | undefined;

  const name = `e2e-list-${randomUUID()}`;

  const wordsResponse = await request.get("/api/words");
  expect(wordsResponse.status()).toBe(200);

  const wordsBody = (await wordsResponse.json()) as {
    data: Array<{ id: string }>;
  };

  expect(wordsBody.data.length).toBeGreaterThanOrEqual(2);

  const wordIds = wordsBody.data.slice(0, 2).map((word) => word.id);

  try {
    await test.step("Create a list containing two stored words", async () => {
      const response = await request.post("/api/word-lists", {
        data: {
          name,
          description: "Created by Playwright",
          wordIds,
        },
      });

      expect(response.status()).toBe(201);

      const { data } = (await response.json()) as { data: WordList };
      listId = data.id;

      expect(listId).toBeTruthy();
      expect(data.name).toBe(name);
      expect(data.words.map((word) => word.wordId)).toEqual(wordIds);
      expect(data.words.map((word) => word.position)).toEqual([0, 1]);
    });

    await test.step("Read the persisted list in a separate request", async () => {
      const response = await request.get(`/api/word-lists/${listId}`);
      expect(response.status()).toBe(200);

      const { data } = (await response.json()) as { data: WordList };

      expect(data.name).toBe(name);
      expect(data.description).toBe("Created by Playwright");
      expect(data.words.map((word) => word.wordId)).toEqual(wordIds);
    });

    await test.step("Update the list and reverse its word order", async () => {
      const reversedIds = [...wordIds].reverse();

      const response = await request.patch(`/api/word-lists/${listId}`, {
        data: {
          name: `${name}-updated`,
          description: "Updated by Playwright",
          wordIds: reversedIds,
        },
      });

      expect(response.status()).toBe(200);

      // Read again to verify the update was persisted.
      const readResponse = await request.get(`/api/word-lists/${listId}`);
      expect(readResponse.status()).toBe(200);

      const { data } = (await readResponse.json()) as { data: WordList };

      expect(data.name).toBe(`${name}-updated`);
      expect(data.description).toBe("Updated by Playwright");
      expect(data.words.map((word) => word.wordId)).toEqual(reversedIds);
      expect(data.words.map((word) => word.position)).toEqual([0, 1]);
    });

    await test.step("Delete the list and confirm it no longer exists", async () => {
      const response = await request.delete(`/api/word-lists/${listId}`);
      expect(response.status()).toBe(200);

      const readResponse = await request.get(`/api/word-lists/${listId}`);
      expect(readResponse.status()).toBe(404);

      listId = undefined;
    });
  } finally {
    // Remove only this test's temporary list if a later assertion failed.
    if (listId) {
      const cleanup = await request.delete(`/api/word-lists/${listId}`);
      expect([200, 404]).toContain(cleanup.status());
    }
  }
});
