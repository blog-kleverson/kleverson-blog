import { useEffect, useState, useCallback } from 'react';
import { List, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  text: string;
}

export default function ArticleTableOfContents() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);

  // Parse article body to find h2 elements with "sub-" prefix IDs
  useEffect(() => {
    const parseHeadings = () => {
      const headings = document.querySelectorAll('h2[id^="sub-"]');
      const items: TocItem[] = [];

      headings.forEach((heading) => {
        const id = heading.id;
        const text = heading.textContent?.trim() || '';

        if (id && text) {
          items.push({ id, text });
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

  // Track scroll position to highlight active section
  const handleScroll = useCallback(() => {
    if (tocItems.length === 0) return;

    const headingElements = tocItems.map(item => document.getElementById(item.id)).filter(Boolean);
    
    // Find which heading is currently in view
    let currentActiveId = tocItems[0]?.id || '';
    
    for (const element of headingElements) {
      if (element) {
        const rect = element.getBoundingClientRect();
        // Consider a heading "active" when it's in the top half of the viewport
        if (rect.top <= window.innerHeight / 3) {
          currentActiveId = element.id;
        }
      }
    }

    setActiveId(currentActiveId);
  }, [tocItems]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${id}`);
      setActiveId(id);
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-300",
        isVisible ? "w-60" : "w-auto"
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
        <div className="glass rounded-lg p-4 max-h-[60vh] overflow-y-auto">
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
            <ul className="space-y-2">
              {tocItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleClick(e, item.id)}
                    className={cn(
                      "block text-sm transition-all duration-200 py-1 px-2 rounded-md",
                      activeId === item.id
                        ? "text-primary font-medium bg-primary/10 border-l-2 border-primary"
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
