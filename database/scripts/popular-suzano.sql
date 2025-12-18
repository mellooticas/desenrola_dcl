-- 🚀 POPULAR SEQUÊNCIA DE OSs - LOJA SUZANO
-- ============================================
-- Loja: Suzano
-- UUID: e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55
-- Primeira OS do sistema: 11855
-- ============================================

-- ✅ PASSO 1: POPULAR DINAMICAMENTE (Inteligente!)
-- Busca automaticamente a maior OS real + adiciona margem de 1000
-- Assim não precisa ficar atualizando o número final manualmente
SELECT * FROM popular_sequencia_dinamica(
  p_loja_id := 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'::UUID,
  p_numero_inicial := 11855,
  p_margem_futura := 200  -- Margem de segurança para OSs futuras
);

-- 📊 Resultado esperado (exemplo):
-- total_populado | primeira_os | ultima_os | maior_os_real
-- 2500          | 11855       | 13354     | 12354
--
-- Isso significa:
-- - Populou 2500 números
-- - De 11855 até 13354 (12354 é a maior OS real + 1000 de margem)

-- 📊 PASSO 2: VERIFICAR O QUE FOI CADASTRADO
SELECT 
  MIN(numero_os) as primeira_os,
  MAX(numero_os) as ultima_os,
  COUNT(*) as total_cadastrado
FROM os_sequencia
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55';

-- 🔍 PASSO 3: VER ESTATÍSTICAS DA LOJA
SELECT 
  total_os_esperadas as "Total Cadastrado",
  total_lancadas as "Já Lançadas",
  total_nao_lancadas as "Não Lançadas",
  total_justificadas as "Justificadas",
  ROUND(percentual_lancamento, 2) || '%' as "% Lançamento"
FROM view_os_estatisticas
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55';

-- 📋 PASSO 4: VER PRIMEIRAS 50 OSs NÃO LANÇADAS
SELECT 
  numero_os,
  status,
  data_esperada
FROM view_os_gaps
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  AND precisa_atencao = true
ORDER BY numero_os ASC
LIMIT 50;

-- 🔧 PASSO 5: VERIFICAR OSs QUE EXISTEM MAS NÃO FORAM CADASTRADAS
-- (OSs antes da 11855 que podem ter sido lançadas)
SELECT 
  CAST(p.numero_os_fisica AS INTEGER) as numero_os,
  p.status,
  p.created_at as data_lancamento
FROM pedidos p
WHERE p.numero_os_fisica IS NOT NULL
  AND p.numero_os_fisica ~ '^[0-9]+$'
  AND CAST(p.numero_os_fisica AS INTEGER) < 11855
  AND p.loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
ORDER BY CAST(p.numero_os_fisica AS INTEGER) DESC;

-- ⚠️ OPCIONAL: Se houver OSs antes da 11855, adicione-as
-- Exemplo: se a menor OS encontrada foi 10000
/*
SELECT popular_sequencia_os(
  p_loja_id := 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'::UUID,
  p_numero_inicial := 10000,  -- Ajuste conforme necessário
  p_numero_final := 11854,
  p_origem := 'importacao'
);
*/

-- 📊 PASSO 6: RELATÓRIO COMPLETO DE GAPS
-- Encontrar todos os números que foram pulados na sequência
WITH sequencia_completa AS (
  SELECT generate_series(11855, (
    SELECT MAX(CAST(numero_os_fisica AS INTEGER)) 
    FROM pedidos 
    WHERE numero_os_fisica ~ '^[0-9]+$'
      AND loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  )) as numero
)
SELECT 
  COUNT(*) as total_gaps,
  MIN(sc.numero) as primeiro_gap,
  MAX(sc.numero) as ultimo_gap
FROM sequencia_completa sc
WHERE NOT EXISTS (
  SELECT 1 FROM pedidos 
  WHERE CAST(numero_os_fisica AS INTEGER) = sc.numero
    AND loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
);

-- 📈 PASSO 7: VER DISTRIBUIÇÃO DE OSs POR STATUS
SELECT 
  status,
  COUNT(*) as quantidade,
  ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2) as percentual
FROM view_os_gaps
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
GROUP BY status
ORDER BY quantidade DESC;

-- ✅ CONCLUÍDO!
-- 
-- 🎯 COMO FUNCIONA AGORA:
-- 
-- 1. População Dinâmica:
--    - Busca automaticamente a maior OS real nos pedidos
--    - Popula até essa OS + 1000 (margem de segurança)
--    - Não precisa atualizar manualmente o número final
--
-- 2. Auto-Atualização (Trigger):
--    - Quando você lançar uma nova OS no sistema
--    - O trigger adiciona automaticamente na os_sequencia
--    - A sequência SEMPRE estará atualizada!
--
-- 3. Re-Popular quando necessário:
--    - Execute o PASSO 1 novamente periodicamente
--    - Ele vai adicionar os números faltantes
--    - Útil para manter a margem de 1000 OSs futuras
--
-- 4. Sistema inteligente:
--    - Detecta gaps automaticamente
--    - Popup aparece para OSs não lançadas
--    - Você justifica ou lança cada OS pendente

