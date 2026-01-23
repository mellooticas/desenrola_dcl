-- ============================================================================
-- SINCRONIZAR DADOS DE TRATAMENTOS
-- Copiar dos campos normalizados para os campos curtos
-- ============================================================================

-- ANTES: Verificar quantos dados temos em cada campo
SELECT 
  COUNT(*) FILTER (WHERE tratamento_antirreflexo = true) as dados_antirreflexo_normalizado,
  COUNT(*) FILTER (WHERE ar = true) as dados_ar_curto,
  COUNT(*) FILTER (WHERE tratamento_blue_light = true) as dados_blue_normalizado,
  COUNT(*) FILTER (WHERE blue = true) as dados_blue_curto,
  COUNT(*) FILTER (WHERE tratamento_uv = true) as dados_uv_normalizado,
  COUNT(*) FILTER (WHERE uv400 = true) as dados_uv400_curto,
  COUNT(*) FILTER (WHERE tratamento_antirrisco = true) as dados_antirrisco_normalizado,
  COUNT(*) FILTER (WHERE antirrisco = true) as dados_antirrisco_curto
FROM lens_catalog.lentes;


| dados_antirreflexo_normalizado | dados_ar_curto | dados_blue_normalizado | dados_blue_curto | dados_uv_normalizado | dados_uv400_curto | dados_antirrisco_normalizado | dados_antirrisco_curto |
| ------------------------------ | -------------- | ---------------------- | ---------------- | -------------------- | ----------------- | ---------------------------- | ---------------------- |
| 620                            | 0              | 466                    | 0                | 1411                 | 0                 | 0                            | 0                      |



-- SINCRONIZAR: Copiar dos campos normalizados para os campos curtos
-- Usa CASE porque COALESCE não funciona com false vs true
UPDATE lens_catalog.lentes
SET 
  ar = CASE WHEN tratamento_antirreflexo = true THEN true ELSE ar END,
  blue = CASE WHEN tratamento_blue_light = true THEN true ELSE blue END,
  uv400 = CASE WHEN tratamento_uv = true THEN true ELSE uv400 END,
  antirrisco = CASE WHEN tratamento_antirrisco = true THEN true ELSE antirrisco END
WHERE ativo = true;

-- Nota: fotossensivel (TEXT) e tratamento_fotossensiveis (ENUM) já estão com os mesmos valores padrão
-- Ambos usam 'nenhum' como valor padrão, então estão sincronizados

-- DEPOIS: Verificar se sincronizou corretamente
SELECT 
  COUNT(*) FILTER (WHERE ar = true) as ar_true,
  COUNT(*) FILTER (WHERE blue = true) as blue_true,
  COUNT(*) FILTER (WHERE uv400 = true) as uv400_true,
  COUNT(*) FILTER (WHERE antirrisco = true) as antirrisco_true,
  COUNT(*) FILTER (WHERE fotossensivel != 'nenhum') as fotossensivel_diferente_nenhum
FROM lens_catalog.lentes
WHERE ativo = true;

| ar_true | blue_true | uv400_true | antirrisco_true | fotossensivel_diferente_nenhum |
| ------- | --------- | ---------- | --------------- | ------------------------------ |
| 620     | 466       | 1411       | 0               | 0                              |

-- VERIFICAR NA VIEW
SELECT 
  COUNT(*) FILTER (WHERE tem_ar = true) as tem_ar_true,
  COUNT(*) FILTER (WHERE tem_blue = true) as tem_blue_true,
  COUNT(*) FILTER (WHERE tem_uv = true) as tem_uv_true,
  COUNT(*) FILTER (WHERE tem_antirrisco = true) as tem_antirrisco_true,
  COUNT(*) FILTER (WHERE tratamento_foto != 'nenhum') as tratamento_foto_diferente_nenhum
FROM v_lentes;


| tem_ar_true | tem_blue_true | tem_uv_true | tem_antirrisco_true | tratamento_foto_diferente_nenhum |
| ----------- | ------------- | ----------- | ------------------- | -------------------------------- |
| 620         | 466           | 1411        | 0                   | 0                                |