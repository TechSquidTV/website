import { OGImageRoute } from "astro-og-canvas";
import { getCollection } from "astro:content";
import fs from "fs/promises";
import matter from "gray-matter";

// Import your background image and logo
const bgImage = "./src/images/opengraph/tstv-og-bg.png";
const badge = "./src/images/opengraph/tstv-badge.png";

// Get all blog posts
const posts = await getCollection("blog");

// Function to get original frontmatter data (with original image paths)
const getBlogFrontmatterCollection = async () => {
  const contentDir = "src/content/blog";
  const files = await fs.readdir(contentDir);
  const mdx = files.filter(
    (file) => file.endsWith(".mdx") || file.endsWith(".md"),
  );
  const frontmatter = mdx.map(async (file) => {
    const content = await fs.readFile(`${contentDir}/${file}`, "utf-8");
    const { data } = matter(content);
    return {
      ...data,
      filename: file.replace(/\.(mdx?|md)$/, ""),
      heroImage: data.heroImage as string,
      slug: data.slug as string,
    };
  });
  return Promise.all(frontmatter);
};

const blogData = await getBlogFrontmatterCollection();

export const { getStaticPaths, GET } = OGImageRoute({
  param: "slug",

  pages: Object.fromEntries(
    posts.map(({ id, data }) => [id, { frontmatter: data }]),
  ),

  getImageOptions: (path, page) => {
    const { title, description } = page.frontmatter;

    // Get the original frontmatter data to access the original heroImage path
    const slug = path.replace(".png", "");
    const postData = blogData.find(
      (data) => data.slug === slug || data.filename === slug,
    );

    // Transform hero image path or fallback to default background
    let backgroundImage = bgImage; // default fallback
    if (postData?.heroImage) {
      // Convert ../../images/blog/filename.png to ./src/images/blog/filename.png
      backgroundImage = postData.heroImage.replace(
        "../../images/",
        "./src/images/",
      );
    }

    // Clip title if too long (approximately 60 characters for readability)
    const clippedTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;

    return {
      title: clippedTitle,
      description:
        description?.slice(0, 80) + (description?.length > 80 ? "..." : ""),
      bgImage: {
        path: backgroundImage,
      },
      // Reduced padding to position elements closer to bottom
      padding: 40,
      font: {
        title: {
          families: ["Inter"],
          weight: "ExtraBold",
          size: 68, // Slightly smaller to accommodate longer titles
          color: [255, 255, 255],
          lineHeight: 1.1,
        },
        description: {
          families: ["Inter"],
          weight: "Normal",
          size: 28, // Slightly smaller for better balance
          color: [209, 213, 219],
          lineHeight: 1.3,
        },
      },
      // TechSquidTV badge positioned bottom-right
      logo: {
        path: badge,
        size: [120, 88], // Slightly smaller for better proportion
      },
      fonts: [
        "./src/images/opengraph/fonts/Inter-ExtraBold.ttf",
        "./src/images/opengraph/fonts/Inter-Regular.ttf",
      ],
    };
  },
});
