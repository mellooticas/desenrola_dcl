-- =========================================
-- FIX: PERMISSÕES COMPLETAS - TODAS AS TABELAS
-- =========================================
-- Resolve permissões para TODAS as tabelas do sistema

-- 1. Dar GRANT completo para anon e authenticated em TODAS as tabelas principais
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE pedidos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE controle_os TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE os_sequencia TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE usuarios TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE lojas TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE laboratorios TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE classes_lente TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE montadores TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE pedido_eventos TO anon, authenticated;

-- 2. Dar permissões em views também
GRANT SELECT ON v_pedidos_kanban TO anon, authenticated;

-- 3. Criar policies permissivas para as tabelas que precisam
-- os_sequencia
DROP POLICY IF EXISTS anon_all_access ON os_sequencia;
DROP POLICY IF EXISTS authenticated_all_access ON os_sequencia;

CREATE POLICY anon_all_access ON os_sequencia
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY authenticated_all_access ON os_sequencia
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- pedido_eventos
DROP POLICY IF EXISTS anon_all_access ON pedido_eventos;
DROP POLICY IF EXISTS authenticated_all_access ON pedido_eventos;

CREATE POLICY anon_all_access ON pedido_eventos
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY authenticated_all_access ON pedido_eventos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Verificar todas as tabelas que ainda NÃO têm permissão
SELECT 
  t.tablename,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_privileges tp
      WHERE tp.table_name = t.tablename
      AND tp.grantee = 'anon'
      AND tp.privilege_type = 'UPDATE'
    ) THEN '✅ OK'
    ELSE '❌ FALTA'
  END as status_anon
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.tablename NOT LIKE 'pg_%'
  AND t.tablename NOT LIKE 'sql_%'
ORDER BY t.tablename;


| tablename                     | status_anon |
| ----------------------------- | ----------- |
| alertas                       | ✅ OK        |
| classes_lente                 | ✅ OK        |
| clientes                      | ✅ OK        |
| colaboradores                 | ❌ FALTA     |
| controle_os                   | ✅ OK        |
| desafios                      | ❌ FALTA     |
| desafios_participacao         | ❌ FALTA     |
| laboratorio_sla               | ✅ OK        |
| laboratorios                  | ✅ OK        |
| loja_acoes_customizadas       | ❌ FALTA     |
| loja_configuracoes_horario    | ❌ FALTA     |
| lojas                         | ✅ OK        |
| missao_templates              | ❌ FALTA     |
| missoes_diarias               | ❌ FALTA     |
| montadores                    | ✅ OK        |
| notificacoes                  | ❌ FALTA     |
| os_nao_lancadas               | ✅ OK        |
| os_sequencia                  | ✅ OK        |
| pedido_eventos                | ✅ OK        |
| pedido_tratamentos            | ✅ OK        |
| pedidos                       | ✅ OK        |
| pedidos_historico             | ✅ OK        |
| pedidos_timeline              | ❌ FALTA     |
| renovacao_diaria              | ❌ FALTA     |
| role_permissions              | ❌ FALTA     |
| role_status_permissoes_legacy | ❌ FALTA     |
| sistema_config                | ✅ OK        |
| tratamentos                   | ✅ OK        |
| user_sessions                 | ❌ FALTA     |
| usuarios                      | ✅ OK        |

