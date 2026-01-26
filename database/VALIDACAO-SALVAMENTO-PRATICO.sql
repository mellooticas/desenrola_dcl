-- ============================================================================
-- VALIDAÇÃO PRÁTICA: TESTAR SALVAMENTO NO CENÁRIO REAL
-- ============================================================================
-- Data: 26/01/2026
-- Objetivo: Testar os 3 problemas reportados em cenário real
-- ============================================================================

-- ============================================================================
-- TESTE 1: CRIAR PEDIDO COM TODOS OS CAMPOS EDITÁVEIS
-- ============================================================================
-- Este é o teste mais importante - simula o wizard do frontend

DO $$
DECLARE
  v_pedido_id UUID;
  v_numero_lab TEXT;
  v_data_entrega DATE;
  v_preco NUMERIC;
  v_margem NUMERIC;
BEGIN
  RAISE NOTICE '🧪 TESTE 1: Criando pedido completo com valores editáveis...';
  
  -- Criar pedido simulando wizard do frontend
  INSERT INTO pedidos (
    loja_id,
    laboratorio_id,
    classe_lente_id,
    cliente_nome,
    cliente_telefone,
    -- CAMPOS CRÍTICOS QUE DEVEM SER SALVOS:
    numero_pedido_laboratorio,    -- ✅ Problema 2
    data_previsao_entrega,        -- ✅ Problema 3
    preco_lente,                  -- ✅ Problema 1 (com desconto)
    custo_lente,                  -- ✅ Problema 1
    servico_preco_real,           -- ✅ Problema 1 (com desconto)
    servico_custo                 -- ✅ Problema 1
  ) VALUES (
    (SELECT id FROM lojas LIMIT 1),
    (SELECT id FROM laboratorios WHERE ativo = true LIMIT 1),
    (SELECT id FROM classes_lente LIMIT 1),
    '🔍 VALIDAÇÃO COMPLETA',
    '(11) 99999-9999',
    -- Valores editados pelo usuário:
    'LAB-2026-TESTE-123',         -- Número do pedido no lab
    '2026-02-28'::DATE,           -- Data prometida editável
    280.00,                       -- Preço COM desconto de 20%
    95.00,                        -- Custo real
    150.00,                       -- Serviço COM desconto
    45.00                         -- Custo do serviço
  ) RETURNING id INTO v_pedido_id;
  
  -- Aguardar triggers processarem
  PERFORM pg_sleep(0.1);
  
  -- Buscar valores salvos
  SELECT 
    numero_pedido_laboratorio,
    data_previsao_entrega,
    preco_lente,
    margem_lente_percentual
  INTO v_numero_lab, v_data_entrega, v_preco, v_margem
  FROM pedidos 
  WHERE id = v_pedido_id;
  
  -- Validar resultados
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESULTADOS DO TESTE 1:';
  RAISE NOTICE '  Pedido ID: %', v_pedido_id;
  RAISE NOTICE '';
  
  -- Validar número do laboratório
  IF v_numero_lab = 'LAB-2026-TESTE-123' THEN
    RAISE NOTICE '  ✅ numero_pedido_laboratorio: % (CORRETO)', v_numero_lab;
  ELSE
    RAISE NOTICE '  ❌ numero_pedido_laboratorio: % (ESPERADO: LAB-2026-TESTE-123)', v_numero_lab;
  END IF;
  
  -- Validar data de entrega
  IF v_data_entrega = '2026-02-28'::DATE THEN
    RAISE NOTICE '  ✅ data_previsao_entrega: % (CORRETO)', v_data_entrega;
  ELSE
    RAISE NOTICE '  ❌ data_previsao_entrega: % (ESPERADO: 2026-02-28)', v_data_entrega;
  END IF;
  
  -- Validar valores com desconto
  IF v_preco = 280.00 THEN
    RAISE NOTICE '  ✅ preco_lente: R$ % (CORRETO - com desconto)', v_preco;
  ELSE
    RAISE NOTICE '  ❌ preco_lente: R$ % (ESPERADO: 280.00)', v_preco;
  END IF;
  
  -- Validar margem (trigger deve calcular: (280-95)/280*100 = 66.07%)
  IF v_margem BETWEEN 66.00 AND 66.10 THEN
    RAISE NOTICE '  ✅ margem_lente_percentual: % (CALCULADA CORRETAMENTE)', v_margem;
  ELSE
    RAISE NOTICE '  ⚠️  margem_lente_percentual: % (ESPERADO: cerca de 66.07)', v_margem;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎯 TESTE 1 CONCLUÍDO - Pedido criado com sucesso!';
  RAISE NOTICE '';
  
  -- NÃO limpar - deixar para análise manual
  -- DELETE FROM pedidos WHERE id = v_pedido_id;
END $$;


-- ============================================================================
-- TESTE 2: ATUALIZAR CAMPOS EDITÁVEIS (Simula edição do pedido)
-- ============================================================================

DO $$
DECLARE
  v_pedido_id UUID;
  v_numero_lab_antes TEXT;
  v_numero_lab_depois TEXT;
  v_data_antes DATE;
  v_data_depois DATE;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🧪 TESTE 2: Atualizando campos editáveis em pedido existente...';
  
  -- Buscar o pedido que acabamos de criar
  SELECT id INTO v_pedido_id 
  FROM pedidos 
  WHERE cliente_nome = '🔍 VALIDAÇÃO COMPLETA'
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF v_pedido_id IS NULL THEN
    RAISE NOTICE '  ⚠️  Pedido de teste não encontrado. Execute TESTE 1 primeiro.';
    RETURN;
  END IF;
  
  -- Capturar valores antes
  SELECT numero_pedido_laboratorio, data_previsao_entrega
  INTO v_numero_lab_antes, v_data_antes
  FROM pedidos WHERE id = v_pedido_id;
  
  RAISE NOTICE '  Valores ANTES do UPDATE:';
  RAISE NOTICE '    numero_pedido_laboratorio: %', v_numero_lab_antes;
  RAISE NOTICE '    data_previsao_entrega: %', v_data_antes;
  RAISE NOTICE '';
  
  -- Fazer UPDATE (simula edição do usuário)
  UPDATE pedidos SET
    numero_pedido_laboratorio = 'LAB-2026-EDITADO-999',
    data_previsao_entrega = '2026-03-10'::DATE,
    preco_lente = 320.00,
    custo_lente = 100.00,
    observacoes = 'Pedido editado via teste de validação'
  WHERE id = v_pedido_id;
  
  -- Buscar valores depois
  SELECT numero_pedido_laboratorio, data_previsao_entrega
  INTO v_numero_lab_depois, v_data_depois
  FROM pedidos WHERE id = v_pedido_id;
  
  RAISE NOTICE '  Valores DEPOIS do UPDATE:';
  RAISE NOTICE '    numero_pedido_laboratorio: %', v_numero_lab_depois;
  RAISE NOTICE '    data_previsao_entrega: %', v_data_depois;
  RAISE NOTICE '';
  
  -- Validar se UPDATE funcionou
  IF v_numero_lab_depois = 'LAB-2026-EDITADO-999' THEN
    RAISE NOTICE '  ✅ UPDATE de numero_pedido_laboratorio: SUCESSO';
  ELSE
    RAISE NOTICE '  ❌ UPDATE de numero_pedido_laboratorio: FALHOU';
  END IF;
  
  IF v_data_depois = '2026-03-10'::DATE THEN
    RAISE NOTICE '  ✅ UPDATE de data_previsao_entrega: SUCESSO';
  ELSE
    RAISE NOTICE '  ❌ UPDATE de data_previsao_entrega: FALHOU (foi sobrescrita!)';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎯 TESTE 2 CONCLUÍDO - UPDATE testado!';
  RAISE NOTICE '';
END $$;


-- ============================================================================
-- TESTE 3: VERIFICAR SE TRIGGERS NÃO SOBRESCREVEM NO UPDATE
-- ============================================================================

DO $$
DECLARE
  v_pedido_id UUID;
  v_data_antes DATE;
  v_data_depois DATE;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🧪 TESTE 3: Verificando se triggers respeitam valores editados...';
  
  -- Buscar pedido de teste
  SELECT id, data_previsao_entrega INTO v_pedido_id, v_data_antes
  FROM pedidos 
  WHERE cliente_nome = '🔍 VALIDAÇÃO COMPLETA'
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF v_pedido_id IS NULL THEN
    RAISE NOTICE '  ⚠️  Pedido de teste não encontrado.';
    RETURN;
  END IF;
  
  -- Fazer UPDATE de outro campo (não a data)
  -- Triggers NÃO devem recalcular data_previsao_entrega
  UPDATE pedidos SET
    observacoes = 'Teste: trigger não deve recalcular data'
  WHERE id = v_pedido_id;
  
  -- Buscar data depois
  SELECT data_previsao_entrega INTO v_data_depois
  FROM pedidos WHERE id = v_pedido_id;
  
  IF v_data_antes = v_data_depois THEN
    RAISE NOTICE '  ✅ Trigger NÃO sobrescreveu data_previsao_entrega';
    RAISE NOTICE '     Data mantida: %', v_data_depois;
  ELSE
    RAISE NOTICE '  ❌ Trigger SOBRESCREVEU data_previsao_entrega!';
    RAISE NOTICE '     Data antes: % | Data depois: %', v_data_antes, v_data_depois;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎯 TESTE 3 CONCLUÍDO!';
  RAISE NOTICE '';
END $$;


-- ============================================================================
-- TESTE 4: ANÁLISE DO PEDIDO DE TESTE NO BANCO
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '📋 CONSULTA: Dados completos do pedido de validação';
RAISE NOTICE '';

SELECT 
  id,
  numero_sequencial as os,
  cliente_nome,
  numero_pedido_laboratorio,
  data_previsao_entrega,
  data_prevista_pronto,
  data_prometida,
  preco_lente,
  custo_lente,
  margem_lente_percentual,
  servico_preco_real,
  servico_custo,
  margem_servico_percentual,
  created_at,
  updated_at
FROM pedidos
WHERE cliente_nome = '🔍 VALIDAÇÃO COMPLETA'
ORDER BY created_at DESC
LIMIT 1;


-- ============================================================================
-- TESTE 5: COMPARAR COM PEDIDOS REAIS (últimos 5)
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '📊 COMPARAÇÃO: Pedidos reais vs pedido de teste';
RAISE NOTICE '';

SELECT 
  numero_sequencial as os,
  cliente_nome,
  CASE 
    WHEN numero_pedido_laboratorio IS NULL THEN '❌ NULL'
    ELSE '✅ ' || numero_pedido_laboratorio
  END as num_lab,
  CASE 
    WHEN data_previsao_entrega IS NULL THEN '❌ NULL'
    ELSE '✅ ' || data_previsao_entrega::TEXT
  END as data_entrega,
  CASE 
    WHEN margem_lente_percentual IS NULL THEN '❌ NULL'
    WHEN margem_lente_percentual = 0 THEN '⚠️ ZERO'
    ELSE '✅ ' || ROUND(margem_lente_percentual, 2)::TEXT || '%'
  END as margem,
  created_at::DATE as criado_em
FROM pedidos
WHERE created_at > NOW() - INTERVAL '2 days'
ORDER BY created_at DESC
LIMIT 6;


-- ============================================================================
-- LIMPEZA (OPCIONAL)
-- ============================================================================

/*
-- Para limpar pedido de teste (executar manualmente se quiser):
DELETE FROM pedidos 
WHERE cliente_nome = '🔍 VALIDAÇÃO COMPLETA';
*/


-- ============================================================================
-- PRÓXIMOS PASSOS - VALIDAÇÃO NO FRONTEND
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '╔════════════════════════════════════════════════════════════════════╗';
RAISE NOTICE '║  📋 PRÓXIMOS PASSOS - TESTAR NO FRONTEND                          ║';
RAISE NOTICE '╠════════════════════════════════════════════════════════════════════╣';
RAISE NOTICE '║  1. Abrir wizard de novo pedido                                   ║';
RAISE NOTICE '║  2. Preencher campo "Número do Pedido no Laboratório"             ║';
RAISE NOTICE '║  3. Editar data de entrega manualmente                            ║';
RAISE NOTICE '║  4. Aplicar desconto em lentes/serviços                           ║';
RAISE NOTICE '║  5. SALVAR e verificar no banco se campos foram salvos            ║';
RAISE NOTICE '║                                                                   ║';
RAISE NOTICE '║  🔍 QUERY PARA VERIFICAR ÚLTIMO PEDIDO CRIADO:                    ║';
RAISE NOTICE '║                                                                   ║';
RAISE NOTICE '║  SELECT numero_sequencial, numero_pedido_laboratorio,             ║';
RAISE NOTICE '║         data_previsao_entrega, preco_lente, margem_lente_percentual ║';
RAISE NOTICE '║  FROM pedidos                                                     ║';
RAISE NOTICE '║  ORDER BY created_at DESC LIMIT 1;                                ║';
RAISE NOTICE '╚════════════════════════════════════════════════════════════════════╝';
RAISE NOTICE '';


-- ============================================================================
-- DEBUG: VERIFICAR SE TRIGGERS ESTÃO ATIVOS
-- ============================================================================

RAISE NOTICE '🔧 DEBUG: Verificando triggers ativos na tabela pedidos...';
RAISE NOTICE '';

SELECT 
  trigger_name,
  event_manipulation as evento,
  action_timing as quando,
  CASE 
    WHEN trigger_name ILIKE '%data%' THEN '📅 Data'
    WHEN trigger_name ILIKE '%margem%' THEN '💰 Margem'
    ELSE '❓ Outro'
  END as tipo
FROM information_schema.triggers
WHERE event_object_table = 'pedidos'
AND event_object_schema = 'public'
ORDER BY tipo, trigger_name;


-- ============================================================================
-- RESUMO DOS TESTES
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '═══════════════════════════════════════════════════════════════════';
RAISE NOTICE '  ✅ VALIDAÇÃO COMPLETA - RESUMO';
RAISE NOTICE '═══════════════════════════════════════════════════════════════════';
RAISE NOTICE '';
RAISE NOTICE '  Se todos os testes passaram (✅), as correções estão funcionando!';
RAISE NOTICE '';
RAISE NOTICE '  ⚠️  SE ALGUM TESTE FALHOU (❌):';
RAISE NOTICE '     1. Verifique os triggers ativos acima';
RAISE NOTICE '     2. Execute novamente: CORRECAO-SALVAMENTO-CRITICO.sql';
RAISE NOTICE '     3. Rode este script de validação novamente';
RAISE NOTICE '';
RAISE NOTICE '  📌 PEDIDO DE TESTE CRIADO:';
RAISE NOTICE '     Cliente: "🔍 VALIDAÇÃO COMPLETA"';
RAISE NOTICE '     Use para comparar com pedidos do frontend';
RAISE NOTICE '';
RAISE NOTICE '═══════════════════════════════════════════════════════════════════';
RAISE NOTICE '';
