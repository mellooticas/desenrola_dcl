-- ============================================================
-- 🔍 QUERIES CORRIGIDAS - Serviços e Acessórios
-- Data: 23/01/2026
-- View: vw_estoque_completo (mesma das armações)
-- ============================================================

-- QUERY 1: Ver todos os 15 serviços disponíveis
-- ============================================================
SELECT 
    produto_id,
    sku_visual,
    descricao,
    tipo_produto,
    preco_venda,
    custo,
    ativo,
    loja_id
FROM public.vw_estoque_completo
WHERE tipo_produto = 'servico'
  AND ativo = true
ORDER BY descricao;

| produto_id                           | sku_visual | descricao                   | tipo_produto | preco_venda | custo | ativo | loja_id |
| ------------------------------------ | ---------- | --------------------------- | ------------ | ----------- | ----- | ----- | ------- |
| ca94ffb6-9980-4ce2-9312-fadc2979114d | MO259128   | Ajuste de Armação           | servico      | 10.00       | 0.00  | true  | null    |
| 82eab4f0-6fd7-46ad-8bc7-01711b0c01d5 | MO739936   | Ajuste de Receita           | servico      | 50.00       | 15.00 | true  | null    |
| e0df200e-f430-4815-822e-c16957d48e16 | MO704744   | Avaliação Completa de Visão | servico      | 80.00       | 20.00 | true  | null    |
| 400f3110-baff-489c-9b22-e6c67694e51b | MO864967   | Avaliação para Progressivas | servico      | 30.00       | 10.00 | true  | null    |
| c0c7cd2b-c2ee-42fc-b709-3491ab446b46 | MO593400   | Limpeza Profunda            | servico      | 15.00       | 3.00  | true  | null    |
| 932eece3-e7d1-4dfe-9f6e-de183061e6b5 | MO856668   | Limpeza Ultrassônica        | servico      | 20.00       | 5.00  | true  | null    |
| 22be3249-8473-4025-91ed-46283f5dc6b2 | MO434905   | Montagem de Lente Bifocal   | servico      | 40.00       | 15.00 | true  | null    |
| 0f9a214d-21f6-4233-995b-ab85ff6acca4 | MO254617   | Montagem de Lentes          | servico      | 30.00       | 10.00 | true  | null    |
| 8f9bc10d-5ccc-4747-a8dc-26a0f8ff1655 | MO481656   | Montagem Express (1h)       | servico      | 25.00       | 8.00  | true  | null    |
| 1f88b0ea-ea1e-4b55-9f86-964aaf65b279 | MO086572   | Polimento de Lentes         | servico      | 40.00       | 15.00 | true  | null    |
| 66f0d106-2dee-4ac4-b544-95d9b70abe01 | MO675548   | Solda de Armação            | servico      | 45.00       | 20.00 | true  | null    |
| 7c3fc7a8-dceb-4da1-b4be-7b6f5c8d60e2 | MO253731   | Substituição de Aro         | servico      | 75.00       | 35.00 | true  | null    |
| 1cdd7523-7c43-410c-8501-b148fbc108d1 | MO135411   | Troca de Hastes             | servico      | 35.00       | 15.00 | true  | null    |
| 37c7a34f-d464-434a-8467-3d0293990bd2 | MO882522   | Troca de Parafusos          | servico      | 8.00        | 2.00  | true  | null    |
| afd8a88f-a0c9-458b-a1c2-e1be8640f1ce | MO345377   | Troca de Plaquetas/Nasais   | servico      | 20.00       | 8.00  | true  | null    |



-- QUERY 2: Buscar especificamente serviços de "montagem"
-- ============================================================
SELECT 
    produto_id,
    sku_visual,
    descricao,
    preco_venda,
    custo,
    loja_id
FROM public.vw_estoque_completo
WHERE tipo_produto = 'servico'
  AND ativo = true
  AND (
    LOWER(descricao) LIKE '%montag%'
    OR LOWER(sku_visual) LIKE '%montag%'
  )
ORDER BY descricao;

| produto_id                           | sku_visual | descricao                 | preco_venda | custo | loja_id |
| ------------------------------------ | ---------- | ------------------------- | ----------- | ----- | ------- |
| 22be3249-8473-4025-91ed-46283f5dc6b2 | MO434905   | Montagem de Lente Bifocal | 40.00       | 15.00 | null    |
| 0f9a214d-21f6-4233-995b-ab85ff6acca4 | MO254617   | Montagem de Lentes        | 30.00       | 10.00 | null    |
| 8f9bc10d-5ccc-4747-a8dc-26a0f8ff1655 | MO481656   | Montagem Express (1h)     | 25.00       | 8.00  | null    |


-- QUERY 3: Ver estrutura completa da view servicos
-- ============================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'servicos'
ORDER BY ordinal_position;

| column_name             | data_type                   | is_nullable |
| ----------------------- | --------------------------- | ----------- |
| id                      | uuid                        | YES         |
| pedido_lente_id         | uuid                        | YES         |
| prestador_id            | uuid                        | YES         |
| tipo_servico            | text                        | YES         |
| data_envio              | date                        | YES         |
| data_prevista_conclusao | date                        | YES         |
| data_real_conclusao     | date                        | YES         |
| status                  | text                        | YES         |
| observacoes             | text                        | YES         |
| valor_cobrado           | numeric                     | YES         |
| data_pagamento          | date                        | YES         |
| created_at              | timestamp without time zone | YES         |


-- QUERY 4: Ver conteúdo da view servicos (se existir)
-- ============================================================
SELECT *
FROM public.servicos
LIMIT 10;

Success. No rows returned



-- QUERY 5: Buscar produtos tipo NULL que podem ser acessórios
-- ============================================================
SELECT 
    produto_id,
    sku_visual,
    descricao,
    tipo_produto,
    preco_venda,
    custo
FROM public.vw_estoque_completo
WHERE ativo = true
  AND tipo_produto IS NULL
  AND (
    LOWER(descricao) LIKE '%estojo%'
    OR LOWER(descricao) LIKE '%cordao%'
    OR LOWER(descricao) LIKE '%cordão%'
    OR LOWER(descricao) LIKE '%limpeza%'
    OR LOWER(descricao) LIKE '%solucao%'
    OR LOWER(descricao) LIKE '%solução%'
    OR LOWER(descricao) LIKE '%flanela%'
    OR LOWER(descricao) LIKE '%pano%'
  )
ORDER BY descricao
LIMIT 30;


| produto_id                           | sku_visual | descricao                                           | tipo_produto | preco_venda | custo |
| ------------------------------------ | ---------- | --------------------------------------------------- | ------------ | ----------- | ----- |
| 5f720745-b445-4920-92df-939325e58bc2 | MO687729   | MELLO INFINITY Estojos Branco com Dourado           | null         | 12.25       | 2.50  |
| 57a1a499-2aff-4068-b6d9-1801a47144f3 | MO344794   | MELLO INFINITY Estojos Cinza IMA                    | null         | 31.85       | 6.5   |
| 3eb53146-37fb-4e1b-a3f1-9f5fa43abf06 | MO524619   | MELLO INFINITY Estojos Preto                        | null         | 12.25       | 2.50  |
| 40b9c08a-7f7f-4aa7-9050-facd38f56c8f | MO356766   | MELLO INFINITY Estojos Preto                        | null         | 12.25       | 2.50  |
| 499c959b-2cf9-4d5f-aa9c-61e554def7f9 | MO959581   | MELLO INFINITY Estojos Preto IMA                    | null         | 31.85       | 6.5   |
| fb0a5beb-9ab4-4afb-9faf-307eccf9c6b0 | MO498725   | MELLO INFINITY Estojos Preto IMS2                   | null         | 31.85       | 6.5   |
| e23204da-8b55-444a-8950-eeddb2d5c7f1 | MO984704   | MELLO INFINITY Flanelas Pequenas Branco com Dourado | null         | 2.30        | 0.47  |
| dadc7eb3-0ba9-4a32-9746-7c081c8f3917 | MO813355   | MELLO INFINITY Flanelas Pequenas Cinza              | null         | 19.60       | 4.00  |
| 87ac73ab-7c38-4aa7-a8f5-c01523552edb | MO101063   | MELLO INFINITY Flanelas Pequenas SEM COR            | null         | 19.50       | 3.98  |
| 1f4dc02d-9f61-472b-bbdb-25df0c3f9c70 | MO092705   | MELLO INFINITY Kits de Limpeza Cinza                | null         | 22.05       | 4.50  |
| 6ae618cc-0c03-4fcc-b6e5-6eed3e97f1f8 | MO352494   | MELLO INFINITY Sprays de Limpeza SEM COR            | null         | 9.80        | 2.00  |

-- QUERY 6: Ver amostra de produtos tipo NULL (podem ser acessórios não categorizados)
-- ============================================================
SELECT 
    produto_id,
    sku_visual,
    descricao,
    tipo_produto,
    preco_venda,
    custo,
    quantidade_atual
FROM public.vw_estoque_completo
WHERE ativo = true
  AND tipo_produto IS NULL
ORDER BY descricao
LIMIT 20;

| produto_id                           | sku_visual | descricao                                                              | tipo_produto | preco_venda | custo  | quantidade_atual |
| ------------------------------------ | ---------- | ---------------------------------------------------------------------- | ------------ | ----------- | ------ | ---------------- |
| 0ebcd66b-1cb0-45af-99a7-9050cdd916bf | MO400769   | ADIDAS OVAL Preto SP5031 C1 49-19-145                                  | null         | 592.50      | 79.00  | 0                |
| 665e89ec-2ba4-49a9-8fb5-ee7dbcc4975f | MO512868   | ANA HICKMANN CLÁSSICO Animal Print LH1011 COL6 53-16-140               | null         | 652.80      | 64.00  | 0                |
| c75251fd-5203-4c87-9dd5-a25bd30f3455 | MO601688   | ANA HICKMANN CLÁSSICO Animal Print TR5086 C4 55-16-140                 | null         | 652.80      | 64.00  | 0                |
| aa2d0fc2-c5d6-46ea-9232-8b86e59da255 | MO204785   | ANA HICKMANN CLÁSSICO Preto TR5086 C7 55-16-140                        | null         | 652.80      | 64.00  | 0                |
| be7bed9f-7bd3-4c1a-88b2-701442f56a13 | MO118697   | ANA HICKMANN CLÁSSICO Vermelho LH1054 C4 52-20-145                     | null         | 652.80      | 64.00  | 0                |
| ab9f3bcc-3c4e-446f-810b-012173d3cdab | MO391628   | ANA HICKMANN OVAL Preto LH1054 C1 52-20-145                            | null         | 652.80      | 64.00  | 0                |
| 9d79b338-0c93-4799-bb9d-4ba8835c4d40 | MO895644   | ANA HICKMANN RETANGULAR Marrom 2888 XF                                 | null         | 458.90      | 44.99  | 0                |
| 9d58b0f3-14d5-46e3-8323-5529eb1c6fab | MO063245   | CAMBRIDGE CAT EYE Preto RHSO-F2012B C1 55-17-145                       | null         | 504.00      | 112    | 0                |
| 4d62c811-ae2d-40a2-8585-a7c0affa2313 | MO887072   | CAMBRIDGE QUADRADO Animal Print SX2205 C4 53-18-145-C4                 | null         | 360.00      | 80     | 0                |
| f91d257d-5248-4b91-bb6c-5a61c63577c2 | MO036663   | CARMEN VITTI ARREDONDADO Rose Gold CV0291 C2 51-18-138 C2              | null         | 650.25      | 144.50 | 0                |
| eed73bc8-97ec-4aae-b93a-3105e560dca9 | MO940922   | FOX FIO DE NYLON Prata FOX351 C4 55-18-140-C4                          | null         | 540.00      | 120    | 1                |
| 92c195b0-8ac7-45ff-b213-554bbcc8adc4 | MO356873   | FOX QUADRADO Preto FOX294 C1 56-17-140-C1                              | null         | 580.50      | 129    | 0                |
| b196acb2-8995-4938-b11c-aee309b55ea9 | MO041360   | GATTI RETANGULAR Cinza FD8903 C3                                       | null         | 167.20      | 19     | 0                |
| 3628c60a-8257-4e87-85ef-09e993ab89f1 | MO850295   | MELLO 3 Peças / Balgriff Animal Print com Dourado SL75933 C4 54-18-140 | null         | 218.00      | 20     | 0                |
| 371a67eb-8e68-4390-bee2-7963261d42f5 | MO112511   | MELLO 3 Peças / Balgriff Animal Print ISA16001 C1 56-16-142-C1         | null         | 196.20      | 18     | 1                |
| 371a67eb-8e68-4390-bee2-7963261d42f5 | MO112511   | MELLO 3 Peças / Balgriff Animal Print ISA16001 C1 56-16-142-C1         | null         | 196.20      | 18     | 2                |
| 6feafe67-f368-4076-a9df-e2a6293309e8 | MO033365   | MELLO 3 Peças / Balgriff Dourado JC6808 C4 55-16-140                   | null         | 218.00      | 20     | 0                |
| bc8d4011-4d47-4465-95ec-28b12138d280 | MO235154   | MELLO 3 Peças / Balgriff Dourado SL1229 C5 56-18-140-C5                | null         | 218.00      | 20     | 0                |
| 6e06e72f-38d3-4547-b049-7a43e070a2e5 | MO140644   | MELLO 3 Peças / Balgriff Dourado SL1319 C1 54-18-145-C1                | null         | 218.00      | 20     | 0                |
| 3929d21c-fe36-4025-8c06-aaa753622d77 | MO057105   | MELLO 3 Peças / Balgriff Prata JC9473 C5 54-18-145-C5                  | null         | 196.20      | 18     | 0                |


-- QUERY 7: Buscar se existe tabela de descontos
-- ============================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'descontos_produto'
ORDER BY ordinal_position;

| column_name | data_type                   | is_nullable |
| ----------- | --------------------------- | ----------- |
| id          | uuid                        | YES         |
| nome        | text                        | YES         |
| percentual  | numeric                     | YES         |
| ativo       | boolean                     | YES         |
| created_at  | timestamp without time zone | YES         |


-- QUERY 8: Ver estrutura de itens_venda para entender tipo_item
-- ============================================================
SELECT DISTINCT
    tipo_item,
    COUNT(*) as total_itens
FROM public.itens_venda
GROUP BY tipo_item
ORDER BY total_itens DESC;

Success. No rows returned




-- QUERY 9: Estatísticas por tipo de produto
-- ============================================================
SELECT 
    COALESCE(tipo_produto, 'SEM_TIPO') as tipo,
    COUNT(*) as total_produtos,
    COUNT(DISTINCT loja_id) as lojas_diferentes,
    MIN(preco_venda) as preco_min,
    MAX(preco_venda) as preco_max,
    ROUND(AVG(preco_venda), 2) as preco_medio,
    SUM(quantidade_atual) as qtd_total_estoque
FROM public.vw_estoque_completo
WHERE ativo = true
GROUP BY tipo_produto
ORDER BY total_produtos DESC;


| tipo     | total_produtos | lojas_diferentes | preco_min | preco_max | preco_medio | qtd_total_estoque |
| -------- | -------------- | ---------------- | --------- | --------- | ----------- | ----------------- |
| SEM_TIPO | 793            | 2                | 2.30      | 652.80    | 196.49      | 440               |
| armacao  | 531            | 2                | 17.15     | 627.75    | 210.39      | 422               |
| servico  | 15             | 0                | 8.00      | 80.00     | 34.87       | 0                 |


-- QUERY 10: Buscar produtos com preço baixo (possíveis serviços)
-- ============================================================
SELECT 
    produto_id,
    sku_visual,
    descricao,
    tipo_produto,
    preco_venda,
    custo
FROM public.vw_estoque_completo
WHERE ativo = true
  AND preco_venda < 100
  AND tipo_produto IS NOT NULL
ORDER BY preco_venda, descricao
LIMIT 30;

| produto_id                           | sku_visual | descricao                                  | tipo_produto | preco_venda | custo |
| ------------------------------------ | ---------- | ------------------------------------------ | ------------ | ----------- | ----- |
| 37c7a34f-d464-434a-8467-3d0293990bd2 | MO882522   | Troca de Parafusos                         | servico      | 8.00        | 2.00  |
| ca94ffb6-9980-4ce2-9312-fadc2979114d | MO259128   | Ajuste de Armação                          | servico      | 10.00       | 0.00  |
| c0c7cd2b-c2ee-42fc-b709-3491ab446b46 | MO593400   | Limpeza Profunda                           | servico      | 15.00       | 3.00  |
| 5febad85-b535-485c-b4fb-b0b1e4a30308 | MO447529   | MELLO INFINITY Estojos Cinza BOLSA         | armacao      | 17.15       | 3.5   |
| 5febad85-b535-485c-b4fb-b0b1e4a30308 | MO447529   | MELLO INFINITY Estojos Cinza BOLSA         | armacao      | 17.15       | 3.5   |
| 932eece3-e7d1-4dfe-9f6e-de183061e6b5 | MO856668   | Limpeza Ultrassônica                       | servico      | 20.00       | 5.00  |
| afd8a88f-a0c9-458b-a1c2-e1be8640f1ce | MO345377   | Troca de Plaquetas/Nasais                  | servico      | 20.00       | 8.00  |
| cf45c9a2-7fa1-4b55-9000-38876cb42dd3 | MO876368   | MELLO CLIP ON Preto JC1199 C4 54-18-142-C4 | armacao      | 21.80       | 2     |
| 826470bd-209c-47c3-943b-a15cc92d0572 | MO990525   | MELLO INFINITY Estojos Cinza CARTEIRA      | armacao      | 22          | 4.49  |
| 826470bd-209c-47c3-943b-a15cc92d0572 | MO990525   | MELLO INFINITY Estojos Cinza CARTEIRA      | armacao      | 22          | 4.49  |
| ed5d2551-7178-487b-9409-484741a073c8 | MO758078   | MELLO INFINITY Estojos Dourado CARTEIRA    | armacao      | 22.05       | 4.5   |
| ed5d2551-7178-487b-9409-484741a073c8 | MO758078   | MELLO INFINITY Estojos Dourado CARTEIRA    | armacao      | 22.05       | 4.5   |
| ed5d2551-7178-487b-9409-484741a073c8 | MO758078   | MELLO INFINITY Estojos Dourado CARTEIRA    | armacao      | 22.05       | 4.5   |
| ed5d2551-7178-487b-9409-484741a073c8 | MO758078   | MELLO INFINITY Estojos Dourado CARTEIRA    | armacao      | 22.05       | 4.5   |
| 500f9f64-b285-4459-9e01-b81fcd88d325 | MO209132   | MELLO INFINITY Estojos Tiffany CARTEIRA    | armacao      | 22.05       | 4.5   |
| 500f9f64-b285-4459-9e01-b81fcd88d325 | MO209132   | MELLO INFINITY Estojos Tiffany CARTEIRA    | armacao      | 22.05       | 4.5   |
| 8d9ec8bb-38a4-4458-8d2c-7973ddfc4fb3 | MO467581   | MELLO INFINITY Cordinhas Chumbo CORD 03    | armacao      | 24.50       | 5     |
| 68131c06-ddd5-4ad0-801b-55e2aba67cd0 | MO266536   | MELLO INFINITY Cordinhas Dourado CORD 01   | armacao      | 24.50       | 5     |
| d0947d13-539d-478e-944f-2fa9129d4a7e | MO563373   | MELLO INFINITY Cordinhas Preto CORD 04     | armacao      | 24.50       | 5     |
| 8f9bc10d-5ccc-4747-a8dc-26a0f8ff1655 | MO481656   | Montagem Express (1h)                      | servico      | 25.00       | 8.00  |
| 400f3110-baff-489c-9b22-e6c67694e51b | MO864967   | Avaliação para Progressivas                | servico      | 30.00       | 10.00 |
| 0f9a214d-21f6-4233-995b-ab85ff6acca4 | MO254617   | Montagem de Lentes                         | servico      | 30.00       | 10.00 |
| 1cdd7523-7c43-410c-8501-b148fbc108d1 | MO135411   | Troca de Hastes                            | servico      | 35.00       | 15.00 |
| 22be3249-8473-4025-91ed-46283f5dc6b2 | MO434905   | Montagem de Lente Bifocal                  | servico      | 40.00       | 15.00 |
| 1f88b0ea-ea1e-4b55-9f86-964aaf65b279 | MO086572   | Polimento de Lentes                        | servico      | 40.00       | 15.00 |
| 66f0d106-2dee-4ac4-b544-95d9b70abe01 | MO675548   | Solda de Armação                           | servico      | 45.00       | 20.00 |
| 82eab4f0-6fd7-46ad-8bc7-01711b0c01d5 | MO739936   | Ajuste de Receita                          | servico      | 50.00       | 15.00 |
| 7c3fc7a8-dceb-4da1-b4be-7b6f5c8d60e2 | MO253731   | Substituição de Aro                        | servico      | 75.00       | 35.00 |
| e0df200e-f430-4815-822e-c16957d48e16 | MO704744   | Avaliação Completa de Visão                | servico      | 80.00       | 20.00 |
| 778de923-5bee-4622-8e5b-ae66cc3190f6 | MO930285   | OL RETANGULAR Marrom 18198                 | armacao      | 87.5        | 7     |


