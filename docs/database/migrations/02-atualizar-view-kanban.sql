-- ============================================================
-- MIGRAÇÃO SIMPLIFICADA 2: Atualizar View Kanban
-- Data: 20/12/2025
-- Versão: SAFE - Recria view com campos de lentes
-- ============================================================

DROP VIEW IF EXISTS public.v_pedidos_kanban CASCADE;

CREATE OR REPLACE VIEW public.v_pedidos_kanban AS
SELECT 
  p.*,
  
  -- Joins existentes
  l.nome as loja_nome,
  lab.nome as laboratorio_nome,
  cl.nome as classe_lente_nome,
  
  -- 🆕 Campos computados de lentes
  CASE 
    WHEN p.margem_lente_percentual >= 400 THEN 'alta'
    WHEN p.margem_lente_percentual >= 300 THEN 'normal'
    ELSE 'baixa'
  END as classificacao_margem,
  
  CASE 
    WHEN p.margem_lente_percentual >= 400 THEN '🟢 Alta'
    WHEN p.margem_lente_percentual >= 300 THEN '🟡 Normal'
    WHEN p.margem_lente_percentual IS NOT NULL THEN '🔴 Baixa'
    ELSE NULL
  END as badge_margem,
  
  jsonb_array_length(COALESCE(p.tratamentos_lente, '[]'::jsonb)) as qtd_tratamentos,
  
  (p.lente_selecionada_id IS NOT NULL) as usa_catalogo_lentes,
  
  -- 🆕 Flags de permissão
  (p.status IN ('pendente', 'rascunho', 'registrado')) as pode_editar_numero_lab,
  
  (p.status = 'pendente' AND p.lente_selecionada_id IS NULL) as aguardando_escolha_lente,
  
  (p.status = 'registrado' AND (p.numero_pedido_laboratorio IS NULL OR p.numero_pedido_laboratorio = '')) as aguardando_numero_lab,
  
  (p.status = 'registrado' AND p.numero_pedido_laboratorio IS NOT NULL AND p.numero_pedido_laboratorio != '') as pode_avancar_pagamento

FROM public.pedidos p
LEFT JOIN public.lojas l ON p.loja_id = l.id
LEFT JOIN public.laboratorios lab ON p.laboratorio_id = lab.id
LEFT JOIN public.classes_lente cl ON p.classe_lente_id = cl.id

ORDER BY 
  CASE p.status
    WHEN 'pendente' THEN 1
    WHEN 'rascunho' THEN 2
    WHEN 'registrado' THEN 3
    WHEN 'pago' THEN 4
    WHEN 'producao' THEN 5
    WHEN 'pronto' THEN 6
    WHEN 'enviado' THEN 7
    WHEN 'entregue' THEN 8
  END,
  p.created_at DESC;

COMMENT ON VIEW public.v_pedidos_kanban IS 'View do Kanban com campos de lentes do catálogo';
