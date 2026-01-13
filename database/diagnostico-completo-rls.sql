-- 🔍 DIAGNÓSTICO COMPLETO DE RLS
-- ===============================
-- Descobrir porque o acesso está bloqueado
-- ===============================

-- 1️⃣ VERIFICAR QUEM É O USUÁRIO AUTENTICADO
SELECT 
  auth.uid() as "Meu User ID",
  auth.email() as "Meu Email";

-- 📊 Isso deve retornar seu UUID e email

-- 2️⃣ VERIFICAR SE VOCÊ EXISTE NA TABELA USUARIOS
SELECT 
  id as "User ID",
  nome as "Nome",
  email as "Email",
  loja_id as "Loja ID",
  role as "Role"
FROM usuarios
WHERE id = auth.uid();
 
-- 📊 Se retornar vazio, você não está na tabela usuarios!
-- 📊 Se retornar dados, anote o loja_id

-- 3️⃣ VERIFICAR SE A LOJA EXISTE
SELECT 
  l.id as "Loja ID",
  l.nome as "Loja Nome",
  EXISTS (
    SELECT 1 FROM usuarios WHERE loja_id = l.id AND id = auth.uid()
  ) as "Eu pertenço a esta loja"
FROM lojas l;

-- 📊 Deve mostrar todas as lojas e marcar TRUE na sua

-- 4️⃣ TESTAR ACESSO DIRETO À TABELA usuarios (sem filtro)
SELECT COUNT(*) as "Total usuarios visíveis"
FROM usuarios;

-- 📊 Se retornar 0, RLS da tabela usuarios está bloqueando TUDO

-- 5️⃣ VERIFICAR POLICIES DA TABELA usuarios
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'usuarios';

-- 📊 Mostra todas as policies da tabela usuarios

-- 6️⃣ TESTE COM SELECT DIRETO (bypass RLS temporário)
-- Execute APENAS COMO POSTGRES (admin)
SET ROLE postgres;
SELECT COUNT(*) FROM os_sequencia WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55';
RESET ROLE;

-- 📊 Se funcionar como postgres mas não como você, é RLS

-- 7️⃣ VERIFICAR SE RLS ESTÁ ATIVO NAS TABELAS
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Ativo"
FROM pg_tables
WHERE tablename IN ('usuarios', 'os_sequencia', 'os_nao_lancadas', 'pedidos', 'lojas')
  AND schemaname = 'public';

-- 📊 Todas devem ter TRUE (RLS ativo)

-- 🎯 BASEADO NOS RESULTADOS, ME DIGA:
-- Query 1: Seu user_id e email
-- Query 2: Retorna seus dados? Se sim, qual o loja_id?
-- Query 4: Quantos usuarios você vê?
-- Query 7: Quais tabelas têm RLS ativo?
