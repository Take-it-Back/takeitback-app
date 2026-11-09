// node --test tests/*.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { isOlder } from "../lib/version.ts";

test("older versions are caught", () => {
  assert.equal(isOlder("1.0.0", "1.0.1"), true);
  assert.equal(isOlder("1.9", "1.10.0"), true);
  assert.equal(isOlder("0.9.9", "1.0.0"), true);
});
test("same or newer versions pass", () => {
  assert.equal(isOlder("1.0.0", "1.0.0"), false);
  assert.equal(isOlder("1.0", "1.0.0"), false);
  assert.equal(isOlder("2.0.0", "1.9.9"), false);
  assert.equal(isOlder("1.0.0", "0.0.0"), false);
});
test("unreadable input never blocks anyone", () => {
  assert.equal(isOlder("abc", "1.0.0"), false);
  assert.equal(isOlder("1.0.0", ""), false);
});
