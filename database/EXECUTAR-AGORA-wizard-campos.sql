-- ⚡ SCRIPT RÁPIDO - Adicionar colunas do Wizard V2
-- Copie e cole no SQL Editor do Supabase agora!

-- Adicionar classe_lente
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS classe_lente TEXT 
    CHECK (classe_lente IN ('bronze', 'prata', 'ouro', 'platinum')) 
    DEFAULT 'prata';

-- Adicionar os_fisica
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS os_fisica TEXT;

-- Adicionar os_laboratorio  
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS os_laboratorio TEXT;

-- Adicionar data_os
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS data_os DATE DEFAULT CURRENT_DATE;

-- Adicionar lente_catalogo_id
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS lente_catalogo_id TEXT;

-- Adicionar preco_custo
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS preco_custo NUMERIC(10,2);

-- Adicionar data_previsao_entrega (se não existir)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS data_previsao_entrega DATE;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pedidos_os_fisica ON pedidos(os_fisica);
CREATE INDEX IF NOT EXISTS idx_pedidos_os_laboratorio ON pedidos(os_laboratorio);
CREATE INDEX IF NOT EXISTS idx_pedidos_data_os ON pedidos(data_os);
CREATE INDEX IF NOT EXISTS idx_pedidos_lente_catalogo_id ON pedidos(lente_catalogo_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_classe_lente ON pedidos(classe_lente);

-- ✅ Pronto! Agora pode criar pedidos no wizard
SELECT 'Migration completa! ✅' as status;
