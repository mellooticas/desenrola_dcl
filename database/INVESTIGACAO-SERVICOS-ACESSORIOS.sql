-- ============================================================
-- 🔍 INVESTIGAÇÃO: Serviços e Acessórios - CRM_ERP
-- Objetivo: Mapear produtos de serviços e acessórios disponíveis
-- Data: 23/01/2026
-- ============================================================

-- QUERY 1: Descobrir tabelas de produtos/serviços
-- ============================================================
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN tablename ILIKE '%produto%' THEN 'Produto'
        WHEN tablename ILIKE '%servico%' THEN 'Serviço'
        WHEN tablename ILIKE '%acessorio%' THEN 'Acessório'
        WHEN tablename ILIKE '%estoque%' THEN 'Estoque'
        ELSE 'Outro'
    END as categoria
FROM pg_tables
WHERE schemaname IN ('public', 'core')
  AND (
    tablename ILIKE '%produto%' 
    OR tablename ILIKE '%servico%'
    OR tablename ILIKE '%acessorio%'
    OR tablename ILIKE '%estoque%'
    OR tablename ILIKE '%item%'
  )
ORDER BY categoria, schemaname, tablename;

| schemaname | tablename       | categoria |
| ---------- | --------------- | --------- |
| public     | estoque_alertas | Estoque   |


-- QUERY 2: Descobrir views de produtos/serviços
-- ============================================================
SELECT 
    schemaname,
    viewname,
    CASE 
        WHEN viewname ILIKE '%produto%' THEN 'Produto'
        WHEN viewname ILIKE '%servico%' THEN 'Serviço'
        WHEN viewname ILIKE '%acessorio%' THEN 'Acessório'
        WHEN viewname ILIKE '%estoque%' THEN 'Estoque'
        ELSE 'Outro'
    END as categoria
FROM pg_views
WHERE schemaname IN ('public', 'core')
  AND (
    viewname ILIKE '%produto%' 
    OR viewname ILIKE '%servico%'
    OR viewname ILIKE '%acessorio%'
    OR viewname ILIKE '%estoque%'
    OR viewname ILIKE '%item%'
  )
ORDER BY categoria, schemaname, viewname;

| schemaname | viewname                      | categoria |
| ---------- | ----------------------------- | --------- |
| public     | estoque_configuracoes         | Estoque   |
| public     | estoque_lentes                | Estoque   |
| public     | estoque_movimentacoes         | Estoque   |
| public     | estoque_notificacoes          | Estoque   |
| public     | lentes_estoque_movimentacoes  | Estoque   |
| public     | view_armacoes_com_estoque     | Estoque   |
| public     | view_estoque_armacoes         | Estoque   |
| public     | view_estoque_lentes_lotes     | Estoque   |
| public     | view_estoque_total            | Estoque   |
| public     | vw_alertas_estoque_ativos     | Estoque   |
| public     | vw_alertas_estoque_historico  | Estoque   |
| public     | vw_alertas_estoque_por_loja   | Estoque   |
| public     | vw_categorias_valor_estoque   | Estoque   |
| public     | vw_concentracao_estoque       | Estoque   |
| public     | vw_configuracoes_estoque_loja | Estoque   |
| public     | vw_dashboard_estoque          | Estoque   |
| public     | vw_dashboard_estoque_lentes   | Estoque   |
| public     | vw_estoque_atual              | Estoque   |
| public     | vw_estoque_completo           | Estoque   |
| public     | vw_estoque_consolidado        | Estoque   |
| public     | vw_estoque_dashboard          | Estoque   |
| public     | vw_estoque_ecommerce          | Estoque   |
| public     | vw_estoque_lentes_atual       | Estoque   |
| public     | vw_estoque_lentes_completo    | Estoque   |
| public     | vw_estoque_lentes_jit         | Estoque   |
| public     | vw_estoque_lentes_por_loja    | Estoque   |
| public     | vw_estoque_por_loja           | Estoque   |
| public     | vw_estoque_precos_lentes      | Estoque   |
| public     | vw_giro_estoque               | Estoque   |
| public     | vw_giro_estoque_por_loja      | Estoque   |
| public     | vw_hook_alertas_estoque       | Estoque   |
| public     | vw_hook_useestoque            | Estoque   |
| public     | vw_lojas_ativas_estoque       | Estoque   |
| public     | vw_performance_estoque_lojas  | Estoque   |
| public     | vw_resumo_giro_estoque        | Estoque   |
| public     | vw_tendencias_estoque_30_dias | Estoque   |
| public     | descontos_produto             | Produto   |
| public     | estoque_produto               | Produto   |
| public     | etiquetas_produto             | Produto   |
| public     | imagens_produto               | Produto   |
| public     | produto_fornecedores          | Produto   |
| public     | produtos                      | Produto   |
| public     | view_lucro_produtos           | Produto   |
| public     | vw_estoque_produto            | Produto   |
| public     | vw_produtos                   | Produto   |
| public     | vw_produtos_baixo_giro        | Produto   |
| public     | vw_produtos_completos         | Produto   |
| public     | vw_produtos_criticos_alertas  | Produto   |
| public     | vw_produtos_criticos_ranking  | Produto   |
| public     | vw_produtos_ecommerce         | Produto   |
| public     | vw_produtos_orfaos_resolucao  | Produto   |
| public     | vw_produtos_sem_movimento     | Produto   |
| public     | vw_produtos_top_giro          | Produto   |
| public     | prestadores_servicos          | Serviço   |
| public     | servicos                      | Serviço   |
| public     | view_pdv_ordens_servico       | Serviço   |


-- QUERY 3: Verificar se existe coluna tipo_produto
-- ============================================================
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema IN ('public', 'core')
  AND column_name IN ('tipo_produto', 'categoria_produto', 'tipo_item')
ORDER BY table_schema, table_name;

| table_schema | table_name          | column_name  | data_type         | is_nullable |
| ------------ | ------------------- | ------------ | ----------------- | ----------- |
| public       | itens_venda         | tipo_item    | character varying | YES         |
| public       | vw_estoque_completo | tipo_produto | text              | YES         |

-- QUERY 4: Ver estrutura da tabela itens_venda (se existir)
-- ============================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'itens_venda'
ORDER BY ordinal_position;


| column_name          | data_type                   | is_nullable | column_default |
| -------------------- | --------------------------- | ----------- | -------------- |
| id                   | integer                     | YES         | null           |
| venda_id             | integer                     | YES         | null           |
| tipo_item            | character varying           | YES         | null           |
| produto_id           | uuid                        | YES         | null           |
| lente_id             | uuid                        | YES         | null           |
| prescricao_id        | integer                     | YES         | null           |
| quantidade           | integer                     | YES         | null           |
| valor_unitario       | numeric                     | YES         | null           |
| valor_total          | numeric                     | YES         | null           |
| descricao            | text                        | YES         | null           |
| codigo               | character varying           | YES         | null           |
| com_garantia         | boolean                     | YES         | null           |
| observacoes_garantia | text                        | YES         | null           |
| created_at           | timestamp without time zone | YES         | null           |



-- QUERY 5: Buscar valores únicos de tipo_produto
-- ============================================================
-- (Execute apenas se itens_venda existir)
SELECT DISTINCT
    tipo_produto,
    COUNT(*) as total_registros
FROM public.itens_venda
GROUP BY tipo_produto
ORDER BY total_registros DESC;

Error: Failed to run sql query: ERROR: 42703: column "tipo_produto" does not exist LINE 7: tipo_produto, ^





-- QUERY 6: Ver estrutura de vw_estoque_completo
-- ============================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'vw_estoque_completo'
ORDER BY ordinal_position;


| column_name      | data_type | is_nullable |
| ---------------- | --------- | ----------- |
| produto_id       | uuid      | YES         |
| sku              | text      | YES         |
| sku_visual       | text      | YES         |
| descricao        | text      | YES         |
| tipo_produto     | text      | YES         |
| categoria_id     | uuid      | YES         |
| custo            | numeric   | YES         |
| preco_venda      | numeric   | YES         |
| codigo_barras    | text      | YES         |
| loja_id          | uuid      | YES         |
| quantidade_atual | integer   | YES         |
| nivel_critico    | integer   | YES         |
| nivel_ideal      | integer   | YES         |
| ativo            | boolean   | YES         |
| status_estoque   | text      | YES         |

-- QUERY 7: Tipos de produtos no estoque
-- ============================================================
-- (Execute se vw_estoque_completo existir)
SELECT 
    tipo_produto,
    COUNT(*) as total_produtos,
    COUNT(DISTINCT sku_visual) as total_skus,
    MIN(preco_venda) as preco_min,
    MAX(preco_venda) as preco_max,
    AVG(preco_venda) as preco_medio
FROM public.vw_estoque_completo
WHERE ativo = true
GROUP BY tipo_produto
ORDER BY total_produtos DESC;

| tipo_produto | total_produtos | total_skus | preco_min | preco_max | preco_medio          |
| ------------ | -------------- | ---------- | --------- | --------- | -------------------- |
| null         | 793            | 736        | 2.30      | 652.80    | 196.4948415716096324 |
| armacao      | 531            | 445        | 17.15     | 627.75    | 210.3925988700564972 |
| servico      | 15             | 15         | 8.00      | 80.00     | 34.8666666666666667  |


-- QUERY 8: Amostra de serviços (se houver)
-- ============================================================
SELECT 
    id,
    sku_visual,
    descricao,
    tipo_produto,
    categoria,
    preco_venda,
    preco_custo,
    ativo
FROM public.vw_estoque_completo
WHERE tipo_produto ILIKE '%servico%'
   OR tipo_produto ILIKE '%montagem%'
   OR categoria ILIKE '%servico%'
LIMIT 20;


Error: Failed to run sql query: ERROR: 42703: column "id" does not exist LINE 6: id, ^




-- QUERY 9: Amostra de acessórios (se houver)
-- ============================================================
SELECT 
    id,
    sku_visual,
    descricao,
    tipo_produto,
    categoria,
    preco_venda,
    preco_custo,
    ativo
FROM public.vw_estoque_completo
WHERE tipo_produto ILIKE '%acessorio%'
   OR categoria ILIKE '%acessorio%'
   OR descricao ILIKE '%estojo%'
   OR descricao ILIKE '%cordao%'
   OR descricao ILIKE '%limpeza%'
   OR descricao ILIKE '%solucao%'
LIMIT 20;


Error: Failed to run sql query: ERROR: 42703: column "id" does not exist LINE 5: id, ^




-- QUERY 10: Buscar tabela de serviços específica
-- ============================================================
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema IN ('public', 'core')
  AND (
    table_name ILIKE '%servico%'
    OR table_name ILIKE '%montagem%'
  )
ORDER BY table_schema, table_name;

| table_schema | table_name              | table_type |
| ------------ | ----------------------- | ---------- |
| public       | prestadores_servicos    | VIEW       |
| public       | servicos                | VIEW       |
| public       | view_pdv_ordens_servico | VIEW       |


-- QUERY 11: Verificar campos de desconto em produtos
-- ============================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'vw_estoque_completo'
  AND (
    column_name ILIKE '%desconto%'
    OR column_name ILIKE '%preco%'
    OR column_name ILIKE '%valor%'
  )
ORDER BY column_name;


| column_name | data_type | is_nullable | column_default |
| ----------- | --------- | ----------- | -------------- |
| preco_venda | numeric   | YES         | null           |

-- QUERY 12: Buscar produtos com palavra "montagem"
-- ============================================================
SELECT 
    id,
    sku_visual,
    descricao,
    tipo_produto,
    categoria,
    preco_venda,
    ativo
FROM public.vw_estoque_completo
WHERE LOWER(descricao) LIKE '%montag%'
   OR LOWER(tipo_produto) LIKE '%montag%'
   OR LOWER(categoria) LIKE '%montag%'
LIMIT 10;


Error: Failed to run sql query: ERROR: 42703: column "id" does not exist LINE 5: id, ^




-- QUERY 13: Estrutura completa de categorias
-- ============================================================
SELECT DISTINCT
    categoria,
    COUNT(*) as total_produtos
FROM public.vw_estoque_completo
WHERE ativo = true
GROUP BY categoria
ORDER BY total_produtos DESC;

Error: Failed to run sql query: ERROR: 42703: column "categoria" does not exist LINE 5: categoria, ^ HINT: Perhaps you meant to reference the column "vw_estoque_completo.categoria_id".





-- QUERY 14: Todos os tipos de produtos únicos
-- ============================================================
SELECT DISTINCT
    tipo_produto,
    categoria,
    COUNT(*) as total
FROM public.vw_estoque_completo
WHERE ativo = true
GROUP BY tipo_produto, categoria
ORDER BY total DESC;

Error: Failed to run sql query: ERROR: 42703: column "categoria" does not exist LINE 7: categoria, ^ HINT: Perhaps you meant to reference the column "vw_estoque_completo.categoria_id".





-- QUERY 15: Exemplo completo de 5 produtos diferentes
-- ============================================================
SELECT 
    id,
    sku_visual,
    descricao,
    tipo_produto,
    categoria,
    marca,
    preco_custo,
    preco_venda,
    margem_lucro,
    ativo,
    destaque
FROM public.vw_estoque_completo
WHERE ativo = true
ORDER BY RANDOM()
LIMIT 5;

Error: Failed to run sql query: ERROR: 42703: column "id" does not exist LINE 5: id, ^




-- ============================================================
-- 📝 NOTAS PARA EXECUÇÃO:
-- ============================================================
-- 1. Execute as queries na ordem
-- 2. Queries 5, 7, 8, 9 dependem da existência das tabelas/views
-- 3. Se alguma query falhar, anote e passe para a próxima
-- 4. Principais views esperadas:
--    - public.vw_estoque_completo (já usada em armações)
--    - public.itens_venda (histórico de vendas)
-- 5. Procuramos por:
--    - Serviços de montagem
--    - Acessórios (estojo, cordão, limpeza, etc)
--    - Campos de desconto disponíveis
-- ============================================================
