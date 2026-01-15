-- ============================================================
-- MIGRAÇÃO SIMPLIFICADA 1: Adicionar Campos de Lentes
-- Data: 20/12/2025
-- Versão: SAFE - Sem BEGIN/COMMIT para evitar rollback
-- ============================================================

-- Adicionar campos um por um
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS grupo_canonico_id UUID;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS lente_selecionada_id UUID;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS fornecedor_lente_id UUID;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS preco_lente DECIMAL(10,2);
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS custo_lente DECIMAL(10,2);
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS margem_lente_percentual DECIMAL(5,2);
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS nome_lente TEXT;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS nome_grupo_canonico TEXT;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS tratamentos_lente JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS selecao_automatica BOOLEAN DEFAULT false;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS lente_metadata JSONB DEFAULT '{}'::jsonb;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_pedidos_lente_selecionada ON public.pedidos(lente_selecionada_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_fornecedor_lente ON public.pedidos(fornecedor_lente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_grupo_canonico ON public.pedidos(grupo_canonico_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_selecao_automatica ON public.pedidos(selecao_automatica) WHERE selecao_automatica = true;
CREATE INDEX IF NOT EXISTS idx_pedidos_tratamentos_lente ON public.pedidos USING gin(tratamentos_lente);

-- Trigger de cálculo de margem
CREATE OR REPLACE FUNCTION calcular_margem_lente()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.preco_lente IS NOT NULL AND NEW.custo_lente IS NOT NULL AND NEW.custo_lente > 0 THEN
    NEW.margem_lente_percentual := ROUND(((NEW.preco_lente - NEW.custo_lente) / NEW.custo_lente * 100)::numeric, 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_margem_lente ON public.pedidos;

CREATE TRIGGER trigger_calcular_margem_lente
  BEFORE INSERT OR UPDATE OF preco_lente, custo_lente
  ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_margem_lente();

-- Comentários
COMMENT ON COLUMN public.pedidos.lente_selecionada_id IS 'UUID da lente escolhida do catálogo Best Lens';
COMMENT ON COLUMN public.pedidos.fornecedor_lente_id IS 'UUID do fornecedor da lente no catálogo Best Lens';
