-- ============================================================================
-- CORRIGIR FUNÇÃO TRIGGER QUE INSERE EM PEDIDO_EVENTOS
-- ============================================================================
-- Problema: trigger_criar_evento_timeline() não tem SECURITY DEFINER
-- Solução: Recriar a função com SECURITY DEFINER para bypass RLS
-- ============================================================================

-- 1. Verificar triggers ativos
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'pedidos'
  AND trigger_name LIKE '%evento%'
ORDER BY trigger_name;

| trigger_name                  | event_manipulation | action_statement                                 |
| ----------------------------- | ------------------ | ------------------------------------------------ |
| trigger_criar_evento_timeline | INSERT             | EXECUTE FUNCTION trigger_criar_evento_timeline() |
| trigger_criar_evento_timeline | UPDATE             | EXECUTE FUNCTION trigger_criar_evento_timeline() |



-- 2. Recriar a função COM SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.trigger_criar_evento_timeline()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER -- 🔑 CRÍTICO: Permite bypass do RLS
SET search_path = public
AS $function$
BEGIN
  -- Se status mudou, criar evento
  IF (TG_OP = 'INSERT') OR 
     (TG_OP = 'UPDATE' AND (OLD.status IS NULL OR OLD.status != NEW.status)) THEN
    
    INSERT INTO pedido_eventos (
      pedido_id,
      tipo,
      titulo,
      descricao,
      status_anterior,
      status_novo,
      detalhes,
      usuario,
      automatico,
      created_at
    ) VALUES (
      NEW.id,
      'STATUS_CHANGE',
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'Pedido Criado'
        ELSE 'Status Alterado: ' || COALESCE(OLD.status, 'NULL') || ' → ' || NEW.status
      END,
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'Novo pedido registrado no sistema'
        ELSE 'Status alterado de ' || COALESCE(OLD.status, 'NULL') || ' para ' || NEW.status || ' automaticamente'
      END,
      CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
      NEW.status,
      jsonb_build_object(
        'trigger', 'automatico',
        'operacao', TG_OP,
        'numero_sequencial', NEW.numero_sequencial
      ),
      'sistema', -- Campo usuario - sempre 'sistema' para triggers automáticos
      true,
      NOW()
    );
    
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. Recriar a função inserir_timeline_pedido COM SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.inserir_timeline_pedido()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER -- 🔑 CRÍTICO: Permite bypass do RLS
SET search_path = public
AS $$
DECLARE
  v_responsavel_id UUID;
BEGIN
  -- Só registra se o status realmente mudou
  IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
    
    -- Tentar pegar o responsavel_id de forma segura
    BEGIN
      v_responsavel_id := CASE 
        WHEN NEW.updated_by IS NOT NULL AND NEW.updated_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN NEW.updated_by::UUID
        ELSE auth.uid()
      END;
    EXCEPTION WHEN OTHERS THEN
      v_responsavel_id := NULL;
    END;
    
    -- Inserir registro na timeline
    INSERT INTO pedidos_timeline (
      pedido_id,
      status_anterior,
      status_novo,
      responsavel_id,
      observacoes,
      created_at
    ) VALUES (
      NEW.id,
      CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
      NEW.status,
      v_responsavel_id,
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'Pedido criado'
        WHEN NEW.status = 'CANCELADO' THEN 'Pedido cancelado'
        WHEN NEW.status = 'ENTREGUE' THEN 'Pedido entregue ao cliente'
        WHEN NEW.status = 'AG_PAGAMENTO' THEN 'Aguardando confirmação de pagamento'
        WHEN NEW.status = 'PAGO' THEN 'Pagamento confirmado'
        WHEN NEW.status = 'PRODUCAO' THEN 'Enviado para produção'
        WHEN NEW.status = 'PRONTO' THEN 'Produção concluída'
        WHEN NEW.status = 'ENVIADO' THEN 'Enviado para a loja'
        WHEN NEW.status = 'CHEGOU' THEN 'Chegou na loja'
        ELSE 'Status atualizado: ' || OLD.status || ' → ' || NEW.status
      END,
      COALESCE(NEW.updated_at, NEW.created_at, NOW())
    );
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Verificar se as funções foram criadas com SECURITY DEFINER
SELECT 
  p.proname as function_name,
  CASE 
    WHEN p.prosecdef THEN 'SECURITY DEFINER ✅'
    ELSE 'SECURITY INVOKER ⚠️'
  END as security_type,
  r.rolname as owner
FROM pg_proc p
JOIN pg_roles r ON p.proowner = r.oid
WHERE p.proname IN ('trigger_criar_evento_timeline', 'inserir_timeline_pedido')
ORDER BY p.proname;

| function_name                 | security_type      | owner    |
| ----------------------------- | ------------------ | -------- |
| inserir_timeline_pedido       | SECURITY DEFINER ✅ | postgres |
| trigger_criar_evento_timeline | SECURITY DEFINER ✅ | postgres |


-- 5. Garantir que as tabelas têm permissões
GRANT SELECT, INSERT, UPDATE ON pedido_eventos TO authenticated;
GRANT SELECT, INSERT, UPDATE ON pedidos_timeline TO authenticated;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Funções recriadas COM SECURITY DEFINER
-- Triggers continuam funcionando mas agora com bypass de RLS
-- Permissões garantidas nas tabelas
-- ============================================================================
