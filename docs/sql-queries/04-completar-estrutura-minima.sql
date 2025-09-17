-- ================================================================
-- CRIAÇÃO DAS VIEWS E TABELAS FALTANTES - MÍNIMO NECESSÁRIO
-- ================================================================

-- ================================================================
-- 1. CRIAR TABELA notificacoes (para useNotifications hook)
-- ================================================================
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  titulo TEXT NOT NULL,
  mensagem TEXT,
  tipo TEXT DEFAULT 'info', -- info, warning, error, success
  lida BOOLEAN DEFAULT false,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_leitura TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_data_criacao ON notificacoes(data_criacao DESC);

-- ================================================================
-- 2. CRIAR TABELA role_permissions (para usePermissions hook)
-- ================================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  permissao TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, permissao)
);

-- Inserir permissões básicas
INSERT INTO role_permissions (role, permissao) VALUES 
('admin', 'dashboard.view'),
('admin', 'pedidos.create'),
('admin', 'pedidos.edit'),
('admin', 'pedidos.delete'),
('admin', 'laboratorios.manage'),
('operador', 'dashboard.view'),
('operador', 'pedidos.view'),
('operador', 'pedidos.create'),
('visualizador', 'dashboard.view'),
('visualizador', 'pedidos.view')
ON CONFLICT (role, permissao) DO NOTHING;

-- ================================================================
-- 3. CRIAR VIEW v_insights_automaticos (única view faltante)
-- ================================================================
CREATE OR REPLACE VIEW v_insights_automaticos AS
WITH insights_sla AS (
  SELECT 
    'SLA_PERFORMANCE' AS categoria,
    'Laboratórios com SLA abaixo da meta' AS insight,
    'ALERTA' AS tipo,
    COUNT(*) FILTER (WHERE sla_compliance < 85) AS valor_numerico,
    'Revisar processos dos laboratórios com baixa performance' AS recomendacao,
    'MÉDIA' AS prioridade
  FROM v_ranking_laboratorios
),
insights_volume AS (
  SELECT 
    'VOLUME_PEDIDOS' AS categoria,
    'Análise de volume mensal' AS insight,
    'TENDENCIA' AS tipo,
    (SELECT COUNT(*) FROM pedidos WHERE data_pedido >= CURRENT_DATE - INTERVAL '30 days') AS valor_numerico,
    CASE 
      WHEN (SELECT COUNT(*) FROM pedidos WHERE data_pedido >= CURRENT_DATE - INTERVAL '30 days') > 
           (SELECT COUNT(*) FROM pedidos WHERE data_pedido >= CURRENT_DATE - INTERVAL '60 days' AND data_pedido < CURRENT_DATE - INTERVAL '30 days')
      THEN 'Crescimento no volume de pedidos - considerar capacidade'
      ELSE 'Volume estável - monitorar tendências'
    END AS recomendacao,
    'BAIXA' AS prioridade
),
insights_financeiro AS (
  SELECT 
    'FINANCEIRO' AS categoria,
    'Performance financeira por categoria' AS insight,
    'OPORTUNIDADE' AS tipo,
    (SELECT MAX(faturamento_total) FROM v_analise_financeira) AS valor_numerico,
    'Focar na categoria com maior faturamento para maximizar resultados' AS recomendacao,
    'ALTA' AS prioridade
)

SELECT * FROM insights_sla
UNION ALL
SELECT * FROM insights_volume  
UNION ALL
SELECT * FROM insights_financeiro;

-- ================================================================
-- 4. AJUSTES NAS APIS (se necessário)
-- ================================================================

-- Verificar se as views principais estão funcionando
SELECT 'TESTE v_kpis_dashboard' AS teste, COUNT(*) AS registros FROM v_kpis_dashboard;
SELECT 'TESTE v_ranking_laboratorios' AS teste, COUNT(*) AS registros FROM v_ranking_laboratorios;
SELECT 'TESTE v_evolucao_mensal' AS teste, COUNT(*) AS registros FROM v_evolucao_mensal;
SELECT 'TESTE v_analise_financeira' AS teste, COUNT(*) AS registros FROM v_analise_financeira;
SELECT 'TESTE v_insights_automaticos' AS teste, COUNT(*) AS registros FROM v_insights_automaticos;

-- ================================================================
-- 5. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ================================================================
COMMENT ON TABLE notificacoes IS 'Sistema de notificações para usuários';
COMMENT ON TABLE role_permissions IS 'Controle de permissões por perfil de usuário';
COMMENT ON VIEW v_insights_automaticos IS 'Insights automáticos baseados em análise de dados';

-- ================================================================
-- CONCLUÍDO! Agora todas as APIs devem funcionar perfeitamente
-- ================================================================