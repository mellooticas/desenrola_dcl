-- ============================================================
-- 🚨 DIAGNÓSTICO CRÍTICO: TODOS PEDIDOS FORAM PARA PRODUCAO
-- ============================================================
-- Descobrir o estado original e reverter
-- ============================================================

-- 1️⃣ VERIFICAR TIMELINE DOS 29 PEDIDOS EM PRODUCAO
SELECT 
  p.numero_sequencial as "#OS",
  p.status as status_atual,
  p.updated_at as ultima_atualizacao,
  (
    SELECT STRING_AGG(
      status_anterior || ' → ' || status_novo || ' em ' || TO_CHAR(pt.created_at, 'HH24:MI:SS'),
      ' | '
      ORDER BY pt.created_at DESC
    )
    FROM pedidos_timeline pt
    WHERE pt.pedido_id = p.id
      AND pt.created_at::date = CURRENT_DATE
      AND pt.evento_tipo = 'mudanca_status'
  ) as mudancas_hoje
FROM pedidos p
WHERE p.status = 'PRODUCAO'
ORDER BY p.numero_sequencial DESC;

-- 2️⃣ BUSCAR ÚLTIMO STATUS VÁLIDO ANTES DE HOJE PARA CADA PEDIDO
SELECT 
  p.numero_sequencial as "#OS",
  p.status as status_atual,
  (
    SELECT pt.status_anterior
    FROM pedidos_timeline pt
    WHERE pt.pedido_id = p.id
      AND pt.created_at < CURRENT_DATE
      AND pt.evento_tipo = 'mudanca_status'
    ORDER BY pt.created_at DESC
    LIMIT 1
  ) as ultimo_status_valido,
  p.data_pedido,
  p.updated_at
FROM pedidos p
WHERE p.status = 'PRODUCAO'
ORDER BY p.numero_sequencial DESC;

-- 3️⃣ VERIFICAR SE HÁ BACKUP NA TIMELINE (status de ontem)
SELECT 
  p.numero_sequencial as "#OS",
  p.status as status_atual_banco,
  (
    SELECT pt.status_novo
    FROM pedidos_timeline pt
    WHERE pt.pedido_id = p.id
      AND pt.created_at::date < CURRENT_DATE
    ORDER BY pt.created_at DESC
    LIMIT 1
  ) as ultimo_status_timeline_antes_hoje,
  (
    SELECT pt.created_at
    FROM pedidos_timeline pt
    WHERE pt.pedido_id = p.id
      AND pt.created_at::date < CURRENT_DATE
    ORDER BY pt.created_at DESC
    LIMIT 1
  ) as data_ultimo_evento_valido
FROM pedidos p
WHERE p.status = 'PRODUCAO'
ORDER BY p.numero_sequencial DESC;

-- 4️⃣ VERIFICAR PEDIDOS COM STATUS RASCUNHO (NÃO DEVERIA EXISTIR)
SELECT 
  numero_sequencial as "#OS",
  status,
  cliente_nome,
  created_at,
  updated_at,
  laboratorio_id
FROM pedidos
WHERE status = 'RASCUNHO'
ORDER BY numero_sequencial DESC;

-- 5️⃣ LISTAR TODOS OS EVENTOS DE HOJE POR HORÁRIO
SELECT 
  TO_CHAR(pt.created_at, 'HH24:MI:SS') as horario,
  pt.evento_tipo,
  COUNT(*) as total_eventos,
  STRING_AGG(DISTINCT p.numero_sequencial::TEXT, ', ' ORDER BY p.numero_sequencial::TEXT) as pedidos_afetados
FROM pedidos_timeline pt
JOIN pedidos p ON p.id = pt.pedido_id
WHERE pt.created_at::date = CURRENT_DATE
GROUP BY TO_CHAR(pt.created_at, 'HH24:MI:SS'), pt.evento_tipo
ORDER BY horario DESC;

-- 6️⃣ VERIFICAR OS 3 PEDIDOS AINDA SEM LABORATÓRIO
SELECT 
  numero_sequencial as "#OS",
  status,
  cliente_nome,
  loja_id,
  classe_lente_id,
  created_at,
  updated_at
FROM pedidos
WHERE laboratorio_id IS NULL
ORDER BY numero_sequencial DESC;

-- 7️⃣ BUSCAR PADRÃO: QUAL ERA O STATUS MAIS COMUM ANTES?
SELECT 
  'HISTÓRICO ANTES DE HOJE' as info,
  pt.status_novo as status,
  COUNT(*) as total
FROM pedidos_timeline pt
WHERE pt.created_at < CURRENT_DATE
  AND pt.evento_tipo = 'mudanca_status'
  AND pt.pedido_id IN (SELECT id FROM pedidos WHERE status = 'PRODUCAO')
GROUP BY pt.status_novo
ORDER BY total DESC;

-- 8️⃣ ANÁLISE: QUANDO OS PEDIDOS FORAM MOVIDOS PARA PRODUCAO?
SELECT 
  TO_CHAR(pt.created_at, 'YYYY-MM-DD HH24:MI:SS') as timestamp_mudanca,
  COUNT(*) as pedidos_movidos,
  STRING_AGG(p.numero_sequencial::TEXT, ', ' ORDER BY p.numero_sequencial) as quais_pedidos
FROM pedidos_timeline pt
JOIN pedidos p ON p.id = pt.pedido_id
WHERE pt.status_novo = 'PRODUCAO'
  AND pt.created_at::date = CURRENT_DATE
GROUP BY pt.created_at
ORDER BY pt.created_at DESC;

-- ============================================================
-- ✅ ENVIE ESTES RESULTADOS PARA PLANEJAR A REVERSÃO
-- ============================================================
