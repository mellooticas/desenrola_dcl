-- ============================================================================
-- SCRIPT COMPLETO PARA CRIAR FUNCIONALIDADE DE TIMELINE
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================================================

-- 1. CRIAR TABELA PEDIDOS_TIMELINE
-- ============================================================================
CREATE TABLE IF NOT EXISTS pedidos_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  responsavel_id UUID REFERENCES usuarios(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE pedidos_timeline ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Todos podem visualizar timeline" ON pedidos_timeline
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir timeline" ON pedidos_timeline
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar timeline" ON pedidos_timeline
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pedidos_timeline_pedido_id ON pedidos_timeline(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_timeline_status_novo ON pedidos_timeline(status_novo);
CREATE INDEX IF NOT EXISTS idx_pedidos_timeline_created_at ON pedidos_timeline(created_at);
CREATE INDEX IF NOT EXISTS idx_pedidos_timeline_responsavel ON pedidos_timeline(responsavel_id);

-- 2. CRIAR FUNÇÃO PARA ATUALIZAR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_pedidos_timeline_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_pedidos_timeline_updated_at
  BEFORE UPDATE ON pedidos_timeline
  FOR EACH ROW
  EXECUTE FUNCTION update_pedidos_timeline_updated_at();

-- 3. INSERIR TIMELINE INICIAL PARA PEDIDOS EXISTENTES
-- ============================================================================
INSERT INTO pedidos_timeline (pedido_id, status_anterior, status_novo, created_at)
SELECT 
  p.id,
  NULL as status_anterior,
  p.status as status_novo,
  COALESCE(p.created_at, NOW())
FROM pedidos p
WHERE NOT EXISTS (
  SELECT 1 FROM pedidos_timeline pt WHERE pt.pedido_id = p.id
)
ON CONFLICT DO NOTHING;

-- 4. CRIAR VIEW PARA LEAD TIME COMPARATIVO
-- ============================================================================
CREATE OR REPLACE VIEW v_lead_time_comparativo AS
WITH timeline_data AS (
  SELECT 
    pt.pedido_id,
    MIN(pt.created_at) as inicio_timeline,
    MAX(CASE WHEN pt.status_novo = 'ENTREGUE' THEN pt.created_at END) as fim_timeline
  FROM pedidos_timeline pt 
  GROUP BY pt.pedido_id
),
lead_times AS (
  SELECT 
    p.id,
    p.laboratorio_id,
    p.classe_lente_id,
    COALESCE(p.created_at, NOW()) as created_at,
    p.status,
    td.inicio_timeline,
    td.fim_timeline,
    CASE 
      WHEN td.fim_timeline IS NOT NULL THEN
        EXTRACT(EPOCH FROM (td.fim_timeline - COALESCE(p.created_at, NOW()))) / 86400.0
      WHEN p.status = 'ENTREGUE' AND p.updated_at IS NOT NULL THEN
        EXTRACT(EPOCH FROM (p.updated_at - COALESCE(p.created_at, NOW()))) / 86400.0
      ELSE
        EXTRACT(EPOCH FROM (NOW() - COALESCE(p.created_at, NOW()))) / 86400.0
    END as lead_time_dias
  FROM pedidos p
  LEFT JOIN timeline_data td ON p.id = td.pedido_id
  WHERE p.status != 'CANCELADO'
    AND COALESCE(p.created_at, NOW()) >= NOW() - INTERVAL '1 year'
),
medias_por_combinacao AS (
  SELECT 
    lt.laboratorio_id,
    lt.classe_lente_id,
    AVG(lt.lead_time_dias) as media_combinacao,
    COUNT(*) as total_pedidos_combinacao
  FROM lead_times lt
  WHERE lt.lead_time_dias > 0 AND lt.lead_time_dias < 365
  GROUP BY lt.laboratorio_id, lt.classe_lente_id
),
medias_laboratorio AS (
  SELECT 
    lt.laboratorio_id,
    AVG(lt.lead_time_dias) as media_laboratorio,
    COUNT(*) as total_pedidos_laboratorio
  FROM lead_times lt
  WHERE lt.lead_time_dias > 0 AND lt.lead_time_dias < 365
  GROUP BY lt.laboratorio_id
),
medias_classe AS (
  SELECT 
    lt.classe_lente_id,
    AVG(lt.lead_time_dias) as media_classe,
    COUNT(*) as total_pedidos_classe
  FROM lead_times lt
  WHERE lt.lead_time_dias > 0 AND lt.lead_time_dias < 365
  GROUP BY lt.classe_lente_id
),
media_geral_calc AS (
  SELECT 
    AVG(lt.lead_time_dias) as media_geral,
    COUNT(*) as total_pedidos_geral
  FROM lead_times lt
  WHERE lt.lead_time_dias > 0 AND lt.lead_time_dias < 365
)
SELECT 
  mpc.laboratorio_id,
  mpc.classe_lente_id,
  COALESCE(ml.media_laboratorio, 5.0) as media_laboratorio,
  COALESCE(mc.media_classe, 5.0) as media_classe,
  COALESCE(mgc.media_geral, 5.0) as media_geral,
  COALESCE(ml.total_pedidos_laboratorio, 0) as pedidos_laboratorio,
  COALESCE(mc.total_pedidos_classe, 0) as pedidos_classe,
  COALESCE(mgc.total_pedidos_geral, 0) as total_pedidos
FROM medias_por_combinacao mpc
LEFT JOIN medias_laboratorio ml ON mpc.laboratorio_id = ml.laboratorio_id
LEFT JOIN medias_classe mc ON mpc.classe_lente_id = mc.classe_lente_id
CROSS JOIN media_geral_calc mgc;

-- 5. CRIAR VIEW PARA TIMELINE COMPLETO
-- ============================================================================
CREATE OR REPLACE VIEW v_pedido_timeline_completo AS
WITH timeline_with_lag AS (
  SELECT 
    pt.*,
    COALESCE(u.nome, 'Sistema') as responsavel_nome,
    u.email as responsavel_email,
    LAG(pt.created_at) OVER (PARTITION BY pt.pedido_id ORDER BY pt.created_at) as etapa_anterior_data,
    LAG(pt.status_novo) OVER (PARTITION BY pt.pedido_id ORDER BY pt.created_at) as status_anterior_real,
    ROW_NUMBER() OVER (PARTITION BY pt.pedido_id ORDER BY pt.created_at) as ordem_etapa
  FROM pedidos_timeline pt
  LEFT JOIN usuarios u ON pt.responsavel_id = u.id
)
SELECT 
  twl.*,
  CASE 
    WHEN twl.etapa_anterior_data IS NOT NULL THEN
      EXTRACT(EPOCH FROM (twl.created_at - twl.etapa_anterior_data)) / 3600.0
    ELSE 0
  END as tempo_etapa_anterior_horas,
  
  CASE 
    WHEN twl.etapa_anterior_data IS NOT NULL THEN
      EXTRACT(EPOCH FROM (twl.created_at - twl.etapa_anterior_data)) / 86400.0
    ELSE 0
  END as tempo_etapa_anterior_dias,
  
  CASE UPPER(TRIM(COALESCE(twl.status_novo, '')))
    WHEN 'REGISTRADO' THEN 'Registrado'
    WHEN 'AG_PAGAMENTO' THEN 'Aguardando Pagamento'
    WHEN 'PAGO' THEN 'Pago'
    WHEN 'PRODUCAO' THEN 'Em Produção'
    WHEN 'PRONTO' THEN 'Pronto no DCL'
    WHEN 'ENVIADO' THEN 'Enviado para Loja'
    WHEN 'CHEGOU' THEN 'Chegou na Loja'
    WHEN 'ENTREGUE' THEN 'Entregue ao Cliente'
    WHEN 'CANCELADO' THEN 'Cancelado'
    ELSE COALESCE(twl.status_novo, 'Indefinido')
  END as status_label,
  
  CASE UPPER(TRIM(COALESCE(twl.status_novo, '')))
    WHEN 'REGISTRADO' THEN '#6B7280'
    WHEN 'AG_PAGAMENTO' THEN '#EAB308'
    WHEN 'PAGO' THEN '#3B82F6'
    WHEN 'PRODUCAO' THEN '#8B5CF6'
    WHEN 'PRONTO' THEN '#6366F1'
    WHEN 'ENVIADO' THEN '#06B6D4'
    WHEN 'CHEGOU' THEN '#F97316'
    WHEN 'ENTREGUE' THEN '#10B981'
    WHEN 'CANCELADO' THEN '#EF4444'
    ELSE '#6B7280'
  END as status_color

FROM timeline_with_lag twl
ORDER BY twl.pedido_id, twl.created_at;

-- 6. CRIAR VIEW PARA KANBAN COMPLETO
-- ============================================================================
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

-- 7. COMENTÁRIOS FINAIS
-- ============================================================================
COMMENT ON TABLE pedidos_timeline IS 'Tabela para rastreamento de mudanças de status dos pedidos, permitindo análise de timeline e lead time';
COMMENT ON VIEW v_lead_time_comparativo IS 'View otimizada para comparação de lead times por laboratório e classe de lente, fornecendo médias comparativas para análise de performance';
COMMENT ON VIEW v_pedido_timeline_completo IS 'View otimizada para timeline de pedidos com cálculos de tempo entre etapas, nomes de responsáveis e formatação para UI';
COMMENT ON VIEW v_pedidos_kanban IS 'View completa para interface do Kanban com dados de pedidos, lojas, laboratórios e classes de lentes';

-- FIM DO SCRIPT
-- ============================================================================