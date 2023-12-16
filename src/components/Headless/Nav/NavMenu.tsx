import { createContext, type FunctionComponent, h } from "preact";
import {  useEffect,useState } from "preact/hooks";

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
  const [isMenuOpen, setMenuOpen] = useState(true);
  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const smallScreenBreakpoint = 768;
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= smallScreenBreakpoint) {
        setMenuOpen(false);
      } else {
        setMenuOpen(true);
      }
    }
    window.addEventListener("resize", handleResize);
    handleResize(); // Checks on first render
    return () => window.removeEventListener("resize", handleResize);
  }, [])


  return (
    <NavContext.Provider value={{ isMenuOpen, toggleMenu }}>
      <nav class={className}>{children}</nav>
    </NavContext.Provider>
  );
};

export default NavMenu;
