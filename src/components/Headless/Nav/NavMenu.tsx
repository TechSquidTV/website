import {
  createContext,
  type FunctionComponent,
  type ReactNode,
  useEffect,
  useState,
} from "react";

// Define the context and its type
interface NavContextType {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}
export const NavContext = createContext<NavContextType | undefined>(undefined);

interface NavMenuProps {
  className?: string;
  children?: ReactNode; // Add this line to include children
}

export const NavMenu: FunctionComponent<NavMenuProps> = ({
  className,
  children,
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
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Checks on first render
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <NavContext.Provider value={{ isMenuOpen, toggleMenu }}>
      <nav className={className}>{children}</nav>
    </NavContext.Provider>
  );
};

export default NavMenu;
