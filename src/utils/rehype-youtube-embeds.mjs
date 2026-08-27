import matchYouTubeUrl from "@astro-community/astro-embed-youtube/matcher";
import { visit } from "unist-util-visit";

function isStandaloneYouTubeLink(node) {
  if (node.tagName !== "p" || node.children.length !== 1) return false;

  const [link] = node.children;

  return (
    link.type === "element" &&
    link.tagName === "a" &&
    typeof link.properties?.href === "string" &&
    link.children.length === 1 &&
    link.children[0].type === "text" &&
    link.children[0].value === link.properties.href
  );
}

/**
 * Replaces a paragraph containing only a YouTube URL with a privacy-enhanced
 * responsive iframe. Inline or labelled links remain normal links.
 */
export function rehypeYouTubeEmbeds() {
  return function (tree) {
    visit(tree, "element", (node, index, parent) => {
      if (
        !parent ||
        typeof index !== "number" ||
        !isStandaloneYouTubeLink(node)
      ) {
        return;
      }

      const [link] = node.children;
      const videoId = matchYouTubeUrl(link.properties.href);

      if (!videoId) return;

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["youtube-embed"] },
        children: [
          {
            type: "element",
            tagName: "iframe",
            properties: {
              src: `https://www.youtube-nocookie.com/embed/${videoId}`,
              title: "YouTube video player",
              loading: "lazy",
              allow:
                "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
              allowFullScreen: true,
              referrerPolicy: "strict-origin-when-cross-origin",
            },
            children: [],
          },
        ],
      };
    });
  };
}
