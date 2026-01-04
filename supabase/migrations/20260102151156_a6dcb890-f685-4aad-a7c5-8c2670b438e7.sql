-- Criar tabela de leads
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Políticas para LEADS
-- Qualquer pessoa pode inserir (visitantes do site)
CREATE POLICY "Qualquer pessoa pode criar leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

-- Apenas admins podem visualizar leads
CREATE POLICY "Admins podem ver todos os leads"
  ON public.leads FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Admins podem deletar leads
CREATE POLICY "Admins podem deletar leads"
  ON public.leads FOR DELETE
  USING (has_role(auth.uid(), 'admin'));