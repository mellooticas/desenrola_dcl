-- Adicionar suporte ao novo Catálogo de Lentes na tabela de Pedidos
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS grupo_canonico_id UUID REFERENCES grupos_canonicos(id),
ADD COLUMN IF NOT EXISTS lente_id UUID REFERENCES lentes(id);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_pedidos_grupo_canonico ON pedidos(grupo_canonico_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_lente ON pedidos(lente_id);

-- Comentário para documentação
COMMENT ON COLUMN pedidos.grupo_canonico_id IS 'Referência ao grupo de lentes do novo catálogo (Best Lens)';
COMMENT ON COLUMN pedidos.lente_id IS 'Referência à lente específica selecionada (SKU)';
