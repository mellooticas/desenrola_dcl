-- ============================================================
-- INVESTIGAÇÃO ESTRUTURADA - BANCO DE LENTES BEST_LENS
-- FASE 2: ANÁLISE DE DADOS E LÓGICA
-- Execute cada query e cole o resultado abaixo dela
-- ============================================================


-- ============================================================
-- ETAPA 1: CONTAGEM DE REGISTROS
-- ============================================================

-- Query 1.1: Total de registros em cada tabela principal
SELECT 'lentes' as tabela, COUNT(*) as total FROM lens_catalog.lentes
UNION ALL
SELECT 'lentes_ativas', COUNT(*) FROM lens_catalog.lentes WHERE ativo = true
UNION ALL
SELECT 'marcas', COUNT(*) FROM lens_catalog.marcas
UNION ALL
SELECT 'marcas_ativas', COUNT(*) FROM lens_catalog.marcas WHERE ativo = true
UNION ALL
SELECT 'grupos_canonicos', COUNT(*) FROM lens_catalog.grupos_canonicos
UNION ALL
SELECT 'lentes_canonicas', COUNT(*) FROM lens_catalog.lentes_canonicas
UNION ALL
SELECT 'fornecedores', COUNT(*) FROM core.fornecedores
UNION ALL
SELECT 'fornecedores_ativos', COUNT(*) FROM core.fornecedores WHERE ativo = true
UNION ALL
SELECT 'pedidos', COUNT(*) FROM compras.pedidos
UNION ALL
SELECT 'pedido_itens', COUNT(*) FROM compras.pedido_itens;

-- COLE O RESULTADO AQUI:
/*
| tabela              | total |
| ------------------- | ----- |
| lentes              | 1411  |
| lentes_ativas       | 1411  |
| marcas              | 17    |
| marcas_ativas       | 17    |
| grupos_canonicos    | 461   |
| lentes_canonicas    | 12    |
| fornecedores        | 11    |
| fornecedores_ativos | 11    |
| pedidos             | 0     |
| pedido_itens        | 0     |

*/


-- ============================================================
-- ETAPA 2: AMOSTRA DE DADOS - LENTES
-- ============================================================

-- Query 2.1: 5 lentes de exemplo com todos os campos principais
SELECT 
    id,
    fornecedor_id,
    marca_id,
    grupo_canonico_id,
    nome_lente,
    tipo_lente,
    material,
    indice_refracao,
    categoria,
    tratamento_antirreflexo,
    tratamento_uv,
    tratamento_blue_light,
    preco_custo,
    preco_venda_sugerido,
    ativo
FROM lens_catalog.lentes
WHERE ativo = true
LIMIT 5;

-- COLE O RESULTADO AQUI:
/*

| id                                   | fornecedor_id                        | marca_id                             | grupo_canonico_id                    | nome_lente                                       | tipo_lente    | material | indice_refracao | categoria | tratamento_antirreflexo | tratamento_uv | tratamento_blue_light | preco_custo | preco_venda_sugerido | ativo |
| ------------------------------------ | ------------------------------------ | ------------------------------------ | ------------------------------------ | ------------------------------------------------ | ------------- | -------- | --------------- | --------- | ----------------------- | ------------- | --------------------- | ----------- | -------------------- | ----- |
| 517fa700-2dfe-4711-8f98-3322a639a4af | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | 98deae91-ee66-4c32-8a5d-8a6f83681993 | 4f1ffb3a-9875-4460-9b64-5cf9f2670528 | LENTE AC. 1.70 BLUE AR VERDE SUPER HIDROFOBICO   | visao_simples | CR39     | 1.50            | economica | false                   | true          | true                  | 320.00      | 1466.28              | true  |
| 03033eb5-a996-4251-99c7-5e61e412315c | 3a0a8ad3-4c55-44a2-b9fa-232a9f2fdc21 | e7ef4c94-a80a-492f-9195-24e6ab2f5056 | 562926dc-7fab-4108-b4fc-37a7e283f1b2 | 1.70 RESINA AR BLUE 1                            | visao_simples | CR39     | 1.50            | economica | true                    | true          | true                  | 190.00      | 957.87               | true  |
| 6714853d-347e-4985-8a14-5074970f4594 | e1e1eace-11b4-4f26-9f15-620808a4a410 | 4af04ba6-e600-4874-b8dc-45a2e1773725 | 85dcc2a2-64c1-423a-be3f-ec8234dcae09 | VS HDI 1.49 FOTO                                 | visao_simples | CR39     | 1.50            | economica | false                   | true          | false                 | 540.00      | 2326.67              | true  |
| caa41402-7141-4519-b276-b22eafa8254f | e1e1eace-11b4-4f26-9f15-620808a4a410 | 3f8ac428-2224-415e-8a20-c9e6879754d3 | 2b2bae8b-6c65-4dc9-919b-b309be7387e7 | VS HDI 1.49 SLIM TRANSITIONS MARROM AR FAST      | visao_simples | CR39     | 1.50            | economica | true                    | true          | false                 | 1080.00     | 4438.54              | true  |
| 9fa5ed95-0e10-47b8-a665-afd523628e3d | e1e1eace-11b4-4f26-9f15-620808a4a410 | 3f8ac428-2224-415e-8a20-c9e6879754d3 | 2b2bae8b-6c65-4dc9-919b-b309be7387e7 | VS HDI 1.49 TRANSITIONS MARROM AR FAST AZUL      | visao_simples | CR39     | 1.50            | economica | true                    | true          | false                 | 1106.00     | 4540.22              | true  |

*/


-- Query 2.2: Estatísticas de preços das lentes
SELECT 
    tipo_lente,
    COUNT(*) as total,
    MIN(preco_custo) as preco_min,
    MAX(preco_custo) as preco_max,
    ROUND(AVG(preco_custo)::numeric, 2) as preco_medio
FROM lens_catalog.lentes
WHERE ativo = true
GROUP BY tipo_lente
ORDER BY preco_medio DESC;

-- COLE O RESULTADO AQUI:
/*

| tipo_lente    | total | preco_min | preco_max | preco_medio |
| ------------- | ----- | --------- | --------- | ----------- |
| multifocal    | 957   | 30.00     | 2410.00   | 946.87      |
| visao_simples | 452   | 9.00      | 2360.00   | 663.28      |
| bifocal       | 2     | 79.00     | 95.00     | 87.00       |

*/


-- ============================================================
-- ETAPA 3: AMOSTRA DE DADOS - GRUPOS CANÔNICOS
-- ============================================================

-- Query 3.1: 5 grupos canônicos de exemplo
SELECT 
    id,
    nome_grupo,
    slug,
    tipo_lente,
    material,
    indice_refracao,
    grau_esferico_min,
    grau_esferico_max,
    grau_cilindrico_min,
    grau_cilindrico_max,
    adicao_min,
    adicao_max,
    tratamento_antirreflexo,
    tratamento_blue_light,
    tratamento_fotossensiveis,
    total_lentes,
    total_marcas,
    preco_minimo,
    preco_medio,
    preco_maximo,
    is_premium
FROM lens_catalog.grupos_canonicos
LIMIT 5;

-- COLE O RESULTADO AQUI:
/*

| id                                   | nome_grupo                                                                          | slug                                                                              | tipo_lente    | material | indice_refracao | grau_esferico_min | grau_esferico_max | grau_cilindrico_min | grau_cilindrico_max | adicao_min | adicao_max | tratamento_antirreflexo | tratamento_blue_light | tratamento_fotossensiveis | total_lentes | total_marcas | preco_minimo | preco_medio | preco_maximo | is_premium |
| ------------------------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------- | -------- | --------------- | ----------------- | ----------------- | ------------------- | ------------------- | ---------- | ---------- | ----------------------- | --------------------- | ------------------------- | ------------ | ------------ | ------------ | ----------- | ------------ | ---------- |
| 5119b489-b1e6-486c-908a-0568709d578f | Lente CR39 1.56 Multifocal +AR +UV +BlueLight [-8.00/6.00 | -5.00/0.00 | 0.75/3.50] | lente-39-156-multifocal-ar-uv-bluelight-esf-n8-00-6-00-cil-n5-00-0-00-add-075-350 | multifocal    | CR39     | 1.56            | -8.00             | 6.00              | -5.00               | 0.00                | 0.75       | 3.50       | true                    | true                  | nenhum                    | 2            | 1            | 1411.53      | 1481.93     | 1552.32      | false      |
| d866c17c-bb77-4a23-8add-ed612b86afcb | Lente CR39 1.50 Visao Simples +AR +UV +fotocromático [-6.00/6.00 | -4.00/0.00]      | lente-39-150-visao-simples-ar-uv-fotocrom-tico-esf-n6-00-6-00-cil-n4-00-0-00      | visao_simples | CR39     | 1.50            | -6.00             | 6.00              | -4.00               | 0.00                | null       | null       | true                    | false                 | fotocromático             | 2            | 2            | 1071.28      | 1305.94     | 1540.59      | true       |
| aa06bcac-1de3-450a-88b6-88ffe7cea158 | Lente CR39 1.50 Visao Simples +AR +UV [-6.00/6.00 | -4.00/0.00]                     | lente-39-150-visao-simples-ar-uv-esf-n6-00-6-00-cil-n4-00-0-00                    | visao_simples | CR39     | 1.50            | -6.00             | 6.00              | -4.00               | 0.00                | null       | null       | true                    | false                 | nenhum                    | 1            | 1            | 727.13       | 727.13      | 727.13       | false      |
| b16d7869-ad98-44fe-a4ae-d77e7158b9b2 | Lente CR39 1.50 Visao Simples +AR +UV +BlueLight [-6.00/6.00 | -4.00/0.00]          | lente-39-150-visao-simples-ar-uv-bluelight-esf-n6-00-6-00-cil-n4-00-0-00          | visao_simples | CR39     | 1.50            | -6.00             | 6.00              | -4.00               | 0.00                | null       | null       | true                    | true                  | nenhum                    | 1            | 1            | 918.76       | 918.76      | 918.76       | false      |
| 3a79ba0f-2bdd-4f1a-a0b9-e5d5cd463ad7 | Lente CR39 1.50 Visao Simples +AR +UV [-6.00/6.00 | -2.25/-4.00]                    | lente-39-150-visao-simples-ar-uv-esf-n6-00-6-00-cil-n2-25-n4-00-add-000-000       | visao_simples | CR39     | 1.50            | -6.00             | 6.00              | -2.25               | -4.00               | 0.00       | 0.00       | true                    | false                 | nenhum                    | 1            | 1            | 275.42       | 275.42      | 275.42       | false      |

*/


-- Query 3.2: Distribuição de grupos por tipo
SELECT 
    tipo_lente,
    COUNT(*) as total_grupos,
    SUM(total_lentes) as total_lentes_nos_grupos,
    ROUND(AVG(preco_medio)::numeric, 2) as preco_medio_geral
FROM lens_catalog.grupos_canonicos
GROUP BY tipo_lente
ORDER BY total_grupos DESC;

-- COLE O RESULTADO AQUI:
/*

| tipo_lente    | total_grupos | total_lentes_nos_grupos | preco_medio_geral |
| ------------- | ------------ | ----------------------- | ----------------- |
| visao_simples | 232          | 452                     | 1661.68           |
| multifocal    | 228          | 957                     | 3304.83           |
| bifocal       | 1            | 2                       | 555.05            |

*/


-- Query 3.3: Grupos premium vs não-premium
SELECT 
    is_premium,
    COUNT(*) as total_grupos,
    ROUND(AVG(preco_medio)::numeric, 2) as preco_medio,
    ROUND(AVG(total_lentes)::numeric, 1) as media_lentes_por_grupo
FROM lens_catalog.grupos_canonicos
GROUP BY is_premium;

-- COLE O RESULTADO AQUI:
/*
| is_premium | total_grupos | preco_medio | media_lentes_por_grupo |
| ---------- | ------------ | ----------- | ---------------------- |
| false      | 401          | 2155.03     | 2.9                    |
| true       | 60           | 4589.95     | 4.4                    |


*/


-- ============================================================
-- ETAPA 4: AMOSTRA DE DADOS - MARCAS E FORNECEDORES
-- ============================================================

-- Query 4.1: Todas as marcas ativas
SELECT 
    id,
    nome,
    slug,
    is_premium,
    ativo
FROM lens_catalog.marcas
WHERE ativo = true
ORDER BY nome;

-- COLE O RESULTADO AQUI:
/*

| id                                   | nome        | slug        | is_premium | ativo |
| ------------------------------------ | ----------- | ----------- | ---------- | ----- |
| 98deae91-ee66-4c32-8a5d-8a6f83681993 | BRASCOR     | brascor     | false      | true  |
| d53785a4-37a2-48d1-b807-d172a31417ff | BRASLENTES  | braslentes  | false      | true  |
| befba165-0aa0-496f-bfdf-774bfe94a856 | CRIZAL      | crizal      | true       | true  |
| bbe5a62d-1d7d-4d93-87af-0dbde68c0645 | ESSILOR     | essilor     | true       | true  |
| 7bf35e08-7a88-4547-a06a-a6ce62fcc827 | EXPRESS     | express     | false      | true  |
| 7f1aa237-edaf-4376-8b91-6c93c3c079a4 | GENÉRICA    | generica    | false      | true  |
| 852e5fb8-8eae-4805-a5cb-a5a1e8638f5c | HOYA        | hoya        | true       | true  |
| a6091278-c827-40ea-a2fb-dcc26f1c8d20 | KODAK       | kodak       | true       | true  |
| 6c37f0a1-487c-4bb1-a065-c9498172cbfe | LENSCOPE    | lenscope    | true       | true  |
| e7ef4c94-a80a-492f-9195-24e6ab2f5056 | POLYLUX     | polylux     | false      | true  |
| d92921ad-1b9d-4f5f-93e1-3e75e4375f09 | RODENSTOCK  | rodenstock  | true       | true  |
| 4af04ba6-e600-4874-b8dc-45a2e1773725 | SO BLOCOS   | so-blocos   | false      | true  |
| 731a86d5-2d61-42ca-9533-1af470184bad | STYLE       | style       | false      | true  |
| 57fc0111-0a99-4642-8b66-f1d87a79afce | SYGMA       | sygma       | false      | true  |
| 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | transitions | true       | true  |
| 3f70213e-0b45-4f42-907a-28f7e7ac51c0 | VARILUX     | varilux     | true       | true  |
| a8ee9f1e-53d9-41ed-bc68-9c4a9881e828 | ZEISS       | zeiss       | true       | true  |

*/


-- Query 4.2: Todos os fornecedores ativos com prazos
SELECT 
    id,
    nome,
    razao_social,
    cnpj,
    prazo_visao_simples,
    prazo_multifocal,
    prazo_surfacada,
    cidade_origem,
    estado_origem,
    ativo
FROM core.fornecedores
WHERE ativo = true
ORDER BY nome;

-- COLE O RESULTADO AQUI:
/*

| id                                   | nome                   | razao_social                              | cnpj | prazo_visao_simples | prazo_multifocal | prazo_surfacada | cidade_origem | estado_origem | ativo |
| ------------------------------------ | ---------------------- | ----------------------------------------- | ---- | ------------------- | ---------------- | --------------- | ------------- | ------------- | ----- |
| 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | Brascor                | Brascor Distribuidora de Lentes           | null | 7                   | 10               | 12              | null          | null          | true  |
| 43721f5b-4f4a-4a75-bb34-6e8b373c5948 | Braslentes             | Champ Brasil Comercio LTDA                | null | 10                  | 12               | 14              | null          | null          | true  |
| 8eb9498c-3d99-4d26-bb8c-e503f97ccf2c | Express                | Lentes e Cia Express LTDA                 | null | 3                   | 5                | 7               | null          | null          | true  |
| e4a24408-3d58-4fc7-a096-cf7140f4f248 | Galeria Florencio lj11 | Galeria Florêncio Comércio de Óptica LTDA | null | 7                   | 10               | 12              | null          | null          | true  |
| d90bebaf-e552-4cf0-a226-808c91bda73a | Kaizi Oculos Solares   | Kaizi Importação e Exportação LTDA        | null | 7                   | 10               | 12              | null          | null          | true  |
| c50ea6eb-a420-4cf7-8aa2-68aaeb41ac95 | Navarro Oculos         | Navarro Distribuidora de Óculos LTDA      | null | 7                   | 10               | 12              | null          | null          | true  |
| 3a0a8ad3-4c55-44a2-b9fa-232a9f2fdc21 | Polylux                | Polylux Comercio de Produtos Opticos LTDA | null | 7                   | 10               | 12              | null          | null          | true  |
| 1d0b088f-dcb1-4179-9a18-5d67ce86c4b6 | Sao Paulo Acessorios   | São Paulo Acessórios LTDA                 | null | 7                   | 10               | 12              | null          | null          | true  |
| e1e1eace-11b4-4f26-9f15-620808a4a410 | So Blocos              | S blocos Comercio e Servios Oticos LTDA   | null | 7                   | 10               | 12              | null          | null          | true  |
| d88018ac-ecae-4b38-b321-94babe5f85e3 | Style                  | Style Primer Lentes Oftalmicas e Armaes   | null | 7                   | 10               | 12              | null          | null          | true  |
| 199bae08-0217-4b70-b054-d3f0960b4a78 | Sygma                  | Sygma Lentes Laboratório Óptico           | null | 7                   | 10               | 12              | null          | null          | true  |

*/


-- Query 4.3: Lentes por fornecedor
SELECT 
    f.nome as fornecedor,
    COUNT(l.id) as total_lentes,
    ROUND(AVG(l.preco_custo)::numeric, 2) as preco_medio_custo
FROM core.fornecedores f
LEFT JOIN lens_catalog.lentes l ON l.fornecedor_id = f.id AND l.ativo = true
WHERE f.ativo = true
GROUP BY f.id, f.nome
ORDER BY total_lentes DESC;

-- COLE O RESULTADO AQUI:
/*

| fornecedor             | total_lentes | preco_medio_custo |
| ---------------------- | ------------ | ----------------- |
| So Blocos              | 1097         | 1045.99           |
| Polylux                | 158          | 246.06            |
| Express                | 84           | 163.00            |
| Brascor                | 58           | 98.33             |
| Sygma                  | 14           | 29.46             |
| Kaizi Oculos Solares   | 0            | null              |
| Galeria Florencio lj11 | 0            | null              |
| Braslentes             | 0            | null              |
| Style                  | 0            | null              |
| Sao Paulo Acessorios   | 0            | null              |
| Navarro Oculos         | 0            | null              |

*/


-- Query 4.4: Lentes por marca
SELECT 
    m.nome as marca,
    m.is_premium,
    COUNT(l.id) as total_lentes,
    ROUND(AVG(l.preco_custo)::numeric, 2) as preco_medio_custo
FROM lens_catalog.marcas m
LEFT JOIN lens_catalog.lentes l ON l.marca_id = m.id AND l.ativo = true
WHERE m.ativo = true
GROUP BY m.id, m.nome, m.is_premium
ORDER BY total_lentes DESC;

-- COLE O RESULTADO AQUI:
/*

| marca       | is_premium | total_lentes | preco_medio_custo |
| ----------- | ---------- | ------------ | ----------------- |
| SO BLOCOS   | false      | 880          | 959.93            |
| TRANSITIONS | true       | 234          | 1325.24           |
| POLYLUX     | false      | 132          | 189.36            |
| BRASCOR     | false      | 56           | 94.88             |
| EXPRESS     | false      | 50           | 57.24             |
| SYGMA       | false      | 38           | 181.38            |
| VARILUX     | true       | 11           | 810.55            |
| GENÉRICA    | false      | 10           | 231.10            |
| BRASLENTES  | false      | 0            | null              |
| ESSILOR     | true       | 0            | null              |
| HOYA        | true       | 0            | null              |
| LENSCOPE    | true       | 0            | null              |
| ZEISS       | true       | 0            | null              |
| KODAK       | true       | 0            | null              |
| RODENSTOCK  | true       | 0            | null              |
| STYLE       | false      | 0            | null              |
| CRIZAL      | true       | 0            | null              |

*/


-- ============================================================
-- ETAPA 5: TESTAR VIEWS PÚBLICAS COM DADOS
-- ============================================================

-- Query 5.1: Contar registros em cada view (se existir)
-- Execute uma por vez e marque se funciona ou retorna erro

-- Teste: v_grupos_canonicos
SELECT COUNT(*) as total FROM public.v_grupos_canonicos;
-- RESULTADO: _______________
| total |
| ----- |
| 461   |
-- Teste: v_grupos_canonicos_completos  
SELECT COUNT(*) as total FROM public.v_grupos_canonicos_completos;
-- RESULTADO: _______________
| total |
| ----- |
| 461   |
-- Teste: v_grupos_premium_marcas
SELECT COUNT(*) as total FROM public.v_grupos_premium_marcas;
-- RESULTADO: _______________
| total |
| ----- |
| 60    |
-- Teste: v_grupos_por_receita_cliente
SELECT COUNT(*) as total FROM public.v_grupos_por_receita_cliente;
-- RESULTADO: _______________
| total |
| ----- |
| 461   |
-- Teste: v_grupos_por_faixa_preco
SELECT COUNT(*) as total FROM public.v_grupos_por_faixa_preco;
-- RESULTADO: _______________
| total |
| ----- |
| 461   |
-- Teste: v_grupos_melhor_margem
SELECT COUNT(*) as total FROM public.v_grupos_melhor_margem;
-- RESULTADO: _______________
| total |
| ----- |
| 461   |
-- Teste: v_fornecedores_por_lente
SELECT COUNT(*) as total FROM public.v_fornecedores_por_lente;
-- RESULTADO: _______________
| total |
| ----- |
| 1411  |
-- Teste: v_lentes_cotacao_compra
SELECT COUNT(*) as total FROM public.v_lentes_cotacao_compra;
-- RESULTADO: _______________

| total |
| ----- |
| 1411  |
-- Query 5.2: Se alguma view funcionar, pegar amostra de 3 registros
-- ESCOLHA UMA VIEW QUE FUNCIONOU ACIMA E EXECUTE:

SELECT * FROM public.[NOME_DA_VIEW] LIMIT 3;

-- COLE O RESULTADO AQUI:
/*

Error: Failed to run sql query: ERROR: 42601: syntax error at or near "[" LINE 1: SELECT * FROM public.[NOME_DA_VIEW] LIMIT 3; ^




*/


-- ============================================================
-- ETAPA 6: RELACIONAMENTOS E INTEGRIDADE
-- ============================================================

-- Query 6.1: Lentes órfãs (sem grupo canônico)
SELECT 
    COUNT(*) as lentes_sem_grupo
FROM lens_catalog.lentes
WHERE grupo_canonico_id IS NULL 
  AND ativo = true;

-- COLE O RESULTADO AQUI:
/*

| lentes_sem_grupo |
| ---------------- |
| 0                |

*/


-- Query 6.2: Grupos vazios (sem lentes)
SELECT 
    COUNT(*) as grupos_sem_lentes
FROM lens_catalog.grupos_canonicos
WHERE total_lentes = 0 OR total_lentes IS NULL;

-- COLE O RESULTADO AQUI:
/*

| grupos_sem_lentes |
| ----------------- |
| 0                 |

*/


-- Query 6.3: Verificar integridade referencial (amostra)
SELECT 
    l.id,
    l.nome_lente,
    CASE WHEN l.fornecedor_id IS NOT NULL AND f.id IS NULL THEN 'ERRO: Fornecedor inexistente' ELSE 'OK' END as fornecedor_check,
    CASE WHEN l.marca_id IS NOT NULL AND m.id IS NULL THEN 'ERRO: Marca inexistente' ELSE 'OK' END as marca_check,
    CASE WHEN l.grupo_canonico_id IS NOT NULL AND g.id IS NULL THEN 'ERRO: Grupo inexistente' ELSE 'OK' END as grupo_check
FROM lens_catalog.lentes l
LEFT JOIN core.fornecedores f ON l.fornecedor_id = f.id
LEFT JOIN lens_catalog.marcas m ON l.marca_id = m.id
LEFT JOIN lens_catalog.grupos_canonicos g ON l.grupo_canonico_id = g.id
WHERE l.ativo = true
LIMIT 10;

-- COLE O RESULTADO AQUI:
/*

| id                                   | nome_lente                                                | fornecedor_check | marca_check | grupo_check |
| ------------------------------------ | --------------------------------------------------------- | ---------------- | ----------- | ----------- |
| bae4ef86-565d-4006-8e62-d11e5184f111 | POLYLUX FREE FORM POLI BLUE FOTO INC                      | OK               | OK          | OK          |
| be9a819f-3d00-4f65-8dd5-6f4f82e8da1c | MULTI 1.59 TOP VIEW FF BLUE                               | OK               | OK          | OK          |
| e7c28e51-f2a7-4861-b024-f67b7357f9df | MULTI 1.59 TOP VIEW FF BLUE AR FAST SH                    | OK               | OK          | OK          |
| 5304665d-f7bd-4e52-bc98-d3bbf3fe38f4 | MULTI 1.59 TOP VIEW FF FOTO BLUE                          | OK               | OK          | OK          |
| 049dc0fa-5e02-42ce-89b9-ad94c5642cd4 | MULTI 1.59 TOP VIEW FF FOTO BLUE AR FAST SH               | OK               | OK          | OK          |
| bfa0f204-78f3-4a40-8b9c-e2a69582744c | MULTI 1.59 TOP VIEW FF BLUE AR FAST TI                    | OK               | OK          | OK          |
| 8e5a1c5e-7d26-40a5-9071-2094b4f361ed | MULTI 1.59 TOP VIEW FF FOTO BLUE AR FAST TI               | OK               | OK          | OK          |
| b2f095d0-8df7-4e55-952f-bfa6a6dbe20a | MULTIFOCAL CR AR (RESIDUAL VERDE)                         | OK               | OK          | OK          |
| e81bcfbe-6796-43be-85b5-a7b1354aef65 | MULTI 1.67 BLUE FREE FORM                                 | OK               | OK          | OK          |
| 179b53d9-98fb-4f2b-80b7-a1e4d764ad9e | MULTI 1.67 FREEVIEW SILVER TRANSITIONS CINZA AR FAST AZUL | OK               | OK          | OK          |

*/


-- ============================================================
-- ETAPA 7: TRIGGERS E FUNÇÕES
-- ============================================================

-- Query 7.1: Listar todos os triggers
SELECT 
    trigger_schema,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema IN ('lens_catalog', 'core', 'compras', 'public')
ORDER BY trigger_schema, event_object_table;

-- COLE O RESULTADO AQUI:
/*

| trigger_schema | trigger_name                       | event_object_table | action_timing | event_manipulation |
| -------------- | ---------------------------------- | ------------------ | ------------- | ------------------ |
| compras        | trg_pedido_itens_valor_total       | pedido_itens       | AFTER         | DELETE             |
| compras        | trg_pedido_itens_valor_total       | pedido_itens       | AFTER         | INSERT             |
| compras        | trg_pedido_itens_valor_total       | pedido_itens       | AFTER         | UPDATE             |
| compras        | trg_pedidos_updated_at             | pedidos            | BEFORE        | UPDATE             |
| compras        | trg_criar_movimentacao_recebimento | pedidos            | AFTER         | UPDATE             |
| core           | trg_fornecedores_updated_at        | fornecedores       | BEFORE        | UPDATE             |
| lens_catalog   | trg_grupos_auditoria               | grupos_canonicos   | AFTER         | UPDATE             |
| lens_catalog   | trg_grupos_auditoria               | grupos_canonicos   | AFTER         | INSERT             |
| lens_catalog   | trg_grupos_updated_at              | grupos_canonicos   | BEFORE        | UPDATE             |
| lens_catalog   | trg_grupos_auditoria               | grupos_canonicos   | AFTER         | DELETE             |
| lens_catalog   | trg_lentes_associar_grupo          | lentes             | BEFORE        | UPDATE             |
| lens_catalog   | trg_lentes_updated_at              | lentes             | BEFORE        | UPDATE             |
| lens_catalog   | trg_lentes_generate_slug           | lentes             | BEFORE        | INSERT             |
| lens_catalog   | trg_lentes_generate_slug           | lentes             | BEFORE        | UPDATE             |
| lens_catalog   | trg_lentes_atualizar_estatisticas  | lentes             | AFTER         | INSERT             |
| lens_catalog   | trg_lentes_atualizar_estatisticas  | lentes             | AFTER         | DELETE             |
| lens_catalog   | trg_lentes_atualizar_estatisticas  | lentes             | AFTER         | UPDATE             |
| lens_catalog   | trg_lentes_associar_grupo          | lentes             | BEFORE        | INSERT             |
| lens_catalog   | trg_canonicas_updated_at           | lentes_canonicas   | BEFORE        | UPDATE             |
| lens_catalog   | trg_marcas_updated_at              | marcas             | BEFORE        | UPDATE             |
| lens_catalog   | trg_premium_updated_at             | premium_canonicas  | BEFORE        | UPDATE             |

*/


-- Query 7.2: Listar todas as funções/procedures
SELECT 
    routine_schema,
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema IN ('lens_catalog', 'core', 'compras', 'public')
ORDER BY routine_schema, routine_name;

-- COLE O RESULTADO AQUI:
/*

| routine_schema | routine_name                        | routine_type | return_type |
| -------------- | ----------------------------------- | ------------ | ----------- |
| compras        | atualizar_valor_total_pedido        | FUNCTION     | trigger     |
| compras        | criar_movimentacao_recebimento      | FUNCTION     | trigger     |
| compras        | update_pedidos_timestamp            | FUNCTION     | trigger     |
| core           | update_fornecedores_timestamp       | FUNCTION     | trigger     |
| lens_catalog   | atualizar_estatisticas_grupo_manual | FUNCTION     | record      |
| lens_catalog   | fn_associar_lente_grupo_automatico  | FUNCTION     | trigger     |
| lens_catalog   | fn_atualizar_estatisticas_grupo     | FUNCTION     | trigger     |
| lens_catalog   | fn_auditar_grupos                   | FUNCTION     | trigger     |
| lens_catalog   | fn_criar_grupo_canonico_automatico  | FUNCTION     | uuid        |
| lens_catalog   | generate_lente_slug                 | FUNCTION     | trigger     |
| lens_catalog   | update_canonicas_timestamp          | FUNCTION     | trigger     |
| lens_catalog   | update_grupos_timestamp             | FUNCTION     | trigger     |
| lens_catalog   | update_lentes_timestamp             | FUNCTION     | trigger     |
| lens_catalog   | update_marcas_timestamp             | FUNCTION     | trigger     |
| lens_catalog   | update_premium_timestamp            | FUNCTION     | trigger     |
| lens_catalog   | validar_integridade_grupos          | FUNCTION     | record      |
| public         | buscar_lentes                       | FUNCTION     | record      |
| public         | obter_alternativas_lente            | FUNCTION     | record      |
| public         | unaccent                            | FUNCTION     | text        |
| public         | unaccent                            | FUNCTION     | text        |
| public         | unaccent_init                       | FUNCTION     | internal    |
| public         | unaccent_lexize                     | FUNCTION     | internal    |

*/


-- ============================================================
-- ETAPA 8: PERMISSÕES E RLS
-- ============================================================

-- Query 8.1: Verificar RLS ativado em cada tabela
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_ativo
FROM pg_tables
WHERE schemaname IN ('lens_catalog', 'core', 'compras', 'public')
ORDER BY schemaname, tablename;

-- COLE O RESULTADO AQUI:
/*

| schemaname   | tablename                   | rls_ativo |
| ------------ | --------------------------- | --------- |
| compras      | estoque_movimentacoes       | false     |
| compras      | estoque_saldo               | false     |
| compras      | historico_precos            | false     |
| compras      | pedido_itens                | false     |
| compras      | pedidos                     | false     |
| core         | fornecedores                | false     |
| lens_catalog | grupos_canonicos            | false     |
| lens_catalog | grupos_canonicos_backup_old | false     |
| lens_catalog | grupos_canonicos_log        | false     |
| lens_catalog | lentes                      | false     |
| lens_catalog | lentes_canonicas            | false     |
| lens_catalog | lentes_grupos_backup_old    | false     |
| lens_catalog | marcas                      | false     |
| lens_catalog | premium_canonicas           | false     |

*/


-- Query 8.2: Políticas RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname IN ('lens_catalog', 'core', 'compras', 'public')
ORDER BY schemaname, tablename;

-- COLE O RESULTADO AQUI:
/*

Success. No rows returned




*/


-- Query 8.3: Permissões da role 'anon' (frontend)
SELECT 
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'anon'
  AND table_schema IN ('lens_catalog', 'core', 'compras', 'public')
ORDER BY table_schema, table_name, privilege_type;

-- COLE O RESULTADO AQUI:
/*

| table_schema | table_name                       | privilege_type |
| ------------ | -------------------------------- | -------------- |
| lens_catalog | v_grupos_canonicos_detalhados_v5 | SELECT         |
| public       | v_filtros_disponiveis            | SELECT         |
| public       | v_filtros_grupos_canonicos       | SELECT         |
| public       | v_fornecedores_catalogo          | SELECT         |
| public       | v_grupos_canonicos_completos     | SELECT         |
| public       | v_grupos_melhor_margem           | SELECT         |
| public       | v_grupos_por_faixa_preco         | SELECT         |
| public       | v_grupos_por_receita_cliente     | SELECT         |
| public       | v_grupos_premium_marcas          | SELECT         |
| public       | v_sugestoes_upgrade              | SELECT         |

*/


-- ============================================================
-- ETAPA 9: QUERY COMPLEXA - TESTE DE INTEGRAÇÃO
-- ============================================================

-- Query 9.1: Join completo - Lente com todos os relacionamentos
SELECT 
    l.id,
    l.nome_lente,
    l.tipo_lente,
    l.material,
    l.indice_refracao,
    l.preco_custo,
    l.preco_venda_sugerido,
    f.nome as fornecedor,
    f.prazo_visao_simples,
    m.nome as marca,
    m.is_premium as marca_premium,
    g.nome_grupo,
    g.preco_medio as grupo_preco_medio,
    g.total_lentes as grupo_total_lentes
FROM lens_catalog.lentes l
LEFT JOIN core.fornecedores f ON l.fornecedor_id = f.id
LEFT JOIN lens_catalog.marcas m ON l.marca_id = m.id
LEFT JOIN lens_catalog.grupos_canonicos g ON l.grupo_canonico_id = g.id
WHERE l.ativo = true
LIMIT 5;

-- COLE O RESULTADO AQUI:
/*

| id                                   | nome_lente                                       | tipo_lente    | material | indice_refracao | preco_custo | preco_venda_sugerido | fornecedor | prazo_visao_simples | marca       | marca_premium | nome_grupo                                                                     | grupo_preco_medio | grupo_total_lentes |
| ------------------------------------ | ------------------------------------------------ | ------------- | -------- | --------------- | ----------- | -------------------- | ---------- | ------------------- | ----------- | ------------- | ------------------------------------------------------------------------------ | ----------------- | ------------------ |
| 517fa700-2dfe-4711-8f98-3322a639a4af | LENTE AC. 1.70 BLUE AR VERDE SUPER HIDROFOBICO   | visao_simples | CR39     | 1.50            | 320.00      | 1466.28              | Brascor    | 7                   | BRASCOR     | false         | Lente CR39 1.50 Visao Simples +UV +BlueLight [-24.00/-18.50 | 0.00/0.00]       | 1466.28           | 1                  |
| 03033eb5-a996-4251-99c7-5e61e412315c | 1.70 RESINA AR BLUE 1                            | visao_simples | CR39     | 1.50            | 190.00      | 957.87               | Polylux    | 7                   | POLYLUX     | false         | Lente CR39 1.50 Visao Simples +AR +UV +BlueLight [-18.00/-12.50 | -2.00/0.00]  | 957.87            | 1                  |
| 6714853d-347e-4985-8a14-5074970f4594 | VS HDI 1.49 FOTO                                 | visao_simples | CR39     | 1.50            | 540.00      | 2326.67              | So Blocos  | 7                   | SO BLOCOS   | false         | Lente CR39 1.50 Visao Simples +UV [-8.00/6.50 | -6.00/0.00]                    | 2683.87           | 9                  |
| caa41402-7141-4519-b276-b22eafa8254f | VS HDI 1.49 SLIM TRANSITIONS MARROM AR FAST      | visao_simples | CR39     | 1.50            | 1080.00     | 4438.54              | So Blocos  | 7                   | TRANSITIONS | true          | Lente CR39 1.50 Visao Simples +AR +UV +fotocromático [-8.00/6.50 | -6.00/0.00] | 4489.38           | 8                  |
| 9fa5ed95-0e10-47b8-a665-afd523628e3d | VS HDI 1.49 TRANSITIONS MARROM AR FAST AZUL      | visao_simples | CR39     | 1.50            | 1106.00     | 4540.22              | So Blocos  | 7                   | TRANSITIONS | true          | Lente CR39 1.50 Visao Simples +AR +UV +fotocromático [-8.00/6.50 | -6.00/0.00] | 4489.38           | 8                  |

*/


-- ============================================================
-- RESUMO FINAL DA FASE 2
-- ============================================================

-- Query Final: Resumo executivo
SELECT 
    'Total Lentes Ativas' as metrica,
    COUNT(*)::text as valor
FROM lens_catalog.lentes WHERE ativo = true

UNION ALL

SELECT 
    'Total Grupos Canônicos',
    COUNT(*)::text
FROM lens_catalog.grupos_canonicos

UNION ALL

SELECT 
    'Total Marcas Ativas',
    COUNT(*)::text
FROM lens_catalog.marcas WHERE ativo = true

UNION ALL

SELECT 
    'Total Fornecedores Ativos',
    COUNT(*)::text
FROM core.fornecedores WHERE ativo = true

UNION ALL

SELECT 
    'Preço Médio Lentes',
    'R$ ' || ROUND(AVG(preco_custo)::numeric, 2)::text
FROM lens_catalog.lentes WHERE ativo = true

UNION ALL

SELECT 
    'Grupos Premium (%)',
    ROUND(100.0 * COUNT(*) FILTER (WHERE is_premium = true) / COUNT(*), 1)::text || '%'
FROM lens_catalog.grupos_canonicos;

-- COLE O RESULTADO AQUI:
/*

| metrica                   | valor     |
| ------------------------- | --------- |
| Total Lentes Ativas       | 1411      |
| Total Grupos Canônicos    | 461       |
| Total Marcas Ativas       | 17        |
| Total Fornecedores Ativos | 11        |
| Preço Médio Lentes        | R$ 854.81 |
| Grupos Premium (%)        | 13.0%     |

*/


-- ============================================================
-- ✅ FASE 2 COMPLETA!
-- ============================================================
-- Com essas informações, terei tudo necessário para:
-- 1. Criar hooks corretos para acessar os dados
-- 2. Implementar o catálogo de vendas
-- 3. Integrar com o sistema DCL de compras
-- 4. Configurar permissões adequadas
-- ============================================================
