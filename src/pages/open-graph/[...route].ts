import { OGImageRoute } from "astro-og-canvas";
import { PERSONAL_INFO, SITE_DESCRIPTION, SITE_TITLE } from "@/consts";
import { getOpenGraphImageOptions } from "@/lib/open-graph-theme";
import { getPublishedPosts } from "@/utils/blog";

type PageData = {
  title: string;
  description: string;
};

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
  pages,
  getImageOptions: (_path, page) => getOpenGraphImageOptions(page, "page"),
});
