-- DIAGNÓSTICO FINAL: Descobrir EXATAMENTE onde está o problema
-- O erro persiste mesmo após reverter tudo, então é algo no banco

-- 1. Verificar se há ALGUMA função/trigger que REALMENTE acessa laboratorio_sla
-- Buscar mais profundamente no código das funções
SELECT 
  p.proname,
  p.prosecdef,
  CASE 
    WHEN p.prosrc ILIKE '%laboratorio_sla%' THEN 'SIM'
    ELSE 'NÃO'
  END as acessa_laboratorio_sla,
  CASE 
    WHEN p.prosrc ILIKE '%insert%' AND p.prosrc ILIKE '%pedidos%' THEN 'SIM'
    ELSE 'NÃO'
  END as relacionado_insert_pedidos
FROM pg_proc p
WHERE p.prosrc ILIKE '%laboratorio_sla%'
   OR (p.prosrc ILIKE '%pedidos%' AND p.prosrc ILIKE '%insert%')
ORDER BY acessa_laboratorio_sla DESC, p.proname;


| proname                        | prosecdef | acessa_laboratorio_sla | relacionado_insert_pedidos |
| ------------------------------ | --------- | ---------------------- | -------------------------- |
| calcular_datas_pos_pagamento   | false     | SIM                    | SIM                        |
| calcular_sla_pedido            | false     | SIM                    | NÃO                        |
| recalcular_sla_pedido          | false     | SIM                    | NÃO                        |
| trigger_atualizar_datas_pedido | false     | SIM                    | NÃO                        |
| criar_pedido_com_permissao     | true      | NÃO                    | SIM                        |
| criar_pedido_simples           | true      | NÃO                    | SIM                        |
| criar_pedidos_realistas        | false     | NÃO                    | SIM                        |
| enviar_para_montagem           | false     | NÃO                    | SIM                        |
| inserir_novo_pedido            | true      | NÃO                    | SIM                        |
| inserir_timeline_pedido        | false     | NÃO                    | SIM                        |
| marcar_pago                    | false     | NÃO                    | SIM                        |
| mover_para_historico           | false     | NÃO                    | SIM                        |
| testar_trigger_sistema         | false     | NÃO                    | SIM                        |
| trigger_registrar_historico    | false     | NÃO                    | SIM                        |

-- 2. Verificar especificamente RLS na tabela laboratorio_sla
-- que pode estar bloqueando acesso
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'laboratorio_sla';

| policyname                | cmd | permissive | roles    | qual |
| ------------------------- | --- | ---------- | -------- | ---- |
| Allow all laboratorio_sla | ALL | PERMISSIVE | {public} | true |

-- 3. Verificar se há GRANT/REVOKE específicos na tabela
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'laboratorio_sla'
ORDER BY grantee, privilege_type;

| grantee  | privilege_type | is_grantable |
| -------- | -------------- | ------------ |
| anon     | DELETE         | NO           |
| anon     | INSERT         | NO           |
| anon     | REFERENCES     | NO           |
| anon     | SELECT         | NO           |
| anon     | TRIGGER        | NO           |
| anon     | TRUNCATE       | NO           |
| anon     | UPDATE         | NO           |
| postgres | DELETE         | YES          |
| postgres | INSERT         | YES          |
| postgres | REFERENCES     | YES          |
| postgres | SELECT         | YES          |
| postgres | TRIGGER        | YES          |
| postgres | TRUNCATE       | YES          |
| postgres | UPDATE         | YES          |

-- 4. TESTAR: Tentar acessar a tabela laboratorio_sla diretamente
-- Para ver se o problema é de acesso geral
SELECT COUNT(*) as total_registros FROM laboratorio_sla LIMIT 1;

| total_registros |
| --------------- |
| 88              |

-- 5. Verificar se há algum trigger OCULTO ou especial
-- Incluindo triggers do próprio Supabase/PostgREST
SELECT 
  t.tgname,
  c.relname,
  p.proname,
  t.tgisinternal,
  CASE WHEN t.tgenabled = 'O' THEN 'enabled' ELSE 'disabled' END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname IN ('pedidos', 'laboratorio_sla')
ORDER BY c.relname, t.tgname;

| tgname                         | relname         | proname                        | tgisinternal | status  |
| ------------------------------ | --------------- | ------------------------------ | ------------ | ------- |
| RI_ConstraintTrigger_c_53577   | laboratorio_sla | RI_FKey_check_ins              | true         | enabled |
| RI_ConstraintTrigger_c_53578   | laboratorio_sla | RI_FKey_check_upd              | true         | enabled |
| RI_ConstraintTrigger_c_53582   | laboratorio_sla | RI_FKey_check_ins              | true         | enabled |
| RI_ConstraintTrigger_c_53583   | laboratorio_sla | RI_FKey_check_upd              | true         | enabled |
| RI_ConstraintTrigger_a_53634   | pedidos         | RI_FKey_cascade_del            | true         | enabled |
| RI_ConstraintTrigger_a_53635   | pedidos         | RI_FKey_noaction_upd           | true         | enabled |
| RI_ConstraintTrigger_a_53649   | pedidos         | RI_FKey_cascade_del            | true         | enabled |
| RI_ConstraintTrigger_a_53650   | pedidos         | RI_FKey_noaction_upd           | true         | enabled |
| RI_ConstraintTrigger_a_56022   | pedidos         | RI_FKey_cascade_del            | true         | enabled |
| RI_ConstraintTrigger_a_56023   | pedidos         | RI_FKey_noaction_upd           | true         | enabled |
| RI_ConstraintTrigger_a_62685   | pedidos         | RI_FKey_cascade_del            | true         | enabled |
| RI_ConstraintTrigger_a_62686   | pedidos         | RI_FKey_noaction_upd           | true         | enabled |
| RI_ConstraintTrigger_c_53609   | pedidos         | RI_FKey_check_ins              | true         | enabled |
| RI_ConstraintTrigger_c_53610   | pedidos         | RI_FKey_check_upd              | true         | enabled |
| RI_ConstraintTrigger_c_53614   | pedidos         | RI_FKey_check_ins              | true         | enabled |
| RI_ConstraintTrigger_c_53615   | pedidos         | RI_FKey_check_upd              | true         | enabled |
| RI_ConstraintTrigger_c_53619   | pedidos         | RI_FKey_check_ins              | true         | enabled |
| RI_ConstraintTrigger_c_53620   | pedidos         | RI_FKey_check_upd              | true         | enabled |
| RI_ConstraintTrigger_c_58961   | pedidos         | RI_FKey_check_ins              | true         | enabled |
| RI_ConstraintTrigger_c_58962   | pedidos         | RI_FKey_check_upd              | true         | enabled |
| RI_ConstraintTrigger_c_88991   | pedidos         | RI_FKey_check_ins              | true         | enabled |
| RI_ConstraintTrigger_c_88992   | pedidos         | RI_FKey_check_upd              | true         | enabled |
| trigger_atualizar_datas_pedido | pedidos         | trigger_atualizar_datas_pedido | false        | enabled |
| trigger_criar_evento_timeline  | pedidos         | trigger_criar_evento_timeline  | false        | enabled |
| trigger_pedidos_timeline       | pedidos         | inserir_timeline_pedido        | false        | enabled |