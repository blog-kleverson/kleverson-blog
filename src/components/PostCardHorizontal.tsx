import { Link } from "react-router-dom";
import type { Post } from "@/hooks/usePosts";

interface PostCardHorizontalProps {
  post: Post;
}

const PostCardHorizontal = ({ post }: PostCardHorizontalProps) => {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Link
      to={`/artigo/${post.slug}`}
      className="group flex gap-4 card-hover"
    >
      <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-card">
        <img
          src={post.cover_image || '/placeholder.svg'}
          alt={post.title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0"
          style={{ transition: "filter var(--transition-slow)" }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-primary uppercase tracking-wider">
          {post.category}
        </span>
        <h3 className="text-sm font-medium text-foreground mt-1 line-clamp-2 group-hover:text-primary" style={{ transition: "color var(--transition-fast)" }}>
          {post.title}
        </h3>
        {formattedDate && (
          <p className="text-xs text-muted-foreground mt-2">
            {formattedDate}
          </p>
        )}
      </div>
    </Link>
  );
};

export default PostCardHorizontal;
