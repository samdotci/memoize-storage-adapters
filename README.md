# memoize-storage-adapters

Storage adapters for [`p-memoize`](https://github.com/sindresorhus/p-memoize) in Deno.

## Usage

### FileCache

Data is stored in the user's cache directory, under a parent `memoize-storage-adapters` directory.

```ts
import { FileCache } from "@samdotci/memoize-storage-adapters";
import pMemoize from "p-memoize";

const memoizedFn = pMemoize(expensiveFunction, {
  cache: new FileCache("my-app-name"),
  cacheKey: args => `key-${args.join('-')}`,
});

await memoizedFn(1, 2); // Slow (computed)
await memoizedFn(1, 2); // Fast (uses result from disk cache)
```

## License

MIT