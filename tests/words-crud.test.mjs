import test from "node:test";
import assert from "node:assert/strict";

const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3000";

test("word API supports create, read, update and delete", async () => {
  const phonemeResponse = await fetch(`${baseUrl}/api/phonemes`);
  const phonemeBody = await phonemeResponse.json();

  assert.equal(phonemeResponse.status, 200);
  assert.ok(Array.isArray(phonemeBody.data));
  assert.ok(
    phonemeBody.data.length >= 2,
    "The database must contain at least two seeded phonemes",
  );

  const phonemeIds = phonemeBody.data.slice(0, 2).map((phoneme) => phoneme.id);
  const uniqueEnglish = `automated-${Date.now()}`;
  let createdWordId;

  try {
    const createResponse = await fetch(`${baseUrl}/api/words`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        english: uniqueEnglish,
        phonetic: "/test/",
        hint: "Created by the automated CRUD test",
        phonemeIds,
      }),
    });

    const createBody = await createResponse.json();

    assert.equal(createResponse.status, 201);
    assert.equal(createBody.data.english, uniqueEnglish);
    assert.equal(createBody.data.phonemes.length, 2);

    createdWordId = createBody.data.id;

    const readResponse = await fetch(`${baseUrl}/api/words/${createdWordId}`);
    const readBody = await readResponse.json();

    assert.equal(readResponse.status, 200);
    assert.equal(readBody.data.id, createdWordId);
    assert.equal(readBody.data.english, uniqueEnglish);

    const updateResponse = await fetch(
      `${baseUrl}/api/words/${createdWordId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hint: "Updated by the automated CRUD test",
        }),
      },
    );

    const updateBody = await updateResponse.json();

    assert.equal(updateResponse.status, 200);
    assert.equal(updateBody.data.hint, "Updated by the automated CRUD test");

    const deleteResponse = await fetch(
      `${baseUrl}/api/words/${createdWordId}`,
      {
        method: "DELETE",
      },
    );
    const deleteBody = await deleteResponse.json();

    assert.equal(deleteResponse.status, 200);
    assert.equal(deleteBody.message, "Word deleted successfully");

    const deletedWordId = createdWordId;
    createdWordId = undefined;

    const missingResponse = await fetch(
      `${baseUrl}/api/words/${deletedWordId}`,
    );
    const missingBody = await missingResponse.json();

    assert.equal(missingResponse.status, 404);
    assert.equal(missingBody.error, "Word not found");
  } finally {
    if (createdWordId) {
      await fetch(`${baseUrl}/api/words/${createdWordId}`, {
        method: "DELETE",
      });
    }
  }
});

test("word API rejects missing required data", async () => {
  const response = await fetch(`${baseUrl}/api/words`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.ok(Array.isArray(body.errors));
  assert.ok(body.errors.includes("english is required"));
  assert.ok(body.errors.includes("phonetic is required"));
});
