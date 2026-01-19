-- ============================================================
-- 🔍 DIAGNÓSTICO COMPLETO: Estrutura e Dados de Pedidos
-- ============================================================
-- Data: 17/01/2026
-- Objetivo: Analisar dados existentes antes de aplicar constraints
-- ============================================================

-- ============================================================
-- 1. ESTRUTURA ATUAL DA TABELA PEDIDOS
-- ============================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'pedidos'
ORDER BY ordinal_position;

-- ============================================================
-- 2. ANÁLISE: Campos de Lentes (NULL vs Preenchidos)
-- ============================================================

SELECT 
  'Total de pedidos' as metrica,
  COUNT(*) as quantidade
FROM pedidos
UNION ALL
SELECT 
  'Com lente_selecionada_id',
  COUNT(*) 
FROM pedidos 
WHERE lente_selecionada_id IS NOT NULL
UNION ALL
SELECT 
  'SEM lente_selecionada_id (NULL)',
  COUNT(*) 
FROM pedidos 
WHERE lente_selecionada_id IS NULL
UNION ALL
SELECT 
  'Com grupo_canonico_id',
  COUNT(*) 
FROM pedidos 
WHERE grupo_canonico_id IS NOT NULL
UNION ALL
SELECT 
  'SEM grupo_canonico_id (NULL)',
  COUNT(*) 
FROM pedidos 
WHERE grupo_canonico_id IS NULL
UNION ALL
SELECT 
  'Com fornecedor_lente_id',
  COUNT(*) 
FROM pedidos 
WHERE fornecedor_lente_id IS NOT NULL
UNION ALL
SELECT 
  'SEM fornecedor_lente_id (NULL)',
  COUNT(*) 
FROM pedidos 
WHERE fornecedor_lente_id IS NULL;

-- ============================================================
-- 3. ANÁLISE: Pedidos por Status
-- ============================================================

SELECT 
  status,
  COUNT(*) as total,
  COUNT(lente_selecionada_id) as com_lente,
  COUNT(*) - COUNT(lente_selecionada_id) as sem_lente
FROM pedidos
GROUP BY status
ORDER BY total DESC;

-- ============================================================
-- 4. AMOSTRA: Pedidos SEM lente_selecionada_id
-- ============================================================

SELECT 
  id,
  numero_sequencial,
  cliente_nome,
  status,
  lente_selecionada_id,
  laboratorio_id,
  valor_total,
  created_at
FROM pedidos
WHERE lente_selecionada_id IS NULL
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================
-- 5. VERIFICAR: Coluna tipo_pedido existe?
-- ============================================================

SELECT 
  EXISTS(
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'pedidos' 
    AND column_name = 'tipo_pedido'
  ) as tipo_pedido_existe;

-- ============================================================
-- 6. VERIFICAR: Tipo enum existe?
-- ============================================================

SELECT 
  EXISTS(
    SELECT 1 
    FROM pg_type 
    WHERE typname = 'tipo_pedido'
  ) as enum_tipo_pedido_existe;

-- ============================================================
-- 7. ANÁLISE: Laboratórios (NULL vs Preenchidos)
-- ============================================================

SELECT 
  'Total de pedidos' as metrica,
  COUNT(*) as quantidade
FROM pedidos
UNION ALL
SELECT 
  'Com laboratorio_id',
  COUNT(*) 
FROM pedidos 
WHERE laboratorio_id IS NOT NULL
UNION ALL
SELECT 
  'SEM laboratorio_id (NULL)',
  COUNT(*) 
FROM pedidos 
WHERE laboratorio_id IS NULL;

-- ============================================================
-- 8. ANÁLISE: Tipos de Pedidos Implícitos
-- ============================================================

-- Tentar inferir o tipo de pedido baseado nos dados
SELECT 
  CASE 
    WHEN lente_selecionada_id IS NOT NULL THEN 'Aparentemente LENTES'
    WHEN lente_selecionada_id IS NULL AND laboratorio_id IS NOT NULL THEN 'Inconsistente (sem lente mas com lab)'
    WHEN lente_selecionada_id IS NULL AND laboratorio_id IS NULL THEN 'Possível SERVICO ou ARMACAO'
    ELSE 'Indefinido'
  END as tipo_inferido,
  COUNT(*) as total
FROM pedidos
GROUP BY 
  CASE 
    WHEN lente_selecionada_id IS NOT NULL THEN 'Aparentemente LENTES'
    WHEN lente_selecionada_id IS NULL AND laboratorio_id IS NOT NULL THEN 'Inconsistente (sem lente mas com lab)'
    WHEN lente_selecionada_id IS NULL AND laboratorio_id IS NULL THEN 'Possível SERVICO ou ARMACAO'
    ELSE 'Indefinido'
  END;

-- ============================================================
-- 9. VERIFICAR: Constraints Existentes
-- ============================================================

SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'pedidos'::regclass
AND contype = 'c'; -- check constraints

-- ============================================================
-- 10. RESUMO FINAL
-- ============================================================

DO $$
DECLARE
  total_pedidos INT;
  com_lentes INT;
  sem_lentes INT;
  com_lab INT;
  sem_lab INT;
BEGIN
  SELECT COUNT(*) INTO total_pedidos FROM pedidos;
  SELECT COUNT(*) INTO com_lentes FROM pedidos WHERE lente_selecionada_id IS NOT NULL;
  SELECT COUNT(*) INTO sem_lentes FROM pedidos WHERE lente_selecionada_id IS NULL;
  SELECT COUNT(*) INTO com_lab FROM pedidos WHERE laboratorio_id IS NOT NULL;
  SELECT COUNT(*) INTO sem_lab FROM pedidos WHERE laboratorio_id IS NULL;
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMO DO DIAGNÓSTICO';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Total de pedidos: %', total_pedidos;
  RAISE NOTICE '';
  RAISE NOTICE 'LENTES:';
  RAISE NOTICE '  Com lente_selecionada_id: % (%.1f%%)', com_lentes, (com_lentes::FLOAT / total_pedidos * 100);
  RAISE NOTICE '  SEM lente_selecionada_id: % (%.1f%%)', sem_lentes, (sem_lentes::FLOAT / total_pedidos * 100);
  RAISE NOTICE '';
  RAISE NOTICE 'LABORATÓRIOS:';
  RAISE NOTICE '  Com laboratorio_id: % (%.1f%%)', com_lab, (com_lab::FLOAT / total_pedidos * 100);
  RAISE NOTICE '  SEM laboratorio_id: % (%.1f%%)', sem_lab, (sem_lab::FLOAT / total_pedidos * 100);
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
  
  IF sem_lentes > 0 THEN
    RAISE NOTICE '⚠️ ATENÇÃO: % pedidos não têm lente_selecionada_id!', sem_lentes;
    RAISE NOTICE '   Não podemos criar constraint check_lentes_obrigatorias sem tratar esses dados.';
    RAISE NOTICE '';
    RAISE NOTICE '💡 OPÇÕES:';
    RAISE NOTICE '   1. Marcar pedidos sem lentes como tipo_pedido = SERVICO';
    RAISE NOTICE '   2. Marcar como tipo_pedido = ARMACAO';
    RAISE NOTICE '   3. Não criar constraint (permitir NULL temporariamente)';
  ELSE
    RAISE NOTICE '✅ Todos os pedidos têm lente_selecionada_id preenchido!';
  END IF;
END $$;
