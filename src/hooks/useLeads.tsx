import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  article_url: string | null;
  created_at: string;
}

export interface LeadInsert {
  name: string;
  whatsapp: string;
  article_url?: string | null;
}

// Hook para admin buscar leads com paginação
export function useAdminLeads(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['admin-leads', page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        leads: data as Lead[],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
  });
}

// Hook para criar lead (público)
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lead: LeadInsert) => {
      console.log('Inserting lead:', lead);
      
      // Insert without returning data (anonymous users can't read leads)
      const { error } = await supabase
        .from('leads')
        .insert({
          name: lead.name,
          whatsapp: lead.whatsapp,
          article_url: lead.article_url ?? null,
        });

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      console.log('Lead inserted successfully');
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast.error('Erro ao salvar dados. Tente novamente.');
    },
  });
}
