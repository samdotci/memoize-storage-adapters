import { parse as parseIni } from "jsr:@std/ini";
import { join } from "jsr:@std/path";

/**
 * Retrieves the remote URL from the git config file in the given repository root.
 * @param {string} repoRoot - The root directory of the git repository.
 * @returns {string} The remote URL of the git repository.
 * @throws {Error} If the git config file is not found or if the remote URL is not properly configured.
 */
export function getRemoteUrl(
  repoRoot: string,
  remoteName: string = "origin",
): string {
  const gitConfigFile = join(repoRoot, ".git", "config");

  let gitConfigText: string;

  try {
    gitConfigText = Deno.readTextFileSync(gitConfigFile);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error(`Git config file not found at ${gitConfigFile}`);
    }
    throw error;
  }

  const gitConfig = parseIni(gitConfigText);

  if (`remote "${remoteName}"` in gitConfig) {
    const remote = gitConfig[`remote "${remoteName}"`];
    if (remote && typeof remote === "object" && "url" in remote) {
      if (typeof remote.url === "string") {
        return remote.url;
      }
      throw new Error("Remote URL is not a string");
    }
    throw new Error(`URL not found in 'remote "${remoteName}"'`);
  }
  throw new Error(`Remote not found in git config`);
}

/**
 * Extracts GitHub-specific URLs from a given remote URL.
 * Supports HTTPS, SSH, and git+https formats.
 * @param {string} remoteUrl - The remote URL of the GitHub repository.
 * @returns {{ repositoryUrl: string; bugsUrl: string }} An object containing the repository URL and issues URL.
 * @throws {Error} If the provided URL is not a valid GitHub URL.
 */
export function getGitHubUrlsFromRemote(remoteUrl: string): {
  repositoryUrl: string;
  bugsUrl: string;
} {
  if (!remoteUrl.toLowerCase().includes("github.com")) {
    throw new Error("Remote URL is not a GitHub URL");
  }

  let repoOwner: string;
  let repoName: string;

  if (remoteUrl.startsWith("git@github.com:")) {
    // Handle SSH URL
    const [, path] = remoteUrl.split(":");
    [repoOwner, repoName] = path.split("/");
  } else {
    // Handle HTTPS URL
    const url = new URL(remoteUrl);
    const pathSegments = url.pathname.split("/");
    repoOwner = pathSegments[1];
    repoName = pathSegments[2];
  }

  // Consistent absence of the .git suffix
  repoName = repoName.replace(/\.git$/, "");

  return {
    repositoryUrl: `https://github.com/${repoOwner}/${repoName}`,
    bugsUrl: `https://github.com/${repoOwner}/${repoName}/issues`,
  };
}
