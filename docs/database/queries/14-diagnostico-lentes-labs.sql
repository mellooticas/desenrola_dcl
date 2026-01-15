-- ============================================================
-- DIAGNÓSTICO: Catálogo de Lentes + Mapeamento Laboratórios
-- ============================================================
-- Execute no Supabase SQL Editor e cole os resultados aqui
-- ============================================================

-- 1️⃣ Ver estrutura da view de grupos canônicos
-- ============================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'v_grupos_canonicos_completos'
ORDER BY ordinal_position;




-- Colar resultado aqui:


| column_name               | data_type                | is_nullable |
| ------------------------- | ------------------------ | ----------- |
| id                        | uuid                     | YES         |
| slug                      | text                     | YES         |
| nome_grupo                | text                     | YES         |
| tipo_lente                | USER-DEFINED             | YES         |
| material                  | USER-DEFINED             | YES         |
| indice_refracao           | USER-DEFINED             | YES         |
| tratamento_antirreflexo   | boolean                  | YES         |
| tratamento_antirrisco     | boolean                  | YES         |
| tratamento_uv             | boolean                  | YES         |
| tratamento_blue_light     | boolean                  | YES         |
| tratamento_fotossensiveis | text                     | YES         |
| total_lentes              | integer                  | YES         |
| preco_medio               | numeric                  | YES         |
| preco_minimo              | numeric                  | YES         |
| preco_maximo              | numeric                  | YES         |
| is_premium                | boolean                  | YES         |
| fornecedores_disponiveis  | jsonb                    | YES         |
| lentes_ativas_count       | bigint                   | YES         |
| peso                      | integer                  | YES         |
| created_at                | timestamp with time zone | YES         |
| updated_at                | timestamp with time zone | YES         |
| grau_esferico_min         | numeric                  | YES         |
| grau_esferico_max         | numeric                  | YES         |
| grau_cilindrico_min       | numeric                  | YES         |
| grau_cilindrico_max       | numeric                  | YES         |
| adicao_min                | numeric                  | YES         |
| adicao_max                | numeric                  | YES         |
| categoria_predominante    | USER-DEFINED             | YES         |
| total_marcas              | bigint                   | YES         |


-- 2️⃣ Ver exemplo de dados (primeiro registro)
-- ============================================================
SELECT * FROM public.v_grupos_canonicos_completos LIMIT 1;

-- Colar resultado aqui:


| id                                   | slug                                                                                      | nome_grupo                                                                                              | tipo_lente | material      | indice_refracao | tratamento_antirreflexo | tratamento_antirrisco | tratamento_uv | tratamento_blue_light | tratamento_fotossensiveis | total_lentes | preco_medio | preco_minimo | preco_maximo | is_premium | fornecedores_disponiveis                                                   | lentes_ativas_count | peso | created_at                    | updated_at                    | grau_esferico_min | grau_esferico_max | grau_cilindrico_min | grau_cilindrico_max | adicao_min | adicao_max | categoria_predominante | total_marcas |
| ------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------- | ------------- | --------------- | ----------------------- | --------------------- | ------------- | --------------------- | ------------------------- | ------------ | ----------- | ------------ | ------------ | ---------- | -------------------------------------------------------------------------- | ------------------- | ---- | ----------------------------- | ----------------------------- | ----------------- | ----------------- | ------------------- | ------------------- | ---------- | ---------- | ---------------------- | ------------ |
| 00d3b9c7-7cc4-4071-8067-e5d04fca8b08 | lente-159-multifocal-uv-bluelight-fotocrom-tico-esf-n6-00-6-00-cil-n4-00-0-00-add-100-350 | Lente POLICARBONATO 1.59 Multifocal +UV +BlueLight +fotocromático [-6.00/6.00 | -4.00/0.00 | 1.00/3.50] | multifocal | POLICARBONATO | 1.59            | false                   | false                 | true          | true                  | fotocromático             | 1            | 1610.98     | 1610.98      | 1610.98      | false      | [{"id":"3a0a8ad3-4c55-44a2-b9fa-232a9f2fdc21","nome":"Polylux","prazo":7}] | 1                   | 50   | 2025-12-20 03:13:41.517389+00 | 2025-12-20 04:33:31.658296+00 | -6.00             | 6.00              | -4.00               | 0.00                | 1.00       | 3.50       | economica              | 1            |


-- 3️⃣ Verificar tabela de fornecedores
-- ============================================================
SELECT 
    id,
    nome,
    ativo,
    created_at
FROM core.fornecedores
ORDER BY nome;

-- Colar resultado aqui:

| id                                   | nome                   | ativo | created_at                    |
| ------------------------------------ | ---------------------- | ----- | ----------------------------- |
| 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | Brascor                | true  | 2025-12-19 22:06:29.405712+00 |
| 43721f5b-4f4a-4a75-bb34-6e8b373c5948 | Braslentes             | true  | 2025-12-19 22:06:29.405712+00 |
| 8eb9498c-3d99-4d26-bb8c-e503f97ccf2c | Express                | true  | 2025-12-19 22:06:29.405712+00 |
| e4a24408-3d58-4fc7-a096-cf7140f4f248 | Galeria Florencio lj11 | true  | 2025-12-19 22:06:29.405712+00 |
| d90bebaf-e552-4cf0-a226-808c91bda73a | Kaizi Oculos Solares   | true  | 2025-12-19 22:06:29.405712+00 |
| c50ea6eb-a420-4cf7-8aa2-68aaeb41ac95 | Navarro Oculos         | true  | 2025-12-19 22:06:29.405712+00 |
| 3a0a8ad3-4c55-44a2-b9fa-232a9f2fdc21 | Polylux                | true  | 2025-12-19 22:06:29.405712+00 |
| 1d0b088f-dcb1-4179-9a18-5d67ce86c4b6 | Sao Paulo Acessorios   | true  | 2025-12-19 22:06:29.405712+00 |
| e1e1eace-11b4-4f26-9f15-620808a4a410 | So Blocos              | true  | 2025-12-19 22:06:29.405712+00 |
| d88018ac-ecae-4b38-b321-94babe5f85e3 | Style                  | true  | 2025-12-19 22:06:29.405712+00 |
| 199bae08-0217-4b70-b054-d3f0960b4a78 | Sygma                  | true  | 2025-12-19 22:06:29.405712+00 |



-- 4️⃣ Verificar tabela de laboratórios
-- ============================================================
SELECT 
    id,
    nome,
    ativo,
    created_at
FROM public.laboratorios
ORDER BY nome;

-- Colar resultado aqui:

Error: Failed to run sql query: ERROR: 42P01: relation "public.laboratorios" does not exist LINE 6: FROM public.laboratorios ^


-- 5️⃣ BUSCAR RELAÇÃO: Ver se existe campo que liga fornecedor → laboratório
-- ============================================================
-- Verificar se laboratorios tem fornecedor_id
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'laboratorios'
ORDER BY ordinal_position;

-- Colar resultado aqui:

Success. No rows returned



-- 6️⃣ Ver se fornecedores tem campo laboratorio_id
-- ============================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'core' 
  AND table_name = 'fornecedores'
ORDER BY ordinal_position;

-- Colar resultado aqui:

| column_name         | data_type                | is_nullable |
| ------------------- | ------------------------ | ----------- |
| id                  | uuid                     | NO          |
| nome                | text                     | NO          |
| razao_social        | text                     | YES         |
| cnpj                | character varying        | YES         |
| cep_origem          | character varying        | YES         |
| cidade_origem       | text                     | YES         |
| estado_origem       | character varying        | YES         |
| prazo_visao_simples | integer                  | YES         |
| prazo_multifocal    | integer                  | YES         |
| prazo_surfacada     | integer                  | YES         |
| prazo_free_form     | integer                  | YES         |
| frete_config        | jsonb                    | YES         |
| desconto_volume     | jsonb                    | YES         |
| ativo               | boolean                  | NO          |
| created_at          | timestamp with time zone | NO          |
| updated_at          | timestamp with time zone | NO          |
| deleted_at          | timestamp with time zone | YES         |

-- 7️⃣ Tentar encontrar relação pelo NOME (podem ter nomes similares)
-- ============================================================
SELECT 
    f.id as fornecedor_id,
    f.nome as fornecedor_nome,
    l.id as laboratorio_id,
    l.nome as laboratorio_nome,
    CASE 
        WHEN LOWER(f.nome) = LOWER(l.nome) THEN '✅ MATCH EXATO'
        WHEN LOWER(f.nome) LIKE '%' || LOWER(l.nome) || '%' THEN '⚠️ SIMILAR (lab in fornecedor)'
        WHEN LOWER(l.nome) LIKE '%' || LOWER(f.nome) || '%' THEN '⚠️ SIMILAR (fornecedor in lab)'
        ELSE '❌ SEM MATCH'
    END as relacao
FROM core.fornecedores f
CROSS JOIN public.laboratorios l
WHERE 
    LOWER(f.nome) = LOWER(l.nome)
    OR LOWER(f.nome) LIKE '%' || LOWER(l.nome) || '%'
    OR LOWER(l.nome) LIKE '%' || LOWER(f.nome) || '%'
ORDER BY relacao, f.nome;

-- Colar resultado aqui:

Error: Failed to run sql query: ERROR: 42P01: relation "public.laboratorios" does not exist LINE 13: CROSS JOIN public.laboratorios l ^



-- 8️⃣ Ver quantas lentes cada fornecedor tem
-- ============================================================
SELECT 
    f.id as fornecedor_id,
    f.nome as fornecedor_nome,
    COUNT(l.id) as total_lentes,
    MIN(l.preco_venda_sugerido) as preco_min,
    AVG(l.preco_venda_sugerido)::numeric(10,2) as preco_medio,
    MAX(l.preco_venda_sugerido) as preco_max
FROM core.fornecedores f
LEFT JOIN lens_catalog.lentes l ON l.fornecedor_id = f.id
GROUP BY f.id, f.nome
ORDER BY total_lentes DESC;

-- Colar resultado aqui:

| fornecedor_id                        | fornecedor_nome        | total_lentes | preco_min | preco_medio | preco_max |
| ------------------------------------ | ---------------------- | ------------ | --------- | ----------- | --------- |
| e1e1eace-11b4-4f26-9f15-620808a4a410 | So Blocos              | 1097         | 731.04    | 4305.53     | 9640.00   |
| 3a0a8ad3-4c55-44a2-b9fa-232a9f2fdc21 | Polylux                | 158          | 261.73    | 1177.12     | 6315.76   |
| 8eb9498c-3d99-4d26-bb8c-e503f97ccf2c | Express                | 84           | 250.00    | 852.27      | 4907.85   |
| 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | Brascor                | 58           | 264.86    | 599.37      | 1700.93   |
| 199bae08-0217-4b70-b054-d3f0960b4a78 | Sygma                  | 14           | 255.87    | 330.03      | 459.23    |
| d88018ac-ecae-4b38-b321-94babe5f85e3 | Style                  | 0            | null      | null        | null      |
| 1d0b088f-dcb1-4179-9a18-5d67ce86c4b6 | Sao Paulo Acessorios   | 0            | null      | null        | null      |
| c50ea6eb-a420-4cf7-8aa2-68aaeb41ac95 | Navarro Oculos         | 0            | null      | null        | null      |
| e4a24408-3d58-4fc7-a096-cf7140f4f248 | Galeria Florencio lj11 | 0            | null      | null        | null      |
| d90bebaf-e552-4cf0-a226-808c91bda73a | Kaizi Oculos Solares   | 0            | null      | null        | null      |
| 43721f5b-4f4a-4a75-bb34-6e8b373c5948 | Braslentes             | 0            | null      | null        | null      |

-- 9️⃣ Ver estrutura da tabela lentes (tem fornecedor_id?)
-- ============================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'lens_catalog' 
  AND table_name = 'lentes'
ORDER BY ordinal_position
LIMIT 20;

-- Colar resultado aqui:

| column_name               | data_type         | is_nullable |
| ------------------------- | ----------------- | ----------- |
| id                        | uuid              | NO          |
| fornecedor_id             | uuid              | NO          |
| marca_id                  | uuid              | YES         |
| grupo_canonico_id         | uuid              | YES         |
| nome_lente                | text              | NO          |
| nome_canonizado           | text              | YES         |
| slug                      | text              | YES         |
| sku                       | character varying | YES         |
| codigo_fornecedor         | character varying | YES         |
| tipo_lente                | USER-DEFINED      | NO          |
| material                  | USER-DEFINED      | NO          |
| indice_refracao           | USER-DEFINED      | NO          |
| categoria                 | USER-DEFINED      | NO          |
| tratamento_antirreflexo   | boolean           | NO          |
| tratamento_antirrisco     | boolean           | NO          |
| tratamento_uv             | boolean           | NO          |
| tratamento_blue_light     | boolean           | NO          |
| tratamento_fotossensiveis | USER-DEFINED      | YES         |
| diametro_mm               | integer           | YES         |
| curva_base                | numeric           | YES         |

-- 🔟 TESTE: Buscar uma lente específica com todos os dados
-- ============================================================
SELECT 
    l.id as lente_id,
    l.nome_lente,
    l.fornecedor_id,
    f.nome as fornecedor_nome,
    l.grupo_canonico_id,
    g.nome_grupo,
    l.preco_venda_sugerido,
    l.prazo_dias
FROM lens_catalog.lentes l
JOIN core.fornecedores f ON f.id = l.fornecedor_id
JOIN lens_catalog.grupos_canonicos g ON g.id = l.grupo_canonico_id
WHERE l.ativo = true
LIMIT 3;

-- Colar resultado aqui:

Error: Failed to run sql query: ERROR: 42703: column l.prazo_dias does not exist LINE 9: l.prazo_dias ^




-- ============================================================
-- 📝 RESPONDA ESTAS PERGUNTAS:
-- ============================================================
-- 1. Existe algum campo que liga fornecedor_id → laboratorio_id?
--    Resposta: 

-- 2. Os nomes dos fornecedores são parecidos com os laboratórios?
--    Resposta: 

-- 3. Quantos fornecedores têm lentes cadastradas?
--    Resposta: 

-- 4. A view v_grupos_canonicos_completos existe e tem dados?
--    Resposta: 
