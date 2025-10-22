-- ================================================
-- FUNÇÃO: alterar_status_pedido
-- ================================================
-- Altera o status de um pedido e registra no histórico
-- ================================================

CREATE OR REPLACE FUNCTION alterar_status_pedido(
  pedido_uuid UUID,
  novo_status TEXT,
  observacao TEXT DEFAULT NULL,
  usuario TEXT DEFAULT 'Sistema'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  status_anterior TEXT;
  resultado JSON;
BEGIN
  -- Buscar status atual
  SELECT status INTO status_anterior
  FROM pedidos
  WHERE id = pedido_uuid;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pedido não encontrado'
    );
  END IF;

  -- Atualizar status do pedido
  UPDATE pedidos
  SET 
    status = novo_status,
    updated_at = NOW()
  WHERE id = pedido_uuid;

  -- Registrar no histórico (se tabela existir)
  BEGIN
    INSERT INTO pedido_eventos (
      pedido_id,
      tipo_evento,
      status_anterior,
      status_novo,
      observacao,
      usuario_responsavel,
      created_at
    ) VALUES (
      pedido_uuid,
      'MUDANCA_STATUS',
      status_anterior,
      novo_status,
      COALESCE(observacao, 'Status alterado de ' || status_anterior || ' para ' || novo_status),
      usuario,
      NOW()
    );
  EXCEPTION
    WHEN undefined_table THEN
      -- Tabela pedido_eventos não existe, ignorar
      NULL;
  END;

  resultado := json_build_object(
    'success', true,
    'pedido_id', pedido_uuid,
    'status_anterior', status_anterior,
    'status_novo', novo_status,
    'message', 'Status alterado com sucesso'
  );

  RETURN resultado;
END;
$$;

-- Comentário
COMMENT ON FUNCTION alterar_status_pedido IS 'Altera o status de um pedido e registra no histórico';

-- ================================================
-- FUNÇÃO: marcar_pagamento
-- ================================================
-- Marca um pedido como PAGO e registra dados do pagamento
-- ================================================

CREATE OR REPLACE FUNCTION marcar_pagamento(
  pedido_uuid UUID,
  data_pagamento DATE,
  forma_pagamento TEXT,
  usuario TEXT DEFAULT 'Sistema'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  status_atual TEXT;
  resultado JSON;
BEGIN
  -- Buscar status atual
  SELECT status INTO status_atual
  FROM pedidos
  WHERE id = pedido_uuid;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pedido não encontrado'
    );
  END IF;

  -- Verificar se está em AG_PAGAMENTO
  IF status_atual != 'AG_PAGAMENTO' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pedido não está aguardando pagamento. Status atual: ' || status_atual
    );
  END IF;

  -- Atualizar pedido
  UPDATE pedidos
  SET 
    status = 'PAGO',
    data_pagamento = data_pagamento,
    forma_pagamento_confirmada = forma_pagamento,
    updated_at = NOW()
  WHERE id = pedido_uuid;

  -- Registrar no histórico (se tabela existir)
  BEGIN
    INSERT INTO pedido_eventos (
      pedido_id,
      tipo_evento,
      status_anterior,
      status_novo,
      observacao,
      usuario_responsavel,
      created_at
    ) VALUES (
      pedido_uuid,
      'PAGAMENTO',
      'AG_PAGAMENTO',
      'PAGO',
      'Pagamento confirmado - ' || forma_pagamento || ' em ' || data_pagamento::TEXT,
      usuario,
      NOW()
    );
  EXCEPTION
    WHEN undefined_table THEN
      -- Tabela pedido_eventos não existe, ignorar
      NULL;
  END;

  resultado := json_build_object(
    'success', true,
    'pedido_id', pedido_uuid,
    'data_pagamento', data_pagamento,
    'forma_pagamento', forma_pagamento,
    'message', 'Pagamento registrado com sucesso'
  );

  RETURN resultado;
END;
$$;

-- Comentário
COMMENT ON FUNCTION marcar_pagamento IS 'Marca um pedido como PAGO e registra dados do pagamento';
