// @ts-check
import { glob, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sitemap from "@astrojs/sitemap";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import { visit } from "unist-util-visit";

/** @param {string} html */
export function pageMetadata(html) {
  const head = html.slice(0, html.indexOf("</head>") + "</head>".length);
  const tree = unified().use(rehypeParse).parse(head);
  /** @type {Map<string, string>} */
  const values = new Map();
  let canonical = "";
  visit(tree, "element", (node) => {
    if (
      node.tagName === "link" &&
      Array.isArray(node.properties.rel) &&
      node.properties.rel.includes("canonical") &&
      typeof node.properties.href === "string"
    ) {
      canonical = node.properties.href;
    }
    const name = node.properties.name ?? node.properties.property;
    if (
      node.tagName === "meta" &&
      typeof name === "string" &&
      typeof node.properties.content === "string"
    ) {
      values.set(name, node.properties.content);
    }
  });
  const date =
    values.get("article:modified_time") ?? values.get("article:published_time");
  return {
    canonical,
    noindex: /(?:^|[\s,])(?:noindex|none)(?:$|[\s,])/i.test(
      values.get("robots") ?? "",
    ),
    lastmod:
      date && Number.isFinite(Date.parse(date))
        ? new Date(date).toISOString()
        : undefined,
  };
}

/** @returns {import("astro").AstroIntegration[]} */
export function seoIntegrations() {
  /** @type {Map<string, ReturnType<typeof pageMetadata>>} */
  const metadata = new Map();
  return [
    {
      name: "techsquidtv:seo",
      hooks: {
        "astro:build:done": async ({ dir, logger }) => {
          metadata.clear();
          const redirects = [];
          for await (const file of glob("**/index.html", {
            cwd: fileURLToPath(dir),
          })) {
            const page = pageMetadata(
              await readFile(new URL(file, dir), "utf8"),
            );
            if (!page.canonical) continue;
            metadata.set(page.canonical, page);
            const pathname = new URL(page.canonical).pathname;
            if (pathname !== "/" && pathname.endsWith("/")) {
              redirects.push(`${pathname.slice(0, -1)} ${pathname} 301`);
            }
          }
          const redirectsFile = new URL("_redirects", dir);
          const existing = await readFile(redirectsFile, "utf8").catch(
            /** @param {NodeJS.ErrnoException} error */
            (error) => {
              if (error.code === "ENOENT") return "";
              throw error;
            },
          );
          const preserved = existing
            .replace(
              /# BEGIN CANONICAL PAGES[\s\S]*?# END CANONICAL PAGES\n?/g,
              "",
            )
            .trimEnd();
          await writeFile(
            redirectsFile,
            `${preserved}\n# BEGIN CANONICAL PAGES\n${redirects.sort().join("\n")}\n# END CANONICAL PAGES\n`,
          );
          logger.info(
            `Generated ${redirects.length} permanent canonical page redirects.`,
          );
        },
      },
    },
    sitemap({
      filter: (url) => {
        const page = metadata.get(url);
        return Boolean(page && !page.noindex);
      },
      serialize: (item) => {
        const lastmod = metadata.get(item.url)?.lastmod;
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ];
}

/** @type {import("rehype-external-links").Options} */
export const editorialLinks = {
  target: "_blank",
  rel: (node) => {
    const existing = node.properties.rel ?? [];
    return [...new Set([...existing, "noopener"])];
  },
};
