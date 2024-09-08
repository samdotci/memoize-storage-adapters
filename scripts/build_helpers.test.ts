import { assertEquals, assertThrows } from "jsr:@std/assert@1";
import { describe, it } from "jsr:@std/testing/bdd";
import { getGitHubUrlsFromRemote } from "./build_helpers.ts";

describe("getGitHubUrlsFromRemote", () => {
  const testCases = {
    "should handle HTTPS URLs": {
      remoteUrl: "https://github.com/username/repo",
      expected: {
        repositoryUrl: "https://github.com/username/repo",
        bugsUrl: "https://github.com/username/repo/issues",
      },
    },
    "should handle HTTPS URLs with .git suffix": {
      remoteUrl: "https://github.com/username/repo.git",
      expected: {
        repositoryUrl: "https://github.com/username/repo",
        bugsUrl: "https://github.com/username/repo/issues",
      },
    },
    "should handle git+https URLs": {
      remoteUrl: "git+https://github.com/username/repo.git",
      expected: {
        repositoryUrl: "https://github.com/username/repo",
        bugsUrl: "https://github.com/username/repo/issues",
      },
    },
    "should handle SSH URLs": {
      remoteUrl: "git@github.com:username/repo.git",
      expected: {
        repositoryUrl: "https://github.com/username/repo",
        bugsUrl: "https://github.com/username/repo/issues",
      },
    },
    "should be case-insensitive for github.com": {
      remoteUrl: "https://GITHUB.com/username/repo",
      expected: {
        repositoryUrl: "https://github.com/username/repo",
        bugsUrl: "https://github.com/username/repo/issues",
      },
    },
  } as const;

  for (const [name, testCase] of Object.entries(testCases)) {
    it(name, () => {
      const result = getGitHubUrlsFromRemote(testCase.remoteUrl);
      assertEquals(result, testCase.expected);
    });
  }

  it("should throw an error for non-GitHub URLs", () => {
    const remoteUrl = "https://gitlab.com/username/repo";
    assertThrows(
      () => getGitHubUrlsFromRemote(remoteUrl),
      Error,
      "Remote URL is not a GitHub URL",
    );
  });
});
