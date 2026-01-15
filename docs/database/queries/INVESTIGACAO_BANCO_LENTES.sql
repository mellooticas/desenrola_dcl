-- ============================================================
-- INVESTIGAÇÃO ESTRUTURADA - BANCO DE LENTES BEST_LENS
-- FASE 1: DESCOBERTA DE ESTRUTURA
-- Execute cada query e cole o resultado abaixo dela
-- ============================================================


-- ============================================================
-- ETAPA 1: DESCOBRIR SCHEMAS
-- ============================================================

-- Query 1.1: Listar todos os schemas (exceto sistema)
SELECT 
    schema_name
FROM information_schema.schemata
WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
ORDER BY schema_name;




-- COLE O RESULTADO AQUI:
/*


| schema_name      |
| ---------------- |
| auth             |
| compras          |
| contact_lens     |
| core             |
| extensions       |
| graphql          |
| graphql_public   |
| lens_catalog     |
| pg_temp_0        |
| pg_temp_10       |
| pg_temp_11       |
| pg_temp_12       |
| pg_temp_13       |
| pg_temp_14       |
| pg_temp_15       |
| pg_temp_16       |
| pg_temp_17       |
| pg_temp_18       |
| pg_temp_19       |
| pg_temp_2        |
| pg_temp_20       |
| pg_temp_21       |
| pg_temp_22       |
| pg_temp_23       |
| pg_temp_24       |
| pg_temp_25       |
| pg_temp_26       |
| pg_temp_27       |
| pg_temp_28       |
| pg_temp_29       |
| pg_temp_3        |
| pg_temp_30       |
| pg_temp_31       |
| pg_temp_32       |
| pg_temp_33       |
| pg_temp_34       |
| pg_temp_35       |
| pg_temp_36       |
| pg_temp_37       |
| pg_temp_38       |
| pg_temp_39       |
| pg_temp_4        |
| pg_temp_40       |
| pg_temp_41       |
| pg_temp_42       |
| pg_temp_43       |
| pg_temp_44       |
| pg_temp_45       |
| pg_temp_46       |
| pg_temp_47       |
| pg_temp_48       |
| pg_temp_49       |
| pg_temp_5        |
| pg_temp_50       |
| pg_temp_51       |
| pg_temp_52       |
| pg_temp_53       |
| pg_temp_54       |
| pg_temp_55       |
| pg_temp_56       |
| pg_temp_57       |
| pg_temp_58       |
| pg_temp_59       |
| pg_temp_6        |
| pg_temp_7        |
| pg_temp_8        |
| pg_temp_9        |
| pg_toast_temp_0  |
| pg_toast_temp_10 |
| pg_toast_temp_11 |
| pg_toast_temp_12 |
| pg_toast_temp_13 |
| pg_toast_temp_14 |
| pg_toast_temp_15 |
| pg_toast_temp_16 |
| pg_toast_temp_17 |
| pg_toast_temp_18 |
| pg_toast_temp_19 |
| pg_toast_temp_2  |
| pg_toast_temp_20 |
| pg_toast_temp_21 |
| pg_toast_temp_22 |
| pg_toast_temp_23 |
| pg_toast_temp_24 |
| pg_toast_temp_25 |
| pg_toast_temp_26 |
| pg_toast_temp_27 |
| pg_toast_temp_28 |
| pg_toast_temp_29 |
| pg_toast_temp_3  |
| pg_toast_temp_30 |
| pg_toast_temp_31 |
| pg_toast_temp_32 |
| pg_toast_temp_33 |
| pg_toast_temp_34 |
| pg_toast_temp_35 |
| pg_toast_temp_36 |
| pg_toast_temp_37 |
| pg_toast_temp_38 |
| pg_toast_temp_39 |

*/


-- ============================================================
-- ETAPA 2: DESCOBRIR TABELAS EM CADA SCHEMA
-- ============================================================

-- Query 2.1: Todas as tabelas e views por schema
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_type, table_name;


-- COLE O RESULTADO AQUI:
/*


| table_schema | table_name                       | table_type |
| ------------ | -------------------------------- | ---------- |
| auth         | audit_log_entries                | BASE TABLE |
| auth         | flow_state                       | BASE TABLE |
| auth         | identities                       | BASE TABLE |
| auth         | instances                        | BASE TABLE |
| auth         | mfa_amr_claims                   | BASE TABLE |
| auth         | mfa_challenges                   | BASE TABLE |
| auth         | mfa_factors                      | BASE TABLE |
| auth         | oauth_authorizations             | BASE TABLE |
| auth         | oauth_client_states              | BASE TABLE |
| auth         | oauth_clients                    | BASE TABLE |
| auth         | oauth_consents                   | BASE TABLE |
| auth         | one_time_tokens                  | BASE TABLE |
| auth         | refresh_tokens                   | BASE TABLE |
| auth         | saml_providers                   | BASE TABLE |
| auth         | saml_relay_states                | BASE TABLE |
| auth         | schema_migrations                | BASE TABLE |
| auth         | sessions                         | BASE TABLE |
| auth         | sso_domains                      | BASE TABLE |
| auth         | sso_providers                    | BASE TABLE |
| auth         | users                            | BASE TABLE |
| compras      | estoque_movimentacoes            | BASE TABLE |
| compras      | estoque_saldo                    | BASE TABLE |
| compras      | historico_precos                 | BASE TABLE |
| compras      | pedido_itens                     | BASE TABLE |
| compras      | pedidos                          | BASE TABLE |
| compras      | v_estoque_alertas                | VIEW       |
| compras      | v_itens_pendentes                | VIEW       |
| compras      | v_pedidos_completos              | VIEW       |
| core         | fornecedores                     | BASE TABLE |
| extensions   | pg_stat_statements               | VIEW       |
| extensions   | pg_stat_statements_info          | VIEW       |
| lens_catalog | grupos_canonicos                 | BASE TABLE |
| lens_catalog | grupos_canonicos_backup_old      | BASE TABLE |
| lens_catalog | grupos_canonicos_log             | BASE TABLE |
| lens_catalog | lentes                           | BASE TABLE |
| lens_catalog | lentes_canonicas                 | BASE TABLE |
| lens_catalog | lentes_grupos_backup_old         | BASE TABLE |
| lens_catalog | marcas                           | BASE TABLE |
| lens_catalog | premium_canonicas                | BASE TABLE |
| lens_catalog | v_grupos_canonicos_detalhados    | VIEW       |
| lens_catalog | v_grupos_canonicos_detalhados_v5 | VIEW       |
| public       | v_estatisticas_catalogo          | VIEW       |
| public       | v_estoque_disponivel             | VIEW       |
| public       | v_filtros_disponiveis            | VIEW       |
| public       | v_filtros_grupos_canonicos       | VIEW       |
| public       | v_fornecedores_catalogo          | VIEW       |
| public       | v_fornecedores_por_lente         | VIEW       |
| public       | v_grupos_canonicos               | VIEW       |
| public       | v_grupos_canonicos_completos     | VIEW       |
| public       | v_grupos_com_lentes              | VIEW       |
| public       | v_grupos_melhor_margem           | VIEW       |
| public       | v_grupos_por_faixa_preco         | VIEW       |
| public       | v_grupos_por_receita_cliente     | VIEW       |
| public       | v_grupos_premium_marcas          | VIEW       |
| public       | v_lentes_busca                   | VIEW       |
| public       | v_lentes_catalogo                | VIEW       |
| public       | v_lentes_cotacao_compra          | VIEW       |
| public       | v_pedidos_pendentes              | VIEW       |
| public       | v_sugestoes_upgrade              | VIEW       |
| realtime     | messages                         | BASE TABLE |
| realtime     | schema_migrations                | BASE TABLE |
| realtime     | subscription                     | BASE TABLE |
| storage      | buckets                          | BASE TABLE |
| storage      | buckets_analytics                | BASE TABLE |
| storage      | buckets_vectors                  | BASE TABLE |
| storage      | migrations                       | BASE TABLE |
| storage      | objects                          | BASE TABLE |
| storage      | prefixes                         | BASE TABLE |
| storage      | s3_multipart_uploads             | BASE TABLE |
| storage      | s3_multipart_uploads_parts       | BASE TABLE |
| storage      | vector_indexes                   | BASE TABLE |
| vault        | secrets                          | BASE TABLE |
| vault        | decrypted_secrets                | VIEW       |



*/


-- Query 2.2: Contagem de objetos por schema
SELECT 
    table_schema,
    table_type,
    COUNT(*) as total
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
GROUP BY table_schema, table_type
ORDER BY table_schema, table_type;

-- COLE O RESULTADO AQUI:
/*

| table_schema | table_type | total |
| ------------ | ---------- | ----- |
| auth         | BASE TABLE | 20    |
| compras      | BASE TABLE | 5     |
| compras      | VIEW       | 3     |
| core         | BASE TABLE | 1     |
| extensions   | VIEW       | 2     |
| lens_catalog | BASE TABLE | 8     |
| lens_catalog | VIEW       | 2     |
| public       | VIEW       | 18    |
| realtime     | BASE TABLE | 3     |
| storage      | BASE TABLE | 9     |
| vault        | BASE TABLE | 1     |
| vault        | VIEW       | 1     |

*/


-- ============================================================
-- ETAPA 3: COLUNAS DE CADA TABELA (SCHEMAS INTERNOS)
-- ============================================================

-- Query 3.1: Estrutura completa - lens_catalog.lentes
SELECT 
    ordinal_position,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'lens_catalog' 
  AND table_name = 'lentes'
ORDER BY ordinal_position;

-- COLE O RESULTADO AQUI:
/*

| ordinal_position | column_name               | data_type                | character_maximum_length | is_nullable | column_default                         |
| ---------------- | ------------------------- | ------------------------ | ------------------------ | ----------- | -------------------------------------- |
| 1                | id                        | uuid                     | null                     | NO          | gen_random_uuid()                      |
| 2                | fornecedor_id             | uuid                     | null                     | NO          | null                                   |
| 3                | marca_id                  | uuid                     | null                     | YES         | null                                   |
| 4                | grupo_canonico_id         | uuid                     | null                     | YES         | null                                   |
| 5                | nome_lente                | text                     | null                     | NO          | null                                   |
| 6                | nome_canonizado           | text                     | null                     | YES         | null                                   |
| 7                | slug                      | text                     | null                     | YES         | null                                   |
| 8                | sku                       | character varying        | 100                      | YES         | null                                   |
| 9                | codigo_fornecedor         | character varying        | 100                      | YES         | null                                   |
| 10               | tipo_lente                | USER-DEFINED             | null                     | NO          | null                                   |
| 11               | material                  | USER-DEFINED             | null                     | NO          | null                                   |
| 12               | indice_refracao           | USER-DEFINED             | null                     | NO          | null                                   |
| 13               | categoria                 | USER-DEFINED             | null                     | NO          | null                                   |
| 14               | tratamento_antirreflexo   | boolean                  | null                     | NO          | false                                  |
| 15               | tratamento_antirrisco     | boolean                  | null                     | NO          | false                                  |
| 16               | tratamento_uv             | boolean                  | null                     | NO          | false                                  |
| 17               | tratamento_blue_light     | boolean                  | null                     | NO          | false                                  |
| 18               | tratamento_fotossensiveis | USER-DEFINED             | null                     | YES         | 'nenhum'::lens_catalog.tratamento_foto |
| 19               | diametro_mm               | integer                  | null                     | YES         | null                                   |
| 20               | curva_base                | numeric                  | null                     | YES         | null                                   |
| 21               | espessura_centro_mm       | numeric                  | null                     | YES         | null                                   |
| 22               | eixo_optico               | character varying        | 50                       | YES         | null                                   |
| 23               | grau_esferico_min         | numeric                  | null                     | YES         | null                                   |
| 24               | grau_esferico_max         | numeric                  | null                     | YES         | null                                   |
| 25               | grau_cilindrico_min       | numeric                  | null                     | YES         | null                                   |
| 26               | grau_cilindrico_max       | numeric                  | null                     | YES         | null                                   |
| 27               | adicao_min                | numeric                  | null                     | YES         | null                                   |
| 28               | adicao_max                | numeric                  | null                     | YES         | null                                   |
| 29               | preco_custo               | numeric                  | null                     | NO          | 0                                      |
| 30               | preco_venda_sugerido      | numeric                  | null                     | NO          | 0                                      |
| 31               | margem_lucro              | numeric                  | null                     | YES         | null                                   |
| 32               | estoque_disponivel        | integer                  | null                     | YES         | 0                                      |
| 33               | estoque_minimo            | integer                  | null                     | YES         | 0                                      |
| 34               | lead_time_dias            | integer                  | null                     | YES         | null                                   |
| 35               | status                    | USER-DEFINED             | null                     | NO          | 'ativo'::lens_catalog.status_lente     |
| 36               | ativo                     | boolean                  | null                     | NO          | true                                   |
| 37               | peso                      | integer                  | null                     | YES         | 50                                     |
| 38               | metadata                  | jsonb                    | null                     | YES         | '{}'::jsonb                            |
| 39               | created_at                | timestamp with time zone | null                     | NO          | now()                                  |
| 40               | updated_at                | timestamp with time zone | null                     | NO          | now()                                  |
| 41               | deleted_at                | timestamp with time zone | null                     | YES         | null                                   |


*/


-- Query 3.2: Estrutura completa - lens_catalog.marcas
SELECT 
    ordinal_position,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'lens_catalog' 
  AND table_name = 'marcas'
ORDER BY ordinal_position;

-- COLE O RESULTADO AQUI:
/*

| ordinal_position | column_name | data_type                | is_nullable |
| ---------------- | ----------- | ------------------------ | ----------- |
| 1                | id          | uuid                     | NO          |
| 2                | nome        | character varying        | NO          |
| 3                | slug        | character varying        | NO          |
| 4                | is_premium  | boolean                  | NO          |
| 5                | descricao   | text                     | YES         |
| 6                | website     | text                     | YES         |
| 7                | logo_url    | text                     | YES         |
| 8                | ativo       | boolean                  | NO          |
| 9                | created_at  | timestamp with time zone | NO          |
| 10               | updated_at  | timestamp with time zone | NO          |


*/


-- Query 3.3: Estrutura completa - lens_catalog.grupos_canonicos
SELECT 
    ordinal_position,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'lens_catalog' 
  AND table_name = 'grupos_canonicos'
ORDER BY ordinal_position;

-- COLE O RESULTADO AQUI:
/*

| ordinal_position | column_name               | data_type                | is_nullable |
| ---------------- | ------------------------- | ------------------------ | ----------- |
| 1                | id                        | uuid                     | NO          |
| 2                | nome_grupo                | text                     | NO          |
| 3                | slug                      | text                     | NO          |
| 4                | tipo_lente                | USER-DEFINED             | NO          |
| 5                | material                  | USER-DEFINED             | NO          |
| 6                | indice_refracao           | USER-DEFINED             | NO          |
| 7                | categoria_predominante    | USER-DEFINED             | YES         |
| 8                | tem_antirreflexo          | boolean                  | NO          |
| 9                | tem_antirrisco            | boolean                  | NO          |
| 10               | tem_uv                    | boolean                  | NO          |
| 11               | tem_blue_light            | boolean                  | NO          |
| 12               | tratamento_foto           | USER-DEFINED             | YES         |
| 13               | total_lentes              | integer                  | YES         |
| 14               | preco_medio               | numeric                  | YES         |
| 15               | preco_minimo              | numeric                  | YES         |
| 16               | preco_maximo              | numeric                  | YES         |
| 17               | is_premium                | boolean                  | NO          |
| 18               | peso                      | integer                  | YES         |
| 19               | ativo                     | boolean                  | NO          |
| 20               | created_at                | timestamp with time zone | NO          |
| 21               | updated_at                | timestamp with time zone | NO          |
| 22               | grau_esferico_min         | numeric                  | YES         |
| 23               | grau_esferico_max         | numeric                  | YES         |
| 24               | grau_cilindrico_min       | numeric                  | YES         |
| 25               | grau_cilindrico_max       | numeric                  | YES         |
| 26               | adicao_min                | numeric                  | YES         |
| 27               | adicao_max                | numeric                  | YES         |
| 28               | descricao_ranges          | text                     | YES         |
| 29               | total_marcas              | integer                  | YES         |
| 30               | tratamento_antirreflexo   | boolean                  | YES         |
| 31               | tratamento_antirrisco     | boolean                  | YES         |
| 32               | tratamento_uv             | boolean                  | YES         |
| 33               | tratamento_blue_light     | boolean                  | YES         |
| 34               | tratamento_fotossensiveis | text                     | YES         |

*/


-- Query 3.4: Estrutura completa - lens_catalog.lentes_canonicas
SELECT 
    ordinal_position,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'lens_catalog' 
  AND table_name = 'lentes_canonicas'
ORDER BY ordinal_position;

-- COLE O RESULTADO AQUI:
/*

| ordinal_position | column_name     | data_type                | is_nullable |
| ---------------- | --------------- | ------------------------ | ----------- |
| 1                | id              | uuid                     | NO          |
| 2                | nome_canonico   | text                     | NO          |
| 3                | descricao       | text                     | YES         |
| 4                | tipo_lente      | USER-DEFINED             | NO          |
| 5                | material        | USER-DEFINED             | NO          |
| 6                | indice_refracao | USER-DEFINED             | NO          |
| 7                | categoria       | USER-DEFINED             | NO          |
| 8                | ar              | boolean                  | NO          |
| 9                | blue            | boolean                  | NO          |
| 10               | fotossensivel   | boolean                  | NO          |
| 11               | polarizado      | boolean                  | NO          |
| 12               | esferico_min    | numeric                  | YES         |
| 13               | esferico_max    | numeric                  | YES         |
| 14               | cilindrico_min  | numeric                  | YES         |
| 15               | cilindrico_max  | numeric                  | YES         |
| 16               | adicao_min      | numeric                  | YES         |
| 17               | adicao_max      | numeric                  | YES         |
| 18               | total_lentes    | integer                  | YES         |
| 19               | preco_minimo    | numeric                  | YES         |
| 20               | preco_maximo    | numeric                  | YES         |
| 21               | preco_medio     | numeric                  | YES         |
| 22               | ativo           | boolean                  | NO          |
| 23               | created_at      | timestamp with time zone | NO          |
| 24               | updated_at      | timestamp with time zone | NO          |


*/


-- Query 3.5: Estrutura completa - core.fornecedores
SELECT 
    ordinal_position,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'core' 
  AND table_name = 'fornecedores'
ORDER BY ordinal_position;

-- COLE O RESULTADO AQUI:
/*

| ordinal_position | column_name         | data_type                | is_nullable |
| ---------------- | ------------------- | ------------------------ | ----------- |
| 1                | id                  | uuid                     | NO          |
| 2                | nome                | text                     | NO          |
| 3                | razao_social        | text                     | YES         |
| 4                | cnpj                | character varying        | YES         |
| 5                | cep_origem          | character varying        | YES         |
| 6                | cidade_origem       | text                     | YES         |
| 7                | estado_origem       | character varying        | YES         |
| 8                | prazo_visao_simples | integer                  | YES         |
| 9                | prazo_multifocal    | integer                  | YES         |
| 10               | prazo_surfacada     | integer                  | YES         |
| 11               | prazo_free_form     | integer                  | YES         |
| 12               | frete_config        | jsonb                    | YES         |
| 13               | desconto_volume     | jsonb                    | YES         |
| 14               | ativo               | boolean                  | NO          |
| 15               | created_at          | timestamp with time zone | NO          |
| 16               | updated_at          | timestamp with time zone | NO          |
| 17               | deleted_at          | timestamp with time zone | YES         |


*/


-- Query 3.6: Estrutura completa - compras.pedidos
SELECT 
    ordinal_position,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'compras' 
  AND table_name = 'pedidos'
ORDER BY ordinal_position;

-- COLE O RESULTADO AQUI:
/*

| ordinal_position | column_name           | data_type                | is_nullable |
| ---------------- | --------------------- | ------------------------ | ----------- |
| 1                | id                    | uuid                     | NO          |
| 2                | numero_pedido         | character varying        | NO          |
| 3                | fornecedor_id         | uuid                     | NO          |
| 4                | status                | USER-DEFINED             | NO          |
| 5                | data_pedido           | timestamp with time zone | NO          |
| 6                | data_confirmacao      | timestamp with time zone | YES         |
| 7                | data_previsao_entrega | timestamp with time zone | YES         |
| 8                | data_recebimento      | timestamp with time zone | YES         |
| 9                | valor_total           | numeric                  | NO          |
| 10               | valor_frete           | numeric                  | YES         |
| 11               | valor_desconto        | numeric                  | YES         |
| 12               | observacoes           | text                     | YES         |
| 13               | observacoes_internas  | text                     | YES         |
| 14               | codigo_rastreio       | character varying        | YES         |
| 15               | created_by            | uuid                     | YES         |
| 16               | created_at            | timestamp with time zone | NO          |
| 17               | updated_at            | timestamp with time zone | NO          |
| 18               | deleted_at            | timestamp with time zone | YES         |


*/


-- Query 3.7: Estrutura completa - compras.pedido_itens
SELECT 
    ordinal_position,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'compras' 
  AND table_name = 'pedido_itens'
ORDER BY ordinal_position;

-- COLE O RESULTADO AQUI:
/*

| ordinal_position | column_name         | data_type                | is_nullable |
| ---------------- | ------------------- | ------------------------ | ----------- |
| 1                | id                  | uuid                     | NO          |
| 2                | pedido_id           | uuid                     | NO          |
| 3                | lente_id            | uuid                     | NO          |
| 4                | quantidade          | integer                  | NO          |
| 5                | quantidade_recebida | integer                  | YES         |
| 6                | preco_unitario      | numeric                  | NO          |
| 7                | desconto_unitario   | numeric                  | YES         |
| 8                | subtotal            | numeric                  | YES         |
| 9                | observacoes         | text                     | YES         |
| 10               | created_at          | timestamp with time zone | NO          |
| 11               | updated_at          | timestamp with time zone | NO          |

*/


-- ============================================================
-- ETAPA 4: VIEWS NO SCHEMA PUBLIC
-- ============================================================

-- Query 4.1: Listar TODAS as views no public
SELECT 
    table_name as view_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- COLE O RESULTADO AQUI:
/*

| view_name                    |
| ---------------------------- |
| v_estatisticas_catalogo      |
| v_estoque_disponivel         |
| v_filtros_disponiveis        |
| v_filtros_grupos_canonicos   |
| v_fornecedores_catalogo      |
| v_fornecedores_por_lente     |
| v_grupos_canonicos           |
| v_grupos_canonicos_completos |
| v_grupos_com_lentes          |
| v_grupos_melhor_margem       |
| v_grupos_por_faixa_preco     |
| v_grupos_por_receita_cliente |
| v_grupos_premium_marcas      |
| v_lentes_busca               |
| v_lentes_catalogo            |
| v_lentes_cotacao_compra      |
| v_pedidos_pendentes          |
| v_sugestoes_upgrade          |

*/


-- Query 4.2: Buscar views que mencionam "grupo" no nome
SELECT 
    table_name
FROM information_schema.views
WHERE table_schema = 'public' 
  AND table_name LIKE '%grupo%'
ORDER BY table_name;

-- COLE O RESULTADO AQUI:
/*

| table_name                   |
| ---------------------------- |
| v_filtros_grupos_canonicos   |
| v_grupos_canonicos           |
| v_grupos_canonicos_completos |
| v_grupos_com_lentes          |
| v_grupos_melhor_margem       |
| v_grupos_por_faixa_preco     |
| v_grupos_por_receita_cliente |
| v_grupos_premium_marcas      |

*/


-- Query 4.3: Buscar views que mencionam "lente" no nome
SELECT 
    table_name
FROM information_schema.views
WHERE table_schema = 'public' 
  AND table_name LIKE '%lente%'
ORDER BY table_name;

-- COLE O RESULTADO AQUI:
/*

| table_name               |
| ------------------------ |
| v_fornecedores_por_lente |
| v_grupos_com_lentes      |
| v_lentes_busca           |
| v_lentes_catalogo        |
| v_lentes_cotacao_compra  |

*/


-- Query 4.4: Buscar views que mencionam "fornecedor" no nome
SELECT 
    table_name
FROM information_schema.views
WHERE table_schema = 'public' 
  AND table_name LIKE '%fornecedor%'
ORDER BY table_name;

-- COLE O RESULTADO AQUI:
/*

| table_name               |
| ------------------------ |
| v_fornecedores_catalogo  |
| v_fornecedores_por_lente |

*/


-- ============================================================
-- ETAPA 5: COLUNAS DE CADA VIEW NO PUBLIC
-- ============================================================

-- Query 5.1: Estrutura de TODAS as views do public (resumida)
SELECT 
    table_name as view_name,
    column_name,
    data_type,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public'
  )
ORDER BY table_name, ordinal_position;

-- COLE O RESULTADO AQUI (pode ser longo):
/*

| view_name                    | column_name               | data_type                | ordinal_position |
| ---------------------------- | ------------------------- | ------------------------ | ---------------- |
| v_estatisticas_catalogo      | total_lentes              | bigint                   | 1                |
| v_estatisticas_catalogo      | total_marcas              | bigint                   | 2                |
| v_estatisticas_catalogo      | total_fornecedores        | bigint                   | 3                |
| v_estatisticas_catalogo      | total_grupos              | bigint                   | 4                |
| v_estatisticas_catalogo      | lentes_visao_simples      | bigint                   | 5                |
| v_estatisticas_catalogo      | lentes_multifocal         | bigint                   | 6                |
| v_estatisticas_catalogo      | lentes_bifocal            | bigint                   | 7                |
| v_estatisticas_catalogo      | preco_minimo_geral        | numeric                  | 8                |
| v_estatisticas_catalogo      | preco_maximo_geral        | numeric                  | 9                |
| v_estatisticas_catalogo      | preco_medio_geral         | numeric                  | 10               |
| v_estatisticas_catalogo      | lentes_em_estoque         | bigint                   | 11               |
| v_estatisticas_catalogo      | quantidade_total_estoque  | bigint                   | 12               |
| v_estatisticas_catalogo      | valor_total_estoque       | numeric                  | 13               |
| v_estatisticas_catalogo      | pedidos_pendentes         | bigint                   | 14               |
| v_estatisticas_catalogo      | pedidos_recebidos_mes     | bigint                   | 15               |
| v_estoque_disponivel         | lente_id                  | uuid                     | 1                |
| v_estoque_disponivel         | lente_slug                | text                     | 2                |
| v_estoque_disponivel         | lente_nome                | text                     | 3                |
| v_estoque_disponivel         | fornecedor_nome           | text                     | 4                |
| v_estoque_disponivel         | quantidade_disponivel     | integer                  | 5                |
| v_estoque_disponivel         | quantidade_reservada      | integer                  | 6                |
| v_estoque_disponivel         | quantidade_minima         | integer                  | 7                |
| v_estoque_disponivel         | quantidade_livre          | integer                  | 8                |
| v_estoque_disponivel         | status_estoque            | text                     | 9                |
| v_estoque_disponivel         | custo_medio               | numeric                  | 10               |
| v_estoque_disponivel         | valor_total_estoque       | numeric                  | 11               |
| v_estoque_disponivel         | ultima_entrada            | timestamp with time zone | 12               |
| v_estoque_disponivel         | ultima_saida              | timestamp with time zone | 13               |
| v_estoque_disponivel         | updated_at                | timestamp with time zone | 14               |
| v_filtros_disponiveis        | filtro_nome               | text                     | 1                |
| v_filtros_disponiveis        | valor                     | text                     | 2                |
| v_filtros_disponiveis        | total                     | bigint                   | 3                |
| v_filtros_disponiveis        | preco_min                 | numeric                  | 4                |
| v_filtros_disponiveis        | preco_max                 | numeric                  | 5                |
| v_filtros_grupos_canonicos   | filtro_categoria          | text                     | 1                |
| v_filtros_grupos_canonicos   | filtro_valor              | text                     | 2                |
| v_filtros_grupos_canonicos   | total_grupos              | bigint                   | 3                |
| v_filtros_grupos_canonicos   | preco_min                 | numeric                  | 4                |
| v_filtros_grupos_canonicos   | preco_max                 | numeric                  | 5                |
| v_filtros_grupos_canonicos   | preco_medio_geral         | numeric                  | 6                |
| v_filtros_grupos_canonicos   | total_lentes_agregado     | bigint                   | 7                |
| v_fornecedores_catalogo      | id                        | uuid                     | 1                |
| v_fornecedores_catalogo      | nome                      | text                     | 2                |
| v_fornecedores_catalogo      | razao_social              | text                     | 3                |
| v_fornecedores_catalogo      | prazo_visao_simples       | integer                  | 4                |
| v_fornecedores_catalogo      | prazo_multifocal          | integer                  | 5                |
| v_fornecedores_catalogo      | prazo_surfacada           | integer                  | 6                |
| v_fornecedores_catalogo      | prazo_free_form           | integer                  | 7                |
| v_fornecedores_catalogo      | total_lentes              | bigint                   | 8                |
| v_fornecedores_catalogo      | total_marcas              | bigint                   | 9                |
| v_fornecedores_catalogo      | preco_minimo              | numeric                  | 10               |
| v_fornecedores_catalogo      | preco_maximo              | numeric                  | 11               |
| v_fornecedores_catalogo      | preco_medio               | numeric                  | 12               |
| v_fornecedores_catalogo      | email_contato             | text                     | 13               |
| v_fornecedores_catalogo      | telefone_contato          | text                     | 14               |
| v_fornecedores_catalogo      | config_frete              | jsonb                    | 15               |
| v_fornecedores_catalogo      | badge_prazo               | text                     | 16               |
| v_fornecedores_catalogo      | ativo                     | boolean                  | 17               |
| v_fornecedores_catalogo      | created_at                | timestamp with time zone | 18               |
| v_fornecedores_por_lente     | lente_id                  | uuid                     | 1                |
| v_fornecedores_por_lente     | lente_nome                | text                     | 2                |
| v_fornecedores_por_lente     | lente_slug                | text                     | 3                |
| v_fornecedores_por_lente     | tipo_lente                | USER-DEFINED             | 4                |
| v_fornecedores_por_lente     | material                  | USER-DEFINED             | 5                |
| v_fornecedores_por_lente     | indice_refracao           | USER-DEFINED             | 6                |
| v_fornecedores_por_lente     | fornecedor_id             | uuid                     | 7                |
| v_fornecedores_por_lente     | fornecedor_nome           | text                     | 8                |
| v_fornecedores_por_lente     | fornecedor_razao_social   | text                     | 9                |
| v_fornecedores_por_lente     | cnpj                      | character varying        | 10               |
| v_fornecedores_por_lente     | preco_custo               | numeric                  | 11               |
| v_fornecedores_por_lente     | prazo_entrega_dias        | integer                  | 12               |
| v_fornecedores_por_lente     | marca_nome                | character varying        | 13               |
| v_fornecedores_por_lente     | marca_premium             | boolean                  | 14               |
| v_fornecedores_por_lente     | lente_ativa               | boolean                  | 15               |
| v_fornecedores_por_lente     | fornecedor_ativo          | boolean                  | 16               |
| v_fornecedores_por_lente     | ranking_fornecedor        | bigint                   | 17               |
| v_grupos_canonicos           | id                        | uuid                     | 1                |
| v_grupos_canonicos           | slug                      | text                     | 2                |
| v_grupos_canonicos           | nome_grupo                | text                     | 3                |
| v_grupos_canonicos           | tipo_lente                | USER-DEFINED             | 4                |
| v_grupos_canonicos           | material                  | USER-DEFINED             | 5                |
| v_grupos_canonicos           | indice_refracao           | USER-DEFINED             | 6                |
| v_grupos_canonicos           | tratamento_antirreflexo   | boolean                  | 7                |
| v_grupos_canonicos           | tratamento_antirrisco     | boolean                  | 8                |
| v_grupos_canonicos           | tratamento_uv             | boolean                  | 9                |
| v_grupos_canonicos           | tratamento_blue_light     | boolean                  | 10               |
| v_grupos_canonicos           | tratamento_fotossensiveis | text                     | 11               |
| v_grupos_canonicos           | total_lentes              | integer                  | 12               |
| v_grupos_canonicos           | preco_medio               | numeric                  | 13               |
| v_grupos_canonicos           | preco_minimo              | numeric                  | 14               |
| v_grupos_canonicos           | preco_maximo              | numeric                  | 15               |
| v_grupos_canonicos           | is_premium                | boolean                  | 16               |
| v_grupos_canonicos           | fornecedores_disponiveis  | jsonb                    | 17               |
| v_grupos_canonicos           | lentes_ativas_count       | bigint                   | 18               |
| v_grupos_canonicos           | peso                      | integer                  | 19               |
| v_grupos_canonicos           | created_at                | timestamp with time zone | 20               |
| v_grupos_canonicos           | updated_at                | timestamp with time zone | 21               |
| v_grupos_canonicos_completos | id                        | uuid                     | 1                |
| v_grupos_canonicos_completos | slug                      | text                     | 2                |
| v_grupos_canonicos_completos | nome_grupo                | text                     | 3                |

*/


-- ============================================================
-- RESUMO FINAL DA ETAPA 1
-- ============================================================
-- Execute esta query para ter um resumo geral:

SELECT 
    'SCHEMAS' as categoria,
    schema_name as nome,
    NULL as tipo,
    NULL as total
FROM information_schema.schemata
WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')

UNION ALL

SELECT 
    'OBJETOS POR SCHEMA',
    table_schema,
    table_type,
    COUNT(*)::text
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
GROUP BY table_schema, table_type

ORDER BY categoria DESC, nome, tipo;

-- COLE O RESULTADO AQUI:
/*

| categoria | nome             | tipo | total |
| --------- | ---------------- | ---- | ----- |
| SCHEMAS   | auth             | null | null  |
| SCHEMAS   | compras          | null | null  |
| SCHEMAS   | contact_lens     | null | null  |
| SCHEMAS   | core             | null | null  |
| SCHEMAS   | extensions       | null | null  |
| SCHEMAS   | graphql          | null | null  |
| SCHEMAS   | graphql_public   | null | null  |
| SCHEMAS   | lens_catalog     | null | null  |
| SCHEMAS   | pg_temp_0        | null | null  |
| SCHEMAS   | pg_temp_10       | null | null  |
| SCHEMAS   | pg_temp_11       | null | null  |
| SCHEMAS   | pg_temp_12       | null | null  |
| SCHEMAS   | pg_temp_13       | null | null  |
| SCHEMAS   | pg_temp_14       | null | null  |
| SCHEMAS   | pg_temp_15       | null | null  |
| SCHEMAS   | pg_temp_16       | null | null  |
| SCHEMAS   | pg_temp_17       | null | null  |
| SCHEMAS   | pg_temp_18       | null | null  |
| SCHEMAS   | pg_temp_19       | null | null  |
| SCHEMAS   | pg_temp_2        | null | null  |
| SCHEMAS   | pg_temp_20       | null | null  |
| SCHEMAS   | pg_temp_21       | null | null  |
| SCHEMAS   | pg_temp_22       | null | null  |
| SCHEMAS   | pg_temp_23       | null | null  |
| SCHEMAS   | pg_temp_24       | null | null  |
| SCHEMAS   | pg_temp_25       | null | null  |
| SCHEMAS   | pg_temp_26       | null | null  |
| SCHEMAS   | pg_temp_27       | null | null  |
| SCHEMAS   | pg_temp_28       | null | null  |
| SCHEMAS   | pg_temp_29       | null | null  |
| SCHEMAS   | pg_temp_3        | null | null  |
| SCHEMAS   | pg_temp_30       | null | null  |
| SCHEMAS   | pg_temp_31       | null | null  |
| SCHEMAS   | pg_temp_32       | null | null  |
| SCHEMAS   | pg_temp_33       | null | null  |
| SCHEMAS   | pg_temp_34       | null | null  |
| SCHEMAS   | pg_temp_35       | null | null  |
| SCHEMAS   | pg_temp_36       | null | null  |
| SCHEMAS   | pg_temp_37       | null | null  |
| SCHEMAS   | pg_temp_38       | null | null  |
| SCHEMAS   | pg_temp_39       | null | null  |
| SCHEMAS   | pg_temp_4        | null | null  |
| SCHEMAS   | pg_temp_40       | null | null  |
| SCHEMAS   | pg_temp_41       | null | null  |
| SCHEMAS   | pg_temp_42       | null | null  |
| SCHEMAS   | pg_temp_43       | null | null  |
| SCHEMAS   | pg_temp_44       | null | null  |
| SCHEMAS   | pg_temp_45       | null | null  |
| SCHEMAS   | pg_temp_46       | null | null  |
| SCHEMAS   | pg_temp_47       | null | null  |
| SCHEMAS   | pg_temp_48       | null | null  |
| SCHEMAS   | pg_temp_49       | null | null  |
| SCHEMAS   | pg_temp_5        | null | null  |
| SCHEMAS   | pg_temp_50       | null | null  |
| SCHEMAS   | pg_temp_51       | null | null  |
| SCHEMAS   | pg_temp_52       | null | null  |
| SCHEMAS   | pg_temp_53       | null | null  |
| SCHEMAS   | pg_temp_54       | null | null  |
| SCHEMAS   | pg_temp_55       | null | null  |
| SCHEMAS   | pg_temp_56       | null | null  |
| SCHEMAS   | pg_temp_57       | null | null  |
| SCHEMAS   | pg_temp_58       | null | null  |
| SCHEMAS   | pg_temp_59       | null | null  |
| SCHEMAS   | pg_temp_6        | null | null  |
| SCHEMAS   | pg_temp_7        | null | null  |
| SCHEMAS   | pg_temp_8        | null | null  |
| SCHEMAS   | pg_temp_9        | null | null  |
| SCHEMAS   | pg_toast_temp_0  | null | null  |
| SCHEMAS   | pg_toast_temp_10 | null | null  |
| SCHEMAS   | pg_toast_temp_11 | null | null  |
| SCHEMAS   | pg_toast_temp_12 | null | null  |
| SCHEMAS   | pg_toast_temp_13 | null | null  |
| SCHEMAS   | pg_toast_temp_14 | null | null  |
| SCHEMAS   | pg_toast_temp_15 | null | null  |
| SCHEMAS   | pg_toast_temp_16 | null | null  |
| SCHEMAS   | pg_toast_temp_17 | null | null  |
| SCHEMAS   | pg_toast_temp_18 | null | null  |
| SCHEMAS   | pg_toast_temp_19 | null | null  |
| SCHEMAS   | pg_toast_temp_2  | null | null  |
| SCHEMAS   | pg_toast_temp_20 | null | null  |
| SCHEMAS   | pg_toast_temp_21 | null | null  |
| SCHEMAS   | pg_toast_temp_22 | null | null  |
| SCHEMAS   | pg_toast_temp_23 | null | null  |
| SCHEMAS   | pg_toast_temp_24 | null | null  |
| SCHEMAS   | pg_toast_temp_25 | null | null  |
| SCHEMAS   | pg_toast_temp_26 | null | null  |
| SCHEMAS   | pg_toast_temp_27 | null | null  |
| SCHEMAS   | pg_toast_temp_28 | null | null  |
| SCHEMAS   | pg_toast_temp_29 | null | null  |
| SCHEMAS   | pg_toast_temp_3  | null | null  |
| SCHEMAS   | pg_toast_temp_30 | null | null  |
| SCHEMAS   | pg_toast_temp_31 | null | null  |
| SCHEMAS   | pg_toast_temp_32 | null | null  |
| SCHEMAS   | pg_toast_temp_33 | null | null  |
| SCHEMAS   | pg_toast_temp_34 | null | null  |
| SCHEMAS   | pg_toast_temp_35 | null | null  |
| SCHEMAS   | pg_toast_temp_36 | null | null  |
| SCHEMAS   | pg_toast_temp_37 | null | null  |
| SCHEMAS   | pg_toast_temp_38 | null | null  |
| SCHEMAS   | pg_toast_temp_39 | null | null  |


*/


-- ============================================================
-- INSTRUÇÕES:
-- ============================================================
-- ✅ FASE 1 COMPLETA quando todas as queries acima forem executadas
-- 
-- Próxima fase (FASE 2): Analisar dados, triggers, funções e permissões
-- Aguarde eu criar o arquivo INVESTIGACAO_BANCO_LENTES_FASE2.sql
-- ============================================================
