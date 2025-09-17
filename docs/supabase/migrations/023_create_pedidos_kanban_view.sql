-- Criação da view v_pedidos_kanban para interface do Kanban
-- Esta view combina dados da tabela pedidos com informações relacionadas

-- Remover view existente se houver
DROP VIEW IF EXISTS v_pedidos_kanban;

CREATE VIEW v_pedidos_kanban AS
SELECT 
    p.id,
    p.numero_sequencial,
    p.numero_os_fisica,
    p.numero_pedido_laboratorio,
    p.status,
    p.prioridade,
    p.cliente_nome,
    p.cliente_telefone,
    p.valor_pedido,
    p.custo_lentes,
    p.eh_garantia,
    p.observacoes,
    p.observacoes_garantia,
    p.data_pedido,
    p.data_prevista_pronto,
    p.data_pagamento,
    p.forma_pagamento,
    p.created_at,
    p.updated_at,
    p.created_by,
    p.updated_by,
    p.loja_id,
    p.laboratorio_id,
    p.classe_lente_id,
    
    -- Dados da loja
    l.nome as loja_nome,
    l.codigo as loja_codigo,
    l.telefone as loja_telefone,
    l.endereco as loja_endereco,
    
    -- Dados do laboratório
    lab.nome as laboratorio_nome,
    lab.codigo as laboratorio_codigo,
    lab.contato->>'telefone' as laboratorio_telefone,
    lab.contato->>'endereco' as laboratorio_endereco,
    
    -- Dados da classe de lente
    cl.nome as classe_nome,
    cl.categoria as classe_categoria,
    cl.cor_badge as classe_cor_badge,
    cl.sla_base_dias as classe_sla_dias,
    
    -- Campos calculados para timeline
    EXTRACT(EPOCH FROM (
        CASE 
            WHEN p.status = 'ENTREGUE' THEN p.updated_at
            ELSE NOW()
        END - p.created_at
    )) / 86400.0 as lead_time_dias,
    
    -- Status formatado para exibição
    CASE p.status
        WHEN 'REGISTRADO' THEN 'Registrado'
        WHEN 'AG_PAGAMENTO' THEN 'Aguardando Pagamento'
        WHEN 'PAGO' THEN 'Pago'
        WHEN 'PRODUCAO' THEN 'Em Produção'
        WHEN 'PRONTO' THEN 'Pronto no DCL'
        WHEN 'ENVIADO' THEN 'Enviado para Loja'
        WHEN 'CHEGOU' THEN 'Chegou na Loja'
        WHEN 'ENTREGUE' THEN 'Entregue ao Cliente'
        WHEN 'CANCELADO' THEN 'Cancelado'
        ELSE p.status
    END as status_label,
    
    -- Indicadores de atraso
    CASE 
        WHEN p.data_prevista_pronto IS NOT NULL AND p.data_prevista_pronto < CURRENT_DATE 
             AND p.status NOT IN ('ENTREGUE', 'CANCELADO') 
        THEN true
        ELSE false
    END as em_atraso,
    
    -- Dias de atraso
    CASE 
        WHEN p.data_prevista_pronto IS NOT NULL AND p.data_prevista_pronto < CURRENT_DATE 
             AND p.status NOT IN ('ENTREGUE', 'CANCELADO')
        THEN (CURRENT_DATE - p.data_prevista_pronto)
        ELSE 0
    END as dias_atraso

FROM pedidos p
LEFT JOIN lojas l ON p.loja_id = l.id
LEFT JOIN laboratorios lab ON p.laboratorio_id = lab.id
LEFT JOIN classes_lente cl ON p.classe_lente_id = cl.id;

-- Conceder acesso público à view
GRANT SELECT ON v_pedidos_kanban TO anon, authenticated;

-- Adicionar comentários para documentação
COMMENT ON VIEW v_pedidos_kanban IS 'View completa para interface do Kanban com dados de pedidos, lojas, laboratórios e classes de lentes';

-- Criar índices para melhor performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_loja_id ON pedidos(loja_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_laboratorio_id ON pedidos(laboratorio_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_classe_lente_id ON pedidos(classe_lente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos(created_at);
CREATE INDEX IF NOT EXISTS idx_pedidos_updated_at ON pedidos(updated_at);
CREATE INDEX IF NOT EXISTS idx_pedidos_data_prevista_pronto ON pedidos(data_prevista_pronto);