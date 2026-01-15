-- ============================================================
-- CORREÇÃO: Adicionar coluna CHEGOU na view
-- CHEGOU = chegou na loja (operacional)
-- ENTREGUE = cliente buscou (finalizado)
-- ============================================================

CREATE OR REPLACE VIEW public.v_kanban_colunas AS
SELECT 
  'pendente' as id,
  'Pendente' as nome,
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
  'aguardando_pagamento', 'Aguard. Pagamento', '💰', 4,
  'Aguardando confirmação de pagamento', '#f59e0b'

UNION ALL SELECT 
  'pago', 'Pago', '✅', 5,
  'Pagamento confirmado', '#10b981'

UNION ALL SELECT 
  'producao', 'Produção', '⚙️', 6,
  'Em produção no laboratório', '#f97316'

UNION ALL SELECT 
  'pronto', 'Pronto', '🎯', 7,
  'Pronto no laboratório', '#8b5cf6'

UNION ALL SELECT 
  'enviado', 'Enviado', '📦', 8,
  'Laboratório enviou o produto', '#6366f1'

UNION ALL SELECT 
  'chegou', 'Na Loja', '🏪', 9,
  'Produto chegou na loja, aguardando cliente buscar', '#06b6d4'

ORDER BY ordem;

COMMENT ON VIEW public.v_kanban_colunas IS 'Definição das colunas do Kanban - 9 colunas operacionais (sem ENTREGUE/CANCELADO)';
