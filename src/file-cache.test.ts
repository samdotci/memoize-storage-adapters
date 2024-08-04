import { assertEquals, assertThrows } from "jsr:@std/assert@1";
import { afterAll } from "jsr:@std/testing@1/bdd";
import { existsSync } from "jsr:@std/fs@1";
import { FileCache } from "./file-cache.ts";

const TEST_CACHE_NAME = "test-cache";
const TEST_KEY = "test-key";
const TEST_VALUE = { data: "test-value" };

Deno.test("FileCache", async (t) => {
  const cache = new FileCache<string, typeof TEST_VALUE>(TEST_CACHE_NAME);
  const cacheDir = cache.getCacheDir();

  afterAll(() => {
    Deno.removeSync(cacheDir, { recursive: true });
  });

  await t.step("constructor creates cache directory", () => {
    assertEquals(existsSync(cacheDir), true);
  });

  await t.step("set and get", () => {
    cache.set(TEST_KEY, TEST_VALUE);
    assertEquals(cache.get(TEST_KEY), TEST_VALUE);
  });

  await t.step("has", () => {
    assertEquals(cache.has(TEST_KEY), true);
    assertEquals(cache.has("non-existent-key"), false);
  });

  await t.step("delete", () => {
    cache.delete(TEST_KEY);
    assertEquals(cache.has(TEST_KEY), false);
  });

  await t.step("clear", () => {
    cache.set(TEST_KEY, TEST_VALUE);
    cache.clear();
    assertEquals(cache.has(TEST_KEY), false);
    assertEquals(existsSync(cacheDir), true);
  });

  await t.step("handles non-existent keys", () => {
    assertEquals(cache.get("non-existent-key"), undefined);
    assertThrows(() => cache.set("", TEST_VALUE), Error);
  });
});
