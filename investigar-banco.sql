-- INVESTIGAR PROBLEMA DO TRIGGER
-- Verificar se a correção foi aplicada corretamente

-- 1. Verificar se a função existe e como está configurada
SELECT 
  p.proname,
  p.prosecdef,  -- true = SECURITY DEFINER, false = SECURITY INVOKER
  p.proowner,
  r.rolname as owner_name
FROM pg_proc p
JOIN pg_roles r ON p.proowner = r.oid
WHERE p.proname = 'inserir_timeline_pedido';

| proname                 | prosecdef | proowner | owner_name |
| ----------------------- | --------- | -------- | ---------- |
| inserir_timeline_pedido | false     | 16384    | postgres   |

-- 2. Verificar triggers na tabela pedidos
SELECT 
  t.tgname AS trigger_name,
  c.relname AS table_name,
  p.proname AS function_name,
  CASE WHEN t.tgenabled = 'O' THEN 'enabled' ELSE 'disabled' END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'pedidos'
  AND NOT t.tgisinternal  -- Excluir triggers internos
ORDER BY t.tgname;

| trigger_name                   | table_name | function_name                  | status  |
| ------------------------------ | ---------- | ------------------------------ | ------- |
| trigger_atualizar_datas_pedido | pedidos    | trigger_atualizar_datas_pedido | enabled |
| trigger_criar_evento_timeline  | pedidos    | trigger_criar_evento_timeline  | enabled |
| trigger_pedidos_timeline       | pedidos    | inserir_timeline_pedido        | enabled |

-- 3. Verificar se existe tabela laboratorio_sla
SELECT schemaname, tablename, tableowner 
FROM pg_tables 
WHERE tablename LIKE '%laboratorio%' 
   OR tablename LIKE '%sla%';

   | schemaname | tablename       | tableowner |
| ---------- | --------------- | ---------- |
| public     | laboratorio_sla | postgres   |
| public     | laboratorios    | postgres   |

-- 4. Verificar permissões na tabela laboratorio_sla (se existir)
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'laboratorio_sla';


| grantee  | table_name      | privilege_type |
| -------- | --------------- | -------------- |
| anon     | laboratorio_sla | INSERT         |
| anon     | laboratorio_sla | SELECT         |
| anon     | laboratorio_sla | UPDATE         |
| anon     | laboratorio_sla | DELETE         |
| anon     | laboratorio_sla | TRUNCATE       |
| anon     | laboratorio_sla | REFERENCES     |
| anon     | laboratorio_sla | TRIGGER        |
| postgres | laboratorio_sla | INSERT         |
| postgres | laboratorio_sla | SELECT         |
| postgres | laboratorio_sla | UPDATE         |
| postgres | laboratorio_sla | DELETE         |
| postgres | laboratorio_sla | TRUNCATE       |
| postgres | laboratorio_sla | REFERENCES     |
| postgres | laboratorio_sla | TRIGGER        |

-- 5. Verificar se há outras funções que podem estar causando problema
SELECT DISTINCT
  p.proname,
  p.prosecdef,
  r.rolname as owner
FROM pg_proc p
JOIN pg_roles r ON p.proowner = r.oid
WHERE p.prosrc LIKE '%laboratorio_sla%'
   OR p.proname LIKE '%sla%'
   OR p.proname LIKE '%pedido%';


   | proname                            | prosecdef | owner          |
| ---------------------------------- | --------- | -------------- |
| alterar_status_pedido              | true      | postgres       |
| auto_entregar_pedido               | false     | postgres       |
| calcular_datas_pos_pagamento       | false     | postgres       |
| calcular_sla                       | false     | postgres       |
| calcular_sla_com_tratamentos       | false     | postgres       |
| calcular_sla_pedido                | false     | postgres       |
| criar_pedido_com_permissao         | true      | postgres       |
| criar_pedido_simples               | true      | postgres       |
| criar_pedidos_realistas            | false     | postgres       |
| get_alertas_sla_criticos           | false     | postgres       |
| get_sla_metricas                   | false     | postgres       |
| get_timeline_sla_7_dias            | false     | postgres       |
| get_tratamentos_pedido             | false     | postgres       |
| inserir_novo_pedido                | true      | postgres       |
| inserir_timeline_pedido            | false     | postgres       |
| recalcular_sla_pedido              | false     | postgres       |
| simular_evolucao_pedidos           | false     | postgres       |
| translate                          | false     | supabase_admin |
| trigger_atualizar_datas_pedido     | false     | postgres       |
| trigger_atualizar_sla              | false     | postgres       |
| trigger_pedido_avancado            | false     | postgres       |
| trigger_pedido_mudanca             | false     | postgres       |
| update_pedidos_timeline_updated_at | false     | postgres       |