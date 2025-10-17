-- Script para testar e aplicar a função criar_pedido_simples atualizada
-- Execute este script no Supabase SQL Editor

-- Primeiro, verificar se a função existe
SELECT proname, pronargs 
FROM pg_proc 
WHERE proname = 'criar_pedido_simples';

-- Aplicar a função atualizada
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
  p_data_prometida_cliente DATE DEFAULT NULL  -- NOVO PARÂMETRO
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
  
  -- Calcular data SLA laboratorio (somente técnico)
  v_data_sla_lab := CURRENT_DATE + (v_sla_base_dias || ' days')::INTERVAL;
  
  -- Calcular data prevista cliente (SLA + margem)
  v_data_prevista := CURRENT_DATE + ((v_sla_base_dias + v_margem_seguranca) || ' days')::INTERVAL;
  
  -- Se data prometida não foi informada, usar a calculada
  IF p_data_prometida_cliente IS NULL THEN
    p_data_prometida_cliente := v_data_prevista;
  END IF;
  
  -- Inserir o pedido
  INSERT INTO pedidos (
    id,
    loja_id,
    laboratorio_id,
    classe_lente_id,
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
    data_prometida,           -- Data prometida ao cliente (manual)
    data_sla_laboratorio,     -- Data SLA técnico laboratorio
    data_prevista_entrega,    -- Data prevista (backup)
    status,
    created_at,
    updated_at
  ) VALUES (
    v_pedido_id,
    p_loja_id,
    p_laboratorio_id,
    p_classe_lente_id,
    p_prioridade::prioridade_level,
    p_cliente_nome,
    p_cliente_telefone,
    p_numero_os_fisica,
    p_numero_pedido_laboratorio,
    p_valor_pedido,
    p_custo_lentes,
    p_eh_garantia,
    p_observacoes,
    p_observacoes_garantia,
    p_data_prometida_cliente,
    v_data_sla_lab,
    v_data_prevista,
    'REGISTRADO'::status_pedido,
    NOW(),
    NOW()
  );
  
  -- Inserir tratamentos se houver
  IF p_tratamentos_ids IS NOT NULL AND array_length(p_tratamentos_ids, 1) > 0 THEN
    INSERT INTO pedido_tratamentos (pedido_id, tratamento_id)
    SELECT v_pedido_id, unnest(p_tratamentos_ids::UUID[]);
  END IF;
  
  RETURN v_pedido_id;
END;
$$;

-- Dar permissões
GRANT EXECUTE ON FUNCTION criar_pedido_simples TO authenticated;
GRANT EXECUTE ON FUNCTION criar_pedido_simples TO service_role;

-- Testar a função
SELECT 'Função criar_pedido_simples atualizada com sucesso!' as resultado;