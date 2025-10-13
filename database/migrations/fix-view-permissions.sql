-- ===================================================================
-- CORREÇÃO: Permissões para v_pedidos_kanban
-- Data: 13/10/2025  
-- Descrição: Adicionar RLS e permissões para nova view
-- ===================================================================

-- 1. VIEWS NÃO PRECISAM DE RLS - HERDAM DAS TABELAS BASE
-- Views herdam automaticamente as políticas RLS das tabelas subjacentes

-- 2. GRANT EXPLÍCITO DE PERMISSÕES PARA A VIEW
-- Conceder SELECT na view para role authenticated
GRANT SELECT ON v_pedidos_kanban TO authenticated;

-- Conceder SELECT na view para role anon (se necessário para API)
GRANT SELECT ON v_pedidos_kanban TO anon;

-- Conceder SELECT na view para service_role
GRANT SELECT ON v_pedidos_kanban TO service_role;

-- 4. VERIFICAR PERMISSÕES NAS TABELAS BASE
-- Garantir que as tabelas base têm as permissões corretas

-- Verificar pedidos
GRANT SELECT ON pedidos TO authenticated;
GRANT SELECT ON pedidos TO anon;
GRANT SELECT ON pedidos TO service_role;

-- Verificar lojas  
GRANT SELECT ON lojas TO authenticated;
GRANT SELECT ON lojas TO anon;
GRANT SELECT ON lojas TO service_role;

-- Verificar laboratorios
GRANT SELECT ON laboratorios TO authenticated;
GRANT SELECT ON laboratorios TO anon;
GRANT SELECT ON laboratorios TO service_role;

-- Verificar classes_lente
GRANT SELECT ON classes_lente TO authenticated;
GRANT SELECT ON classes_lente TO anon;
GRANT SELECT ON classes_lente TO service_role;

-- ===================================================================
-- VALIDAÇÃO: Testar permissões
-- ===================================================================

-- Testar acesso à view
SELECT COUNT(*) as total_registros FROM v_pedidos_kanban;

-- Verificar permissões concedidas
SELECT 
  schemaname,
  tablename,
  grantee,
  privilege_type
FROM information_schema_role_table_grants 
WHERE tablename = 'v_pedidos_kanban';

-- ===================================================================
-- ALTERNATIVA: Recriar view com permissões explícitas
-- ===================================================================

-- Se ainda der erro, recriar a view com SECURITY DEFINER
DROP VIEW IF EXISTS v_pedidos_kanban;

CREATE VIEW v_pedidos_kanban 
WITH (security_barrier = false) 
AS
SELECT 
  p.*,
  l.nome as loja_nome,
  l.codigo as loja_codigo,
  l.margem_seguranca_dias,
  l.alerta_sla_dias,
  lab.nome as laboratorio_nome,
  lab.codigo as laboratorio_codigo,
  lab.sla_padrao_dias,
  cl.nome as classe_nome,
  cl.categoria as classe_categoria,
  cl.cor_badge as classe_cor,
  cl.sla_base_dias as classe_sla_dias,
  -- Calcular se está em atraso (SLA lab vs hoje)
  CASE 
    WHEN p.data_sla_laboratorio < CURRENT_DATE THEN true
    ELSE false
  END as sla_atrasado,
  -- Calcular se precisa alertar (próximo do SLA)
  CASE 
    WHEN p.data_sla_laboratorio <= CURRENT_DATE + INTERVAL '1 day' * COALESCE(l.alerta_sla_dias, 1) THEN true
    ELSE false
  END as sla_alerta,
  -- Diferença em dias
  (p.data_sla_laboratorio - CURRENT_DATE) as dias_para_sla,
  (p.data_prometida - CURRENT_DATE) as dias_para_promessa
FROM pedidos p
LEFT JOIN lojas l ON p.loja_id = l.id
LEFT JOIN laboratorios lab ON p.laboratorio_id = lab.id  
LEFT JOIN classes_lente cl ON p.classe_lente_id = cl.id;

-- Aplicar permissões novamente
GRANT SELECT ON v_pedidos_kanban TO authenticated, anon, service_role;