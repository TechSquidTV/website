import { relative } from "node:path";
import { parse } from "yaml";

export const BLOG_DIRECTORY = "src/content/blog";
const SITE_ORIGIN = "https://techsquidtv.com";

export interface BlogPostFrontmatter {
  commentThreadId: string | undefined;
  discussionId: string | undefined;
  draft: boolean;
  slug: string | undefined;
  title: string;
}

export interface BlogDiscussionMapping {
  commentThreadId: string | undefined;
  discussionId: string | undefined;
  path: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isCommentThreadId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalFrontmatterString(
  value: Record<string, unknown>,
  key: "commentThreadId" | "discussionId",
  path: string,
): string | undefined {
  const field = value[key];
  if (field === undefined) return undefined;
  if (typeof field !== "string" || field.length === 0) {
    throw new Error(`${path} must provide ${key} as a non-empty string.`);
  }
  return field;
}

export function parseBlogFrontmatter(
  content: string,
  path: string,
): BlogPostFrontmatter {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);
  if (!match?.[1]) throw new Error(`${path} is missing YAML frontmatter.`);

  const value = parse(match[1]);
  if (!isRecord(value) || typeof value.title !== "string") {
    throw new Error(`${path} must provide a string title.`);
  }

  const commentThreadId = optionalFrontmatterString(
    value,
    "commentThreadId",
    path,
  );
  if (commentThreadId && !isCommentThreadId(commentThreadId)) {
    throw new Error(`${path} must provide commentThreadId as a UUID.`);
  }

  return {
    commentThreadId,
    discussionId: optionalFrontmatterString(value, "discussionId", path),
    draft: value.draft === true,
    slug: typeof value.slug === "string" ? value.slug : undefined,
    title: value.title,
  };
}

export function setBlogFrontmatterValue(
  content: string,
  key: "commentThreadId" | "discussionId",
  value: string,
): string {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
  if (!match?.[1]) throw new Error("Blog post is missing YAML frontmatter.");

  const lineEnding = content.includes("\r\n") ? "\r\n" : "\n";
  const frontmatter = match[1];
  const replacement = `${key}: ${JSON.stringify(value)}`;
  const expression = new RegExp(`^${key}:.*$`, "m");
  const updatedFrontmatter = expression.test(frontmatter)
    ? frontmatter.replace(expression, replacement)
    : `${frontmatter}${lineEnding}${replacement}`;

  return content.replace(frontmatter, updatedFrontmatter);
}

export function blogPostSlug(
  path: string,
  frontmatter: BlogPostFrontmatter,
): string {
  if (frontmatter.slug) return frontmatter.slug;
  return relative(BLOG_DIRECTORY, path).replace(/\.(?:md|mdx)$/, "");
}

export function canonicalBlogPostUrl(slug: string): string {
  const encodedSlug = slug
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${SITE_ORIGIN}/blog/${encodedSlug}/`;
}

export function isNewPublicBlogPost(
  before: BlogPostFrontmatter | undefined,
  after: BlogPostFrontmatter | undefined,
): boolean {
  return Boolean(after && !after.draft && (!before || before.draft));
}

export function assertValidDiscussionMappings(
  posts: BlogDiscussionMapping[],
): void {
  const threadIds = new Map<string, string>();
  const discussionIds = new Map<string, string>();

  for (const post of posts) {
    if (post.discussionId && !post.commentThreadId) {
      throw new Error(
        `${post.path} stores discussionId ${post.discussionId} without a commentThreadId.`,
      );
    }
    if (post.commentThreadId) {
      const priorPath = threadIds.get(post.commentThreadId);
      if (priorPath) {
        throw new Error(
          `commentThreadId ${post.commentThreadId} is shared by ${priorPath} and ${post.path}.`,
        );
      }
      threadIds.set(post.commentThreadId, post.path);
    }
    if (post.discussionId) {
      const priorPath = discussionIds.get(post.discussionId);
      if (priorPath) {
        throw new Error(
          `discussionId ${post.discussionId} is shared by ${priorPath} and ${post.path}.`,
        );
      }
      discussionIds.set(post.discussionId, post.path);
    }
  }
}
