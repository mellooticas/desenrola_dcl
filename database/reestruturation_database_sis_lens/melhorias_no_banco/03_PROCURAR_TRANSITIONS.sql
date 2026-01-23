-- ============================================================================
-- BUSCAR POR 'TRANSITIONS' E VALORES FOTOSENSIVEIS FALTANDO
-- ============================================================================

-- 1. PROCURAR POR 'TRANSITIONS' NA TABELA INTEIRA
SELECT 
  id,
  nome_lente,
  nome_comercial,
  descricao_curta,
  descricao_completa,
  linha_produto,
  beneficios,
  tratamento_fotossensiveis,
  fotossensivel
FROM lens_catalog.lentes
WHERE 
  nome_lente ILIKE '%transitions%' OR
  nome_comercial ILIKE '%transitions%' OR
  descricao_curta ILIKE '%transitions%' OR
  descricao_completa ILIKE '%transitions%' OR
  linha_produto ILIKE '%transitions%'
LIMIT 20;

| id                                   | nome_lente                                          | nome_comercial | descricao_curta | descricao_completa | linha_produto | beneficios | tratamento_fotossensiveis | fotossensivel |
| ------------------------------------ | --------------------------------------------------- | -------------- | --------------- | ------------------ | ------------- | ---------- | ------------------------- | ------------- |
| a4033767-161f-431a-893f-4de12cece45f | CR 1.49 / 1.56 TRANSITIONS                          | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| 390972db-5e78-4e02-9224-ea09f9f5eb86 | VS HDI 1.67 SLIM TRANSITIONS CINZA AR FAST SH       | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| e0c4a1ad-9036-4e8b-84bc-0b24dcfeafb4 | VS HDI 1.67 SLIM TRANSITIONS CINZA AR FAST TITANIUM | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| 1beae449-fc73-46b8-a378-7dcdc186210b | VS HDI 1.67 SLIM TRANSITIONS CINZA                  | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| d893d6f3-8770-4d99-a972-2f7996a215fb | VS HDI 1.67 TRANSITIONS CINZA                       | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| f1b13206-b756-49f1-bd75-7755d6852d61 | VS HDI 1.67 TRANSITIONS CINZA AR FAST SH            | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| 930ebe0c-189f-4fd1-8d6a-a36b3e03167a | VS HDI 1.67 TRANSITIONS CINZA AR FAST TITANIUM      | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| caa41402-7141-4519-b276-b22eafa8254f | VS HDI 1.49 SLIM TRANSITIONS MARROM AR FAST         | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| 2124bc64-6ddf-429a-863d-186ddc2235ec | VS HDI 1.67 SLIM TRANSITIONS CINZA AR FAST          | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| 4914a2aa-0643-47f3-ac01-6763563d905e | VS HDI 1.67 TRANSITIONS CINZA AR FAST               | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| e4e0e94e-9efe-423c-8a6f-0be2ad7d0553 | VS HDI 1.67 TRANSITIONS CINZA AR FAST AZUL          | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| 1ac04ce4-cce5-47e9-a6a1-e1db074111f7 | VS HDI 1.74 TRANSITIONS CINZA AR FAST SH            | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| 4de41000-42e9-4e2d-b1af-4529fc79659e | VS HDI 1.74 SLIM TRANSITIONS CINZA AR FAST SH       | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| 40678e00-6ff9-476b-895c-9dd711780d1f | VS HDI 1.74 TRANSITIONS CINZA                       | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| c8050292-d93c-4794-a076-232b094e6dc5 | VS HDI 1.74 SLIM TRANSITIONS CINZA AR FAST TITANIUM | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| e3bb4c81-bb51-4805-b4c8-560f37324d5d | VS HDI 1.74 TRANSITIONS CINZA AR FAST TITANIUM      | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| ec91eb5e-d9e6-45e4-a0f6-127ce9e7e67f | VS HDI 1.74 SLIM TRANSITIONS CINZA                  | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| 1ae6055c-c18a-4b00-8e40-69b0a322feb7 | VS HDI 1.74 SLIM TRANSITIONS CINZA AR FAST          | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| 17983a60-d7cc-4884-8967-595a101df82b | VS HDI 1.74 TRANSITIONS CINZA AR FAST AZUL          | null           | null            | null               | null          | null       | fotocromático             | nenhum        |
| 78c91ac0-7ed6-41ee-9c28-04809e0ee6be | VS HDI 1.74 TRANSITIONS CINZA AR FAST               | null           | null            | null               | null          | null       | fotocromático             | nenhum        |



-- 2. VER TODAS AS COLUNAS TEXT/VARCHAR QUE POSSAM TER DADOS DE TRATAMENTOS
SELECT 
  COUNT(*) FILTER (WHERE beneficios @> '["transitions"]'::jsonb) as beneficios_com_transitions,
  COUNT(*) FILTER (WHERE indicacoes @> '["transitions"]'::jsonb) as indicacoes_com_transitions
FROM lens_catalog.lentes
WHERE ativo = true;

Error: Failed to run sql query: ERROR: 42883: operator does not exist: text[] @> jsonb LINE 5: COUNT(*) FILTER (WHERE beneficios @> '["transitions"]'::jsonb) as beneficios_com_transitions, ^ HINT: No operator matches the given name and argument types. You might need to add explicit type casts.





-- 3. PROCURAR POR VARIAÇÕES DE FOTO
SELECT DISTINCT 
  nome_lente,
  tratamento_fotossensiveis
FROM lens_catalog.lentes
WHERE 
  tratamento_fotossensiveis != 'nenhum' AND
  ativo = true
ORDER BY nome_lente
LIMIT 50;

| nome_lente                                                          | tratamento_fotossensiveis |
| ------------------------------------------------------------------- | ------------------------- |
| 1.59 POLICARBONATO AR FOTO                                          | fotocromático             |
| 1.59 POLICARBONATO AR FOTO BLUE AZUL                                | fotocromático             |
| 1.59 POLICARBONATO AR FOTO BLUE AZUL 1                              | fotocromático             |
| 1.61 RESINA AR FOTO BLUE HIDRO                                      | fotocromático             |
| 1.61 RESINA AR FOTO BLUE HIDRO 1                                    | fotocromático             |
| 1.61 RESINA AR FOTO BLUE HIDRO AZUL                                 | fotocromático             |
| 1.61 RESINA AR FOTO BLUE HIDRO AZUL 1                               | fotocromático             |
| 1.67 RESINA AR FOTO                                                 | fotocromático             |
| 1.67 RESINA AR FOTO 1                                               | fotocromático             |
| 1.67 RESINA AR FOTO BLUE HIDRO AZUL                                 | fotocromático             |
| 1.67 RESINA AR FOTO BLUE HIDRO AZUL 1                               | fotocromático             |
| CR 1.49 / 1.56 FOTO AR                                              | fotocromático             |
| CR 1.49 / 1.56 FOTO AR BLUE                                         | fotocromático             |
| CR 1.49 / 1.56 FOTO AR BLUE 1                                       | fotocromático             |
| CR 1.49 / 1.56 FOTO AR BLUE AZUL                                    | fotocromático             |
| CR 1.49 / 1.56 FOTO AR BLUE AZUL 1                                  | fotocromático             |
| CR 1.49 / 1.56 MULTIFOCAL AR-FOTO                                   | fotocromático             |
| CR 1.49 / 1.56 MULTIFOCAL AR-FOTO BLUE AZUL                         | fotocromático             |
| CR 1.49 / 1.56 MULTIFOCAL AR-FOTO FREE FORM                         | fotocromático             |
| CR 1.49 / 1.56 MULTIFOCAL INC FOTO ANTI RISCO                       | fotocromático             |
| CR 1.49 / 1.56 TRANSITIONS                                          | fotocromático             |
| ESPACE CR ACCLIMATES                                                | fotocromático             |
| ESPACE PLUS CR ACCLIMATES                                           | fotocromático             |
| ESPACE PLUS CR TRANSITIONS                                          | fotocromático             |
| ESPACE PLUS POLI TRANSITIONS                                        | fotocromático             |
| ESPACE SHORT CR ACCLIMATES                                          | fotocromático             |
| ESPACE SHORT CR TRANSITIONS                                         | fotocromático             |
| LENTE AC. 1.56 FOTO COM AR VERDE CIL. ESTENDIDO SUPER HIDROFOBICO   | fotocromático             |
| LENTE AC. 1.56 FOTO COM AR VERDE SUPER HIDROFOBICO                  | fotocromático             |
| LENTE AC. 1.61 FOTO COM AR VERDE ESTENDIDO SUPER HIDROFOBICO        | fotocromático             |
| LENTE AC. 1.61 FOTO COM AR VERDE SUPER HIDROFOBICO                  | fotocromático             |
| LENTE AC.1.50 TRANSITIONS GEN8 COM AR                               | fotocromático             |
| LENTE AC.1.56 FOTO COM AR                                           | fotocromático             |
| LENTE AC.1.56 FOTO COM AR CIL. ESTENDIDO                            | fotocromático             |
| LT 1.59 POLICARBONATO BLUE FOTO AR (RESIDUAL AZUL)                  | fotocromático             |
| LT 1.59 POLICARBONATO BLUE FOTO AR CIL. EXT. (RESIDUAL AZUL)        | fotocromático             |
| LT 1.59 POLICARBONATO FOTO AR (RESIDUAL VERDE)                      | fotocromático             |
| LT CR AR 1.56 Blue Foto (Residual Azul)                             | fotocromático             |
| LT CR AR 1.56 BLUE FOTO (RESIDUAL AZUL)                             | fotocromático             |
| LT CR AR 1.56 Blue Foto (Residual Verde)                            | fotocromático             |
| LT CR AR 1.56 BLUE FOTO (RESIDUAL VERDE)                            | fotocromático             |
| LT CR AR 1.56 Blue Foto Cil. Ext. (Residual Azul)                   | fotocromático             |
| LT CR AR 1.56 BLUE FOTO CIL. EXT. (RESIDUAL AZUL)                   | fotocromático             |
| LT CR AR 1.56 Blue Foto Cil. Ext. (Residual Verde)                  | fotocromático             |
| LT CR AR 1.56 BLUE FOTO CIL. EXT. (RESIDUAL VERDE)                  | fotocromático             |
| LT CR AR 1.56 Fotossensível                                         | fotocromático             |
| LT CR AR 1.56 FOTOSSENSIVEL                                         | fotocromático             |
| LT CR AR 1.56 Fotossensível Cil. Ext.                               | fotocromático             |
| LT CR AR 1.56 FOTOSSENSIVEL CIL. EXT.                               | fotocromático             |
| MULTI 1.49 FREEVIEW EASY POLARIZADO CINZA                           | polarizado                |


-- 4. LISTAR TODOS OS VALORES ÚNICOS NO CAMPO tratamento_fotossensiveis
SELECT 
  tratamento_fotossensiveis,
  COUNT(*) as quantidade
FROM lens_catalog.lentes
WHERE ativo = true
GROUP BY tratamento_fotossensiveis
ORDER BY quantidade DESC;

| tratamento_fotossensiveis | quantidade |
| ------------------------- | ---------- |
| nenhum                    | 1029       |
| fotocromático             | 322        |
| polarizado                | 60         |



-- 5. PROCURAR TRANSITIONS NA METADATA JSONB
SELECT 
  id,
  nome_lente,
  metadata
FROM lens_catalog.lentes
WHERE 
  metadata::text ILIKE '%transitions%' AND
  ativo = true
LIMIT 10;

| id                                   | nome_lente                                          | metadata                                                                                                                                                                                                                            |
| ------------------------------------ | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a4033767-161f-431a-893f-4de12cece45f | CR 1.49 / 1.56 TRANSITIONS                          | {"faixa":"1","tintavel":"false","sku_geral":"MLTUO9T8T","markup_estimado":4.98,"classificacao_fiscal":"90015010","tratamentos_originais":"TRANSITIONS"}                                                                             |
| 390972db-5e78-4e02-9224-ea09f9f5eb86 | VS HDI 1.67 SLIM TRANSITIONS CINZA AR FAST SH       | {"faixa":"5","tintavel":"false","diametro2":0,"sku_geral":"MLTTYN7VU","altura_max":"0","altura_min":"18","markup_estimado":4.03,"classificacao_fiscal":"90015925","tratamentos_originais":"TRANSITIONS CINZA + SUPER HIDROF�BICO"}  |
| e0c4a1ad-9036-4e8b-84bc-0b24dcfeafb4 | VS HDI 1.67 SLIM TRANSITIONS CINZA AR FAST TITANIUM | {"faixa":"5","tintavel":"false","diametro2":0,"sku_geral":"MLT16FF1S","altura_max":"0","altura_min":"18","markup_estimado":4.02,"classificacao_fiscal":"90015926","tratamentos_originais":"TRANSITIONS CINZA + TRATAMENTO PREMIUM"} |
| 1beae449-fc73-46b8-a378-7dcdc186210b | VS HDI 1.67 SLIM TRANSITIONS CINZA                  | {"faixa":"5","tintavel":"false","diametro2":0,"sku_geral":"MLTO4Z5QG","altura_max":"0","altura_min":"18","markup_estimado":4.04,"classificacao_fiscal":"90015922","tratamentos_originais":"TRANSITIONS CINZA"}                      |
| d893d6f3-8770-4d99-a972-2f7996a215fb | VS HDI 1.67 TRANSITIONS CINZA                       | {"faixa":"5","tintavel":"false","diametro2":0,"sku_geral":"MLTOICCSQ","altura_max":"0","altura_min":"18","markup_estimado":4.04,"classificacao_fiscal":"90015836","tratamentos_originais":"TRANSITIONS CINZA"}                      |
| f1b13206-b756-49f1-bd75-7755d6852d61 | VS HDI 1.67 TRANSITIONS CINZA AR FAST SH            | {"faixa":"5","tintavel":"false","diametro2":0,"sku_geral":"MLT5KAEQH","altura_max":"0","altura_min":"18","markup_estimado":4.03,"classificacao_fiscal":"90015839","tratamentos_originais":"TRANSITIONS CINZA + SUPER HIDROF�BICO"}  |
| 930ebe0c-189f-4fd1-8d6a-a36b3e03167a | VS HDI 1.67 TRANSITIONS CINZA AR FAST TITANIUM      | {"faixa":"5","tintavel":"false","diametro2":0,"sku_geral":"MLTAHWKB3","altura_max":"0","altura_min":"18","markup_estimado":4.02,"classificacao_fiscal":"90015840","tratamentos_originais":"TRANSITIONS CINZA + TRATAMENTO PREMIUM"} |
| caa41402-7141-4519-b276-b22eafa8254f | VS HDI 1.49 SLIM TRANSITIONS MARROM AR FAST         | {"faixa":"4","tintavel":"false","diametro2":0,"sku_geral":"MLTX1HS1G","altura_max":"0","altura_min":"18","markup_estimado":4.11,"classificacao_fiscal":"90015913","tratamentos_originais":"TRANSITIONS MARROM + ANTI-REFLEXO"}      |
| 2124bc64-6ddf-429a-863d-186ddc2235ec | VS HDI 1.67 SLIM TRANSITIONS CINZA AR FAST          | {"faixa":"5","tintavel":"false","diametro2":0,"sku_geral":"MLT6YKGK6","altura_max":"0","altura_min":"18","markup_estimado":4.03,"classificacao_fiscal":"90015923","tratamentos_originais":"TRANSITIONS CINZA + ANTI-REFLEXO"}       |
| 4914a2aa-0643-47f3-ac01-6763563d905e | VS HDI 1.67 TRANSITIONS CINZA AR FAST               | {"faixa":"5","tintavel":"false","diametro2":0,"sku_geral":"MLTRXPBP1","altura_max":"0","altura_min":"18","markup_estimado":4.03,"classificacao_fiscal":"90015837","tratamentos_originais":"TRANSITIONS CINZA + ANTI-REFLEXO"}       |


-- 6. VER QUAL A ESTRUTURA DE beneficios (array)
SELECT 
  id,
  nome_lente,
  beneficios,
  array_length(beneficios, 1) as len_beneficios
FROM lens_catalog.lentes
WHERE beneficios IS NOT NULL AND ativo = true
LIMIT 10;


Success. No rows returned




