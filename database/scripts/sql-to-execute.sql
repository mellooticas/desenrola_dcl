-- EXECUTE THIS SQL IN SUPABASE DASHBOARD
-- Function to insert pedidos without permission issues

CREATE OR REPLACE FUNCTION criar_pedido_simples(
  p_loja_id UUID,
  p_laboratorio_id UUID,
  p_classe_lente_id UUID,
  p_cliente_nome TEXT,
  p_cliente_telefone TEXT DEFAULT NULL,
  p_numero_os_fisica TEXT DEFAULT NULL,
  p_numero_pedido_laboratorio TEXT DEFAULT NULL,
  p_valor_pedido DECIMAL(10,2) DEFAULT NULL,
  p_custo_lentes DECIMAL(10,2) DEFAULT NULL,
  p_eh_garantia BOOLEAN DEFAULT FALSE,
  p_observacoes TEXT DEFAULT NULL,
  p_observacoes_garantia TEXT DEFAULT NULL,
  p_prioridade TEXT DEFAULT 'NORMAL'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION criar_pedido_simples TO authenticated;
GRANT EXECUTE ON FUNCTION criar_pedido_simples TO service_role;