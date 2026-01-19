-- ============================================================
-- 🎯 IMPLEMENTAÇÃO: Sistema Multimodal de Pedidos
-- ============================================================
-- Data: 17/01/2026
-- Objetivo: Permitir pedidos de diferentes tipos (Lentes, Armações, Completo, Serviço)
-- 
-- TIPOS DE PEDIDOS:
-- - LENTES: Só lentes (comprar do laboratório)
-- - ARMACAO: Só armação (estoque ou fornecedor)
-- - COMPLETO: Lentes + Armação
-- - SERVICO: Montagem, ajuste, reparo
-- - LENTE_AVULSA: Lente sem montar
-- ============================================================

-- ============================================================
-- 1. CRIAR ENUM: tipo_pedido
-- ============================================================

DO $$ 
BEGIN
  -- Verificar se o tipo já existe
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_pedido') THEN
    CREATE TYPE tipo_pedido AS ENUM (
      'LENTES',        -- Só lentes (comprar do lab)
      'ARMACAO',       -- Só armação (estoque/fornecedor)
      'COMPLETO',      -- Lentes + Armação
      'SERVICO',       -- Montagem, ajuste, reparo
      'LENTE_AVULSA'   -- Lente sem montar
    );
    RAISE NOTICE '✅ Enum tipo_pedido criado';
  ELSE
    RAISE NOTICE '⚠️ Enum tipo_pedido já existe';
  END IF;
END $$;

-- ============================================================
-- 2. ADICIONAR COLUNA tipo_pedido NA TABELA pedidos
-- ============================================================

-- Adicionar coluna (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pedidos' AND column_name = 'tipo_pedido'
  ) THEN
    ALTER TABLE pedidos 
    ADD COLUMN tipo_pedido tipo_pedido DEFAULT 'LENTES';
    
    RAISE NOTICE '✅ Coluna tipo_pedido adicionada';
  ELSE
    RAISE NOTICE '⚠️ Coluna tipo_pedido já existe';
  END IF;
END $$;

-- ============================================================
-- 3. TORNAR CAMPOS OPCIONAIS (podem ser NULL)
-- ============================================================

DO $$ 
BEGIN
  -- Lentes agora são opcionais (se for tipo ARMACAO ou SERVICO, não precisa)
  BEGIN
    ALTER TABLE pedidos ALTER COLUMN lente_selecionada_id DROP NOT NULL;
  EXCEPTION WHEN others THEN
    NULL; -- Coluna já é nullable
  END;
  
  BEGIN
    ALTER TABLE pedidos ALTER COLUMN grupo_canonico_id DROP NOT NULL;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER TABLE pedidos ALTER COLUMN fornecedor_lente_id DROP NOT NULL;
  EXCEPTION WHEN others THEN
    NULL;
  END;

  -- Laboratório também opcional (serviço não passa por lab)
  BEGIN
    ALTER TABLE pedidos ALTER COLUMN laboratorio_id DROP NOT NULL;
  EXCEPTION WHEN others THEN
    NULL;
  END;

  RAISE NOTICE '✅ Campos de lentes tornados opcionais';
END $$;

-- ============================================================
-- 4. ADICIONAR NOVOS CAMPOS
-- ============================================================

-- Campo: ID da armação (se tipo = ARMACAO ou COMPLETO)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pedidos' AND column_name = 'armacao_id'
  ) THEN
    -- Criar coluna sem FK por enquanto (tabela armacoes ainda não existe)
    ALTER TABLE pedidos 
    ADD COLUMN armacao_id UUID;
    
    COMMENT ON COLUMN pedidos.armacao_id IS 
    'ID da armação (FK será adicionada quando tabela armacoes existir)';
    
    RAISE NOTICE '✅ Coluna armacao_id adicionada (sem FK por enquanto)';
  ELSE
    RAISE NOTICE '⚠️ Coluna armacao_id já existe';
  END IF;
END $$;

-- Campo: Tipo de serviço (se tipo = SERVICO)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pedidos' AND column_name = 'tipo_servico'
  ) THEN
    ALTER TABLE pedidos 
    ADD COLUMN tipo_servico TEXT;
    
    COMMENT ON COLUMN pedidos.tipo_servico IS 
    'Tipo de serviço: montagem, ajuste, reparo, troca_parafuso, limpeza, solda, etc';
    
    RAISE NOTICE '✅ Coluna tipo_servico adicionada';
  ELSE
    RAISE NOTICE '⚠️ Coluna tipo_servico já existe';
  END IF;
END $$;

-- Campo: Montador pré-selecionado (se tipo = SERVICO)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pedidos' AND column_name = 'montador_id'
  ) THEN
    ALTER TABLE pedidos 
    ADD COLUMN montador_id UUID REFERENCES usuarios(id);
    
    COMMENT ON COLUMN pedidos.montador_id IS 
    'Montador responsável (pré-selecionado em tipo SERVICO)';
    
    RAISE NOTICE '✅ Coluna montador_id adicionada';
  ELSE
    RAISE NOTICE '⚠️ Coluna montador_id já existe';
  END IF;
END $$;

-- Campo: Origem da armação
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pedidos' AND column_name = 'origem_armacao'
  ) THEN
    ALTER TABLE pedidos 
    ADD COLUMN origem_armacao TEXT;
    
    COMMENT ON COLUMN pedidos.origem_armacao IS 
    'Origem da armação: estoque, fornecedor, cliente_trouxe';
    
    RAISE NOTICE '✅ Coluna origem_armacao adicionada';
  ELSE
    RAISE NOTICE '⚠️ Coluna origem_armacao já existe';
  END IF;
END $$;

-- Campo: Valor da armação separado
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pedidos' AND column_name = 'valor_armacao'
  ) THEN
    ALTER TABLE pedidos 
    ADD COLUMN valor_armacao NUMERIC(10,2) DEFAULT 0;
    
    COMMENT ON COLUMN pedidos.valor_armacao IS 
    'Valor da armação (separado do valor das lentes)';
    
    RAISE NOTICE '✅ Coluna valor_armacao adicionada';
  ELSE
    RAISE NOTICE '⚠️ Coluna valor_armacao já existe';
  END IF;
END $$;

-- Campo: Valor do serviço
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pedidos' AND column_name = 'valor_servico'
  ) THEN
    ALTER TABLE pedidos 
    ADD COLUMN valor_servico NUMERIC(10,2) DEFAULT 0;
    
    COMMENT ON COLUMN pedidos.valor_servico IS 
    'Valor do serviço prestado (se tipo = SERVICO)';
    
    RAISE NOTICE '✅ Coluna valor_servico adicionada';
  ELSE
    RAISE NOTICE '⚠️ Coluna valor_servico já existe';
  END IF;
END $$;

-- ============================================================
-- 5. ATUALIZAR PEDIDOS EXISTENTES
-- ============================================================

DO $$ 
BEGIN
  -- Setar tipo padrão 'LENTES' para todos os pedidos existentes
  -- (assumindo que pedidos antigos eram de lentes)
  UPDATE pedidos 
  SET tipo_pedido = 'LENTES'
  WHERE tipo_pedido IS NULL;

  RAISE NOTICE '✅ Pedidos existentes atualizados com tipo_pedido = LENTES';
END $$;

-- ============================================================
-- 6. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================

DO $$ 
BEGIN
  -- Índice por tipo de pedido (para filtrar rapidamente)
  CREATE INDEX IF NOT EXISTS idx_pedidos_tipo_pedido 
  ON pedidos(tipo_pedido);

  -- Índice por armação (se tiver)
  CREATE INDEX IF NOT EXISTS idx_pedidos_armacao_id 
  ON pedidos(armacao_id) WHERE armacao_id IS NOT NULL;

  -- Índice por montador (para ver pedidos de cada montador)
  CREATE INDEX IF NOT EXISTS idx_pedidos_montador_id 
  ON pedidos(montador_id) WHERE montador_id IS NOT NULL;

  RAISE NOTICE '✅ Índices criados';
END $$;

-- ============================================================
-- 7. CRIAR CONSTRAINT: Validação por Tipo
-- ============================================================

DO $$ 
BEGIN
  -- Regra: Se tipo = SERVICO, deve ter tipo_servico preenchido
  ALTER TABLE pedidos 
  DROP CONSTRAINT IF EXISTS check_servico_tipo;

  ALTER TABLE pedidos 
  ADD CONSTRAINT check_servico_tipo 
  CHECK (
    (tipo_pedido != 'SERVICO') OR 
    (tipo_pedido = 'SERVICO' AND tipo_servico IS NOT NULL)
  );

  -- Regra: Se tipo = LENTES ou COMPLETO, deve ter lente_selecionada_id
  ALTER TABLE pedidos 
  DROP CONSTRAINT IF EXISTS check_lentes_obrigatorias;

  ALTER TABLE pedidos 
  ADD CONSTRAINT check_lentes_obrigatorias 
  CHECK (
    (tipo_pedido NOT IN ('LENTES', 'COMPLETO')) OR 
    (tipo_pedido IN ('LENTES', 'COMPLETO') AND lente_selecionada_id IS NOT NULL)
  );

  -- Regra: Se tipo = ARMACAO ou COMPLETO, deve ter armacao_id ou origem_armacao
  ALTER TABLE pedidos 
  DROP CONSTRAINT IF EXISTS check_armacao_obrigatoria;

  ALTER TABLE pedidos 
  ADD CONSTRAINT check_armacao_obrigatoria 
  CHECK (
    (tipo_pedido NOT IN ('ARMACAO', 'COMPLETO')) OR 
    (tipo_pedido IN ('ARMACAO', 'COMPLETO') AND (armacao_id IS NOT NULL OR origem_armacao IS NOT NULL))
  );

  RAISE NOTICE '✅ Constraints de validação criados';
END $$;

-- ============================================================
-- 8. COMENTÁRIOS EXPLICATIVOS
-- ============================================================

COMMENT ON COLUMN pedidos.tipo_pedido IS 
'Tipo do pedido: LENTES (só lentes), ARMACAO (só armação), COMPLETO (lentes+armação), SERVICO (montagem/reparo), LENTE_AVULSA (lente sem montar)';

-- ============================================================
-- 9. CRIAR VIEW: Pedidos por Tipo
-- ============================================================

CREATE OR REPLACE VIEW v_pedidos_por_tipo AS
SELECT 
  tipo_pedido,
  COUNT(*) as total_pedidos,
  COUNT(*) FILTER (WHERE status NOT IN ('ENTREGUE', 'FINALIZADO', 'CANCELADO')) as em_andamento,
  SUM(valor_total) as valor_total,
  AVG(valor_total) as ticket_medio
FROM pedidos
GROUP BY tipo_pedido;

COMMENT ON VIEW v_pedidos_por_tipo IS 
'Estatísticas de pedidos agrupados por tipo';

-- ============================================================
-- 10. VERIFICAÇÃO FINAL
-- ============================================================

-- Mostrar estrutura atualizada
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📊 VERIFICAÇÃO: Estrutura da tabela pedidos';
  RAISE NOTICE '================================================';
  
  FOR rec IN 
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_name = 'pedidos' 
    AND column_name IN (
      'tipo_pedido', 
      'armacao_id', 
      'tipo_servico', 
      'montador_id', 
      'origem_armacao',
      'valor_armacao',
      'valor_servico',
      'lente_selecionada_id'
    )
    ORDER BY column_name
  LOOP
    RAISE NOTICE '  % | % | NULL: % | Default: %', 
      rec.column_name, 
      rec.data_type, 
      rec.is_nullable,
      COALESCE(rec.column_default, 'none');
  END LOOP;
  
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
END $$;

-- Contar pedidos por tipo
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '📈 ESTATÍSTICAS: Pedidos por Tipo';
  RAISE NOTICE '================================================';
  
  FOR rec IN 
    SELECT tipo_pedido, COUNT(*) as total
    FROM pedidos
    GROUP BY tipo_pedido
    ORDER BY total DESC
  LOOP
    RAISE NOTICE '  %: % pedidos', rec.tipo_pedido, rec.total;
  END LOOP;
  
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ MIGRATION CONCLUÍDA COM SUCESSO!';
  RAISE NOTICE '';
END $$;

-- ============================================================
-- 🎯 PRÓXIMOS PASSOS (MANUAL)
-- ============================================================
-- 
-- 1. FRONTEND: Criar componente NovoPedidoWizard
--    - Step 1: Escolher tipo (LENTES, ARMACAO, COMPLETO, SERVICO)
--    - Steps condicionais baseados no tipo
-- 
-- 2. LÓGICA: Função getStatusInicial(tipo)
--    - SERVICO → vai direto para 'MONTAGEM'
--    - ARMACAO (estoque) → 'PRONTO'
--    - LENTES/COMPLETO → 'REGISTRADO'
-- 
-- 3. KANBAN: Atualizar regras de movimentação
--    - SERVICO pula AG_PAGAMENTO, PAGO, PRODUCAO
--    - ARMACAO pula PRODUCAO se for do estoque
-- 
-- 4. VALIDAÇÕES: Campos obrigatórios por tipo
--    - LENTES: lente_selecionada_id required
--    - ARMACAO: armacao_id ou origem_armacao required
--    - SERVICO: tipo_servico + montador_id required
-- 
-- 5. TABELA ARMACOES: Verificar estrutura
--    - Se não existe, criar em crm_erp.armacoes
--    - Campos: id, nome, marca, modelo, cor, preco, estoque, etc
-- 
-- ============================================================
