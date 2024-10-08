/**
 * @module
 * This module contains a file-based storage adapter for p-memoize.
 * Data is stored in the user's cache directory, under a parent `memoize-storage-adapters` directory.
 */

import type { CacheStorage } from "p-memoize";
import envPaths from "env-paths";
import { join } from "node:path";
import fs from "node:fs";
import { configure } from "safe-stable-stringify";

const stringify = configure({
  bigint: true,
  deterministic: false,
});

/**
 * File-based cache implementation for p-memoize.
 * @template K - Key type, must extend string
 * @template V - Value type
 * @implements {CacheStorage<K, V>}
 */
export class FileCache<K extends string, V> implements CacheStorage<K, V> {
  private readonly cacheDir: string;

  /**
   * @param {string} cacheName - Unique name for the cache directory
   */
  constructor(cacheName: string) {
    this.cacheDir = join(envPaths("memoize-storage-adapters").cache, cacheName);
    fs.mkdirSync(this.cacheDir, { recursive: true });
  }

  /**
   * @param {K} key - Cache key
   * @returns {string} Full path to the cache file
   */
  private keyPath(key: K): string {
    return join(this.cacheDir, key);
  }

  /**
   * @returns {string} Path to the cache directory
   */
  getCacheDir(): string {
    return this.cacheDir;
  }

  /**
   * @param {K} key - Cache key to check
   * @returns {boolean} True if key exists in cache
   */
  has(key: K): boolean {
    try {
      return fs.statSync(this.keyPath(key)).isFile();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return false;
      }
      throw error;
    }
  }

  /**
   * @param {K} key - Cache key to retrieve
   * @returns {V | undefined} Cached value or undefined if not found
   */
  get(key: K): V | undefined {
    try {
      return JSON.parse(fs.readFileSync(this.keyPath(key), "utf8"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * @param {K} key - Cache key to set
   * @param {V} value - Value to cache
   */
  set(key: K, value: V): void {
    const stringified = stringify(value);
    if (stringified !== undefined) {
      fs.writeFileSync(this.keyPath(key), stringified);
    }
  }

  /**
   * @param {K} key - Cache key to delete
   */
  delete(key: K): void {
    try {
      fs.unlinkSync(this.keyPath(key));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return;
      }
      throw error;
    }
  }

  /**
   * Clears entire cache
   */
  clear(): void {
    fs.rmSync(this.cacheDir, { recursive: true });
    fs.mkdirSync(this.cacheDir, { recursive: true });
  }
}
