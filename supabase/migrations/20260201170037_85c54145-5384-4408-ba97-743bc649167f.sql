-- Fazer uma alteração mínima para forçar reload completo do schema cache
-- Adicionar e remover um comentário da tabela força o PostgREST a recarregar

COMMENT ON COLUMN public.posts.show_updated_at IS 'Exibe data de atualização publicamente';

-- Forçar reload do schema cache
NOTIFY pgrst, 'reload schema';