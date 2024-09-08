import { dirname, join } from "jsr:@std/path";
import { build, emptyDir } from "jsr:@deno/dnt";
import { getGitHubUrlsFromRemote, getRemoteUrl } from "./build_helpers.ts";
import denoJson from "../deno.json" with { type: "json" };

const repoRoot = dirname(dirname(new URL(import.meta.url).pathname));
const outDir = join(repoRoot, "npm");

if (import.meta.main) {
  const githubUrls = getGitHubUrlsFromRemote(getRemoteUrl(repoRoot));

  await emptyDir(outDir);

  await build({
    entryPoints: ["./mod.ts"],
    outDir,
    importMap: "deno.json",
    esModule: true,
    scriptModule: false, // `p-memoize` does not support CommonJS
    testPattern: "src/**/*.test.ts",
    shims: {
      deno: "dev",
    },
    package: {
      name: denoJson.name,
      version: denoJson.version,
      description:
        "Storage adapters for [`p-memoize`](https://github.com/sindresorhus/p-memoize).",
      license: "MIT",
      repository: {
        type: "git",
        url: `git+${githubUrls.repositoryUrl}.git`,
      },
      bugs: {
        url: githubUrls.bugsUrl,
      },
    },
    postBuild() {
      Deno.copyFileSync("LICENSE", join(outDir, "LICENSE"));
      Deno.copyFileSync("README.md", join(outDir, "README.md"));
    },
    filterDiagnostic(diagnostic) {
      // ignore external dependency diagnostics
      return !(diagnostic.file?.fileName.includes("src/deps/jsr.io/"));
    },
  });
}
