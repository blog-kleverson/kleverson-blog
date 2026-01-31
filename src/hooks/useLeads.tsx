import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  article_url: string | null;
  created_at: string;
}

export interface CreateLeadInput {
  name: string;
  whatsapp: string;
  article_url?: string | null;
}

// Hook for admins to fetch leads with pagination
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

// Hook for public lead creation
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateLeadInput) => {
      const { error } = await supabase
        .from('leads')
        .insert({
          name: input.name,
          whatsapp: input.whatsapp,
          article_url: input.article_url ?? null,
        });

      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
    },
  });
}
