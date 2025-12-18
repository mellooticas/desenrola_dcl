-- =========================================
-- 📊 VIEW OS_GAPS FILTRADA (APENAS OSs REAIS)
-- =========================================
-- Cria uma view que mostra apenas gaps de OSs que realmente existem nos pedidos
-- NÃO modifica a tabela os_sequencia (mantém dados originais)

-- Criar view que filtra gaps até o MAX de cada loja
CREATE OR REPLACE VIEW view_os_gaps_reais AS
WITH max_os_por_loja AS (
  SELECT 
    loja_id,
    MAX(CAST(numero_os_fisica AS INTEGER)) as max_os_real
  FROM pedidos
  WHERE numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$'
  GROUP BY loja_id
),
gaps_filtrados AS (
  SELECT 
    g.*,
    m.max_os_real
  FROM view_os_gaps g
  LEFT JOIN max_os_por_loja m ON m.loja_id = g.loja_id
  WHERE g.numero_os <= COALESCE(m.max_os_real, g.numero_os)
)
SELECT 
  numero_os,
  loja_id,
  loja_nome,
  data_esperada,
  origem,
  status,
  justificativa,
  tipo_justificativa,
  precisa_atencao
FROM gaps_filtrados;

-- Grant permissions
GRANT SELECT ON view_os_gaps_reais TO anon, authenticated, public;

-- Testar a view
SELECT 
  COUNT(*) as total_gaps_reais,
  MIN(numero_os) as menor_gap,
  MAX(numero_os) as maior_gap
FROM view_os_gaps_reais
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  AND precisa_atencao = true;

-- Comparar: antes vs depois
SELECT 'Original (todos)' as tipo, COUNT(*) as total
FROM view_os_gaps 
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  AND precisa_atencao = true
UNION ALL
SELECT 'Filtrado (reais)' as tipo, COUNT(*) as total
FROM view_os_gaps_reais
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  AND precisa_atencao = true;
