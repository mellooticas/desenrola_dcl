-- ===================================================================
-- CORREÇÃO URGENTE: Aplicar função criar_pedido_simples atualizada
-- Execute este script no Supabase SQL Editor
-- ===================================================================

-- 1. Verificar função atual
SELECT 
  p.proname,
  p.pronargs,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p 
WHERE p.proname = 'criar_pedido_simples';

-- 2. Aplicar função corrigida
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
  p_data_prometida_cliente DATE DEFAULT NULL,  -- ✅ NOVO
  p_tratamentos_ids UUID[] DEFAULT NULL        -- ✅ NOVO
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
  -- Gerar ID
  v_pedido_id := gen_random_uuid();
  
  -- Buscar SLA base (com fallback)
  BEGIN
    SELECT COALESCE(sla_base_dias, 5) INTO v_sla_base_dias
    FROM classes_lente 
    WHERE id = p_classe_lente_id;
  EXCEPTION
    WHEN OTHERS THEN v_sla_base_dias := 5;
  END;
  
  -- Buscar margem da loja (com fallback)
  BEGIN
    SELECT COALESCE(margem_seguranca_dias, 2) INTO v_margem_seguranca
    FROM lojas 
    WHERE id = p_loja_id;
  EXCEPTION
    WHEN OTHERS THEN v_margem_seguranca := 2;
  END;
  
  -- Ajustar por prioridade
  CASE UPPER(p_prioridade)
    WHEN 'BAIXA' THEN v_sla_base_dias := v_sla_base_dias + 2;
    WHEN 'ALTA' THEN v_sla_base_dias := GREATEST(1, v_sla_base_dias - 1);
    WHEN 'URGENTE' THEN v_sla_base_dias := GREATEST(1, v_sla_base_dias - 3);
    ELSE v_sla_base_dias := v_sla_base_dias;
  END CASE;
  
  -- Calcular datas
  v_data_sla_lab := CURRENT_DATE + (v_sla_base_dias || ' days')::INTERVAL;
  v_data_prevista := CURRENT_DATE + ((v_sla_base_dias + v_margem_seguranca) || ' days')::INTERVAL;
  
  -- Inserir pedido
  INSERT INTO pedidos (
    id, loja_id, laboratorio_id, classe_lente_id,
    status, prioridade, cliente_nome, cliente_telefone,
    numero_os_fisica, numero_pedido_laboratorio, 
    valor_pedido, custo_lentes, eh_garantia,
    observacoes, observacoes_garantia,
    data_prevista_pronto, data_sla_laboratorio, 
    data_prometida, created_by
  ) VALUES (
    v_pedido_id, p_loja_id, p_laboratorio_id, p_classe_lente_id,
    'REGISTRADO', p_prioridade, p_cliente_nome, p_cliente_telefone,
    p_numero_os_fisica, p_numero_pedido_laboratorio,
    p_valor_pedido, p_custo_lentes, p_eh_garantia,
    p_observacoes, p_observacoes_garantia,
    v_data_prevista, v_data_sla_lab,
    COALESCE(p_data_prometida_cliente, v_data_prevista), -- ✅ CORRIGIDO
    'sistema_criar_pedido'
  );
  
  -- Inserir tratamentos
  IF p_tratamentos_ids IS NOT NULL AND array_length(p_tratamentos_ids, 1) > 0 THEN
    INSERT INTO pedido_tratamentos (pedido_id, tratamento_id)
    SELECT v_pedido_id, unnest(p_tratamentos_ids);
  END IF;
  
  RETURN v_pedido_id;
END;
$$;

-- 3. Aplicar permissões
GRANT EXECUTE ON FUNCTION criar_pedido_simples TO authenticated;
GRANT EXECUTE ON FUNCTION criar_pedido_simples TO service_role;

-- 4. Verificar se foi aplicada
SELECT 'Função criar_pedido_simples APLICADA COM SUCESSO!' as resultado;

-- 5. Verificar nova assinatura
SELECT 
  p.proname,
  p.pronargs,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p 
WHERE p.proname = 'criar_pedido_simples';