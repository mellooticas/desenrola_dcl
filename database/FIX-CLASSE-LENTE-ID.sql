-- ⚡ CORRIGIR: classe_lente_id não deve ser obrigatório
-- Agora usamos classe_lente (texto) ao invés de FK

ALTER TABLE pedidos 
ALTER COLUMN classe_lente_id DROP NOT NULL;

-- ✅ Pronto! Agora pode criar pedidos
SELECT 'classe_lente_id agora é opcional ✅' as status;
