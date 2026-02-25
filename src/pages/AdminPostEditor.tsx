import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminPosts, useCreatePost, useUpdatePost, Post, PostInsert } from '@/hooks/usePosts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Eye, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DEFAULT_CATEGORIES = ["Mente", "Espírito", "Físico", "Vocação"];

export default function AdminPostEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { data: posts } = useAdminPosts();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  // Always use default categories for the admin editor
  const categories = DEFAULT_CATEGORIES;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    body: '',
    cover_image: '',
    category: DEFAULT_CATEGORIES[0],
    status: 'draft' as Post['status'],
    featured: false,
    popular: false,
    scheduled_at: '',
    show_updated_at: false,
    published_at: null as Date | null,
    created_at: null as Date | null,
    meta_description: '',
    og_title: '',
    og_image: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!isNew && posts && id) {
      const post = posts.find(p => p.id === id);
      if (post) {
        setFormData({
          title: post.title,
          slug: post.slug,
          subtitle: post.subtitle || '',
          description: post.description || '',
          body: post.body || '',
          cover_image: post.cover_image || '',
          category: post.category,
          status: post.status,
          featured: post.featured,
          popular: post.popular,
          scheduled_at: post.scheduled_at ? post.scheduled_at.slice(0, 16) : '',
          show_updated_at: post.show_updated_at || false,
          published_at: post.published_at ? new Date(post.published_at) : null,
          created_at: post.created_at ? new Date(post.created_at) : null,
          meta_description: (post as any).meta_description || '',
          og_title: (post as any).og_title || '',
          og_image: (post as any).og_image || '',
        });
      }
    }
  }, [isNew, posts, id]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: isNew ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('O slug é obrigatório');
      return;
    }

    if (!formData.category) {
      toast.error('A categoria é obrigatória');
      return;
    }

    if (formData.status === 'scheduled' && !formData.scheduled_at) {
      toast.error('Selecione uma data para agendamento');
      return;
    }

    setIsSaving(true);

    try {
      // Get existing post to check if it was already published
      const existingPost = !isNew && posts ? posts.find(p => p.id === id) : null;
      const wasAlreadyPublished = existingPost?.published_at;
      
      // Determine published_at value
      let publishedAtValue: string | null = null;
      if (formData.status === 'published') {
        if (formData.published_at) {
          // Use manually set date
          publishedAtValue = formData.published_at.toISOString();
        } else if (wasAlreadyPublished) {
          // Keep existing date
          publishedAtValue = wasAlreadyPublished;
        } else {
          // New publish, use current date
          publishedAtValue = new Date().toISOString();
        }
      }

      const postData: PostInsert = {
        title: formData.title,
        slug: formData.slug,
        subtitle: formData.subtitle || null,
        description: formData.description || null,
        body: formData.body || null,
        cover_image: formData.cover_image || null,
        category: formData.category,
        status: formData.status,
        featured: formData.featured,
        popular: formData.popular,
        show_updated_at: formData.show_updated_at,
        scheduled_at: formData.status === 'scheduled' && formData.scheduled_at 
          ? new Date(formData.scheduled_at).toISOString() 
          : null,
        published_at: publishedAtValue,
        author_id: user?.id || null,
        meta_description: formData.meta_description || null,
        og_title: formData.og_title || null,
        og_image: formData.og_image || null,
      };

      if (isNew) {
        await createPost.mutateAsync(postData);
      } else {
        await updatePost.mutateAsync({ id: id!, updates: postData });
      }

      navigate('/admin');
    } catch (error) {
      // Error is already handled by the mutation hooks
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-bold text-foreground">
              {isNew ? 'Novo Post' : 'Editar Post'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/artigo/${formData.slug}`, '_blank')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Visualizar
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-accent hover:bg-accent/90"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Conteúdo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Digite o título do post"
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-do-post"
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL: /artigo/{formData.slug || 'url-do-post'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtítulo</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Subtítulo do post"
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Breve descrição do post (exibida nos cards)"
                    rows={3}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Corpo do artigo (HTML)</Label>
                  <Textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="<p>Conteúdo do artigo em HTML...</p>"
                    rows={15}
                    className="bg-background/50 font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Publicação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Post['status']) => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.status === 'scheduled' && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_at">Data de agendamento</Label>
                    <Input
                      id="scheduled_at"
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                      className="bg-background/50"
                    />
                  </div>
                )}

                {formData.status === 'published' && (
                  <div className="space-y-2">
                    <Label>Data de publicação</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background/50",
                            !formData.published_at && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.published_at ? (
                            format(formData.published_at, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecionar data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.published_at || undefined}
                          onSelect={(date) => setFormData(prev => ({ ...prev, published_at: date || null }))}
                          initialFocus
                          className="p-3 pointer-events-auto"
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">
                      Data exibida publicamente no artigo
                    </p>
                  </div>
                )}

                {!isNew && formData.created_at && (
                  <div className="space-y-2">
                    <Label>Data de criação</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-background/50"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(formData.created_at, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.created_at || undefined}
                          onSelect={(date) => setFormData(prev => ({ ...prev, created_at: date || null }))}
                          initialFocus
                          className="p-3 pointer-events-auto"
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">
                      Data interna de criação do post
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Imagem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cover_image">URL da imagem de capa</Label>
                  <Input
                    id="cover_image"
                    value={formData.cover_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                    placeholder="/images/post.jpg"
                    className="bg-background/50"
                  />
                </div>
                {formData.cover_image && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={formData.cover_image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="Descrição para mecanismos de busca (máx. 160 caracteres)"
                    rows={3}
                    className="bg-background/50"
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.meta_description.length}/160 caracteres
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og_title">OG Title</Label>
                  <Input
                    id="og_title"
                    value={formData.og_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, og_title: e.target.value }))}
                    placeholder="Título para redes sociais (padrão: título do post)"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og_image">OG Image URL</Label>
                  <Input
                    id="og_image"
                    value={formData.og_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, og_image: e.target.value }))}
                    placeholder="URL da imagem para redes sociais"
                    className="bg-background/50"
                  />
                  {formData.og_image && (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden max-w-[200px]">
                      <img
                        src={formData.og_image}
                        alt="OG Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Destaque</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="featured">Post em destaque</Label>
                    <p className="text-xs text-muted-foreground">Exibido no hero da home</p>
                  </div>
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, featured: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="popular">Post popular</Label>
                    <p className="text-xs text-muted-foreground">Exibido na seção populares</p>
                  </div>
                  <Switch
                    id="popular"
                    checked={formData.popular}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, popular: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_updated_at">Mostrar data de atualização</Label>
                    <p className="text-xs text-muted-foreground">Exibe "Atualizado em" no artigo</p>
                  </div>
                  <Switch
                    id="show_updated_at"
                    checked={formData.show_updated_at || false}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, show_updated_at: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>
    </div>
  );
}
