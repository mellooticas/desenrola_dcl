-- ANÁLISE: POR QUE FUNCIONAVA ANTES E AGORA PAROU?
-- Vamos investigar o que mudou no sistema

-- 1. VERIFICAR HISTÓRICO DE ALTERAÇÕES NOS TRIGGERS
-- Quando foram criados/modificados os triggers problemáticos?

SELECT 
  p.proname,
  p.prosecdef,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END as security_type,
  p.proowner,
  r.rolname as owner_name
FROM pg_proc p 
JOIN pg_roles r ON p.proowner = r.oid
WHERE p.proname LIKE '%trigger%' 
  AND p.proname LIKE '%pedido%'
ORDER BY p.proname;

-- 2. VERIFICAR POLÍTICAS RLS DA TABELA LABORATORIO_SLA
-- Talvez foram adicionadas políticas que bloquearam o acesso

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
WHERE tablename = 'laboratorio_sla';

-- 3. VERIFICAR SE A TABELA LABORATORIO_SLA TEM RLS HABILITADO
-- Pode ter sido habilitado recentemente

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  forcerowsecurity as rls_forced
FROM pg_tables 
WHERE tablename = 'laboratorio_sla';

-- 4. VERIFICAR PERMISSÕES NA TABELA LABORATORIO_SLA
-- Podem ter sido alteradas

SELECT 
  t.table_name,
  p.privilege_type,
  p.grantee,
  p.is_grantable
FROM information_schema.table_privileges p
JOIN information_schema.tables t ON p.table_name = t.table_name
WHERE t.table_name = 'laboratorio_sla'
  AND t.table_schema = 'public'
ORDER BY p.grantee, p.privilege_type;

-- 5. VERIFICAR O USUÁRIO ATUAL E SUAS PERMISSÕES
SELECT 
  current_user as usuario_atual,
  session_user as usuario_sessao,
  current_role as role_atual;

-- 6. TESTAR ACESSO DIRETO À TABELA LABORATORIO_SLA
-- Para confirmar se o problema é realmente de permissão
SELECT 'Testando acesso...' as teste;
SELECT COUNT(*) as total_registros FROM laboratorio_sla;

-- 7. VERIFICAR SE EXISTEM OUTRAS FUNÇÕES/TRIGGERS CONFLITANTES
-- Que podem ter sido adicionados recentemente

SELECT 
  t.tgname AS trigger_name,
  p.proname AS function_name,
  CASE WHEN t.tgenabled = 'O' THEN 'enabled' 
       WHEN t.tgenabled = 'D' THEN 'disabled' 
       ELSE 'other' END as status,
  c.relname as table_name,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END as security_type
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'pedidos'
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- HIPÓTESES DO QUE PODE TER MUDADO:
/*
1. RLS (Row Level Security) foi habilitado na tabela laboratorio_sla
2. Políticas de segurança foram adicionadas
3. Permissões foram revogadas do usuário authenticator
4. Triggers foram alterados de SECURITY INVOKER para SECURITY DEFINER
5. Novas funções foram adicionadas que conflitam
6. Configurações de autenticação do Supabase mudaram
7. Schema foi reorganizado ou renomeado
*/