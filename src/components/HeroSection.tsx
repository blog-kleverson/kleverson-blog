import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useFeaturedPost } from "@/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";

const HeroSection = () => {
  const { data: featuredPost, isLoading } = useFeaturedPost();

  if (isLoading) {
    return (
      <section className="relative overflow-hidden">
        <div className="container py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1 space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-48" />
            </div>
            <div className="order-1 md:order-2">
              <Skeleton className="aspect-[4/3] rounded-lg" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredPost) return null;

  return (
    <section className="relative overflow-hidden">
      <div className="container py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="order-2 md:order-1 animate-fade-in-up">
            <span className="category-pill mb-4 inline-block">
              {featuredPost.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 text-foreground">
              {featuredPost.title}
            </h1>
            {featuredPost.subtitle && (
              <p className="text-lg text-muted-foreground mb-6 font-serif italic">
                {featuredPost.subtitle}
              </p>
            )}
            {featuredPost.description && (
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {featuredPost.description}
              </p>
            )}
            <Link
              to={`/artigo/${featuredPost.slug}`}
              className="btn-primary group"
            >
              LEIA AS ÚLTIMAS CARTAS
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1" style={{ transition: "transform var(--transition-fast)" }} />
            </Link>
          </div>

          <div 
            className="order-1 md:order-2 animate-slide-in-right"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-card">
              <img
                src={featuredPost.cover_image || '/placeholder.svg'}
                alt={featuredPost.title}
                className="w-full h-full object-cover grayscale hover:grayscale-0"
                style={{ transition: "filter var(--transition-slow)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
