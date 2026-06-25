import { OGImageRoute } from "astro-og-canvas";
import { PERSONAL_INFO, SITE_DESCRIPTION, SITE_TITLE } from "../../consts";
import { getPublishedPosts } from "../../utils/blog";

type PageData = {
  title: string;
  description: string;
};

const bgImage = "./src/images/opengraph/tstv-og-bg.png";
const badge = "./src/images/opengraph/tstv-badge.png";

const posts = await getPublishedPosts();
const tags = [...new Set(posts.flatMap((post) => post.data.tags ?? []))].sort();

const pages: Record<string, PageData> = {
  index: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  about: {
    title: `About - ${SITE_TITLE}`,
    description: `Learn about ${PERSONAL_INFO.name}, the developer and educator behind ${SITE_TITLE}`,
  },
  blog: {
    title: `Blog - ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
  },
  contact: {
    title: `Contact - ${SITE_TITLE}`,
    description: `Get in touch with ${PERSONAL_INFO.name} from ${SITE_TITLE}`,
  },
  follow: {
    title: `Follow ${PERSONAL_INFO.name} - ${SITE_TITLE}`,
    description: `Connect with ${PERSONAL_INFO.name} (${PERSONAL_INFO.username}) across all social platforms. Follow for tech content, open source projects, developer tutorials, and more.`,
  },
  newsletter: {
    title: `Newsletter - ${SITE_TITLE}`,
    description: `Subscribe to the ${SITE_TITLE} newsletter for updates on latest blog posts, projects, and videos`,
  },
  "services/devrel": {
    title: `DevRel Services by ${SITE_TITLE}`,
    description: `Professional developer relations and content creation services by ${PERSONAL_INFO.name}`,
  },
  verify: {
    title: `Verify Identity - ${SITE_TITLE}`,
    description: `Verify the identity of ${PERSONAL_INFO.name} using cryptographic verification`,
  },
  "404": {
    title: `404 - Page Not Found | ${SITE_TITLE}`,
    description: "The page you're looking for doesn't exist.",
  },
};

for (const tag of tags) {
  pages[`blog/tags/${tag}`] = {
    title: `${tag} Posts - ${SITE_TITLE}`,
    description: `All posts tagged with ${tag}`,
  };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  param: "route",
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgImage: {
      path: bgImage,
      fit: "cover",
    },
    padding: 64,
    font: {
      title: {
        families: ["Inter"],
        weight: "ExtraBold",
        size: 80,
        color: [255, 255, 255],
        lineHeight: 1.1,
        textShadow: "2px 2px 0px rgb(0, 0, 0)",
      },
      description: {
        families: ["Inter"],
        weight: "Normal",
        size: 32,
        color: [209, 213, 219],
        lineHeight: 1.3,
        textShadow: "1px 1px 0px rgb(0, 0, 0)",
      },
    },
    logo: {
      path: badge,
      size: [146, 107],
    },
    fonts: [
      "./src/images/opengraph/fonts/Inter-ExtraBold.ttf",
      "./src/images/opengraph/fonts/Inter-Regular.ttf",
    ],
  }),
});
