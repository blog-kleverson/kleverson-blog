import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import PostCardLarge from "@/components/PostCardLarge";
import WhatsAppLeadModal from "@/components/WhatsAppLeadModal";
import ArticleTableOfContents from "@/components/ArticleTableOfContents";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import SocialShareButtons from "@/components/SocialShareButtons";
import { usePostBySlug, useRelatedPosts } from "@/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";

function calculateReadingTime(htmlContent: string): number {
  const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent.split(' ').filter(word => word.length > 0).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

const Artigo = () => {
  const { slug } = useParams();
  const { data: post, isLoading: postLoading } = usePostBySlug(slug);
  const { data: relatedPosts, isLoading: relatedLoading } = useRelatedPosts(post?.id, post?.category, 3);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const readingTime = useMemo(() => post?.body ? calculateReadingTime(post.body) : 0, [post?.body]);

  if (postLoading) {
    return (
      <Layout>
        <article className="container py-12">
          <Skeleton className="h-6 w-40 mb-8" />
          <header className="max-w-3xl mb-12 space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
          </header>
          <Skeleton className="aspect-[21/9] rounded-lg mb-12" />
        </article>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Artigo não encontrado</h1>
          <Link to="/cartas" className="btn-primary">Ver todos os artigos</Link>
        </div>
      </Layout>
    );
  }

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  return (
    <Layout>
      <ReadingProgressBar />
      <article className="container py-12">
        <Link to="/cartas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para Cartas
        </Link>

        <header className="max-w-3xl mb-12">
          <span className="category-pill mb-4 inline-block">{post.category}</span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">{post.title}</h1>
          {post.subtitle && <p className="text-lg md:text-xl text-muted-foreground font-serif italic mb-6">{post.subtitle}</p>}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {formattedDate && <span>{formattedDate}</span>}
            {readingTime > 0 && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{readingTime} min de leitura</span>}
          </div>
        </header>

        {post.cover_image && (
          <div className="relative aspect-[21/9] rounded-lg overflow-hidden mb-12 bg-card">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {post.body && <ArticleTableOfContents />}

        <div className="max-w-3xl mx-auto">
          {post.body && <div className="prose-article article-body" dangerouslySetInnerHTML={{ __html: post.body }} />}

          <SocialShareButtons title={post.title} url={window.location.href} />

          <div className="mt-8 p-8 glass rounded-lg text-center">
            <MessageCircle className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Participe de minha comunidade privada</h3>
            <p className="text-muted-foreground mb-4">Acesso direto a conversas sobre os temas das cartas + networking com jovens que pensam como você + conteúdos exclusivos que só compartilhamos no grupo.</p>
            <p className="text-muted-foreground mb-6">Ao entrar, você terá acesso a conteúdos exclusivos e discussões profundas sobre os temas das cartas.</p>
            <button className="btn-primary" onClick={() => setShowWhatsAppModal(true)}>Entrar agora!</button>
          </div>
        </div>

        <WhatsAppLeadModal open={showWhatsAppModal} onOpenChange={setShowWhatsAppModal} />

        {relatedPosts && relatedPosts.length > 0 && (
          <section className="mt-20">
            <h2 className="section-title">Artigos Relacionados</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => <PostCardLarge key={relatedPost.id} post={relatedPost} />)}
            </div>
          </section>
        )}
      </article>
    </Layout>
  );
};

export default Artigo;
