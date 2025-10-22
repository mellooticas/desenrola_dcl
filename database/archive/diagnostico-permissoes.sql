-- ================================================================
-- DIAGNÓSTICO: Verificar estado atual das permissões
-- Execute este SQL no Supabase para ver o que está faltando
-- ================================================================

-- 1. Verificar políticas RLS da tabela pedidos_timeline
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'pedidos_timeline'
ORDER BY policyname;


| schemaname | tablename        | policyname                                      | permissive | roles           | cmd    | qual                                  | with_check                            |
| ---------- | ---------------- | ----------------------------------------------- | ---------- | --------------- | ------ | ------------------------------------- | ------------------------------------- |
| public     | pedidos_timeline | Permitir leitura para todos                     | PERMISSIVE | {authenticated} | SELECT | true                                  | null                                  |
| public     | pedidos_timeline | Sistema pode inserir na timeline                | PERMISSIVE | {authenticated} | INSERT | null                                  | true                                  |
| public     | pedidos_timeline | Todos podem visualizar timeline                 | PERMISSIVE | {public}        | SELECT | true                                  | null                                  |
| public     | pedidos_timeline | Usuários autenticados podem atualizar timeline  | PERMISSIVE | {public}        | UPDATE | (auth.role() = 'authenticated'::text) | null                                  |
| public     | pedidos_timeline | Usuários autenticados podem inserir no timeline | PERMISSIVE | {authenticated} | INSERT | null                                  | true                                  |
| public     | pedidos_timeline | Usuários autenticados podem inserir timeline    | PERMISSIVE | {public}        | INSERT | null                                  | (auth.role() = 'authenticated'::text) |
| public     | pedidos_timeline | Usuários autenticados podem ver timeline        | PERMISSIVE | {authenticated} | SELECT | true                                  | null                                  |
| public     | pedidos_timeline | allow_all_timeline                              | PERMISSIVE | {public}        | ALL    | true                                  | true                                  |
-- ================================================================

-- RESULTADO ESPERADO:
-- Deve retornar 2 políticas:
-- 1. "Usuários autenticados podem inserir no timeline" (cmd = INSERT)
-- 2. "Usuários autenticados podem ver timeline" (cmd = SELECT)
-- ================================================================

-- 2. Verificar permissões diretas na tabela
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'pedidos_timeline'
ORDER BY grantee, privilege_type;

| grantee       | privilege_type |
| ------------- | -------------- |
| authenticated | INSERT         |
| authenticated | SELECT         |
| authenticated | UPDATE         |
| postgres      | DELETE         |
| postgres      | INSERT         |
| postgres      | REFERENCES     |
| postgres      | SELECT         |
| postgres      | TRIGGER        |
| postgres      | TRUNCATE       |
| postgres      | UPDATE         |
| service_role  | DELETE         |
| service_role  | INSERT         |
| service_role  | SELECT         |
| service_role  | UPDATE         |

-- ================================================================
-- RESULTADO ESPERADO:
-- Deve incluir linhas como:
-- grantee: authenticated | privilege_type: SELECT
-- grantee: authenticated | privilege_type: INSERT
-- grantee: authenticated | privilege_type: UPDATE
-- ================================================================

-- 3. Verificar se RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'pedidos_timeline';


| schemaname | tablename        | rowsecurity |
| ---------- | ---------------- | ----------- |
| public     | pedidos_timeline | true        |

-- ================================================================
-- RESULTADO ESPERADO:
-- rowsecurity = true
-- ================================================================

-- 4. Verificar funções e seu security_type
SELECT 
  routine_name, 
  routine_type,
  security_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name IN ('alterar_status_pedido', 'marcar_pagamento')
ORDER BY routine_name;

| routine_name          | routine_type | security_type | routine_definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------- | ------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| alterar_status_pedido | FUNCTION     | INVOKER       | 
DECLARE
  status_atual VARCHAR(20);
BEGIN
  SELECT status INTO status_atual FROM pedidos WHERE id = pedido_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido não encontrado';
  END IF;
  
  UPDATE pedidos SET
    status = novo_status,
    updated_at = NOW()
  WHERE id = pedido_uuid;
  
  IF observacao IS NOT NULL THEN
    PERFORM registrar_evento(
      pedido_uuid, 'NOTE', 'Observação adicionada',
      observacao, NULL, NULL, usuario
    );
  END IF;
  
  RETURN true;
END;
                                                                                                                                                                                         |
| marcar_pagamento      | FUNCTION     | DEFINER       | 
DECLARE
  pedido_atual RECORD;
BEGIN
  SELECT * INTO pedido_atual FROM pedidos WHERE id = pedido_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido não encontrado';
  END IF;
  
  IF pedido_atual.status NOT IN ('REGISTRADO', 'AG_PAGAMENTO') THEN
    RAISE EXCEPTION 'Pedido não pode receber pagamento neste status';
  END IF;
  
  UPDATE pedidos SET
    status = 'PAGO',
    data_pagamento = data_pag,
    forma_pagamento = forma_pag,
    updated_at = NOW()
  WHERE id = pedido_uuid;
  
  PERFORM registrar_evento(
    pedido_uuid, 'PAYMENT', 'Pagamento confirmado',
    'Forma: ' || forma_pag, pedido_atual.status, 'PAGO', usuario
  );
  
  RETURN true;
END;
 |

-- ================================================================
-- RESULTADO ESPERADO:
-- Ambas as funções devem existir
-- Se security_type = 'INVOKER' (padrão) → problema continua
-- Se security_type = 'DEFINER' → deveria funcionar
-- ================================================================

-- 5. Verificar estrutura da tabela pedidos_timeline
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'pedidos_timeline'
ORDER BY ordinal_position;


| column_name     | data_type                | is_nullable | column_default                               |
| --------------- | ------------------------ | ----------- | -------------------------------------------- |
| id              | uuid                     | NO          | gen_random_uuid()                            |
| pedido_id       | uuid                     | YES         | null                                         |
| status_anterior | text                     | YES         | null                                         |
| status_novo     | text                     | NO          | null                                         |
| responsavel_id  | uuid                     | YES         | '00000000-0000-0000-0000-000000000000'::uuid |
| observacoes     | text                     | YES         | null                                         |
| created_at      | timestamp with time zone | YES         | now()                                        |
| updated_at      | timestamp with time zone | YES         | now()                                        |

-- ================================================================
-- PRÓXIMOS PASSOS:
-- ================================================================
-- Me envie o resultado destes 5 SELECTs e eu vou saber exatamente
-- o que está faltando para corrigir o problema.
-- ================================================================
