import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import PostCardLarge from "@/components/PostCardLarge";
import { usePublicPosts, useCategories } from "@/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";

const Cartas = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("categoria");
  
  const { data: posts, isLoading: postsLoading } = usePublicPosts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return activeCategory
      ? posts.filter((post) => post.category === activeCategory)
      : posts;
  }, [posts, activeCategory]);

  const handleCategoryClick = (category: string | null) => {
    if (category) {
      setSearchParams({ categoria: category });
    } else {
      setSearchParams({});
    }
  };

  const isLoading = postsLoading || categoriesLoading;

  return (
    <Layout>
      <div className="container py-12">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Cartas
          </h1>
          <p className="page-description text-muted-foreground max-w-2xl">
            Reflexões, estratégias e insights para ajudar você a alcançar 
            seu potencial máximo em todas as áreas da vida.
          </p>
        </div>

        {/* Functional Filters */}
        {isLoading ? (
          <div className="flex flex-wrap gap-3 mb-8">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`text-xs uppercase tracking-wider px-3 py-1 rounded-full ${
                !activeCategory
                  ? "category-pill bg-primary/20"
                  : "text-muted-foreground hover:text-primary border border-border hover:border-primary/50"
              }`}
              style={{ transition: "color var(--transition-fast), border-color var(--transition-fast)" }}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`text-xs uppercase tracking-wider px-3 py-1 rounded-full ${
                  activeCategory === category
                    ? "category-pill bg-primary/20"
                    : "text-muted-foreground hover:text-primary border border-border hover:border-primary/50"
                }`}
                style={{ transition: "color var(--transition-fast), border-color var(--transition-fast)" }}
              >
                {category}
              </button>
            ))}
          </div>
        ) : null}

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="grid md:grid-cols-2 gap-6 bg-card rounded-lg overflow-hidden">
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="aspect-[4/3] md:aspect-auto" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            Nenhum artigo encontrado{activeCategory ? " nesta categoria" : ""}.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredPosts.map((post, index) => (
              <div
                key={post.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PostCardLarge post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cartas;
