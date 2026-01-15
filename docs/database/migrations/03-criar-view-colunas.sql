-- ============================================================
-- MIGRAÇÃO SIMPLIFICADA 3: View de Colunas do Kanban
-- Data: 20/12/2025
-- Versão: SAFE - Cria view com colunas incluindo PENDENTE
-- ============================================================

CREATE OR REPLACE VIEW public.v_kanban_colunas AS
SELECT 
  'pendente' as coluna_id,
  'Pendente' as coluna_nome,
  '⏳' as icone,
  1 as ordem,
  'Aguardando DCL escolher lente e registrar no laboratório' as descricao,
  '#94a3b8' as cor

UNION ALL SELECT 
  'rascunho', 'Rascunho', '📝', 2,
  'Pedido em rascunho', '#6b7280'

UNION ALL SELECT 
  'registrado', 'Registrado', '📋', 3,
  'Registrado no laboratório, aguardando número do pedido', '#3b82f6'

UNION ALL SELECT 
  'pago', 'Pago', '💰', 4,
  'Pagamento confirmado', '#eab308'

UNION ALL SELECT 
  'producao', 'Produção', '⚙️', 5,
  'Em produção no laboratório', '#f97316'

UNION ALL SELECT 
  'pronto', 'Pronto', '✅', 6,
  'Pronto no laboratório', '#8b5cf6'

UNION ALL SELECT 
  'enviado', 'Enviado', '📦', 7,
  'Laboratório enviou o produto', '#8b5cf6'

UNION ALL SELECT 
  'chegou', 'Na Loja', '🏪', 8,
  'Produto chegou na loja, aguardando cliente buscar', '#06b6d4'

UNION ALL SELECT 
  'entregue', 'Entregue', '🎉', 9,
  'Produto entregue ao cliente (finalizado)', '#10b981'

ORDER BY ordem;

COMMENT ON VIEW public.v_kanban_colunas IS 'Definição das colunas do Kanban incluindo PENDENTE';
