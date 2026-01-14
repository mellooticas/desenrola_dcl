-- ========================================
-- TESTE: Desabilitar triggers temporariamente e testar UPDATE
-- ========================================

-- 1. Backup do valor atual
SELECT 
  id,
  numero_sequencial,
  status,
  montador_id,
  updated_at
FROM pedidos
WHERE numero_sequencial = 644;

-- 2. DESABILITAR TODOS OS TRIGGERS (temporário para teste)
ALTER TABLE pedidos DISABLE TRIGGER ALL;

-- 3. Testar UPDATE sem triggers
UPDATE pedidos
SET montador_id = '56d71159-70ce-403b-8362-ebe44b18d882',
    updated_at = NOW()
WHERE numero_sequencial = 644
RETURNING 
  id,
  numero_sequencial,
  montador_id,
  updated_at;

-- 4. Verificar se salvou
SELECT 
  id,
  numero_sequencial,
  status,
  montador_id,
  updated_at
FROM pedidos
WHERE numero_sequencial = 644;

-- 5. REABILITAR OS TRIGGERS
ALTER TABLE pedidos ENABLE TRIGGER ALL;

-- ========================================
-- Se funcionou sem triggers, o problema é em um deles!
-- Vamos investigar cada um:
-- ========================================

-- Verificar código dos triggers suspeitos:
SELECT 
  pg_get_functiondef(p.oid) as function_code
FROM pg_proc p
WHERE p.proname IN (
  'trigger_atualizar_datas_pedido',
  'trigger_criar_evento_timeline',
  'inserir_timeline_pedido',
  'sync_controle_os',
  'trigger_auto_adicionar_os_sequencia'
);
