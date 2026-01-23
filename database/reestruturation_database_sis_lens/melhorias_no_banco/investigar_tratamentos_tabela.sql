-- ============================================================================
-- INVESTIGAR TRATAMENTOS NA TABELA lens_catalog.lentes
-- Comparar ambos os conjuntos de campos
-- ============================================================================

-- 1. VERIFICAR DADOS DOS CAMPOS "NORMALIZADOS" (CONJUNTO 1)
SELECT 
  'tratamento_antirreflexo' as campo,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE tratamento_antirreflexo = true) as com_true,
  COUNT(*) FILTER (WHERE tratamento_antirreflexo = false) as com_false,
  COUNT(*) FILTER (WHERE tratamento_antirreflexo IS NULL) as com_null
FROM lens_catalog.lentes;


| campo                   | total_registros | com_true | com_false | com_null |
| ----------------------- | --------------- | -------- | --------- | -------- |
| tratamento_antirreflexo | 1411            | 620      | 791       | 0        |


SELECT 
  'tratamento_antirrisco' as campo,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE tratamento_antirrisco = true) as com_true,
  COUNT(*) FILTER (WHERE tratamento_antirrisco = false) as com_false,
  COUNT(*) FILTER (WHERE tratamento_antirrisco IS NULL) as com_null
FROM lens_catalog.lentes;

| campo                 | total_registros | com_true | com_false | com_null |
| --------------------- | --------------- | -------- | --------- | -------- |
| tratamento_antirrisco | 1411            | 0        | 1411      | 0        |


SELECT 
  'tratamento_uv' as campo,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE tratamento_uv = true) as com_true,
  COUNT(*) FILTER (WHERE tratamento_uv = false) as com_false,
  COUNT(*) FILTER (WHERE tratamento_uv IS NULL) as com_null
FROM lens_catalog.lentes;

| campo         | total_registros | com_true | com_false | com_null |
| ------------- | --------------- | -------- | --------- | -------- |
| tratamento_uv | 1411            | 1411     | 0         | 0        |


SELECT 
  'tratamento_blue_light' as campo,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE tratamento_blue_light = true) as com_true,
  COUNT(*) FILTER (WHERE tratamento_blue_light = false) as com_false,
  COUNT(*) FILTER (WHERE tratamento_blue_light IS NULL) as com_null
FROM lens_catalog.lentes;

| campo                 | total_registros | com_true | com_false | com_null |
| --------------------- | --------------- | -------- | --------- | -------- |
| tratamento_blue_light | 1411            | 466      | 945       | 0        |


-- 2. VERIFICAR DADOS DOS CAMPOS "CURTOS" (CONJUNTO 2)
SELECT 
  'ar' as campo,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE ar = true) as com_true,
  COUNT(*) FILTER (WHERE ar = false) as com_false,
  COUNT(*) FILTER (WHERE ar IS NULL) as com_null
FROM lens_catalog.lentes;


| campo | total_registros | com_true | com_false | com_null |
| ----- | --------------- | -------- | --------- | -------- |
| ar    | 1411            | 0        | 1411      | 0        |


SELECT 
  'antirrisco' as campo,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE antirrisco = true) as com_true,
  COUNT(*) FILTER (WHERE antirrisco = false) as com_false,
  COUNT(*) FILTER (WHERE antirrisco IS NULL) as com_null
FROM lens_catalog.lentes;


| campo      | total_registros | com_true | com_false | com_null |
| ---------- | --------------- | -------- | --------- | -------- |
| antirrisco | 1411            | 0        | 1411      | 0        |


SELECT 
  'hidrofobico' as campo,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE hidrofobico = true) as com_true,
  COUNT(*) FILTER (WHERE hidrofobico = false) as com_false,
  COUNT(*) FILTER (WHERE hidrofobico IS NULL) as com_null
FROM lens_catalog.lentes;

| campo       | total_registros | com_true | com_false | com_null |
| ----------- | --------------- | -------- | --------- | -------- |
| hidrofobico | 1411            | 0        | 1411      | 0        |


SELECT 
  'antiembaçante' as campo,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE antiembaçante = true) as com_true,
  COUNT(*) FILTER (WHERE antiembaçante = false) as com_false,
  COUNT(*) FILTER (WHERE antiembaçante IS NULL) as com_null
FROM lens_catalog.lentes;


| campo         | total_registros | com_true | com_false | com_null |
| ------------- | --------------- | -------- | --------- | -------- |
| antiembaçante | 1411            | 0        | 1411      | 0        |


SELECT 
  'blue' as campo,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE blue = true) as com_true,
  COUNT(*) FILTER (WHERE blue = false) as com_false,
  COUNT(*) FILTER (WHERE blue IS NULL) as com_null
FROM lens_catalog.lentes;

| campo | total_registros | com_true | com_false | com_null |
| ----- | --------------- | -------- | --------- | -------- |
| blue  | 1411            | 0        | 1411      | 0        |


SELECT 
  'uv400' as campo,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE uv400 = true) as com_true,
  COUNT(*) FILTER (WHERE uv400 = false) as com_false,
  COUNT(*) FILTER (WHERE uv400 IS NULL) as com_null
FROM lens_catalog.lentes;

| campo | total_registros | com_true | com_false | com_null |
| ----- | --------------- | -------- | --------- | -------- |
| uv400 | 1411            | 0        | 1411      | 0        |


SELECT 
  'polarizado' as campo,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE polarizado = true) as com_true,
  COUNT(*) FILTER (WHERE polarizado = false) as com_false,
  COUNT(*) FILTER (WHERE polarizado IS NULL) as com_null
FROM lens_catalog.lentes;


| campo      | total_registros | com_true | com_false | com_null |
| ---------- | --------------- | -------- | --------- | -------- |
| polarizado | 1411            | 0        | 1411      | 0        |


SELECT 
  'digital' as campo,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE digital = true) as com_true,
  COUNT(*) FILTER (WHERE digital = false) as com_false,
  COUNT(*) FILTER (WHERE digital IS NULL) as com_null
FROM lens_catalog.lentes;

| campo   | total_registros | com_true | com_false | com_null |
| ------- | --------------- | -------- | --------- | -------- |
| digital | 1411            | 0        | 1411      | 0        |


SELECT 
  'free_form' as campo,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE free_form = true) as com_true,
  COUNT(*) FILTER (WHERE free_form = false) as com_false,
  COUNT(*) FILTER (WHERE free_form IS NULL) as com_null
FROM lens_catalog.lentes;


| campo     | total_registros | com_true | com_false | com_null |
| --------- | --------------- | -------- | --------- | -------- |
| free_form | 1411            | 0        | 1411      | 0        |


SELECT 
  'indoor' as campo,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE indoor = true) as com_true,
  COUNT(*) FILTER (WHERE indoor = false) as com_false,
  COUNT(*) FILTER (WHERE indoor IS NULL) as com_null
FROM lens_catalog.lentes;


| campo  | total_registros | com_true | com_false | com_null |
| ------ | --------------- | -------- | --------- | -------- |
| indoor | 1411            | 0        | 1411      | 0        |


SELECT 
  'drive' as campo,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE drive = true) as com_true,
  COUNT(*) FILTER (WHERE drive = false) as com_false,
  COUNT(*) FILTER (WHERE drive IS NULL) as com_null
FROM lens_catalog.lentes;

| campo | total_registros | com_true | com_false | com_null |
| ----- | --------------- | -------- | --------- | -------- |
| drive | 1411            | 0        | 1411      | 0        |


-- 3. VERIFICAR TRATAMENTO_FOTOSSENSIVEIS vs FOTOSSENSIVEL
SELECT 
  'tratamento_fotossensiveis' as campo,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE tratamento_fotossensiveis != 'nenhum') as com_valor_diferente_nenhum,
  COUNT(*) FILTER (WHERE tratamento_fotossensiveis IS NULL) as com_null
FROM lens_catalog.lentes;


| campo                     | total_registros | com_valor_diferente_nenhum | com_null |
| ------------------------- | --------------- | -------------------------- | -------- |
| tratamento_fotossensiveis | 1411            | 382                        | 0        |


SELECT DISTINCT tratamento_fotossensiveis, COUNT(*) as quantidade
FROM lens_catalog.lentes
GROUP BY tratamento_fotossensiveis
ORDER BY quantidade DESC;


| tratamento_fotossensiveis | quantidade |
| ------------------------- | ---------- |
| nenhum                    | 1029       |
| fotocromático             | 322        |
| polarizado                | 60         |


SELECT 
  'fotossensivel' as campo,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE fotossensivel != 'nenhum') as com_valor_diferente_nenhum,
  COUNT(*) FILTER (WHERE fotossensivel IS NULL) as com_null
FROM lens_catalog.lentes;


| campo         | total_registros | com_valor_diferente_nenhum | com_null |
| ------------- | --------------- | -------------------------- | -------- |
| fotossensivel | 1411            | 0                          | 0        |



SELECT DISTINCT fotossensivel, COUNT(*) as quantidade
FROM lens_catalog.lentes
GROUP BY fotossensivel
ORDER BY quantidade DESC;


| fotossensivel | quantidade |
| ------------- | ---------- |
| nenhum        | 1411       |




-- 4. RESUMO COMPLETO - TODOS OS CAMPOS DE TRATAMENTO
SELECT 
  COUNT(*) as total_lentes,
  COUNT(*) FILTER (WHERE tratamento_antirreflexo = true) as trat_antirreflexo_true,
  COUNT(*) FILTER (WHERE tratamento_antirrisco = true) as trat_antirrisco_true,
  COUNT(*) FILTER (WHERE tratamento_uv = true) as trat_uv_true,
  COUNT(*) FILTER (WHERE tratamento_blue_light = true) as trat_blue_light_true,
  COUNT(*) FILTER (WHERE ar = true) as ar_true,
  COUNT(*) FILTER (WHERE antirrisco = true) as antirrisco_true,
  COUNT(*) FILTER (WHERE hidrofobico = true) as hidrofobico_true,
  COUNT(*) FILTER (WHERE antiembaçante = true) as antiembaçante_true,
  COUNT(*) FILTER (WHERE blue = true) as blue_true,
  COUNT(*) FILTER (WHERE uv400 = true) as uv400_true,
  COUNT(*) FILTER (WHERE polarizado = true) as polarizado_true,
  COUNT(*) FILTER (WHERE digital = true) as digital_true,
  COUNT(*) FILTER (WHERE free_form = true) as free_form_true,
  COUNT(*) FILTER (WHERE indoor = true) as indoor_true,
  COUNT(*) FILTER (WHERE drive = true) as drive_true
FROM lens_catalog.lentes;

| total_lentes | trat_antirreflexo_true | trat_antirrisco_true | trat_uv_true | trat_blue_light_true | ar_true | antirrisco_true | hidrofobico_true | antiembaçante_true | blue_true | uv400_true | polarizado_true | digital_true | free_form_true | indoor_true | drive_true |
| ------------ | ---------------------- | -------------------- | ------------ | -------------------- | ------- | --------------- | ---------------- | ------------------ | --------- | ---------- | --------------- | ------------ | -------------- | ----------- | ---------- |
| 1411         | 620                    | 0                    | 1411         | 466                  | 0       | 0               | 0                | 0                  | 0         | 0          | 0               | 0            | 0              | 0           | 0          |



-- 5. BUSCAR EXEMPLOS COM DADOS (qualquer campo com valor true)
SELECT id, nome_lente, marca_id, ar, antirrisco, hidrofobico, antiembaçante, blue, uv400, polarizado
FROM lens_catalog.lentes
WHERE ar = true OR antirrisco = true OR blue = true OR uv400 = true OR polarizado = true
LIMIT 10;

-- 6. VERIFICAR A VIEW v_lentes - VER COMO ESTÁ FAZENDO O MAPEAMENTO
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'v_lentes'
WHERE column_name LIKE '%ar%' OR column_name LIKE '%blue%' OR column_name LIKE '%uv%' OR column_name LIKE '%foto%' OR column_name LIKE '%polar%' OR column_name LIKE '%digital%' OR column_name LIKE '%free%' OR column_name LIKE '%indoor%' OR column_name LIKE '%drive%' OR column_name LIKE '%hidro%'
ORDER BY ordinal_position;

Error: Failed to run sql query: ERROR: 42601: syntax error at or near "WHERE" LINE 6: WHERE column_name LIKE '%ar%' OR column_name LIKE '%blue%' OR column_name LIKE '%uv%' OR column_name LIKE '%foto%' OR column_name LIKE '%polar%' OR column_name LIKE '%digital%' OR column_name LIKE '%free%' OR column_name LIKE '%indoor%' OR column_name LIKE '%drive%' OR column_name LIKE '%hidro%' ^






-- 7. TESTAR DIRETAMENTE NA TABELA COM FILTRO
SELECT COUNT(*) as lentes_com_ar_true
FROM lens_catalog.lentes
WHERE ar = true;


| lentes_com_ar_true |
| ------------------ |
| 0                  |


SELECT COUNT(*) as lentes_com_blue_true
FROM lens_catalog.lentes
WHERE blue = true;

| lentes_com_blue_true |
| -------------------- |
| 0                    |


SELECT COUNT(*) as lentes_com_polarizado_true
FROM lens_catalog.lentes
WHERE polarizado = true;


| lentes_com_polarizado_true |
| -------------------------- |
| 0                          |

