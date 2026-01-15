-- ============================================================
-- DIAGNÓSTICO RÁPIDO - Status Atual das Migrações
-- ============================================================

-- 1. Campos de lentes criados?
SELECT 
  COUNT(*) as campos_lente_criados,
  STRING_AGG(column_name, ', ' ORDER BY column_name) as quais_campos
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name IN (
    'grupo_canonico_id', 'lente_selecionada_id', 'fornecedor_lente_id',
    'preco_lente', 'custo_lente', 'margem_lente_percentual',
    'nome_lente', 'nome_grupo_canonico', 'tratamentos_lente',
    'selecao_automatica', 'lente_metadata'
  );

| campos_lente_criados | quais_campos                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11                   | custo_lente, fornecedor_lente_id, grupo_canonico_id, lente_metadata, lente_selecionada_id, margem_lente_percentual, nome_grupo_canonico, nome_lente, preco_lente, selecao_automatica, tratamentos_lente |


-- 2. Status 'pendente' existe?
SELECT 
  COUNT(*) as status_pendente_existe,
  STRING_AGG(enumlabel::text, ', ' ORDER BY enumsortorder) as todos_status
FROM pg_enum 
WHERE enumtypid = 'status_pedido'::regtype;

| status_pendente_existe | todos_status                                                  |
| ---------------------- | ------------------------------------------------------------- |
| 7                      | pendente, pago, producao, pronto, enviado, entregue, MONTAGEM |


-- 3. View v_pedidos_kanban tem campos novos?
SELECT 
  COUNT(*) as campos_view_kanban
FROM information_schema.columns
WHERE table_name = 'v_pedidos_kanban'
  AND column_name IN ('nome_lente', 'badge_margem', 'usa_catalogo_lentes');

| campos_view_kanban |
| ------------------ |
| 3                  |

-- 4. View v_kanban_colunas existe?
SELECT 
  COUNT(*) as view_colunas_existe
FROM pg_views 
WHERE viewname = 'v_kanban_colunas';

| view_colunas_existe |
| ------------------- |
| 1                   |

-- 5. Total de pedidos
SELECT COUNT(*) as total_pedidos FROM public.pedidos;

| total_pedidos |
| ------------- |
| 524           |


-- 6. Trigger de margem existe?
SELECT COUNT(*) as trigger_margem
FROM information_schema.triggers
WHERE event_object_table = 'pedidos'
  AND trigger_name LIKE '%margem%';

| trigger_margem |
| -------------- |
| 2              |
