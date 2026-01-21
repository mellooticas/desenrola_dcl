-- ============================================================
-- MIGRAÇÃO: Adicionar campos para pedidos multimodais
-- ============================================================
-- OBJETIVO: Suportar LENTES, ARMACAO, COMPLETO, SERVICO
-- DATA: 20/01/2026
-- ============================================================

-- PASSO 1: Adicionar enum tipo_pedido (se não existir)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_pedido_enum') THEN
    CREATE TYPE tipo_pedido_enum AS ENUM (
      'LENTES', 
      'ARMACAO', 
      'COMPLETO', 
      'SERVICO', 
      'LENTE_AVULSA'
    );
    RAISE NOTICE '✅ Enum tipo_pedido_enum criado';
  ELSE
    RAISE NOTICE '⚠️ Enum tipo_pedido_enum já existe';
  END IF;
END $$;

-- PASSO 2: Adicionar colunas na tabela pedidos
-- ============================================================

-- Tipo de pedido
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS tipo_pedido tipo_pedido_enum DEFAULT 'COMPLETO';

-- Armação (produtos do CRM_ERP)
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS armacao_id UUID;

ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS origem_armacao TEXT CHECK (origem_armacao IN ('estoque', 'cliente_trouxe'));

-- Lentes (sis_lens)
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS lente_selecionada_id UUID;

ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS grupo_canonico_id UUID;

ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS fornecedor_lente_id UUID;

-- SLA e prazos
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS prazo_laboratorio_dias INTEGER DEFAULT 7;

ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS margem_cliente_dias INTEGER DEFAULT 2;

-- Serviços
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS tipo_servico TEXT;

-- Número OS gerado automaticamente
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS numero_os_automatico TEXT;

-- Verificar colunas criadas
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name IN (
    'tipo_pedido', 'armacao_id', 'origem_armacao',
    'lente_selecionada_id', 'grupo_canonico_id', 'fornecedor_lente_id',
    'prazo_laboratorio_dias', 'margem_cliente_dias',
    'tipo_servico', 'numero_os_automatico'
  )
ORDER BY column_name;

-- PASSO 3: Criar índices para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_pedidos_tipo_pedido 
  ON pedidos(tipo_pedido);

CREATE INDEX IF NOT EXISTS idx_pedidos_armacao_id 
  ON pedidos(armacao_id) 
  WHERE armacao_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pedidos_lente_selecionada_id 
  ON pedidos(lente_selecionada_id) 
  WHERE lente_selecionada_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pedidos_grupo_canonico_id 
  ON pedidos(grupo_canonico_id) 
  WHERE grupo_canonico_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pedidos_fornecedor_lente_id 
  ON pedidos(fornecedor_lente_id) 
  WHERE fornecedor_lente_id IS NOT NULL;

-- PASSO 4: Atualizar pedidos existentes (opcional)
-- ============================================================
-- Define tipo_pedido dos pedidos existentes como COMPLETO por padrão
UPDATE pedidos 
SET tipo_pedido = 'COMPLETO'
WHERE tipo_pedido IS NULL;

-- PASSO 5: Comentários para documentação
-- ============================================================
COMMENT ON COLUMN pedidos.tipo_pedido IS 
  'Tipo do pedido: LENTES (só lentes), ARMACAO (só armação), COMPLETO (lentes+armação), SERVICO (ajuste/reparo), LENTE_AVULSA';

COMMENT ON COLUMN pedidos.armacao_id IS 
  'ID do produto de armação no CRM_ERP. NULL se tipo_pedido=LENTES ou SERVICO';

COMMENT ON COLUMN pedidos.origem_armacao IS 
  'Origem da armação: estoque (nossa loja) ou cliente_trouxe (cliente forneceu)';

COMMENT ON COLUMN pedidos.lente_selecionada_id IS 
  'ID da lente específica escolhida do sis_lens.lentes';

COMMENT ON COLUMN pedidos.grupo_canonico_id IS 
  'ID do grupo canônico no sis_lens (para buscar outras opções de fornecedor)';

COMMENT ON COLUMN pedidos.fornecedor_lente_id IS 
  'ID do fornecedor/laboratório escolhido para a lente (sis_lens.fornecedores)';

COMMENT ON COLUMN pedidos.tipo_servico IS 
  'Tipo de serviço quando tipo_pedido=SERVICO (ajuste, reparo, troca_haste, etc)';

-- PASSO 6: Verificação final
-- ============================================================
DO $$
DECLARE
  v_colunas_faltando TEXT[];
  v_coluna TEXT;
BEGIN
  -- Verificar se todas as colunas existem
  SELECT ARRAY_AGG(coluna) INTO v_colunas_faltando
  FROM (
    SELECT UNNEST(ARRAY[
      'tipo_pedido', 'armacao_id', 'origem_armacao',
      'lente_selecionada_id', 'grupo_canonico_id', 'fornecedor_lente_id',
      'prazo_laboratorio_dias', 'margem_cliente_dias',
      'tipo_servico', 'numero_os_automatico'
    ]) AS coluna
  ) cols
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos' AND column_name = cols.coluna
  );

  IF v_colunas_faltando IS NULL OR array_length(v_colunas_faltando, 1) IS NULL THEN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Todas as colunas foram adicionadas:';
    RAISE NOTICE '- tipo_pedido (enum)';
    RAISE NOTICE '- armacao_id (UUID)';
    RAISE NOTICE '- origem_armacao (TEXT)';
    RAISE NOTICE '- lente_selecionada_id (UUID)';
    RAISE NOTICE '- grupo_canonico_id (UUID)';
    RAISE NOTICE '- fornecedor_lente_id (UUID)';
    RAISE NOTICE '- prazo_laboratorio_dias (INTEGER)';
    RAISE NOTICE '- margem_cliente_dias (INTEGER)';
    RAISE NOTICE '- tipo_servico (TEXT)';
    RAISE NOTICE '- numero_os_automatico (TEXT)';
    RAISE NOTICE '========================================';
  ELSE
    RAISE NOTICE '⚠️ ATENÇÃO: Faltam colunas:';
    FOREACH v_coluna IN ARRAY v_colunas_faltando
    LOOP
      RAISE NOTICE '  ❌ %', v_coluna;
    END LOOP;
  END IF;
END $$;

-- PASSO 7: Refresh do schema cache (importante!)
-- ============================================================
NOTIFY pgrst, 'reload schema';

SELECT '🎉 Migração completa! Execute este comando no terminal do Supabase:' as info;
SELECT 'pkill -HUP -f "postgrest"' as comando_opcional;
