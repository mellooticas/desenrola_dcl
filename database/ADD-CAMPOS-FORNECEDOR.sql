-- ⚡ ADICIONAR campos de fornecedor para transição
-- Guardar informações do fornecedor do catálogo sem FK

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fornecedor_nome TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fornecedor_catalogo_id TEXT;

COMMENT ON COLUMN pedidos.fornecedor_nome IS 'Nome do fornecedor do catálogo de lentes (transição PDV)';
COMMENT ON COLUMN pedidos.fornecedor_catalogo_id IS 'ID do fornecedor no catálogo best_lens (transição PDV)';

-- Índices
CREATE INDEX IF NOT EXISTS idx_pedidos_fornecedor_nome ON pedidos(fornecedor_nome);
CREATE INDEX IF NOT EXISTS idx_pedidos_fornecedor_catalogo_id ON pedidos(fornecedor_catalogo_id);

SELECT '✅ Campos de fornecedor adicionados' as status;
