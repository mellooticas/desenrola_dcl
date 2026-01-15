-- =========================================
-- FIX DEFINITIVO: TODAS AS TABELAS
-- =========================================

-- Dar GRANT completo para TODAS as tabelas do schema public
DO $$
DECLARE
  tabela TEXT;
BEGIN
  FOR tabela IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE %I TO anon, authenticated', tabela);
    RAISE NOTICE 'Permissões concedidas para tabela: %', tabela;
  END LOOP;
END $$;

-- Dar GRANT em todas as views
DO $$
DECLARE
  view_name TEXT;
BEGIN
  FOR view_name IN 
    SELECT viewname 
    FROM pg_views 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('GRANT SELECT ON %I TO anon, authenticated', view_name);
    RAISE NOTICE 'Permissões SELECT concedidas para view: %', view_name;
  END LOOP;
END $$;

-- Criar policies permissivas para tabelas que ainda não têm
-- (apenas para tabelas que têm RLS ativo)
DO $$
DECLARE
  tabela TEXT;
  tem_rls BOOLEAN;
BEGIN
  FOR tabela IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
      AND rowsecurity = true
  LOOP
    -- Remover policies antigas
    EXECUTE format('DROP POLICY IF EXISTS anon_all_access ON %I', tabela);
    EXECUTE format('DROP POLICY IF EXISTS authenticated_all_access ON %I', tabela);
    
    -- Criar policies permissivas
    EXECUTE format('CREATE POLICY anon_all_access ON %I FOR ALL TO anon USING (true) WITH CHECK (true)', tabela);
    EXECUTE format('CREATE POLICY authenticated_all_access ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tabela);
    
    RAISE NOTICE 'Policies criadas para tabela: %', tabela;
  END LOOP;
END $$;

-- Verificar resultado final
SELECT 
  t.tablename,
  t.rowsecurity as tem_rls,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_privileges tp
      WHERE tp.table_name = t.tablename
      AND tp.grantee = 'anon'
      AND tp.privilege_type = 'UPDATE'
    ) THEN '✅'
    ELSE '❌'
  END as grant_ok,
  (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = t.tablename AND p.roles = '{anon}') as policies_anon
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.tablename NOT LIKE 'pg_%'
  AND t.tablename NOT LIKE 'sql_%'
ORDER BY t.tablename;


| tablename                     | tem_rls | grant_ok | policies_anon |
| ----------------------------- | ------- | -------- | ------------- |
| alertas                       | true    | ✅        | 1             |
| classes_lente                 | false   | ✅        | 0             |
| clientes                      | true    | ✅        | 1             |
| colaboradores                 | true    | ✅        | 1             |
| controle_os                   | true    | ✅        | 1             |
| desafios                      | false   | ✅        | 0             |
| desafios_participacao         | false   | ✅        | 0             |
| laboratorio_sla               | false   | ✅        | 0             |
| laboratorios                  | false   | ✅        | 0             |
| loja_acoes_customizadas       | false   | ✅        | 0             |
| loja_configuracoes_horario    | false   | ✅        | 0             |
| lojas                         | false   | ✅        | 0             |
| missao_templates              | false   | ✅        | 0             |
| missoes_diarias               | true    | ✅        | 1             |
| montadores                    | true    | ✅        | 2             |
| notificacoes                  | true    | ✅        | 1             |
| os_nao_lancadas               | true    | ✅        | 1             |
| os_sequencia                  | true    | ✅        | 1             |
| pedido_eventos                | true    | ✅        | 1             |
| pedido_tratamentos            | true    | ✅        | 1             |
| pedidos                       | true    | ✅        | 1             |
| pedidos_historico             | true    | ✅        | 1             |
| pedidos_timeline              | true    | ✅        | 1             |
| renovacao_diaria              | false   | ✅        | 0             |
| role_permissions              | true    | ✅        | 1             |
| role_status_permissoes_legacy | true    | ✅        | 1             |
| sistema_config                | false   | ✅        | 0             |
| tratamentos                   | true    | ✅        | 1             |
| user_sessions                 | true    | ✅        | 1             |
| usuarios                      | false   | ✅        | 0             |

