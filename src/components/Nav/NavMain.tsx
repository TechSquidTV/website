import NavMenu from "@components/Headless/Nav/NavMenu";
import NavMenuButton from "@components/Headless/Nav/NavMenuButton";
import NavMenuItems, {
  type MenuItem,
} from "@components/Headless/Nav/NavMenuItems";
import LogoIcon from "@icons/techsquidtv.svg?raw";

const menuItems: MenuItem[] = [
  {
    text: "blog",
    href: "/blog",
  },
  {
    text: "about",
    href: "/about",
  },
  {
    text: "follow",
    href: "/follow",
  },
  {
    text: "contact",
    href: "/contact",
  },
];

export default function PostTOCNav() {
  return (
    <NavMenu className="flex flex-row items-center text-center px-4 py-2 text-smoke-100 border border-smoke-900 border-opacity-30 bg-smoke-800 bg-opacity-30 backdrop-blur-md rounded-md md:rounded-full shadow-lg">
      <a href="/" aria-label="home">
        <div
          className="w-8 h-8 flex justify-center items-center px-1"
          dangerouslySetInnerHTML={{ __html: LogoIcon }}
        />
      </a>
      <NavMenuItems
        items={menuItems}
        classNames={{
          ul: "flex flex-row",
          li: "flex item-center px-2",
          a: "text-lg",
        }}
      />
      <NavMenuButton className={"flex items-center justify-center w-8 h-8"} />
    </NavMenu>
  );
}
