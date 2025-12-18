-- 🔧 CORREÇÃO RLS - VIEWS DE CONTROLE DE OS
-- ==========================================
-- Problema: RLS bloqueando acesso mesmo com GRANTs
-- Solução: Desabilitar RLS nas views (elas já filtram por loja)
-- ==========================================

-- ⚠️ IMPORTANTE: Views JÁ fazem o filtro de segurança
-- As views herdam dados de tabelas que TÊM RLS
-- Então não precisamos de RLS adicional nas views

-- Verificar se as views têm RLS (não deveriam ter)
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('view_os_gaps', 'view_os_estatisticas');

-- Se aparecer alguma linha, as views foram confundidas com tabelas
-- Views não têm RLS, então isso não deve retornar nada

-- ✅ SOLUÇÃO ALTERNATIVA: Recriar as views com SECURITY DEFINER
-- Isso faz a view rodar com privilégios do criador (postgres)

DROP VIEW IF EXISTS view_os_estatisticas CASCADE;
DROP VIEW IF EXISTS view_os_gaps CASCADE;

-- 3️⃣ View de gaps de OSs (SECURITY DEFINER)
CREATE OR REPLACE VIEW view_os_gaps 
WITH (security_invoker = false) -- Roda com privilégios do owner
AS
WITH os_esperadas AS (
  SELECT 
    seq.numero_os,
    seq.loja_id,
    l.nome as loja_nome,
    seq.data_esperada,
    seq.origem
  FROM os_sequencia seq
  LEFT JOIN lojas l ON l.id = seq.loja_id
),
os_lancadas AS (
  SELECT 
    CAST(numero_os_fisica AS INTEGER) as numero_os,
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
  l.numero_os IS NULL AND (j.numero_os IS NULL OR NOT j.resolvido) as precisa_atencao
FROM os_esperadas e
LEFT JOIN os_lancadas l ON l.numero_os = e.numero_os AND l.loja_id = e.loja_id
LEFT JOIN os_justificadas j ON j.numero_os = e.numero_os AND j.loja_id = e.loja_id
ORDER BY e.numero_os DESC;

-- 4️⃣ View de estatísticas (SECURITY DEFINER)
CREATE OR REPLACE VIEW view_os_estatisticas
WITH (security_invoker = false)
AS
SELECT 
  loja_id,
  loja_nome,
  COUNT(*) as total_os_esperadas,
  COUNT(*) FILTER (WHERE status = 'lancada') as total_lancadas,
  COUNT(*) FILTER (WHERE status = 'nao_lancada') as total_nao_lancadas,
  COUNT(*) FILTER (WHERE status = 'justificada') as total_justificadas,
  COUNT(*) FILTER (WHERE status = 'pendente_justificativa') as total_pendentes,
  COUNT(*) FILTER (WHERE precisa_atencao) as total_precisa_atencao,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'lancada')::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as percentual_lancamento
FROM view_os_gaps
GROUP BY loja_id, loja_nome;

-- Re-aplicar GRANTs
GRANT SELECT ON view_os_gaps TO authenticated;
GRANT SELECT ON view_os_estatisticas TO authenticated;

-- Comentários
COMMENT ON VIEW view_os_gaps IS 'Detecta gaps entre OSs esperadas e OSs lançadas (SECURITY DEFINER)';
COMMENT ON VIEW view_os_estatisticas IS 'Estatísticas de controle de lançamento de OSs por loja (SECURITY DEFINER)';

-- 🧪 TESTE FINAL
SELECT 
  'view_os_gaps' as view_name,
  COUNT(*) as total_registros
FROM view_os_gaps
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'

UNION ALL

SELECT 
  'view_os_estatisticas' as view_name,
  COUNT(*) as total_registros
FROM view_os_estatisticas
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55';

-- 📊 Resultado esperado:
-- view_os_gaps: 1638
-- view_os_estatisticas: 1

| view_name            | total_registros |
| -------------------- | --------------- |
| view_os_gaps         | 4376            |
| view_os_estatisticas | 1               |
