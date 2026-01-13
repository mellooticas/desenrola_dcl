-- ============================================
-- SETUP MÓDULO DE CONTROLE DE MONTAGENS
-- ============================================

-- 1. VIEW: Relatório completo de montagens
CREATE OR REPLACE VIEW view_relatorio_montagens AS
SELECT 
  p.id,
  p.numero_sequencial,
  p.status,
  p.cliente_nome,
  p.created_at as data_registro,
  p.updated_at as ultima_atualizacao,
  p.loja_id,
  lo.nome as loja_nome,
  
  -- Montador
  m.id as montador_id,
  m.nome as montador_nome,
  m.tipo as montador_tipo,
  
  -- Laboratório
  l.id as laboratorio_id,
  l.nome as laboratorio_nome,
  
  -- Status legível
  CASE p.status
    WHEN 'ENVIADO' THEN 'Em Montagem'
    WHEN 'CHEGOU' THEN 'Montagem Concluída'
    WHEN 'ENTREGUE' THEN 'Entregue ao Cliente'
    ELSE p.status
  END as status_legivel

FROM pedidos p
LEFT JOIN montadores m ON p.montador_id = m.id
LEFT JOIN laboratorios l ON p.laboratorio_id = l.id
LEFT JOIN lojas lo ON p.loja_id = lo.id
WHERE p.montador_id IS NOT NULL;

-- 2. VIEW: KPIs de Montadores
CREATE OR REPLACE VIEW view_kpis_montadores AS
SELECT 
  m.id,
  m.nome,
  m.tipo,
  m.laboratorio_id,
  l.nome as laboratorio_nome,
  
  -- Pedidos em montagem agora
  COUNT(CASE WHEN p.status = 'ENVIADO' THEN 1 END) as em_montagem_atual,
  
  -- Concluídos hoje
  COUNT(CASE 
    WHEN p.status IN ('CHEGOU', 'ENTREGUE') 
    AND DATE(p.updated_at) = CURRENT_DATE 
    THEN 1 
  END) as concluidos_hoje,
  
  -- Concluídos esta semana
  COUNT(CASE 
    WHEN p.status IN ('CHEGOU', 'ENTREGUE') 
    AND p.updated_at >= DATE_TRUNC('week', CURRENT_DATE) 
    THEN 1 
  END) as concluidos_semana,
  
  -- Concluídos este mês
  COUNT(CASE 
    WHEN p.status IN ('CHEGOU', 'ENTREGUE') 
    AND p.updated_at >= DATE_TRUNC('month', CURRENT_DATE) 
    THEN 1 
  END) as concluidos_mes,
  
  -- Tempo médio simplificado (baseado em updated_at - created_at)
  AVG(
    CASE 
      WHEN p.status IN ('CHEGOU', 'ENTREGUE') THEN
        EXTRACT(EPOCH FROM (p.updated_at - p.created_at)) / 3600
      ELSE NULL
    END
  ) as tempo_medio_horas,
  
  -- Total de montagens realizadas (histórico)
  COUNT(CASE WHEN p.status IN ('CHEGOU', 'ENTREGUE') THEN 1 END) as total_montagens

FROM montadores m
LEFT JOIN pedidos p ON p.montador_id = m.id
LEFT JOIN laboratorios l ON m.laboratorio_id = l.id
WHERE m.ativo = true
GROUP BY m.id, m.nome, m.tipo, m.laboratorio_id, l.nome;

-- 3. VIEW: Performance diária de montadores (simplificada)
CREATE OR REPLACE VIEW view_performance_diaria_montadores AS
SELECT 
  m.id as montador_id,
  m.nome as montador_nome,
  DATE(p.updated_at) as data,
  COUNT(*) as montagens_concluidas,
  AVG(EXTRACT(EPOCH FROM (p.updated_at - p.created_at)) / 3600) as tempo_medio_horas
FROM pedidos p
JOIN montadores m ON p.montador_id = m.id
WHERE p.status IN ('CHEGOU', 'ENTREGUE')
  AND p.updated_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY m.id, m.nome, DATE(p.updated_at)
ORDER BY data DESC, montagens_concluidas DESC;

-- 4. VIEW: Ranking de montadores por período
CREATE OR REPLACE VIEW view_ranking_montadores AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as ranking,
  m.id as montador_id,
  m.nome as montador_nome,
  m.tipo,
  COUNT(*) as total_montagens,
  AVG(EXTRACT(EPOCH FROM (p.updated_at - p.created_at)) / 3600) as tempo_medio_horas
FROM pedidos p
JOIN montadores m ON p.montador_id = m.id
WHERE p.status IN ('CHEGOU', 'ENTREGUE')
  AND p.updated_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY m.id, m.nome, m.tipo;

-- 5. Adicionar políticas RLS para as views
ALTER VIEW view_relatorio_montagens SET (security_invoker = true);
ALTER VIEW view_kpis_montadores SET (security_invoker = true);
ALTER VIEW view_performance_diaria_montadores SET (security_invoker = true);
ALTER VIEW view_ranking_montadores SET (security_invoker = true);

-- 6. Conceder permissões
GRANT SELECT ON view_relatorio_montagens TO authenticated;
GRANT SELECT ON view_kpis_montadores TO authenticated;
GRANT SELECT ON view_performance_diaria_montadores TO authenticated;
GRANT SELECT ON view_ranking_montadores TO authenticated;

-- 7. Verificação final
SELECT 'view_relatorio_montagens' as view_name, COUNT(*) as total_registros FROM view_relatorio_montagens
UNION ALL
SELECT 'view_kpis_montadores', COUNT(*) FROM view_kpis_montadores
UNION ALL
SELECT 'view_performance_diaria_montadores', COUNT(*) FROM view_performance_diaria_montadores
UNION ALL
SELECT 'view_ranking_montadores', COUNT(*) FROM view_ranking_montadores;


| view_name                          | total_registros |
| ---------------------------------- | --------------- |
| view_relatorio_montagens           | 0               |
| view_kpis_montadores               | 13              |
| view_performance_diaria_montadores | 0               |
| view_ranking_montadores            | 0               |
