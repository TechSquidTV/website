import { NavContext } from "@components/Headless/Nav/NavMenu";
import { h } from "preact";
import { useContext } from "preact/hooks";

export type MenuItem = {
  name: string;
  url: string;
};

interface NavMenuItemsProps {
  items: MenuItem[];
  classNames?: {
    ul?: string;
    li?: string;
    a?: string;
  };
}

export function NavMenuItems({
  items,
  classNames = { ul: "", li: "", a: "" },
}: NavMenuItemsProps) {
  const context = useContext(NavContext);
  if (!context) {
    console.log("NavMenuItems: context is undefined");
    return null;
  }

  const { isMenuOpen } = context;

  return (
    <ul class={`${isMenuOpen ? "" : "hidden"} ${classNames.ul}`}>
      {items.map((item) => (
        <li key={item.name} className={classNames.li}>
          <a href={item.url} className={classNames.a}>
            {item.name}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default NavMenuItems;
