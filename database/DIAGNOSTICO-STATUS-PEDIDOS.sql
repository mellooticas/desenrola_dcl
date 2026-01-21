-- ============================================================
-- DIAGNÓSTICO: Verificar constraint de status em pedidos
-- ============================================================
-- Objetivo: Descobrir por que 'RASCUNHO' está sendo rejeitado
-- ============================================================

-- 1. Ver o tipo ENUM atual (se existir)
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_pedido')
ORDER BY enumsortorder;

-- 2. Ver o tipo ENUM status_pedido_novo (se existir)
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_pedido_novo')
ORDER BY enumsortorder;

-- 3. Ver constraints da tabela pedidos
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'pedidos'::regclass
  AND contype = 'c'; -- CHECK constraints

-- 4. Ver estrutura da coluna status
SELECT 
  column_name,
  data_type,
  udt_name,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'pedidos'
  AND column_name = 'status';

-- 5. Testar insert com status RASCUNHO
-- (COMENTADO - descomente para testar)
/*
INSERT INTO pedidos (
  loja_id,
  numero_os_fisica,
  tipo_pedido,
  cliente_nome,
  cliente_telefone,
  status
) VALUES (
  'bab835bc-2df1-4f54-87c3-8151c61ec642',
  'TEST-001',
  'LENTES',
  'Teste',
  '11999999999',
  'RASCUNHO'
);
*/

-- ============================================================
-- ✅ EXECUTAR ESTE SCRIPT NO SUPABASE SQL EDITOR
-- ============================================================
