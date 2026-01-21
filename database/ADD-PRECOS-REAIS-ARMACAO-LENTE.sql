-- ============================================================================
-- ADD-PRECOS-REAIS-ARMACAO-LENTE.sql
-- ============================================================================
-- Adiciona campos para capturar preços reais de venda (com desconto)
-- e custos de armações e lentes na tabela pedidos
-- 
-- Contexto: Usuário quer calcular margens reais, não fictícias
-- Fórmula Margem Real: (preco_venda_real - custo) / preco_venda_real * 100
-- ============================================================================

-- 1. ADICIONAR COLUNAS DE PREÇO/CUSTO DE ARMAÇÃO
-- ============================================================================
ALTER TABLE public.pedidos 
  ADD COLUMN IF NOT EXISTS preco_armacao DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS custo_armacao DECIMAL(10,2);

COMMENT ON COLUMN public.pedidos.preco_armacao IS 'Preço real de venda da armação (com desconto aplicado)';
COMMENT ON COLUMN public.pedidos.custo_armacao IS 'Custo de aquisição da armação';

-- 2. VERIFICAR SE JÁ EXISTEM COLUNAS DE LENTE (foram adicionadas anteriormente)
-- ============================================================================
-- As colunas preco_lente e custo_lente já devem existir da migração 01-adicionar-campos-lentes.sql
-- Vamos apenas garantir que existam:

ALTER TABLE public.pedidos 
  ADD COLUMN IF NOT EXISTS preco_lente DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS custo_lente DECIMAL(10,2);

COMMENT ON COLUMN public.pedidos.preco_lente IS 'Preço real de venda da lente (com desconto aplicado)';
COMMENT ON COLUMN public.pedidos.custo_lente IS 'Custo de aquisição da lente';

-- 3. ADICIONAR COLUNAS DE MARGEM CALCULADA
-- ============================================================================
ALTER TABLE public.pedidos 
  ADD COLUMN IF NOT EXISTS margem_armacao_percentual DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS margem_lente_percentual DECIMAL(5,2);

COMMENT ON COLUMN public.pedidos.margem_armacao_percentual IS 'Margem percentual da armação [(venda-custo)/venda*100]';
COMMENT ON COLUMN public.pedidos.margem_lente_percentual IS 'Margem percentual da lente [(venda-custo)/venda*100]';

-- 4. TRIGGER PARA CALCULAR MARGEM DE ARMAÇÃO AUTOMATICAMENTE
-- ============================================================================
CREATE OR REPLACE FUNCTION calcular_margem_armacao()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.preco_armacao IS NOT NULL AND NEW.custo_armacao IS NOT NULL AND NEW.custo_armacao > 0 THEN
    NEW.margem_armacao_percentual := ROUND(
      ((NEW.preco_armacao - NEW.custo_armacao) / NEW.preco_armacao * 100)::numeric, 
      2
    );
  ELSE
    NEW.margem_armacao_percentual := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_margem_armacao ON public.pedidos;
CREATE TRIGGER trigger_calcular_margem_armacao
  BEFORE INSERT OR UPDATE OF preco_armacao, custo_armacao
  ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_margem_armacao();

-- 5. ATUALIZAR TRIGGER DE MARGEM DE LENTE (se já existir)
-- ============================================================================
CREATE OR REPLACE FUNCTION calcular_margem_lente()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.preco_lente IS NOT NULL AND NEW.custo_lente IS NOT NULL AND NEW.custo_lente > 0 THEN
    NEW.margem_lente_percentual := ROUND(
      ((NEW.preco_lente - NEW.custo_lente) / NEW.preco_lente * 100)::numeric, 
      2
    );
  ELSE
    NEW.margem_lente_percentual := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_margem_lente ON public.pedidos;
CREATE TRIGGER trigger_calcular_margem_lente
  BEFORE INSERT OR UPDATE OF preco_lente, custo_lente
  ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_margem_lente();

-- 6. VERIFICAÇÃO: LISTAR TODAS AS COLUNAS DE PREÇO/CUSTO/MARGEM
-- ============================================================================
SELECT 
  column_name,
  data_type,
  numeric_precision,
  numeric_scale,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'pedidos'
  AND column_name SIMILAR TO '%(preco|custo|margem)%'
ORDER BY ordinal_position;


| column_name               | data_type | numeric_precision | numeric_scale | is_nullable | column_default |
| ------------------------- | --------- | ----------------- | ------------- | ----------- | -------------- |
| custo_lentes              | numeric   | 10                | 2             | YES         | null           |
| preco_lente               | numeric   | 10                | 2             | YES         | null           |
| custo_lente               | numeric   | 10                | 2             | YES         | null           |
| margem_lente_percentual   | numeric   | 5                 | 2             | YES         | null           |
| custo_montagem            | numeric   | 10                | 2             | YES         | null           |
| preco_custo               | numeric   | 10                | 2             | YES         | null           |
| margem_cliente_dias       | integer   | 32                | 0             | YES         | 2              |
| preco_armacao             | numeric   | 10                | 2             | YES         | null           |
| custo_armacao             | numeric   | 10                | 2             | YES         | null           |
| margem_armacao_percentual | numeric   | 5                 | 2             | YES         | null           |


-- 7. TESTE: INSERIR PEDIDO COM PREÇOS E VER MARGENS CALCULADAS
-- ============================================================================
/*
-- Exemplo de teste (NÃO EXECUTAR EM PRODUÇÃO, APENAS DESENVOLVIMENTO):
INSERT INTO public.pedidos (
  loja_id,
  numero_os_fisica,
  tipo_pedido,
  cliente_nome,
  cliente_telefone,
  status,
  preco_armacao,
  custo_armacao,
  preco_lente,
  custo_lente
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- loja_id fake
  'OS-TESTE-001',
  'COMPLETO',
  'Cliente Teste Margem',
  '11999999999',
  'RASCUNHO',
  500.00, -- Preço venda armação
  200.00, -- Custo armação
  800.00, -- Preço venda lente
  400.00  -- Custo lente
)
RETURNING 
  id,
  preco_armacao,
  custo_armacao,
  margem_armacao_percentual,
  preco_lente,
  custo_lente,
  margem_lente_percentual;

-- Resultado esperado:
-- margem_armacao_percentual: 60.00% [(500-200)/500*100]
-- margem_lente_percentual: 50.00% [(800-400)/800*100]
*/

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
-- Executar este script no banco DESENROLA_DCL para adicionar suporte a:
-- ✅ Preços reais de venda (com desconto)
-- ✅ Custos de armação e lente separados
-- ✅ Cálculo automático de margens reais
-- ============================================================================
