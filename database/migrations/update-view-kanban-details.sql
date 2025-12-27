-- Atualizar view v_pedidos_kanban para incluir mais detalhes
-- Necessário para a página de detalhes do pedido funcionar corretamente com RLS

DROP VIEW IF EXISTS v_pedidos_kanban;

CREATE VIEW v_pedidos_kanban 
WITH (security_barrier = false) 
AS
SELECT 
  p.*,
  -- Dados da Loja
  l.nome as loja_nome,
  l.codigo as loja_codigo,
  l.endereco as loja_endereco,
  l.telefone as loja_telefone,
  l.whatsapp as loja_whatsapp,
  l.margem_seguranca_dias,
  l.alerta_sla_dias,
  
  -- Dados do Laboratório
  lab.nome as laboratorio_nome,
  lab.codigo as laboratorio_codigo,
  lab.sla_padrao_dias,
  lab.trabalha_sabado as laboratorio_trabalha_sabado,
  lab.especialidades as laboratorio_especialidades,
  
  -- Dados da Classe de Lente
  cl.nome as classe_nome,
  cl.codigo as classe_codigo,
  cl.categoria as classe_categoria,
  cl.cor_badge as classe_cor,
  cl.sla_base_dias as classe_sla_dias,
  
  -- Campos Calculados de SLA
  CASE 
    WHEN p.data_sla_laboratorio < CURRENT_DATE THEN true
    ELSE false
  END as sla_atrasado,
  
  CASE 
    WHEN p.data_sla_laboratorio <= CURRENT_DATE + INTERVAL '1 day' * COALESCE(l.alerta_sla_dias, 1) THEN true
    ELSE false
  END as sla_alerta,
  
  (p.data_sla_laboratorio - CURRENT_DATE) as dias_para_sla,
  (p.data_prometida - CURRENT_DATE) as dias_para_promessa

FROM pedidos p
LEFT JOIN lojas l ON p.loja_id = l.id
LEFT JOIN laboratorios lab ON p.laboratorio_id = lab.id  
LEFT JOIN classes_lente cl ON p.classe_lente_id = cl.id;

-- Garantir permissões (se necessário, dependendo do setup do banco)
GRANT SELECT ON v_pedidos_kanban TO authenticated;
GRANT SELECT ON v_pedidos_kanban TO service_role;
