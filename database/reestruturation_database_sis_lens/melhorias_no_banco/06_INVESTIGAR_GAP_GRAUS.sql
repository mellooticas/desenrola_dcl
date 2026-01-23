-- ============================================================================
-- INVESTIGAÇÃO: GAP DE GRAUS ENTRE TABELA E VIEW
-- ============================================================================
-- Objetivo: Identificar lentes com graus na tabela que não aparecem na view
-- Data: 22/01/2026
-- ============================================================================

-- ============================================================================
-- 1. VERIFICAR CAMPOS DE GRAUS NA TABELA lens_catalog.lentes
-- ============================================================================
-- A tabela tem DOIS conjuntos de campos de graus:
-- 1. grau_esferico_min/max, grau_cilindrico_min/max (campos originais)
-- 2. esferico_min/max, cilindrico_min/max (campos novos)

-- ============================================================================
-- 2. VERIFICAR CAMPOS DE GRAUS NA VIEW v_lentes
-- ============================================================================
-- A view usa apenas:
-- l.esferico_min as grau_esferico_min
-- l.esferico_max as grau_esferico_max
-- l.cilindrico_min as grau_cilindrico_min
-- l.cilindrico_max as grau_cilindrico_max

-- ============================================================================
-- 3. IDENTIFICAR LENTES COM GRAUS APENAS NOS CAMPOS ANTIGOS
-- ============================================================================
SELECT 
    COUNT(*) as total_lentes,
    COUNT(CASE WHEN grau_esferico_min IS NOT NULL OR grau_esferico_max IS NOT NULL THEN 1 END) as com_grau_esferico_antigo,
    COUNT(CASE WHEN grau_cilindrico_min IS NOT NULL OR grau_cilindrico_max IS NOT NULL THEN 1 END) as com_grau_cilindrico_antigo,
    COUNT(CASE WHEN esferico_min IS NOT NULL OR esferico_max IS NOT NULL THEN 1 END) as com_esferico_novo,
    COUNT(CASE WHEN cilindrico_min IS NOT NULL OR cilindrico_max IS NOT NULL THEN 1 END) as com_cilindrico_novo,
    COUNT(CASE 
        WHEN (grau_esferico_min IS NOT NULL OR grau_esferico_max IS NOT NULL)
        AND esferico_min IS NULL AND esferico_max IS NULL 
        THEN 1 
    END) as gap_esferico,
    COUNT(CASE 
        WHEN (grau_cilindrico_min IS NOT NULL OR grau_cilindrico_max IS NOT NULL)
        AND cilindrico_min IS NULL AND cilindrico_max IS NULL 
        THEN 1 
    END) as gap_cilindrico
FROM lens_catalog.lentes
WHERE ativo = true;

| total_lentes | com_grau_esferico_antigo | com_grau_cilindrico_antigo | com_esferico_novo | com_cilindrico_novo | gap_esferico | gap_cilindrico |
| ------------ | ------------------------ | -------------------------- | ----------------- | ------------------- | ------------ | -------------- |
| 1411         | 1411                     | 1411                       | 0                 | 0                   | 1411         | 1411           |



    -- ============================================================================
    -- 4. LISTAR LENTES COM GAP DE GRAUS ESFÉRICOS
    -- ============================================================================
    SELECT 
        id,
        nome_lente,
        fornecedor_id,
        tipo_lente,
        categoria,
        material,
        indice_refracao,
        -- Campos antigos (com valores)
        grau_esferico_min,
        grau_esferico_max,
        grau_cilindrico_min,
        grau_cilindrico_max,
        -- Campos novos (NULL)
        esferico_min,
        esferico_max,
        cilindrico_min,
        cilindrico_max,
        preco_venda_sugerido,
        ativo
    FROM lens_catalog.lentes
    WHERE ativo = true
        AND (grau_esferico_min IS NOT NULL OR grau_esferico_max IS NOT NULL)
        AND esferico_min IS NULL 
        AND esferico_max IS NULL
    ORDER BY fornecedor_id, nome_lente
    LIMIT 50;


| id                                   | nome_lente                                                          | fornecedor_id                        | tipo_lente    | categoria | material      | indice_refracao | grau_esferico_min | grau_esferico_max | grau_cilindrico_min | grau_cilindrico_max | esferico_min | esferico_max | cilindrico_min | cilindrico_max | preco_venda_sugerido | ativo |
| ------------------------------------ | ------------------------------------------------------------------- | ------------------------------------ | ------------- | --------- | ------------- | --------------- | ----------------- | ----------------- | ------------------- | ------------------- | ------------ | ------------ | -------------- | -------------- | -------------------- | ----- |
| 1af71fc0-190d-4838-82f9-d63ecbb0ee77 | LENTE 1.56 AC. COM AR AZUL                                          | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.56            | -8.00             | 4.00              | 0.00                | -2.00               | null         | null         | null           | null           | 316.48               | true  |
| 6e6d62f1-c198-4e31-82d7-beb24a7f8b07 | LENTE 1.56 AC. COM AR AZUL CIL. ESTENDIDO                           | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.56            | -6.00             | 4.00              | -2.25               | -4.00               | null         | null         | null           | null           | 355.59               | true  |
| 795691d5-a939-484a-bb5e-20f2e23056d5 | LENTE 1.56 AC. COM AR VERDE                                         | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.56            | -8.00             | 4.00              | 0.00                | -2.00               | null         | null         | null           | null           | 316.48               | true  |
| abce6a12-ee6e-4474-bb12-b0d78cc8fae7 | LENTE 1.56 AC. COM AR VERDE CIL. ESTENDIDO                          | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.56            | -6.00             | 4.00              | -2.25               | -4.00               | null         | null         | null           | null           | 355.59               | true  |
| 5536e3e4-393f-4efb-85da-205bcaec96b1 | LENTE 1.56 AC. COM AR VERDE CIL. ESTENDIDO SUPER HIDROFOBICO        | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.56            | -6.00             | 4.00              | -2.25               | -4.00               | null         | null         | null           | null           | 433.81               | true  |
| 08272024-ba29-4324-84a0-01cbe3b3f6c1 | LENTE 1.56 AC. COM AR VERDE SUPER HIDROFOBICO                       | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.56            | -6.00             | 4.00              | 0.00                | -2.00               | null         | null         | null           | null           | 386.88               | true  |
| db6b4cf0-033a-4641-82fd-54e6140bd936 | LENTE AC. 1.49 INCOLOR                                              | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.50            | -4.00             | 6.00              | 0.00                | -2.00               | null         | null         | null           | null           | 287.15               | true  |
| a48b35e1-381d-43b2-a094-614160acaf23 | LENTE AC. 1.49 INCOLOR CIL. ESTENDIDO                               | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.50            | -4.00             | 4.00              | -2.25               | -4.00               | null         | null         | null           | null           | 316.48               | true  |
| e24ea22c-90d5-4215-81cc-08d9e5250c52 | LENTE AC. 1.56 BLUE VERNIZ TINTAVEL                                 | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.56            | -4.00             | 4.00              | 0.00                | -2.00               | null         | null         | null           | null           | 308.66               | true  |
| 92b72555-124e-4320-b270-053f35bd662c | LENTE AC. 1.56 BLUE VERNIZ TINTAVEL CIL. ESTENDIDO                  | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.56            | -4.00             | 4.00              | -2.25               | -4.00               | null         | null         | null           | null           | 347.77               | true  |
| 26ba2feb-8739-4d74-8357-97a17736d07b | LENTE AC. 1.56 FOTO COM AR VERDE CIL. ESTENDIDO SUPER HIDROFOBICO   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.56            | -4.00             | 3.00              | -2.25               | -4.00               | null         | null         | null           | null           | 527.67               | true  |
| 73a60c66-1bf2-4af6-a4c6-f6c8e505635f | LENTE AC. 1.56 FOTO COM AR VERDE SUPER HIDROFOBICO                  | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.56            | -4.00             | 3.00              | 0.00                | -2.00               | null         | null         | null           | null           | 472.92               | true  |
| 9feb05a9-2f7d-450d-b265-fbeffe0ef6cb | LENTE AC. 1.61 BLUE AR AZUL                                         | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.61            | -10.00            | 6.00              | 0.00                | -2.00               | null         | null         | null           | null           | 508.12               | true  |
| 5efe3471-b961-45a5-bcb4-f1897788c4ac | LENTE AC. 1.61 BLUE AR AZUL ESTENDIDO                               | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.61            | -8.00             | 0.00              | -2.25               | -4.00               | null         | null         | null           | null           | 566.78               | true  |
| 177978c4-41a4-4a28-ab8d-d57532e3c97f | LENTE AC. 1.61 COM AR SUPER HIDROFOBICO                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.61            | -10.00            | 4.00              | 0.00                | -2.00               | null         | null         | null           | null           | 449.45               | true  |
| db9a93c9-b47b-4cba-a23e-8020586225df | LENTE AC. 1.61 COM AR SUPER HIDROFOBICO ESTENDIDO                   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.61            | -5.25             | -5.25             | -3.00               | -3.00               | null         | null         | null           | null           | 449.45               | true  |
| 71da6d60-6957-4cdf-a31d-8cb1819eed09 | LENTE AC. 1.61 COM AR SUPER HIDROFOBICO ESTENDIDO                   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.61            | -5.00             | 0.00              | 0.00                | -4.00               | null         | null         | null           | null           | 449.45               | true  |
| 5f9beabf-9ff6-45ea-8bab-f57c4d5da7bd | LENTE AC. 1.61 FOTO COM AR VERDE ESTENDIDO SUPER HIDROFOBICO        | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.61            | -6.00             | 6.00              | -2.25               | -4.00               | null         | null         | null           | null           | 801.43               | true  |
| 59f3ddf3-12fb-4b0a-a814-1a08d2cc8add | LENTE AC. 1.61 FOTO COM AR VERDE SUPER HIDROFOBICO                  | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.61            | -10.00            | 6.00              | 0.00                | -2.00               | null         | null         | null           | null           | 801.43               | true  |
| ec4fc00d-7acb-42bf-b100-46545fcc6182 | LENTE AC. 1.67 COM AR SUPER HIDROFOBICO                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.67            | -12.00            | 6.00              | 0.00                | 2.00                | null         | null         | null           | null           | 762.32               | true  |
| 02766abb-0204-413f-9716-e78f871103f9 | LENTE AC. 1.67 COM AR SUPER HIDROFOBICO                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.67            | -12.00            | 6.00              | 0.00                | -2.00               | null         | null         | null           | null           | 566.78               | true  |
| c6f79abb-e75d-4a51-942f-167c66c03b33 | LENTE AC. 1.67 COM AR SUPER HIDROFOBICO                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.67            | -15.00            | -12.50            | 0.00                | 0.00                | null         | null         | null           | null           | 566.78               | true  |
| f0539bb2-a057-44e9-adc0-a7c0193b29e6 | LENTE AC. 1.67 COM AR SUPER HIDROFOBICO ESTENDIDO                   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.67            | -8.00             | 0.00              | -2.25               | -4.00               | null         | null         | null           | null           | 566.78               | true  |
| 0bb00d4e-03fc-42a0-8d9c-807483900e9e | LENTE AC. 1.67 COM AR SUPER HIDROFOBICO ESTENDIDO                   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.67            | -8.00             | 0.00              | 2.25                | 4.00                | null         | null         | null           | null           | 762.32               | true  |
| b440c4d5-54d0-4943-9f7d-0ceed0d28bbc | LENTE AC. 1.70 BLUE AR VERDE SUPER HIDROFOBICO                      | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.50            | -18.00            | -3.00             | 0.00                | 2.00                | null         | null         | null           | null           | 1466.28              | true  |
| 517fa700-2dfe-4711-8f98-3322a639a4af | LENTE AC. 1.70 BLUE AR VERDE SUPER HIDROFOBICO                      | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.50            | -24.00            | -18.50            | 0.00                | 0.00                | null         | null         | null           | null           | 1466.28              | true  |
| 3163a972-6ec9-4fa9-acc2-226d89f49266 | LENTE AC. 1.74 COM AR SUPER HIDROFOBICO                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.74            | -15.00            | -12.50            | 0.00                | 0.00                | null         | null         | null           | null           | 1700.93              | true  |
| 9162aa7c-bf66-4144-b2a2-090f950fbce4 | LENTE AC. 1.74 COM AR SUPER HIDROFOBICO                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.74            | -12.00            | -2.00             | 0.00                | 2.00                | null         | null         | null           | null           | 1700.93              | true  |
| 951b2024-eedb-4f4d-9740-70bf68988a37 | LENTE AC. 1.74 COM AR SUPER HIDROFOBICO                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.74            | -12.00            | -2.00             | 0.00                | -2.00               | null         | null         | null           | null           | 742.77               | true  |
| 2891f9c0-3622-4c35-a570-2d993ffb2a8e | LENTE AC. 1.74 COM AR SUPER HIDROFOBICO                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.74            | -15.00            | -12.50            | 0.00                | 0.00                | null         | null         | null           | null           | 742.77               | true  |
| 506355b1-b6ed-450f-8ff9-df398f232fb1 | LENTE AC. 1.74 COM AR SUPER HIDROFOBICO ESTENDIDO                   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.74            | -8.00             | -2.00             | 2.25                | 4.00                | null         | null         | null           | null           | 1700.93              | true  |
| 93ab93a2-9b1e-4b9b-97f2-3382e9b9e63b | LENTE AC. 1.74 COM AR SUPER HIDROFOBICO ESTENDIDO                   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.74            | -8.00             | -2.00             | -2.25               | -4.00               | null         | null         | null           | null           | 742.77               | true  |
| 5a464ac2-b4c1-43b4-a19b-f6af81c28230 | LENTE AC. COM AR 1.49                                               | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.50            | -4.00             | 4.00              | 0.00                | -2.00               | null         | null         | null           | null           | 267.60               | true  |
| 561e46cc-1077-45e8-b8d5-3b4248647d47 | LENTE AC. COM AR 1.56                                               | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.56            | -8.00             | 4.00              | 0.00                | -2.00               | null         | null         | null           | null           | 264.86               | true  |
| 7a331f60-9d90-4311-9247-bcc5cecd075d | LENTE AC. COM AR 1.56 CIL. ESTENDIDO                                | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.56            | -6.00             | 4.00              | -2.25               | -4.00               | null         | null         | null           | null           | 320.40               | true  |
| cdd1de10-92c9-40cf-a57a-3dac21552e52 | LENTE AC. POLICARBONATO AR AZUL CIL. ESTENDIDO                      | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | POLICARBONATO | 1.59            | -6.00             | 6.00              | -2.25               | -4.00               | null         | null         | null           | null           | 605.89               | true  |
| b2f58d1d-085c-4115-984e-45574b7e988d | LENTE AC. POLICARBONATO AR VERDE CIL. ESTENDIDO                     | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | POLICARBONATO | 1.59            | -6.00             | 2.00              | -2.25               | -4.00               | null         | null         | null           | null           | 429.90               | true  |
| 52ac31d4-71a8-41d0-8d01-4c7c4bf5de5f | LENTE AC. POLICARBONATO AR VERDE CIL. ESTENDIDO SUPER HIDROFOBICO   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | POLICARBONATO | 1.59            | -6.00             | 2.00              | -2.25               | -4.00               | null         | null         | null           | null           | 469.01               | true  |
| 37f084ce-b33a-44fd-8de0-23e48d9d7a87 | LENTE AC. POLICARBONATO BLUE INCOLOR HC                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | POLICARBONATO | 1.59            | -6.00             | 4.00              | 0.00                | -2.00               | null         | null         | null           | null           | 339.95               | true  |
| 34e8dfdc-909d-46b2-b946-5e2c4ad736ae | LENTE AC. POLICARBONATO BLUE INCOLOR HC ESTENDIDO                   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | POLICARBONATO | 1.59            | -6.00             | 2.00              | -2.25               | -4.00               | null         | null         | null           | null           | 398.61               | true  |
| 5b2d1d93-e608-4b12-a322-dd1df3cf2d2f | LENTE AC. POLICARBONATO COM AR                                      | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | POLICARBONATO | 1.59            | -8.00             | 6.00              | 0.00                | -2.00               | null         | null         | null           | null           | 301.23               | true  |
| 77b302ff-39c3-475f-ba67-76708a865ea3 | LENTE AC. POLICARBONATO COM AR AZUL                                 | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | POLICARBONATO | 1.59            | -6.00             | 6.00              | 0.00                | -2.00               | null         | null         | null           | null           | 547.23               | true  |
| 21a3a24e-811f-4a8e-bcfc-157aa63ec4bd | LENTE AC. POLICARBONATO COM AR EXT. CIL.                            | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | POLICARBONATO | 1.59            | -6.00             | 4.00              | -2.25               | -4.00               | null         | null         | null           | null           | 402.52               | true  |
| db9f4f59-94d1-485e-b407-b282474b673c | LENTE AC. POLICARBONATO COM AR VERDE                                | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | POLICARBONATO | 1.59            | -8.00             | 6.00              | 0.00                | -2.00               | null         | null         | null           | null           | 359.50               | true  |
| ce26e038-93da-4b71-8476-7914b67d45ae | LENTE AC. POLICARBONATO COM AR VERDE SUPER HIDROFOBICO              | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | POLICARBONATO | 1.59            | -8.00             | 6.00              | 0.00                | -2.00               | null         | null         | null           | null           | 410.35               | true  |
| 3e77bfdb-f3dc-4fe7-96fa-4fea4f491151 | LENTE AC. POLICARBONATO INCOLOR HC                                  | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | POLICARBONATO | 1.59            | -6.00             | 4.00              | 0.00                | -2.00               | null         | null         | null           | null           | 282.85               | true  |
| d4093999-48b4-4e89-ae4d-077ac2f66459 | LENTE AC. POLICARBONATO INCOLOR HC ESTENDIDO                        | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | POLICARBONATO | 1.59            | -6.00             | 2.00              | 0.00                | -4.00               | null         | null         | null           | null           | 386.88               | true  |
| d8271ad0-32ca-4e3e-b75b-cdf1240908ee | LENTE AC.1.50 TRANSITIONS GEN8 COM AR                               | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.50            | -2.00             | 2.00              | 0.00                | -2.00               | null         | null         | null           | null           | 977.42               | true  |
| 56aa9b6d-11bb-41a0-b8af-260b81514c4a | LENTE AC.1.50 TRANSITIONS GEN8 COM AR                               | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.50            | 2.25              | 4.00              | -2.25               | -4.00               | null         | null         | null           | null           | 977.42               | true  |
| e92a3770-d61c-4fad-a5ee-333f6b88c42c | LENTE AC.1.56 AR VERDE                                              | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | CR39          | 1.56            | -4.00             | 4.00              | -4.25               | -6.00               | null         | null         | null           | null           | 547.23               | true  |

já identificamos um problemas correto?

-- ============================================================================
-- 5. LISTAR LENTES COM GAP DE GRAUS CILÍNDRICOS
-- ============================================================================
SELECT 
    id,
    nome_lente,
    fornecedor_id,
    tipo_lente,
    categoria,
    -- Campos antigos (com valores)
    grau_cilindrico_min,
    grau_cilindrico_max,
    -- Campos novos (NULL)
    cilindrico_min,
    cilindrico_max,
    ativo
FROM lens_catalog.lentes
WHERE ativo = true
    AND (grau_cilindrico_min IS NOT NULL OR grau_cilindrico_max IS NOT NULL)
    AND cilindrico_min IS NULL 
    AND cilindrico_max IS NULL
ORDER BY fornecedor_id, nome_lente
LIMIT 50;


| id                                   | nome_lente                                                          | fornecedor_id                        | tipo_lente    | categoria | grau_cilindrico_min | grau_cilindrico_max | cilindrico_min | cilindrico_max | ativo |
| ------------------------------------ | ------------------------------------------------------------------- | ------------------------------------ | ------------- | --------- | ------------------- | ------------------- | -------------- | -------------- | ----- |
| 1af71fc0-190d-4838-82f9-d63ecbb0ee77 | LENTE 1.56 AC. COM AR AZUL                                          | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| 6e6d62f1-c198-4e31-82d7-beb24a7f8b07 | LENTE 1.56 AC. COM AR AZUL CIL. ESTENDIDO                           | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -2.25               | -4.00               | null           | null           | true  |
| 795691d5-a939-484a-bb5e-20f2e23056d5 | LENTE 1.56 AC. COM AR VERDE                                         | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| abce6a12-ee6e-4474-bb12-b0d78cc8fae7 | LENTE 1.56 AC. COM AR VERDE CIL. ESTENDIDO                          | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -2.25               | -4.00               | null           | null           | true  |
| 5536e3e4-393f-4efb-85da-205bcaec96b1 | LENTE 1.56 AC. COM AR VERDE CIL. ESTENDIDO SUPER HIDROFOBICO        | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -2.25               | -4.00               | null           | null           | true  |
| 08272024-ba29-4324-84a0-01cbe3b3f6c1 | LENTE 1.56 AC. COM AR VERDE SUPER HIDROFOBICO                       | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| db6b4cf0-033a-4641-82fd-54e6140bd936 | LENTE AC. 1.49 INCOLOR                                              | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| a48b35e1-381d-43b2-a094-614160acaf23 | LENTE AC. 1.49 INCOLOR CIL. ESTENDIDO                               | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -2.25               | -4.00               | null           | null           | true  |
| e24ea22c-90d5-4215-81cc-08d9e5250c52 | LENTE AC. 1.56 BLUE VERNIZ TINTAVEL                                 | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| 92b72555-124e-4320-b270-053f35bd662c | LENTE AC. 1.56 BLUE VERNIZ TINTAVEL CIL. ESTENDIDO                  | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -2.25               | -4.00               | null           | null           | true  |
| 26ba2feb-8739-4d74-8357-97a17736d07b | LENTE AC. 1.56 FOTO COM AR VERDE CIL. ESTENDIDO SUPER HIDROFOBICO   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -2.25               | -4.00               | null           | null           | true  |
| 73a60c66-1bf2-4af6-a4c6-f6c8e505635f | LENTE AC. 1.56 FOTO COM AR VERDE SUPER HIDROFOBICO                  | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| 9feb05a9-2f7d-450d-b265-fbeffe0ef6cb | LENTE AC. 1.61 BLUE AR AZUL                                         | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| 5efe3471-b961-45a5-bcb4-f1897788c4ac | LENTE AC. 1.61 BLUE AR AZUL ESTENDIDO                               | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -2.25               | -4.00               | null           | null           | true  |
| 177978c4-41a4-4a28-ab8d-d57532e3c97f | LENTE AC. 1.61 COM AR SUPER HIDROFOBICO                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| db9a93c9-b47b-4cba-a23e-8020586225df | LENTE AC. 1.61 COM AR SUPER HIDROFOBICO ESTENDIDO                   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -3.00               | -3.00               | null           | null           | true  |
| 71da6d60-6957-4cdf-a31d-8cb1819eed09 | LENTE AC. 1.61 COM AR SUPER HIDROFOBICO ESTENDIDO                   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -4.00               | null           | null           | true  |
| 5f9beabf-9ff6-45ea-8bab-f57c4d5da7bd | LENTE AC. 1.61 FOTO COM AR VERDE ESTENDIDO SUPER HIDROFOBICO        | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -2.25               | -4.00               | null           | null           | true  |
| 59f3ddf3-12fb-4b0a-a814-1a08d2cc8add | LENTE AC. 1.61 FOTO COM AR VERDE SUPER HIDROFOBICO                  | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| ec4fc00d-7acb-42bf-b100-46545fcc6182 | LENTE AC. 1.67 COM AR SUPER HIDROFOBICO                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | 2.00                | null           | null           | true  |
| 02766abb-0204-413f-9716-e78f871103f9 | LENTE AC. 1.67 COM AR SUPER HIDROFOBICO                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| c6f79abb-e75d-4a51-942f-167c66c03b33 | LENTE AC. 1.67 COM AR SUPER HIDROFOBICO                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | 0.00                | null           | null           | true  |
| f0539bb2-a057-44e9-adc0-a7c0193b29e6 | LENTE AC. 1.67 COM AR SUPER HIDROFOBICO ESTENDIDO                   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -2.25               | -4.00               | null           | null           | true  |
| 0bb00d4e-03fc-42a0-8d9c-807483900e9e | LENTE AC. 1.67 COM AR SUPER HIDROFOBICO ESTENDIDO                   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 2.25                | 4.00                | null           | null           | true  |
| b440c4d5-54d0-4943-9f7d-0ceed0d28bbc | LENTE AC. 1.70 BLUE AR VERDE SUPER HIDROFOBICO                      | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | 2.00                | null           | null           | true  |
| 517fa700-2dfe-4711-8f98-3322a639a4af | LENTE AC. 1.70 BLUE AR VERDE SUPER HIDROFOBICO                      | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | 0.00                | null           | null           | true  |
| 3163a972-6ec9-4fa9-acc2-226d89f49266 | LENTE AC. 1.74 COM AR SUPER HIDROFOBICO                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | 0.00                | null           | null           | true  |
| 9162aa7c-bf66-4144-b2a2-090f950fbce4 | LENTE AC. 1.74 COM AR SUPER HIDROFOBICO                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | 2.00                | null           | null           | true  |
| 951b2024-eedb-4f4d-9740-70bf68988a37 | LENTE AC. 1.74 COM AR SUPER HIDROFOBICO                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| 2891f9c0-3622-4c35-a570-2d993ffb2a8e | LENTE AC. 1.74 COM AR SUPER HIDROFOBICO                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | 0.00                | null           | null           | true  |
| 506355b1-b6ed-450f-8ff9-df398f232fb1 | LENTE AC. 1.74 COM AR SUPER HIDROFOBICO ESTENDIDO                   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 2.25                | 4.00                | null           | null           | true  |
| 93ab93a2-9b1e-4b9b-97f2-3382e9b9e63b | LENTE AC. 1.74 COM AR SUPER HIDROFOBICO ESTENDIDO                   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -2.25               | -4.00               | null           | null           | true  |
| 5a464ac2-b4c1-43b4-a19b-f6af81c28230 | LENTE AC. COM AR 1.49                                               | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| 561e46cc-1077-45e8-b8d5-3b4248647d47 | LENTE AC. COM AR 1.56                                               | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| 7a331f60-9d90-4311-9247-bcc5cecd075d | LENTE AC. COM AR 1.56 CIL. ESTENDIDO                                | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -2.25               | -4.00               | null           | null           | true  |
| cdd1de10-92c9-40cf-a57a-3dac21552e52 | LENTE AC. POLICARBONATO AR AZUL CIL. ESTENDIDO                      | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -2.25               | -4.00               | null           | null           | true  |
| b2f58d1d-085c-4115-984e-45574b7e988d | LENTE AC. POLICARBONATO AR VERDE CIL. ESTENDIDO                     | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -2.25               | -4.00               | null           | null           | true  |
| 52ac31d4-71a8-41d0-8d01-4c7c4bf5de5f | LENTE AC. POLICARBONATO AR VERDE CIL. ESTENDIDO SUPER HIDROFOBICO   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -2.25               | -4.00               | null           | null           | true  |
| 37f084ce-b33a-44fd-8de0-23e48d9d7a87 | LENTE AC. POLICARBONATO BLUE INCOLOR HC                             | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| 34e8dfdc-909d-46b2-b946-5e2c4ad736ae | LENTE AC. POLICARBONATO BLUE INCOLOR HC ESTENDIDO                   | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -2.25               | -4.00               | null           | null           | true  |
| 5b2d1d93-e608-4b12-a322-dd1df3cf2d2f | LENTE AC. POLICARBONATO COM AR                                      | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| 77b302ff-39c3-475f-ba67-76708a865ea3 | LENTE AC. POLICARBONATO COM AR AZUL                                 | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| 21a3a24e-811f-4a8e-bcfc-157aa63ec4bd | LENTE AC. POLICARBONATO COM AR EXT. CIL.                            | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -2.25               | -4.00               | null           | null           | true  |
| db9f4f59-94d1-485e-b407-b282474b673c | LENTE AC. POLICARBONATO COM AR VERDE                                | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| ce26e038-93da-4b71-8476-7914b67d45ae | LENTE AC. POLICARBONATO COM AR VERDE SUPER HIDROFOBICO              | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| 3e77bfdb-f3dc-4fe7-96fa-4fea4f491151 | LENTE AC. POLICARBONATO INCOLOR HC                                  | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| d4093999-48b4-4e89-ae4d-077ac2f66459 | LENTE AC. POLICARBONATO INCOLOR HC ESTENDIDO                        | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -4.00               | null           | null           | true  |
| d8271ad0-32ca-4e3e-b75b-cdf1240908ee | LENTE AC.1.50 TRANSITIONS GEN8 COM AR                               | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | 0.00                | -2.00               | null           | null           | true  |
| 56aa9b6d-11bb-41a0-b8af-260b81514c4a | LENTE AC.1.50 TRANSITIONS GEN8 COM AR                               | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -2.25               | -4.00               | null           | null           | true  |
| e92a3770-d61c-4fad-a5ee-333f6b88c42c | LENTE AC.1.56 AR VERDE                                              | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | visao_simples | economica | -4.25               | -6.00               | null           | null           | true  |



-- ============================================================================
-- 6. VERIFICAR LENTES COM ADIÇÃO (MULTIFOCAIS)
-- ============================================================================
SELECT 
    COUNT(*) as total_multifocais,
    COUNT(CASE WHEN adicao_min IS NOT NULL OR adicao_max IS NOT NULL THEN 1 END) as com_adicao
FROM lens_catalog.lentes
WHERE ativo = true
    AND tipo_lente IN ('multifocal', 'bifocal');


| total_multifocais | com_adicao |
| ----------------- | ---------- |
| 959               | 959        |


-- ============================================================================
-- 7. ANÁLISE COMPARATIVA: TODOS OS CAMPOS DE GRAUS
-- ============================================================================
SELECT 
    tipo_lente,
    categoria,
    COUNT(*) as total,
    COUNT(CASE WHEN grau_esferico_min IS NOT NULL THEN 1 END) as tem_grau_esf_min_antigo,
    COUNT(CASE WHEN grau_esferico_max IS NOT NULL THEN 1 END) as tem_grau_esf_max_antigo,
    COUNT(CASE WHEN esferico_min IS NOT NULL THEN 1 END) as tem_esf_min_novo,
    COUNT(CASE WHEN esferico_max IS NOT NULL THEN 1 END) as tem_esf_max_novo,
    COUNT(CASE WHEN grau_cilindrico_min IS NOT NULL THEN 1 END) as tem_grau_cil_min_antigo,
    COUNT(CASE WHEN grau_cilindrico_max IS NOT NULL THEN 1 END) as tem_grau_cil_max_antigo,
    COUNT(CASE WHEN cilindrico_min IS NOT NULL THEN 1 END) as tem_cil_min_novo,
    COUNT(CASE WHEN cilindrico_max IS NOT NULL THEN 1 END) as tem_cil_max_novo,
    COUNT(CASE WHEN adicao_min IS NOT NULL THEN 1 END) as tem_adicao_min,
    COUNT(CASE WHEN adicao_max IS NOT NULL THEN 1 END) as tem_adicao_max
FROM lens_catalog.lentes
WHERE ativo = true
GROUP BY tipo_lente, categoria
ORDER BY tipo_lente, categoria;


| tipo_lente    | categoria     | total | tem_grau_esf_min_antigo | tem_grau_esf_max_antigo | tem_esf_min_novo | tem_esf_max_novo | tem_grau_cil_min_antigo | tem_grau_cil_max_antigo | tem_cil_min_novo | tem_cil_max_novo | tem_adicao_min | tem_adicao_max |
| ------------- | ------------- | ----- | ----------------------- | ----------------------- | ---------------- | ---------------- | ----------------------- | ----------------------- | ---------------- | ---------------- | -------------- | -------------- |
| visao_simples | economica     | 366   | 366                     | 366                     | 0                | 0                | 366                     | 366                     | 0                | 0                | 263            | 263            |
| visao_simples | intermediaria | 86    | 86                      | 86                      | 0                | 0                | 86                      | 86                      | 0                | 0                | 86             | 86             |
| multifocal    | economica     | 82    | 82                      | 82                      | 0                | 0                | 82                      | 82                      | 0                | 0                | 82             | 82             |
| multifocal    | intermediaria | 875   | 875                     | 875                     | 0                | 0                | 875                     | 875                     | 0                | 0                | 875            | 875            |
| bifocal       | intermediaria | 2     | 2                       | 2                       | 0                | 0                | 2                       | 2                       | 0                | 0                | 2              | 2              |


-- ============================================================================
-- 8. VERIFICAR FORNECEDORES COM GAP DE GRAUS
-- ============================================================================
SELECT 
    f.id as fornecedor_id,
    f.nome as fornecedor_nome,
    COUNT(*) as total_lentes,
    COUNT(CASE 
        WHEN (l.grau_esferico_min IS NOT NULL OR l.grau_esferico_max IS NOT NULL)
        AND l.esferico_min IS NULL AND l.esferico_max IS NULL 
        THEN 1 
    END) as lentes_com_gap
FROM lens_catalog.lentes l
JOIN core.fornecedores f ON f.id = l.fornecedor_id
WHERE l.ativo = true
GROUP BY f.id, f.nome
HAVING COUNT(CASE 
    WHEN (l.grau_esferico_min IS NOT NULL OR l.grau_esferico_max IS NOT NULL)
    AND l.esferico_min IS NULL AND l.esferico_max IS NULL 
    THEN 1 
END) > 0
ORDER BY lentes_com_gap DESC;


| fornecedor_id                        | fornecedor_nome | total_lentes | lentes_com_gap |
| ------------------------------------ | --------------- | ------------ | -------------- |
| e1e1eace-11b4-4f26-9f15-620808a4a410 | So Blocos       | 1097         | 1097           |
| 3a0a8ad3-4c55-44a2-b9fa-232a9f2fdc21 | Polylux         | 158          | 158            |
| 8eb9498c-3d99-4d26-bb8c-e503f97ccf2c | Express         | 84           | 84             |
| 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | Brascor         | 58           | 58             |
| 199bae08-0217-4b70-b054-d3f0960b4a78 | Sygma           | 14           | 14             |


-- ============================================================================
-- 9. AMOSTRAS DE LENTES COM E SEM GAP
-- ============================================================================
-- Exemplo 1: Lentes COM graus corretos (campos novos preenchidos)
SELECT 
    id,
    nome_lente,
    esferico_min,
    esferico_max,
    cilindrico_min,
    cilindrico_max,
    adicao_min,
    adicao_max
FROM lens_catalog.lentes
WHERE ativo = true
    AND esferico_min IS NOT NULL
LIMIT 5;

Success. No rows returned





-- Exemplo 2: Lentes COM gap (só campos antigos preenchidos)
SELECT 
    id,
    nome_lente,
    grau_esferico_min,
    grau_esferico_max,
    grau_cilindrico_min,
    grau_cilindrico_max,
    esferico_min,
    esferico_max
FROM lens_catalog.lentes
WHERE ativo = true
    AND grau_esferico_min IS NOT NULL
    AND esferico_min IS NULL
LIMIT 5;


| id                                   | nome_lente                                       | grau_esferico_min | grau_esferico_max | grau_cilindrico_min | grau_cilindrico_max | esferico_min | esferico_max |
| ------------------------------------ | ------------------------------------------------ | ----------------- | ----------------- | ------------------- | ------------------- | ------------ | ------------ |
| 4dafa827-5ac3-475d-9881-2ea0eb8b79cb | ESPACE CR ACCLIMATES                             | -5.00             | 5.00              | -4.00               | 0.00                | null         | null         |
| 517fa700-2dfe-4711-8f98-3322a639a4af | LENTE AC. 1.70 BLUE AR VERDE SUPER HIDROFOBICO   | -24.00            | -18.50            | 0.00                | 0.00                | null         | null         |
| 03033eb5-a996-4251-99c7-5e61e412315c | 1.70 RESINA AR BLUE 1                            | -18.00            | -12.50            | -2.00               | 0.00                | null         | null         |
| 6714853d-347e-4985-8a14-5074970f4594 | VS HDI 1.49 FOTO                                 | -8.00             | 6.50              | -6.00               | 0.00                | null         | null         |
| 00139e30-ef11-477a-a600-1ddbd61977d2 | 1.61 RESINA AR BLUE AZUL                         | -6.00             | 6.00              | -2.00               | 0.00                | null         | null         |


-- ============================================================================
-- 10. VERIFICAR SE HÁ LENTES COM VALORES DIFERENTES NOS DOIS CONJUNTOS
-- ============================================================================
SELECT 
    id,
    nome_lente,
    grau_esferico_min,
    esferico_min,
    grau_esferico_max,
    esferico_max,
    grau_cilindrico_min,
    cilindrico_min,
    grau_cilindrico_max,
    cilindrico_max
FROM lens_catalog.lentes
WHERE ativo = true
    AND (
        (grau_esferico_min IS NOT NULL AND esferico_min IS NOT NULL AND grau_esferico_min != esferico_min)
        OR (grau_esferico_max IS NOT NULL AND esferico_max IS NOT NULL AND grau_esferico_max != esferico_max)
        OR (grau_cilindrico_min IS NOT NULL AND cilindrico_min IS NOT NULL AND grau_cilindrico_min != cilindrico_min)
        OR (grau_cilindrico_max IS NOT NULL AND cilindrico_max IS NOT NULL AND grau_cilindrico_max != cilindrico_max)
    )
LIMIT 20;


Success. No rows returned





-- ============================================================================
-- 11. VERIFICAR DNP (Distância Naso-Pupilar)
-- ============================================================================
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN dnp_min IS NOT NULL THEN 1 END) as com_dnp_min,
    COUNT(CASE WHEN dnp_max IS NOT NULL THEN 1 END) as com_dnp_max
FROM lens_catalog.lentes
WHERE ativo = true;


| total | com_dnp_min | com_dnp_max |
| ----- | ----------- | ----------- |
| 1411  | 0           | 0           |

