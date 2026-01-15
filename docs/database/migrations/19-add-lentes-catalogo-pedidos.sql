-- ============================================================
-- MIGRATION: Adicionar Lentes do Catálogo aos Pedidos
-- ============================================================
-- Este script prepara a tabela de pedidos para receber os IDs
-- do novo catálogo de lentes (Best Lens).
--
-- CONTEXTO: Tabela pedidos no schema PUBLIC (conforme orientado)
--           Tabela lentes no schema lens_catalog
-- ============================================================

-- 1. Adicionar colunas de referência na tabela public.pedidos
ALTER TABLE public.pedidos
ADD COLUMN IF NOT EXISTS grupo_canonico_id UUID REFERENCES lens_catalog.grupos_canonicos(id),
ADD COLUMN IF NOT EXISTS lente_id UUID REFERENCES lens_catalog.lentes(id);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pedidos_grupo_canonico ON public.pedidos(grupo_canonico_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_lente ON public.pedidos(lente_id);

-- 3. Documentar as colunas
COMMENT ON COLUMN public.pedidos.grupo_canonico_id IS 'Referência ao grupo de lentes do novo catálogo (Catálogo Best Lens)';
COMMENT ON COLUMN public.pedidos.lente_id IS 'Referência à lente específica selecionada (SKU exato)';

-- 4. Verificar atualização
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'pedidos' 
  AND column_name IN ('grupo_canonico_id', 'lente_id');
