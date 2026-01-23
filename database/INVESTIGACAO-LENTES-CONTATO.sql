-- ============================================================
-- 🔍 INVESTIGAÇÃO: Lentes de Contato
-- Objetivo: Entender estrutura e dados disponíveis
-- ============================================================

-- QUERY 1: Verificar se a view existe
-- ============================================================
SELECT 
  schemaname, 
  viewname, 
  viewowner
FROM pg_views 
WHERE viewname = 'v_lentes_contato';

| schemaname | viewname         | viewowner |
| ---------- | ---------------- | --------- |
| public     | v_lentes_contato | postgres  |


-- QUERY 2: Ver estrutura da view (colunas disponíveis)
-- ============================================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'v_lentes_contato'
ORDER BY ordinal_position;


| column_name             | data_type                | is_nullable |
| ----------------------- | ------------------------ | ----------- |
| id                      | uuid                     | YES         |
| slug                    | text                     | YES         |
| sku                     | character varying        | YES         |
| codigo_fornecedor       | character varying        | YES         |
| nome_produto            | text                     | YES         |
| nome_canonizado         | text                     | YES         |
| marca_id                | uuid                     | YES         |
| marca_nome              | character varying        | YES         |
| marca_slug              | character varying        | YES         |
| marca_premium           | boolean                  | YES         |
| pais_origem             | character varying        | YES         |
| fornecedor_id           | uuid                     | YES         |
| fornecedor_nome         | text                     | YES         |
| fornecedor_razao_social | text                     | YES         |
| tipo_lente_contato      | text                     | YES         |
| material_contato        | text                     | YES         |
| finalidade              | text                     | YES         |
| diametro_mm             | numeric                  | YES         |
| curvatura_base          | numeric                  | YES         |
| dk_t                    | integer                  | YES         |
| teor_agua_percentual    | integer                  | YES         |
| espessura_central       | numeric                  | YES         |
| esferico_min            | numeric                  | YES         |
| esferico_max            | numeric                  | YES         |
| cilindrico_min          | numeric                  | YES         |
| cilindrico_max          | numeric                  | YES         |
| eixo_min                | integer                  | YES         |
| eixo_max                | integer                  | YES         |
| adicao_min              | numeric                  | YES         |
| adicao_max              | numeric                  | YES         |
| tem_protecao_uv         | boolean                  | YES         |
| eh_colorida             | boolean                  | YES         |
| cor_disponivel          | character varying        | YES         |
| resistente_depositos    | boolean                  | YES         |
| hidratacao_prolongada   | boolean                  | YES         |
| dias_uso                | integer                  | YES         |
| horas_uso_diario        | integer                  | YES         |
| pode_dormir_com_lente   | boolean                  | YES         |
| solucao_recomendada     | text                     | YES         |
| qtd_por_caixa           | integer                  | YES         |
| preco_custo             | numeric                  | YES         |
| preco_tabela            | numeric                  | YES         |
| preco_fabricante        | numeric                  | YES         |
| prazo_entrega_dias      | integer                  | YES         |
| estoque_disponivel      | integer                  | YES         |
| disponivel              | boolean                  | YES         |
| destaque                | boolean                  | YES         |
| novidade                | boolean                  | YES         |
| data_lancamento         | date                     | YES         |
| data_descontinuacao     | date                     | YES         |
| descricao_curta         | text                     | YES         |
| descricao_completa      | text                     | YES         |
| beneficios              | ARRAY                    | YES         |
| indicacoes              | ARRAY                    | YES         |
| contraindicacoes        | text                     | YES         |
| ativo                   | boolean                  | YES         |
| status_produto          | text                     | YES         |
| metadata                | jsonb                    | YES         |
| observacoes             | text                     | YES         |
| created_at              | timestamp with time zone | YES         |
| updated_at              | timestamp with time zone | YES         |
| deleted_at              | timestamp with time zone | YES         |



-- QUERY 3: Contagem geral
-- ============================================================
SELECT 
  COUNT(*) as total_lentes,
  COUNT(DISTINCT fornecedor_id) as total_fornecedores,
  COUNT(DISTINCT fornecedor_nome) as total_fornecedores_nomes,
  COUNT(DISTINCT marca_nome) as total_marcas,
  COUNT(DISTINCT tipo_lente_contato) as total_tipos
FROM v_lentes_contato;

| total_lentes | total_fornecedores | total_fornecedores_nomes | total_marcas | total_tipos |
| ------------ | ------------------ | ------------------------ | ------------ | ----------- |
| 0            | 0                  | 0                        | 0            | 0           |

aidna não temos lentes no banco de dados.

-- QUERY 4: Listar fornecedores únicos
-- ============================================================
SELECT DISTINCT
  fornecedor_id,
  fornecedor_nome,
  COUNT(*) OVER (PARTITION BY fornecedor_id) as total_produtos
FROM v_lentes_contato
WHERE fornecedor_id IS NOT NULL
ORDER BY total_produtos DESC, fornecedor_nome;

Success. No rows returned





-- QUERY 5: Listar tipos de lentes
-- ============================================================
SELECT 
  tipo_lente_contato,
  design_lente,
  COUNT(*) as total_produtos,
  AVG(preco_custo_caixa) as preco_medio_custo,
  AVG(preco_venda_sugerido_caixa) as preco_medio_venda
FROM v_lentes_contato
GROUP BY tipo_lente_contato, design_lente
ORDER BY total_produtos DESC;


Error: Failed to run sql query: ERROR: 42703: column "design_lente" does not exist LINE 6: design_lente, ^





-- QUERY 6: Listar marcas disponíveis
-- ============================================================
SELECT 
  marca_nome,
  COUNT(*) as total_produtos,
  COUNT(DISTINCT tipo_lente_contato) as tipos_diferentes
FROM v_lentes_contato
GROUP BY marca_nome
ORDER BY total_produtos DESC;


Success. No rows returned




-- QUERY 7: Exemplo completo de 5 produtos
-- ============================================================
SELECT 
  id,
  sku,
  nome_produto,
  marca_nome,
  tipo_lente_contato,
  design_lente,
  material,
  fornecedor_nome,
  preco_custo_caixa,
  preco_venda_sugerido_caixa,
  prazo_entrega_dias,
  esferico_min,
  esferico_max,
  tem_protecao_uv,
  qtd_por_caixa
FROM v_lentes_contato
LIMIT 5;

-- QUERY 8: Verificar se existem lentes SEM fornecedor
-- ============================================================
SELECT 
  COUNT(*) as lentes_sem_fornecedor,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM v_lentes_contato) as percentual
FROM v_lentes_contato
WHERE fornecedor_id IS NULL OR fornecedor_nome IS NULL;

Error: Failed to run sql query: ERROR: 22012: division by zero





-- QUERY 9: Listar produtos por fornecedor (com detalhes)
-- ============================================================
SELECT 
  fornecedor_nome,
  tipo_lente_contato,
  design_lente,
  COUNT(*) as total,
  MIN(preco_custo_caixa) as preco_min,
  MAX(preco_custo_caixa) as preco_max
FROM v_lentes_contato
WHERE fornecedor_id IS NOT NULL
GROUP BY fornecedor_nome, tipo_lente_contato, design_lente
ORDER BY fornecedor_nome, total DESC;


Error: Failed to run sql query: ERROR: 42703: column "design_lente" does not exist LINE 8: design_lente, ^




-- QUERY 10: Características especiais
-- ============================================================
SELECT 
  COUNT(*) FILTER (WHERE tem_protecao_uv = true) as com_protecao_uv,
  COUNT(*) FILTER (WHERE tem_filtro_azul = true) as com_filtro_azul,
  COUNT(*) FILTER (WHERE eh_multifocal = true) as multifocais,
  COUNT(*) FILTER (WHERE eh_torica = true) as toricas,
  COUNT(*) FILTER (WHERE eh_cosmetica = true) as cosmeticas,
  COUNT(*) as total
FROM v_lentes_contato;

Error: Failed to run sql query: ERROR: 42703: column "tem_filtro_azul" does not exist LINE 6: COUNT(*) FILTER (WHERE tem_filtro_azul = true) as com_filtro_azul, ^


