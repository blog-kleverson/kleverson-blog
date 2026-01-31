import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Post {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  body: string | null;
  cover_image: string | null;
  category: string;
  status: 'draft' | 'scheduled' | 'published';
  featured: boolean;
  popular: boolean;
  show_updated_at: boolean;
  scheduled_at: string | null;
  published_at: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export type PostInsert = Omit<Post, 'id' | 'created_at' | 'updated_at'> & {
  show_updated_at?: boolean;
};
export type PostUpdate = Partial<PostInsert>;

// Hook para buscar posts públicos (publicados)
export function usePublicPosts() {
  return useQuery({
    queryKey: ['public-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data as Post[];
    },
  });
}

// Hook para buscar post em destaque
export function useFeaturedPost() {
  return useQuery({
    queryKey: ['featured-post'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Post | null;
    },
  });
}

// Hook para buscar posts populares
export function usePopularPosts(limit = 4) {
  return useQuery({
    queryKey: ['popular-posts', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .eq('popular', true)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Post[];
    },
  });
}

// Hook para buscar posts recentes
export function useRecentPosts(limit = 6) {
  return useQuery({
    queryKey: ['recent-posts', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Post[];
    },
  });
}

// Hook para buscar posts relacionados (mesma categoria, excluindo o atual)
export function useRelatedPosts(postId: string | undefined, category: string | undefined, limit = 3) {
  return useQuery({
    queryKey: ['related-posts', postId, category, limit],
    queryFn: async () => {
      if (!postId || !category) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .eq('category', category)
        .neq('id', postId)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Post[];
    },
    enabled: !!postId && !!category,
  });
}

// Hook para buscar categorias únicas dos posts publicados
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('category')
        .eq('status', 'published');

      if (error) throw error;
      
      const uniqueCategories = [...new Set(data.map(p => p.category))];
      return uniqueCategories;
    },
  });
}

// Hook para buscar todos os posts (admin)
export function useAdminPosts() {
  return useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Post[];
    },
  });
}

// Hook para buscar um post por slug
export function usePostBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      return data as Post | null;
    },
    enabled: !!slug,
  });
}

// Hook para criar post
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: PostInsert) => {
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single();

      if (error) throw error;
      return data as Post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['public-posts'] });
      queryClient.invalidateQueries({ queryKey: ['featured-post'] });
      queryClient.invalidateQueries({ queryKey: ['popular-posts'] });
      queryClient.invalidateQueries({ queryKey: ['recent-posts'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Post criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar post: ' + error.message);
    },
  });
}

// Hook para atualizar post
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PostUpdate }) => {
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Post;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['public-posts'] });
      queryClient.invalidateQueries({ queryKey: ['featured-post'] });
      queryClient.invalidateQueries({ queryKey: ['popular-posts'] });
      queryClient.invalidateQueries({ queryKey: ['recent-posts'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['post', data.slug] });
      toast.success('Post atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar post: ' + error.message);
    },
  });
}

// Hook para deletar post
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['public-posts'] });
      queryClient.invalidateQueries({ queryKey: ['featured-post'] });
      queryClient.invalidateQueries({ queryKey: ['popular-posts'] });
      queryClient.invalidateQueries({ queryKey: ['recent-posts'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Post deletado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao deletar post: ' + error.message);
    },
  });
}
