import { execFile as execFileCallback } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import {
  assertValidDiscussionMappings,
  BLOG_DIRECTORY,
  blogPostSlug,
  canonicalBlogPostUrl,
  isNewPublicBlogPost,
  parseBlogFrontmatter,
  setBlogFrontmatterValue,
} from "@/lib/blog-discussion-sync";
import {
  createBlogDiscussion,
  findDiscussionByThreadId,
  getBlogDiscussionCategory,
  managedDiscussionBody,
  updateBlogDiscussion,
} from "@/lib/github-discussions";

const execFile = promisify(execFileCallback);
const DISCUSSION_TITLE_PREFIX = "Comments: ";

type Phase = "prepare" | "provision";
type Scope = "new-publications" | "backfill";

interface Arguments {
  base: string;
  dryRun: boolean;
  head: string;
  phase: Phase;
  scope: Scope;
}

interface BlogPost {
  commentThreadId: string | undefined;
  content: string;
  discussionId: string | undefined;
  draft: boolean;
  path: string;
  slug: string;
  title: string;
}

function parseArguments(argv: string[]): Arguments {
  let base = "HEAD^";
  let dryRun = false;
  let head = "HEAD";
  let phase: Phase = "provision";
  let scope: Scope = "new-publications";
  let apply = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") {
      continue;
    }
    if (argument === "--base") {
      base = valueAfter(argv, index, argument);
      index += 1;
    } else if (argument === "--head") {
      head = valueAfter(argv, index, argument);
      index += 1;
    } else if (argument === "--prepare") {
      phase = "prepare";
    } else if (argument === "--provision") {
      phase = "provision";
    } else if (argument === "--backfill") {
      scope = "backfill";
    } else if (argument === "--apply") {
      apply = true;
    } else if (argument === "--dry-run") {
      dryRun = true;
    } else {
      throw new Error(`Unsupported argument: ${argument}`);
    }
  }

  if (scope === "backfill" && !apply) dryRun = true;
  return { base, dryRun, head, phase, scope };
}

function valueAfter(argv: string[], index: number, option: string): string {
  const value = argv[index + 1];
  if (!value) throw new Error(`${option} requires a value.`);
  return value;
}

async function readBlogPost(path: string): Promise<BlogPost> {
  const content = await readFile(path, "utf8");
  const frontmatter = parseBlogFrontmatter(content, path);
  return {
    commentThreadId: frontmatter.commentThreadId,
    content,
    discussionId: frontmatter.discussionId,
    draft: frontmatter.draft,
    path,
    slug: blogPostSlug(path, frontmatter),
    title: frontmatter.title,
  };
}

async function readBlogPostAtRef(
  ref: string,
  path: string,
): Promise<BlogPost | undefined> {
  try {
    const { stdout } = await execFile("git", ["show", `${ref}:${path}`]);
    const content = stdout;
    const frontmatter = parseBlogFrontmatter(content, path);
    return {
      commentThreadId: frontmatter.commentThreadId,
      content,
      discussionId: frontmatter.discussionId,
      draft: frontmatter.draft,
      path,
      slug: blogPostSlug(path, frontmatter),
      title: frontmatter.title,
    };
  } catch {
    return undefined;
  }
}

async function writeMetadata(
  post: BlogPost,
  key: "commentThreadId" | "discussionId",
  value: string,
  dryRun: boolean,
): Promise<BlogPost> {
  const content = setBlogFrontmatterValue(post.content, key, value);
  if (!dryRun) await writeFile(post.path, content);
  return readBlogPostFromContent(post.path, content);
}

function readBlogPostFromContent(path: string, content: string): BlogPost {
  const frontmatter = parseBlogFrontmatter(content, path);
  return {
    commentThreadId: frontmatter.commentThreadId,
    content,
    discussionId: frontmatter.discussionId,
    draft: frontmatter.draft,
    path,
    slug: blogPostSlug(path, frontmatter),
    title: frontmatter.title,
  };
}

function discussionTitle(post: BlogPost): string {
  return `${DISCUSSION_TITLE_PREFIX}${post.title}`;
}

function discussionBody(post: BlogPost): string {
  if (!post.commentThreadId) {
    throw new Error(`${post.path} is missing commentThreadId.`);
  }
  return managedDiscussionBody(
    post.title,
    canonicalBlogPostUrl(post.slug),
    post.commentThreadId,
  );
}

async function changedBlogPaths(
  base: string,
  head: string,
): Promise<Set<string>> {
  const { stdout } = await execFile("git", [
    "diff",
    "--find-renames",
    "--name-only",
    "-z",
    base,
    head,
    "--",
    BLOG_DIRECTORY,
  ]);
  return new Set(stdout.split("\0").filter(Boolean));
}

async function newPublicationPaths(
  base: string,
  head: string,
): Promise<Set<string>> {
  const { stdout } = await execFile("git", [
    "diff",
    "--find-renames",
    "--name-status",
    "-z",
    base,
    head,
    "--",
    BLOG_DIRECTORY,
  ]);
  const values = stdout.split("\0");
  const paths = new Set<string>();

  for (let index = 0; index < values.length - 1;) {
    const status = values[index++];
    if (!status) continue;
    if (status.startsWith("R") || status.startsWith("C")) {
      const previousPath = values[index++];
      const nextPath = values[index++];
      if (!previousPath || !nextPath) continue;
      const before = await readBlogPostAtRef(base, previousPath);
      const after = await readBlogPostAtRef(head, nextPath);
      if (isNewPublicBlogPost(before, after)) paths.add(nextPath);
      continue;
    }

    const path = values[index++];
    if (!path) continue;
    if (status === "A") {
      const after = await readBlogPostAtRef(head, path);
      if (isNewPublicBlogPost(undefined, after)) paths.add(path);
      continue;
    }
    if (status === "M") {
      const [before, after] = await Promise.all([
        readBlogPostAtRef(base, path),
        readBlogPostAtRef(head, path),
      ]);
      if (isNewPublicBlogPost(before, after)) paths.add(path);
    }
  }

  return paths;
}

async function allPublishedPosts(): Promise<BlogPost[]> {
  const { stdout } = await execFile("git", [
    "ls-files",
    "--",
    `${BLOG_DIRECTORY}/**/*.md`,
    `${BLOG_DIRECTORY}/**/*.mdx`,
  ]);
  const paths = stdout.split("\n").filter(Boolean);
  const posts = await Promise.all(paths.map(readBlogPost));
  return posts.filter((post) => !post.draft);
}

async function prepare(args: Arguments): Promise<void> {
  assertValidDiscussionMappings(await allPublishedPosts());
  const candidates =
    args.scope === "backfill"
      ? new Set((await allPublishedPosts()).map((post) => post.path))
      : await newPublicationPaths(args.base, args.head);
  for (const path of candidates) {
    const post = await readBlogPost(path);
    if (post.draft || post.commentThreadId || post.discussionId) continue;
    await writeMetadata(post, "commentThreadId", randomUUID(), args.dryRun);
    console.log(
      `${args.dryRun ? "Would prepare" : "Prepared"} comment thread for ${path}.`,
    );
  }
}

async function provision(args: Arguments): Promise<void> {
  const [posts, changedPaths] = await Promise.all([
    allPublishedPosts(),
    changedBlogPaths(args.base, args.head),
  ]);
  assertValidDiscussionMappings(posts);

  const managedPosts = posts.filter((post) => post.commentThreadId);
  if (managedPosts.length === 0) return;

  const token = process.env.GITHUB_TOKEN;
  if (!token)
    throw new Error(
      "GITHUB_TOKEN is required to synchronize blog Discussions.",
    );

  const apiOptions = { token };
  const category = await getBlogDiscussionCategory(apiOptions);

  for (const post of managedPosts) {
    if (!post.commentThreadId) continue;
    const expectedBody = discussionBody(post);
    const expectedTitle = discussionTitle(post);
    const existing = await findDiscussionByThreadId(
      post.commentThreadId,
      category.id,
      apiOptions,
    );

    if (!post.discussionId) {
      const discussion =
        existing ??
        (args.dryRun
          ? undefined
          : await createBlogDiscussion(
              {
                body: expectedBody,
                categoryId: category.id,
                repositoryId: category.repositoryId,
                title: expectedTitle,
              },
              apiOptions,
            ));
      if (!discussion) {
        console.log(`Would create Discussion for ${post.path}.`);
        continue;
      }
      await writeMetadata(post, "discussionId", discussion.id, args.dryRun);
      console.log(`Linked ${post.path} to GitHub Discussion ${discussion.id}.`);
      continue;
    }

    if (!existing) {
      throw new Error(
        `Discussion for ${post.path} with commentThreadId ${post.commentThreadId} was not found in Blog comments.`,
      );
    }
    if (existing.id !== post.discussionId) {
      throw new Error(
        `${post.path} stores discussionId ${post.discussionId}, but its thread marker belongs to ${existing.id}.`,
      );
    }
    if (
      changedPaths.has(post.path) &&
      (existing.title !== expectedTitle || existing.body !== expectedBody)
    ) {
      if (args.dryRun) {
        console.log(`Would update Discussion metadata for ${post.path}.`);
      } else {
        await updateBlogDiscussion(
          {
            body: expectedBody,
            discussionId: existing.id,
            title: expectedTitle,
          },
          apiOptions,
        );
        console.log(`Updated Discussion metadata for ${post.path}.`);
      }
    }
  }
}

async function main(): Promise<void> {
  const args = parseArguments(process.argv.slice(2));
  if (args.phase === "prepare") {
    await prepare(args);
  } else {
    await provision(args);
  }
}

await main();
