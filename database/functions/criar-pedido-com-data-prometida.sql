-- ===================================================================
-- ATUALIZAÇÃO: Função criar_pedido_simples com data prometida manual
-- Data: 13/10/2025
-- Descrição: Adiciona parâmetro para data prometida ao cliente
-- ===================================================================

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
  p_prioridade TEXT DEFAULT 'NORMAL',
  p_data_prometida_cliente DATE DEFAULT NULL,  -- Data prometida manual ao cliente
  p_tratamentos_ids UUID[] DEFAULT NULL,       -- Array de tratamentos
  p_montador_id UUID DEFAULT NULL              -- Montador (atribuído apenas no Kanban)
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pedido_id UUID;
  v_data_prevista DATE;
  v_data_sla_lab DATE;
  v_margem_seguranca INTEGER := 2;
  v_sla_base_dias INTEGER := 5;
BEGIN
  -- Gerar ID para o pedido
  v_pedido_id := gen_random_uuid();
  
  -- Buscar SLA base da classe de lente
  BEGIN
    SELECT sla_base_dias INTO v_sla_base_dias
    FROM classes_lente 
    WHERE id = p_classe_lente_id;
  EXCEPTION
    WHEN OTHERS THEN
      v_sla_base_dias := 5; -- fallback
  END;
  
  -- Buscar margem de segurança da loja
  BEGIN
    SELECT COALESCE(margem_seguranca_dias, 2) INTO v_margem_seguranca
    FROM lojas 
    WHERE id = p_loja_id;
  EXCEPTION
    WHEN OTHERS THEN
      v_margem_seguranca := 2; -- fallback
  END;
  
  -- Calcular datas
  v_data_sla_lab := CURRENT_DATE + (v_sla_base_dias || ' days')::INTERVAL;
  
  -- Se não foi informada data prometida, calcular baseada no SLA + margem
  IF p_data_prometida_cliente IS NULL THEN
    v_data_prevista := CURRENT_DATE + ((v_sla_base_dias + v_margem_seguranca) || ' days')::INTERVAL;
  ELSE
    v_data_prevista := p_data_prometida_cliente;
  END IF;
  
  -- Inserir o pedido com separação correta das datas
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
    data_prevista_pronto,      -- Data antiga (compatibilidade)
    data_sla_laboratorio,      -- SLA do laboratório (interno)
    data_prometida,            -- Data prometida ao cliente (comercial)
    montador_id,               -- Montador (NULL na criação, atribuído no Kanban)
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
    v_data_prevista,           -- Compatibilidade com sistema antigo
    v_data_sla_lab,           -- SLA interno do laboratório
    COALESCE(p_data_prometida_cliente, v_data_prevista), -- Data prometida ao cliente (manual ou calculada)
    p_montador_id,             -- Montador (NULL na criação)
    'sistema_criar_pedido'
  );
  
  -- Inserir tratamentos se houver
  IF p_tratamentos_ids IS NOT NULL AND array_length(p_tratamentos_ids, 1) > 0 THEN
    INSERT INTO pedido_tratamentos (pedido_id, tratamento_id)
    SELECT v_pedido_id, unnest(p_tratamentos_ids);
  END IF;
  
  RETURN v_pedido_id;
END;
$$;

-- Definir comentários para documentação
COMMENT ON FUNCTION criar_pedido_simples IS 'Cria pedido com separação entre SLA Lab e Data Prometida ao Cliente';

-- Conceder permissões
GRANT EXECUTE ON FUNCTION criar_pedido_simples TO authenticated;
GRANT EXECUTE ON FUNCTION criar_pedido_simples TO service_role;