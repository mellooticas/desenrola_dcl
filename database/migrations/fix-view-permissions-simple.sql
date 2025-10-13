-- ===================================================================
-- CORREÇÃO SIMPLES: Permissões para v_pedidos_kanban
-- Data: 13/10/2025  
-- Descrição: Corrigir permissões da view (sem RLS, apenas GRANTs)
-- ===================================================================

-- PASSO 1: Conceder permissões na view
GRANT SELECT ON v_pedidos_kanban TO authenticated;
GRANT SELECT ON v_pedidos_kanban TO anon;
GRANT SELECT ON v_pedidos_kanban TO service_role;

-- PASSO 2: Garantir permissões nas tabelas base
GRANT SELECT ON pedidos TO authenticated, anon, service_role;
GRANT SELECT ON lojas TO authenticated, anon, service_role;
GRANT SELECT ON laboratorios TO authenticated, anon, service_role;
GRANT SELECT ON classes_lente TO authenticated, anon, service_role;

-- PASSO 3: Testar se funcionou
SELECT COUNT(*) as total_registros FROM v_pedidos_kanban LIMIT 1;

| total_registros |
| --------------- |
| 145             |