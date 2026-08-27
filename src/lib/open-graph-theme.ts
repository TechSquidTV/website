import type { OGImageOptions } from "astro-og-canvas";

type OpenGraphImageContent = {
  description: string;
  title: string;
};

export type OpenGraphImageVariant = "page" | "post";

export const OPEN_GRAPH_IMAGE_EXTENSION = "jpeg";
export const OPEN_GRAPH_IMAGE_HEIGHT = 630;
export const OPEN_GRAPH_IMAGE_WIDTH = 1200;
export const BLOG_OPEN_GRAPH_HERO_HEIGHT = 300;

const OUTFIT_FONT =
  "./node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2";
export const OPEN_GRAPH_LOGO_PATH = "./src/images/opengraph/tstv-badge.png";

/**
 * Keeps every generated social card in the same visual system as the site:
 * dark surfaces, Outfit typography, and the primary blue accent.
 */
export function getOpenGraphImageOptions(
  { title, description }: OpenGraphImageContent,
  variant: OpenGraphImageVariant,
): OGImageOptions {
  const isPost = variant === "post";

  return {
    title,
    description,
    bgGradient: [
      [27, 24, 24],
      [14, 12, 12],
    ],
    padding: isPost ? 64 : 72,
    font: {
      title: {
        families: ["Outfit Thin"],
        weight: "ExtraBold",
        size: isPost ? 72 : 84,
        color: [255, 255, 255],
        lineHeight: 1.05,
      },
      description: {
        families: ["Outfit Thin"],
        weight: "Normal",
        size: isPost ? 27 : 30,
        color: [216, 229, 247],
        lineHeight: 1.3,
      },
    },
    logo: {
      path: OPEN_GRAPH_LOGO_PATH,
      size: [isPost ? 76 : 88],
    },
    fonts: [OUTFIT_FONT],
    format: "JPEG",
    quality: 88,
  };
}

/** Creates the typography layer for a blog card; the route composites it below the hero image. */
export function getBlogOpenGraphTextOptions(title: string): OGImageOptions {
  return {
    title,
    cacheDir: false,
    bgGradient: [[27, 24, 24]],
    padding: 72,
    font: {
      title: {
        families: ["Outfit Thin"],
        weight: "ExtraBold",
        size: 68,
        color: [255, 255, 255],
        lineHeight: 1.08,
      },
    },
    fonts: [OUTFIT_FONT],
    format: "PNG",
  };
}
