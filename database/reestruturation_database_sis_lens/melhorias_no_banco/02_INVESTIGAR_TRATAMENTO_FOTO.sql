-- ============================================================================
-- INVESTIGAR TRATAMENTO_FOTO (ENUM)
-- Comparar campos: tratamento_fotossensiveis (ENUM) vs fotossensivel (TEXT)
-- ============================================================================

-- 1. VER DISTINTOS VALORES EM AMBOS OS CAMPOS
SELECT 
  'tratamento_fotossensiveis (ENUM - normalizado)' as campo,
  tratamento_fotossensiveis,
  COUNT(*) as quantidade
FROM lens_catalog.lentes
WHERE ativo = true
GROUP BY tratamento_fotossensiveis
ORDER BY quantidade DESC;

| campo                                          | tratamento_fotossensiveis | quantidade |
| ---------------------------------------------- | ------------------------- | ---------- |
| tratamento_fotossensiveis (ENUM - normalizado) | nenhum                    | 1029       |
| tratamento_fotossensiveis (ENUM - normalizado) | fotocromático             | 322        |
| tratamento_fotossensiveis (ENUM - normalizado) | polarizado                | 60         |



SELECT 
  'fotossensivel (TEXT - curto)' as campo,
  fotossensivel,
  COUNT(*) as quantidade
FROM lens_catalog.lentes
WHERE ativo = true
GROUP BY fotossensivel
ORDER BY quantidade DESC;

| campo                        | fotossensivel | quantidade |
| ---------------------------- | ------------- | ---------- |
| fotossensivel (TEXT - curto) | nenhum        | 1411       |



-- 2. CONTAR VALORES DIFERENTES DE 'nenhum' EM AMBOS
SELECT 
  COUNT(*) FILTER (WHERE tratamento_fotossensiveis != 'nenhum') as trat_fotossensiveis_diferente_nenhum,
  COUNT(*) FILTER (WHERE fotossensivel != 'nenhum') as fotossensivel_diferente_nenhum,
  COUNT(*) FILTER (WHERE fotossensivel IS NOT NULL) as fotossensivel_not_null
FROM lens_catalog.lentes
WHERE ativo = true;


| trat_fotossensiveis_diferente_nenhum | fotossensivel_diferente_nenhum | fotossensivel_not_null |
| ------------------------------------ | ------------------------------ | ---------------------- |
| 382                                  | 0                              | 1411                   |


-- 3. VER EXEMPLOS DE LENTES COM FOTOSENSIVEIS != 'nenhum'
SELECT id, nome_lente, tratamento_fotossensiveis, fotossensivel
FROM lens_catalog.lentes
WHERE tratamento_fotossensiveis != 'nenhum' AND ativo = true
LIMIT 20;

| id                                   | nome_lente                                                          | tratamento_fotossensiveis | fotossensivel |
| ------------------------------------ | ------------------------------------------------------------------- | ------------------------- | ------------- |
| 68f26ff7-808e-4ae8-bb91-7808313da3a9 | VISAO SIMPLES CR PHOTO C/ AR EXT. (RESIDUAL VERDE)                  | fotocromático             | nenhum        |
| fbec76e1-25c3-4fc0-8400-fa88b27795ec | VISAO SIMPLES CR PHOTO BLUECUT C/ AR EXT. (RESIDUAL AZUL)           | fotocromático             | nenhum        |
| 45989268-17ba-4f3a-89d0-8826863feb16 | LT CR AR 1.56 BLUE FOTO CIL. EXT. (RESIDUAL VERDE)                  | fotocromático             | nenhum        |
| d68a177a-966e-4e9c-a67e-f34d60be9b50 | CR 1.49 / 1.56 FOTO AR                                              | fotocromático             | nenhum        |
| fa268816-0169-4e7e-9baf-cf796eac9a4c | VISAO SIMPLES DIGITAL 1.56 BLUE FOTO INC                            | fotocromático             | nenhum        |
| b5e23fe6-fe1c-4830-b30c-b77182e5e849 | VISAO SIMPLES DIGITAL 1.56 BLUE FOTO AR                             | fotocromático             | nenhum        |
| e0e75e90-5973-481d-8bef-af607257365c | LT CR AR 1.56 FOTOSSENSIVEL CIL. EXT.                               | fotocromático             | nenhum        |
| 9b7ef9b1-ad38-49ec-924a-c10c5953c07e | LT CR AR 1.56 BLUE FOTO CIL. EXT. (RESIDUAL AZUL)                   | fotocromático             | nenhum        |
| b5d609e9-508b-4871-942c-46b0eaeca2aa | LT CR AR 1.56 Fotossensível Cil. Ext.                               | fotocromático             | nenhum        |
| 2c415dd6-fa31-46c8-8630-0e166a92eab9 | LT CR AR 1.56 Fotossensível                                         | fotocromático             | nenhum        |
| 655dfc66-3c88-4e4a-9d50-796f7701653d | LT CR AR 1.56 Blue Foto Cil. Ext. (Residual Azul)                   | fotocromático             | nenhum        |
| b15d87f1-9f2d-41b4-bb35-9e124653ec38 | LT CR AR 1.56 Blue Foto (Residual Verde)                            | fotocromático             | nenhum        |
| 53de5654-8986-4c56-aa7c-4f04d3e5c766 | LT CR AR 1.56 Blue Foto Cil. Ext. (Residual Verde)                  | fotocromático             | nenhum        |
| 0a5dd9c9-4185-4183-b173-c9b14ccf9372 | LT CR AR 1.56 BLUE FOTO (RESIDUAL VERDE)                            | fotocromático             | nenhum        |
| f9a1e7e4-3cb1-487e-ba29-dd67e7638f37 | LT CR AR 1.56 BLUE FOTO (RESIDUAL AZUL)                             | fotocromático             | nenhum        |
| 26ba2feb-8739-4d74-8357-97a17736d07b | LENTE AC. 1.56 FOTO COM AR VERDE CIL. ESTENDIDO SUPER HIDROFOBICO   | fotocromático             | nenhum        |
| 73a60c66-1bf2-4af6-a4c6-f6c8e505635f | LENTE AC. 1.56 FOTO COM AR VERDE SUPER HIDROFOBICO                  | fotocromático             | nenhum        |
| a869383a-27e7-45f8-b209-ecedbfd8cecb | CR 1.49 / 1.56 FOTO AR BLUE AZUL 1                                  | fotocromático             | nenhum        |
| d2bd6f94-6b9e-482b-befe-c6b9e353fe4a | CR 1.49 / 1.56 FOTO AR BLUE                                         | fotocromático             | nenhum        |
| 4432efd0-e7d9-416c-a714-b8e57c93a954 | CR 1.49 / 1.56 FOTO AR BLUE 1                                       | fotocromático             | nenhum        |



-- 4. VERIFICAR NA VIEW
SELECT 
  COUNT(*) FILTER (WHERE tratamento_foto != 'nenhum') as tratamento_foto_view_diferente_nenhum
FROM v_lentes;

| tratamento_foto_view_diferente_nenhum |
| ------------------------------------- |
| 0                                     |



-- 5. VER VALORES ÚNICOS NA VIEW
SELECT DISTINCT tratamento_foto, COUNT(*) as quantidade
FROM v_lentes
GROUP BY tratamento_foto
ORDER BY quantidade DESC;

| tratamento_foto | quantidade |
| --------------- | ---------- |
| nenhum          | 1411       |

