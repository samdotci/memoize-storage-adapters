import type { CacheStorage } from "p-memoize";
import envPaths from "env-paths";
import { join } from "@std/path";
import { configure } from "safe-stable-stringify";

const stringify = configure({
  bigint: true,
  deterministic: false,
});

export class FileCache<K extends string, V> implements CacheStorage<K, V> {
  private readonly cacheDir: string;

  constructor(cacheName: string) {
    this.cacheDir = join(envPaths("memoize-storage-adapters").cache, cacheName);
    Deno.mkdirSync(this.cacheDir, { recursive: true });
  }

  private keyPath(key: K): string {
    return join(this.cacheDir, key);
  }

  getCacheDir(): string {
    return this.cacheDir;
  }

  has(key: K): boolean {
    try {
      return Deno.statSync(this.keyPath(key)).isFile;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return false;
      }
      throw error;
    }
  }

  get(key: K): V | undefined {
    try {
      return JSON.parse(Deno.readTextFileSync(this.keyPath(key)));
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
    }
  }

  set(key: K, value: V): void {
    const stringified = stringify(value);
    if (stringified !== undefined) {
      Deno.writeTextFileSync(this.keyPath(key), stringified);
    }
  }

  delete(key: K): void {
    try {
      Deno.removeSync(this.keyPath(key));
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
    }
  }

  clear(): void {
    Deno.removeSync(this.cacheDir, { recursive: true });
    Deno.mkdirSync(this.cacheDir, { recursive: true });
  }
}
