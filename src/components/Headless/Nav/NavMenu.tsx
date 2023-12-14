import { createContext, type FunctionComponent, h } from "preact";
import {  useState } from "preact/hooks";

// Define the context and its type
interface NavContextType {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}
export const NavContext = createContext<NavContextType | undefined>(undefined);

interface NavMenuProps {
  className?: string;
}


export const NavMenu: FunctionComponent<NavMenuProps> = ({
  children,
  className
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!isMenuOpen);

  return (
    <NavContext.Provider value={{ isMenuOpen, toggleMenu }}>
      <nav class={className}>{children}</nav>
    </NavContext.Provider>
  );
};

export default NavMenu;
