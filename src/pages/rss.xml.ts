import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

export async function GET(context: APIContext) {
  const blog = await getCollection("blog");

  return rss({
    title: "TechSquidTV Blog",
    description:
      "Open-source developer and tech educator, Kyle A.K.A TechSquidTV. Software development tutorials, videos, and fun code experiments.",
    site: context.site ?? "https://techsquidtv.com",
    items: blog.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
      pubDate: post.data.publishDate,
      category: post.data.tags[0],
      enclosure: {
        url: post.data.heroImage.src,
        type: "image/png",
        length: 1200000, //currently unable to calculate size.
      },
    })),
    customData: `<language>en-us</language>`,
  });
}
