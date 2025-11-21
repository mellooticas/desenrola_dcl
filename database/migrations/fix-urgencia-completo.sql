-- =====================================================
-- CORREÇÃO COMPLETA: Permissões + População de Dados
-- =====================================================
-- Execute este script NO SUPABASE SQL EDITOR
-- Data: 2025-11-21

-- ============================================
-- PARTE 1: CORRIGIR PERMISSÕES DA VIEW
-- ============================================

-- Garantir que a view seja acessível
GRANT SELECT ON v_pedidos_kanban TO authenticated;
GRANT SELECT ON v_pedidos_kanban TO anon;

-- Criar policy se não existir (views herdam policies das tabelas base)
-- Mas vamos garantir que pedidos tem policy correta
DO $$ 
BEGIN
  -- Remover policy antiga se existir
  DROP POLICY IF EXISTS "Usuarios veem pedidos da sua loja" ON pedidos;
  
  -- Criar policy nova
  CREATE POLICY "Usuarios veem pedidos da sua loja" ON pedidos
    FOR SELECT
    TO authenticated
    USING (
      loja_id IN (
        SELECT loja_id 
        FROM usuarios 
        WHERE id = auth.uid()
      )
      OR
      -- Gestores veem tudo
      EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid() 
        AND role = 'gestor'
      )
    );
END $$;

-- ============================================
-- PARTE 2: VERIFICAR SITUAÇÃO ATUAL
-- ============================================

-- Ver quantos pedidos existem (SEM FILTRO RLS - usando postgres role)
SELECT 
  status,
  COUNT(*) as total,
  COUNT(data_prometida) as com_data_prometida,
  COUNT(*) - COUNT(data_prometida) as sem_data_prometida
FROM pedidos
GROUP BY status
ORDER BY status;

-- ============================================
-- PARTE 3: POPULAR DATA_PROMETIDA
-- ============================================

-- Popular para pedidos existentes que não têm data_prometida
UPDATE pedidos p
SET data_prometida = (
  p.data_pedido::date + 
  COALESCE(lab.sla_padrao_dias, 7) +
  COALESCE(loja.margem_seguranca_dias, 2)
)
FROM laboratorios lab, lojas loja
WHERE p.laboratorio_id = lab.id
  AND p.loja_id = loja.id
  AND p.data_prometida IS NULL
  AND p.data_pedido IS NOT NULL;

-- ============================================
-- PARTE 4: POPULAR DATA_SLA_LABORATORIO
-- ============================================

-- Popular data_sla_laboratorio também (caso esteja NULL)
UPDATE pedidos p
SET data_sla_laboratorio = (
  p.data_pedido::date + COALESCE(lab.sla_padrao_dias, 7)
)
FROM laboratorios lab
WHERE p.laboratorio_id = lab.id
  AND p.data_sla_laboratorio IS NULL
  AND p.data_pedido IS NOT NULL;

-- ============================================
-- PARTE 5: CRIAR TRIGGER AUTOMÁTICO
-- ============================================

-- Função para popular automaticamente
CREATE OR REPLACE FUNCTION populate_data_prometida()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sla_lab INTEGER;
  v_margem_loja INTEGER;
BEGIN
  -- Se data_prometida não foi informada, calcular
  IF NEW.data_prometida IS NULL AND NEW.data_pedido IS NOT NULL THEN
    -- Buscar SLA do laboratório
    SELECT sla_padrao_dias INTO v_sla_lab
    FROM laboratorios
    WHERE id = NEW.laboratorio_id;
    
    -- Buscar margem de segurança da loja
    SELECT margem_seguranca_dias INTO v_margem_loja
    FROM lojas
    WHERE id = NEW.loja_id;
    
    -- Calcular data prometida
    NEW.data_prometida := NEW.data_pedido::date + 
                          COALESCE(v_sla_lab, 7) +
                          COALESCE(v_margem_loja, 2);
  END IF;
  
  -- Se data_sla_laboratorio não foi informada, calcular
  IF NEW.data_sla_laboratorio IS NULL AND NEW.data_pedido IS NOT NULL THEN
    SELECT sla_padrao_dias INTO v_sla_lab
    FROM laboratorios
    WHERE id = NEW.laboratorio_id;
    
    NEW.data_sla_laboratorio := NEW.data_pedido::date + COALESCE(v_sla_lab, 7);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_populate_data_prometida ON pedidos;
CREATE TRIGGER trigger_populate_data_prometida
  BEFORE INSERT OR UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION populate_data_prometida();

-- ============================================
-- PARTE 6: VERIFICAÇÃO FINAL
-- ============================================

-- Ver estatísticas gerais
SELECT 
  '1. Total de pedidos' as metrica,
  COUNT(*) as valor
FROM pedidos
UNION ALL
SELECT 
  '2. Com data_prometida' as metrica,
  COUNT(*) as valor
FROM pedidos
WHERE data_prometida IS NOT NULL
UNION ALL
SELECT 
  '3. Pedidos AG_PAGAMENTO' as metrica,
  COUNT(*) as valor
FROM pedidos
WHERE status = 'AG_PAGAMENTO'
UNION ALL
SELECT 
  '4. AG_PAGAMENTO com data_prometida' as metrica,
  COUNT(*) as valor
FROM pedidos
WHERE status = 'AG_PAGAMENTO'
  AND data_prometida IS NOT NULL;

-- Ver exemplos de pedidos AG_PAGAMENTO
SELECT 
  numero_sequencial,
  status,
  TO_CHAR(data_pedido, 'DD/MM/YYYY') as pedido,
  TO_CHAR(data_prometida, 'DD/MM/YYYY') as prometida,
  TO_CHAR(data_sla_laboratorio, 'DD/MM/YYYY') as sla_lab,
  (data_prometida - CURRENT_DATE) as dias_restantes,
  laboratorio_id,
  loja_id
FROM pedidos
WHERE status = 'AG_PAGAMENTO'
ORDER BY data_prometida
LIMIT 10;

-- ✅ PRONTO! Agora teste acessando: http://localhost:3001/test-urgencia


| numero_sequencial | status       | pedido     | prometida  | sla_lab    | dias_restantes | laboratorio_id                       | loja_id                              |
| ----------------- | ------------ | ---------- | ---------- | ---------- | -------------- | ------------------------------------ | ------------------------------------ |
| 355               | AG_PAGAMENTO | 17/11/2025 | 20/11/2025 | 20/11/2025 | -1             | 21e9cb25-ca46-42f9-b297-db1e693325ed | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 |
| 369               | AG_PAGAMENTO | 19/11/2025 | 22/11/2025 | 22/11/2025 | 1              | 21e9cb25-ca46-42f9-b297-db1e693325ed | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 |
| 372               | AG_PAGAMENTO | 19/11/2025 | 23/11/2025 | 22/11/2025 | 2              | 3e51a952-326f-4300-86e4-153df8d7f893 | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 |
| 374               | AG_PAGAMENTO | 19/11/2025 | 23/11/2025 | 22/11/2025 | 2              | 3e51a952-326f-4300-86e4-153df8d7f893 | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 |
| 371               | AG_PAGAMENTO | 19/11/2025 | 23/11/2025 | 22/11/2025 | 2              | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 |
| 375               | AG_PAGAMENTO | 19/11/2025 | 23/11/2025 | 22/11/2025 | 2              | 3e51a952-326f-4300-86e4-153df8d7f893 | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 |
| 383               | AG_PAGAMENTO | 21/11/2025 | 25/11/2025 | 24/11/2025 | 4              | 3e51a952-326f-4300-86e4-153df8d7f893 | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 |
| 380               | AG_PAGAMENTO | 21/11/2025 | 25/11/2025 | 24/11/2025 | 4              | 3e51a952-326f-4300-86e4-153df8d7f893 | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 |
| 379               | AG_PAGAMENTO | 21/11/2025 | 25/11/2025 | 24/11/2025 | 4              | 8ce109c1-69d3-484a-a87b-8accf7984132 | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 |
| 381               | AG_PAGAMENTO | 21/11/2025 | 25/11/2025 | 24/11/2025 | 4              | 3e51a952-326f-4300-86e4-153df8d7f893 | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 |