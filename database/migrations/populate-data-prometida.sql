-- =====================================================
-- POPULAR DATA_PROMETIDA EM PEDIDOS EXISTENTES
-- =====================================================
-- Data: 2025-11-21
-- Objetivo: Garantir que todos os pedidos tenham data_prometida preenchida
--           para o sistema de urgência funcionar corretamente

-- 1. VERIFICAR SITUAÇÃO ATUAL
SELECT 
  status,
  COUNT(*) as total,
  COUNT(data_prometida) as com_data_prometida,
  COUNT(*) - COUNT(data_prometida) as sem_data_prometida
FROM pedidos
WHERE status NOT IN ('ENTREGUE', 'CANCELADO')
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'REGISTRADO' THEN 1
    WHEN 'AG_PAGAMENTO' THEN 2
    WHEN 'PAGO' THEN 3
    WHEN 'PRODUCAO' THEN 4
    WHEN 'PRONTO' THEN 5
    WHEN 'ENVIADO' THEN 6
    WHEN 'CHEGOU' THEN 7
  END;

-- 2. POPULAR DATA_PROMETIDA PARA PEDIDOS SEM ELA
-- Regra: data_prometida = data_pedido + SLA do laboratório + margem de segurança da loja
UPDATE pedidos p
SET data_prometida = (
  p.data_pedido + 
  INTERVAL '1 day' * COALESCE(lab.sla_padrao_dias, 7) +
  INTERVAL '1 day' * COALESCE(loja.margem_seguranca_dias, 2)
)
FROM laboratorios lab, lojas loja
WHERE p.laboratorio_id = lab.id
  AND p.loja_id = loja.id
  AND p.data_prometida IS NULL
  AND p.status NOT IN ('ENTREGUE', 'CANCELADO');

-- 3. VERIFICAR RESULTADO
SELECT 
  status,
  COUNT(*) as total,
  COUNT(data_prometida) as com_data_prometida,
  COUNT(*) - COUNT(data_prometida) as ainda_sem_data_prometida,
  MIN(data_prometida) as primeira_data,
  MAX(data_prometida) as ultima_data
FROM pedidos
WHERE status NOT IN ('ENTREGUE', 'CANCELADO')
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'REGISTRADO' THEN 1
    WHEN 'AG_PAGAMENTO' THEN 2
    WHEN 'PAGO' THEN 3
    WHEN 'PRODUCAO' THEN 4
    WHEN 'PRONTO' THEN 5
    WHEN 'ENVIADO' THEN 6
    WHEN 'CHEGOU' THEN 7
  END;

-- 4. SAMPLE: Ver alguns pedidos AG_PAGAMENTO com as datas
SELECT 
  id,
  numero_sequencial,
  status,
  data_pedido,
  data_prometida,
  data_sla_laboratorio,
  (data_prometida - CURRENT_DATE) as dias_ate_prometida,
  (data_sla_laboratorio - CURRENT_DATE) as dias_ate_sla_lab
FROM pedidos
WHERE status = 'AG_PAGAMENTO'
  AND data_prometida IS NOT NULL
ORDER BY data_prometida
LIMIT 10;

-- 5. CRIAR TRIGGER PARA POPULAR AUTOMATICAMENTE EM NOVOS PEDIDOS
-- (se ainda não existir)
CREATE OR REPLACE FUNCTION populate_data_prometida()
RETURNS TRIGGER AS $$
DECLARE
  v_sla_lab INTEGER;
  v_margem_loja INTEGER;
BEGIN
  -- Se data_prometida não foi informada manualmente, calcular
  IF NEW.data_prometida IS NULL THEN
    -- Buscar SLA do laboratório
    SELECT sla_padrao_dias INTO v_sla_lab
    FROM laboratorios
    WHERE id = NEW.laboratorio_id;
    
    -- Buscar margem de segurança da loja
    SELECT margem_seguranca_dias INTO v_margem_loja
    FROM lojas
    WHERE id = NEW.loja_id;
    
    -- Calcular data prometida
    NEW.data_prometida := NEW.data_pedido + 
                          INTERVAL '1 day' * COALESCE(v_sla_lab, 7) +
                          INTERVAL '1 day' * COALESCE(v_margem_loja, 2);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger (substituir se já existir)
DROP TRIGGER IF EXISTS trigger_populate_data_prometida ON pedidos;
CREATE TRIGGER trigger_populate_data_prometida
  BEFORE INSERT OR UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION populate_data_prometida();

-- 6. VERIFICAÇÃO FINAL
SELECT 
  'Total de pedidos operacionais' as categoria,
  COUNT(*) as quantidade
FROM pedidos
WHERE status NOT IN ('ENTREGUE', 'CANCELADO')
UNION ALL
SELECT 
  'Pedidos com data_prometida' as categoria,
  COUNT(*) as quantidade
FROM pedidos
WHERE status NOT IN ('ENTREGUE', 'CANCELADO')
  AND data_prometida IS NOT NULL
UNION ALL
SELECT 
  'Pedidos AG_PAGAMENTO' as categoria,
  COUNT(*) as quantidade
FROM pedidos
WHERE status = 'AG_PAGAMENTO'
UNION ALL
SELECT 
  'AG_PAGAMENTO com data_prometida' as categoria,
  COUNT(*) as quantidade
FROM pedidos
WHERE status = 'AG_PAGAMENTO'
  AND data_prometida IS NOT NULL;

-- ✅ SUCESSO! Todos os pedidos devem ter data_prometida agora
