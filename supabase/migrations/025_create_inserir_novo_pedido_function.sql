-- Migration: 025 - Criar função inserir_novo_pedido
-- Description: Criar função SQL para inserir novos pedidos com todos os campos
-- Date: 2024

-- Função para inserir novo pedido completo
CREATE OR REPLACE FUNCTION inserir_novo_pedido(
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
) RETURNS TABLE(
  id UUID,
  numero_sequencial TEXT,
  loja_id UUID,
  laboratorio_id UUID,
  classe_lente_id UUID,
  status TEXT,
  prioridade TEXT,
  cliente_nome TEXT,
  cliente_telefone TEXT,
  numero_os_fisica TEXT,
  numero_pedido_laboratorio TEXT,
  valor_pedido DECIMAL(10,2),
  custo_lentes DECIMAL(10,2),
  eh_garantia BOOLEAN,
  observacoes TEXT,
  observacoes_garantia TEXT,
  data_prevista_pronto DATE,
  created_at TIMESTAMPTZ,
  created_by TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pedido_id UUID;
  v_sla_dias INTEGER := 5;
  v_data_prevista DATE;
  v_numero_sequencial TEXT;
BEGIN
  -- Gerar ID para o pedido
  v_pedido_id := gen_random_uuid();
  
  -- Buscar SLA da classe de lente
  SELECT COALESCE(sla_base_dias, 5) INTO v_sla_dias
  FROM classes_lente 
  WHERE classes_lente.id = p_classe_lente_id;
  
  -- Ajustar SLA por prioridade
  CASE p_prioridade
    WHEN 'BAIXA' THEN v_sla_dias := v_sla_dias + 2;
    WHEN 'ALTA' THEN v_sla_dias := v_sla_dias - 1;
    WHEN 'URGENTE' THEN v_sla_dias := v_sla_dias - 3;
    ELSE v_sla_dias := v_sla_dias; -- NORMAL
  END CASE;
  
  -- Garantir pelo menos 1 dia
  v_sla_dias := GREATEST(v_sla_dias, 1);
  
  -- Calcular data prevista (soma dias corridos por simplicidade)
  v_data_prevista := CURRENT_DATE + INTERVAL '1 day' * v_sla_dias;
  
  -- Inserir o pedido
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
    'inserir_novo_pedido_function'
  );
  
  -- Retornar o pedido criado
  RETURN QUERY
  SELECT 
    p.id,
    p.numero_sequencial,
    p.loja_id,
    p.laboratorio_id,
    p.classe_lente_id,
    p.status,
    p.prioridade,
    p.cliente_nome,
    p.cliente_telefone,
    p.numero_os_fisica,
    p.numero_pedido_laboratorio,
    p.valor_pedido,
    p.custo_lentes,
    p.eh_garantia,
    p.observacoes,
    p.observacoes_garantia,
    p.data_prevista_pronto,
    p.created_at,
    p.created_by
  FROM pedidos p
  WHERE p.id = v_pedido_id;
  
END;
$$;

-- Dar permissão para usuários autenticados
GRANT EXECUTE ON FUNCTION inserir_novo_pedido TO authenticated;

-- Comentário da função
COMMENT ON FUNCTION inserir_novo_pedido IS 'Função para inserir novos pedidos com todos os campos obrigatórios e opcionais, incluindo cálculo automático de SLA';