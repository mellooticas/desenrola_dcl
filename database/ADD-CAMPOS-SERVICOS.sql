-- ============================================================
-- 🛠️ ADICIONAR CAMPOS DE SERVIÇOS NA TABELA PEDIDOS
-- Data: 23/01/2026
-- Objetivo: Permitir salvamento de serviços adicionais
-- IMPORTANTE: Execute no banco DESENROLA_DCL (não no CRM_ERP)
-- ============================================================

-- 1. Adicionar campos de serviço
-- Nota: servico_produto_id é UUID do CRM_ERP, sem FK (bancos diferentes)
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS servico_produto_id UUID,
ADD COLUMN IF NOT EXISTS servico_sku_visual TEXT,
ADD COLUMN IF NOT EXISTS servico_descricao TEXT,
ADD COLUMN IF NOT EXISTS servico_preco_tabela NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS servico_desconto_percentual NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS servico_preco_final NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS servico_custo NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS montador_usuario_id UUID,
ADD COLUMN IF NOT EXISTS montador_nome TEXT;

-- 2. Comentários para documentação
COMMENT ON COLUMN pedidos.servico_produto_id IS 'UUID do produto de serviço no CRM_ERP (sem FK - bancos diferentes)';
COMMENT ON COLUMN pedidos.servico_sku_visual IS 'SKU visual do serviço para exibição';
COMMENT ON COLUMN pedidos.servico_descricao IS 'Descrição do serviço (ex: Montagem de Lentes)';
COMMENT ON COLUMN pedidos.servico_preco_tabela IS 'Preço de tabela do serviço';
COMMENT ON COLUMN pedidos.servico_desconto_percentual IS 'Desconto percentual aplicado (0-100)';
COMMENT ON COLUMN pedidos.servico_preco_final IS 'Preço final após desconto';
COMMENT ON COLUMN pedidos.servico_custo IS 'Custo do serviço';
COMMENT ON COLUMN pedidos.montador_usuario_id IS 'UUID do usuário que realizou a montagem (sem FK se usuarios não existe)';
COMMENT ON COLUMN pedidos.montador_nome IS 'Nome do montador (texto livre se não for usuário)';

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_pedidos_servico_produto_id ON pedidos(servico_produto_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_montador_usuario_id ON pedidos(montador_usuario_id);

-- 4. Verificar estrutura atualizada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND (column_name LIKE 'servico%' OR column_name LIKE 'montador%')
ORDER BY column_name;


| column_name                 | data_type | is_nullable | column_default |
| --------------------------- | --------- | ----------- | -------------- |
| montador_contato            | text      | YES         | null           |
| montador_id                 | uuid      | YES         | null           |
| montador_local              | text      | YES         | null           |
| montador_nome               | text      | YES         | null           |
| montador_usuario_id         | uuid      | YES         | null           |
| servico_custo               | numeric   | YES         | null           |
| servico_desconto_percentual | numeric   | YES         | 0              |
| servico_descricao           | text      | YES         | null           |
| servico_preco_final         | numeric   | YES         | null           |
| servico_preco_tabela        | numeric   | YES         | null           |
| servico_produto_id          | uuid      | YES         | null           |
| servico_sku_visual          | text      | YES         | null           |



-- 5. Verificação final
SELECT 'Campos de serviço adicionados com sucesso!' as status;


| status                                     |
| ------------------------------------------ |
| Campos de serviço adicionados com sucesso! |