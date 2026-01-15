-- ============================================================
-- VALIDAÇÃO FINAL - Verificar GRANTs
-- ============================================================

-- 1. Verificar permissões na v_pedidos_kanban
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'v_pedidos_kanban'
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee;

| grantee       | privilege_type |
| ------------- | -------------- |
| anon          | SELECT         |
| authenticated | SELECT         |


-- 2. Verificar permissões na v_kanban_colunas
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'v_kanban_colunas'
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee;

| grantee       | privilege_type |
| ------------- | -------------- |
| anon          | SELECT         |
| authenticated | SELECT         |


-- 3. Testar SELECT nas views (deve retornar dados)
SELECT COUNT(*) as total_pedidos_kanban FROM public.v_pedidos_kanban;

| total_pedidos_kanban |
| -------------------- |
| 524                  |

SELECT COUNT(*) as total_colunas FROM public.v_kanban_colunas;

| total_colunas |
| ------------- |
| 8             |
