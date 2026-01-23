-- ============================================================================
-- SINCRONIZAR TRATAMENTO_FOTO - ENUM PARA TEXT
-- Identificar TRANSITIONS e ACCLIMATES pela nome, depois mapear outros
-- ============================================================================

-- ANTES: Verificar estado
SELECT 
  COUNT(*) FILTER (WHERE fotossensivel = 'transitions') as fotossensivel_transitions,
  COUNT(*) FILTER (WHERE fotossensivel = 'acclimates') as fotossensivel_acclimates,
  COUNT(*) FILTER (WHERE fotossensivel = 'fotocromático') as fotossensivel_fotocromarico,
  COUNT(*) FILTER (WHERE fotossensivel = 'polarizado') as fotossensivel_polarizado,
  COUNT(*) FILTER (WHERE fotossensivel = 'nenhum') as fotossensivel_nenhum
FROM lens_catalog.lentes
WHERE ativo = true;

| fotossensivel_transitions | fotossensivel_acclimates | fotossensivel_fotocromarico | fotossensivel_polarizado | fotossensivel_nenhum |
| ------------------------- | ------------------------ | --------------------------- | ------------------------ | -------------------- |
| 0                         | 0                        | 0                           | 0                        | 1411                 |



-- SINCRONIZAR: Atualizar fotossensivel baseado em:
-- 1. TRANSITIONS (marca premium) - quando TRANSITIONS está no nome
-- 2. ACCLIMATES (marca premium) - quando ACCLIMATES está no nome
-- 3. Usar tratamento_fotossensiveis para outros casos
UPDATE lens_catalog.lentes
SET fotossensivel = CASE 
  WHEN nome_lente ILIKE '%transitions%' THEN 'transitions'
  WHEN nome_lente ILIKE '%acclimates%' THEN 'acclimates'
  WHEN tratamento_fotossensiveis = 'fotocromático' THEN 'fotocromático'
  WHEN tratamento_fotossensiveis = 'polarizado' THEN 'polarizado'
  ELSE 'nenhum'
END
WHERE ativo = true;

-- DEPOIS: Verificar sincronização
SELECT 
  COUNT(*) FILTER (WHERE fotossensivel = 'transitions') as fotossensivel_transitions,
  COUNT(*) FILTER (WHERE fotossensivel = 'acclimates') as fotossensivel_acclimates,
  COUNT(*) FILTER (WHERE fotossensivel = 'fotocromático') as fotossensivel_fotocromarico,
  COUNT(*) FILTER (WHERE fotossensivel = 'polarizado') as fotossensivel_polarizado,
  COUNT(*) FILTER (WHERE fotossensivel = 'nenhum') as fotossensivel_nenhum
FROM lens_catalog.lentes
WHERE ativo = true;

| fotossensivel_transitions | fotossensivel_acclimates | fotossensivel_fotocromarico | fotossensivel_polarizado | fotossensivel_nenhum |
| ------------------------- | ------------------------ | --------------------------- | ------------------------ | -------------------- |
| 238                       | 3                        | 81                          | 60                       | 1029                 |



-- VERIFICAR NA VIEW
SELECT 
  COUNT(*) FILTER (WHERE tratamento_foto = 'transitions') as view_transitions,
  COUNT(*) FILTER (WHERE tratamento_foto = 'acclimates') as view_acclimates,
  COUNT(*) FILTER (WHERE tratamento_foto = 'fotocromático') as view_fotocromarico,
  COUNT(*) FILTER (WHERE tratamento_foto = 'polarizado') as view_polarizado,
  COUNT(*) FILTER (WHERE tratamento_foto = 'nenhum') as view_nenhum,
  COUNT(*) FILTER (WHERE tratamento_foto != 'nenhum') as view_com_algum_tratamento
FROM v_lentes;


| view_transitions | view_acclimates | view_fotocromarico | view_polarizado | view_nenhum | view_com_algum_tratamento |
| ---------------- | --------------- | ------------------ | --------------- | ----------- | ------------------------- |
| 238              | 3               | 81                 | 60              | 1029        | 382                       |


-- EXEMPLOS DE CADA TIPO
SELECT 'transitions' as tipo, nome_lente, tratamento_foto
FROM v_lentes
WHERE tratamento_foto = 'transitions'
LIMIT 5;

| tipo        | nome_lente                                   | tratamento_foto |
| ----------- | -------------------------------------------- | --------------- |
| transitions | LENTE AC.1.50 TRANSITIONS GEN8 COM AR        | transitions     |
| transitions | LENTE AC.1.50 TRANSITIONS GEN8 COM AR        | transitions     |
| transitions | CR 1.49 / 1.56 TRANSITIONS                   | transitions     |
| transitions | VISAO SIMPLES CR TRANSITIONS GEN8 BLUE UV    | transitions     |
| transitions | VISAO SIMPLES DIGITAL 1.49 TRANSITIONS INC   | transitions     |



SELECT 'acclimates' as tipo, nome_lente, tratamento_foto
FROM v_lentes
WHERE tratamento_foto = 'acclimates'
LIMIT 5;

| tipo       | nome_lente                   | tratamento_foto |
| ---------- | ---------------------------- | --------------- |
| acclimates | ESPACE CR ACCLIMATES         | acclimates      |
| acclimates | ESPACE PLUS CR ACCLIMATES    | acclimates      |
| acclimates | ESPACE SHORT CR ACCLIMATES   | acclimates      |


SELECT 'fotocromático' as tipo, nome_lente, tratamento_foto
FROM v_lentes
WHERE tratamento_foto = 'fotocromático'
LIMIT 5;

| tipo          | nome_lente                                       | tratamento_foto |
| ------------- | ------------------------------------------------ | --------------- |
| fotocromático | LT CR AR 1.56 Fotossensível                      | fotocromático   |
| fotocromático | LT 1.59 POLICARBONATO FOTO AR (RESIDUAL VERDE)   | fotocromático   |
| fotocromático | LT CR AR 1.56 FOTOSSENSIVEL                      | fotocromático   |
| fotocromático | CR 1.49 / 1.56 FOTO AR                           | fotocromático   |
| fotocromático | MULTIFOCAL 1.56 PHOTO C/ AR (RESIDUAL VERDE)     | fotocromático   |



SELECT 'polarizado' as tipo, nome_lente, tratamento_foto
FROM v_lentes
WHERE tratamento_foto = 'polarizado'
LIMIT 5;

| tipo       | nome_lente                                      | tratamento_foto |
| ---------- | ----------------------------------------------- | --------------- |
| polarizado | MULTI 1.49 TOP VIEW FF POLARIZADO CINZA         | polarizado      |
| polarizado | MULTI 1.49 TOP VIEW FF POLARIZADO VERDE         | polarizado      |
| polarizado | MULTI 1.49 TOP VIEW FF POLARIZADO CINZA AR FAST | polarizado      |
| polarizado | MULTI 1.49 TOP VIEW FF POLARIZADO VERDE AR FAST | polarizado      |
| polarizado | MULTI 1.59 TOP VIEW FF POLARIZADO CINZA         | polarizado      |

