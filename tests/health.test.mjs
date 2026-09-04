import test from "node:test";
import assert from "node:assert/strict";

test("GET /health returns 200 and a connected database", async () => {
  const response = await fetch("http://localhost:3000/health");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
  assert.equal(body.database, "connected");
});
