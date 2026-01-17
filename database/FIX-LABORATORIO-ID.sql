-- ⚡ CORRIGIR: laboratorio_id opcional durante transição PDV
-- Os IDs do catálogo de lentes não sincronizam com tabela laboratorios

ALTER TABLE pedidos 
ALTER COLUMN laboratorio_id DROP NOT NULL;

-- ✅ Pronto! Agora pode criar pedidos sem laboratorio_id
SELECT 'laboratorio_id agora é opcional ✅' as status;

| status                            |
| --------------------------------- |
| laboratorio_id agora é opcional ✅ |