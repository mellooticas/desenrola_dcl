-- ============================================================================
-- MIGRAÇÃO: SINCRONIZAÇÃO DE CAMPOS DE GRAUS
-- ============================================================================
-- Objetivo: Migrar dados dos campos antigos para os campos novos
-- Data: 22/01/2026
-- ============================================================================
-- IMPORTANTE: Esta query sincroniza os campos de graus:
--   grau_esferico_min/max → esferico_min/max
--   grau_cilindrico_min/max → cilindrico_min/max
-- ============================================================================

-- ============================================================================
-- ANÁLISE ANTES DA MIGRAÇÃO
-- ============================================================================
-- Execute esta query ANTES da migração para ver o estado atual
SELECT 
    'ANTES DA MIGRAÇÃO' as momento,
    COUNT(*) as total_lentes_ativas,
    COUNT(CASE WHEN grau_esferico_min IS NOT NULL THEN 1 END) as tem_grau_esf_min_antigo,
    COUNT(CASE WHEN esferico_min IS NOT NULL THEN 1 END) as tem_esf_min_novo,
    COUNT(CASE 
        WHEN grau_esferico_min IS NOT NULL 
        AND esferico_min IS NULL 
        THEN 1 
    END) as precisa_migrar_esf_min,
    COUNT(CASE 
        WHEN grau_esferico_max IS NOT NULL 
        AND esferico_max IS NULL 
        THEN 1 
    END) as precisa_migrar_esf_max,
    COUNT(CASE 
        WHEN grau_cilindrico_min IS NOT NULL 
        AND cilindrico_min IS NULL 
        THEN 1 
    END) as precisa_migrar_cil_min,
    COUNT(CASE 
        WHEN grau_cilindrico_max IS NOT NULL 
        AND cilindrico_max IS NULL 
        THEN 1 
    END) as precisa_migrar_cil_max
FROM lens_catalog.lentes
WHERE ativo = true;


| momento           | total_lentes_ativas | tem_grau_esf_min_antigo | tem_esf_min_novo | precisa_migrar_esf_min | precisa_migrar_esf_max | precisa_migrar_cil_min | precisa_migrar_cil_max |
| ----------------- | ------------------- | ----------------------- | ---------------- | ---------------------- | ---------------------- | ---------------------- | ---------------------- |
| ANTES DA MIGRAÇÃO | 1411                | 1411                    | 0                | 1411                   | 1411                   | 1411                   | 1411                   |



-- ============================================================================
-- 1. MIGRAÇÃO: COPIAR GRAUS ESFÉRICOS
-- ============================================================================
-- Copia valores de grau_esferico_min/max para esferico_min/max
-- APENAS onde os campos novos estão NULL
UPDATE lens_catalog.lentes
SET 
    esferico_min = grau_esferico_min,
    esferico_max = grau_esferico_max,
    updated_at = NOW()
WHERE ativo = true
    AND grau_esferico_min IS NOT NULL
    AND esferico_min IS NULL
    AND esferico_max IS NULL;

-- Verificar quantas linhas foram atualizadas
-- (Executar separadamente para ver o resultado)

-- ============================================================================
-- 2. MIGRAÇÃO: COPIAR GRAUS CILÍNDRICOS
-- ============================================================================
-- Copia valores de grau_cilindrico_min/max para cilindrico_min/max
-- APENAS onde os campos novos estão NULL
UPDATE lens_catalog.lentes
SET 
    cilindrico_min = grau_cilindrico_min,
    cilindrico_max = grau_cilindrico_max,
    updated_at = NOW()
WHERE ativo = true
    AND grau_cilindrico_min IS NOT NULL
    AND cilindrico_min IS NULL
    AND cilindrico_max IS NULL;

-- ============================================================================
-- 3. MIGRAÇÃO CONSERVADORA: Apenas se campos novos estão NULL
-- ============================================================================
-- Esta versão NÃO sobrescreve dados existentes nos campos novos
-- Use esta se quiser preservar dados que já existem em esferico_min/max
UPDATE lens_catalog.lentes
SET 
    esferico_min = COALESCE(esferico_min, grau_esferico_min),
    esferico_max = COALESCE(esferico_max, grau_esferico_max),
    cilindrico_min = COALESCE(cilindrico_min, grau_cilindrico_min),
    cilindrico_max = COALESCE(cilindrico_max, grau_cilindrico_max),
    updated_at = NOW()
WHERE ativo = true
    AND (
        (grau_esferico_min IS NOT NULL AND esferico_min IS NULL)
        OR (grau_esferico_max IS NOT NULL AND esferico_max IS NULL)
        OR (grau_cilindrico_min IS NOT NULL AND cilindrico_min IS NULL)
        OR (grau_cilindrico_max IS NOT NULL AND cilindrico_max IS NULL)
    );

-- ============================================================================
-- 4. ANÁLISE APÓS A MIGRAÇÃO
-- ============================================================================
-- Execute esta query DEPOIS da migração para verificar o resultado
SELECT 
    'DEPOIS DA MIGRAÇÃO' as momento,
    COUNT(*) as total_lentes_ativas,
    COUNT(CASE WHEN grau_esferico_min IS NOT NULL THEN 1 END) as tem_grau_esf_min_antigo,
    COUNT(CASE WHEN esferico_min IS NOT NULL THEN 1 END) as tem_esf_min_novo,
    COUNT(CASE 
        WHEN grau_esferico_min IS NOT NULL 
        AND esferico_min IS NULL 
        THEN 1 
    END) as ainda_sem_esf_min,
    COUNT(CASE 
        WHEN grau_esferico_max IS NOT NULL 
        AND esferico_max IS NULL 
        THEN 1 
    END) as ainda_sem_esf_max,
    COUNT(CASE 
        WHEN grau_cilindrico_min IS NOT NULL 
        AND cilindrico_min IS NULL 
        THEN 1 
    END) as ainda_sem_cil_min,
    COUNT(CASE 
        WHEN grau_cilindrico_max IS NOT NULL 
        AND cilindrico_max IS NULL 
        THEN 1 
    END) as ainda_sem_cil_max
FROM lens_catalog.lentes
WHERE ativo = true;


| momento            | total_lentes_ativas | tem_grau_esf_min_antigo | tem_esf_min_novo | ainda_sem_esf_min | ainda_sem_esf_max | ainda_sem_cil_min | ainda_sem_cil_max |
| ------------------ | ------------------- | ----------------------- | ---------------- | ----------------- | ----------------- | ----------------- | ----------------- |
| DEPOIS DA MIGRAÇÃO | 1411                | 1411                    | 1411             | 0                 | 0                 | 0                 | 0                 |


-- ============================================================================
-- 5. COMPARAÇÃO LADO A LADO: ANTES E DEPOIS
-- ============================================================================
WITH comparacao AS (
    SELECT 
        id,
        nome_lente,
        tipo_lente,
        -- Campos antigos
        grau_esferico_min as old_esf_min,
        grau_esferico_max as old_esf_max,
        grau_cilindrico_min as old_cil_min,
        grau_cilindrico_max as old_cil_max,
        -- Campos novos
        esferico_min as new_esf_min,
        esferico_max as new_esf_max,
        cilindrico_min as new_cil_min,
        cilindrico_max as new_cil_max,
        -- Status
        CASE 
            WHEN esferico_min IS NOT NULL OR esferico_max IS NOT NULL 
            THEN 'OK' 
            ELSE 'SEM GRAUS' 
        END as status_migracao
    FROM lens_catalog.lentes
    WHERE ativo = true
)
SELECT 
    status_migracao,
    COUNT(*) as total
FROM comparacao
GROUP BY status_migracao;


| status_migracao | total |
| --------------- | ----- |
| OK              | 1411  |


-- ============================================================================
-- 6. LENTES MIGRADAS COM SUCESSO (AMOSTRAS)
-- ============================================================================
SELECT 
    id,
    nome_lente,
    tipo_lente,
    categoria,
    grau_esferico_min as antigo_esf_min,
    esferico_min as novo_esf_min,
    grau_esferico_max as antigo_esf_max,
    esferico_max as novo_esf_max,
    updated_at
FROM lens_catalog.lentes
WHERE ativo = true
    AND grau_esferico_min IS NOT NULL
    AND esferico_min IS NOT NULL
    AND grau_esferico_min = esferico_min
ORDER BY updated_at DESC
LIMIT 10;


| id                                   | nome_lente                                                     | tipo_lente    | categoria     | antigo_esf_min | novo_esf_min | antigo_esf_max | novo_esf_max | updated_at                    |
| ------------------------------------ | -------------------------------------------------------------- | ------------- | ------------- | -------------- | ------------ | -------------- | ------------ | ----------------------------- |
| 517fa700-2dfe-4711-8f98-3322a639a4af | LENTE AC. 1.70 BLUE AR VERDE SUPER HIDROFOBICO                 | visao_simples | economica     | -24.00         | -24.00       | -18.50         | -18.50       | 2026-01-22 03:35:17.951566+00 |
| 03033eb5-a996-4251-99c7-5e61e412315c | 1.70 RESINA AR BLUE 1                                          | visao_simples | economica     | -18.00         | -18.00       | -12.50         | -12.50       | 2026-01-22 03:35:17.951566+00 |
| 5536e3e4-393f-4efb-85da-205bcaec96b1 | LENTE 1.56 AC. COM AR VERDE CIL. ESTENDIDO SUPER HIDROFOBICO   | visao_simples | economica     | -6.00          | -6.00        | 4.00           | 4.00         | 2026-01-22 03:35:17.951566+00 |
| ae5bc3cc-7fef-46c9-ab2f-95b3f08f6425 | MULTI 1.74 FREEVIEW HD BLUE FILTER                             | multifocal    | intermediaria | -13.00         | -13.00       | 10.00          | 10.00        | 2026-01-22 03:35:17.951566+00 |
| e481f666-e4c6-4f87-ada0-0fcb73128bea | MULTI 1.74 FREEVIEW HD TRANSITIONS CINZA AR FAST               | multifocal    | intermediaria | -13.00         | -13.00       | 10.00          | 10.00        | 2026-01-22 03:35:17.951566+00 |
| 628ca1e3-d3ca-482b-b9bc-2588c7b2ca07 | 1.59 POLICARBONATO MULTIFOCAL AR                               | multifocal    | economica     | 0.25           | 0.25         | 3.00           | 3.00         | 2026-01-22 03:35:17.951566+00 |
| ab72b0fd-5e1a-4f6d-8d27-1e4394c704e3 | 1.59 POLICARBONATO INCOLOR BLUE                                | visao_simples | economica     | -6.00          | -6.00        | 4.00           | 4.00         | 2026-01-22 03:35:17.951566+00 |
| bb48c943-cabe-4566-bd77-5d867aaaf00c | MULTI 1.49 FREEVIEW EASY                                       | multifocal    | intermediaria | -8.00          | -8.00        | 6.50           | 6.50         | 2026-01-22 03:35:17.951566+00 |
| 52ecac76-1efe-45e5-aed3-46c808d3a681 | ESPACE SHORT CR ACCLIMATES                                     | multifocal    | intermediaria | -6.00          | -6.00        | 6.00           | 6.00         | 2026-01-22 03:35:17.951566+00 |
| 4dafa827-5ac3-475d-9881-2ea0eb8b79cb | ESPACE CR ACCLIMATES                                           | multifocal    | intermediaria | -5.00          | -5.00        | 5.00           | 5.00         | 2026-01-22 03:35:17.951566+00 |


-- ============================================================================
-- 7. VERIFICAR NA VIEW v_lentes
-- ============================================================================
-- Verificar se as lentes agora aparecem com graus na view
SELECT 
    id,
    nome_lente,
    tipo_lente,
    categoria,
    grau_esferico_min,
    grau_esferico_max,
    grau_cilindrico_min,
    grau_cilindrico_max,
    preco_venda_sugerido
FROM public.v_lentes
WHERE grau_esferico_min IS NOT NULL
    OR grau_esferico_max IS NOT NULL
ORDER BY tipo_lente, preco_venda_sugerido
LIMIT 20;


| id                                   | nome_lente                                      | tipo_lente    | categoria | grau_esferico_min | grau_esferico_max | grau_cilindrico_min | grau_cilindrico_max | preco_venda_sugerido |
| ------------------------------------ | ----------------------------------------------- | ------------- | --------- | ----------------- | ----------------- | ------------------- | ------------------- | -------------------- |
| 13e50463-bba2-4163-b242-2d2a1bd067fe | LT CR 1.49 INCOLOR (TINTAVEL)                   | visao_simples | economica | -6.00             | 6.00              | 0.00                | -2.00               | 250.00               |
| 58edb8fb-4283-4d84-b7e8-663a3c8a5cc1 | LT 1.59 POLICARBONATO INCOLOR                   | visao_simples | economica | -10.00            | 6.00              | 0.00                | -2.00               | 250.00               |
| 59828728-37d1-4c3b-9780-a2fce84a0b34 | LT CR AR 1.56                                   | visao_simples | economica | -8.00             | 6.00              | 0.00                | -2.00               | 253.91               |
| 3d656633-f8cc-4e48-af26-d2a9f1408f8c | LT CR 1.49 Incolor (TINTÁVEL)                   | visao_simples | economica | -6.00             | 6.00              | -2.00               | 2.00                | 255.87               |
| 82cee871-8c04-4841-b3b9-7ca6d1d1286a | CR 1.56 AR                                      | visao_simples | economica | -8.00             | 6.00              | -2.00               | 0.00                | 261.73               |
| 561e46cc-1077-45e8-b8d5-3b4248647d47 | LENTE AC. COM AR 1.56                           | visao_simples | economica | -8.00             | 4.00              | 0.00                | -2.00               | 264.86               |
| 919b83ab-8d88-4032-ab09-f1f4811be1df | LT CR AR 1.56                                   | visao_simples | economica | -6.00             | 6.00              | -2.25               | -4.00               | 265.64               |
| b1e29c04-b108-4b5b-ab95-4186fd639849 | LT CR AR 1.56 BLUE (RESIDUAL AZUL)              | visao_simples | economica | -6.00             | 6.00              | 0.00                | -2.00               | 265.64               |
| 7b1522de-1735-4a39-b13c-7c07fff0855b | CR 1.56 INCOLOR TINTAVEL 1                      | visao_simples | economica | -6.00             | 6.00              | -2.00               | 0.00                | 265.64               |
| e41d8dfd-396e-47c0-b74e-a3d45c7386c7 | LT CR AR 1.56 BLUE (RESIDUAL VERDE)             | visao_simples | economica | -6.00             | 6.00              | 0.00                | -2.00               | 265.64               |
| 5a464ac2-b4c1-43b4-a19b-f6af81c28230 | LENTE AC. COM AR 1.49                           | visao_simples | economica | -4.00             | 4.00              | 0.00                | -2.00               | 267.60               |
| 8f5168f4-1ea3-415c-b0cd-55a9e8fea6f0 | LT 1.59 POLICARBONATO INCOLOR CIL. EXT.         | visao_simples | economica | -6.00             | 6.00              | -2.25               | -4.00               | 273.47               |
| 08fa44ef-8d82-4f5b-b6da-b981c533080b | LT CR 1.49 Incolor Cil. Ext. (TINTÁVEL)         | visao_simples | economica | -6.00             | 6.00              | -2.25               | -4.00               | 275.42               |
| c3623f26-7b07-4fc6-b4ba-c05fd16217bf | LT CR AR 1.56 Blue (Residual Azul)              | visao_simples | economica | -6.00             | 6.00              | -2.25               | -4.00               | 281.29               |
| 48edab4f-f6c0-4038-9db5-322e5cc714b9 | LT CR AR 1.56 Blue (Residual Verde)             | visao_simples | economica | -6.00             | 6.00              | -2.25               | -4.00               | 281.29               |
| a73dedb0-8bac-4eff-a3d1-11a5d5d5b872 | LT CR AR 1.56 Cil. Ext.                         | visao_simples | economica | -6.00             | 6.00              | -2.25               | -4.00               | 281.29               |
| 04131836-0611-435e-85b0-59666a2538ba | LT CR AR 1.56 BLUE CIL. EXT. (RESIDUAL VERDE)   | visao_simples | economica | -6.00             | 6.00              | -2.25               | -4.00               | 281.29               |
| 211079c9-e317-4c5c-87e0-10b31ae89308 | LT CR AR 1.56 BLUE CIL. EXT. (RESIDUAL AZUL)    | visao_simples | economica | -6.00             | 6.00              | -2.25               | -4.00               | 281.29               |
| 1bf9f319-f50c-41d3-93a8-47cc2a243939 | LT 1.59 POLICARBONATO AR                        | visao_simples | economica | -10.00            | 6.00              | 0.00                | -2.00               | 281.29               |
| 3e77bfdb-f3dc-4fe7-96fa-4fea4f491151 | LENTE AC. POLICARBONATO INCOLOR HC              | visao_simples | economica | -6.00             | 4.00              | 0.00                | -2.00               | 282.85               |



-- ============================================================================
-- 8. LENTES QUE AINDA PRECISAM DE ATENÇÃO
-- ============================================================================
-- Identifica lentes que ainda não têm graus após a migração
SELECT 
    id,
    nome_lente,
    fornecedor_id,
    tipo_lente,
    categoria,
    grau_esferico_min,
    grau_esferico_max,
    esferico_min,
    esferico_max,
    ativo
FROM lens_catalog.lentes
WHERE ativo = true
    AND tipo_lente IN ('visao_simples', 'multifocal', 'bifocal')
    AND esferico_min IS NULL
    AND esferico_max IS NULL
    AND grau_esferico_min IS NULL
    AND grau_esferico_max IS NULL
ORDER BY tipo_lente, nome_lente
LIMIT 20;

Success. No rows returned




-- ============================================================================
-- 9. ESTATÍSTICAS POR FORNECEDOR
-- ============================================================================
SELECT 
    f.nome as fornecedor,
    COUNT(*) as total_lentes,
    COUNT(CASE WHEN l.esferico_min IS NOT NULL THEN 1 END) as com_grau_novo,
    COUNT(CASE WHEN l.grau_esferico_min IS NOT NULL AND l.esferico_min IS NULL THEN 1 END) as ainda_com_gap,
    ROUND(
        COUNT(CASE WHEN l.esferico_min IS NOT NULL THEN 1 END)::NUMERIC / 
        COUNT(*)::NUMERIC * 100, 
        2
    ) as percentual_migrado
FROM lens_catalog.lentes l
JOIN core.fornecedores f ON f.id = l.fornecedor_id
WHERE l.ativo = true
GROUP BY f.nome
ORDER BY percentual_migrado DESC, total_lentes DESC;

| fornecedor | total_lentes | com_grau_novo | ainda_com_gap | percentual_migrado |
| ---------- | ------------ | ------------- | ------------- | ------------------ |
| So Blocos  | 1097         | 1097          | 0             | 100.00             |
| Polylux    | 158          | 158           | 0             | 100.00             |
| Express    | 84           | 84            | 0             | 100.00             |
| Brascor    | 58           | 58            | 0             | 100.00             |
| Sygma      | 14           | 14            | 0             | 100.00             |


-- ============================================================================
-- 10. ROLLBACK (SE NECESSÁRIO)
-- ============================================================================
-- CUIDADO: Esta query LIMPA os campos novos
-- Use apenas se precisar desfazer a migração
-- DESCOMENTE APENAS SE TIVER CERTEZA

-- UPDATE lens_catalog.lentes
-- SET 
--     esferico_min = NULL,
--     esferico_max = NULL,
--     cilindrico_min = NULL,
--     cilindrico_max = NULL,
--     updated_at = NOW()
-- WHERE ativo = true
--     AND (esferico_min IS NOT NULL OR esferico_max IS NOT NULL);
