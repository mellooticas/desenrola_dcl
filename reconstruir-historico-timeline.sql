-- ============================================================================
-- RECONSTRUIR HISTÓRICO PARCIAL DA TIMELINE
-- ============================================================================
-- Este script cria eventos estimados baseados nas datas disponíveis nos pedidos
-- Não é perfeito, mas dá uma visão das mudanças que aconteceram

-- 1. Adicionar evento de PAGAMENTO para pedidos que têm data_pagamento
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
  'AG_PAGAMENTO' as status_anterior,
  'PAGO' as status_novo,
  NULL as responsavel_id,
  'Pagamento confirmado (reconstruído)' as observacoes,
  p.data_pagamento
FROM pedidos p
WHERE p.data_pagamento IS NOT NULL
  AND p.data_pagamento > p.created_at
  AND NOT EXISTS (
    SELECT 1 FROM pedidos_timeline pt
    WHERE pt.pedido_id = p.id
      AND pt.status_novo = 'PAGO'
  );

-- 2. Adicionar evento de INÍCIO PRODUÇÃO para pedidos que têm data_inicio_producao
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
  'PAGO' as status_anterior,
  'PRODUCAO' as status_novo,
  NULL as responsavel_id,
  'Enviado para produção (reconstruído)' as observacoes,
  p.data_inicio_producao
FROM pedidos p
WHERE p.data_inicio_producao IS NOT NULL
  AND p.data_inicio_producao > p.created_at
  AND NOT EXISTS (
    SELECT 1 FROM pedidos_timeline pt
    WHERE pt.pedido_id = p.id
      AND pt.status_novo = 'PRODUCAO'
  );

-- 3. Adicionar evento de PRONTO para pedidos que têm data_conclusao_producao
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
  'PRODUCAO' as status_anterior,
  'PRONTO' as status_novo,
  NULL as responsavel_id,
  'Produção concluída (reconstruído)' as observacoes,
  p.data_conclusao_producao
FROM pedidos p
WHERE p.data_conclusao_producao IS NOT NULL
  AND p.data_conclusao_producao > p.created_at
  AND NOT EXISTS (
    SELECT 1 FROM pedidos_timeline pt
    WHERE pt.pedido_id = p.id
      AND pt.status_novo = 'PRONTO'
  );

-- 4. Adicionar evento de ENTREGUE para pedidos que têm data_entregue
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
  'PRONTO' as status_anterior,
  'ENTREGUE' as status_novo,
  NULL as responsavel_id,
  'Pedido entregue ao cliente (reconstruído)' as observacoes,
  p.data_entregue
FROM pedidos p
WHERE p.data_entregue IS NOT NULL
  AND p.data_entregue > p.created_at
  AND NOT EXISTS (
    SELECT 1 FROM pedidos_timeline pt
    WHERE pt.pedido_id = p.id
      AND pt.status_novo = 'ENTREGUE'
  );

-- 5. VERIFICAR RESULTADO
SELECT 
  'Timeline Reconstruída' as titulo,
  COUNT(*) as total_eventos,
  COUNT(DISTINCT pedido_id) as pedidos_com_eventos,
  (SELECT COUNT(*) FROM pedidos) as total_pedidos
FROM pedidos_timeline;

-- 6. Ver distribuição de eventos por status
SELECT 
  status_novo,
  COUNT(*) as quantidade,
  COUNT(CASE WHEN observacoes LIKE '%reconstruído%' THEN 1 END) as reconstruidos
FROM pedidos_timeline
GROUP BY status_novo
ORDER BY status_novo;

-- 7. Ver pedidos com mais eventos (melhor cobertura)
SELECT 
  p.numero_sequencial,
  p.status as status_atual,
  COUNT(pt.id) as total_eventos,
  STRING_AGG(pt.status_novo, ' → ' ORDER BY pt.created_at) as fluxo
FROM pedidos p
LEFT JOIN pedidos_timeline pt ON pt.pedido_id = p.id
GROUP BY p.id, p.numero_sequencial, p.status
ORDER BY total_eventos DESC
LIMIT 10;

-- ============================================================================
-- RESULTADO ESPERADO:
-- - Eventos adicionais criados baseados nas datas disponíveis
-- - Timeline mais completa, mas ainda não 100% precisa
-- - Eventos marcados como "reconstruído" para identificação
-- ============================================================================
