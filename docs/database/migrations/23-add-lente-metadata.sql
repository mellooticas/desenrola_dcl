
-- ============================================================
-- MIGRATION: Adicionar SNAPSHOT de Metadados da Lente
-- ============================================================
-- Objetivo: Salvar o nome e slug da lente no momento da venda
-- para evitar queries complexas no Kanban e garantir histórico.
-- ============================================================

ALTER TABLE public.pedidos
ADD COLUMN IF NOT EXISTS lente_nome_snapshot TEXT,
ADD COLUMN IF NOT EXISTS lente_slug_snapshot TEXT;

COMMENT ON COLUMN public.pedidos.lente_nome_snapshot IS 'Nome da lente no momento da venda (Snapshot do Catálogo)';
COMMENT ON COLUMN public.pedidos.lente_slug_snapshot IS 'Slug da lente no momento da venda (Snapshot do Catálogo)';
