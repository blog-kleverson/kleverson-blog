import { usePopularPosts } from "@/hooks/usePosts";
import PostCardHorizontal from "./PostCardHorizontal";
import { Skeleton } from "@/components/ui/skeleton";

const PopularPosts = () => {
  const { data: popularPosts, isLoading } = usePopularPosts(4);

  if (isLoading) {
    return (
      <section className="container py-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex gap-4">
              <Skeleton className="w-24 h-24 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!popularPosts || popularPosts.length === 0) return null;

  return (
    <section className="container py-12">
      <h2 className="section-title">Mais Populares</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {popularPosts.map((post, index) => (
          <div
            key={post.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PostCardHorizontal post={post} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularPosts;
