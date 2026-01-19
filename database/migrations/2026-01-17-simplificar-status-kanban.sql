-- ============================================================================
-- MIGRATION: Corrigir Status do Kanban - Simplificação Operacional
-- Data: 17/01/2026
-- Objetivo: Reduzir de 10 status para 5 (3 visíveis + 2 finais)
-- ============================================================================

-- IMPORTANTE: Execute no Supabase Dashboard do desenrola_dcl
-- SQL Editor → New Query → Cole e Execute

BEGIN;

-- ============================================================================
-- 1. BACKUP DOS STATUS ATUAIS (segurança)
-- ============================================================================

CREATE TABLE IF NOT EXISTS backup_pedidos_status_17_01_2026 AS
SELECT id, os, status, created_at, updated_at
FROM pedidos;

COMMENT ON TABLE backup_pedidos_status_17_01_2026 IS 
  'Backup dos status antes da migração de simplificação do Kanban em 17/01/2026';

-- ============================================================================
-- 2. MAPEAR STATUS ANTIGOS → NOVOS
-- ============================================================================

/*
MAPEAMENTO:
PENDENTE      → RASCUNHO    (pedido em criação, aguardando lente/lab)
REGISTRADO    → RASCUNHO    (mesmo conceito)
AG_PAGAMENTO  → PRODUCAO    (já pode ir para lab)
PAGO          → PRODUCAO    (já pode ir para lab)
PRODUCAO      → PRODUCAO    (mantém)
PRONTO        → ENTREGUE    (lab finalizou = chegou)
ENVIADO       → ENTREGUE    (em trânsito = chegando)
CHEGOU        → ENTREGUE    (chegou na loja)
ENTREGUE      → FINALIZADO  (cliente retirou)
CANCELADO     → CANCELADO   (mantém)
*/

-- Atualizar pedidos existentes para novos status
UPDATE pedidos SET status = 'RASCUNHO' WHERE status IN ('PENDENTE', 'REGISTRADO');
UPDATE pedidos SET status = 'PRODUCAO' WHERE status IN ('AG_PAGAMENTO', 'PAGO');
UPDATE pedidos SET status = 'ENTREGUE' WHERE status IN ('PRONTO', 'ENVIADO', 'CHEGOU');
UPDATE pedidos SET status = 'FINALIZADO' WHERE status = 'ENTREGUE';
-- CANCELADO mantém

-- ============================================================================
-- 3. CRIAR NOVO ENUM DE STATUS
-- ============================================================================

-- Não é possível alterar ENUM diretamente no PostgreSQL
-- Precisamos criar um novo tipo e migrar

-- 3.1. Criar novo tipo
CREATE TYPE status_pedido_novo AS ENUM (
  'RASCUNHO',     -- Pedido em criação, aguardando lente/lab (PDV ou manual)
  'PRODUCAO',     -- Enviado para laboratório, em fabricação
  'ENTREGUE',     -- Chegou na loja, aguarda retirada do cliente
  'FINALIZADO',   -- Cliente retirou, processo completo
  'CANCELADO'     -- Cancelado em qualquer etapa
);

-- 3.2. Adicionar coluna temporária com novo tipo
ALTER TABLE pedidos ADD COLUMN status_novo status_pedido_novo;

-- 3.3. Copiar dados convertidos
UPDATE pedidos 
SET status_novo = status::text::status_pedido_novo;

-- 3.4. Dropar coluna antiga
ALTER TABLE pedidos DROP COLUMN status;

-- 3.5. Renomear coluna nova
ALTER TABLE pedidos RENAME COLUMN status_novo TO status;

-- 3.6. Adicionar constraint de default
ALTER TABLE pedidos ALTER COLUMN status SET DEFAULT 'RASCUNHO'::status_pedido_novo;

-- 3.7. Adicionar NOT NULL
ALTER TABLE pedidos ALTER COLUMN status SET NOT NULL;

-- ============================================================================
-- 4. ADICIONAR CAMPOS DE CONTROLE DE FLUXO
-- ============================================================================

-- Campos para rastrear transições
ALTER TABLE pedidos 
  ADD COLUMN IF NOT EXISTS data_enviado_producao TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS data_chegou_loja TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS data_finalizado TIMESTAMPTZ;

-- Preencher datas históricas (aproximação)
UPDATE pedidos SET data_enviado_producao = updated_at WHERE status = 'PRODUCAO';
UPDATE pedidos SET data_chegou_loja = updated_at WHERE status = 'ENTREGUE';
UPDATE pedidos SET data_finalizado = updated_at WHERE status = 'FINALIZADO';

-- ============================================================================
-- 5. ADICIONAR COMENTÁRIOS
-- ============================================================================

COMMENT ON COLUMN pedidos.status IS 
  'Status operacional simplificado: RASCUNHO (aguarda lente/lab) → PRODUCAO (lab fabrica) → ENTREGUE (na loja) → FINALIZADO (cliente retirou)';

COMMENT ON COLUMN pedidos.data_enviado_producao IS 
  'Data/hora em que o pedido foi enviado para o laboratório (mudança para PRODUCAO)';

COMMENT ON COLUMN pedidos.data_chegou_loja IS 
  'Data/hora em que o pedido chegou na loja (mudança para ENTREGUE)';

COMMENT ON COLUMN pedidos.data_finalizado IS 
  'Data/hora em que o cliente retirou o pedido (mudança para FINALIZADO)';

-- ============================================================================
-- 6. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_pedidos_status_rascunho 
  ON pedidos(status) WHERE status = 'RASCUNHO';

CREATE INDEX IF NOT EXISTS idx_pedidos_status_producao 
  ON pedidos(status) WHERE status = 'PRODUCAO';

CREATE INDEX IF NOT EXISTS idx_pedidos_status_entregue 
  ON pedidos(status) WHERE status = 'ENTREGUE';

-- ============================================================================
-- 7. ATUALIZAR VIEWS (se existirem)
-- ============================================================================

-- Recriar view_dashboard_kpis se existir
DROP VIEW IF EXISTS view_dashboard_kpis CASCADE;

CREATE OR REPLACE VIEW view_dashboard_kpis AS
SELECT
  COUNT(*) FILTER (WHERE status IN ('RASCUNHO', 'PRODUCAO', 'ENTREGUE')) AS pedidos_ativos,
  COUNT(*) FILTER (WHERE status = 'RASCUNHO') AS aguardando_lente,
  COUNT(*) FILTER (WHERE status = 'PRODUCAO') AS em_producao,
  COUNT(*) FILTER (WHERE status = 'ENTREGUE') AS aguardando_retirada,
  COUNT(*) FILTER (WHERE status = 'FINALIZADO' AND data_finalizado >= CURRENT_DATE - INTERVAL '30 days') AS finalizados_mes,
  COUNT(*) FILTER (WHERE status = 'CANCELADO') AS cancelados,
  
  -- Ticket médio (apenas finalizados)
  ROUND(AVG(valor_pedido) FILTER (WHERE status = 'FINALIZADO'), 2) AS ticket_medio,
  
  -- SLA (pedidos entregues no prazo)
  ROUND(
    COUNT(*) FILTER (WHERE status IN ('FINALIZADO', 'ENTREGUE') AND data_chegou_loja <= data_prometida)::numeric * 100.0 / 
    NULLIF(COUNT(*) FILTER (WHERE status IN ('FINALIZADO', 'ENTREGUE')), 0),
    2
  ) AS sla_compliance_percent,
  
  -- Tempo médio de produção (em dias)
  ROUND(
    AVG(EXTRACT(EPOCH FROM (data_chegou_loja - data_enviado_producao)) / 86400) 
    FILTER (WHERE data_enviado_producao IS NOT NULL AND data_chegou_loja IS NOT NULL),
    1
  ) AS tempo_medio_producao_dias
  
FROM pedidos
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days';

COMMENT ON VIEW view_dashboard_kpis IS 
  'KPIs do dashboard com status simplificados (RASCUNHO, PRODUCAO, ENTREGUE, FINALIZADO)';

-- ============================================================================
-- 8. LOGS E AUDITORIA
-- ============================================================================

-- Registrar migração
INSERT INTO public.migrations_log (migration_name, executed_at, description)
VALUES (
  'simplificar_status_kanban_v1',
  NOW(),
  'Redução de 10 para 5 status: RASCUNHO, PRODUCAO, ENTREGUE, FINALIZADO, CANCELADO'
)
ON CONFLICT (migration_name) DO UPDATE 
SET executed_at = NOW();

-- ============================================================================
-- 9. VALIDAÇÕES
-- ============================================================================

-- Verificar se todos os pedidos têm status válido
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM pedidos
  WHERE status NOT IN ('RASCUNHO', 'PRODUCAO', 'ENTREGUE', 'FINALIZADO', 'CANCELADO');
  
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'ERRO: % pedidos com status inválido após migração', invalid_count;
  END IF;
  
  RAISE NOTICE '✅ Migração concluída com sucesso!';
  RAISE NOTICE '   - Novos status: RASCUNHO, PRODUCAO, ENTREGUE, FINALIZADO, CANCELADO';
  RAISE NOTICE '   - Backup criado em: backup_pedidos_status_17_01_2026';
END $$;

COMMIT;

-- ============================================================================
-- 10. ROLLBACK (se necessário)
-- ============================================================================

-- SE ALGO DER ERRADO, execute:
/*
BEGIN;

-- Reverter status
UPDATE pedidos p
SET status = b.status::text::status_pedido_novo
FROM backup_pedidos_status_17_01_2026 b
WHERE p.id = b.id;

COMMIT;
*/
