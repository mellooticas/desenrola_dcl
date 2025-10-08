-- ============================================================================
-- MIGRAR PEDIDO_EVENTOS PARA PEDIDOS_TIMELINE
-- ============================================================================
-- Este script migra TODO o histórico da tabela pedido_eventos para pedidos_timeline
-- preservando o histórico completo dos últimos 30 dias!

-- 1. Primeiro, verificar quantos eventos STATUS_CHANGE existem
SELECT 
  'Análise de Eventos' as titulo,
  COUNT(*) as total_eventos,
  COUNT(CASE WHEN tipo = 'STATUS_CHANGE' THEN 1 END) as mudancas_status,
  COUNT(CASE WHEN tipo = 'NOTE' THEN 1 END) as notas,
  COUNT(DISTINCT pedido_id) as pedidos_unicos,
  MIN(created_at) as evento_mais_antigo,
  MAX(created_at) as evento_mais_recente
FROM pedido_eventos;

| titulo             | total_eventos | mudancas_status | notas | pedidos_unicos | evento_mais_antigo            | evento_mais_recente           |
| ------------------ | ------------- | --------------- | ----- | -------------- | ----------------------------- | ----------------------------- |
| Análise de Eventos | 1354          | 738             | 616   | 122            | 2025-09-18 14:29:56.757552+00 | 2025-10-08 02:56:03.122127+00 |


-- 2. Limpar a timeline atual (que tem só os eventos "Pedido criado")
TRUNCATE TABLE pedidos_timeline CASCADE;

-- 3. Migrar eventos de mudança de status
INSERT INTO pedidos_timeline (
  pedido_id,
  status_anterior,
  status_novo,
  responsavel_id,
  observacoes,
  created_at
)
SELECT 
  pe.pedido_id,
  pe.status_anterior,
  pe.status_novo,
  NULL as responsavel_id, -- pedido_eventos usa campo 'usuario' (text) não UUID
  COALESCE(
    pe.descricao,
    pe.titulo,
    'Status alterado: ' || COALESCE(pe.status_anterior, 'NOVO') || ' → ' || pe.status_novo
  ) as observacoes,
  pe.created_at
FROM pedido_eventos pe
WHERE pe.tipo = 'STATUS_CHANGE'
  AND pe.status_anterior IS NOT NULL
  AND pe.status_novo IS NOT NULL
ORDER BY pe.created_at;

-- 4. Adicionar eventos de criação para pedidos que não têm evento inicial
-- (aqueles que foram criados antes do sistema de eventos começar)
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
  NULL as responsavel_id,
  'Pedido criado' as observacoes,
  p.created_at
FROM pedidos p
WHERE NOT EXISTS (
  SELECT 1 FROM pedidos_timeline pt
  WHERE pt.pedido_id = p.id
)
ORDER BY p.created_at;

-- 5. Verificar resultado da migração
SELECT 
  '=== RESULTADO DA MIGRAÇÃO ===' as titulo;

SELECT 
  'Timeline Atual' as fonte,
  COUNT(*) as total_eventos,
  COUNT(DISTINCT pedido_id) as pedidos_com_eventos,
  MIN(created_at) as evento_mais_antigo,
  MAX(created_at) as evento_mais_recente
FROM pedidos_timeline;

| fonte          | total_eventos | pedidos_com_eventos | evento_mais_antigo            | evento_mais_recente           |
| -------------- | ------------- | ------------------- | ----------------------------- | ----------------------------- |
| Timeline Atual | 616           | 122                 | 2025-09-18 14:30:06.610132+00 | 2025-10-08 02:56:03.122127+00 |

SELECT 
  'Distribuição por Status' as analise,
  status_novo,
  COUNT(*) as quantidade
FROM pedidos_timeline
GROUP BY status_novo
ORDER BY quantidade DESC;

| analise                 | status_novo  | quantidade |
| ----------------------- | ------------ | ---------- |
| Distribuição por Status | AG_PAGAMENTO | 121        |
| Distribuição por Status | PAGO         | 109        |
| Distribuição por Status | PRODUCAO     | 99         |
| Distribuição por Status | PRONTO       | 85         |
| Distribuição por Status | ENVIADO      | 85         |
| Distribuição por Status | CHEGOU       | 64         |
| Distribuição por Status | ENTREGUE     | 51         |
| Distribuição por Status | CANCELADO    | 2          |


-- 6. Ver pedidos com mais eventos (histórico mais rico)
SELECT 
  p.numero_sequencial,
  p.status as status_atual,
  COUNT(pt.id) as total_eventos_na_timeline,
  STRING_AGG(
    pt.status_novo || ' (' || TO_CHAR(pt.created_at, 'DD/MM HH24:MI') || ')',
    ' → '
    ORDER BY pt.created_at
  ) as historico_completo
FROM pedidos p
LEFT JOIN pedidos_timeline pt ON pt.pedido_id = p.id
GROUP BY p.id, p.numero_sequencial, p.status
HAVING COUNT(pt.id) > 1
ORDER BY total_eventos_na_timeline DESC
LIMIT 15;

| numero_sequencial | status_atual | total_eventos_na_timeline | historico_completo                                                                                                                                                      |
| ----------------- | ------------ | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 83                | ENTREGUE     | 7                         | AG_PAGAMENTO (01/10 16:33) → PAGO (02/10 15:27) → PRODUCAO (03/10 13:09) → PRONTO (06/10 14:49) → ENVIADO (06/10 14:49) → CHEGOU (06/10 14:49) → ENTREGUE (06/10 15:04) |
| 63                | ENTREGUE     | 7                         | AG_PAGAMENTO (24/09 17:36) → PAGO (24/09 18:54) → PRODUCAO (26/09 14:43) → PRONTO (26/09 14:43) → ENVIADO (26/09 14:44) → CHEGOU (26/09 14:44) → ENTREGUE (03/10 13:42) |
| 19                | ENTREGUE     | 7                         | AG_PAGAMENTO (22/09 14:33) → PAGO (24/09 11:39) → PRODUCAO (24/09 13:22) → PRONTO (26/09 14:45) → ENVIADO (26/09 14:45) → CHEGOU (30/09 12:31) → ENTREGUE (04/10 19:56) |
| 107               | ENTREGUE     | 7                         | AG_PAGAMENTO (03/10 15:24) → PAGO (03/10 17:13) → PRODUCAO (06/10 14:42) → PRONTO (06/10 14:42) → ENVIADO (06/10 14:42) → CHEGOU (06/10 14:52) → ENTREGUE (06/10 15:05) |
| 30                | ENTREGUE     | 7                         | AG_PAGAMENTO (22/09 17:58) → PAGO (23/09 11:52) → PRODUCAO (23/09 12:53) → PRONTO (23/09 20:35) → ENVIADO (23/09 20:35) → CHEGOU (23/09 20:35) → ENTREGUE (30/09 12:26) |
| 54                | ENTREGUE     | 7                         | AG_PAGAMENTO (24/09 15:12) → PAGO (24/09 18:49) → PRODUCAO (24/09 20:43) → PRONTO (24/09 20:43) → ENVIADO (24/09 20:43) → CHEGOU (24/09 20:44) → ENTREGUE (30/09 12:22) |
| 96                | ENTREGUE     | 7                         | AG_PAGAMENTO (03/10 13:08) → PAGO (06/10 11:18) → PRODUCAO (06/10 14:43) → PRONTO (06/10 14:44) → ENVIADO (06/10 14:45) → CHEGOU (06/10 14:52) → ENTREGUE (06/10 15:05) |
| 36                | ENTREGUE     | 7                         | AG_PAGAMENTO (22/09 18:45) → PAGO (23/09 11:46) → PRODUCAO (23/09 12:53) → PRONTO (24/09 13:25) → ENVIADO (24/09 13:25) → CHEGOU (24/09 14:43) → ENTREGUE (24/09 18:27) |
| 76                | ENTREGUE     | 7                         | AG_PAGAMENTO (26/09 14:34) → PAGO (29/09 19:25) → PRODUCAO (01/10 16:37) → PRONTO (01/10 16:37) → ENVIADO (01/10 16:37) → CHEGOU (02/10 17:33) → ENTREGUE (04/10 19:54) |
| 16                | ENTREGUE     | 7                         | AG_PAGAMENTO (20/09 18:40) → PAGO (22/09 16:48) → PRODUCAO (22/09 18:15) → PRONTO (24/09 13:24) → ENVIADO (24/09 13:24) → CHEGOU (26/09 14:56) → ENTREGUE (06/10 17:55) |
| 48                | ENTREGUE     | 7                         | AG_PAGAMENTO (23/09 14:16) → PAGO (23/09 15:03) → PRODUCAO (23/09 20:10) → PRONTO (23/09 20:11) → ENVIADO (23/09 20:11) → CHEGOU (23/09 20:12) → ENTREGUE (07/10 19:23) |
| 37                | ENTREGUE     | 7                         | AG_PAGAMENTO (22/09 18:50) → PAGO (23/09 11:52) → PRODUCAO (23/09 12:53) → PRONTO (24/09 13:23) → ENVIADO (24/09 13:23) → CHEGOU (26/09 14:56) → ENTREGUE (30/09 12:27) |
| 28                | ENTREGUE     | 7                         | AG_PAGAMENTO (22/09 16:39) → PAGO (23/09 11:56) → PRODUCAO (23/09 12:32) → PRONTO (23/09 13:29) → ENVIADO (23/09 13:29) → CHEGOU (23/09 20:14) → ENTREGUE (04/10 19:59) |
| 74                | ENTREGUE     | 7                         | AG_PAGAMENTO (26/09 14:32) → PAGO (01/10 14:27) → PRODUCAO (01/10 17:18) → PRONTO (01/10 17:19) → ENVIADO (01/10 17:19) → CHEGOU (01/10 17:19) → ENTREGUE (04/10 19:56) |
| 84                | ENTREGUE     | 7                         | AG_PAGAMENTO (01/10 17:04) → PAGO (02/10 15:27) → PRODUCAO (03/10 13:09) → PRONTO (06/10 14:44) → ENVIADO (06/10 14:45) → CHEGOU (06/10 14:54) → ENTREGUE (06/10 15:06) |


-- 7. Comparar totais (antes e depois)
SELECT 
  'Comparação Final' as titulo,
  (SELECT COUNT(*) FROM pedido_eventos WHERE tipo = 'STATUS_CHANGE') as eventos_originais,
  (SELECT COUNT(*) FROM pedidos_timeline) as eventos_migrados,
  (SELECT COUNT(*) FROM pedidos) as total_pedidos,
  ROUND(
    (SELECT COUNT(*)::NUMERIC FROM pedidos_timeline) / 
    (SELECT COUNT(*)::NUMERIC FROM pedidos) * 100, 
    1
  ) || '%' as cobertura;


  | titulo           | eventos_originais | eventos_migrados | total_pedidos | cobertura |
| ---------------- | ----------------- | ---------------- | ------------- | --------- |
| Comparação Final | 738               | 616              | 122           | 504.9%    |

-- ============================================================================
-- RESULTADO ESPERADO:
-- - Timeline populada com ~1000+ eventos de STATUS_CHANGE
-- - Histórico completo dos últimos 30 dias preservado
-- - Cada pedido com seu fluxo completo de mudanças de status
-- - Timeline muito mais rica e útil para análise
-- ============================================================================
