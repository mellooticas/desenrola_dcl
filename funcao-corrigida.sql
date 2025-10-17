-- ===================================================================
-- CORREÇÃO URGENTE: Função criar_pedido_simples completa e corrigida
-- Data: 14/10/2025
-- Descrição: Corrige data prometida e adiciona suporte a tratamentos
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
  p_data_prometida_cliente DATE DEFAULT NULL,  -- Data prometida manual
  p_tratamentos_ids UUID[] DEFAULT NULL        -- Array de tratamentos
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
  
  -- Ajustar SLA por prioridade
  CASE UPPER(p_prioridade)
    WHEN 'BAIXA' THEN v_sla_base_dias := v_sla_base_dias + 2;
    WHEN 'ALTA' THEN v_sla_base_dias := GREATEST(1, v_sla_base_dias - 1);
    WHEN 'URGENTE' THEN v_sla_base_dias := GREATEST(1, v_sla_base_dias - 3);
    ELSE v_sla_base_dias := v_sla_base_dias; -- NORMAL
  END CASE;
  
  -- Calcular datas
  v_data_sla_lab := CURRENT_DATE + (v_sla_base_dias || ' days')::INTERVAL;
  v_data_prevista := CURRENT_DATE + ((v_sla_base_dias + v_margem_seguranca) || ' days')::INTERVAL;
  
  -- Inserir pedido principal
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
    data_prevista_pronto,      -- Compatibilidade
    data_sla_laboratorio,      -- SLA técnico laboratorio
    data_prometida,            -- Data prometida ao cliente (CORRIGIDA)
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
    v_data_prevista,           -- Compatibilidade
    v_data_sla_lab,           -- SLA laboratorio
    COALESCE(p_data_prometida_cliente, v_data_prevista), -- ✅ CORRIGIDO: Usar data manual
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

-- Permissões
GRANT EXECUTE ON FUNCTION criar_pedido_simples TO authenticated;
GRANT EXECUTE ON FUNCTION criar_pedido_simples TO service_role;

-- Teste
SELECT 'Função criar_pedido_simples CORRIGIDA e aplicada!' as status;