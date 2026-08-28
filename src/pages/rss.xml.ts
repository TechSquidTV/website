import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/consts";
import { getPublishedPosts } from "@/utils/blog";

export async function GET(context: APIContext) {
  const site = context.site;

  if (!site) {
    throw new Error("RSS generation requires Astro's site configuration.");
  }

  const posts = await getPublishedPosts(true);
  const lastBuildDate = posts.reduce((latest, post) => {
    const postDate = post.data.updatedDate ?? post.data.publishDate;
    return postDate > latest ? postDate : latest;
  }, new Date(0));

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site,
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: [
      `<atom:link href="${new URL("rss.xml", site).href}" rel="self" type="application/rss+xml" />`,
      `<lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>`,
      "<language>en-us</language>",
    ].join(""),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/blog/${post.data.slug || post.id}/`,
      pubDate: post.data.publishDate,
      categories: post.data.tags,
    })),
  });
}
