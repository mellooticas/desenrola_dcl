-- 🔍 DIAGNÓSTICO ESPECÍFICO - ADMIN
-- ==================================
-- User ID: f3d6c50a-1954-4698-8e48-bc8cbbebee9d
-- Email: junior@oticastatymello.com.br
-- ==================================

-- 1️⃣ VERIFICAR SEUS DADOS NA TABELA USUARIOS
SELECT 
  id as "User ID",
  nome as "Nome",
  email as "Email",
  loja_id as "Loja ID",
  role as "Role",
  ativo as "Ativo"
FROM usuarios
WHERE id = 'f3d6c50a-1954-4698-8e48-bc8cbbebee9d';

| User ID                              | Nome           | Email                         | Loja ID | Role   | Ativo |
| ------------------------------------ | -------------- | ----------------------------- | ------- | ------ | ----- |
| f3d6c50a-1954-4698-8e48-bc8cbbebee9d | Junior - Admin | junior@oticastatymello.com.br | null    | gestor | true  |



-- 📊 Resultado esperado: Mostrar seus dados
-- Se loja_id for NULL, esse é o problema!

-- 2️⃣ VERIFICAR QUAL LOJA É SUZANO
SELECT 
  id as "Loja UUID",
  nome as "Nome Loja"
FROM lojas
WHERE nome ILIKE '%suzano%';

| Loja UUID                            | Nome Loja     |
| ------------------------------------ | ------------- |
| e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | Suzano        |
| cb8ebda2-deff-4d44-8488-672d63bc8bd7 | Suzano Centro |


-- 📊 Deve retornar: e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55

-- 3️⃣ VERIFICAR SE VOCÊ TEM ACESSO COMO ADMIN
SELECT 
  role as "Meu Role",
  CASE 
    WHEN role IN ('gestor', 'dcl') THEN 'Deveria ver TODAS as lojas'
    ELSE 'Só vê sua loja'
  END as "Tipo de Acesso"
FROM usuarios
WHERE id = 'f3d6c50a-1954-4698-8e48-bc8cbbebee9d';

| Meu Role | Tipo de Acesso             |
| -------- | -------------------------- |
| gestor   | Deveria ver TODAS as lojas |


-- 4️⃣ TESTE: Consegue ver os_sequencia?
SELECT COUNT(*) as "Total os_sequencia visível"
FROM os_sequencia;

| Total os_sequencia visível |
| -------------------------- |
| 4363                       |


-- 📊 Se retornar 0, RLS está bloqueando mesmo sendo admin

-- 5️⃣ VERIFICAR POLICIES DA TABELA os_sequencia
SELECT 
  policyname as "Nome Policy",
  cmd as "Comando",
  qual as "Condição"
FROM pg_policies
WHERE tablename = 'os_sequencia';

| Nome Policy                | Comando | Condição                                                                                                                                                                                                                                   |
| -------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| os_sequencia_insert_policy | INSERT  | null                                                                                                                                                                                                                                       |
| os_sequencia_select_policy | SELECT  | ((loja_id IN ( SELECT usuarios.loja_id
   FROM usuarios
  WHERE (usuarios.id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.role = ANY (ARRAY['gestor'::text, 'dcl'::text])))))) |

  

-- 📊 Mostra as regras RLS aplicadas

-- 🎯 INTERPRETAÇÃO:
-- Se Query 1 mostrar loja_id = NULL: Você precisa associar a uma loja
-- Se Query 1 mostrar role != 'gestor' e != 'dcl': Precisa ajustar role
-- Se Query 4 retornar 0: RLS está bloqueando admin (BUG!)
