import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { usePublicPosts } from "@/hooks/usePosts";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: posts, isLoading } = usePublicPosts();

  const filteredPosts = useMemo(() => {
    if (!posts || !query) return [];
    const lowerQuery = query.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowerQuery) ||
        (post.description && post.description.toLowerCase().includes(lowerQuery)) ||
        post.category.toLowerCase().includes(lowerQuery)
    );
  }, [posts, query]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-lg shadow-xl animate-scale-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar artigos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-lg"
          />
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : query.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Digite para buscar artigos...
            </p>
          ) : filteredPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum resultado encontrado para "{query}"
            </p>
          ) : (
            <div className="space-y-1">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/artigo/${post.slug}`}
                  onClick={onClose}
                  className="flex items-start gap-4 p-3 rounded-md hover:bg-muted/50"
                  style={{ transition: "background var(--transition-fast)" }}
                >
                  <img
                    src={post.cover_image || '/placeholder.svg'}
                    alt={post.title}
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-primary uppercase tracking-wider">
                      {post.category}
                    </span>
                    <h4 className="text-foreground font-medium truncate">
                      {post.title}
                    </h4>
                    {post.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {post.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
