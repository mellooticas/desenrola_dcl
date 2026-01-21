-- =========================================
-- 🔧 FIX: view_os_gaps - Corrigir campo precisa_atencao
-- =========================================
-- Problema: HEAD request retorna 400 com filtro precisa_atencao=eq.true
-- Causa: Campo boolean não está corretamente definido na view
-- Solução: Recriar view com campo boolean explícito
-- =========================================

-- 1️⃣ Drop da view antiga
DROP VIEW IF EXISTS view_os_gaps CASCADE;

-- 2️⃣ Recriar view com campo precisa_atencao corretamente tipado
CREATE OR REPLACE VIEW view_os_gaps AS
WITH os_esperadas AS (
  SELECT 
    seq.numero_os,
    seq.loja_id,
    seq.data_esperada,
    seq.origem,
    l.nome as loja_nome
  FROM os_sequencia seq
  LEFT JOIN lojas l ON l.id = seq.loja_id
),
os_lancadas AS (
  SELECT 
    CAST(numero_os_fisica AS BIGINT) as numero_os,
    loja_id
  FROM pedidos
  WHERE numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$'
),
os_justificadas AS (
  SELECT 
    numero_os,
    loja_id,
    justificativa,
    tipo_justificativa,
    resolvido
  FROM os_nao_lancadas
)
SELECT 
  e.numero_os,
  e.loja_id,
  e.loja_nome,
  e.data_esperada,
  e.origem,
  CASE 
    WHEN l.numero_os IS NOT NULL THEN 'lancada'
    WHEN j.numero_os IS NOT NULL AND j.resolvido THEN 'justificada'
    WHEN j.numero_os IS NOT NULL AND NOT j.resolvido THEN 'pendente_justificativa'
    ELSE 'nao_lancada'
  END as status,
  j.justificativa,
  j.tipo_justificativa,
  -- 🔧 FIX: Cast explícito para boolean
  CAST(
    (l.numero_os IS NULL AND (j.numero_os IS NULL OR NOT j.resolvido))
    AS BOOLEAN
  ) as precisa_atencao
FROM os_esperadas e
LEFT JOIN os_lancadas l ON l.numero_os = e.numero_os AND l.loja_id = e.loja_id
LEFT JOIN os_justificadas j ON j.numero_os = e.numero_os AND j.loja_id = e.loja_id
ORDER BY e.numero_os DESC;

-- 3️⃣ Recriar view dependente (view_os_estatisticas)
CREATE OR REPLACE VIEW view_os_estatisticas AS
SELECT 
  loja_id,
  loja_nome,
  COUNT(*) as total_os_esperadas,
  COUNT(*) FILTER (WHERE status = 'lancada') as total_lancadas,
  COUNT(*) FILTER (WHERE status = 'nao_lancada') as total_nao_lancadas,
  COUNT(*) FILTER (WHERE status = 'justificada') as total_justificadas,
  COUNT(*) FILTER (WHERE status = 'pendente_justificativa') as total_pendentes,
  COUNT(*) FILTER (WHERE precisa_atencao = true) as total_precisa_atencao,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'lancada')::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as percentual_lancamento
FROM view_os_gaps
GROUP BY loja_id, loja_nome;

-- 4️⃣ Comentários e permissões
COMMENT ON VIEW view_os_gaps IS 'Detecta gaps entre OSs esperadas e OSs lançadas - FIX: campo precisa_atencao como boolean';
COMMENT ON VIEW view_os_estatisticas IS 'Estatísticas de controle de OSs por loja';

-- Permissões
GRANT SELECT ON view_os_gaps TO authenticated;
GRANT SELECT ON view_os_estatisticas TO authenticated;

-- 5️⃣ Teste
SELECT 
  'Total OSs' as metrica,
  COUNT(*) as total
FROM view_os_gaps
UNION ALL
SELECT 
  'Precisam atenção' as metrica,
  COUNT(*) as total
FROM view_os_gaps
WHERE precisa_atencao = true;


| metrica          | total |
| ---------------- | ----- |
| Total OSs        | 4403  |
| Precisam atenção | 3815  |

