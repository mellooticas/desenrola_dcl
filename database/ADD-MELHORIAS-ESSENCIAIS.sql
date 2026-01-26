-- ============================================================================
-- MELHORIAS ESSENCIAIS - NÚMERO PEDIDO LAB + PREÇOS REAIS SERVIÇOS/ACESSÓRIOS
-- Data: 24/01/2026
-- ============================================================================
-- OBJETIVO:
-- 1. Adicionar campo para número de pedido do laboratório (lentes/lentes contato)
-- 2. Implementar preço real (com desconto/acréscimo) para serviços e acessórios
--    seguindo a mesma lógica de armações e lentes
-- ============================================================================

-- ============================================================================
-- PARTE 1: NÚMERO DE PEDIDO DO LABORATÓRIO
-- ============================================================================
-- Verificar se o campo já existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pedidos' AND column_name = 'numero_pedido_laboratorio'
  ) THEN
    ALTER TABLE pedidos ADD COLUMN numero_pedido_laboratorio TEXT;
    COMMENT ON COLUMN pedidos.numero_pedido_laboratorio IS 'Número do pedido no laboratório (para lentes e lentes de contato) - IMPRESCINDÍVEL';
  END IF;
END $$;

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_pedidos_numero_pedido_laboratorio 
ON pedidos(numero_pedido_laboratorio) WHERE numero_pedido_laboratorio IS NOT NULL;

-- ============================================================================
-- PARTE 2: PREÇO REAL PARA SERVIÇOS (com desconto/acréscimo)
-- ============================================================================
-- Adicionar campos seguindo o padrão de armações/lentes

-- 2.1. Preço real de venda do serviço (após desconto/acréscimo)
ALTER TABLE pedidos 
  ADD COLUMN IF NOT EXISTS servico_preco_real DECIMAL(10,2);

COMMENT ON COLUMN pedidos.servico_preco_real IS 'Preço real de venda do serviço (com desconto/acréscimo aplicado) - similar a preco_armacao e preco_lente';

-- 2.2. Margem calculada do serviço
ALTER TABLE pedidos 
  ADD COLUMN IF NOT EXISTS margem_servico_percentual DECIMAL(5,2);

COMMENT ON COLUMN pedidos.margem_servico_percentual IS 'Margem percentual do serviço [(venda_real-custo)/venda_real*100]';

-- 2.3. Trigger para calcular margem de serviço automaticamente
CREATE OR REPLACE FUNCTION calcular_margem_servico()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.servico_preco_real IS NOT NULL AND NEW.servico_custo IS NOT NULL AND NEW.servico_preco_real > 0 THEN
    NEW.margem_servico_percentual := ROUND(
      ((NEW.servico_preco_real - NEW.servico_custo) / NEW.servico_preco_real * 100)::numeric, 
      2
    );
  ELSE
    NEW.margem_servico_percentual := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_margem_servico ON pedidos;
CREATE TRIGGER trigger_calcular_margem_servico
  BEFORE INSERT OR UPDATE OF servico_preco_real, servico_custo
  ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_margem_servico();

-- ============================================================================
-- PARTE 3: PREÇO REAL PARA ACESSÓRIOS (com desconto/acréscimo)
-- ============================================================================
-- Acessórios já têm campos básicos, vamos adicionar o sistema de preço real

-- 3.1. Adicionar campos de acessórios (caso não existam)
ALTER TABLE pedidos 
  ADD COLUMN IF NOT EXISTS acessorio_produto_id UUID,
  ADD COLUMN IF NOT EXISTS acessorio_sku_visual TEXT,
  ADD COLUMN IF NOT EXISTS acessorio_descricao TEXT,
  ADD COLUMN IF NOT EXISTS acessorio_preco_tabela DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS acessorio_quantidade INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS acessorio_custo_unitario DECIMAL(10,2);

-- 3.2. Preço real de venda unitário do acessório (após desconto/acréscimo)
ALTER TABLE pedidos 
  ADD COLUMN IF NOT EXISTS acessorio_preco_real_unitario DECIMAL(10,2);

COMMENT ON COLUMN pedidos.acessorio_preco_real_unitario IS 'Preço real de venda UNITÁRIO do acessório (com desconto/acréscimo aplicado)';

-- 3.3. Subtotal do acessório (preço_real_unitario * quantidade)
ALTER TABLE pedidos 
  ADD COLUMN IF NOT EXISTS acessorio_subtotal DECIMAL(10,2);

COMMENT ON COLUMN pedidos.acessorio_subtotal IS 'Subtotal do acessório (preco_real_unitario * quantidade)';

-- 3.4. Margem do acessório
ALTER TABLE pedidos 
  ADD COLUMN IF NOT EXISTS margem_acessorio_percentual DECIMAL(5,2);

COMMENT ON COLUMN pedidos.margem_acessorio_percentual IS 'Margem percentual do acessório [(venda_real-custo)/venda_real*100]';

-- Comentários adicionais
COMMENT ON COLUMN pedidos.acessorio_produto_id IS 'UUID do produto acessório no CRM_ERP (sem FK - bancos diferentes)';
COMMENT ON COLUMN pedidos.acessorio_sku_visual IS 'SKU visual do acessório para exibição';
COMMENT ON COLUMN pedidos.acessorio_descricao IS 'Descrição do acessório';
COMMENT ON COLUMN pedidos.acessorio_preco_tabela IS 'Preço de tabela unitário do acessório';
COMMENT ON COLUMN pedidos.acessorio_quantidade IS 'Quantidade de unidades do acessório';
COMMENT ON COLUMN pedidos.acessorio_custo_unitario IS 'Custo unitário do acessório';

-- 3.5. Trigger para calcular subtotal e margem de acessórios automaticamente
CREATE OR REPLACE FUNCTION calcular_valores_acessorio()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular subtotal (preco_real_unitario * quantidade)
  IF NEW.acessorio_preco_real_unitario IS NOT NULL AND NEW.acessorio_quantidade IS NOT NULL THEN
    NEW.acessorio_subtotal := NEW.acessorio_preco_real_unitario * NEW.acessorio_quantidade;
  ELSE
    NEW.acessorio_subtotal := NULL;
  END IF;
  
  -- Calcular margem percentual
  IF NEW.acessorio_preco_real_unitario IS NOT NULL 
     AND NEW.acessorio_custo_unitario IS NOT NULL 
     AND NEW.acessorio_preco_real_unitario > 0 THEN
    NEW.margem_acessorio_percentual := ROUND(
      ((NEW.acessorio_preco_real_unitario - NEW.acessorio_custo_unitario) / NEW.acessorio_preco_real_unitario * 100)::numeric, 
      2
    );
  ELSE
    NEW.margem_acessorio_percentual := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_valores_acessorio ON pedidos;
CREATE TRIGGER trigger_calcular_valores_acessorio
  BEFORE INSERT OR UPDATE OF acessorio_preco_real_unitario, acessorio_quantidade, acessorio_custo_unitario
  ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_valores_acessorio();

-- 3.6. Criar índice para acessórios
CREATE INDEX IF NOT EXISTS idx_pedidos_acessorio_produto_id 
ON pedidos(acessorio_produto_id) WHERE acessorio_produto_id IS NOT NULL;

-- ============================================================================
-- PARTE 4: VERIFICAÇÕES FINAIS
-- ============================================================================

-- 4.1. Verificar campos de número de pedido do laboratório
SELECT 
    'numero_pedido_laboratorio' as campo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name = 'numero_pedido_laboratorio'
ORDER BY column_name;

| campo                     | column_name               | data_type         | is_nullable | column_default |
| ------------------------- | ------------------------- | ----------------- | ----------- | -------------- |
| numero_pedido_laboratorio | numero_pedido_laboratorio | character varying | YES         | null           |



-- 4.2. Verificar campos de serviços (incluindo novos)
SELECT 
    'servicos' as categoria,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name LIKE 'servico%'
ORDER BY column_name;


| categoria | column_name                 | data_type | is_nullable | column_default |
| --------- | --------------------------- | --------- | ----------- | -------------- |
| servicos  | servico_custo               | numeric   | YES         | null           |
| servicos  | servico_desconto_percentual | numeric   | YES         | 0              |
| servicos  | servico_descricao           | text      | YES         | null           |
| servicos  | servico_preco_final         | numeric   | YES         | null           |
| servicos  | servico_preco_real          | numeric   | YES         | null           |
| servicos  | servico_preco_tabela        | numeric   | YES         | null           |
| servicos  | servico_produto_id          | uuid      | YES         | null           |
| servicos  | servico_sku_visual          | text      | YES         | null           |


-- 4.3. Verificar campos de acessórios (incluindo novos)
SELECT 
    'acessorios' as categoria,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name LIKE 'acessorio%'
ORDER BY column_name;


| categoria  | column_name                   | data_type | is_nullable | column_default |
| ---------- | ----------------------------- | --------- | ----------- | -------------- |
| acessorios | acessorio_custo_unitario      | numeric   | YES         | null           |
| acessorios | acessorio_descricao           | text      | YES         | null           |
| acessorios | acessorio_preco_real_unitario | numeric   | YES         | null           |
| acessorios | acessorio_preco_tabela        | numeric   | YES         | null           |
| acessorios | acessorio_produto_id          | uuid      | YES         | null           |
| acessorios | acessorio_quantidade          | integer   | YES         | 1              |
| acessorios | acessorio_sku_visual          | text      | YES         | null           |
| acessorios | acessorio_subtotal            | numeric   | YES         | null           |


-- 4.4. Verificar campos de margem
SELECT 
    'margens' as categoria,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name LIKE '%margem%'
ORDER BY column_name;

| categoria | column_name                 | data_type | is_nullable | column_default |
| --------- | --------------------------- | --------- | ----------- | -------------- |
| margens   | margem_acessorio_percentual | numeric   | YES         | null           |
| margens   | margem_armacao_percentual   | numeric   | YES         | null           |
| margens   | margem_cliente_dias         | integer   | YES         | 2              |
| margens   | margem_lente_percentual     | numeric   | YES         | null           |
| margens   | margem_servico_percentual   | numeric   | YES         | null           |



-- 4.5. Verificar triggers criados
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'pedidos'
  AND trigger_name IN ('trigger_calcular_margem_servico', 'trigger_calcular_valores_acessorio')
ORDER BY trigger_name;


| trigger_name                       | event_manipulation | action_statement                              |
| ---------------------------------- | ------------------ | --------------------------------------------- |
| trigger_calcular_margem_servico    | INSERT             | EXECUTE FUNCTION calcular_margem_servico()    |
| trigger_calcular_margem_servico    | UPDATE             | EXECUTE FUNCTION calcular_margem_servico()    |
| trigger_calcular_valores_acessorio | INSERT             | EXECUTE FUNCTION calcular_valores_acessorio() |
| trigger_calcular_valores_acessorio | UPDATE             | EXECUTE FUNCTION calcular_valores_acessorio() |


-- ============================================================================
-- RESUMO DAS MELHORIAS
-- ============================================================================
SELECT 
  'MELHORIAS IMPLEMENTADAS' as status,
  jsonb_build_object(
    '1_numero_pedido_lab', 'Campo numero_pedido_laboratorio adicionado (imprescindível para rastreamento)',
    '2_servico_preco_real', 'Preço real de serviço com desconto/acréscimo (igual armações/lentes)',
    '3_acessorio_preco_real', 'Preço real de acessório com desconto/acréscimo (igual armações/lentes)',
    '4_margens_automaticas', 'Cálculo automático de margens via triggers',
    '5_indices', 'Índices criados para performance'
  ) as detalhes;

| status                  | detalhes                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MELHORIAS IMPLEMENTADAS | {"5_indices":"Índices criados para performance","1_numero_pedido_lab":"Campo numero_pedido_laboratorio adicionado (imprescindível para rastreamento)","2_servico_preco_real":"Preço real de serviço com desconto/acréscimo (igual armações/lentes)","4_margens_automaticas":"Cálculo automático de margens via triggers","3_acessorio_preco_real":"Preço real de acessório com desconto/acréscimo (igual armações/lentes)"} |


-- ============================================================================
-- PRÓXIMOS PASSOS (FRONTEND)
-- ============================================================================
-- 📋 TODO Frontend:
-- 
-- 1. NovaOrdemWizard.tsx:
--    - Adicionar campo numero_pedido_laboratorio no formulário de lentes/lentes contato
--    - Capturar preco_real ao invés de usar apenas preco_tabela para serviços
--    - Capturar preco_real_unitario para acessórios
--    - Salvar nos campos: servico_preco_real e acessorio_preco_real_unitario
--
-- 2. SeletorServicos.tsx:
--    - Adicionar campo para valor real (com desconto/acréscimo)
--    - Seguir padrão do seletor de armações/lentes
--    - Retornar preco_real além do preco_tabela
--
-- 3. SeletorAcessorios.tsx:
--    - Adicionar campo para valor real unitário (com desconto/acréscimo)
--    - Calcular subtotal considerando preco_real_unitario * quantidade
--    - Retornar preco_real_unitario além do preco_tabela
--
-- 4. Página de Detalhes do Pedido:
--    - Exibir número do pedido do laboratório
--    - Mostrar preço real vs preço tabela para serviços/acessórios
--    - Exibir margens calculadas
--
-- ============================================================================
