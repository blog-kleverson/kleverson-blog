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
      // Validate required fields before sending
      if (!lead.name || lead.name.trim().length < 2) {
        throw new Error('Nome é obrigatório');
      }
      if (!lead.whatsapp || lead.whatsapp.trim().length < 10) {
        throw new Error('Número de WhatsApp é obrigatório');
      }

      const { data, error } = await supabase
        .from('leads')
        .insert({
          name: lead.name.trim(),
          whatsapp: lead.whatsapp.trim(),
          article_url: lead.article_url || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error saving lead:', error);
        throw new Error('Falha ao salvar no banco de dados');
      }
      
      if (!data) {
        throw new Error('Nenhum dado retornado após salvar');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
    },
    // Don't show toast here - let the component handle it for proper UX
  });
}
