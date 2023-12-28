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

  return (
    <button onClick={toggleMenu} aria-label="Toggle menu" className={className}>
      {isMenuOpen ? (
        <div
          className="w-5 h-5"
          dangerouslySetInnerHTML={{ __html: CloseIcon }}
        />
      ) : (
        <div
          className="w-5 h-5"
          dangerouslySetInnerHTML={{ __html: MenuIcon }}
        />
      )}
    </button>
  );
}

export default NavMenuButton;
