// NavButton.tsx
import { NavContext } from "@components/Headless/Nav/NavMenu";
import CloseIcon from "@icons/close.svg?raw";
import MenuIcon from "@icons/menu.svg?raw";
import { h } from "preact";
import { useContext } from "preact/hooks";

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
    <button onClick={toggleMenu} aria-label="Toggle menu" class={className}>
      {isMenuOpen ? (
        <div class="w-5 h-5" dangerouslySetInnerHTML={{ __html: CloseIcon }} />
      ) : (
        <div class="w-5 h-5" dangerouslySetInnerHTML={{ __html: MenuIcon }} />
      )}
    </button>
  );
}

export default NavMenuButton;
