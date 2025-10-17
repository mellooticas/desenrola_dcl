-- CORREÇÃO DA FUNÇÃO: Resolver ambiguidade de numero_sequencial
-- O problema é que numero_sequencial existe como coluna da tabela e como variável

CREATE OR REPLACE FUNCTION inserir_pedido_sem_trigger(
  p_loja_id UUID,
  p_laboratorio_id UUID,
  p_classe_lente_id UUID,
  p_status TEXT,
  p_prioridade TEXT,
  p_cliente_nome TEXT,
  p_cliente_telefone TEXT DEFAULT NULL,
  p_observacoes TEXT DEFAULT NULL,
  p_eh_garantia BOOLEAN DEFAULT FALSE,
  p_data_pedido DATE DEFAULT CURRENT_DATE,
  p_data_prometida DATE DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  numero_sequencial INTEGER,
  cliente_nome TEXT,
  data_pedido DATE,
  data_prometida DATE,
  status TEXT,
  prioridade TEXT
) AS $$
DECLARE
  novo_pedido_id UUID;
  v_numero_sequencial INTEGER;  -- MUDANÇA: prefixo v_ para evitar ambiguidade
BEGIN
  -- Gerar UUID para o novo pedido
  novo_pedido_id := gen_random_uuid();
  
  -- Gerar número sequencial (próximo da sequência)
  SELECT COALESCE(MAX(p.numero_sequencial), 0) + 1   -- MUDANÇA: alias p. para tabela
  INTO v_numero_sequencial 
  FROM pedidos p;
  
  -- Calcular data prometida se não fornecida
  IF p_data_prometida IS NULL THEN
    CASE p_prioridade
      WHEN 'URGENTE' THEN p_data_prometida := p_data_pedido + INTERVAL '2 days';
      WHEN 'ALTA' THEN p_data_prometida := p_data_pedido + INTERVAL '4 days';
      WHEN 'BAIXA' THEN p_data_prometida := p_data_pedido + INTERVAL '7 days';
      ELSE p_data_prometida := p_data_pedido + INTERVAL '5 days'; -- NORMAL
    END CASE;
  END IF;
  
  -- DESABILITAR TEMPORARIAMENTE OS TRIGGERS
  PERFORM set_config('session_replication_role', 'replica', true);
  
  -- Inserir o pedido SEM triggers
  INSERT INTO pedidos (
    id,
    numero_sequencial,
    loja_id,
    laboratorio_id,
    classe_lente_id,
    status,
    prioridade,
    cliente_nome,
    cliente_telefone,
    observacoes,
    eh_garantia,
    data_pedido,
    data_prometida,
    created_at,
    updated_at
  ) VALUES (
    novo_pedido_id,
    v_numero_sequencial,  -- MUDANÇA: usar variável com prefixo
    p_loja_id,
    p_laboratorio_id,
    p_classe_lente_id,
    p_status,
    p_prioridade,
    p_cliente_nome,
    p_cliente_telefone,
    p_observacoes,
    p_eh_garantia,
    p_data_pedido,
    p_data_prometida,
    NOW(),
    NOW()
  );
  
  -- REABILITAR OS TRIGGERS
  PERFORM set_config('session_replication_role', 'origin', true);
  
  -- Retornar o pedido inserido
  RETURN QUERY
  SELECT 
    novo_pedido_id,
    v_numero_sequencial,  -- MUDANÇA: usar variável com prefixo
    p_cliente_nome,
    p_data_pedido,
    p_data_prometida,
    p_status,
    p_prioridade;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;