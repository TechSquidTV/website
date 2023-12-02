import techsquidtv from "@data/techsquidtv.json";
import type { CollectionEntry } from "astro:content";

function createSchema(data: object) {
  return {
    "@context": "https://schema.org",
    ...data,
  };
}

const ldAuthor = {
  "@type": "Person",
  name: techsquidtv.name,
  alternateName: techsquidtv.username,
  url: techsquidtv.website,
  sameAs: techsquidtv.socials.map((s) => s.url),
};

export function CreateBlog(post: CollectionEntry<"blog">) {
  const ldBlog = {
    "@type": "BlogPosting",
    headline: post.data.title,
    datePublished: post.data.publishDate.toDateString(),
    dateModified:
      post.data.updateDate?.toDateString() ??
      post.data.publishDate.toDateString(),
    author: ldAuthor,
    description: post.data.description,
    image: post.data.heroImage.src,
    keywords: post.data.tags,
  };

  return createSchema(ldBlog);
}
