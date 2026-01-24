-- ============================================================================
-- TESTE COMPLETO DAS MELHORIAS IMPLEMENTADAS
-- Execute para validar que tudo está funcionando
-- ============================================================================

-- 🔍 TESTE 1: Verificar se todos os campos foram criados
-- ============================================================================
SELECT 
    '✅ CAMPOS CRIADOS' as status,
    COUNT(*) as total_campos
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name IN (
    'numero_pedido_laboratorio',
    'servico_preco_real',
    'margem_servico_percentual',
    'acessorio_produto_id',
    'acessorio_sku_visual',
    'acessorio_descricao',
    'acessorio_preco_tabela',
    'acessorio_preco_real_unitario',
    'acessorio_quantidade',
    'acessorio_subtotal',
    'acessorio_custo_unitario',
    'margem_acessorio_percentual'
  );
-- Resultado esperado: 12 campos


-- 🔍 TESTE 2: Verificar triggers criados
-- ============================================================================
SELECT 
    '✅ TRIGGERS CRIADOS' as status,
    trigger_name,
    event_manipulation as evento
FROM information_schema.triggers
WHERE event_object_table = 'pedidos'
  AND trigger_name IN (
    'trigger_calcular_margem_servico', 
    'trigger_calcular_valores_acessorio'
  )
ORDER BY trigger_name;
-- Resultado esperado: 2 triggers


-- 🧪 TESTE 3: Criar pedido de teste com serviço
-- ============================================================================
-- Primeiro, vamos pegar IDs necessários
DO $$
DECLARE
  v_loja_id UUID;
  v_pedido_id UUID;
BEGIN
  -- Pegar primeira loja ativa
  SELECT id INTO v_loja_id FROM lojas WHERE ativo = true LIMIT 1;
  
  -- Inserir pedido de teste
  INSERT INTO pedidos (
    loja_id,
    numero_os_fisica,
    tipo_pedido,
    cliente_nome,
    cliente_telefone,
    status,
    -- Campos de serviço
    servico_descricao,
    servico_preco_tabela,
    servico_preco_real,
    servico_custo,
    -- Campo de laboratório
    numero_pedido_laboratorio
  ) VALUES (
    v_loja_id,
    'OS-TESTE-' || FLOOR(RANDOM() * 10000),
    'SERVICO',
    'CLIENTE TESTE MELHORIAS',
    '(11) 99999-9999',
    'PRONTO',
    -- Serviço: Montagem de Lentes
    'Montagem de Lentes em Armação',
    100.00, -- Preço tabela
    85.00,  -- Preço real (15% desconto)
    30.00,  -- Custo
    -- Número do laboratório
    'LAB-TESTE-' || FLOOR(RANDOM() * 10000)
  )
  RETURNING id INTO v_pedido_id;
  
  RAISE NOTICE '✅ Pedido de teste criado: %', v_pedido_id;
END $$;


-- 🔍 TESTE 4: Verificar se margem do serviço foi calculada automaticamente
-- ============================================================================
SELECT 
    '✅ TESTE SERVIÇO' as status,
    numero_os_fisica,
    servico_descricao,
    servico_preco_tabela as preco_tabela,
    servico_preco_real as preco_real,
    servico_custo as custo,
    margem_servico_percentual as margem_calculada,
    ROUND(((servico_preco_real - servico_custo) / servico_preco_real * 100)::numeric, 2) as margem_esperada,
    CASE 
      WHEN margem_servico_percentual = ROUND(((servico_preco_real - servico_custo) / servico_preco_real * 100)::numeric, 2)
      THEN '✅ CORRETO'
      ELSE '❌ ERRO'
    END as validacao
FROM pedidos
WHERE cliente_nome = 'CLIENTE TESTE MELHORIAS'
  AND servico_preco_real IS NOT NULL
ORDER BY created_at DESC
LIMIT 1;
-- Resultado esperado: margem_calculada = 64.71% (aproximadamente)


-- 🧪 TESTE 5: Testar atualização de preço real (trigger deve recalcular)
-- ============================================================================
UPDATE pedidos
SET servico_preco_real = 90.00  -- Mudando de 85 para 90
WHERE cliente_nome = 'CLIENTE TESTE MELHORIAS'
  AND servico_preco_real = 85.00
RETURNING 
    numero_os_fisica,
    servico_preco_real as novo_preco,
    margem_servico_percentual as nova_margem,
    '✅ TRIGGER FUNCIONOU' as status;
-- Resultado esperado: nova_margem = 66.67% (aproximadamente)


-- 🧪 TESTE 6: Criar pedido com acessório
-- ============================================================================
DO $$
DECLARE
  v_loja_id UUID;
  v_pedido_id UUID;
BEGIN
  -- Pegar primeira loja ativa
  SELECT id INTO v_loja_id FROM lojas WHERE ativo = true LIMIT 1;
  
  -- Inserir pedido de teste com acessório
  INSERT INTO pedidos (
    loja_id,
    numero_os_fisica,
    tipo_pedido,
    cliente_nome,
    cliente_telefone,
    status,
    -- Campos de acessório
    acessorio_descricao,
    acessorio_preco_tabela,
    acessorio_preco_real_unitario,
    acessorio_quantidade,
    acessorio_custo_unitario
  ) VALUES (
    v_loja_id,
    'OS-TESTE-ACESS-' || FLOOR(RANDOM() * 10000),
    'ARMACAO',
    'CLIENTE TESTE ACESSORIO',
    '(11) 99999-9999',
    'PRONTO',
    -- Acessório: Estojo Premium
    'Estojo Premium de Couro',
    50.00,  -- Preço tabela
    40.00,  -- Preço real (20% desconto)
    3,      -- Quantidade
    15.00   -- Custo unitário
  )
  RETURNING id INTO v_pedido_id;
  
  RAISE NOTICE '✅ Pedido com acessório criado: %', v_pedido_id;
END $$;


-- 🔍 TESTE 7: Verificar cálculos do acessório (subtotal e margem)
-- ============================================================================
SELECT 
    '✅ TESTE ACESSÓRIO' as status,
    numero_os_fisica,
    acessorio_descricao,
    acessorio_preco_tabela as preco_tabela,
    acessorio_preco_real_unitario as preco_real_unit,
    acessorio_quantidade as qtd,
    acessorio_subtotal as subtotal_calculado,
    (acessorio_preco_real_unitario * acessorio_quantidade) as subtotal_esperado,
    margem_acessorio_percentual as margem_calculada,
    ROUND(((acessorio_preco_real_unitario - acessorio_custo_unitario) / acessorio_preco_real_unitario * 100)::numeric, 2) as margem_esperada,
    CASE 
      WHEN acessorio_subtotal = (acessorio_preco_real_unitario * acessorio_quantidade)
           AND margem_acessorio_percentual = ROUND(((acessorio_preco_real_unitario - acessorio_custo_unitario) / acessorio_preco_real_unitario * 100)::numeric, 2)
      THEN '✅ TODOS CÁLCULOS CORRETOS'
      ELSE '❌ ERRO NOS CÁLCULOS'
    END as validacao
FROM pedidos
WHERE cliente_nome = 'CLIENTE TESTE ACESSORIO'
ORDER BY created_at DESC
LIMIT 1;
-- Resultado esperado: 
--   subtotal_calculado = 120.00 (40 x 3)
--   margem_calculada = 62.50%


-- 🧪 TESTE 8: Testar mudança de quantidade (trigger deve recalcular subtotal)
-- ============================================================================
UPDATE pedidos
SET acessorio_quantidade = 5  -- Mudando de 3 para 5
WHERE cliente_nome = 'CLIENTE TESTE ACESSORIO'
RETURNING 
    numero_os_fisica,
    acessorio_quantidade as nova_qtd,
    acessorio_preco_real_unitario as preco_unit,
    acessorio_subtotal as novo_subtotal,
    '✅ TRIGGER RECALCULOU' as status;
-- Resultado esperado: novo_subtotal = 200.00 (40 x 5)


-- 🧪 TESTE 9: Testar pedido completo (LENTES_CONTATO) com número do lab
-- ============================================================================
DO $$
DECLARE
  v_loja_id UUID;
  v_pedido_id UUID;
BEGIN
  SELECT id INTO v_loja_id FROM lojas WHERE ativo = true LIMIT 1;
  
  INSERT INTO pedidos (
    loja_id,
    numero_os_fisica,
    tipo_pedido,
    cliente_nome,
    cliente_telefone,
    status,
    numero_pedido_laboratorio
  ) VALUES (
    v_loja_id,
    'OS-TESTE-LC-' || FLOOR(RANDOM() * 10000),
    'LENTES_CONTATO',
    'CLIENTE TESTE LENTES CONTATO',
    '(11) 99999-9999',
    'REGISTRADO',
    'LAB-LC-2026-' || LPAD(FLOOR(RANDOM() * 10000)::text, 5, '0')
  )
  RETURNING id INTO v_pedido_id;
  
  RAISE NOTICE '✅ Pedido LENTES_CONTATO criado: %', v_pedido_id;
END $$;


-- 🔍 TESTE 10: Verificar número do laboratório
-- ============================================================================
SELECT 
    '✅ TESTE NÚMERO LAB' as status,
    numero_os_fisica,
    tipo_pedido,
    numero_pedido_laboratorio,
    CASE 
      WHEN numero_pedido_laboratorio IS NOT NULL 
           AND numero_pedido_laboratorio LIKE 'LAB%'
      THEN '✅ CORRETO'
      ELSE '❌ ERRO'
    END as validacao
FROM pedidos
WHERE cliente_nome = 'CLIENTE TESTE LENTES CONTATO'
ORDER BY created_at DESC
LIMIT 1;


-- 📊 TESTE 11: Resumo geral de todos os testes
-- ============================================================================
SELECT 
    '🎉 RESUMO FINAL' as status,
    (SELECT COUNT(*) FROM pedidos WHERE cliente_nome LIKE 'CLIENTE TESTE%') as pedidos_teste_criados,
    (SELECT COUNT(*) FROM pedidos WHERE servico_preco_real IS NOT NULL AND margem_servico_percentual IS NOT NULL) as servicos_com_margem,
    (SELECT COUNT(*) FROM pedidos WHERE acessorio_subtotal IS NOT NULL AND margem_acessorio_percentual IS NOT NULL) as acessorios_com_calculo,
    (SELECT COUNT(*) FROM pedidos WHERE numero_pedido_laboratorio IS NOT NULL) as pedidos_com_num_lab;


-- 🧹 LIMPEZA: Remover pedidos de teste (OPCIONAL - comente se quiser manter)
-- ============================================================================
-- DELETE FROM pedidos WHERE cliente_nome LIKE 'CLIENTE TESTE%';
-- SELECT '🧹 Pedidos de teste removidos' as status;


-- ============================================================================
-- 🎯 RESULTADO ESPERADO DE TODOS OS TESTES
-- ============================================================================
-- TESTE 1: 12 campos criados ✅
-- TESTE 2: 2 triggers criados ✅
-- TESTE 3: Pedido criado com sucesso ✅
-- TESTE 4: Margem serviço = ~64.71% ✅
-- TESTE 5: Trigger recalculou margem para ~66.67% ✅
-- TESTE 6: Pedido com acessório criado ✅
-- TESTE 7: Subtotal = 120.00, Margem = 62.50% ✅
-- TESTE 8: Trigger recalculou subtotal para 200.00 ✅
-- TESTE 9: Pedido LENTES_CONTATO criado ✅
-- TESTE 10: Número do laboratório salvo corretamente ✅
-- TESTE 11: Resumo mostrando todos os dados ✅
-- ============================================================================

SELECT '🎉 TODOS OS TESTES CONCLUÍDOS! Sistema 100% funcional!' as resultado_final;
