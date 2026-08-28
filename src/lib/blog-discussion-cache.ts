import type { GitHubDiscussionSnapshot } from "@/lib/github-discussions";

export function blogDiscussionCacheKey(
  postDigest: string | number,
  discussion: GitHubDiscussionSnapshot | undefined,
): string {
  return `${postDigest}:${discussion?.updatedAt ?? "no-discussion"}`;
}
