-- INVESTIGAR PEDIDO_EVENTOS - Novo problema identificado
-- Agora o erro é "permission denied for table pedido_eventos"

-- 1. Verificar quais funções/triggers acessam pedido_eventos
SELECT 
  p.proname,
  p.prosecdef,
  CASE 
    WHEN p.prosrc ILIKE '%pedido_eventos%' THEN 'SIM'
    ELSE 'NÃO'
  END as acessa_pedido_eventos
FROM pg_proc p
WHERE p.prosrc ILIKE '%pedido_eventos%'
ORDER BY p.proname;

| proname                       | prosecdef | acessa_pedido_eventos |
| ----------------------------- | --------- | --------------------- |
| calcular_datas_pos_pagamento  | false     | SIM                   |
| enviar_para_montagem          | false     | SIM                   |
| log_status_change             | false     | SIM                   |
| marcar_pago                   | false     | SIM                   |
| mover_para_historico          | false     | SIM                   |
| registrar_evento              | false     | SIM                   |
| testar_trigger_sistema        | false     | SIM                   |
| trigger_criar_evento_timeline | false     | SIM                   |
| trigger_pedido_mudanca        | false     | SIM                   |

-- 2. Verificar se a tabela pedido_eventos existe e suas permissões
SELECT schemaname, tablename, tableowner 
FROM pg_tables 
WHERE tablename = 'pedido_eventos';


| schemaname | tablename      | tableowner |
| ---------- | -------------- | ---------- |
| public     | pedido_eventos | postgres   |

-- 3. Verificar permissões na tabela pedido_eventos
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'pedido_eventos'
ORDER BY grantee, privilege_type;

| grantee  | privilege_type |
| -------- | -------------- |
| anon     | DELETE         |
| anon     | INSERT         |
| anon     | REFERENCES     |
| anon     | SELECT         |
| anon     | TRIGGER        |
| anon     | TRUNCATE       |
| anon     | UPDATE         |
| postgres | DELETE         |
| postgres | INSERT         |
| postgres | REFERENCES     |
| postgres | SELECT         |
| postgres | TRIGGER        |
| postgres | TRUNCATE       |
| postgres | UPDATE         |

-- 4. Verificar triggers ativos restantes (após desabilitar o primeiro)
SELECT 
  t.tgname AS trigger_name,
  p.proname AS function_name,
  CASE WHEN t.tgenabled = 'O' THEN 'enabled' ELSE 'disabled' END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'pedidos'
  AND NOT t.tgisinternal
ORDER BY t.tgname;

| trigger_name                   | function_name                  | status   |
| ------------------------------ | ------------------------------ | -------- |
| trigger_atualizar_datas_pedido | trigger_atualizar_datas_pedido | disabled |
| trigger_criar_evento_timeline  | trigger_criar_evento_timeline  | enabled  |
| trigger_pedidos_timeline       | inserir_timeline_pedido        | enabled  |

-- 5. TEMPORARIAMENTE desabilitar os outros triggers também
ALTER TABLE pedidos DISABLE TRIGGER trigger_criar_evento_timeline;

Success. No rows returned



ALTER TABLE pedidos DISABLE TRIGGER trigger_pedidos_timeline;
Success. No rows returned


