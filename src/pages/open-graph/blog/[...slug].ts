import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { generateOpenGraphImage } from "astro-og-canvas";
import sharp from "sharp";
import {
  BLOG_OPEN_GRAPH_HERO_HEIGHT,
  getBlogOpenGraphTextOptions,
  OPEN_GRAPH_LOGO_PATH,
  OPEN_GRAPH_IMAGE_HEIGHT,
  OPEN_GRAPH_IMAGE_WIDTH,
} from "@/lib/open-graph-theme";
import { getPublishedPosts } from "@/utils/blog";

type BlogOpenGraphPage = {
  heroImagePath?: string;
  title: string;
};

const HERO_IMAGE_PATTERN = /^heroImage:\s*(?<value>.+?)\s*$/m;
const LOGO_HEIGHT = 41;
const LOGO_PADDING = 56;
const LOGO_WIDTH = 56;

const posts = await getPublishedPosts();
const pages = await Promise.all(
  posts.map(async ({ id, data, filePath }) => [
    data.slug || id,
    {
      title: data.title,
      heroImagePath: await getHeroImagePath(filePath),
    },
  ]),
);

export function getStaticPaths() {
  return pages.map(([slug, page]) => ({
    params: { slug: `${slug}.jpeg` },
    props: { page },
  }));
}

export async function GET({
  props,
}: {
  props: { page: BlogOpenGraphPage };
}): Promise<Response> {
  const image = await createBlogOpenGraphImage(props.page);
  const imageBuffer = image.buffer;

  if (!(imageBuffer instanceof ArrayBuffer)) {
    throw new TypeError(
      "Open Graph image must use an ArrayBuffer backing store.",
    );
  }

  return new Response(
    imageBuffer.slice(image.byteOffset, image.byteOffset + image.byteLength),
    {
      headers: { "Content-Type": "image/jpeg" },
    },
  );
}

async function getHeroImagePath(
  filePath: string | undefined,
): Promise<string | undefined> {
  if (!filePath) return undefined;

  const source = await readFile(filePath, "utf8");
  const rawValue = source.match(HERO_IMAGE_PATTERN)?.groups?.value?.trim();

  if (!rawValue || rawValue === '""' || rawValue === "''") return undefined;

  const unquotedValue = rawValue.replace(/^['"]|['"]$/g, "");
  return resolve(dirname(filePath), unquotedValue);
}

async function createBlogOpenGraphImage({
  heroImagePath,
  title,
}: BlogOpenGraphPage): Promise<Buffer> {
  const typographyLayer = await generateOpenGraphImage(
    getBlogOpenGraphTextOptions(title),
  );

  if (!(typographyLayer instanceof Uint8Array)) {
    throw new TypeError(
      "Open Graph typography layer must be binary image data.",
    );
  }

  const textPanel = await sharp(typographyLayer)
    .extract({
      left: 0,
      top: 0,
      width: OPEN_GRAPH_IMAGE_WIDTH,
      height: OPEN_GRAPH_IMAGE_HEIGHT - BLOG_OPEN_GRAPH_HERO_HEIGHT,
    })
    .png()
    .toBuffer();

  const textPanelLayer = {
    input: textPanel,
    top: BLOG_OPEN_GRAPH_HERO_HEIGHT,
    left: 0,
  };
  const heroImageLayer = heroImagePath
    ? {
        input: await sharp(heroImagePath)
          .resize(OPEN_GRAPH_IMAGE_WIDTH, BLOG_OPEN_GRAPH_HERO_HEIGHT, {
            fit: "cover",
            position: "south",
          })
          .jpeg({ quality: 88 })
          .toBuffer(),
        top: 0,
        left: 0,
      }
    : undefined;
  const logo = await sharp(OPEN_GRAPH_LOGO_PATH)
    .resize(LOGO_WIDTH, LOGO_HEIGHT)
    .png()
    .toBuffer();
  const logoLayer = {
    input: logo,
    top: OPEN_GRAPH_IMAGE_HEIGHT - LOGO_HEIGHT - LOGO_PADDING,
    left: OPEN_GRAPH_IMAGE_WIDTH - LOGO_WIDTH - LOGO_PADDING,
  };

  return sharp({
    create: {
      width: OPEN_GRAPH_IMAGE_WIDTH,
      height: OPEN_GRAPH_IMAGE_HEIGHT,
      channels: 3,
      background: { r: 27, g: 24, b: 24 },
    },
  })
    .composite(
      heroImageLayer
        ? [heroImageLayer, textPanelLayer, logoLayer]
        : [textPanelLayer, logoLayer],
    )
    .jpeg({ quality: 88, progressive: true })
    .toBuffer();
}
