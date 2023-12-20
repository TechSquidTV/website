import NavMenu from "@components/Headless/Nav/NavMenu";
import NavTOCButton from "@components/Headless/Nav/NavTOCButton";
import { NavTOCMenuItems } from "@components/Headless/Nav/NavTOCMenuItems";
import type { MarkdownHeading } from "astro";

export default function PostTOCNav({
  headings,
}: {
  headings: MarkdownHeading[];
}) {
  return (
    <NavMenu className="flex flex-col text-sm">
      <div>
        <NavTOCButton />
        <NavTOCMenuItems headings={headings} />
      </div>
    </NavMenu>
  );
}
