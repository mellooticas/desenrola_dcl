-- ============================================================================
-- POPULAR TIMELINE MANUALMENTE (SEM TRIGGER)
-- ============================================================================
-- Este script popula a timeline diretamente, evitando problemas de permissão

-- 1. Garantir que responsavel_id aceita NULL
ALTER TABLE pedidos_timeline 
ALTER COLUMN responsavel_id DROP NOT NULL;

-- 2. Limpar timeline existente
TRUNCATE TABLE pedidos_timeline CASCADE;

-- 3. Inserir registro de criação para cada pedido existente
INSERT INTO pedidos_timeline (
  pedido_id,
  status_anterior,
  status_novo,
  responsavel_id,
  observacoes,
  created_at
)
SELECT 
  p.id,
  NULL as status_anterior,
  p.status as status_novo,
  NULL as responsavel_id,  -- Usar NULL em vez de UUID padrão
  'Pedido criado' as observacoes,
  p.created_at
FROM pedidos p
ORDER BY p.created_at;

-- 4. Verificar resultado
SELECT 
  COUNT(*) as total_eventos,
  (SELECT COUNT(*) FROM pedidos) as total_pedidos,
  ROUND((COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM pedidos) * 100)::NUMERIC, 1) || '%' as cobertura
FROM pedidos_timeline;

-- 5. Ver últimos 5 eventos criados
SELECT 
  pt.id,
  p.numero_sequencial,
  pt.status_novo,
  pt.observacoes,
  pt.created_at
FROM pedidos_timeline pt
JOIN pedidos p ON p.id = pt.pedido_id
ORDER BY pt.created_at DESC
LIMIT 5;
