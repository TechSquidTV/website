// NavButton.tsx
import { NavContext } from "@components/Headless/Nav/NavMenu";
import CloseIcon from "@icons/close.svg?raw";
import MenuIcon from "@icons/menu.svg?raw";
import { useContext } from "react";


interface NavMenuButtonProps {
  className?: string;
}

export function NavMenuButton({ className = "" }: NavMenuButtonProps) {
  const context = useContext(NavContext);
  if (!context) {
    console.log("NavMenuButton: context is undefined");
    return null;
  }

  const { isMenuOpen, toggleMenu } = context;

  const baseStyle =
    "flex flex-row space-x-1 px-1 text-sm py-1 text-lg border border-smoke-800 rounded-sm hover:bg-smoke-700";
  const openStyle = "bg-smoke-700";
  const closeStyle = "bg-smoke-950";

  return (
    <button
      onClick={toggleMenu}
      aria-label="Toggle contents menu"
      className={
        className +
        " " +
        baseStyle +
        " " +
        (isMenuOpen ? openStyle : closeStyle)
      }
    >
      {isMenuOpen ? (
        <div className="w-5 h-5" dangerouslySetInnerHTML={{ __html: CloseIcon }} />
      ) : (
        <div className="w-5 h-5" dangerouslySetInnerHTML={{ __html: MenuIcon }} />
      )}
      <span>Contents</span>
    </button>
  );
}

export default NavMenuButton;
