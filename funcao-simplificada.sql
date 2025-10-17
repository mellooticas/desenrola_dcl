-- VERSÃO SIMPLIFICADA: SEM TENTAR DESABILITAR TRIGGERS
-- Vamos inserir normalmente, mas calcular tudo na função para evitar dependências externas

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
  v_numero_sequencial INTEGER;
  v_data_prometida DATE;
BEGIN
  -- Gerar UUID para o novo pedido
  novo_pedido_id := gen_random_uuid();
  
  -- Gerar número sequencial
  SELECT COALESCE(MAX(p.numero_sequencial), 0) + 1
  INTO v_numero_sequencial 
  FROM pedidos p;
  
  -- Calcular data prometida se não fornecida
  IF p_data_prometida IS NULL THEN
    CASE p_prioridade
      WHEN 'URGENTE' THEN v_data_prometida := p_data_pedido + INTERVAL '2 days';
      WHEN 'ALTA' THEN v_data_prometida := p_data_pedido + INTERVAL '4 days';
      WHEN 'BAIXA' THEN v_data_prometida := p_data_pedido + INTERVAL '7 days';
      ELSE v_data_prometida := p_data_pedido + INTERVAL '5 days';
    END CASE;
  ELSE
    v_data_prometida := p_data_prometida;
  END IF;
  
  -- Inserir o pedido com TODOS os campos calculados
  -- Para evitar que triggers precisem acessar laboratorio_sla
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
    -- Campos adicionais para evitar que triggers calculem
    data_prevista_pronto,
    data_sla_laboratorio,
    created_at,
    updated_at,
    created_by
  ) VALUES (
    novo_pedido_id,
    v_numero_sequencial,
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
    v_data_prometida,
    -- Preencher campos que o trigger calcularia
    v_data_prometida,  -- data_prevista_pronto
    v_data_prometida,  -- data_sla_laboratorio  
    NOW(),
    NOW(),
    'funcao_bypass'
  );
  
  -- Retornar o pedido inserido
  RETURN QUERY
  SELECT 
    novo_pedido_id,
    v_numero_sequencial,
    p_cliente_nome,
    p_data_pedido,
    v_data_prometida,
    p_status,
    p_prioridade;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;