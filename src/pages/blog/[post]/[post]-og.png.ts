import { PNG } from "@components/OpenGraph/createImage";
import OG from "@components/OpenGraph/OG";
import type { APIRoute, InferGetStaticPropsType } from "astro";
import { getCollection } from "astro:content";
import fs from "fs/promises";
import matter from "gray-matter";


export async function getStaticPaths() {
  const blog = await getCollection("blog");
  const blogData = await getBlogFrontmatterCollection();
  return blog.map((post) => {
    const postData = blogData.find((data) => data.title === post.data.title);
    return {
      params: {
        post: post.slug,
      },
      props: {
        title: post.data.title,
        heroImage: postData?.heroImage.replace("../../images/blog/", ""),
      },
    };
  })
}

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute = async function get({ props }) {
  const { title, heroImage } = props as Props;
  const png = await PNG(OG(title, heroImage));
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
    },
  });
};

const getBlogFrontmatterCollection = async () => {

  const contentDir = 'src/content/blog';
  const files = await fs.readdir(contentDir);
  const mdx = files.filter(file => file.endsWith('.mdx'));
  const frontmatter = mdx.map(async file => {
    const content = await fs.readFile(`${contentDir}/${file}`, 'utf-8');
    const { data } = matter(content);
    return data;
  });
  return Promise.all(frontmatter);
}