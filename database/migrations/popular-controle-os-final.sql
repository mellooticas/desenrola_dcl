-- =========================================
-- ✅ SOLUÇÃO FINAL: Popular controle_os com Dados Reais
-- =========================================
-- Baseado no diagnóstico que mostrou:
-- - Suzano: 10665 → 12488 (1824 esperados, 448 lançados, 1376 gaps)
-- - Escritório Central: 0 → 12429 (apenas 41 OSs - sequência muito esparsa)

-- =========================================
-- PASSO 1: LIMPAR E RECRIAR ESTRUTURA
-- =========================================

-- Limpar dados antigos
TRUNCATE controle_os CASCADE;

-- =========================================
-- PASSO 2: POPULAR LOJA SUZANO
-- =========================================

DO $$
BEGIN
  RAISE NOTICE '🧹 Tabela controle_os limpa';
  RAISE NOTICE '📍 Populando loja Suzano...';
END $$;

INSERT INTO controle_os (numero_os, loja_id, lancado, data_lancamento)
WITH suzano AS (
  SELECT id as loja_id FROM lojas WHERE nome = 'Suzano'
),
range_suzano AS (
  SELECT 
    MIN(CAST(numero_os_fisica AS INTEGER)) as min_os,
    MAX(CAST(numero_os_fisica AS INTEGER)) as max_os
  FROM pedidos p
  JOIN suzano s ON s.loja_id = p.loja_id
  WHERE numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$'
),
sequencia_completa AS (
  SELECT 
    num as numero_os,
    s.loja_id
  FROM range_suzano r
  CROSS JOIN generate_series(r.min_os, r.max_os) AS num
  CROSS JOIN suzano s
),
oss_lancadas AS (
  SELECT 
    CAST(numero_os_fisica AS INTEGER) as numero_os,
    MIN(created_at) as data_lancamento
  FROM pedidos p
  JOIN suzano s ON s.loja_id = p.loja_id
  WHERE numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$'
  GROUP BY numero_os_fisica
)
SELECT 
  sc.numero_os,
  sc.loja_id,
  (ol.numero_os IS NOT NULL) as lancado,
  ol.data_lancamento
FROM sequencia_completa sc
LEFT JOIN oss_lancadas ol ON ol.numero_os = sc.numero_os;

-- Verificar resultado Suzano
WITH stats_suzano AS (
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE lancado) as lancadas,
    COUNT(*) FILTER (WHERE NOT lancado) as gaps
  FROM controle_os c
  JOIN lojas l ON l.id = c.loja_id
  WHERE l.nome = 'Suzano'
)
SELECT 
  '✅ Suzano populada' as resultado,
  total || ' OSs no controle' as info,
  lancadas || ' lançadas' as lancadas_info,
  gaps || ' gaps detectados' as gaps_info
FROM stats_suzano;

-- =========================================
-- PASSO 3: POPULAR ESCRITÓRIO CENTRAL
-- =========================================

-- ATENÇÃO: Escritório Central tem range 0 → 12429 mas apenas 41 OSs
-- Isso é MUITO esparso (0.3% de preenchimento)
-- Vamos popular apenas se for realmente necessário

-- Decisão: Comentar por enquanto pois parece ser dados de teste/importação
-- Se precisar, descomentar o bloco abaixo:

/*
RAISE NOTICE '📍 Populando Escritório Central...';

INSERT INTO controle_os (numero_os, loja_id, lancado, data_lancamento)
WITH escritorio AS (
  SELECT id as loja_id FROM lojas WHERE nome = 'Escritório Central'
),
-- Opção A: Popular range completo (0 → 12429) - VAI CRIAR 12430 REGISTROS!
-- CUIDADO: Isso pode deixar o sistema lento
range_escritorio AS (
  SELECT 
    MIN(CAST(numero_os_fisica AS INTEGER)) as min_os,
    MAX(CAST(numero_os_fisica AS INTEGER)) as max_os
  FROM pedidos p
  JOIN escritorio e ON e.loja_id = p.loja_id
  WHERE numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$'
),
sequencia_completa AS (
  SELECT 
    num as numero_os,
    e.loja_id
  FROM range_escritorio r
  CROSS JOIN generate_series(r.min_os, r.max_os) AS num
  CROSS JOIN escritorio e
),
oss_lancadas AS (
  SELECT 
    CAST(numero_os_fisica AS INTEGER) as numero_os,
    MIN(created_at) as data_lancamento
  FROM pedidos p
  JOIN escritorio e ON e.loja_id = p.loja_id
  WHERE numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$'
  GROUP BY numero_os_fisica
)
SELECT 
  sc.numero_os,
  sc.loja_id,
  (ol.numero_os IS NOT NULL) as lancado,
  ol.data_lancamento
FROM sequencia_completa sc
LEFT JOIN oss_lancadas ol ON ol.numero_os = sc.numero_os;
*/

DO $$
BEGIN
  RAISE NOTICE '⚠️ Escritório Central não populado (muito esparso)';
END $$;

-- =========================================
-- PASSO 4: VALIDAÇÃO FINAL
-- =========================================

-- 4.1 Estatísticas por loja
SELECT 
  '📊 Controle de OSs Populado' as titulo,
  l.nome as loja,
  COUNT(*) as total_oss_controle,
  COUNT(*) FILTER (WHERE lancado) as oss_lancadas,
  COUNT(*) FILTER (WHERE NOT lancado) as gaps_detectados,
  ROUND((COUNT(*) FILTER (WHERE lancado)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 1) as percentual_preenchimento
FROM controle_os c
LEFT JOIN lojas l ON l.id = c.loja_id
GROUP BY l.id, l.nome
ORDER BY l.nome;

-- 4.2 Testar view de gaps
SELECT 
  '🔍 Primeiros 20 Gaps Detectados' as titulo,
  loja_nome,
  numero_os,
  status,
  precisa_atencao
FROM view_controle_os_gaps
ORDER BY loja_nome, numero_os
LIMIT 20;

-- 4.3 Testar view de estatísticas
SELECT 
  '📈 Estatísticas Gerais' as titulo,
  loja_nome,
  total_os_esperadas,
  total_lancadas,
  total_nao_lancadas,
  total_precisa_atencao,
  percentual_lancamento
FROM view_controle_os_estatisticas
ORDER BY loja_nome;

-- =========================================
-- PASSO 5: RECOMENDAÇÕES
-- =========================================

SELECT 
  '💡 RECOMENDAÇÕES' as tipo,
  '
  ✅ SUZANO POPULADA COM SUCESSO
  
  📊 Dados reais detectados:
  - Range: 10665 → 12488 (1824 números)
  - OSs lançadas: 448 (24.6%)
  - Gaps reais: 1376 (75.4%)
  
  🎯 PRÓXIMOS PASSOS:
  
  1. Atualizar interface:
     - Agora vai mostrar "1376 gaps detectados"
     - KPI "Não Lançadas" = 1376
     - Lista de gaps vai aparecer
  
  2. Justificar gaps (opcional):
     - Use a interface para explicar OSs não lançadas
     - Ex: "OS 10666 - Cancelada pelo cliente"
     - Ex: "OS 10670 - Erro de numeração"
  
  3. Escritório Central:
     - Tem dados muito esparsos (0.3% preenchimento)
     - Provavelmente dados de teste ou importação
     - NÃO foi populado por padrão
     - Se necessário, descomentar bloco no PASSO 3
  
  4. Monitoramento:
     - Novos pedidos sincronizam automaticamente
     - Trigger atualiza controle_os em tempo real
     - Views sempre atualizadas
  
  ⚠️ IMPORTANTE:
  
  - Não popular Escritório Central agora (12430 registros!)
  - Se precisar, revisar dados primeiro
  - Talvez seja melhor limpar esses 41 pedidos
  
  ' as detalhes;

-- =========================================
-- RESULTADO FINAL
-- =========================================

DO $$
BEGIN
  RAISE NOTICE '✅ População concluída!';
  RAISE NOTICE '📊 Suzano: 1824 OSs no controle, 1376 gaps detectados';
  RAISE NOTICE '⚠️ Escritório Central: Não populado (muito esparso)';
  RAISE NOTICE '🎯 Agora a interface vai mostrar os gaps reais!';
END $$;
