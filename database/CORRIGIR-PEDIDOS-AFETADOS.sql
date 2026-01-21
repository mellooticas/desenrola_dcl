-- ============================================================
-- 🔧 SCRIPT DE REVERSÃO ESPECÍFICA
-- ============================================================
-- Corrigir pedidos afetados pelas mudanças de hoje
-- ============================================================

-- PASSO 1: DESCOBRIR QUAIS PEDIDOS FORAM AFETADOS
DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '📋 ANÁLISE DOS PEDIDOS AFETADOS';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Criar tabela temporária com snapshot de pedidos afetados
  CREATE TEMP TABLE IF NOT EXISTS pedidos_afetados AS
  SELECT 
    id,
    numero_sequencial,
    status,
    laboratorio_id,
    loja_id,
    classe_lente_id,
    updated_at,
    CASE 
      WHEN laboratorio_id IS NULL THEN 'SEM_LABORATORIO'
      WHEN status IS NULL THEN 'SEM_STATUS'
      WHEN status NOT IN ('PENDENTE', 'REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU', 'ENTREGUE', 'FINALIZADO', 'CANCELADO') THEN 'STATUS_INVALIDO'
      WHEN updated_at::date = CURRENT_DATE AND updated_at::time > '10:30:00' THEN 'MODIFICADO_HOJE'
      ELSE 'OK'
    END as problema
  FROM pedidos
  WHERE 
    laboratorio_id IS NULL
    OR status IS NULL
    OR status NOT IN ('PENDENTE', 'REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU', 'ENTREGUE', 'FINALIZADO', 'CANCELADO')
    OR (updated_at::date = CURRENT_DATE AND updated_at::time > '10:30:00');
  
  RAISE NOTICE 'Total de pedidos afetados: %', (SELECT COUNT(*) FROM pedidos_afetados);
  RAISE NOTICE '';
  
END $$;

-- PASSO 2: MOSTRAR PEDIDOS AFETADOS
SELECT 
  numero_sequencial as "#OS",
  status as status_atual,
  CASE 
    WHEN laboratorio_id IS NULL THEN '❌ SEM LAB'
    ELSE '✅'
  END as tem_lab,
  problema,
  updated_at::timestamp as ultima_modificacao
FROM pedidos_afetados
ORDER BY numero_sequencial DESC;

-- PASSO 3: CORRIGIR PEDIDOS SEM LABORATÓRIO
DO $$
DECLARE
  v_default_lab_id uuid;
  v_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '🔧 CORRIGINDO PEDIDOS SEM LABORATÓRIO';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  
  -- Pegar laboratório padrão (o primeiro ativo)
  SELECT id INTO v_default_lab_id
  FROM laboratorios
  WHERE ativo = true
  ORDER BY created_at
  LIMIT 1;
  
  IF v_default_lab_id IS NULL THEN
    RAISE NOTICE '❌ Nenhum laboratório ativo encontrado!';
    RAISE NOTICE '⚠️  AÇÃO NECESSÁRIA: Ative pelo menos um laboratório antes de continuar';
    RETURN;
  END IF;
  
  RAISE NOTICE '📍 Laboratório padrão escolhido: %', v_default_lab_id;
  RAISE NOTICE '';
  
  -- Atualizar pedidos sem laboratório
  UPDATE pedidos
  SET 
    laboratorio_id = v_default_lab_id,
    updated_at = NOW()
  WHERE laboratorio_id IS NULL
    AND status IN ('PENDENTE', 'REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU');
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RAISE NOTICE '✅ % pedidos corrigidos (laboratório adicionado)', v_count;
  RAISE NOTICE '';
  
END $$;

-- PASSO 4: CORRIGIR STATUS INVÁLIDOS OU NULL
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '🔧 CORRIGINDO STATUS INVÁLIDOS';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  
  -- Atualizar status NULL para REGISTRADO (padrão seguro)
  UPDATE pedidos
  SET 
    status = 'REGISTRADO',
    updated_at = NOW()
  WHERE status IS NULL;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  IF v_count > 0 THEN
    RAISE NOTICE '✅ % pedidos com status NULL corrigidos para REGISTRADO', v_count;
  END IF;
  
  -- Atualizar status inválidos para REGISTRADO
  UPDATE pedidos
  SET 
    status = 'REGISTRADO',
    updated_at = NOW()
  WHERE status NOT IN ('PENDENTE', 'REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU', 'ENTREGUE', 'FINALIZADO', 'CANCELADO');
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  IF v_count > 0 THEN
    RAISE NOTICE '✅ % pedidos com status inválido corrigidos para REGISTRADO', v_count;
  END IF;
  
  RAISE NOTICE '';
  
END $$;

-- PASSO 5: VERIFICAÇÃO FINAL
SELECT 
  '✅ VERIFICAÇÃO FINAL' as tipo,
  (SELECT COUNT(*) FROM pedidos) as total_pedidos,
  (SELECT COUNT(*) FROM pedidos WHERE laboratorio_id IS NULL) as ainda_sem_lab,
  (SELECT COUNT(*) FROM pedidos WHERE status IS NULL) as ainda_sem_status,
  (SELECT COUNT(*) FROM pedidos WHERE status IN ('PENDENTE', 'REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU')) as pedidos_no_kanban;


| tipo                | total_pedidos | ainda_sem_lab | ainda_sem_status | pedidos_no_kanban |
| ------------------- | ------------- | ------------- | ---------------- | ----------------- |
| ✅ VERIFICAÇÃO FINAL | 641           | 3             | 0                | 29                |

-- PASSO 6: DISTRIBUIÇÃO ATUAL DE PEDIDOS POR STATUS
SELECT 
  status,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM pedidos
GROUP BY status
ORDER BY total DESC;

| status    | total | percentual |
| --------- | ----- | ---------- |
| ENTREGUE  | 569   | 88.77      |
| CANCELADO | 41    | 6.40       |
| PRODUCAO  | 29    | 4.52       |
| RASCUNHO  | 2     | 0.31       |



-- ============================================================
-- ✅ EXECUTE E VEJA O QUE FOI CORRIGIDO
-- ============================================================
