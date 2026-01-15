-- =====================================================
-- 🔧 CORREÇÃO: Montagens + Edição de Pedidos
-- =====================================================
-- Problemas identificados:
-- 1. View v_pedidos_kanban não inclui dados do montador
-- 2. RLS de UPDATE precisa ser verificada
-- 3. Permissões das views de montagens para role 'financeiro'
-- =====================================================

-- =====================================================
-- PARTE 1: Atualizar view v_pedidos_kanban para incluir montador
-- =====================================================

DROP VIEW IF EXISTS v_pedidos_kanban CASCADE;

CREATE VIEW v_pedidos_kanban AS
SELECT 
  p.*,
  -- Dados da Loja
  l.nome as loja_nome,
  l.codigo as loja_codigo,
  l.margem_seguranca_dias,
  l.alerta_sla_dias,
  -- Dados do Laboratório
  lab.nome as laboratorio_nome,
  lab.codigo as laboratorio_codigo,
  lab.sla_padrao_dias,
  -- Dados da Classe de Lente
  cl.nome as classe_nome,
  cl.categoria as classe_categoria,
  cl.cor_badge as classe_cor,
  cl.sla_base_dias as classe_sla_dias,
  -- ✨ NOVO: Dados do Montador
  m.nome as montador_nome,
  m.tipo as montador_tipo,
  m.local_trabalho as montador_local,
  m.contato as montador_contato,
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
LEFT JOIN classes_lente cl ON p.classe_lente_id = cl.id
LEFT JOIN montadores m ON p.montador_id = m.id; -- ✨ Adicionar JOIN com montadores

-- Grant permissions para a view
GRANT SELECT ON v_pedidos_kanban TO authenticated, anon;

-- Configurar security_invoker para usar permissões do usuário
ALTER VIEW v_pedidos_kanban SET (security_invoker = true);

-- =====================================================
-- PARTE 2: Corrigir RLS de UPDATE para pedidos
-- =====================================================

-- Remover policies antigas de UPDATE
DROP POLICY IF EXISTS "pedidos_update_policy" ON pedidos;
DROP POLICY IF EXISTS "Usuarios podem atualizar pedidos da sua loja" ON pedidos;
DROP POLICY IF EXISTS "pedidos_update_emergency" ON pedidos;

-- Criar policy de UPDATE mais permissiva
CREATE POLICY "pedidos_update_policy" ON pedidos
  FOR UPDATE
  TO authenticated
  USING (
    -- Regra 1: Usuário da mesma loja
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
    OR 
    -- Regra 2: Gestor (acesso total)
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role IN ('gestor', 'dcl', 'financeiro')
    )
    OR
    -- Regra 3: Usuário do laboratório vinculado
    laboratorio_id IN (
      SELECT laboratorio_id FROM usuarios WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    -- Garante que o usuário não mude a loja do pedido para uma que ele não tem acesso
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role IN ('gestor', 'dcl', 'financeiro')
    )
    OR
    laboratorio_id IN (
      SELECT laboratorio_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- =====================================================
-- PARTE 3: Garantir permissões para views de montagens
-- =====================================================

-- Garantir que as views de montagens existem e têm permissões corretas
GRANT SELECT ON view_relatorio_montagens TO authenticated, anon;
GRANT SELECT ON view_kpis_montadores TO authenticated, anon;
GRANT SELECT ON view_performance_diaria_montadores TO authenticated, anon;
GRANT SELECT ON view_ranking_montadores TO authenticated, anon;

-- Configurar security_invoker para todas as views de montagens
ALTER VIEW view_relatorio_montagens SET (security_invoker = true);
ALTER VIEW view_kpis_montadores SET (security_invoker = true);
ALTER VIEW view_performance_diaria_montadores SET (security_invoker = true);
ALTER VIEW view_ranking_montadores SET (security_invoker = true);

-- =====================================================
-- PARTE 4: Verificar policies RLS na tabela montadores
-- =====================================================

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "montadores_select_policy" ON montadores;

-- Criar policy de SELECT para montadores (todos os autenticados podem ver)
CREATE POLICY "montadores_select_policy" ON montadores
  FOR SELECT
  TO authenticated
  USING (
    -- Todos os usuários autenticados podem ver montadores ativos
    ativo = true
    OR
    -- Gestores podem ver todos (incluindo inativos)
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role IN ('gestor', 'dcl')
    )
  );

-- =====================================================
-- VALIDAÇÃO: Verificar se as correções funcionaram
-- =====================================================

-- 1. Verificar se view tem os campos do montador
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'v_pedidos_kanban' 
  AND column_name LIKE 'montador%'
ORDER BY column_name;

-- Resultado esperado:
-- | column_name       |
-- |-------------------|
-- | montador_contato  |
-- | montador_local    |
-- | montador_nome     |
-- | montador_tipo     |

-- 2. Testar query da view com dados de montador
SELECT 
  id,
  numero_sequencial,
  cliente_nome,
  montador_id,
  montador_nome,
  montador_tipo,
  montador_local
FROM v_pedidos_kanban
WHERE montador_id IS NOT NULL
LIMIT 5;

-- 3. Verificar policies de UPDATE em pedidos
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'pedidos' 
  AND cmd = 'UPDATE'
ORDER BY policyname;

-- Resultado esperado:
-- Deve ter apenas 1 policy: "pedidos_update_policy"

-- 4. Verificar policies de SELECT em montadores
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'montadores'
ORDER BY policyname;

-- 5. Verificar permissões das views de montagens
SELECT 
  table_schema,
  table_name,
  privilege_type,
  grantee
FROM information_schema.table_privileges
WHERE table_name IN (
  'view_relatorio_montagens',
  'view_kpis_montadores', 
  'view_performance_diaria_montadores',
  'view_ranking_montadores',
  'v_pedidos_kanban'
)
  AND grantee IN ('authenticated', 'anon')
ORDER BY table_name, grantee;

-- =====================================================
-- TESTE FINAL: Simular query do frontend
-- =====================================================

-- Query que o frontend faz na página de detalhes do pedido
SELECT 
  id,
  numero_sequencial,
  cliente_nome,
  status,
  loja_nome,
  laboratorio_nome,
  classe_nome,
  montador_nome,
  montador_local,
  montador_contato,
  montador_tipo
FROM v_pedidos_kanban
WHERE id = (SELECT id FROM pedidos LIMIT 1);

-- Query que o frontend faz na página de montagens
SELECT 
  id,
  nome,
  tipo,
  local_trabalho,
  contato,
  ativo
FROM montadores
WHERE ativo = true
LIMIT 5;

-- =====================================================
-- RESUMO DAS CORREÇÕES
-- =====================================================
/*
✅ 1. View v_pedidos_kanban agora inclui:
   - montador_nome
   - montador_tipo
   - montador_local
   - montador_contato

✅ 2. RLS de UPDATE em pedidos permite:
   - Usuários da mesma loja
   - Gestores, DCL e Financeiro
   - Usuários do laboratório vinculado

✅ 3. Permissões das views de montagens:
   - Todas as 4 views têm SELECT para authenticated e anon
   - Todas configuradas com security_invoker = true

✅ 4. RLS em montadores:
   - Todos os usuários autenticados podem ver montadores ativos
   - Gestores e DCL podem ver todos (incluindo inativos)

PRÓXIMOS PASSOS:
1. Executar este script no Supabase SQL Editor
2. Adicionar /montagens ao middleware (src/middleware.ts)
3. Testar edição de pedidos
4. Testar visualização de detalhes do pedido
5. Testar acesso ao módulo de montagens com usuário financeiro
*/
