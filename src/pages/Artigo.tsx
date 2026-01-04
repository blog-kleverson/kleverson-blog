import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Layout from "@/components/Layout";
import PostCardLarge from "@/components/PostCardLarge";
import WhatsAppLeadModal from "@/components/WhatsAppLeadModal";
import ArticleTableOfContents from "@/components/ArticleTableOfContents";
import { usePostBySlug, useRelatedPosts } from "@/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";

const Artigo = () => {
  const { slug } = useParams();
  const { data: post, isLoading: postLoading } = usePostBySlug(slug);
  const { data: relatedPosts, isLoading: relatedLoading } = useRelatedPosts(
    post?.id,
    post?.category,
    3
  );
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  if (postLoading) {
    return (
      <Layout>
        <article className="container py-12">
          <Skeleton className="h-6 w-40 mb-8" />
          <header className="max-w-3xl mb-12 space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-32" />
          </header>
          <Skeleton className="aspect-[21/9] rounded-lg mb-12" />
          <div className="max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </article>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Artigo não encontrado
          </h1>
          <Link to="/cartas" className="btn-primary">
            Ver todos os artigos
          </Link>
        </div>
      </Layout>
    );
  }

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Layout>
      <article className="container py-12">
        {/* Back Link */}
        <Link
          to="/cartas"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 group"
          style={{ transition: "color var(--transition-fast)" }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1" style={{ transition: "transform var(--transition-fast)" }} />
          Voltar para Cartas
        </Link>

        {/* Header */}
        <header className="max-w-3xl mb-12">
          <span className="category-pill mb-4 inline-block">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="text-xl text-muted-foreground font-serif italic mb-6">
              {post.subtitle}
            </p>
          )}
          {formattedDate && (
            <p className="text-sm text-muted-foreground">
              {formattedDate}
            </p>
          )}
        </header>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="relative aspect-[21/9] rounded-lg overflow-hidden mb-12 bg-card">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Table of Contents Sidebar */}
        {post.body && <ArticleTableOfContents />}

        {/* Article Body */}
        <div className="max-w-3xl mx-auto">
          {post.body && (
            <div
              className="prose-article article-body"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          )}

          {/* WhatsApp CTA */}
          <div className="mt-16 p-8 glass rounded-lg text-center">
            <MessageCircle className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Quer conversar sobre este tema?
            </h3>
            <p className="text-muted-foreground mb-6">
              Entre em contato pelo WhatsApp para uma conversa personalizada.
            </p>
            <button 
              className="btn-primary"
              onClick={() => setShowWhatsAppModal(true)}
            >
              Chamar no WhatsApp
            </button>
          </div>
        </div>

        {/* WhatsApp Lead Modal */}
        <WhatsAppLeadModal 
          open={showWhatsAppModal} 
          onOpenChange={setShowWhatsAppModal} 
        />

        {/* Related Articles */}
        {relatedLoading ? (
          <section className="mt-20">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="grid md:grid-cols-2 gap-6 bg-card rounded-lg overflow-hidden">
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="aspect-[4/3] md:aspect-auto" />
                </div>
              ))}
            </div>
          </section>
        ) : relatedPosts && relatedPosts.length > 0 ? (
          <section className="mt-20">
            <h2 className="section-title">Artigos Relacionados</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <PostCardLarge key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </Layout>
  );
};

export default Artigo;
