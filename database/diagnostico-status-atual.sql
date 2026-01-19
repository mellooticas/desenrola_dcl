-- ============================================================================
-- DIAGNÓSTICO: Verificar Status Real do Banco
-- Data: 17/01/2026
-- ============================================================================

-- Execute este SQL no Supabase Dashboard para verificar o ENUM atual

-- 1. Ver todos os status possíveis no ENUM
SELECT 
  enumlabel as status_valor,
  enumsortorder as ordem
FROM pg_enum
WHERE enumtypid = 'status_pedido'::regtype
ORDER BY enumsortorder;

-- 2. Contar pedidos por status atual
SELECT 
  status,
  COUNT(*) as quantidade,
  MIN(created_at) as pedido_mais_antigo,
  MAX(created_at) as pedido_mais_recente
FROM pedidos
GROUP BY status
ORDER BY quantidade DESC;

-- 3. Ver estrutura da coluna status
SELECT 
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'pedidos' AND column_name = 'status';
