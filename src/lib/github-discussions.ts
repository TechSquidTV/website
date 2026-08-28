import { defaultSchema } from "hast-util-sanitize";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const DEFAULT_REPOSITORY = "TechSquidTV/website";
const BLOG_COMMENTS_CATEGORY = "Blog comments";
const COMMENTS_PER_DISCUSSION = 20;
const REPLIES_PER_COMMENT = 100;

export interface GitHubCommentAuthor {
  avatarUrl: string;
  login: string;
  url: string;
}

export interface GitHubDiscussionComment {
  author: GitHubCommentAuthor | undefined;
  bodyHtml: string;
  createdAt: string;
  id: string;
  replies: GitHubDiscussionComment[];
  repliesTruncated: boolean;
  updatedAt: string;
  url: string;
}

export interface GitHubDiscussionSnapshot {
  comments: GitHubDiscussionComment[];
  commentsTruncated: boolean;
  fetchedAt: string;
  id: string;
  updatedAt: string;
  url: string;
}

interface GitHubGraphqlError {
  message: string;
}

interface GitHubGraphqlResponse<TData> {
  data?: TData;
  errors?: GitHubGraphqlError[];
}

interface GraphqlAuthor {
  avatarUrl: string;
  login: string;
  url: string;
}

interface GraphqlComment {
  author: GraphqlAuthor | null;
  bodyHTML: string;
  createdAt: string;
  id: string;
  replies: {
    nodes: GraphqlReply[];
    pageInfo: { hasNextPage: boolean };
  };
  updatedAt: string;
  url: string;
}

interface GraphqlReply {
  author: GraphqlAuthor | null;
  bodyHTML: string;
  createdAt: string;
  id: string;
  updatedAt: string;
  url: string;
}

interface GraphqlDiscussion {
  category: { name: string };
  comments: {
    nodes: GraphqlComment[];
    pageInfo: { hasPreviousPage: boolean };
  };
  id: string;
  repository: { nameWithOwner: string };
  updatedAt: string;
  url: string;
}

type GraphqlDiscussionData = Record<string, GraphqlDiscussion | null>;

interface FindDiscussionResponse {
  repository: {
    discussions: {
      nodes: ManagedDiscussion[];
      pageInfo: { endCursor: string | null; hasNextPage: boolean };
    };
  } | null;
}

interface FetchDiscussionSnapshotsOptions {
  fetchImpl?: typeof fetch;
  repository?: string;
  token?: string | undefined;
}

export interface GitHubDiscussionApiOptions {
  fetchImpl?: typeof fetch;
  repository?: string;
  token: string;
}

export interface BlogDiscussionCategory {
  id: string;
  repositoryId: string;
}

export interface ManagedDiscussion {
  body: string;
  id: string;
  title: string;
  url: string;
}

const commentSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    code: ["className"],
    ol: ["start"],
  },
  tagNames: [
    "blockquote",
    "br",
    "code",
    "del",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "li",
    "ol",
    "p",
    "pre",
    "strong",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "tr",
    "ul",
  ],
};

function discussionField(index: number): string {
  return `discussion${index}`;
}

function makeDiscussionQuery(discussionIds: string[]): string {
  const discussionSelections = discussionIds
    .map(
      (discussionId, index) => `
      ${discussionField(index)}: node(id: ${JSON.stringify(discussionId)}) {
        ... on Discussion {
          id
          url
          updatedAt
          repository { nameWithOwner }
          category { name }
          comments(last: ${COMMENTS_PER_DISCUSSION}) {
            pageInfo { hasPreviousPage }
            nodes {
              id
              url
              bodyHTML
              createdAt
              updatedAt
              author { avatarUrl login url }
              replies(first: ${REPLIES_PER_COMMENT}) {
                pageInfo { hasNextPage }
                nodes {
                  id
                  url
                  bodyHTML
                  createdAt
                  updatedAt
                  author { avatarUrl login url }
                }
              }
            }
          }
        }
      }`,
    )
    .join("\n");

  return `query BlogDiscussionSnapshots { ${discussionSelections} }`;
}

async function sanitizeCommentHtml(bodyHtml: string): Promise<string> {
  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeSanitize, commentSanitizeSchema)
    .use(rehypeStringify)
    .process(bodyHtml);

  return result.toString();
}

async function normalizeComment(
  comment: GraphqlComment,
): Promise<GitHubDiscussionComment> {
  return {
    author: comment.author ?? undefined,
    bodyHtml: await sanitizeCommentHtml(comment.bodyHTML),
    createdAt: comment.createdAt,
    id: comment.id,
    replies: await Promise.all(comment.replies.nodes.map(normalizeReply)),
    repliesTruncated: comment.replies.pageInfo.hasNextPage,
    updatedAt: comment.updatedAt,
    url: comment.url,
  };
}

async function normalizeReply(
  reply: GraphqlReply,
): Promise<GitHubDiscussionComment> {
  return {
    author: reply.author ?? undefined,
    bodyHtml: await sanitizeCommentHtml(reply.bodyHTML),
    createdAt: reply.createdAt,
    id: reply.id,
    replies: [],
    repliesTruncated: false,
    updatedAt: reply.updatedAt,
    url: reply.url,
  };
}

function responseError(response: Response, body: string): Error {
  return new Error(
    `GitHub Discussions request failed with ${response.status} ${response.statusText}: ${body}`,
  );
}

async function graphql<TData>(
  query: string,
  variables: Record<string, string | null>,
  options: GitHubDiscussionApiOptions,
): Promise<TData> {
  const response = await (options.fetchImpl ?? fetch)(GITHUB_GRAPHQL_URL, {
    body: JSON.stringify({ query, variables }),
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${options.token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2026-03-10",
    },
    method: "POST",
  });
  const text = await response.text();

  if (!response.ok) throw responseError(response, text);

  const payload = JSON.parse(text) as GitHubGraphqlResponse<TData>;
  if (payload.errors && payload.errors.length > 0) {
    throw new Error(
      `GitHub Discussions query failed: ${payload.errors.map((error) => error.message).join("; ")}`,
    );
  }
  if (!payload.data)
    throw new Error("GitHub Discussions query returned no data.");
  return payload.data;
}

function repositoryOwnerAndName(repository: string): [string, string] {
  const [owner, name, extra] = repository.split("/");
  if (!owner || !name || extra) {
    throw new Error(
      `Expected repository in owner/name form, received ${repository}.`,
    );
  }
  return [owner, name];
}

export function managedDiscussionBody(
  title: string,
  canonicalUrl: string,
  commentThreadId: string,
): string {
  return `<!-- techsquidtv-comment-thread:${commentThreadId} -->

This is the comment thread for [${title}](${canonicalUrl}).

Public GitHub usernames, profile links, avatar images, timestamps, and comment text may be displayed statically on [TechSquidTV](${canonicalUrl}). GitHub hosts and moderates this discussion. Please follow GitHub's Community Guidelines when participating.`;
}

export async function getBlogDiscussionCategory(
  options: GitHubDiscussionApiOptions,
): Promise<BlogDiscussionCategory> {
  const [owner, name] = repositoryOwnerAndName(
    options.repository ?? DEFAULT_REPOSITORY,
  );
  const data = await graphql<{
    repository: {
      discussionCategories: { nodes: Array<{ id: string; name: string }> };
      id: string;
    } | null;
  }>(
    `
      query BlogDiscussionCategory($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          id
          discussionCategories(first: 25) {
            nodes {
              id
              name
            }
          }
        }
      }
    `,
    { name, owner },
    options,
  );

  if (!data.repository) {
    throw new Error(`GitHub repository ${owner}/${name} was not found.`);
  }
  const category = data.repository.discussionCategories.nodes.find(
    ({ name: categoryName }) => categoryName === BLOG_COMMENTS_CATEGORY,
  );
  if (!category) {
    throw new Error(
      `GitHub Discussion category ${BLOG_COMMENTS_CATEGORY} is required before publishing blog comments.`,
    );
  }

  return { id: category.id, repositoryId: data.repository.id };
}

export async function findDiscussionByThreadId(
  commentThreadId: string,
  categoryId: string,
  options: GitHubDiscussionApiOptions,
): Promise<ManagedDiscussion | undefined> {
  const [owner, name] = repositoryOwnerAndName(
    options.repository ?? DEFAULT_REPOSITORY,
  );
  const marker = `<!-- techsquidtv-comment-thread:${commentThreadId} -->`;
  let after: string | null = null;

  let match: ManagedDiscussion | undefined;

  do {
    const data: FindDiscussionResponse = await graphql<FindDiscussionResponse>(
      `
        query FindBlogDiscussion(
          $owner: String!
          $name: String!
          $categoryId: ID!
          $after: String
        ) {
          repository(owner: $owner, name: $name) {
            discussions(first: 100, after: $after, categoryId: $categoryId) {
              nodes {
                id
                url
                title
                body
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
        }
      `,
      { after, categoryId, name, owner },
      options,
    );
    const repository = data.repository;
    if (!repository) {
      throw new Error(`GitHub repository ${owner}/${name} was not found.`);
    }
    const discussions = repository.discussions;
    for (const discussion of discussions.nodes) {
      if (!discussion.body.includes(marker)) continue;
      if (match) {
        throw new Error(
          `Multiple GitHub Discussions use commentThreadId ${commentThreadId}.`,
        );
      }
      match = discussion;
    }
    if (!discussions.pageInfo.hasNextPage) return match;
    after = discussions.pageInfo.endCursor;
  } while (after);

  return match;
}

export async function createBlogDiscussion(
  input: {
    body: string;
    categoryId: string;
    repositoryId: string;
    title: string;
  },
  options: GitHubDiscussionApiOptions,
): Promise<ManagedDiscussion> {
  const data = await graphql<{
    createDiscussion: { discussion: ManagedDiscussion | null };
  }>(
    `
      mutation CreateBlogDiscussion(
        $body: String!
        $categoryId: ID!
        $repositoryId: ID!
        $title: String!
      ) {
        createDiscussion(
          input: {
            body: $body
            categoryId: $categoryId
            repositoryId: $repositoryId
            title: $title
          }
        ) {
          discussion {
            id
            url
            title
            body
          }
        }
      }
    `,
    input,
    options,
  );
  if (!data.createDiscussion.discussion) {
    throw new Error("GitHub did not return the created blog Discussion.");
  }
  return data.createDiscussion.discussion;
}

export async function updateBlogDiscussion(
  input: { body: string; discussionId: string; title: string },
  options: GitHubDiscussionApiOptions,
): Promise<ManagedDiscussion> {
  const data = await graphql<{
    updateDiscussion: { discussion: ManagedDiscussion | null };
  }>(
    `
      mutation UpdateBlogDiscussion(
        $body: String!
        $discussionId: ID!
        $title: String!
      ) {
        updateDiscussion(
          input: { body: $body, discussionId: $discussionId, title: $title }
        ) {
          discussion {
            id
            url
            title
            body
          }
        }
      }
    `,
    input,
    options,
  );
  if (!data.updateDiscussion.discussion) {
    throw new Error(
      `GitHub did not return updated Discussion ${input.discussionId}.`,
    );
  }
  return data.updateDiscussion.discussion;
}

/**
 * Fetches the public comment snapshots used while prerendering blog posts.
 * Every linked discussion must remain in this repository's Blog comments category.
 */
export async function fetchDiscussionSnapshots(
  discussionIds: string[],
  options: FetchDiscussionSnapshotsOptions = {},
): Promise<Map<string, GitHubDiscussionSnapshot>> {
  if (discussionIds.length === 0) return new Map();

  const fetchImpl = options.fetchImpl ?? fetch;
  const repository = options.repository ?? DEFAULT_REPOSITORY;
  const token = options.token ?? process.env.GITHUB_TOKEN;
  const headers = new Headers({
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2026-03-10",
  });

  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetchImpl(GITHUB_GRAPHQL_URL, {
    body: JSON.stringify({ query: makeDiscussionQuery(discussionIds) }),
    headers,
    method: "POST",
  });
  const text = await response.text();

  if (!response.ok) throw responseError(response, text);

  const payload = JSON.parse(
    text,
  ) as GitHubGraphqlResponse<GraphqlDiscussionData>;
  if (payload.errors && payload.errors.length > 0) {
    throw new Error(
      `GitHub Discussions query failed: ${payload.errors.map((error) => error.message).join("; ")}`,
    );
  }
  if (!payload.data)
    throw new Error("GitHub Discussions query returned no data.");

  const fetchedAt = new Date().toISOString();
  const entries = await Promise.all(
    discussionIds.map(async (discussionId, index) => {
      const discussion = payload.data?.[discussionField(index)];
      if (!discussion) {
        throw new Error(`GitHub Discussion ${discussionId} no longer exists.`);
      }
      if (discussion.repository.nameWithOwner !== repository) {
        throw new Error(
          `GitHub Discussion ${discussionId} belongs to ${discussion.repository.nameWithOwner}, not ${repository}.`,
        );
      }
      if (discussion.category.name !== BLOG_COMMENTS_CATEGORY) {
        throw new Error(
          `GitHub Discussion ${discussionId} is in ${discussion.category.name}, not ${BLOG_COMMENTS_CATEGORY}.`,
        );
      }

      const comments = await Promise.all(
        discussion.comments.nodes.map(normalizeComment),
      );
      return [
        discussionId,
        {
          comments,
          commentsTruncated: discussion.comments.pageInfo.hasPreviousPage,
          fetchedAt,
          id: discussion.id,
          updatedAt: discussion.updatedAt,
          url: discussion.url,
        },
      ] as const;
    }),
  );

  return new Map(entries);
}
