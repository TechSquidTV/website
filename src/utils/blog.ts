import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

/**
 * Get all published blog posts (excludes drafts)
 * @param sort - Whether to sort by publish date (newest first). Default: false
 * @returns Array of published blog posts
 */
export async function getPublishedPosts(
  sort: boolean = false,
): Promise<CollectionEntry<"blog">[]> {
  const posts = await getCollection("blog", ({ data }) => {
    return !data.draft;
  });

  if (sort) {
    return posts.sort(
      (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
    );
  }

  return posts;
}

/**
 * Filter function for excluding draft posts
 * Use this with getCollection when you need custom logic beyond basic filtering
 */
export const publishedPostFilter = ({ data }: { data: any }) => {
  return !data.draft;
};
