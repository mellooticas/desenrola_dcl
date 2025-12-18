-- 🚀 Script para popular sequência de OSs - LOJA ÚNICA
-- ============================================

-- ============================================
-- PASSO 0: Buscar ID da sua loja
-- ============================================
SELECT id, nome FROM lojas;
-- Copie o ID da sua loja e cole abaixo

| id                                   | nome               |
| ------------------------------------ | ------------------ |
| e974fc5d-ed39-4831-9e5e-4a5544489de6 | Escritório Central |
| c1aa5124-bdec-4cd2-86ee-cba6eea5041d | Mauá               |
| f1dd8fe9-b783-46cd-ad26-56ad364a85d7 | Perus              |
| c2bb8806-91d1-4670-9ce2-a949b188f8ae | Rio Pequeno        |
| 626c4397-72cd-46de-93ec-1a4255e21e44 | São Mateus         |
| e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | Suzano             |
| cb8ebda2-deff-4d44-8488-672d63bc8bd7 | Suzano Centro      |



-- ============================================
-- PASSO 1: POPULAR SEQUÊNCIA DE OSs
-- ============================================
-- 📝 AJUSTE OS VALORES ABAIXO:
-- 1. Cole o ID da loja (obtido no PASSO 0)
-- 2. Defina o número inicial e final das suas OSs

SELECT popular_sequencia_os(
  p_loja_id := 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'::UUID,
  p_numero_inicial := 11855,      -- 👈 Ajuste: primeira OS
  p_numero_final := 30000,      -- 👈 Ajuste: última OS
  p_origem := 'importacao'
);

| popular_sequencia_os |
| -------------------- |
| 18146                |


-- ✅ Resultado esperado: Retorna quantidade de OSs cadastradas
-- Exemplo: "5000" (se populou de 1 a 5000)

-- ============================================
-- PASSO 2: VERIFICAR O QUE FOI CADASTRADO
-- ============================================

-- Ver as primeiras e últimas OSs da sequência


-- ============================================
-- PASSO 3: VER OSs NÃO LANÇADAS (GAPS)
-- ============================================

-- Ver OSs que precisam de atenção (primeiras 20)
SELECT 
  numero_os,
  status,
  data_esperada
FROM view_os_gaps
WHERE precisa_atencao = true
ORDER BY numero_os ASC  -- Do menor para o maior
LIMIT 20;

| numero_os | status      | data_esperada                 |
| --------- | ----------- | ----------------------------- |
| 11855     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11856     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11857     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11858     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11859     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11860     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11861     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11862     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11863     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11864     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11865     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11866     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11867     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11868     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11869     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11870     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11871     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11872     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11873     | nao_lancada | 2025-12-17 19:15:17.243541+00 |
| 11874     | nao_lancada | 2025-12-17 19:15:17.243541+00 |


-- ============================================
-- PASSO 4: VER ESTATÍSTICAS GERAIS
-- ============================================

SELECT 
  total_os_esperadas as "Total Cadastrado",
  total_lancadas as "Já Lançadas",
  total_nao_lancadas as "Não Lançadas",
  total_justificadas as "Justificadas",
  ROUND(percentual_lancamento, 2) || '%' as "% Lançamento"
FROM view_os_estatisticas;

| Total Cadastrado | Já Lançadas | Não Lançadas | Justificadas | % Lançamento |
| ---------------- | ----------- | ------------ | ------------ | ------------ |
| 18146            | 0           | 18146        | 0            | 0.00%        |



-- ============================================
-- EXEMPLO: JUSTIFICAR UMA OS ESPECÍFICA
-- ============================================
-- Use quando precisar justificar manualmente uma OS

-- EXEMPLO: Justificar OS 12586
/*
SELECT justificar_os_nao_lancada(
  p_numero_os := 12586,                    -- 👈 Número da OS
  p_loja_id := 'ID-DA-LOJA'::UUID,        -- 👈 ID da loja
  p_justificativa := 'Cliente cancelou o pedido antes da produção',
  p_tipo_justificativa := 'cancelada_cliente',
  p_usuario_id := 'ID-DO-USUARIO'::UUID   -- 👈 Seu ID de usuário
);
*/

-- ============================================
-- 🔧 QUERIES ÚTEIS PARA MANUTENÇÃO
-- ============================================

-- 1️⃣ Ver gaps na sequência numérica (números que foram pulados)
WITH sequencia_completa AS (
  SELECT generate_series(
    (SELECT MIN(numero_os) FROM os_sequencia),
    (SELECT MAX(numero_os) FROM os_sequencia)
  ) as numero
)
SELECT 
  sc.numero as numero_os_faltando
FROM sequencia_completa sc
LEFT JOIN os_sequencia os ON os.numero_os = sc.numero
WHERE os.numero_os IS NULL
ORDER BY sc.numero
LIMIT 50;  -- Primeiros 50 gaps

Success. No rows returned




-- 2️⃣ OSs que existem nos pedidos mas não estão na sequência cadastrada
-- (Útil para encontrar OSs que foram lançadas mas esquecemos de cadastrar)
SELECT 
  CAST(p.numero_os_fisica AS INTEGER) as numero_os,
  p.status,
  p.created_at as data_lancamento
FROM pedidos p
WHERE p.numero_os_fisica IS NOT NULL
  AND p.numero_os_fisica ~ '^[0-9]+$'
  AND NOT EXISTS (
    SELECT 1 FROM os_sequencia 
    WHERE numero_os = CAST(p.numero_os_fisica AS INTEGER)
  )
ORDER BY CAST(p.numero_os_fisica AS INTEGER) DESC
LIMIT 20;

| numero_os | status   | data_lancamento               |
| --------- | -------- | ----------------------------- |
| 513       | PRODUCAO | 2025-12-16 16:21:43.053928+00 |
| 512       | CHEGOU   | 2025-12-16 16:16:33.148237+00 |
| 511       | CHEGOU   | 2025-12-16 16:10:04.23517+00  |
| 510       | PAGO     | 2025-12-16 16:02:38.741072+00 |
| 509       | PRODUCAO | 2025-12-16 00:36:05.729982+00 |
| 508       | PRODUCAO | 2025-12-13 20:43:41.108398+00 |
| 507       | PRODUCAO | 2025-12-13 20:37:03.289022+00 |
| 506       | PRODUCAO | 2025-12-13 20:34:48.427725+00 |
| 505       | PRODUCAO | 2025-12-13 20:30:02.87215+00  |
| 504       | PRODUCAO | 2025-12-13 20:27:54.13683+00  |
| 503       | PRODUCAO | 2025-12-13 20:24:39.596718+00 |
| 502       | PRODUCAO | 2025-12-13 20:22:07.53038+00  |
| 501       | PRODUCAO | 2025-12-13 18:39:23.570236+00 |
| 500       | ENTREGUE | 2025-12-12 14:43:28.499923+00 |
| 499       | PRODUCAO | 2025-12-11 16:39:16.328243+00 |
| 498       | PRODUCAO | 2025-12-11 16:37:24.087106+00 |
| 497       | PRODUCAO | 2025-12-11 16:35:09.521253+00 |
| 496       | PRONTO   | 2025-12-11 16:33:09.664275+00 |
| 495       | PRODUCAO | 2025-12-11 16:30:50.60048+00  |
| 494       | CHEGOU   | 2025-12-11 16:00:08.93979+00  |



-- 3️⃣ Ver todas as OSs justificadas (histórico)
SELECT 
  numero_os,
  tipo_justificativa,
  justificativa,
  created_at as data_justificativa
FROM os_nao_lancadas
WHERE resolvido = true
ORDER BY created_at DESC
LIMIT 20;

-- 4️⃣ Contar OSs por status
SELECT 
  status,
  COUNT(*) as quantidade
FROM view_os_gaps
GROUP BY status
ORDER BY quantidade DESC;

-- ============================================
-- 🧹 LIMPEZA E MANUTENÇÃO (USE COM CUIDADO!)
-- ============================================

-- ⚠️ RESETAR TUDO (apaga toda a sequência cadastrada)
-- Descomente apenas se tiver certeza!
/*
TRUNCATE TABLE os_nao_lancadas CASCADE;
TRUNCATE TABLE os_sequencia CASCADE;
*/

-- ⚠️ Remover OSs antigas (exemplo: mais de 2 anos)
/*
DELETE FROM os_sequencia
WHERE data_esperada < NOW() - INTERVAL '2 years';
*/

-- ============================================
-- 📊 ADICIONAR MAIS OSs À SEQUÊNCIA EXISTENTE
-- ============================================

-- Se precisar adicionar um novo range de OSs
-- Exemplo: Já tem de 1 a 5000, quer adicionar de 5001 a 10000

/*
SELECT popular_sequencia_os(
  p_loja_id := 'ID-DA-LOJA'::UUID,
  p_numero_inicial := 5001,
  p_numero_final := 10000,
  p_origem := 'manual'
);
*/
