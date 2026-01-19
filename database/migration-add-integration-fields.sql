-- ============================================================================
-- MIGRATION: Adicionar Campos de Integração em Pedidos
-- Data: 17/01/2026
-- Objetivo: Vincular pedidos com vendas (sis_vendas) e armações (crm_erp)
-- ============================================================================

-- IMPORTANTE: Execute este SQL no Supabase Dashboard do DESENROLA_DCL
-- SQL Editor → New Query → Cole e Execute

BEGIN;

-- ============================================================================
-- 1. ADICIONAR NOVOS CAMPOS NA TABELA PEDIDOS
-- ============================================================================

ALTER TABLE public.pedidos 
  ADD COLUMN IF NOT EXISTS venda_id UUID,
  ADD COLUMN IF NOT EXISTS cliente_id UUID,
  ADD COLUMN IF NOT EXISTS armacao_id UUID;

-- ============================================================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_pedidos_venda_id 
  ON public.pedidos(venda_id)
  WHERE venda_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id 
  ON public.pedidos(cliente_id)
  WHERE cliente_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pedidos_armacao_id 
  ON public.pedidos(armacao_id)
  WHERE armacao_id IS NOT NULL;

-- ============================================================================
-- 3. ADICIONAR COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON COLUMN public.pedidos.venda_id IS 
  'UUID da venda no sis_vendas. Preencher quando pedido for criado a partir de uma venda no PDV. NULL = pedido criado manualmente no desenrola_dcl.';

COMMENT ON COLUMN public.pedidos.cliente_id IS 
  'UUID universal do cliente (core.clientes). Presente em todos os 4 bancos. Usar este campo para integração com app de marketing e jornada do cliente.';

COMMENT ON COLUMN public.pedidos.armacao_id IS 
  'UUID do produto armação no crm_erp (banco SIS_Estoque). NULL = pedido sem armação (reparos, apenas lentes). Este campo NÃO dá baixa em estoque, apenas referência.';

-- ============================================================================
-- 4. ADICIONAR CONSTRAINT DE CHECK (OPCIONAL - DADOS CONSISTENTES)
-- ============================================================================

-- Garantir que se tem venda_id, também tem cliente_id
ALTER TABLE public.pedidos
  ADD CONSTRAINT check_venda_tem_cliente 
  CHECK (
    (venda_id IS NULL) OR 
    (venda_id IS NOT NULL AND cliente_id IS NOT NULL)
  );

COMMENT ON CONSTRAINT check_venda_tem_cliente ON public.pedidos IS
  'Constraint: Se pedido tem venda_id, DEVE ter cliente_id preenchido.';

-- ============================================================================
-- 5. CRIAR VIEW AUXILIAR - PEDIDOS COM DADOS ENRIQUECIDOS
-- ============================================================================

CREATE OR REPLACE VIEW public.v_pedidos_completo AS
SELECT 
  p.*,
  -- Indica se pedido veio do PDV ou foi criado manualmente
  CASE 
    WHEN p.venda_id IS NOT NULL THEN 'pdv'
    ELSE 'manual'
  END as origem_pedido,
  
  -- Indica se tem armação vinculada
  CASE 
    WHEN p.armacao_id IS NOT NULL THEN true
    ELSE false
  END as tem_armacao
  
FROM public.pedidos p;

COMMENT ON VIEW public.v_pedidos_completo IS
  'View enriquecida de pedidos com campos calculados: origem_pedido (pdv/manual) e tem_armacao (boolean).';

-- ============================================================================
-- 6. ATUALIZAR RLS POLICIES (SE NECESSÁRIO)
-- ============================================================================

-- As policies existentes já cobrem os novos campos
-- Nenhuma alteração necessária

-- ============================================================================
-- 7. VERIFICAR INSTALAÇÃO
-- ============================================================================

-- Deve retornar 3 linhas (venda_id, cliente_id, armacao_id)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'pedidos'
  AND column_name IN ('venda_id', 'cliente_id', 'armacao_id')
ORDER BY column_name;


| column_name | data_type | is_nullable | column_default |
| ----------- | --------- | ----------- | -------------- |
| armacao_id  | uuid      | YES         | null           |
| cliente_id  | uuid      | YES         | null           |
| venda_id    | uuid      | YES         | null           |

-- Deve retornar 3 linhas (índices criados)
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'pedidos'
  AND indexname LIKE 'idx_pedidos_%_id'
ORDER BY indexname;


| indexname                          | indexdef                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| idx_pedidos_classe_lente_id        | CREATE INDEX idx_pedidos_classe_lente_id ON public.pedidos USING btree (classe_lente_id)               |
| idx_pedidos_fornecedor_catalogo_id | CREATE INDEX idx_pedidos_fornecedor_catalogo_id ON public.pedidos USING btree (fornecedor_catalogo_id) |
| idx_pedidos_laboratorio_id         | CREATE INDEX idx_pedidos_laboratorio_id ON public.pedidos USING btree (laboratorio_id)                 |
| idx_pedidos_lente_catalogo_id      | CREATE INDEX idx_pedidos_lente_catalogo_id ON public.pedidos USING btree (lente_catalogo_id)           |
| idx_pedidos_loja_id                | CREATE INDEX idx_pedidos_loja_id ON public.pedidos USING btree (loja_id)                               |

COMMIT;

-- ============================================================================
-- ✅ MIGRATION CONCLUÍDA!
-- ============================================================================

-- Próximos Passos:
-- 1. Execute este SQL no Supabase Dashboard
-- 2. Verifique que as 2 queries de verificação retornaram dados corretos
-- 3. Teste criar um pedido com os novos campos preenchidos
-- 4. Avance para criar a API de produtos (crm_erp)

-- ============================================================================
-- ROLLBACK (SE NECESSÁRIO)
-- ============================================================================

-- Em caso de erro, execute este bloco para reverter:
/*
BEGIN;

DROP VIEW IF EXISTS public.v_pedidos_completo;
ALTER TABLE public.pedidos DROP CONSTRAINT IF EXISTS check_venda_tem_cliente;
DROP INDEX IF EXISTS public.idx_pedidos_armacao_id;
DROP INDEX IF EXISTS public.idx_pedidos_cliente_id;
DROP INDEX IF EXISTS public.idx_pedidos_venda_id;
ALTER TABLE public.pedidos DROP COLUMN IF EXISTS armacao_id;
ALTER TABLE public.pedidos DROP COLUMN IF EXISTS cliente_id;
ALTER TABLE public.pedidos DROP COLUMN IF EXISTS venda_id;

COMMIT;
*/
