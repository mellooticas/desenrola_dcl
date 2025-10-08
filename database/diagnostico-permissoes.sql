-- ================================================================
-- DIAGNÓSTICO: Verificar estado atual das permissões
-- Execute este SQL no Supabase para ver o que está faltando
-- ================================================================

-- 1. Verificar políticas RLS da tabela pedidos_timeline
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'pedidos_timeline'
ORDER BY policyname;

-- ================================================================
-- RESULTADO ESPERADO:
-- Deve retornar 2 políticas:
-- 1. "Usuários autenticados podem inserir no timeline" (cmd = INSERT)
-- 2. "Usuários autenticados podem ver timeline" (cmd = SELECT)
-- ================================================================

-- 2. Verificar permissões diretas na tabela
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'pedidos_timeline'
ORDER BY grantee, privilege_type;

-- ================================================================
-- RESULTADO ESPERADO:
-- Deve incluir linhas como:
-- grantee: authenticated | privilege_type: SELECT
-- grantee: authenticated | privilege_type: INSERT
-- grantee: authenticated | privilege_type: UPDATE
-- ================================================================

-- 3. Verificar se RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'pedidos_timeline';

-- ================================================================
-- RESULTADO ESPERADO:
-- rowsecurity = true
-- ================================================================

-- 4. Verificar funções e seu security_type
SELECT 
  routine_name, 
  routine_type,
  security_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name IN ('alterar_status_pedido', 'marcar_pagamento')
ORDER BY routine_name;

-- ================================================================
-- RESULTADO ESPERADO:
-- Ambas as funções devem existir
-- Se security_type = 'INVOKER' (padrão) → problema continua
-- Se security_type = 'DEFINER' → deveria funcionar
-- ================================================================

-- 5. Verificar estrutura da tabela pedidos_timeline
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'pedidos_timeline'
ORDER BY ordinal_position;

-- ================================================================
-- PRÓXIMOS PASSOS:
-- ================================================================
-- Me envie o resultado destes 5 SELECTs e eu vou saber exatamente
-- o que está faltando para corrigir o problema.
-- ================================================================
