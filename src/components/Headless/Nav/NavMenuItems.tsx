import { NavContext } from "@components/Headless/Nav/NavMenu";
import { useContext } from "react";

export type MenuItem = {
  text: string;
  href: string;
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
    <ul className={`${isMenuOpen ? "" : "hidden"} ${classNames.ul}`}>
      {items.map((item) => (
        <li key={item.text} className={classNames.li}>
          <a href={item.href} className={classNames.a}>
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default NavMenuItems;
