-- ============================================================================
-- FIX: RLS para Views do Controle OS
-- ============================================================================
-- Problema: Views podem não ter policies RLS corretas
-- Solução: Garantir que authenticated users possam ver os dados
-- ============================================================================

-- 1. Verificar RLS nas tabelas base
SELECT 
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('controle_os', 'pedidos', 'lojas');


| tablename   | rls_habilitado |
| ----------- | -------------- |
| controle_os | false          |
| lojas       | false          |
| pedidos     | true           |


-- 2. Ver policies existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('controle_os', 'pedidos', 'lojas')
ORDER BY tablename, policyname;


| schemaname | tablename | policyname                 | permissive | roles           | cmd    | qual |
| ---------- | --------- | -------------------------- | ---------- | --------------- | ------ | ---- |
| public     | lojas     | Allow all lojas            | PERMISSIVE | {public}        | ALL    | true |
| public     | pedidos   | policy_anon_select_pedidos | PERMISSIVE | {anon}          | SELECT | true |
| public     | pedidos   | policy_universal_pedidos   | PERMISSIVE | {authenticated} | ALL    | true |

-- 3. Habilitar RLS na tabela controle_os se não estiver
ALTER TABLE controle_os ENABLE ROW LEVEL SECURITY;

-- 4. Criar policy para SELECT na controle_os
DROP POLICY IF EXISTS "Usuarios podem ver controle_os de sua loja" ON controle_os;

CREATE POLICY "Usuarios podem ver controle_os de sua loja"
ON controle_os
FOR SELECT
TO authenticated
USING (
  -- Gestores e DCL veem tudo
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = auth.uid()
    AND u.role IN ('gestor', 'dcl')
  )
  OR
  -- Outros usuários veem apenas sua loja
  loja_id IN (
    SELECT u.loja_id 
    FROM usuarios u 
    WHERE u.id = auth.uid()
  )
);

-- 5. Garantir permissões nas views
GRANT SELECT ON view_controle_os_gaps TO authenticated;
GRANT SELECT ON view_controle_os_estatisticas TO authenticated;
GRANT SELECT ON controle_os TO authenticated;

-- 6. Testar a query que o frontend usa
SELECT 
  COUNT(*) as total_gaps,
  loja_id
FROM view_controle_os_gaps
WHERE precisa_atencao = TRUE
GROUP BY loja_id;

-- 7. Testar estatísticas
SELECT * FROM view_controle_os_estatisticas;


| loja_id                              | loja_nome | total_os_esperadas | total_lancadas | total_nao_lancadas | total_justificadas | total_pendentes | total_precisa_atencao | percentual_lancamento |
| ------------------------------------ | --------- | ------------------ | -------------- | ------------------ | ------------------ | --------------- | --------------------- | --------------------- |
| e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | Suzano    | 2006               | 2006           | 0                  | 0                  | 0               | 0                     | 100.00                |



-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- RLS habilitado na controle_os com policy correta
-- Views acessíveis por authenticated users
-- Queries retornando dados conforme loja do usuário
-- ============================================================================
