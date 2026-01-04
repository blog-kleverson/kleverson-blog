import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useRecentPosts } from "@/hooks/usePosts";
import PostCardLarge from "./PostCardLarge";
import { Skeleton } from "@/components/ui/skeleton";

const RecentPosts = () => {
  const { data: recentPosts, isLoading } = useRecentPosts(6);

  if (isLoading) {
    return (
      <section className="container py-12">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-20" />
        </div>
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
      </section>
    );
  }

  if (!recentPosts || recentPosts.length === 0) return null;

  return (
    <section className="container py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title mb-0">Mais Recentes</h2>
        <Link
          to="/cartas"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 group"
          style={{ transition: "color var(--transition-fast)" }}
        >
          Ver Tudo
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1" style={{ transition: "transform var(--transition-fast)" }} />
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {recentPosts.map((post, index) => (
          <div
            key={post.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PostCardLarge post={post} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentPosts;
