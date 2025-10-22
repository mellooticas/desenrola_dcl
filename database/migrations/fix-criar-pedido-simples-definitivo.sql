-- ===================================================================
-- CORREÇÃO DEFINITIVA: Remover todas as versões de criar_pedido_simples
-- Data: 22/10/2025
-- Descrição: Remove todas as sobrecargas da função e cria versão única
-- ===================================================================

-- Dropar todas as possíveis assinaturas da função
-- Versão com 13 parâmetros (antiga)
DROP FUNCTION IF EXISTS public.criar_pedido_simples(
  UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, BOOLEAN, TEXT, TEXT, TEXT
) CASCADE;

-- Versão com 14 parâmetros
DROP FUNCTION IF EXISTS public.criar_pedido_simples(
  UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, BOOLEAN, TEXT, TEXT, TEXT, DATE
) CASCADE;

-- Versão com 15 parâmetros
DROP FUNCTION IF EXISTS public.criar_pedido_simples(
  UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, BOOLEAN, TEXT, TEXT, TEXT, DATE, UUID[]
) CASCADE;

-- Versão com 16 parâmetros
DROP FUNCTION IF EXISTS public.criar_pedido_simples(
  UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, BOOLEAN, TEXT, TEXT, TEXT, DATE, UUID[], UUID
) CASCADE;

-- Garantir que qualquer versão restante seja removida
DO $$ 
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN 
    SELECT oid::regprocedure AS func_signature
    FROM pg_proc 
    WHERE proname = 'criar_pedido_simples' 
      AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %s CASCADE', func_record.func_signature);
    RAISE NOTICE 'Dropped function: %', func_record.func_signature;
  END LOOP;
END $$;

-- ===================================================================
-- CRIAR FUNÇÃO DEFINITIVA COM 16 PARÂMETROS
-- ===================================================================

CREATE OR REPLACE FUNCTION public.criar_pedido_simples(
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
  p_data_prometida_cliente DATE DEFAULT NULL,
  p_tratamentos_ids UUID[] DEFAULT NULL,
  p_montador_id UUID DEFAULT NULL
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
      v_sla_base_dias := 5;
  END;
  
  -- Buscar margem de segurança da loja
  BEGIN
    SELECT COALESCE(margem_seguranca_dias, 2) INTO v_margem_seguranca
    FROM lojas 
    WHERE id = p_loja_id;
  EXCEPTION
    WHEN OTHERS THEN
      v_margem_seguranca := 2;
  END;
  
  -- Calcular datas
  v_data_sla_lab := CURRENT_DATE + (v_sla_base_dias || ' days')::INTERVAL;
  
  -- Se não foi informada data prometida, calcular baseada no SLA + margem
  IF p_data_prometida_cliente IS NULL THEN
    v_data_prevista := CURRENT_DATE + ((v_sla_base_dias + v_margem_seguranca) || ' days')::INTERVAL;
  ELSE
    v_data_prevista := p_data_prometida_cliente;
  END IF;
  
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
    data_sla_laboratorio,
    data_prometida,
    montador_id,
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
    v_data_sla_lab,
    COALESCE(p_data_prometida_cliente, v_data_prevista),
    p_montador_id,
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

-- Comentário e permissões
COMMENT ON FUNCTION public.criar_pedido_simples IS 'Cria pedido com SLA Lab, Data Prometida e Montador (16 parâmetros)';

GRANT EXECUTE ON FUNCTION public.criar_pedido_simples TO authenticated;
GRANT EXECUTE ON FUNCTION public.criar_pedido_simples TO service_role;
GRANT EXECUTE ON FUNCTION public.criar_pedido_simples TO anon;

-- Forçar reload do schema cache do PostgREST
NOTIFY pgrst, 'reload schema';

-- Verificar a função criada
SELECT 
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS parameters,
  pg_get_function_result(p.oid) AS return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'criar_pedido_simples';
