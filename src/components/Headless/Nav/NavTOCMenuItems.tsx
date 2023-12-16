import { NavContext } from "@components/Headless/Nav/NavMenu";
import { type MenuItem } from "@components/Headless/Nav/NavMenuItems";
import { type MarkdownHeading } from "astro";
import { h } from "preact";
import { useContext } from "preact/hooks";

type TOCHeading = {
  heading: MenuItem;
  subItems: MenuItem[];
};

const TOC = (headings: MarkdownHeading[]) => {
  const toc: TOCHeading[] = [];
  headings.forEach((heading) => {
    if (heading.depth === 2) {
      toc.push({
        heading: {
          text: heading.text,
          href: heading.slug,
        },
        subItems: [],
      });
    } else if (heading.depth === 3) {
      toc[toc.length - 1].subItems.push({
        text: heading.text,
        href: heading.slug,
      });
    }
  });
  return toc;
};

export function NavTOCMenuItems({ headings }: { headings: MarkdownHeading[] }) {
  const context = useContext(NavContext);
  if (!context) {
    console.log("NavMenuItems: context is undefined");
    return null;
  }

  const { isMenuOpen } = context;
  return (
    <ol class={(isMenuOpen ? "" : "hidden") + " mt-1"}>
      {TOC(headings).map((heading) => {
        return (
          <li class="my-1">
            <a href={`#${heading.heading.href}`} class="font-bold">
              {heading.heading.text}
            </a>
            {heading.subItems.length > 0 && (
              <ol class="ml-2">
                {heading.subItems.map((subItem) => {
                  return (
                    <li class="my-1 text-smoke-300">
                      <a href={`#${subItem.href}`}>{subItem.text}</a>
                    </li>
                  );
                })}
              </ol>
            )}
          </li>
        );
      })}
    </ol>
  );
}
