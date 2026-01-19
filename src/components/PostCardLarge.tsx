import { Link } from "react-router-dom";
import type { Post } from "@/hooks/usePosts";

interface PostCardLargeProps {
  post: Post;
}

const PostCardLarge = ({ post }: PostCardLargeProps) => {
  const formattedDate = post.published_at 
    ? new Date(post.published_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Link
      to={`/artigo/${post.slug}`}
      className="group grid md:grid-cols-2 gap-6 card-hover bg-card rounded-lg overflow-hidden h-full"
    >
      <div className="order-2 md:order-1 p-6 flex flex-col justify-center">
        <span className="category-pill mb-3 self-start">
          {post.category}
        </span>
        <h3 className="article-title text-xl text-foreground mb-2 group-hover:text-primary" style={{ transition: "color var(--transition-fast)" }}>
          {post.title}
        </h3>
        {post.subtitle && (
          <p className="text-sm text-muted-foreground italic font-serif mb-3">
            {post.subtitle}
          </p>
        )}
        {post.description && (
          <p className="card-excerpt text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
            {post.description}
          </p>
        )}
        {formattedDate && (
          <p className="text-xs text-muted-foreground/60 mt-auto">
            {formattedDate}
          </p>
        )}
      </div>
      <div className="order-1 md:order-2 aspect-[4/3] md:aspect-auto overflow-hidden bg-secondary">
        <img
          src={post.cover_image || '/placeholder.svg'}
          alt={post.title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105"
          style={{ transition: "filter var(--transition-slow), transform var(--transition-slow)" }}
        />
      </div>
    </Link>
  );
};

export default PostCardLarge;
