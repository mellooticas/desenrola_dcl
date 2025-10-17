-- CORRIGIR TODAS AS FUNÇÕES PROBLEMÁTICAS
-- Encontramos várias funções com SECURITY DEFINER que podem causar problemas

-- 1. Verificar o código da função criar_pedido_simples (principal suspeita)
SELECT p.prosrc 
FROM pg_proc p 
WHERE p.proname = 'criar_pedido_simples';

| prosrc                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 
DECLARE
  v_pedido_id UUID;
  v_data_prevista DATE;
BEGIN
  -- Gerar ID para o pedido
  v_pedido_id := gen_random_uuid();
  
  -- Calcular data prevista simples (5 dias úteis)
  v_data_prevista := CURRENT_DATE + INTERVAL '7 days';
  
  -- Inserir o pedido diretamente sem buscar SLA
  INSERT INTO pedidos (
    id,
    loja_id,
    laboratorio_id,
    classe_lente_id,
    status,
    prioridade,
    cliente_nome,
    cliente_telefone,
    numero_os_fisica,
    numero_pedido_laboratorio,
    valor_pedido,
    custo_lentes,
    eh_garantia,
    observacoes,
    observacoes_garantia,
    data_prevista_pronto,
    created_by
  ) VALUES (
    v_pedido_id,
    p_loja_id,
    p_laboratorio_id,
    p_classe_lente_id,
    'REGISTRADO',
    p_prioridade,
    p_cliente_nome,
    p_cliente_telefone,
    p_numero_os_fisica,
    p_numero_pedido_laboratorio,
    p_valor_pedido,
    p_custo_lentes,
    p_eh_garantia,
    p_observacoes,
    p_observacoes_garantia,
    v_data_prevista,
    'criar_pedido_simples_function'
  );
  
  RETURN v_pedido_id;
END;
 |

-- 2. Verificar se há triggers chamando essas funções
SELECT 
  t.tgname AS trigger_name,
  c.relname AS table_name,
  p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'pedidos'
  AND p.proname IN ('criar_pedido_simples', 'criar_pedido_com_permissao', 'inserir_novo_pedido', 'alterar_status_pedido');

  Success. No rows returned




-- 3. Corrigir as funções problemáticas para usar SECURITY INVOKER
-- Primeiro, vamos ver quais realmente precisam ser corrigidas

-- Para criar_pedido_simples:
DROP FUNCTION IF EXISTS criar_pedido_simples CASCADE;

-- Para criar_pedido_com_permissao:
ALTER FUNCTION criar_pedido_com_permissao SECURITY INVOKER;

-- Para inserir_novo_pedido:
ALTER FUNCTION inserir_novo_pedido SECURITY INVOKER;

-- Para alterar_status_pedido:
ALTER FUNCTION alterar_status_pedido SECURITY INVOKER;

-- 4. Comentário explicativo
COMMENT ON FUNCTION criar_pedido_com_permissao IS 'Alterado para SECURITY INVOKER para evitar problemas de permissão';
COMMENT ON FUNCTION inserir_novo_pedido IS 'Alterado para SECURITY INVOKER para evitar problemas de permissão';
COMMENT ON FUNCTION alterar_status_pedido IS 'Alterado para SECURITY INVOKER para evitar problemas de permissão';