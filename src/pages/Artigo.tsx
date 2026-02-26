import { useMemo } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import PostCardLarge from "@/components/PostCardLarge";
import ArticleTableOfContents from "@/components/ArticleTableOfContents";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import SocialShareButtons from "@/components/SocialShareButtons";
import ArticleContent from "@/components/ArticleContent";
import { usePostBySlug, useRelatedPosts, useAdminPosts } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function calculateReadingTime(htmlContent: string): number {
  const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent.split(' ').filter(word => word.length > 0).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

const Artigo = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const { isAdmin } = useAuth();
  
  const { data: publicPost, isLoading: publicLoading } = usePostBySlug(isPreview ? undefined : slug);
  const { data: adminPosts, isLoading: adminLoading } = useAdminPosts();
  
  const post = isPreview && isAdmin 
    ? adminPosts?.find(p => p.slug === slug) 
    : publicPost;
  const postLoading = isPreview ? adminLoading : publicLoading;
  
  const { data: relatedPosts } = useRelatedPosts(post?.id, post?.category, 3);

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

  if (isPreview && !isAdmin) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso restrito</h1>
          <p className="text-muted-foreground mb-6">Este conteúdo está disponível apenas para administradores.</p>
          <Link to="/cartas" className="btn-primary">Ver artigos publicados</Link>
        </div>
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

  const publishedDate = post.published_at
    ? format(new Date(post.published_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null;
  
  const updatedDate = post.updated_at
    ? format(new Date(post.updated_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null;

  const showUpdatedAt = post.show_updated_at && updatedDate && updatedDate !== publishedDate;

  return (
    <Layout>
      <ReadingProgressBar />
      
      <article className="container py-12">
        {isPreview && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
              ⚠️ Modo de pré-visualização - Este artigo ainda não foi publicado
            </p>
          </div>
        )}
        
        <Link to="/cartas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para Cartas
        </Link>

        <header className="max-w-3xl mb-12">
          <span className="category-pill mb-4 inline-block">{post.category}</span>
          <h1 className="article-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 leading-tight">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="text-lg md:text-xl text-muted-foreground font-serif italic mb-6">
              {post.subtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {publishedDate && (
              <span>
                Publicado em {publishedDate}
                {showUpdatedAt && ` • Atualizado em ${updatedDate}`}
              </span>
            )}
            {readingTime > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {readingTime} min de leitura
              </span>
            )}
          </div>
        </header>

        {post.cover_image && (
          <div className="relative aspect-[21/9] rounded-lg overflow-hidden mb-12 bg-card">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {post.body && <ArticleTableOfContents />}

        <div className="max-w-3xl mx-auto">
          {post.body && (
            <ArticleContent 
              htmlContent={post.body} 
              articleUrl={window.location.href} 
            />
          )}

          <SocialShareButtons title={post.title} url={window.location.href} />

          <div className="mt-8 flex justify-center">
            <a 
              href="https://chat.whatsapp.com/KzQL3AVRaVUGjdHFCnRBZk"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Entrar na comunidade
            </a>
          </div>
        </div>

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
