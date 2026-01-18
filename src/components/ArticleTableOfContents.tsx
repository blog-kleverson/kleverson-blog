import { useEffect, useState, useCallback } from 'react';
import { List, ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  text: string;
  level: number; // 2 for h2, 3 for h3, 4 for h4
}

export default function ArticleTableOfContents() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);

  // Parse article body to find h2, h3, h4 elements
  useEffect(() => {
    const parseHeadings = () => {
      const articleBody = document.querySelector('.article-body');
      if (!articleBody) return;

      const headings = articleBody.querySelectorAll('h2, h3, h4');
      const items: TocItem[] = [];

      headings.forEach((heading, index) => {
        const tagName = heading.tagName.toLowerCase();
        const level = parseInt(tagName.charAt(1));
        let id = heading.id;
        
        // Generate ID if not present
        if (!id) {
          id = `heading-${index}`;
          heading.id = id;
        }

        const text = heading.textContent?.trim() || '';

        if (text) {
          items.push({ id, text, level });
        }
      });

      setTocItems(items);
      
      // Set first item as active initially
      if (items.length > 0) {
        setActiveId(items[0].id);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(parseHeadings, 100);
    return () => clearTimeout(timer);
  }, []);

  // Track scroll position to highlight active section using Intersection Observer
  useEffect(() => {
    if (tocItems.length === 0) return;

    const observerOptions = {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, observerOptions);

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [tocItems]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
      window.history.pushState(null, '', `#${id}`);
      setActiveId(id);
    }
  };

  const getIndentation = (level: number) => {
    if (level === 2) return '';
    if (level === 3) return 'pl-3';
    return 'pl-6';
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-300",
        isVisible ? "w-64" : "w-auto"
      )}
    >
      {/* Collapsed state - just the toggle button */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="flex items-center justify-center w-10 h-10 rounded-lg glass text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          aria-label="Mostrar índice"
        >
          <List className="w-5 h-5" />
        </button>
      )}

      {/* Expanded state - full sidebar */}
      {isVisible && (
        <div className="glass rounded-lg p-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Índice</span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
              aria-label="Ocultar índice"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          <nav>
            <ul className="space-y-1">
              {tocItems.map((item) => (
                <li key={item.id} className={getIndentation(item.level)}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleClick(e, item.id)}
                    className={cn(
                      "block text-sm transition-all duration-200 py-1.5 px-2 rounded-md leading-tight",
                      item.level === 2 && "font-medium",
                      item.level > 2 && "text-xs",
                      activeId === item.id
                        ? "text-primary bg-primary/10 border-l-2 border-primary"
                        : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                    )}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </aside>
  );
}
