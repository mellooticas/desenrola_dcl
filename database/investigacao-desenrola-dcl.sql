-- ============================================================================
-- INVESTIGAÇÃO: DESENROLA_DCL (Controle Atual)
-- ============================================================================
-- Objetivo: Mapear schemas, tabelas e estrutura do sistema atual
-- Data: 17/01/2026
-- Status: SISTEMA PRINCIPAL EM PRODUÇÃO
-- ============================================================================

-- ============================================================================
-- ETAPA 1: LISTAR TODOS OS SCHEMAS
-- ============================================================================
SELECT 
    schema_name,
    schema_owner,
    CASE 
        WHEN schema_name IN ('pg_catalog', 'information_schema') THEN 'Sistema'
        ELSE 'Aplicação'
    END as tipo
FROM information_schema.schemata
WHERE schema_name NOT IN ('pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
ORDER BY 
    CASE WHEN schema_name = 'public' THEN 1 ELSE 2 END,
    schema_name;


| schema_name         | schema_owner   | tipo      |
| ------------------- | -------------- | --------- |
| public              | postgres       | Aplicação |
| access              | postgres       | Aplicação |
| auth                | supabase_admin | Aplicação |
| extensions          | postgres       | Aplicação |
| graphql             | supabase_admin | Aplicação |
| graphql_public      | supabase_admin | Aplicação |
| information_schema  | supabase_admin | Sistema   |
| net                 | supabase_admin | Aplicação |
| pg_catalog          | supabase_admin | Sistema   |
| pg_temp_10          | supabase_admin | Aplicação |
| pg_temp_11          | supabase_admin | Aplicação |
| pg_temp_12          | supabase_admin | Aplicação |
| pg_temp_13          | supabase_admin | Aplicação |
| pg_temp_14          | supabase_admin | Aplicação |
| pg_temp_15          | supabase_admin | Aplicação |
| pg_temp_16          | supabase_admin | Aplicação |
| pg_temp_17          | supabase_admin | Aplicação |
| pg_temp_18          | supabase_admin | Aplicação |
| pg_temp_19          | supabase_admin | Aplicação |
| pg_temp_20          | supabase_admin | Aplicação |
| pg_temp_21          | supabase_admin | Aplicação |
| pg_temp_22          | supabase_admin | Aplicação |
| pg_temp_23          | supabase_admin | Aplicação |
| pg_temp_24          | supabase_admin | Aplicação |
| pg_temp_25          | supabase_admin | Aplicação |
| pg_temp_26          | supabase_admin | Aplicação |
| pg_temp_7           | supabase_admin | Aplicação |
| pg_temp_8           | supabase_admin | Aplicação |
| pg_temp_9           | supabase_admin | Aplicação |
| pg_toast_temp_10    | supabase_admin | Aplicação |
| pg_toast_temp_11    | supabase_admin | Aplicação |
| pg_toast_temp_12    | supabase_admin | Aplicação |
| pg_toast_temp_13    | supabase_admin | Aplicação |
| pg_toast_temp_14    | supabase_admin | Aplicação |
| pg_toast_temp_15    | supabase_admin | Aplicação |
| pg_toast_temp_16    | supabase_admin | Aplicação |
| pg_toast_temp_17    | supabase_admin | Aplicação |
| pg_toast_temp_18    | supabase_admin | Aplicação |
| pg_toast_temp_19    | supabase_admin | Aplicação |
| pg_toast_temp_20    | supabase_admin | Aplicação |
| pg_toast_temp_21    | supabase_admin | Aplicação |
| pg_toast_temp_22    | supabase_admin | Aplicação |
| pg_toast_temp_23    | supabase_admin | Aplicação |
| pg_toast_temp_24    | supabase_admin | Aplicação |
| pg_toast_temp_25    | supabase_admin | Aplicação |
| pg_toast_temp_26    | supabase_admin | Aplicação |
| pg_toast_temp_7     | supabase_admin | Aplicação |
| pg_toast_temp_8     | supabase_admin | Aplicação |
| pg_toast_temp_9     | supabase_admin | Aplicação |
| pgbouncer           | pgbouncer      | Aplicação |
| realtime            | supabase_admin | Aplicação |
| storage             | supabase_admin | Aplicação |
| supabase_functions  | supabase_admin | Aplicação |
| supabase_migrations | postgres       | Aplicação |
| vault               | supabase_admin | Aplicação |

-- ============================================================================
-- ETAPA 2: LISTAR TODAS AS TABELAS POR SCHEMA
-- ============================================================================
SELECT 
    table_schema as schema,
    table_name as tabela,
    table_type as tipo,
    (SELECT COUNT(*) 
     FROM information_schema.columns c 
     WHERE c.table_schema = t.table_schema 
     AND c.table_name = t.table_name) as total_colunas
FROM information_schema.tables t
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY 
    table_schema,
    CASE table_type 
        WHEN 'BASE TABLE' THEN 1
        WHEN 'VIEW' THEN 2
        ELSE 3
    END,
    table_name;


| schema              | tabela                             | tipo       | total_colunas |
| ------------------- | ---------------------------------- | ---------- | ------------- |
| access              | permissions                        | BASE TABLE | 6             |
| access              | role_permissions                   | BASE TABLE | 2             |
| access              | roles                              | BASE TABLE | 6             |
| access              | user_permission_overrides          | BASE TABLE | 3             |
| access              | user_roles                         | BASE TABLE | 2             |
| access              | vw_usuario_permissions             | VIEW       | 6             |
| auth                | audit_log_entries                  | BASE TABLE | 5             |
| auth                | flow_state                         | BASE TABLE | 12            |
| auth                | identities                         | BASE TABLE | 9             |
| auth                | instances                          | BASE TABLE | 5             |
| auth                | mfa_amr_claims                     | BASE TABLE | 5             |
| auth                | mfa_challenges                     | BASE TABLE | 7             |
| auth                | mfa_factors                        | BASE TABLE | 13            |
| auth                | oauth_authorizations               | BASE TABLE | 17            |
| auth                | oauth_client_states                | BASE TABLE | 4             |
| auth                | oauth_clients                      | BASE TABLE | 12            |
| auth                | oauth_consents                     | BASE TABLE | 6             |
| auth                | one_time_tokens                    | BASE TABLE | 7             |
| auth                | refresh_tokens                     | BASE TABLE | 9             |
| auth                | saml_providers                     | BASE TABLE | 9             |
| auth                | saml_relay_states                  | BASE TABLE | 8             |
| auth                | schema_migrations                  | BASE TABLE | 1             |
| auth                | sessions                           | BASE TABLE | 15            |
| auth                | sso_domains                        | BASE TABLE | 5             |
| auth                | sso_providers                      | BASE TABLE | 5             |
| auth                | users                              | BASE TABLE | 35            |
| extensions          | pg_stat_statements                 | VIEW       | 43            |
| extensions          | pg_stat_statements_info            | VIEW       | 2             |
| net                 | _http_response                     | BASE TABLE | 8             |
| net                 | http_request_queue                 | BASE TABLE | 6             |
| public              | alertas                            | BASE TABLE | 9             |
| public              | classes_lente                      | BASE TABLE | 8             |
| public              | clientes                           | BASE TABLE | 7             |
| public              | colaboradores                      | BASE TABLE | 8             |
| public              | controle_os                        | BASE TABLE | 6             |
| public              | desafios                           | BASE TABLE | 12            |
| public              | desafios_participacao              | BASE TABLE | 8             |
| public              | laboratorio_sla                    | BASE TABLE | 5             |
| public              | laboratorios                       | BASE TABLE | 8             |
| public              | loja_acoes_customizadas            | BASE TABLE | 17            |
| public              | loja_configuracoes_horario         | BASE TABLE | 17            |
| public              | lojas                              | BASE TABLE | 10            |
| public              | missao_templates                   | BASE TABLE | 31            |
| public              | missoes_diarias                    | BASE TABLE | 31            |
| public              | montadores                         | BASE TABLE | 6             |
| public              | notificacoes                       | BASE TABLE | 9             |
| public              | os_nao_lancadas                    | BASE TABLE | 10            |
| public              | os_sequencia                       | BASE TABLE | 7             |
| public              | pedido_eventos                     | BASE TABLE | 11            |
| public              | pedido_tratamentos                 | BASE TABLE | 5             |
| public              | pedidos                            | BASE TABLE | 78            |
| public              | pedidos_historico                  | BASE TABLE | 7             |
| public              | pedidos_timeline                   | BASE TABLE | 8             |
| public              | renovacao_diaria                   | BASE TABLE | 9             |
| public              | role_permissions                   | BASE TABLE | 5             |
| public              | role_status_permissoes_legacy      | BASE TABLE | 7             |
| public              | sistema_config                     | BASE TABLE | 4             |
| public              | tratamentos                        | BASE TABLE | 9             |
| public              | user_sessions                      | BASE TABLE | 7             |
| public              | usuarios                           | BASE TABLE | 16            |
| public              | v_alertas_criticos                 | VIEW       | 11            |
| public              | v_analise_financeira               | VIEW       | 13            |
| public              | v_analise_sazonalidade             | VIEW       | 8             |
| public              | v_correlacoes                      | VIEW       | 9             |
| public              | v_dashboard_bi                     | VIEW       | 24            |
| public              | v_dashboard_kpis                   | VIEW       | 23            |
| public              | v_dashboard_kpis_full              | VIEW       | 5             |
| public              | v_dashboard_resumo                 | VIEW       | 12            |
| public              | v_evolucao_mensal                  | VIEW       | 15            |
| public              | v_heatmap_sla                      | VIEW       | 8             |
| public              | v_kanban_colunas                   | VIEW       | 6             |
| public              | v_kanban_fluxo_ativo               | VIEW       | 27            |
| public              | v_kpis_dashboard                   | VIEW       | 10            |
| public              | v_lead_time_comparativo            | VIEW       | 8             |
| public              | v_missoes_timeline                 | VIEW       | 25            |
| public              | v_montadores_ativos                | VIEW       | 4             |
| public              | v_pedido_timeline_completo         | VIEW       | 17            |
| public              | v_pedidos_historico                | VIEW       | 16            |
| public              | v_pedidos_kanban                   | VIEW       | 84            |
| public              | v_pedidos_montagem                 | VIEW       | 56            |
| public              | v_projecoes                        | VIEW       | 6             |
| public              | v_usuario_permissoes_kanban        | VIEW       | 11            |
| public              | view_controle_os_estatisticas      | VIEW       | 9             |
| public              | view_controle_os_gaps              | VIEW       | 11            |
| public              | view_kpis_montadores               | VIEW       | 11            |
| public              | view_os_estatisticas               | VIEW       | 9             |
| public              | view_os_gaps                       | VIEW       | 9             |
| public              | view_performance_diaria_montadores | VIEW       | 5             |
| public              | view_ranking_montadores            | VIEW       | 6             |
| public              | view_relatorio_montagens           | VIEW       | 14            |
| realtime            | messages                           | BASE TABLE | 8             |
| realtime            | messages_2025_09_17                | BASE TABLE | 8             |
| realtime            | messages_2025_09_18                | BASE TABLE | 8             |
| realtime            | messages_2025_09_19                | BASE TABLE | 8             |
| realtime            | messages_2025_09_20                | BASE TABLE | 8             |
| realtime            | messages_2025_09_21                | BASE TABLE | 8             |
| realtime            | messages_2025_09_22                | BASE TABLE | 8             |
| realtime            | schema_migrations                  | BASE TABLE | 2             |
| realtime            | subscription                       | BASE TABLE | 7             |
| storage             | buckets                            | BASE TABLE | 11            |
| storage             | buckets_analytics                  | BASE TABLE | 7             |
| storage             | buckets_vectors                    | BASE TABLE | 4             |
| storage             | migrations                         | BASE TABLE | 4             |
| storage             | objects                            | BASE TABLE | 13            |
| storage             | prefixes                           | BASE TABLE | 5             |
| storage             | s3_multipart_uploads               | BASE TABLE | 9             |
| storage             | s3_multipart_uploads_parts         | BASE TABLE | 10            |
| storage             | vector_indexes                     | BASE TABLE | 9             |
| supabase_functions  | hooks                              | BASE TABLE | 5             |
| supabase_functions  | migrations                         | BASE TABLE | 2             |
| supabase_migrations | schema_migrations                  | BASE TABLE | 3             |
| vault               | secrets                            | BASE TABLE | 8             |
| vault               | decrypted_secrets                  | VIEW       | 9             |

-- ============================================================================
-- ETAPA 3: ESTRUTURA DETALHADA - TABELAS CORE
-- ============================================================================

-- Estrutura de PEDIDOS
SELECT 
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as aceita_null,
    column_default as valor_padrao
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'pedidos'
ORDER BY ordinal_position;


| coluna                           | tipo                     | tamanho | aceita_null | valor_padrao                                       |
| -------------------------------- | ------------------------ | ------- | ----------- | -------------------------------------------------- |
| id                               | uuid                     | null    | NO          | gen_random_uuid()                                  |
| numero_sequencial                | integer                  | null    | NO          | nextval('pedidos_numero_sequencial_seq'::regclass) |
| loja_id                          | uuid                     | null    | NO          | null                                               |
| laboratorio_id                   | uuid                     | null    | YES         | null                                               |
| classe_lente_id                  | uuid                     | null    | YES         | null                                               |
| status                           | character varying        | 20      | YES         | 'REGISTRADO'::character varying                    |
| prioridade                       | character varying        | 10      | YES         | 'NORMAL'::character varying                        |
| data_pedido                      | date                     | null    | YES         | CURRENT_DATE                                       |
| data_prometida                   | date                     | null    | YES         | null                                               |
| data_limite_pagamento            | date                     | null    | YES         | null                                               |
| data_prevista_pronto             | date                     | null    | YES         | null                                               |
| data_pagamento                   | date                     | null    | YES         | null                                               |
| data_entregue                    | date                     | null    | YES         | null                                               |
| valor_pedido                     | numeric                  | null    | YES         | null                                               |
| forma_pagamento                  | text                     | null    | YES         | null                                               |
| cliente_nome                     | text                     | null    | YES         | null                                               |
| cliente_telefone                 | text                     | null    | YES         | null                                               |
| pagamento_atrasado               | boolean                  | null    | YES         | false                                              |
| producao_atrasada                | boolean                  | null    | YES         | false                                              |
| requer_atencao                   | boolean                  | null    | YES         | false                                              |
| observacoes                      | text                     | null    | YES         | null                                               |
| observacoes_internas             | text                     | null    | YES         | null                                               |
| created_at                       | timestamp with time zone | null    | YES         | now()                                              |
| updated_at                       | timestamp with time zone | null    | YES         | now()                                              |
| created_by                       | text                     | null    | YES         | null                                               |
| numero_os_fisica                 | character varying        | 50      | YES         | null                                               |
| data_inicio_producao             | timestamp with time zone | null    | YES         | null                                               |
| data_conclusao_producao          | timestamp with time zone | null    | YES         | null                                               |
| lead_time_producao_horas         | integer                  | null    | YES         | null                                               |
| lead_time_total_horas            | integer                  | null    | YES         | null                                               |
| laboratorio_responsavel_producao | character varying        | 255     | YES         | null                                               |
| updated_by                       | character varying        | 255     | YES         | null                                               |
| custo_lentes                     | numeric                  | null    | YES         | null                                               |
| eh_garantia                      | boolean                  | null    | YES         | false                                              |
| observacoes_garantia             | text                     | null    | YES         | null                                               |
| numero_pedido_laboratorio        | character varying        | 100     | YES         | null                                               |
| vendedor_id                      | uuid                     | null    | YES         | null                                               |
| esferico_od                      | numeric                  | null    | YES         | null                                               |
| cilindrico_od                    | numeric                  | null    | YES         | null                                               |
| eixo_od                          | integer                  | null    | YES         | null                                               |
| adicao_od                        | numeric                  | null    | YES         | null                                               |
| esferico_oe                      | numeric                  | null    | YES         | null                                               |
| cilindrico_oe                    | numeric                  | null    | YES         | null                                               |
| eixo_oe                          | integer                  | null    | YES         | null                                               |
| adicao_oe                        | numeric                  | null    | YES         | null                                               |
| distancia_pupilar                | numeric                  | null    | YES         | null                                               |
| material_lente                   | text                     | null    | YES         | null                                               |
| indice_refracao                  | text                     | null    | YES         | null                                               |
| montador_id                      | uuid                     | null    | YES         | null                                               |
| data_envio_montagem              | date                     | null    | YES         | null                                               |
| data_prevista_montagem           | date                     | null    | YES         | null                                               |
| data_sla_laboratorio             | date                     | null    | YES         | null                                               |
| observacoes_sla                  | text                     | null    | YES         | null                                               |
| grupo_canonico_id                | uuid                     | null    | YES         | null                                               |
| lente_selecionada_id             | uuid                     | null    | YES         | null                                               |
| fornecedor_lente_id              | uuid                     | null    | YES         | null                                               |
| preco_lente                      | numeric                  | null    | YES         | null                                               |
| custo_lente                      | numeric                  | null    | YES         | null                                               |
| margem_lente_percentual          | numeric                  | null    | YES         | null                                               |
| nome_lente                       | text                     | null    | YES         | null                                               |
| nome_grupo_canonico              | text                     | null    | YES         | null                                               |
| tratamentos_lente                | jsonb                    | null    | YES         | '[]'::jsonb                                        |
| selecao_automatica               | boolean                  | null    | YES         | false                                              |
| lente_metadata                   | jsonb                    | null    | YES         | '{}'::jsonb                                        |
| montador_nome                    | text                     | null    | YES         | null                                               |
| montador_local                   | text                     | null    | YES         | null                                               |
| montador_contato                 | text                     | null    | YES         | null                                               |
| custo_montagem                   | numeric                  | null    | YES         | null                                               |
| data_montagem                    | timestamp with time zone | null    | YES         | null                                               |
| classe_lente                     | text                     | null    | YES         | 'prata'::text                                      |
| os_fisica                        | text                     | null    | YES         | null                                               |
| os_laboratorio                   | text                     | null    | YES         | null                                               |
| data_os                          | date                     | null    | YES         | CURRENT_DATE                                       |
| lente_catalogo_id                | text                     | null    | YES         | null                                               |
| preco_custo                      | numeric                  | null    | YES         | null                                               |
| data_previsao_entrega            | date                     | null    | YES         | null                                               |
| fornecedor_nome                  | text                     | null    | YES         | null                                               |
| fornecedor_catalogo_id           | text                     | null    | YES         | null                                               |

-- Estrutura de LABORATORIOS
SELECT 
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as aceita_null,
    column_default as valor_padrao
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'laboratorios'
ORDER BY ordinal_position;


| coluna          | tipo                     | tamanho | aceita_null | valor_padrao      |
| --------------- | ------------------------ | ------- | ----------- | ----------------- |
| id              | uuid                     | null    | NO          | gen_random_uuid() |
| nome            | text                     | null    | NO          | null              |
| codigo          | text                     | null    | YES         | null              |
| contato         | jsonb                    | null    | YES         | '{}'::jsonb       |
| sla_padrao_dias | integer                  | null    | YES         | 5                 |
| trabalha_sabado | boolean                  | null    | YES         | false             |
| ativo           | boolean                  | null    | YES         | true              |
| created_at      | timestamp with time zone | null    | YES         | now()             |


-- Estrutura de LOJAS
SELECT 
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as aceita_null,
    column_default as valor_padrao
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'lojas'
ORDER BY ordinal_position;


| coluna                | tipo                     | tamanho | aceita_null | valor_padrao      |
| --------------------- | ------------------------ | ------- | ----------- | ----------------- |
| id                    | uuid                     | null    | NO          | gen_random_uuid() |
| nome                  | text                     | null    | NO          | null              |
| codigo                | text                     | null    | NO          | null              |
| endereco              | text                     | null    | YES         | null              |
| telefone              | text                     | null    | YES         | null              |
| gerente               | text                     | null    | YES         | null              |
| ativo                 | boolean                  | null    | YES         | true              |
| created_at            | timestamp with time zone | null    | YES         | now()             |
| margem_seguranca_dias | integer                  | null    | YES         | 2                 |
| alerta_sla_dias       | integer                  | null    | YES         | 1                 |


-- Estrutura de USUARIOS
SELECT 
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as aceita_null,
    column_default as valor_padrao
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'usuarios'
ORDER BY ordinal_position;


| coluna                       | tipo                     | tamanho | aceita_null | valor_padrao      |
| ---------------------------- | ------------------------ | ------- | ----------- | ----------------- |
| id                           | uuid                     | null    | NO          | gen_random_uuid() |
| email                        | text                     | null    | NO          | null              |
| nome                         | text                     | null    | NO          | null              |
| loja_id                      | uuid                     | null    | YES         | null              |
| role                         | text                     | null    | YES         | 'operador'::text  |
| permissoes                   | ARRAY                    | null    | YES         | '{}'::text[]      |
| ativo                        | boolean                  | null    | YES         | true              |
| created_at                   | timestamp with time zone | null    | YES         | now()             |
| telefone                     | text                     | null    | YES         | null              |
| ultimo_acesso                | timestamp with time zone | null    | YES         | null              |
| updated_at                   | timestamp with time zone | null    | YES         | now()             |
| senha_hash                   | text                     | null    | YES         | null              |
| reset_token                  | text                     | null    | YES         | null              |
| reset_token_expires_at       | timestamp with time zone | null    | YES         | null              |
| user_id                      | uuid                     | null    | YES         | null              |
| pode_acessar_mission_control | boolean                  | null    | YES         | false             |

-- ============================================================================
-- ETAPA 4: RELACIONAMENTOS (FOREIGN KEYS)
-- ============================================================================
SELECT
    tc.table_schema as schema_origem,
    tc.table_name as tabela_origem,
    kcu.column_name as coluna_origem,
    ccu.table_schema as schema_destino,
    ccu.table_name as tabela_destino,
    ccu.column_name as coluna_destino,
    tc.constraint_name as nome_constraint
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;


| schema_origem | tabela_origem         | coluna_origem          | schema_destino | tabela_destino   | coluna_destino | nome_constraint                             |
| ------------- | --------------------- | ---------------------- | -------------- | ---------------- | -------------- | ------------------------------------------- |
| public        | alertas               | loja_id                | public         | lojas            | id             | alertas_loja_id_fkey                        |
| public        | alertas               | pedido_id              | public         | pedidos          | id             | alertas_pedido_id_fkey                      |
| public        | colaboradores         | loja_id                | public         | lojas            | id             | colaboradores_loja_id_fkey                  |
| public        | controle_os           | loja_id                | public         | lojas            | id             | controle_os_loja_id_fkey                    |
| public        | desafios_participacao | desafio_id             | public         | desafios         | id             | desafios_participacao_desafio_id_fkey       |
| public        | laboratorio_sla       | laboratorio_id         | public         | laboratorios     | id             | laboratorio_sla_laboratorio_id_fkey         |
| public        | laboratorio_sla       | classe_lente_id        | public         | classes_lente    | id             | laboratorio_sla_classe_lente_id_fkey        |
| public        | missoes_diarias       | usuario_responsavel_id | public         | usuarios         | id             | missoes_diarias_usuario_responsavel_id_fkey |
| public        | missoes_diarias       | delegada_para          | public         | usuarios         | id             | missoes_diarias_delegada_para_fkey          |
| public        | missoes_diarias       | template_id            | public         | missao_templates | id             | missoes_diarias_template_id_fkey            |
| public        | missoes_diarias       | loja_id                | public         | lojas            | id             | missoes_diarias_loja_id_fkey                |
| public        | montadores            | laboratorio_id         | public         | laboratorios     | id             | montadores_laboratorio_id_fkey              |
| public        | notificacoes          | usuario_id             | public         | usuarios         | id             | notificacoes_usuario_id_fkey                |
| public        | os_nao_lancadas       | loja_id                | public         | lojas            | id             | os_nao_lancadas_loja_id_fkey                |
| public        | os_nao_lancadas       | usuario_id             | public         | usuarios         | id             | os_nao_lancadas_usuario_id_fkey             |
| public        | os_sequencia          | loja_id                | public         | lojas            | id             | os_sequencia_loja_id_fkey                   |
| public        | pedido_eventos        | pedido_id              | public         | pedidos          | id             | pedido_eventos_pedido_id_fkey               |
| public        | pedido_tratamentos    | tratamento_id          | public         | tratamentos      | id             | pedido_tratamentos_tratamento_id_fkey       |
| public        | pedido_tratamentos    | pedido_id              | public         | pedidos          | id             | pedido_tratamentos_pedido_id_fkey           |
| public        | pedidos               | laboratorio_id         | public         | laboratorios     | id             | pedidos_laboratorio_id_fkey                 |
| public        | pedidos               | classe_lente_id        | public         | classes_lente    | id             | pedidos_classe_lente_id_fkey                |
| public        | pedidos               | loja_id                | public         | lojas            | id             | pedidos_loja_id_fkey                        |
| public        | pedidos               | montador_id            | public         | montadores       | id             | pedidos_montador_id_fkey                    |
| public        | pedidos               | vendedor_id            | public         | colaboradores    | id             | pedidos_vendedor_id_fkey                    |
| public        | pedidos_timeline      | responsavel_id         | public         | usuarios         | id             | pedidos_timeline_responsavel_id_fkey        |
| public        | pedidos_timeline      | pedido_id              | public         | pedidos          | id             | pedidos_timeline_pedido_id_fkey             |
| public        | user_sessions         | user_id                | public         | usuarios         | id             | user_sessions_user_id_fkey                  |
| public        | usuarios              | loja_id                | public         | lojas            | id             | usuarios_loja_id_fkey                       |

-- ============================================================================
-- ETAPA 5: CONTAGEM DE REGISTROS - SISTEMA ATUAL
-- ============================================================================
SELECT 'pedidos' as tabela, COUNT(*) as total FROM pedidos
UNION ALL
SELECT 'laboratorios' as tabela, COUNT(*) as total FROM laboratorios
UNION ALL
SELECT 'lojas' as tabela, COUNT(*) as total FROM lojas
UNION ALL
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'controle_os' as tabela, COUNT(*) as total FROM controle_os
UNION ALL
SELECT 'pedido_eventos' as tabela, COUNT(*) as total FROM pedido_eventos;


| tabela         | total |
| -------------- | ----- |
| pedidos        | 639   |
| laboratorios   | 14    |
| lojas          | 7     |
| usuarios       | 7     |
| controle_os    | 2006  |
| pedido_eventos | 9016  |

-- ============================================================================
-- ETAPA 6: INVESTIGAÇÃO - LABORATÓRIOS ATIVOS
-- ============================================================================
-- Listar todos os laboratórios cadastrados
SELECT 
    id,
    nome,
    ativo,
    created_at
FROM laboratorios
ORDER BY nome;

| id                                   | nome                         | ativo | created_at                    |
| ------------------------------------ | ---------------------------- | ----- | ----------------------------- |
| 21e9cb25-ca46-42f9-b297-db1e693325ed | 2K                           | true  | 2025-09-23 14:41:51.802404+00 |
| 3a65944b-330a-4b56-b983-f0f3de3905a1 | Blue Optical                 | true  | 2025-09-10 16:18:56.654833+00 |
| 8ce109c1-69d3-484a-a87b-8accf7984132 | Brascor                      | true  | 2025-09-10 16:18:56.654833+00 |
| d7cc1746-0749-40d6-97b6-94e50c7a1d1b | Braslentes                   | true  | 2025-09-10 16:18:56.654833+00 |
| 68233923-a12b-4c65-a3ca-7c5fec265336 | Douglas - Laboratório        | true  | 2026-01-13 11:50:01.912723+00 |
| 74dc986a-1063-4b8e-8964-59eb396e10eb | Express                      | true  | 2025-09-10 16:18:56.654833+00 |
| 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | HighVision                   | true  | 2025-09-10 16:18:56.654833+00 |
| 61f4303c-c8a3-4e3e-a064-e19783a0a2eb | Hoya                         | true  | 2025-11-13 19:44:05.585617+00 |
| a2f98c18-abb8-4434-8cc3-7bd254892894 | Polylux                      | true  | 2025-09-10 16:18:56.654833+00 |
| b3c580a3-02a3-40fa-938a-fc2a26cbc671 | So Blocos                    | true  | 2025-09-10 16:18:56.654833+00 |
| 7a45dd7b-127c-40a0-9af5-e732ca3f02a9 | Solótica - Lentes de Contato | true  | 2025-09-23 14:45:43.367958+00 |
| 3e51a952-326f-4300-86e4-153df8d7f893 | Style                        | true  | 2025-09-10 16:18:56.654833+00 |
| 2861abfc-7a83-4929-9e9f-7c2541f863f0 | Sygma                        | true  | 2025-09-10 16:18:56.654833+00 |
| f2954dac-a0a5-47db-9238-e4e2fa748281 | Thiago - Laboratório         | true  | 2026-01-13 11:49:56.74197+00  |



-- Verificar laboratórios sendo usados em pedidos
SELECT 
    l.id,
    l.nome,
    COUNT(p.id) as total_pedidos,
    MAX(p.created_at) as ultimo_pedido
FROM laboratorios l
LEFT JOIN pedidos p ON p.laboratorio_id = l.id
GROUP BY l.id, l.nome
ORDER BY total_pedidos DESC;


| id                                   | nome                         | total_pedidos | ultimo_pedido                 |
| ------------------------------------ | ---------------------------- | ------------- | ----------------------------- |
| 8ce109c1-69d3-484a-a87b-8accf7984132 | Brascor                      | 179           | 2026-01-15 00:01:30.489966+00 |
| 3e51a952-326f-4300-86e4-153df8d7f893 | Style                        | 129           | 2026-01-14 23:41:50.611151+00 |
| 2861abfc-7a83-4929-9e9f-7c2541f863f0 | Sygma                        | 114           | 2025-12-16 00:36:05.729982+00 |
| 21e9cb25-ca46-42f9-b297-db1e693325ed | 2K                           | 63            | 2026-01-13 13:42:43.946377+00 |
| d7cc1746-0749-40d6-97b6-94e50c7a1d1b | Braslentes                   | 52            | 2026-01-15 00:18:11.60548+00  |
| 74dc986a-1063-4b8e-8964-59eb396e10eb | Express                      | 38            | 2026-01-07 16:30:10.445824+00 |
| 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | HighVision                   | 35            | 2026-01-08 01:44:31.388827+00 |
| b3c580a3-02a3-40fa-938a-fc2a26cbc671 | So Blocos                    | 13            | 2025-12-23 16:19:46.750464+00 |
| 7a45dd7b-127c-40a0-9af5-e732ca3f02a9 | Solótica - Lentes de Contato | 10            | 2025-12-03 15:42:57.373888+00 |
| 68233923-a12b-4c65-a3ca-7c5fec265336 | Douglas - Laboratório        | 3             | 2026-01-13 13:49:29.941332+00 |
| 61f4303c-c8a3-4e3e-a064-e19783a0a2eb | Hoya                         | 1             | 2025-11-13 19:53:27.799852+00 |
| 3a65944b-330a-4b56-b983-f0f3de3905a1 | Blue Optical                 | 0             | null                          |
| f2954dac-a0a5-47db-9238-e4e2fa748281 | Thiago - Laboratório         | 0             | null                          |
| a2f98c18-abb8-4434-8cc3-7bd254892894 | Polylux                      | 0             | null                          |


-- ============================================================================
-- ETAPA 7: VIEWS CRÍTICAS DO SISTEMA
-- ============================================================================
-- Listar todas as views
SELECT 
    table_schema as schema,
    table_name as view_nome
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;


| schema | view_nome                          |
| ------ | ---------------------------------- |
| public | v_alertas_criticos                 |
| public | v_analise_financeira               |
| public | v_analise_sazonalidade             |
| public | v_correlacoes                      |
| public | v_dashboard_bi                     |
| public | v_dashboard_kpis                   |
| public | v_dashboard_kpis_full              |
| public | v_dashboard_resumo                 |
| public | v_evolucao_mensal                  |
| public | v_heatmap_sla                      |
| public | v_kanban_colunas                   |
| public | v_kanban_fluxo_ativo               |
| public | v_kpis_dashboard                   |
| public | v_lead_time_comparativo            |
| public | v_missoes_timeline                 |
| public | v_montadores_ativos                |
| public | v_pedido_timeline_completo         |
| public | v_pedidos_historico                |
| public | v_pedidos_kanban                   |
| public | v_pedidos_montagem                 |
| public | v_projecoes                        |
| public | v_usuario_permissoes_kanban        |
| public | view_controle_os_estatisticas      |
| public | view_controle_os_gaps              |
| public | view_kpis_montadores               |
| public | view_os_estatisticas               |
| public | view_os_gaps                       |
| public | view_performance_diaria_montadores |
| public | view_ranking_montadores            |
| public | view_relatorio_montagens           |


-- Verificar estrutura da v_dashboard_kpis (view principal do dashboard)
SELECT 
    column_name as coluna,
    data_type as tipo
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'v_dashboard_kpis'
ORDER BY ordinal_position;

| coluna                 | tipo    |
| ---------------------- | ------- |
| total_pedidos          | bigint  |
| entregues              | bigint  |
| lead_time_medio        | numeric |
| pedidos_atrasados      | bigint  |
| ticket_medio           | numeric |
| sla_compliance         | numeric |
| labs_ativos            | bigint  |
| valor_total_vendas     | numeric |
| custo_total_lentes     | numeric |
| margem_percentual      | numeric |
| pedidos_garantia       | bigint  |
| total_pedidos_anterior | integer |
| entregues_anterior     | integer |
| lead_time_anterior     | text    |
| atrasados_anterior     | integer |
| ticket_anterior        | text    |
| margem_anterior        | text    |
| sla_anterior           | text    |
| labs_anterior          | integer |
| tendencia_pedidos      | text    |
| variacao_pedidos       | text    |
| variacao_lead_time     | text    |
| variacao_sla           | text    |



-- Verificar estrutura da v_pedido_timeline_completo (histórico de eventos)
SELECT 
    column_name as coluna,
    data_type as tipo
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'v_pedido_timeline_completo'
ORDER BY ordinal_position;


| coluna                     | tipo                     |
| -------------------------- | ------------------------ |
| id                         | uuid                     |
| pedido_id                  | uuid                     |
| status_anterior            | text                     |
| status_novo                | text                     |
| responsavel_id             | uuid                     |
| observacoes                | text                     |
| created_at                 | timestamp with time zone |
| updated_at                 | timestamp with time zone |
| responsavel_nome           | text                     |
| responsavel_email          | text                     |
| etapa_anterior_data        | timestamp with time zone |
| status_anterior_real       | text                     |
| ordem_etapa                | bigint                   |
| tempo_etapa_anterior_horas | numeric                  |
| tempo_etapa_anterior_dias  | numeric                  |
| status_label               | text                     |
| status_color               | text                     |


-- ============================================================================
-- ETAPA 8: STORED PROCEDURES/FUNCTIONS
-- ============================================================================
SELECT 
    n.nspname as schema,
    p.proname as function_nome,
    pg_get_function_arguments(p.oid) as parametros,
    pg_get_function_result(p.oid) as retorno
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;


| schema | function_nome                       | parametros                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | retorno                                                                                                                                                                                                                                 |
| ------ | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| public | add_business_days                   | start_date date, days integer, laboratorio_id uuid DEFAULT NULL::uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | date                                                                                                                                                                                                                                    |
| public | alterar_status_pedido               | pedido_uuid uuid, novo_status character varying, observacao text DEFAULT NULL::text, usuario text DEFAULT NULL::text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | boolean                                                                                                                                                                                                                                 |
| public | aplicar_configuracoes_loja_horarios |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | TABLE(loja_id uuid, configuracoes_aplicadas integer, proxima_renovacao timestamp with time zone)                                                                                                                                        |
| public | atualizar_flags_atraso              | p_missao_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | boolean                                                                                                                                                                                                                                 |
| public | atualizar_liga_automatica           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | auto_entregar_pedido                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | brasil_now                          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | timestamp with time zone                                                                                                                                                                                                                |
| public | brasil_today                        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | date                                                                                                                                                                                                                                    |
| public | calcular_datas_pos_pagamento        | pedido_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | void                                                                                                                                                                                                                                    |
| public | calcular_dias_diferenca             | data_fim date, data_inicio date                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | integer                                                                                                                                                                                                                                 |
| public | calcular_dias_diferenca_timestamp   | timestamp_fim timestamp with time zone, data_inicio date                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | integer                                                                                                                                                                                                                                 |
| public | calcular_dias_uteis                 | data_inicio date, dias_adicionar integer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | date                                                                                                                                                                                                                                    |
| public | calcular_lead_time                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | calcular_liga                       | pontos_mes integer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | text                                                                                                                                                                                                                                    |
| public | calcular_margem_lente               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | calcular_pontos_missao              | p_missao_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | jsonb                                                                                                                                                                                                                                   |
| public | calcular_pontuacao_diaria           | p_loja_id uuid, p_data date                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | TABLE(pontos_possiveis integer, pontos_conquistados integer, missoes_totais integer, missoes_completadas integer, percentual_eficiencia numeric)                                                                                        |
| public | calcular_sla                        | p_data_pagamento timestamp with time zone, p_laboratorio_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | date                                                                                                                                                                                                                                    |
| public | calcular_sla_com_tratamentos        | pedido_uuid uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | integer                                                                                                                                                                                                                                 |
| public | calcular_sla_pedido                 | pedido_uuid uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | void                                                                                                                                                                                                                                    |
| public | cancelar_missao                     | p_missao_id uuid, p_motivo text, p_usuario text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | boolean                                                                                                                                                                                                                                 |
| public | concluir_missao                     | p_missao_id uuid, p_executada_por text, p_qualidade integer DEFAULT 5, p_observacoes text DEFAULT NULL::text, p_evidencia_urls text[] DEFAULT '{}'::text[]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | jsonb                                                                                                                                                                                                                                   |
| public | concluir_missao_simples             | p_missao_id uuid, p_executada_por text, p_qualidade integer DEFAULT 5, p_observacoes text DEFAULT NULL::text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | jsonb                                                                                                                                                                                                                                   |
| public | criar_alerta                        | pedido_uuid uuid, tipo_alerta text, titulo_alerta text, mensagem_alerta text, destinatario_alerta text DEFAULT NULL::text, loja_uuid uuid DEFAULT NULL::uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | uuid                                                                                                                                                                                                                                    |
| public | criar_laboratorio_para_montador     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | criar_montador_para_laboratorio     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | criar_pedido_com_permissao          | p_loja_id uuid, p_laboratorio_id uuid, p_classe_lente_id uuid, p_cliente_nome text, p_numero_pedido_laboratorio text DEFAULT NULL::text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | TABLE(id uuid, numero_sequencial integer)                                                                                                                                                                                               |
| public | criar_pedido_simples                | p_loja_id uuid, p_laboratorio_id uuid, p_classe_lente_id uuid, p_cliente_nome text, p_cliente_telefone text DEFAULT NULL::text, p_numero_os_fisica text DEFAULT NULL::text, p_numero_pedido_laboratorio text DEFAULT NULL::text, p_valor_pedido numeric DEFAULT NULL::numeric, p_custo_lentes numeric DEFAULT NULL::numeric, p_eh_garantia boolean DEFAULT false, p_observacoes text DEFAULT NULL::text, p_observacoes_garantia text DEFAULT NULL::text, p_prioridade text DEFAULT 'NORMAL'::text, p_data_prometida_cliente date DEFAULT NULL::date, p_tratamentos_ids uuid[] DEFAULT NULL::uuid[], p_montador_id uuid DEFAULT NULL::uuid | uuid                                                                                                                                                                                                                                    |
| public | criar_pedidos_realistas             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | text                                                                                                                                                                                                                                    |
| public | cron_renovacao_diaria               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | text                                                                                                                                                                                                                                    |
| public | delegar_missao                      | p_missao_id uuid, p_delegar_para uuid, p_motivo text, p_delegado_por text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | boolean                                                                                                                                                                                                                                 |
| public | deve_executar_renovacao             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | boolean                                                                                                                                                                                                                                 |
| public | enviar_para_montagem                | p_pedido_id uuid, p_montador_id uuid, p_usuario text DEFAULT NULL::text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | boolean                                                                                                                                                                                                                                 |
| public | executar_renovacao_diaria           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | TABLE(status text, lojas_processadas integer, missoes_limpas integer, pontuacoes_calculadas integer, detalhes text)                                                                                                                     |
| public | gerar_missoes_com_configuracoes     | p_data date DEFAULT CURRENT_DATE                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | TABLE(missoes_criadas integer, lojas_processadas integer, detalhes text)                                                                                                                                                                |
| public | gerar_missoes_diarias               | p_loja_id uuid, p_data date DEFAULT CURRENT_DATE                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | integer                                                                                                                                                                                                                                 |
| public | get_alertas_sla_criticos            | p_loja_id uuid DEFAULT NULL::uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | TABLE(id text, tipo text, titulo text, descricao text, pedido_os text, laboratorio text, acao_sugerida text, severidade text, dias_restantes integer)                                                                                   |
| public | get_alertas_sla_criticos            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | TABLE(pedido_id uuid, cliente_nome character varying, tipo_alerta character varying, severidade character varying, dias_restantes integer, status_atual character varying, acao_recomendada text)                                       |
| public | get_dashboard_realtime              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | json                                                                                                                                                                                                                                    |
| public | get_metricas_periodo                | data_inicio date, data_fim date                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | TABLE(periodo text, total_pedidos bigint, finalizados bigint, taxa_conclusao numeric, lead_time_medio numeric, valor_total numeric, pedidos_no_prazo bigint, pedidos_atrasados bigint)                                                  |
| public | get_performance_laboratorios        | p_loja_id uuid DEFAULT NULL::uuid, p_data_inicio date DEFAULT NULL::date, p_data_fim date DEFAULT NULL::date                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | TABLE(laboratorio_id uuid, laboratorio_nome text, total_pedidos integer, sla_cumprido integer, sla_atrasado integer, taxa_sla numeric, dias_medio_real numeric, dias_sla_prometido numeric, economia_potencial numeric, tendencia text) |
| public | get_performance_laboratorios        | p_data_inicio date DEFAULT (CURRENT_DATE - '30 days'::interval), p_data_fim date DEFAULT CURRENT_DATE                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | TABLE(laboratorio character varying, pedidos_total integer, pedidos_no_prazo integer, taxa_cumprimento numeric, tempo_medio_producao numeric, qualidade_score numeric, classificacao character varying)                                 |
| public | get_sla_metricas                    | p_loja_id uuid DEFAULT NULL::uuid, p_data_inicio date DEFAULT NULL::date, p_data_fim date DEFAULT NULL::date                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | TABLE(total_pedidos integer, sla_lab_cumprido integer, promessas_cumpridas integer, taxa_sla_lab numeric, taxa_promessa_cliente numeric, economia_margem numeric, custo_atrasos numeric)                                                |
| public | get_timeline_sla_7_dias             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | TABLE(data_referencia date, vencimentos_sla integer, entregas_prometidas integer, capacidade_estimada integer, risco_gargalo boolean, acoes_preventivas text)                                                                           |
| public | get_timeline_sla_7_dias             | p_loja_id uuid DEFAULT NULL::uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | TABLE(dia text, data date, sla_vencendo integer, promessas_vencendo integer, status text)                                                                                                                                               |
| public | get_tratamentos_pedido              | pedido_uuid uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | text                                                                                                                                                                                                                                    |
| public | iniciar_missao                      | p_missao_id uuid, p_usuario text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | boolean                                                                                                                                                                                                                                 |
| public | inserir_novo_pedido                 | p_loja_id uuid, p_laboratorio_id uuid, p_classe_lente_id uuid, p_cliente_nome text, p_numero_pedido_laboratorio text DEFAULT NULL::text, p_valor_pedido numeric DEFAULT NULL::numeric, p_observacoes text DEFAULT NULL::text, p_prioridade text DEFAULT 'NORMAL'::text                                                                                                                                                                                                                                                                                                                                                                    | json                                                                                                                                                                                                                                    |
| public | inserir_pedido_sem_trigger          | p_loja_id uuid, p_laboratorio_id uuid, p_classe_lente_id uuid, p_status text, p_prioridade text, p_cliente_nome text, p_cliente_telefone text DEFAULT NULL::text, p_observacoes text DEFAULT NULL::text, p_eh_garantia boolean DEFAULT false, p_data_pedido date DEFAULT CURRENT_DATE, p_data_prometida date DEFAULT NULL::date                                                                                                                                                                                                                                                                                                           | TABLE(id uuid, numero_sequencial integer, cliente_nome text, data_pedido date, data_prometida date, status text, prioridade text)                                                                                                       |
| public | inserir_timeline_pedido             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | is_demo_user                        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | boolean                                                                                                                                                                                                                                 |
| public | justificar_os_nao_lancada           | p_numero_os integer, p_loja_id uuid, p_justificativa text, p_tipo_justificativa text, p_usuario_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | boolean                                                                                                                                                                                                                                 |
| public | log_status_change                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | marcar_alerta_lido                  | alerta_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | boolean                                                                                                                                                                                                                                 |
| public | marcar_pagamento                    | pedido_uuid uuid, data_pag date DEFAULT CURRENT_DATE, forma_pag text DEFAULT 'PIX'::text, usuario text DEFAULT NULL::text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | boolean                                                                                                                                                                                                                                 |
| public | marcar_pago                         | pedido_id uuid, p_data_pagamento date, p_forma_pagamento text DEFAULT NULL::text, p_usuario_id uuid DEFAULT NULL::uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | jsonb                                                                                                                                                                                                                                   |
| public | mover_para_historico                | pedido_uuid uuid, novo_status character varying                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | boolean                                                                                                                                                                                                                                 |
| public | pausar_missao                       | p_missao_id uuid, p_motivo text DEFAULT NULL::text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | boolean                                                                                                                                                                                                                                 |
| public | popular_sequencia_dinamica          | p_loja_id uuid, p_numero_inicial integer DEFAULT NULL::integer, p_margem_futura integer DEFAULT 1000                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | TABLE(total_populado integer, primeira_os integer, ultima_os integer, maior_os_real integer)                                                                                                                                            |
| public | popular_sequencia_os                | p_loja_id uuid, p_numero_inicial integer, p_numero_final integer, p_origem text DEFAULT 'importacao'::text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | integer                                                                                                                                                                                                                                 |
| public | populate_data_prometida             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | proxima_renovacao                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | TABLE(proxima_data date, proxima_hora timestamp with time zone, deve_executar_agora boolean, tempo_restante interval)                                                                                                                   |
| public | recalcular_sla_pedido               | pedido_uuid uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | void                                                                                                                                                                                                                                    |
| public | refresh_dashboard_views             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | json                                                                                                                                                                                                                                    |
| public | registrar_evento                    | pedido_uuid uuid, tipo_evento character varying, titulo_evento text, descricao_evento text DEFAULT NULL::text, status_ant character varying DEFAULT NULL::character varying, status_nov character varying DEFAULT NULL::character varying, usuario_evento text DEFAULT NULL::text                                                                                                                                                                                                                                                                                                                                                         | uuid                                                                                                                                                                                                                                    |
| public | set_usuario_password                | p_email text, p_password text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | void                                                                                                                                                                                                                                    |
| public | simple_updated_at                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | simular_evolucao_pedidos            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | text                                                                                                                                                                                                                                    |
| public | status_ultima_renovacao             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | TABLE(data_renovacao date, hora_renovacao timestamp with time zone, status text, lojas_processadas integer, pontuacoes_calculadas integer, tempo_execucao interval)                                                                     |
| public | sync_controle_os                    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | sync_controle_os_from_pedido        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | testar_trigger_sistema              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | TABLE(teste text, resultado text)                                                                                                                                                                                                       |
| public | trg_set_updated_at                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | trigger_atualizar_datas_pedido      |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | trigger_atualizar_sla               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | trigger_auto_adicionar_os_sequencia |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | trigger_auto_enviar_montagem        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | trigger_criar_evento_timeline       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | trigger_gerar_missoes_diarias       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | void                                                                                                                                                                                                                                    |
| public | trigger_pedido_avancado             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | trigger_pedido_mudanca              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | trigger_registrar_historico         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | trigger_set_updated_at              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | trigger_updated_at                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | trigger_verificar_alertas           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | update_pedidos_timeline_updated_at  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | update_updated_at_column            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger                                                                                                                                                                                                                                 |
| public | validate_usuario_login              | p_email text, p_password text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | TABLE(id uuid, email text, nome text, role text, permissoes text[], loja_id uuid)                                                                                                                                                       |
| public | verificar_alertas_automaticos       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | integer                                                                                                                                                                                                                                 |


-- ============================================================================
-- ETAPA 9: INVESTIGAÇÃO - ESTRUTURA DE LENTES NO SISTEMA ATUAL
-- ============================================================================
-- Verificar TODOS os campos da tabela pedidos
SELECT 
    column_name as coluna,
    data_type as tipo,
    is_nullable as aceita_null
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'pedidos'
ORDER BY ordinal_position;


| coluna                           | tipo                     | aceita_null |
| -------------------------------- | ------------------------ | ----------- |
| id                               | uuid                     | NO          |
| numero_sequencial                | integer                  | NO          |
| loja_id                          | uuid                     | NO          |
| laboratorio_id                   | uuid                     | YES         |
| classe_lente_id                  | uuid                     | YES         |
| status                           | character varying        | YES         |
| prioridade                       | character varying        | YES         |
| data_pedido                      | date                     | YES         |
| data_prometida                   | date                     | YES         |
| data_limite_pagamento            | date                     | YES         |
| data_prevista_pronto             | date                     | YES         |
| data_pagamento                   | date                     | YES         |
| data_entregue                    | date                     | YES         |
| valor_pedido                     | numeric                  | YES         |
| forma_pagamento                  | text                     | YES         |
| cliente_nome                     | text                     | YES         |
| cliente_telefone                 | text                     | YES         |
| pagamento_atrasado               | boolean                  | YES         |
| producao_atrasada                | boolean                  | YES         |
| requer_atencao                   | boolean                  | YES         |
| observacoes                      | text                     | YES         |
| observacoes_internas             | text                     | YES         |
| created_at                       | timestamp with time zone | YES         |
| updated_at                       | timestamp with time zone | YES         |
| created_by                       | text                     | YES         |
| numero_os_fisica                 | character varying        | YES         |
| data_inicio_producao             | timestamp with time zone | YES         |
| data_conclusao_producao          | timestamp with time zone | YES         |
| lead_time_producao_horas         | integer                  | YES         |
| lead_time_total_horas            | integer                  | YES         |
| laboratorio_responsavel_producao | character varying        | YES         |
| updated_by                       | character varying        | YES         |
| custo_lentes                     | numeric                  | YES         |
| eh_garantia                      | boolean                  | YES         |
| observacoes_garantia             | text                     | YES         |
| numero_pedido_laboratorio        | character varying        | YES         |
| vendedor_id                      | uuid                     | YES         |
| esferico_od                      | numeric                  | YES         |
| cilindrico_od                    | numeric                  | YES         |
| eixo_od                          | integer                  | YES         |
| adicao_od                        | numeric                  | YES         |
| esferico_oe                      | numeric                  | YES         |
| cilindrico_oe                    | numeric                  | YES         |
| eixo_oe                          | integer                  | YES         |
| adicao_oe                        | numeric                  | YES         |
| distancia_pupilar                | numeric                  | YES         |
| material_lente                   | text                     | YES         |
| indice_refracao                  | text                     | YES         |
| montador_id                      | uuid                     | YES         |
| data_envio_montagem              | date                     | YES         |
| data_prevista_montagem           | date                     | YES         |
| data_sla_laboratorio             | date                     | YES         |
| observacoes_sla                  | text                     | YES         |
| grupo_canonico_id                | uuid                     | YES         |
| lente_selecionada_id             | uuid                     | YES         |
| fornecedor_lente_id              | uuid                     | YES         |
| preco_lente                      | numeric                  | YES         |
| custo_lente                      | numeric                  | YES         |
| margem_lente_percentual          | numeric                  | YES         |
| nome_lente                       | text                     | YES         |
| nome_grupo_canonico              | text                     | YES         |
| tratamentos_lente                | jsonb                    | YES         |
| selecao_automatica               | boolean                  | YES         |
| lente_metadata                   | jsonb                    | YES         |
| montador_nome                    | text                     | YES         |
| montador_local                   | text                     | YES         |
| montador_contato                 | text                     | YES         |
| custo_montagem                   | numeric                  | YES         |
| data_montagem                    | timestamp with time zone | YES         |
| classe_lente                     | text                     | YES         |
| os_fisica                        | text                     | YES         |
| os_laboratorio                   | text                     | YES         |
| data_os                          | date                     | YES         |
| lente_catalogo_id                | text                     | YES         |
| preco_custo                      | numeric                  | YES         |
| data_previsao_entrega            | date                     | YES         |
| fornecedor_nome                  | text                     | YES         |
| fornecedor_catalogo_id           | text                     | YES         |

-- Campos específicos de receita/lentes
SELECT 
    column_name as coluna,
    data_type as tipo
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'pedidos'
AND (column_name ILIKE '%lente%' 
     OR column_name ILIKE '%od%'
     OR column_name ILIKE '%oe%'
     OR column_name ILIKE '%esferico%'
     OR column_name ILIKE '%cilindrico%'
     OR column_name ILIKE '%adicao%'
     OR column_name ILIKE '%receita%'
     OR column_name ILIKE '%grau%')
ORDER BY ordinal_position;


| coluna                           | tipo                     |
| -------------------------------- | ------------------------ |
| classe_lente_id                  | uuid                     |
| producao_atrasada                | boolean                  |
| observacoes                      | text                     |
| observacoes_internas             | text                     |
| data_inicio_producao             | timestamp with time zone |
| data_conclusao_producao          | timestamp with time zone |
| lead_time_producao_horas         | integer                  |
| laboratorio_responsavel_producao | character varying        |
| custo_lentes                     | numeric                  |
| observacoes_garantia             | text                     |
| esferico_od                      | numeric                  |
| cilindrico_od                    | numeric                  |
| eixo_od                          | integer                  |
| adicao_od                        | numeric                  |
| esferico_oe                      | numeric                  |
| cilindrico_oe                    | numeric                  |
| eixo_oe                          | integer                  |
| adicao_oe                        | numeric                  |
| material_lente                   | text                     |
| observacoes_sla                  | text                     |
| lente_selecionada_id             | uuid                     |
| fornecedor_lente_id              | uuid                     |
| preco_lente                      | numeric                  |
| custo_lente                      | numeric                  |
| margem_lente_percentual          | numeric                  |
| nome_lente                       | text                     |
| tratamentos_lente                | jsonb                    |
| lente_metadata                   | jsonb                    |
| classe_lente                     | text                     |
| lente_catalogo_id                | text                     |



-- Verificar se há tabela de lentes/receitas
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND (table_name ILIKE '%lente%' 
     OR table_name ILIKE '%receita%'
     OR table_name ILIKE '%grau%');


| table_schema | table_name    | table_type |
| ------------ | ------------- | ---------- |
| public       | classes_lente | BASE TABLE |

-- ============================================================================
-- ETAPA 10: RLS POLICIES
-- ============================================================================
-- Listar todas as policies de RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;


| schemaname | tablename                     | policyname                                         | permissive | roles           | cmd    | qual                                                                                                                                                                                                               |
| ---------- | ----------------------------- | -------------------------------------------------- | ---------- | --------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| public     | alertas                       | Acesso completo para autenticados                  | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | alertas                       | Allow all alertas                                  | PERMISSIVE | {public}        | ALL    | true                                                                                                                                                                                                               |
| public     | alertas                       | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | alertas                       | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | classes_lente                 | Allow all classes_lente                            | PERMISSIVE | {public}        | ALL    | true                                                                                                                                                                                                               |
| public     | clientes                      | Acesso completo para autenticados                  | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | clientes                      | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | clientes                      | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | colaboradores                 | Permitir leitura para todos                        | PERMISSIVE | {authenticated} | SELECT | true                                                                                                                                                                                                               |
| public     | colaboradores                 | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | colaboradores                 | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | controle_os                   | Usuarios podem ver controle_os de sua loja         | PERMISSIVE | {authenticated} | SELECT | ((EXISTS ( SELECT 1
   FROM usuarios u
  WHERE ((u.id = auth.uid()) AND (u.role = ANY (ARRAY['gestor'::text, 'dcl'::text]))))) OR (loja_id IN ( SELECT u.loja_id
   FROM usuarios u
  WHERE (u.id = auth.uid())))) |
| public     | controle_os                   | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | controle_os                   | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | laboratorio_sla               | Allow all laboratorio_sla                          | PERMISSIVE | {public}        | ALL    | true                                                                                                                                                                                                               |
| public     | laboratorios                  | Allow all laboratorios                             | PERMISSIVE | {public}        | ALL    | true                                                                                                                                                                                                               |
| public     | laboratorios                  | Allow read laboratorios                            | PERMISSIVE | {public}        | SELECT | true                                                                                                                                                                                                               |
| public     | lojas                         | Allow all lojas                                    | PERMISSIVE | {public}        | ALL    | true                                                                                                                                                                                                               |
| public     | missoes_diarias               | Enable delete access for all users                 | PERMISSIVE | {public}        | DELETE | true                                                                                                                                                                                                               |
| public     | missoes_diarias               | Enable insert access for all users                 | PERMISSIVE | {public}        | INSERT | null                                                                                                                                                                                                               |
| public     | missoes_diarias               | Enable read access for all users                   | PERMISSIVE | {public}        | SELECT | true                                                                                                                                                                                                               |
| public     | missoes_diarias               | Enable update access for all users                 | PERMISSIVE | {public}        | UPDATE | true                                                                                                                                                                                                               |
| public     | missoes_diarias               | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | missoes_diarias               | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | missoes_diarias               | temp_dev_policy                                    | PERMISSIVE | {public}        | ALL    | true                                                                                                                                                                                                               |
| public     | montadores                    | Montadores: INSERT/UPDATE para gestores            | PERMISSIVE | {authenticated} | ALL    | (EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.role = ANY (ARRAY['admin'::text, 'gestor'::text])))))                                                                        |
| public     | montadores                    | Montadores: SELECT para autenticados               | PERMISSIVE | {authenticated} | SELECT | true                                                                                                                                                                                                               |
| public     | montadores                    | Usuários anônimos podem visualizar montadores      | PERMISSIVE | {anon}          | SELECT | true                                                                                                                                                                                                               |
| public     | montadores                    | Usuários autenticados podem visualizar montadores  | PERMISSIVE | {authenticated} | SELECT | true                                                                                                                                                                                                               |
| public     | montadores                    | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | montadores                    | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | montadores                    | montadores_all                                     | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | montadores                    | montadores_delete                                  | PERMISSIVE | {authenticated} | DELETE | true                                                                                                                                                                                                               |
| public     | montadores                    | montadores_insert                                  | PERMISSIVE | {authenticated} | INSERT | null                                                                                                                                                                                                               |
| public     | montadores                    | montadores_select                                  | PERMISSIVE | {authenticated} | SELECT | true                                                                                                                                                                                                               |
| public     | montadores                    | montadores_update                                  | PERMISSIVE | {authenticated} | UPDATE | true                                                                                                                                                                                                               |
| public     | notificacoes                  | Acesso completo para autenticados                  | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | notificacoes                  | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | notificacoes                  | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | os_nao_lancadas               | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | os_nao_lancadas               | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | os_nao_lancadas               | os_nao_lancadas_insert_all                         | PERMISSIVE | {authenticated} | INSERT | null                                                                                                                                                                                                               |
| public     | os_nao_lancadas               | os_nao_lancadas_select_all                         | PERMISSIVE | {authenticated} | SELECT | true                                                                                                                                                                                                               |
| public     | os_nao_lancadas               | os_nao_lancadas_update_all                         | PERMISSIVE | {authenticated} | UPDATE | true                                                                                                                                                                                                               |
| public     | os_sequencia                  | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | os_sequencia                  | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | os_sequencia                  | os_sequencia_insert_all                            | PERMISSIVE | {authenticated} | INSERT | null                                                                                                                                                                                                               |
| public     | os_sequencia                  | os_sequencia_select_all                            | PERMISSIVE | {authenticated} | SELECT | true                                                                                                                                                                                                               |
| public     | pedido_eventos                | Acesso completo para autenticados                  | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | pedido_eventos                | Allow all pedido_eventos                           | PERMISSIVE | {public}        | ALL    | true                                                                                                                                                                                                               |
| public     | pedido_eventos                | Todos authenticated podem atualizar pedido_eventos | PERMISSIVE | {authenticated} | UPDATE | true                                                                                                                                                                                                               |
| public     | pedido_eventos                | Todos authenticated podem deletar pedido_eventos   | PERMISSIVE | {authenticated} | DELETE | true                                                                                                                                                                                                               |
| public     | pedido_eventos                | Todos authenticated podem inserir pedido_eventos   | PERMISSIVE | {authenticated} | INSERT | null                                                                                                                                                                                                               |
| public     | pedido_eventos                | Todos authenticated podem ler pedido_eventos       | PERMISSIVE | {authenticated} | SELECT | true                                                                                                                                                                                                               |
| public     | pedido_eventos                | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | pedido_eventos                | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | pedido_tratamentos            | Acesso completo para autenticados                  | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | pedido_tratamentos            | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | pedido_tratamentos            | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | pedidos                       | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | pedidos                       | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | pedidos_historico             | Permitir leitura para todos                        | PERMISSIVE | {authenticated} | SELECT | true                                                                                                                                                                                                               |
| public     | pedidos_historico             | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | pedidos_historico             | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | pedidos_timeline              | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | pedidos_timeline              | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | pedidos_timeline              | policy_universal_timeline                          | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | role_permissions              | Permitir leitura para todos                        | PERMISSIVE | {authenticated} | SELECT | true                                                                                                                                                                                                               |
| public     | role_permissions              | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | role_permissions              | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | role_status_permissoes_legacy | Permitir leitura para todos                        | PERMISSIVE | {authenticated} | SELECT | true                                                                                                                                                                                                               |
| public     | role_status_permissoes_legacy | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | role_status_permissoes_legacy | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | sistema_config                | Allow all sistema_config                           | PERMISSIVE | {public}        | ALL    | true                                                                                                                                                                                                               |
| public     | tratamentos                   | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | tratamentos                   | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | user_sessions                 | anon_all_access                                    | PERMISSIVE | {anon}          | ALL    | true                                                                                                                                                                                                               |
| public     | user_sessions                 | authenticated_all_access                           | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                               |
| public     | usuarios                      | Allow all usuarios                                 | PERMISSIVE | {public}        | ALL    | true                                                                                                                                                                                                               |


-- ============================================================================
-- ETAPA 11: ÍNDICES
-- ============================================================================
-- Listar índices importantes
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;


| schemaname | tablename                     | indexname                                           | indexdef                                                                                                                                          |
| ---------- | ----------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| public     | alertas                       | alertas_pkey                                        | CREATE UNIQUE INDEX alertas_pkey ON public.alertas USING btree (id)                                                                               |
| public     | alertas                       | idx_alertas_lido                                    | CREATE INDEX idx_alertas_lido ON public.alertas USING btree (lido) WHERE (lido = false)                                                           |
| public     | classes_lente                 | classes_lente_codigo_key                            | CREATE UNIQUE INDEX classes_lente_codigo_key ON public.classes_lente USING btree (codigo)                                                         |
| public     | classes_lente                 | classes_lente_pkey                                  | CREATE UNIQUE INDEX classes_lente_pkey ON public.classes_lente USING btree (id)                                                                   |
| public     | clientes                      | clientes_pkey                                       | CREATE UNIQUE INDEX clientes_pkey ON public.clientes USING btree (id)                                                                             |
| public     | colaboradores                 | colaboradores_pkey                                  | CREATE UNIQUE INDEX colaboradores_pkey ON public.colaboradores USING btree (id)                                                                   |
| public     | controle_os                   | controle_os_pkey                                    | CREATE UNIQUE INDEX controle_os_pkey ON public.controle_os USING btree (numero_os, loja_id)                                                       |
| public     | controle_os                   | idx_controle_os_lancado                             | CREATE INDEX idx_controle_os_lancado ON public.controle_os USING btree (lancado) WHERE (lancado = false)                                          |
| public     | controle_os                   | idx_controle_os_loja                                | CREATE INDEX idx_controle_os_loja ON public.controle_os USING btree (loja_id)                                                                     |
| public     | desafios                      | desafios_pkey                                       | CREATE UNIQUE INDEX desafios_pkey ON public.desafios USING btree (id)                                                                             |
| public     | desafios                      | idx_desafios_ativo                                  | CREATE INDEX idx_desafios_ativo ON public.desafios USING btree (ativo)                                                                            |
| public     | desafios                      | idx_desafios_data                                   | CREATE INDEX idx_desafios_data ON public.desafios USING btree (data_inicio, data_fim)                                                             |
| public     | desafios_participacao         | desafios_participacao_desafio_id_loja_id_key        | CREATE UNIQUE INDEX desafios_participacao_desafio_id_loja_id_key ON public.desafios_participacao USING btree (desafio_id, loja_id)                |
| public     | desafios_participacao         | desafios_participacao_pkey                          | CREATE UNIQUE INDEX desafios_participacao_pkey ON public.desafios_participacao USING btree (id)                                                   |
| public     | laboratorio_sla               | laboratorio_sla_pkey                                | CREATE UNIQUE INDEX laboratorio_sla_pkey ON public.laboratorio_sla USING btree (laboratorio_id, classe_lente_id)                                  |
| public     | laboratorios                  | laboratorios_codigo_key                             | CREATE UNIQUE INDEX laboratorios_codigo_key ON public.laboratorios USING btree (codigo)                                                           |
| public     | laboratorios                  | laboratorios_pkey                                   | CREATE UNIQUE INDEX laboratorios_pkey ON public.laboratorios USING btree (id)                                                                     |
| public     | loja_acoes_customizadas       | idx_loja_acoes_customizadas_ativa                   | CREATE INDEX idx_loja_acoes_customizadas_ativa ON public.loja_acoes_customizadas USING btree (ativa)                                              |
| public     | loja_acoes_customizadas       | idx_loja_acoes_customizadas_loja                    | CREATE INDEX idx_loja_acoes_customizadas_loja ON public.loja_acoes_customizadas USING btree (loja_id)                                             |
| public     | loja_acoes_customizadas       | idx_loja_acoes_customizadas_template                | CREATE INDEX idx_loja_acoes_customizadas_template ON public.loja_acoes_customizadas USING btree (template_id)                                     |
| public     | loja_acoes_customizadas       | loja_acoes_customizadas_loja_id_template_id_key     | CREATE UNIQUE INDEX loja_acoes_customizadas_loja_id_template_id_key ON public.loja_acoes_customizadas USING btree (loja_id, template_id)          |
| public     | loja_acoes_customizadas       | loja_acoes_customizadas_pkey                        | CREATE UNIQUE INDEX loja_acoes_customizadas_pkey ON public.loja_acoes_customizadas USING btree (id)                                               |
| public     | loja_configuracoes_horario    | idx_loja_configuracoes_horario_loja                 | CREATE INDEX idx_loja_configuracoes_horario_loja ON public.loja_configuracoes_horario USING btree (loja_id)                                       |
| public     | loja_configuracoes_horario    | loja_configuracoes_horario_loja_id_key              | CREATE UNIQUE INDEX loja_configuracoes_horario_loja_id_key ON public.loja_configuracoes_horario USING btree (loja_id)                             |
| public     | loja_configuracoes_horario    | loja_configuracoes_horario_pkey                     | CREATE UNIQUE INDEX loja_configuracoes_horario_pkey ON public.loja_configuracoes_horario USING btree (id)                                         |
| public     | lojas                         | lojas_codigo_key                                    | CREATE UNIQUE INDEX lojas_codigo_key ON public.lojas USING btree (codigo)                                                                         |
| public     | lojas                         | lojas_pkey                                          | CREATE UNIQUE INDEX lojas_pkey ON public.lojas USING btree (id)                                                                                   |
| public     | missao_templates              | idx_missao_templates_ativo                          | CREATE INDEX idx_missao_templates_ativo ON public.missao_templates USING btree (ativo)                                                            |
| public     | missao_templates              | idx_missao_templates_categoria                      | CREATE INDEX idx_missao_templates_categoria ON public.missao_templates USING btree (categoria)                                                    |
| public     | missao_templates              | idx_missao_templates_tipo                           | CREATE INDEX idx_missao_templates_tipo ON public.missao_templates USING btree (tipo)                                                              |
| public     | missao_templates              | missao_templates_pkey                               | CREATE UNIQUE INDEX missao_templates_pkey ON public.missao_templates USING btree (id)                                                             |
| public     | missoes_diarias               | idx_missoes_diarias_data_vencimento                 | CREATE INDEX idx_missoes_diarias_data_vencimento ON public.missoes_diarias USING btree (data_vencimento)                                          |
| public     | missoes_diarias               | idx_missoes_diarias_loja_data                       | CREATE INDEX idx_missoes_diarias_loja_data ON public.missoes_diarias USING btree (loja_id, data_missao)                                           |
| public     | missoes_diarias               | idx_missoes_diarias_pontos                          | CREATE INDEX idx_missoes_diarias_pontos ON public.missoes_diarias USING btree (pontos_total DESC)                                                 |
| public     | missoes_diarias               | idx_missoes_diarias_status                          | CREATE INDEX idx_missoes_diarias_status ON public.missoes_diarias USING btree (status)                                                            |
| public     | missoes_diarias               | idx_missoes_diarias_usuario                         | CREATE INDEX idx_missoes_diarias_usuario ON public.missoes_diarias USING btree (usuario_responsavel_id)                                           |
| public     | missoes_diarias               | missoes_diarias_loja_id_data_missao_template_id_key | CREATE UNIQUE INDEX missoes_diarias_loja_id_data_missao_template_id_key ON public.missoes_diarias USING btree (loja_id, data_missao, template_id) |
| public     | missoes_diarias               | missoes_diarias_pkey                                | CREATE UNIQUE INDEX missoes_diarias_pkey ON public.missoes_diarias USING btree (id)                                                               |
| public     | montadores                    | montadores_pkey                                     | CREATE UNIQUE INDEX montadores_pkey ON public.montadores USING btree (id)                                                                         |
| public     | notificacoes                  | idx_notificacoes_data_criacao                       | CREATE INDEX idx_notificacoes_data_criacao ON public.notificacoes USING btree (data_criacao DESC)                                                 |
| public     | notificacoes                  | idx_notificacoes_lida                               | CREATE INDEX idx_notificacoes_lida ON public.notificacoes USING btree (lida)                                                                      |
| public     | notificacoes                  | idx_notificacoes_usuario_id                         | CREATE INDEX idx_notificacoes_usuario_id ON public.notificacoes USING btree (usuario_id)                                                          |
| public     | notificacoes                  | notificacoes_pkey                                   | CREATE UNIQUE INDEX notificacoes_pkey ON public.notificacoes USING btree (id)                                                                     |
| public     | os_nao_lancadas               | idx_os_nao_lancadas_loja                            | CREATE INDEX idx_os_nao_lancadas_loja ON public.os_nao_lancadas USING btree (loja_id)                                                             |
| public     | os_nao_lancadas               | idx_os_nao_lancadas_numero                          | CREATE INDEX idx_os_nao_lancadas_numero ON public.os_nao_lancadas USING btree (numero_os)                                                         |
| public     | os_nao_lancadas               | idx_os_nao_lancadas_resolvido                       | CREATE INDEX idx_os_nao_lancadas_resolvido ON public.os_nao_lancadas USING btree (resolvido)                                                      |
| public     | os_nao_lancadas               | os_nao_lancadas_numero_os_loja_id_key               | CREATE UNIQUE INDEX os_nao_lancadas_numero_os_loja_id_key ON public.os_nao_lancadas USING btree (numero_os, loja_id)                              |
| public     | os_nao_lancadas               | os_nao_lancadas_pkey                                | CREATE UNIQUE INDEX os_nao_lancadas_pkey ON public.os_nao_lancadas USING btree (id)                                                               |
| public     | os_sequencia                  | idx_os_sequencia_loja                               | CREATE INDEX idx_os_sequencia_loja ON public.os_sequencia USING btree (loja_id)                                                                   |
| public     | os_sequencia                  | idx_os_sequencia_numero                             | CREATE INDEX idx_os_sequencia_numero ON public.os_sequencia USING btree (numero_os)                                                               |
| public     | os_sequencia                  | os_sequencia_numero_os_key                          | CREATE UNIQUE INDEX os_sequencia_numero_os_key ON public.os_sequencia USING btree (numero_os)                                                     |
| public     | os_sequencia                  | os_sequencia_pkey                                   | CREATE UNIQUE INDEX os_sequencia_pkey ON public.os_sequencia USING btree (id)                                                                     |
| public     | pedido_eventos                | idx_eventos_pedido                                  | CREATE INDEX idx_eventos_pedido ON public.pedido_eventos USING btree (pedido_id)                                                                  |
| public     | pedido_eventos                | pedido_eventos_pkey                                 | CREATE UNIQUE INDEX pedido_eventos_pkey ON public.pedido_eventos USING btree (id)                                                                 |
| public     | pedido_tratamentos            | idx_pedido_tratamentos_pedido                       | CREATE INDEX idx_pedido_tratamentos_pedido ON public.pedido_tratamentos USING btree (pedido_id)                                                   |
| public     | pedido_tratamentos            | pedido_tratamentos_pedido_id_tratamento_id_key      | CREATE UNIQUE INDEX pedido_tratamentos_pedido_id_tratamento_id_key ON public.pedido_tratamentos USING btree (pedido_id, tratamento_id)            |
| public     | pedido_tratamentos            | pedido_tratamentos_pkey                             | CREATE UNIQUE INDEX pedido_tratamentos_pkey ON public.pedido_tratamentos USING btree (id)                                                         |
| public     | pedidos                       | idx_pedidos_classe_lente                            | CREATE INDEX idx_pedidos_classe_lente ON public.pedidos USING btree (classe_lente)                                                                |
| public     | pedidos                       | idx_pedidos_classe_lente_id                         | CREATE INDEX idx_pedidos_classe_lente_id ON public.pedidos USING btree (classe_lente_id)                                                          |
| public     | pedidos                       | idx_pedidos_created_at                              | CREATE INDEX idx_pedidos_created_at ON public.pedidos USING btree (created_at)                                                                    |
| public     | pedidos                       | idx_pedidos_data_os                                 | CREATE INDEX idx_pedidos_data_os ON public.pedidos USING btree (data_os)                                                                          |
| public     | pedidos                       | idx_pedidos_data_pedido                             | CREATE INDEX idx_pedidos_data_pedido ON public.pedidos USING btree (data_pedido)                                                                  |
| public     | pedidos                       | idx_pedidos_data_prevista_pronto                    | CREATE INDEX idx_pedidos_data_prevista_pronto ON public.pedidos USING btree (data_prevista_pronto)                                                |
| public     | pedidos                       | idx_pedidos_fornecedor_catalogo_id                  | CREATE INDEX idx_pedidos_fornecedor_catalogo_id ON public.pedidos USING btree (fornecedor_catalogo_id)                                            |
| public     | pedidos                       | idx_pedidos_fornecedor_lente                        | CREATE INDEX idx_pedidos_fornecedor_lente ON public.pedidos USING btree (fornecedor_lente_id)                                                     |
| public     | pedidos                       | idx_pedidos_fornecedor_nome                         | CREATE INDEX idx_pedidos_fornecedor_nome ON public.pedidos USING btree (fornecedor_nome)                                                          |
| public     | pedidos                       | idx_pedidos_garantia                                | CREATE INDEX idx_pedidos_garantia ON public.pedidos USING btree (eh_garantia)                                                                     |
| public     | pedidos                       | idx_pedidos_grupo_canonico                          | CREATE INDEX idx_pedidos_grupo_canonico ON public.pedidos USING btree (grupo_canonico_id)                                                         |
| public     | pedidos                       | idx_pedidos_laboratorio                             | CREATE INDEX idx_pedidos_laboratorio ON public.pedidos USING btree (laboratorio_id)                                                               |
| public     | pedidos                       | idx_pedidos_laboratorio_data                        | CREATE INDEX idx_pedidos_laboratorio_data ON public.pedidos USING btree (laboratorio_id, data_pedido)                                             |
| public     | pedidos                       | idx_pedidos_laboratorio_id                          | CREATE INDEX idx_pedidos_laboratorio_id ON public.pedidos USING btree (laboratorio_id)                                                            |
| public     | pedidos                       | idx_pedidos_lente_catalogo_id                       | CREATE INDEX idx_pedidos_lente_catalogo_id ON public.pedidos USING btree (lente_catalogo_id)                                                      |
| public     | pedidos                       | idx_pedidos_lente_selecionada                       | CREATE INDEX idx_pedidos_lente_selecionada ON public.pedidos USING btree (lente_selecionada_id)                                                   |
| public     | pedidos                       | idx_pedidos_loja                                    | CREATE INDEX idx_pedidos_loja ON public.pedidos USING btree (loja_id)                                                                             |
| public     | pedidos                       | idx_pedidos_loja_id                                 | CREATE INDEX idx_pedidos_loja_id ON public.pedidos USING btree (loja_id)                                                                          |
| public     | pedidos                       | idx_pedidos_numero_os                               | CREATE INDEX idx_pedidos_numero_os ON public.pedidos USING btree (numero_os_fisica)                                                               |
| public     | pedidos                       | idx_pedidos_numero_os_fisica                        | CREATE INDEX idx_pedidos_numero_os_fisica ON public.pedidos USING btree (numero_os_fisica)                                                        |
| public     | pedidos                       | idx_pedidos_os_fisica                               | CREATE INDEX idx_pedidos_os_fisica ON public.pedidos USING btree (os_fisica)                                                                      |
| public     | pedidos                       | idx_pedidos_os_laboratorio                          | CREATE INDEX idx_pedidos_os_laboratorio ON public.pedidos USING btree (os_laboratorio)                                                            |
| public     | pedidos                       | idx_pedidos_selecao_automatica                      | CREATE INDEX idx_pedidos_selecao_automatica ON public.pedidos USING btree (selecao_automatica) WHERE (selecao_automatica = true)                  |
| public     | pedidos                       | idx_pedidos_status                                  | CREATE INDEX idx_pedidos_status ON public.pedidos USING btree (status)                                                                            |
| public     | pedidos                       | idx_pedidos_status_data                             | CREATE INDEX idx_pedidos_status_data ON public.pedidos USING btree (status, data_pedido)                                                          |
| public     | pedidos                       | idx_pedidos_tratamentos_lente                       | CREATE INDEX idx_pedidos_tratamentos_lente ON public.pedidos USING gin (tratamentos_lente)                                                        |
| public     | pedidos                       | idx_pedidos_updated_at                              | CREATE INDEX idx_pedidos_updated_at ON public.pedidos USING btree (updated_at)                                                                    |
| public     | pedidos                       | pedidos_numero_sequencial_key                       | CREATE UNIQUE INDEX pedidos_numero_sequencial_key ON public.pedidos USING btree (numero_sequencial)                                               |
| public     | pedidos                       | pedidos_pkey                                        | CREATE UNIQUE INDEX pedidos_pkey ON public.pedidos USING btree (id)                                                                               |
| public     | pedidos_historico             | idx_historico_data                                  | CREATE INDEX idx_historico_data ON public.pedidos_historico USING btree (created_at)                                                              |
| public     | pedidos_historico             | idx_historico_pedido                                | CREATE INDEX idx_historico_pedido ON public.pedidos_historico USING btree (pedido_id)                                                             |
| public     | pedidos_historico             | pedidos_historico_pkey                              | CREATE UNIQUE INDEX pedidos_historico_pkey ON public.pedidos_historico USING btree (id)                                                           |
| public     | pedidos_timeline              | idx_pedidos_timeline_created_at                     | CREATE INDEX idx_pedidos_timeline_created_at ON public.pedidos_timeline USING btree (created_at)                                                  |
| public     | pedidos_timeline              | idx_pedidos_timeline_pedido_id                      | CREATE INDEX idx_pedidos_timeline_pedido_id ON public.pedidos_timeline USING btree (pedido_id)                                                    |
| public     | pedidos_timeline              | idx_pedidos_timeline_responsavel                    | CREATE INDEX idx_pedidos_timeline_responsavel ON public.pedidos_timeline USING btree (responsavel_id)                                             |
| public     | pedidos_timeline              | idx_pedidos_timeline_status_novo                    | CREATE INDEX idx_pedidos_timeline_status_novo ON public.pedidos_timeline USING btree (status_novo)                                                |
| public     | pedidos_timeline              | pedidos_timeline_pkey                               | CREATE UNIQUE INDEX pedidos_timeline_pkey ON public.pedidos_timeline USING btree (id)                                                             |
| public     | renovacao_diaria              | idx_renovacao_diaria_data                           | CREATE INDEX idx_renovacao_diaria_data ON public.renovacao_diaria USING btree (data_renovacao DESC)                                               |
| public     | renovacao_diaria              | idx_renovacao_diaria_status                         | CREATE INDEX idx_renovacao_diaria_status ON public.renovacao_diaria USING btree (status)                                                          |
| public     | renovacao_diaria              | renovacao_diaria_data_renovacao_key                 | CREATE UNIQUE INDEX renovacao_diaria_data_renovacao_key ON public.renovacao_diaria USING btree (data_renovacao)                                   |
| public     | renovacao_diaria              | renovacao_diaria_pkey                               | CREATE UNIQUE INDEX renovacao_diaria_pkey ON public.renovacao_diaria USING btree (id)                                                             |
| public     | role_permissions              | role_permissions_pkey1                              | CREATE UNIQUE INDEX role_permissions_pkey1 ON public.role_permissions USING btree (id)                                                            |
| public     | role_permissions              | role_permissions_role_permissao_key                 | CREATE UNIQUE INDEX role_permissions_role_permissao_key ON public.role_permissions USING btree (role, permissao)                                  |
| public     | role_status_permissoes_legacy | role_status_permissoes_pkey                         | CREATE UNIQUE INDEX role_status_permissoes_pkey ON public.role_status_permissoes_legacy USING btree (id)                                          |
| public     | role_status_permissoes_legacy | uk_role_status_legacy                               | CREATE UNIQUE INDEX uk_role_status_legacy ON public.role_status_permissoes_legacy USING btree (role, status_pedido)                               |
| public     | sistema_config                | sistema_config_pkey                                 | CREATE UNIQUE INDEX sistema_config_pkey ON public.sistema_config USING btree (chave)                                                              |
| public     | tratamentos                   | idx_tratamentos_ativo                               | CREATE INDEX idx_tratamentos_ativo ON public.tratamentos USING btree (ativo)                                                                      |
| public     | tratamentos                   | tratamentos_codigo_key                              | CREATE UNIQUE INDEX tratamentos_codigo_key ON public.tratamentos USING btree (codigo)                                                             |
| public     | tratamentos                   | tratamentos_pkey                                    | CREATE UNIQUE INDEX tratamentos_pkey ON public.tratamentos USING btree (id)                                                                       |
| public     | user_sessions                 | idx_sessions_expires                                | CREATE INDEX idx_sessions_expires ON public.user_sessions USING btree (expires_at)                                                                |
| public     | user_sessions                 | idx_sessions_token                                  | CREATE INDEX idx_sessions_token ON public.user_sessions USING btree (token)                                                                       |
| public     | user_sessions                 | idx_sessions_user_id                                | CREATE INDEX idx_sessions_user_id ON public.user_sessions USING btree (user_id)                                                                   |
| public     | user_sessions                 | user_sessions_pkey                                  | CREATE UNIQUE INDEX user_sessions_pkey ON public.user_sessions USING btree (id)                                                                   |
| public     | user_sessions                 | user_sessions_token_key                             | CREATE UNIQUE INDEX user_sessions_token_key ON public.user_sessions USING btree (token)                                                           |
| public     | usuarios                      | usuarios_email_key                                  | CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email)                                                                     |
| public     | usuarios                      | usuarios_email_lower_key                            | CREATE UNIQUE INDEX usuarios_email_lower_key ON public.usuarios USING btree (lower(email))                                                        |
| public     | usuarios                      | usuarios_pkey                                       | CREATE UNIQUE INDEX usuarios_pkey ON public.usuarios USING btree (id)                                                                             |
| public     | usuarios                      | usuarios_user_id_key                                | CREATE UNIQUE INDEX usuarios_user_id_key ON public.usuarios USING btree (user_id)                                                                 |


-- ============================================================================
-- ETAPA 12: COMPARAÇÃO COM SIS_LENS
-- ============================================================================
-- Verificar se laboratórios do desenrola_dcl existem no sis_lens core.fornecedores
-- (Executar após ter os nomes dos laboratórios das duas bases)

SELECT 
    'desenrola_dcl' as origem,
    id,
    nome,
    ativo
FROM laboratorios
ORDER BY nome;


| origem        | id                                   | nome                         | ativo |
| ------------- | ------------------------------------ | ---------------------------- | ----- |
| desenrola_dcl | 21e9cb25-ca46-42f9-b297-db1e693325ed | 2K                           | true  |
| desenrola_dcl | 3a65944b-330a-4b56-b983-f0f3de3905a1 | Blue Optical                 | true  |
| desenrola_dcl | 8ce109c1-69d3-484a-a87b-8accf7984132 | Brascor                      | true  |
| desenrola_dcl | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | Braslentes                   | true  |
| desenrola_dcl | 68233923-a12b-4c65-a3ca-7c5fec265336 | Douglas - Laboratório        | true  |
| desenrola_dcl | 74dc986a-1063-4b8e-8964-59eb396e10eb | Express                      | true  |
| desenrola_dcl | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | HighVision                   | true  |
| desenrola_dcl | 61f4303c-c8a3-4e3e-a064-e19783a0a2eb | Hoya                         | true  |
| desenrola_dcl | a2f98c18-abb8-4434-8cc3-7bd254892894 | Polylux                      | true  |
| desenrola_dcl | b3c580a3-02a3-40fa-938a-fc2a26cbc671 | So Blocos                    | true  |
| desenrola_dcl | 7a45dd7b-127c-40a0-9af5-e732ca3f02a9 | Solótica - Lentes de Contato | true  |
| desenrola_dcl | 3e51a952-326f-4300-86e4-153df8d7f893 | Style                        | true  |
| desenrola_dcl | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | Sygma                        | true  |
| desenrola_dcl | f2954dac-a0a5-47db-9238-e4e2fa748281 | Thiago - Laboratório         | true  |

-- Comparar nomes (manual) com:
-- SELECT id, nome, ativo FROM core.fornecedores WHERE tipo = 'laboratorio' ORDER BY nome;

-- ============================================================================
-- NOTAS PARA PREENCHER APÓS EXECUÇÃO:
-- ============================================================================
-- [ ] Total de schemas no sistema: _______
-- [ ] Total de tabelas principais: _______
-- [ ] Total de views: _______
-- [ ] Total de stored procedures: _______
-- [ ] Total de laboratórios cadastrados: _______
-- [ ] Total de laboratórios ATIVOS: _______
-- [ ] Total de pedidos no sistema: _______
-- [ ] Total de lojas ativas: _______
-- [ ] Há campos de lentes/receita na tabela pedidos? _______
-- [ ] Quais campos? _______
-- [ ] Há tabela separada de lentes/receitas? _______
-- [ ] Como é o relacionamento pedido -> laboratório? (campo: _______)
-- [ ] Quais views são mais críticas? _______
-- [ ] Sistema tem RLS ativo? Quantas policies? _______
-- [ ] Estrutura atual suporta pedidos SEM lentes (reparos)? _______
-- [ ] Estrutura atual tem produtos/armações? _______
-- [ ] Laboratórios desenrola_dcl estão cadastrados no sis_lens? _______
