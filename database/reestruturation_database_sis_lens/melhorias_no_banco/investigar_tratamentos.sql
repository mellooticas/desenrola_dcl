-- ============================================================================
-- INVESTIGAR TRATAMENTOS NA VIEW v_lentes
-- Detectar quais tratamentos realmente existem e com quais valores
-- ============================================================================

-- 1. CONTAR LENTES COM CADA TRATAMENTO
SELECT 
  'tem_ar' as tratamento,
  COUNT(*) as total_com_true,
  COUNT(*) FILTER (WHERE tem_ar = true) as com_true
FROM v_lentes;

| tratamento | total_com_true | com_true |
| ---------- | -------------- | -------- |
| tem_ar     | 1411           | 0        |




SELECT 
  'tem_antirrisco' as tratamento,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE tem_antirrisco = true) as com_true
FROM v_lentes;

| tratamento     | total_registros | com_true |
| -------------- | --------------- | -------- |
| tem_antirrisco | 1411            | 0        |


SELECT 
  'tem_blue' as tratamento,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE tem_blue = true) as com_true
FROM v_lentes;


| tratamento | total_registros | com_true |
| ---------- | --------------- | -------- |
| tem_blue   | 1411            | 0        |


SELECT 
  'tem_uv' as tratamento,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE tem_uv = true) as com_true
FROM v_lentes;


| tratamento | total_registros | com_true |
| ---------- | --------------- | -------- |
| tem_uv     | 1411            | 0        |


SELECT 
  'tem_polarizado' as tratamento,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE tem_polarizado = true) as com_true
FROM v_lentes;


| tratamento     | total_registros | com_true |
| -------------- | --------------- | -------- |
| tem_polarizado | 1411            | 0        |

SELECT 
  'tem_hidrofobico' as tratamento,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE tem_hidrofobico = true) as com_true
FROM v_lentes;


| tratamento      | total_registros | com_true |
| --------------- | --------------- | -------- |
| tem_hidrofobico | 1411            | 0        |


SELECT 
  'tratamento_foto' as tratamento,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE tratamento_foto != 'nenhum') as com_valor_diferente_nenhum
FROM v_lentes;


| tratamento      | total_registros | com_valor_diferente_nenhum |
| --------------- | --------------- | -------------------------- |
| tratamento_foto | 1411            | 0                          |


SELECT 
  'tem_digital' as tratamento,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE tem_digital = true) as com_true
FROM v_lentes;

SELECT 
  'tem_free_form' as tratamento,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE tem_free_form = true) as com_true
FROM v_lentes;

-- 2. RESUMO RÁPIDO: QUANTAS LENTES TÊMPELO MENOS UM TRATAMENTO
SELECT 
  COUNT(*) as total_lentes,
  COUNT(*) FILTER (WHERE tem_ar = true) as com_ar,
  COUNT(*) FILTER (WHERE tem_antirrisco = true) as com_antirrisco,
  COUNT(*) FILTER (WHERE tem_blue = true) as com_blue,
  COUNT(*) FILTER (WHERE tem_uv = true) as com_uv,
  COUNT(*) FILTER (WHERE tem_polarizado = true) as com_polarizado,
  COUNT(*) FILTER (WHERE tem_hidrofobico = true) as com_hidrofobico,
  COUNT(*) FILTER (WHERE tratamento_foto != 'nenhum') as com_foto,
  COUNT(*) FILTER (WHERE tem_digital = true) as com_digital,
  COUNT(*) FILTER (WHERE tem_free_form = true) as com_free_form
FROM v_lentes;

-- 3. VERIFICAR OS VALORES ÚNICOS EM TRATAMENTO_FOTO
SELECT DISTINCT tratamento_foto, COUNT(*) as quantidade
FROM v_lentes
GROUP BY tratamento_foto
ORDER BY quantidade DESC;

-- 4. BUSCAR EXEMPLOS DE LENTES COM TRATAMENTOS (para testar)
SELECT id, nome_lente, marca_nome, tem_ar, tem_blue, tem_uv, tratamento_foto
FROM v_lentes
WHERE tem_ar = true
LIMIT 5;

SELECT id, nome_lente, marca_nome, tem_ar, tem_blue, tem_uv, tratamento_foto
FROM v_lentes
WHERE tem_blue = true
LIMIT 5;

SELECT id, nome_lente, marca_nome, tem_ar, tem_blue, tem_uv, tratamento_foto
FROM v_lentes
WHERE tratamento_foto != 'nenhum'
LIMIT 5;

SELECT id, nome_lente, marca_nome, tem_polarizado, tem_digital, tem_free_form
FROM v_lentes
WHERE tem_polarizado = true OR tem_digital = true OR tem_free_form = true
LIMIT 5;

-- 5. TESTAR FILTRO COM tem_ar = true
SELECT COUNT(*) as lentes_com_ar
FROM v_lentes
WHERE tem_ar = true;

-- 6. TESTAR FILTRO COMPOSTO (AR + CATEGORIA)
SELECT COUNT(*) as lentes_com_ar_economica
FROM v_lentes
WHERE tem_ar = true AND categoria = 'economica';

-- 7. VER ESTRUTURA DA TABELA (tipos de dados)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'v_lentes'
ORDER BY ordinal_position;
