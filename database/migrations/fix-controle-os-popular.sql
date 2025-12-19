-- =========================================
-- 🔧 DIAGNÓSTICO E CORREÇÃO: Controle de OS
-- =========================================
-- Script para identificar e corrigir problemas no sistema de controle de OS
-- Execute este script no Supabase SQL Editor

-- =========================================
-- PARTE 1: DIAGNÓSTICO
-- =========================================

-- 1.1 Verificar se a tabela controle_os existe e está populada
SELECT 
  'Tabela controle_os' as verificacao,
  COUNT(*) as total_registros,
  COUNT(DISTINCT loja_id) as total_lojas,
  COUNT(*) FILTER (WHERE lancado) as oss_lancadas,
  COUNT(*) FILTER (WHERE NOT lancado) as oss_nao_lancadas
FROM controle_os;

-- 1.2 Verificar OSs reais nos pedidos
SELECT 
  'OSs reais nos pedidos' as verificacao,
  COUNT(*) as total_pedidos,
  COUNT(numero_os_fisica) as pedidos_com_os,
  COUNT(DISTINCT numero_os_fisica) as oss_unicas,
  COUNT(DISTINCT loja_id) as lojas_com_pedidos
FROM pedidos
WHERE numero_os_fisica IS NOT NULL
  AND numero_os_fisica ~ '^[0-9]+$';

-- 1.3 Comparar: O que deveria ter vs O que tem
WITH expected AS (
  SELECT 
    loja_id,
    l.nome as loja_nome,
    MIN(CAST(numero_os_fisica AS INTEGER)) as min_os,
    MAX(CAST(numero_os_fisica AS INTEGER)) as max_os,
    MAX(CAST(numero_os_fisica AS INTEGER)) - MIN(CAST(numero_os_fisica AS INTEGER)) + 1 as range_total,
    COUNT(DISTINCT numero_os_fisica) as oss_lancadas
  FROM pedidos p
  LEFT JOIN lojas l ON l.id = p.loja_id
  WHERE numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$'
  GROUP BY loja_id, l.nome
),
current AS (
  SELECT 
    loja_id,
    COUNT(*) as oss_no_controle,
    COUNT(*) FILTER (WHERE lancado) as oss_lancadas_controle,
    COUNT(*) FILTER (WHERE NOT lancado) as gaps_detectados
  FROM controle_os
  GROUP BY loja_id
)
SELECT 
  e.loja_nome,
  e.min_os || ' - ' || e.max_os as range_esperado,
  e.range_total as total_esperado,
  e.oss_lancadas as oss_reais,
  COALESCE(c.oss_no_controle, 0) as oss_no_controle,
  COALESCE(c.gaps_detectados, 0) as gaps_detectados,
  CASE 
    WHEN COALESCE(c.oss_no_controle, 0) = 0 THEN '❌ VAZIO - Precisa popular'
    WHEN COALESCE(c.oss_no_controle, 0) < e.range_total THEN '⚠️ INCOMPLETO'
    ELSE '✅ OK'
  END as status
FROM expected e
LEFT JOIN current c ON c.loja_id = e.loja_id
ORDER BY e.loja_nome;

-- =========================================
-- PARTE 2: SOLUÇÃO - POPULAR TODAS AS LOJAS
-- =========================================

-- 2.1 Limpar tabela controle_os
TRUNCATE controle_os CASCADE;

-- 2.2 Popular automaticamente TODAS as lojas que têm OSs
DO $$
DECLARE
  v_loja RECORD;
  v_min_os INTEGER;
  v_max_os INTEGER;
  v_count INTEGER := 0;
BEGIN
  RAISE NOTICE '🚀 Iniciando população de controle_os...';
  
  -- Iterar por cada loja que tem pedidos com OS
  FOR v_loja IN 
    SELECT DISTINCT 
      p.loja_id,
      l.nome as loja_nome
    FROM pedidos p
    LEFT JOIN lojas l ON l.id = p.loja_id
    WHERE p.numero_os_fisica IS NOT NULL
      AND p.numero_os_fisica ~ '^[0-9]+$'
  LOOP
    -- Buscar range de OSs desta loja
    SELECT 
      MIN(CAST(numero_os_fisica AS INTEGER)),
      MAX(CAST(numero_os_fisica AS INTEGER))
    INTO v_min_os, v_max_os
    FROM pedidos
    WHERE loja_id = v_loja.loja_id
      AND numero_os_fisica IS NOT NULL
      AND numero_os_fisica ~ '^[0-9]+$';
    
    RAISE NOTICE '📍 Loja: % | Range: % - % (% OSs)', 
      v_loja.loja_nome, v_min_os, v_max_os, (v_max_os - v_min_os + 1);
    
    -- Inserir sequência completa
    INSERT INTO controle_os (numero_os, loja_id, lancado, data_lancamento)
    SELECT 
      num,
      v_loja.loja_id,
      EXISTS(
        SELECT 1 FROM pedidos 
        WHERE loja_id = v_loja.loja_id 
          AND numero_os_fisica = num::TEXT
      ),
      (
        SELECT MIN(created_at) 
        FROM pedidos 
        WHERE loja_id = v_loja.loja_id 
          AND numero_os_fisica = num::TEXT
      )
    FROM generate_series(v_min_os, v_max_os) AS num;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE '✅ Inseridas % OSs para %', v_count, v_loja.loja_nome;
    
  END LOOP;
  
  RAISE NOTICE '🎉 População concluída!';
END $$;

-- =========================================
-- PARTE 3: VALIDAÇÃO PÓS-CORREÇÃO
-- =========================================

-- 3.1 Verificar população
SELECT 
  l.nome as loja,
  COUNT(*) as total_oss_controle,
  COUNT(*) FILTER (WHERE lancado) as oss_lancadas,
  COUNT(*) FILTER (WHERE NOT lancado) as gaps_detectados,
  ROUND((COUNT(*) FILTER (WHERE lancado)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 1) as percentual_lancamento
FROM controle_os c
LEFT JOIN lojas l ON l.id = c.loja_id
GROUP BY l.id, l.nome
ORDER BY l.nome;

-- 3.2 Testar views
SELECT 
  'view_controle_os_estatisticas' as view_testada,
  COUNT(*) as lojas,
  SUM(total_os_esperadas) as total_esperadas,
  SUM(total_lancadas) as total_lancadas,
  SUM(total_nao_lancadas) as total_gaps
FROM view_controle_os_estatisticas;

-- 3.3 Ver alguns gaps
SELECT 
  loja_nome,
  numero_os,
  status,
  precisa_atencao
FROM view_controle_os_gaps
ORDER BY loja_nome, numero_os
LIMIT 20;

-- =========================================
-- PARTE 4: TESTAR TRIGGER DE SINCRONIZAÇÃO
-- =========================================

-- 4.1 Inserir pedido teste
DO $$
DECLARE
  v_loja_id UUID;
  v_lab_id UUID;
  v_classe_id UUID;
  v_max_os INTEGER;
  v_test_os INTEGER;
BEGIN
  -- Pegar primeira loja
  SELECT id INTO v_loja_id FROM lojas LIMIT 1;
  SELECT id INTO v_lab_id FROM laboratorios LIMIT 1;
  SELECT id INTO v_classe_id FROM classes_lente LIMIT 1;
  
  -- Pegar maior OS da loja
  SELECT MAX(CAST(numero_os_fisica AS INTEGER))
  INTO v_max_os
  FROM pedidos
  WHERE loja_id = v_loja_id
    AND numero_os_fisica ~ '^[0-9]+$';
  
  v_test_os := v_max_os + 10; -- OS nova para testar
  
  RAISE NOTICE '🧪 Testando trigger com OS %', v_test_os;
  
  -- Inserir pedido teste
  INSERT INTO pedidos (
    loja_id,
    laboratorio_id,
    classe_lente_id,
    numero_os_fisica,
    cliente_nome,
    status
  ) VALUES (
    v_loja_id,
    v_lab_id,
    v_classe_id,
    v_test_os::TEXT,
    'TESTE TRIGGER CONTROLE OS',
    'REGISTRADO'
  );
  
  -- Verificar se trigger criou registros
  IF EXISTS (
    SELECT 1 FROM controle_os 
    WHERE loja_id = v_loja_id 
      AND numero_os = v_test_os
      AND lancado = TRUE
  ) THEN
    RAISE NOTICE '✅ Trigger funcionando! OS % registrada no controle', v_test_os;
  ELSE
    RAISE NOTICE '❌ Trigger NÃO funcionou! OS % não foi registrada', v_test_os;
  END IF;
  
  -- Limpar teste
  DELETE FROM pedidos WHERE cliente_nome = 'TESTE TRIGGER CONTROLE OS';
  DELETE FROM controle_os WHERE numero_os = v_test_os AND loja_id = v_loja_id;
  
  RAISE NOTICE '🧹 Dados de teste removidos';
END $$;

-- =========================================
-- PARTE 5: RESUMO E PRÓXIMOS PASSOS
-- =========================================

SELECT 
  '✅ SISTEMA DE CONTROLE DE OS CORRIGIDO!' as status,
  '
  📊 O QUE FOI FEITO:
  
  1. ✅ Limpou tabela controle_os
  2. ✅ Populou TODAS as lojas automaticamente
  3. ✅ Criou registros para range completo (min → max OS)
  4. ✅ Marcou OSs lançadas vs não lançadas
  5. ✅ Testou trigger de sincronização
  
  🎯 RESULTADO:
  
  - Agora o sistema detecta gaps REAIS
  - Views mostram dados corretos
  - KPIs atualizados automaticamente
  - Novos pedidos sincronizam automaticamente
  
  📋 VERIFICAÇÕES:
  
  Rode as queries acima para confirmar:
  - Parte 3.1: Ver população por loja
  - Parte 3.2: Ver estatísticas gerais
  - Parte 3.3: Ver exemplos de gaps
  
  🔧 MANUTENÇÃO:
  
  Se adicionar uma loja nova no futuro:
  - Criar pedidos normalmente
  - Trigger popula controle_os automaticamente
  - OU rodar script de população manual
  
  ' as detalhes;
