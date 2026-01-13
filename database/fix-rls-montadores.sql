-- FIX: Adicionar políticas RLS para tabela montadores

-- 1. Verificar políticas atuais
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'montadores';


| schemaname | tablename  | policyname                              | permissive | roles           | cmd    | qual                                                                                                                                        |
| ---------- | ---------- | --------------------------------------- | ---------- | --------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| public     | montadores | Montadores: INSERT/UPDATE para gestores | PERMISSIVE | {authenticated} | ALL    | (EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.role = ANY (ARRAY['admin'::text, 'gestor'::text]))))) |
| public     | montadores | Montadores: SELECT para autenticados    | PERMISSIVE | {authenticated} | SELECT | true                                                                                                                                        |
| public     | montadores | montadores_all                          | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                        |
| public     | montadores | montadores_delete                       | PERMISSIVE | {authenticated} | DELETE | true                                                                                                                                        |
| public     | montadores | montadores_insert                       | PERMISSIVE | {authenticated} | INSERT | null                                                                                                                                        |
| public     | montadores | montadores_select                       | PERMISSIVE | {authenticated} | SELECT | true                                                                                                                                        |
| public     | montadores | montadores_update                       | PERMISSIVE | {authenticated} | UPDATE | true                                                                                                                                        |


-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Montadores visíveis para todos" ON montadores;
DROP POLICY IF EXISTS "Usuarios podem visualizar montadores" ON montadores;
DROP POLICY IF EXISTS "select_montadores_policy" ON montadores;

-- 3. Criar política de SELECT para todos os usuários autenticados
CREATE POLICY "Usuários autenticados podem visualizar montadores"
ON montadores
FOR SELECT
TO authenticated
USING (true);

-- 4. Permitir também para o role anon (para testes)
CREATE POLICY "Usuários anônimos podem visualizar montadores"
ON montadores
FOR SELECT
TO anon
USING (true);

-- 5. Verificar se RLS está ativo
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'montadores';

| tablename  | rowsecurity |
| ---------- | ----------- |
| montadores | true        |

-- 6. Confirmar novas políticas
SELECT 
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'montadores';


| policyname                                        | roles           | cmd    | qual                                                                                                                                        |
| ------------------------------------------------- | --------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Montadores: INSERT/UPDATE para gestores           | {authenticated} | ALL    | (EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.role = ANY (ARRAY['admin'::text, 'gestor'::text]))))) |
| Montadores: SELECT para autenticados              | {authenticated} | SELECT | true                                                                                                                                        |
| Usuários anônimos podem visualizar montadores     | {anon}          | SELECT | true                                                                                                                                        |
| Usuários autenticados podem visualizar montadores | {authenticated} | SELECT | true                                                                                                                                        |
| montadores_all                                    | {authenticated} | ALL    | true                                                                                                                                        |
| montadores_delete                                 | {authenticated} | DELETE | true                                                                                                                                        |
| montadores_insert                                 | {authenticated} | INSERT | null                                                                                                                                        |
| montadores_select                                 | {authenticated} | SELECT | true                                                                                                                                        |
| montadores_update                                 | {authenticated} | UPDATE | true                                                                                                                                        |



-- 7. Testar query como se fosse o frontend
SET ROLE authenticated;
SELECT COUNT(*) as test_count FROM montadores WHERE ativo = true;
RESET ROLE;


| test_count |
| ---------- |
| 13         |
