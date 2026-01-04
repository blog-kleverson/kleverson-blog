import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCategories } from "@/hooks/usePosts";
import ThemeToggle from "./ThemeToggle";
import SearchModal from "./SearchModal";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: categories } = useCategories();

  const navLinks = [
    { href: "/", label: "HOME" },
    { href: "/cartas", label: "CARTAS" },
    { href: "/sobre", label: "SOBRE" },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleCategoryClick = (category: string) => {
    navigate(`/cartas?categoria=${encodeURIComponent(category)}`);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container">
          {/* Main Nav */}
          <div className="flex items-center justify-between h-16">
            <Link 
              to="/" 
              className="text-xl font-bold tracking-[0.15em] text-foreground hover:text-primary"
              style={{ transition: "color var(--transition-fast)" }}
            >
              KLEVERSON
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm tracking-wider link-underline ${
                    isActive(link.href) 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={{ transition: "color var(--transition-fast)" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button 
                className="p-2 text-muted-foreground hover:text-foreground"
                style={{ transition: "color var(--transition-fast)" }}
                aria-label="Buscar"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-5 h-5" />
              </button>

              <ThemeToggle />

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Categories Bar */}
          {categories && categories.length > 0 && (
            <div className="hidden md:flex items-center gap-6 py-3 border-t border-border/50 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className="text-xs tracking-wider text-muted-foreground hover:text-primary whitespace-nowrap"
                  style={{ transition: "color var(--transition-fast)" }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border animate-fade-in">
              <nav className="py-4 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`block text-sm tracking-wider ${
                      isActive(link.href) 
                        ? "text-primary" 
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {categories && categories.length > 0 && (
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground/60 mb-3">CATEGORIAS</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryClick(category)}
                          className="category-pill cursor-pointer"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;
