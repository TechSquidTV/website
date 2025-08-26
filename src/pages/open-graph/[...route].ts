import { OGImageRoute } from "astro-og-canvas";

// Import your background image
const bgImage = "./src/images/opengraph/tstv-og-bg.png";
const badge = "./src/images/opengraph/tstv-badge.png";

export const { getStaticPaths, GET } = OGImageRoute({
  // The name of your dynamic route segment.
  // In this case it's `[...route]`, so param will be `route`.
  param: "route",

  // A collection of pages to generate images for.
  pages: import.meta.glob("/src/pages/**/*.{astro,md,mdx}", { eager: true }),

  // For each page, this callback will be used to
  // generate the OG image.
  getImageOptions: (_path, page) => ({
    title: page.frontmatter?.title ?? "TechSquidTV",
    description:
      page.frontmatter?.description ??
      "Open-source developer and tech educator",
    bgImage: {
      path: bgImage,
    },
    // Minimal padding to match previous clean design
    padding: 64,
    font: {
      title: {
        families: ["Inter"],
        weight: "ExtraBold",
        size: 80, // Large text like previous 5rem
        color: [255, 255, 255],
        lineHeight: 1.1,
      },
      description: {
        families: ["Inter"],
        weight: "Normal",
        size: 32, // Smaller description text
        color: [209, 213, 219],
        lineHeight: 1.3,
      },
    },
    // Logo badge to match previous design
    logo: {
      path: badge,
      size: [146, 107], // Natural aspect ratio - matches badge dimensions
    },
    fonts: [
      "./src/images/opengraph/fonts/Inter-ExtraBold.ttf",
      "./src/images/opengraph/fonts/Inter-Regular.ttf",
    ],
  }),
});
