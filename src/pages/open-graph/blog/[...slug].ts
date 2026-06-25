import { OGImageRoute } from "astro-og-canvas";
import { getPublishedPosts } from "../../../utils/blog";

const bgImage = "./src/images/opengraph/tstv-og-bg.png";
const badge = "./src/images/opengraph/tstv-badge.png";

const posts = await getPublishedPosts();
const pages = Object.fromEntries(
  posts.map(({ id, data }) => [data.slug || id, data]),
);

export const { getStaticPaths, GET } = await OGImageRoute({
  param: "slug",
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgImage: {
      path: bgImage,
      fit: "cover",
    },
    padding: 40,
    font: {
      title: {
        families: ["Inter"],
        weight: "ExtraBold",
        size: 68,
        color: [255, 255, 255],
        lineHeight: 1.1,
        textShadow: "2px 2px 0px rgb(0, 0, 0)",
      },
      description: {
        families: ["Inter"],
        weight: "Normal",
        size: 28,
        color: [209, 213, 219],
        lineHeight: 1.3,
        textShadow: "1px 1px 0px rgb(0, 0, 0)",
      },
    },
    logo: {
      path: badge,
      size: [120, 88],
    },
    fonts: [
      "./src/images/opengraph/fonts/Inter-ExtraBold.ttf",
      "./src/images/opengraph/fonts/Inter-Regular.ttf",
    ],
  }),
});
