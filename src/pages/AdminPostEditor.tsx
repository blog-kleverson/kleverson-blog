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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Eye } from 'lucide-react';

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
        scheduled_at: formData.status === 'scheduled' && formData.scheduled_at 
          ? new Date(formData.scheduled_at).toISOString() 
          : null,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
        author_id: user?.id || null,
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
                    <Label htmlFor="scheduled_at">Data de publicação</Label>
                    <Input
                      id="scheduled_at"
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                      className="bg-background/50"
                    />
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
                    checked={(formData as any).show_updated_at || false}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, popular: checked }))
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
