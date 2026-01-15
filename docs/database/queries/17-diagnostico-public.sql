-- ============================================================
-- DIAGNÓSTICO COMPLETO: O que existe no schema `public` (e views úteis)
-- Execute no Supabase SQL Editor e cole os resultados abaixo de cada bloco
-- ============================================================

-- 1) LISTAR todas as tabelas e views no schema `public`
SELECT table_schema, table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_type, table_name;

-- Resultado:
| table_schema | table_name                   | table_type |
| ------------ | ---------------------------- | ---------- |
| public       | v_estatisticas_catalogo      | VIEW       |
| public       | v_estoque_disponivel         | VIEW       |
| public       | v_filtros_disponiveis        | VIEW       |
| public       | v_filtros_grupos_canonicos   | VIEW       |
| public       | v_fornecedores_catalogo      | VIEW       |
| public       | v_fornecedores_por_lente     | VIEW       |
| public       | v_grupos_canonicos           | VIEW       |
| public       | v_grupos_canonicos_completos | VIEW       |
| public       | v_grupos_com_lentes          | VIEW       |
| public       | v_grupos_melhor_margem       | VIEW       |
| public       | v_grupos_por_faixa_preco     | VIEW       |
| public       | v_grupos_por_receita_cliente | VIEW       |
| public       | v_grupos_premium_marcas      | VIEW       |
| public       | v_lentes_busca               | VIEW       |
| public       | v_lentes_catalogo            | VIEW       |
| public       | v_lentes_cotacao_compra      | VIEW       |
| public       | v_pedidos_pendentes          | VIEW       |
| public       | v_sugestoes_upgrade          | VIEW       |


-- 2) LISTAR todas as VIEWS (qualquer schema) que começam com 'v_'
SELECT schemaname, viewname
FROM pg_views
WHERE viewname LIKE 'v_%'
ORDER BY schemaname, viewname;

-- Resultado:

| schemaname         | viewname                         |
| ------------------ | -------------------------------- |
| compras            | v_estoque_alertas                |
| compras            | v_itens_pendentes                |
| compras            | v_pedidos_completos              |
| information_schema | view_column_usage                |
| information_schema | view_routine_usage               |
| information_schema | view_table_usage                 |
| information_schema | views                            |
| lens_catalog       | v_grupos_canonicos_detalhados    |
| lens_catalog       | v_grupos_canonicos_detalhados_v5 |
| public             | v_estatisticas_catalogo          |
| public             | v_estoque_disponivel             |
| public             | v_filtros_disponiveis            |
| public             | v_filtros_grupos_canonicos       |
| public             | v_fornecedores_catalogo          |
| public             | v_fornecedores_por_lente         |
| public             | v_grupos_canonicos               |
| public             | v_grupos_canonicos_completos     |
| public             | v_grupos_com_lentes              |
| public             | v_grupos_melhor_margem           |
| public             | v_grupos_por_faixa_preco         |
| public             | v_grupos_por_receita_cliente     |
| public             | v_grupos_premium_marcas          |
| public             | v_lentes_busca                   |
| public             | v_lentes_catalogo                |
| public             | v_lentes_cotacao_compra          |
| public             | v_pedidos_pendentes              |
| public             | v_sugestoes_upgrade              |

-- 3) VERIFICAR existencia exata da view 'v_grupos_canonicos_completos' (qualquer schema)
SELECT schemaname, viewname
FROM pg_views
WHERE viewname = 'v_grupos_canonicos_completos';

-- Resultado:

| schemaname | viewname                     |
| ---------- | ---------------------------- |
| public     | v_grupos_canonicos_completos |

-- 4) LISTAR todas as views do schema 'lens_catalog' (se existir)
SELECT schemaname, viewname
FROM pg_views
WHERE schemaname = 'lens_catalog'
ORDER BY viewname;

-- Resultado:

| schemaname   | viewname                         |
| ------------ | -------------------------------- |
| lens_catalog | v_grupos_canonicos_detalhados    |
| lens_catalog | v_grupos_canonicos_detalhados_v5 |

-- 5) COLUNAS da view/tabela `v_pedidos_kanban` (public ou outro schema)
SELECT table_schema, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'v_pedidos_kanban'
ORDER BY ordinal_position;

-- Resultado:

Success. No rows returned




-- 6) COLUNAS da view/tabela `v_kanban_colunas`
SELECT table_schema, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'v_kanban_colunas'
ORDER BY ordinal_position;

-- Resultado:

Success. No rows returned




-- 7) COLUNAS da tabela `pedidos` (public)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'pedidos'
ORDER BY ordinal_position;

-- Resultado:

Success. No rows returned




-- 8) COLUNAS da tabela `lentes` (schema lens_catalog)
SELECT table_schema, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'lentes'
ORDER BY ordinal_position;

-- Resultado:

| table_schema | column_name               | data_type                | is_nullable |
| ------------ | ------------------------- | ------------------------ | ----------- |
| lens_catalog | id                        | uuid                     | NO          |
| lens_catalog | fornecedor_id             | uuid                     | NO          |
| lens_catalog | marca_id                  | uuid                     | YES         |
| lens_catalog | grupo_canonico_id         | uuid                     | YES         |
| lens_catalog | nome_lente                | text                     | NO          |
| lens_catalog | nome_canonizado           | text                     | YES         |
| lens_catalog | slug                      | text                     | YES         |
| lens_catalog | sku                       | character varying        | YES         |
| lens_catalog | codigo_fornecedor         | character varying        | YES         |
| lens_catalog | tipo_lente                | USER-DEFINED             | NO          |
| lens_catalog | material                  | USER-DEFINED             | NO          |
| lens_catalog | indice_refracao           | USER-DEFINED             | NO          |
| lens_catalog | categoria                 | USER-DEFINED             | NO          |
| lens_catalog | tratamento_antirreflexo   | boolean                  | NO          |
| lens_catalog | tratamento_antirrisco     | boolean                  | NO          |
| lens_catalog | tratamento_uv             | boolean                  | NO          |
| lens_catalog | tratamento_blue_light     | boolean                  | NO          |
| lens_catalog | tratamento_fotossensiveis | USER-DEFINED             | YES         |
| lens_catalog | diametro_mm               | integer                  | YES         |
| lens_catalog | curva_base                | numeric                  | YES         |
| lens_catalog | espessura_centro_mm       | numeric                  | YES         |
| lens_catalog | eixo_optico               | character varying        | YES         |
| lens_catalog | grau_esferico_min         | numeric                  | YES         |
| lens_catalog | grau_esferico_max         | numeric                  | YES         |
| lens_catalog | grau_cilindrico_min       | numeric                  | YES         |
| lens_catalog | grau_cilindrico_max       | numeric                  | YES         |
| lens_catalog | adicao_min                | numeric                  | YES         |
| lens_catalog | adicao_max                | numeric                  | YES         |
| lens_catalog | preco_custo               | numeric                  | NO          |
| lens_catalog | preco_venda_sugerido      | numeric                  | NO          |
| lens_catalog | margem_lucro              | numeric                  | YES         |
| lens_catalog | estoque_disponivel        | integer                  | YES         |
| lens_catalog | estoque_minimo            | integer                  | YES         |
| lens_catalog | lead_time_dias            | integer                  | YES         |
| lens_catalog | status                    | USER-DEFINED             | NO          |
| lens_catalog | ativo                     | boolean                  | NO          |
| lens_catalog | peso                      | integer                  | YES         |
| lens_catalog | metadata                  | jsonb                    | YES         |
| lens_catalog | created_at                | timestamp with time zone | NO          |
| lens_catalog | updated_at                | timestamp with time zone | NO          |
| lens_catalog | deleted_at                | timestamp with time zone | YES         |

-- 9) COLUNAS da tabela `fornecedores` (schema core)
SELECT table_schema, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'fornecedores'
ORDER BY ordinal_position;

-- Resultado:



-- 10) EXEMPLOS: primeiras 5 linhas de v_pedidos_kanban (se existir)
SELECT * FROM public.v_pedidos_kanban LIMIT 5;

-- Resultado:

| table_schema | column_name         | data_type                | is_nullable |
| ------------ | ------------------- | ------------------------ | ----------- |
| core         | id                  | uuid                     | NO          |
| core         | nome                | text                     | NO          |
| core         | razao_social        | text                     | YES         |
| core         | cnpj                | character varying        | YES         |
| core         | cep_origem          | character varying        | YES         |
| core         | cidade_origem       | text                     | YES         |
| core         | estado_origem       | character varying        | YES         |
| core         | prazo_visao_simples | integer                  | YES         |
| core         | prazo_multifocal    | integer                  | YES         |
| core         | prazo_surfacada     | integer                  | YES         |
| core         | prazo_free_form     | integer                  | YES         |
| core         | frete_config        | jsonb                    | YES         |
| core         | desconto_volume     | jsonb                    | YES         |
| core         | ativo               | boolean                  | NO          |
| core         | created_at          | timestamp with time zone | NO          |
| core         | updated_at          | timestamp with time zone | NO          |
| core         | deleted_at          | timestamp with time zone | YES         |

-- 11) EXEMPLOS: primeiras 5 linhas de v_grupos_canonicos_completos (se existir em qualquer schema)
-- Tente schemaless; se não existir em public, rode com schema correto (ex: lens_catalog.v_grupos_canonicos_completos)
SELECT * FROM public.v_grupos_canonicos_completos LIMIT 5;

-- Resultado:

| id                                   | slug                                                                                      | nome_grupo                                                                                              | tipo_lente | material      | indice_refracao | tratamento_antirreflexo | tratamento_antirrisco | tratamento_uv | tratamento_blue_light | tratamento_fotossensiveis | total_lentes | preco_medio | preco_minimo | preco_maximo | is_premium | fornecedores_disponiveis                                                     | lentes_ativas_count | peso | created_at                    | updated_at                    | grau_esferico_min | grau_esferico_max | grau_cilindrico_min | grau_cilindrico_max | adicao_min | adicao_max | categoria_predominante | total_marcas |
| ------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------- | ------------- | --------------- | ----------------------- | --------------------- | ------------- | --------------------- | ------------------------- | ------------ | ----------- | ------------ | ------------ | ---------- | ---------------------------------------------------------------------------- | ------------------- | ---- | ----------------------------- | ----------------------------- | ----------------- | ----------------- | ------------------- | ------------------- | ---------- | ---------- | ---------------------- | ------------ |
| 00d3b9c7-7cc4-4071-8067-e5d04fca8b08 | lente-159-multifocal-uv-bluelight-fotocrom-tico-esf-n6-00-6-00-cil-n4-00-0-00-add-100-350 | Lente POLICARBONATO 1.59 Multifocal +UV +BlueLight +fotocromático [-6.00/6.00 | -4.00/0.00 | 1.00/3.50] | multifocal | POLICARBONATO | 1.59            | false                   | false                 | true          | true                  | fotocromático             | 1            | 1610.98     | 1610.98      | 1610.98      | false      | [{"id":"3a0a8ad3-4c55-44a2-b9fa-232a9f2fdc21","nome":"Polylux","prazo":7}]   | 1                   | 50   | 2025-12-20 03:13:41.517389+00 | 2025-12-20 04:33:31.658296+00 | -6.00             | 6.00              | -4.00               | 0.00                | 1.00       | 3.50       | economica              | 1            |
| 00d5fbb4-fe8d-40f8-8d0a-a298b92f0210 | lente-159-multifocal-uv-bluelight-esf-n8-00-6-00-cil-n5-00-0-00-add-075-350               | Lente POLICARBONATO 1.59 Multifocal +UV +BlueLight [-8.00/6.00 | -5.00/0.00 | 0.75/3.50]                | multifocal | POLICARBONATO | 1.59            | false                   | false                 | true          | true                  | nenhum                    | 6            | 2154.60     | 1176.88      | 3069.74      | false      | [{"id":"e1e1eace-11b4-4f26-9f15-620808a4a410","nome":"So Blocos","prazo":7}] | 6                   | 50   | 2025-12-20 03:13:41.517389+00 | 2025-12-20 04:33:31.658296+00 | -8.00             | 6.00              | -5.00               | 0.00                | 0.75       | 3.50       | intermediaria          | 1            |
| 01272b2a-757e-4906-b5de-89f2cdb66a5b | lente-39-156-multifocal-ar-uv-esf-n6-00-6-00-cil-0-00-n4-00-add-100-350                   | Lente CR39 1.56 Multifocal +AR +UV [-6.00/6.00 | 0.00/-4.00 | 1.00/3.50]                                | multifocal | CR39          | 1.56            | true                    | false                 | true          | false                 | nenhum                    | 1            | 547.23      | 547.23       | 547.23       | false      | [{"id":"8eb9498c-3d99-4d26-bb8c-e503f97ccf2c","nome":"Express","prazo":3}]   | 1                   | 50   | 2025-12-20 03:13:41.517389+00 | 2025-12-20 04:33:31.658296+00 | -6.00             | 6.00              | 0.00                | -4.00               | 1.00       | 3.50       | intermediaria          | 1            |
| 0154f210-c72f-47ab-aa7b-1abb6b30fbc2 | lente-39-167-multifocal-uv-bluelight-esf-n10-00-7-00-cil-n4-00-0-00-add-100-350           | Lente CR39 1.67 Multifocal +UV +BlueLight [-10.00/7.00 | -4.00/0.00 | 1.00/3.50]                        | multifocal | CR39          | 1.67            | false                   | false                 | true          | true                  | nenhum                    | 1            | 2365.78     | 2365.78      | 2365.78      | false      | [{"id":"e1e1eace-11b4-4f26-9f15-620808a4a410","nome":"So Blocos","prazo":7}] | 1                   | 50   | 2025-12-20 03:13:41.517389+00 | 2025-12-20 04:33:31.658296+00 | -10.00            | 7.00              | -4.00               | 0.00                | 1.00       | 3.50       | intermediaria          | 1            |
| 0226073a-24d6-4575-846b-b47b628502b8 | lente-39-167-multifocal-ar-uv-fotocrom-tico-esf-n13-00-9-00-cil-n8-00-0-00-add-050-450    | Lente CR39 1.67 Multifocal +AR +UV +fotocromático [-13.00/9.00 | -8.00/0.00 | 0.50/4.50]                | multifocal | CR39          | 1.67            | true                    | false                 | true          | false                 | fotocromático             | 4            | 7266.11     | 7058.83      | 7473.38      | true       | [{"id":"e1e1eace-11b4-4f26-9f15-620808a4a410","nome":"So Blocos","prazo":7}] | 4                   | 50   | 2025-12-20 03:13:41.517389+00 | 2025-12-20 04:33:31.658296+00 | -13.00            | 9.00              | -8.00               | 0.00                | 0.50       | 4.50       | intermediaria          | 1            |

-- 12) VERIFICAR chaves estrangeiras da tabela `pedidos` (constraints)
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'pedidos'
  AND tc.constraint_type = 'FOREIGN KEY';

-- Resultado:

| constraint_name            | column_name   | foreign_table_schema | foreign_table_name | foreign_column_name |
| -------------------------- | ------------- | -------------------- | ------------------ | ------------------- |
| pedidos_fornecedor_id_fkey | fornecedor_id | core                 | fornecedores       | id                  |

-- 13) CONTAGEM de status distintos em `pedidos`
SELECT status, COUNT(*) as total
FROM public.pedidos
GROUP BY status
ORDER BY total DESC;

-- Resultado:

Error: Failed to run sql query: ERROR: 42P01: relation "public.pedidos" does not exist LINE 2: FROM public.pedidos ^



-- 14) VER se existe view ou tabela que exponha grupos/lentes em `public`
SELECT table_schema, table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public' AND (table_name ILIKE 'v_grupos%' OR table_name ILIKE 'v_lentes%' OR table_name ILIKE 'lentes%')
ORDER BY table_type, table_name;

-- Resultado:

| table_schema | table_name                   | table_type |
| ------------ | ---------------------------- | ---------- |
| public       | v_grupos_canonicos           | VIEW       |
| public       | v_grupos_canonicos_completos | VIEW       |
| public       | v_grupos_com_lentes          | VIEW       |
| public       | v_grupos_melhor_margem       | VIEW       |
| public       | v_grupos_por_faixa_preco     | VIEW       |
| public       | v_grupos_por_receita_cliente | VIEW       |
| public       | v_grupos_premium_marcas      | VIEW       |
| public       | v_lentes_busca               | VIEW       |
| public       | v_lentes_catalogo            | VIEW       |
| public       | v_lentes_cotacao_compra      | VIEW       |

-- 15) PERMISSÕES: quais roles têm SELECT em views importantes (ex: v_pedidos_kanban, v_kanban_colunas, v_grupos_canonicos_completos)
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('v_pedidos_kanban','v_kanban_colunas','v_grupos_canonicos_completos')
ORDER BY table_name, grantee;

-- Resultado:



-- 16) CHECAR search_path e configuração atual (útil para saber onde o supabase busca views sem schema)
SELECT current_setting('search_path');

-- Resultado:

| grantee       | table_schema | table_name                   | privilege_type |
| ------------- | ------------ | ---------------------------- | -------------- |
| PUBLIC        | public       | v_grupos_canonicos_completos | SELECT         |
| anon          | public       | v_grupos_canonicos_completos | SELECT         |
| authenticated | public       | v_grupos_canonicos_completos | SELECT         |
| postgres      | public       | v_grupos_canonicos_completos | DELETE         |
| postgres      | public       | v_grupos_canonicos_completos | TRUNCATE       |
| postgres      | public       | v_grupos_canonicos_completos | INSERT         |
| postgres      | public       | v_grupos_canonicos_completos | TRIGGER        |
| postgres      | public       | v_grupos_canonicos_completos | REFERENCES     |
| postgres      | public       | v_grupos_canonicos_completos | SELECT         |
| postgres      | public       | v_grupos_canonicos_completos | UPDATE         |

-- 17) LISTAR FUNÇÕES relacionadas a 'lente' ou 'grupo'
SELECT n.nspname as schema,
       p.proname as function_name,
       pg_catalog.pg_get_function_result(p.oid) as result_type,
       pg_catalog.pg_get_function_arguments(p.oid) as arguments
FROM pg_catalog.pg_proc p
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname ILIKE '%lente%' OR p.proname ILIKE '%grupo%'
ORDER BY schema, function_name;

-- Resultado:

| schema       | function_name                       | result_type                                                                                                                                                                                                                                                                                                                     | arguments                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lens_catalog | atualizar_estatisticas_grupo_manual | TABLE(id uuid, nome_grupo text, total_lentes integer, total_marcas integer, preco_minimo numeric, preco_maximo numeric, preco_medio numeric)                                                                                                                                                                                    | p_grupo_id uuid DEFAULT NULL::uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| lens_catalog | fn_associar_lente_grupo_automatico  | trigger                                                                                                                                                                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| lens_catalog | fn_atualizar_estatisticas_grupo     | trigger                                                                                                                                                                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| lens_catalog | fn_auditar_grupos                   | trigger                                                                                                                                                                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| lens_catalog | fn_criar_grupo_canonico_automatico  | uuid                                                                                                                                                                                                                                                                                                                            | p_tipo_lente text, p_material text, p_indice_refracao text, p_grau_esferico_min numeric, p_grau_esferico_max numeric, p_grau_cilindrico_min numeric, p_grau_cilindrico_max numeric, p_adicao_min numeric DEFAULT NULL::numeric, p_adicao_max numeric DEFAULT NULL::numeric                                                                                                                                                                                                                                                                                  |
| lens_catalog | generate_lente_slug                 | trigger                                                                                                                                                                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| lens_catalog | update_grupos_timestamp             | trigger                                                                                                                                                                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| lens_catalog | update_lentes_timestamp             | trigger                                                                                                                                                                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| lens_catalog | validar_integridade_grupos          | TABLE(grupo_id uuid, nome_grupo text, problema text, total_lentes_registrado integer, total_lentes_real integer, preco_medio_registrado numeric, preco_medio_real numeric)                                                                                                                                                      |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| public       | buscar_lentes                       | TABLE(id uuid, slug text, nome text, fornecedor text, marca text, tipo_lente lens_catalog.tipo_lente, material lens_catalog.material_lente, indice_refracao lens_catalog.indice_refracao, preco numeric, categoria lens_catalog.categoria_lente, tem_ar boolean, tem_blue boolean, grupo_nome text, estoque_disponivel integer) | p_tipo_lente lens_catalog.tipo_lente DEFAULT NULL::lens_catalog.tipo_lente, p_material lens_catalog.material_lente DEFAULT NULL::lens_catalog.material_lente, p_indice lens_catalog.indice_refracao DEFAULT NULL::lens_catalog.indice_refracao, p_preco_min numeric DEFAULT NULL::numeric, p_preco_max numeric DEFAULT NULL::numeric, p_tem_ar boolean DEFAULT NULL::boolean, p_tem_blue boolean DEFAULT NULL::boolean, p_fornecedor_id uuid DEFAULT NULL::uuid, p_marca_id uuid DEFAULT NULL::uuid, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0 |
| public       | obter_alternativas_lente            | TABLE(id uuid, slug text, nome text, fornecedor text, preco numeric, diferenca_preco numeric, prazo_dias integer)                                                                                                                                                                                                               | p_lente_id uuid, p_limit integer DEFAULT 5                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

-- 18) LISTAR VIEWS públicas começando com 'v_fornecedores' ou 'v_lentes'
SELECT schemaname, viewname
FROM pg_views
WHERE viewname ILIKE 'v_fornecedores%' OR viewname ILIKE 'v_lentes%'
ORDER BY schemaname, viewname;

-- Resultado:

| schemaname | viewname                 |
| ---------- | ------------------------ |
| public     | v_fornecedores_catalogo  |
| public     | v_fornecedores_por_lente |
| public     | v_lentes_busca           |
| public     | v_lentes_catalogo        |
| public     | v_lentes_cotacao_compra  |

-- 19) VER se existe view materializada relacionada (pg_matviews)
SELECT schemaname, matviewname
FROM pg_matviews
WHERE matviewname ILIKE 'v_%' OR matviewname ILIKE '%lentes%'
ORDER BY schemaname, matviewname;

-- Resultado:

| schemaname | matviewname        |
| ---------- | ------------------ |
| public     | v_lentes_destaques |

-- 20) LISTAR índices relevantes em tables principais (pedidos, lentes)
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('pedidos','lentes')
ORDER BY tablename, indexname;

-- Resultado:

| tablename | indexname                  | indexdef                                                                                                     |
| --------- | -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| lentes    | gin_lentes_metadata        | CREATE INDEX gin_lentes_metadata ON lens_catalog.lentes USING gin (metadata)                                 |
| lentes    | idx_lentes_categoria       | CREATE INDEX idx_lentes_categoria ON lens_catalog.lentes USING btree (categoria) WHERE (ativo = true)        |
| lentes    | idx_lentes_fornecedor      | CREATE INDEX idx_lentes_fornecedor ON lens_catalog.lentes USING btree (fornecedor_id) WHERE (ativo = true)   |
| lentes    | idx_lentes_grupo           | CREATE INDEX idx_lentes_grupo ON lens_catalog.lentes USING btree (grupo_canonico_id)                         |
| lentes    | idx_lentes_indice          | CREATE INDEX idx_lentes_indice ON lens_catalog.lentes USING btree (indice_refracao) WHERE (ativo = true)     |
| lentes    | idx_lentes_marca           | CREATE INDEX idx_lentes_marca ON lens_catalog.lentes USING btree (marca_id) WHERE (ativo = true)             |
| lentes    | idx_lentes_material        | CREATE INDEX idx_lentes_material ON lens_catalog.lentes USING btree (material) WHERE (ativo = true)          |
| lentes    | idx_lentes_nome_canonizado | CREATE INDEX idx_lentes_nome_canonizado ON lens_catalog.lentes USING btree (nome_canonizado)                 |
| lentes    | idx_lentes_preco           | CREATE INDEX idx_lentes_preco ON lens_catalog.lentes USING btree (preco_venda_sugerido) WHERE (ativo = true) |
| lentes    | idx_lentes_sku             | CREATE INDEX idx_lentes_sku ON lens_catalog.lentes USING btree (sku)                                         |
| lentes    | idx_lentes_slug            | CREATE INDEX idx_lentes_slug ON lens_catalog.lentes USING btree (slug)                                       |
| lentes    | idx_lentes_status          | CREATE INDEX idx_lentes_status ON lens_catalog.lentes USING btree (status)                                   |
| lentes    | idx_lentes_tipo            | CREATE INDEX idx_lentes_tipo ON lens_catalog.lentes USING btree (tipo_lente) WHERE (ativo = true)            |
| lentes    | lentes_pkey                | CREATE UNIQUE INDEX lentes_pkey ON lens_catalog.lentes USING btree (id)                                      |
| lentes    | lentes_slug_key            | CREATE UNIQUE INDEX lentes_slug_key ON lens_catalog.lentes USING btree (slug)                                |
| pedidos   | idx_pedidos_data           | CREATE INDEX idx_pedidos_data ON compras.pedidos USING btree (data_pedido DESC)                              |
| pedidos   | idx_pedidos_fornecedor     | CREATE INDEX idx_pedidos_fornecedor ON compras.pedidos USING btree (fornecedor_id)                           |
| pedidos   | idx_pedidos_numero         | CREATE INDEX idx_pedidos_numero ON compras.pedidos USING btree (numero_pedido)                               |
| pedidos   | idx_pedidos_status         | CREATE INDEX idx_pedidos_status ON compras.pedidos USING btree (status)                                      |
| pedidos   | pedidos_numero_pedido_key  | CREATE UNIQUE INDEX pedidos_numero_pedido_key ON compras.pedidos USING btree (numero_pedido)                 |
| pedidos   | pedidos_pkey               | CREATE UNIQUE INDEX pedidos_pkey ON compras.pedidos USING btree (id)                                         |

-- ============================================================
-- INSTRUÇÕES
-- ============================================================
-- 1) Execute todas as queries acima no Supabase SQL Editor
-- 2) Cole os resultados abaixo de cada bloco "Resultado:"
-- 3) Eu analisarei e direi quais views/tabelas usar (sem criar nada se possível)
-- ============================================================
