-- 🔍 VERIFICAR ESTRUTURA DA TABELA PEDIDOS
-- Execute no SQL Editor do Supabase

SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'pedidos'
ORDER BY ordinal_position;


| column_name                      | data_type                | column_default                                     | is_nullable | character_maximum_length |
| -------------------------------- | ------------------------ | -------------------------------------------------- | ----------- | ------------------------ |
| id                               | uuid                     | gen_random_uuid()                                  | NO          | null                     |
| numero_sequencial                | integer                  | nextval('pedidos_numero_sequencial_seq'::regclass) | NO          | null                     |
| loja_id                          | uuid                     | null                                               | NO          | null                     |
| laboratorio_id                   | uuid                     | null                                               | NO          | null                     |
| classe_lente_id                  | uuid                     | null                                               | NO          | null                     |
| status                           | character varying        | 'REGISTRADO'::character varying                    | YES         | 20                       |
| prioridade                       | character varying        | 'NORMAL'::character varying                        | YES         | 10                       |
| data_pedido                      | date                     | CURRENT_DATE                                       | YES         | null                     |
| data_prometida                   | date                     | null                                               | YES         | null                     |
| data_limite_pagamento            | date                     | null                                               | YES         | null                     |
| data_prevista_pronto             | date                     | null                                               | YES         | null                     |
| data_pagamento                   | date                     | null                                               | YES         | null                     |
| data_entregue                    | date                     | null                                               | YES         | null                     |
| valor_pedido                     | numeric                  | null                                               | YES         | null                     |
| forma_pagamento                  | text                     | null                                               | YES         | null                     |
| cliente_nome                     | text                     | null                                               | YES         | null                     |
| cliente_telefone                 | text                     | null                                               | YES         | null                     |
| pagamento_atrasado               | boolean                  | false                                              | YES         | null                     |
| producao_atrasada                | boolean                  | false                                              | YES         | null                     |
| requer_atencao                   | boolean                  | false                                              | YES         | null                     |
| observacoes                      | text                     | null                                               | YES         | null                     |
| observacoes_internas             | text                     | null                                               | YES         | null                     |
| created_at                       | timestamp with time zone | now()                                              | YES         | null                     |
| updated_at                       | timestamp with time zone | now()                                              | YES         | null                     |
| created_by                       | text                     | null                                               | YES         | null                     |
| numero_os_fisica                 | character varying        | null                                               | YES         | 50                       |
| data_inicio_producao             | timestamp with time zone | null                                               | YES         | null                     |
| data_conclusao_producao          | timestamp with time zone | null                                               | YES         | null                     |
| lead_time_producao_horas         | integer                  | null                                               | YES         | null                     |
| lead_time_total_horas            | integer                  | null                                               | YES         | null                     |
| laboratorio_responsavel_producao | character varying        | null                                               | YES         | 255                      |
| updated_by                       | character varying        | null                                               | YES         | 255                      |
| custo_lentes                     | numeric                  | null                                               | YES         | null                     |
| eh_garantia                      | boolean                  | false                                              | YES         | null                     |
| observacoes_garantia             | text                     | null                                               | YES         | null                     |
| numero_pedido_laboratorio        | character varying        | null                                               | YES         | 100                      |
| vendedor_id                      | uuid                     | null                                               | YES         | null                     |
| esferico_od                      | numeric                  | null                                               | YES         | null                     |
| cilindrico_od                    | numeric                  | null                                               | YES         | null                     |
| eixo_od                          | integer                  | null                                               | YES         | null                     |
| adicao_od                        | numeric                  | null                                               | YES         | null                     |
| esferico_oe                      | numeric                  | null                                               | YES         | null                     |
| cilindrico_oe                    | numeric                  | null                                               | YES         | null                     |
| eixo_oe                          | integer                  | null                                               | YES         | null                     |
| adicao_oe                        | numeric                  | null                                               | YES         | null                     |
| distancia_pupilar                | numeric                  | null                                               | YES         | null                     |
| material_lente                   | text                     | null                                               | YES         | null                     |
| indice_refracao                  | text                     | null                                               | YES         | null                     |
| montador_id                      | uuid                     | null                                               | YES         | null                     |
| data_envio_montagem              | date                     | null                                               | YES         | null                     |
| data_prevista_montagem           | date                     | null                                               | YES         | null                     |
| data_sla_laboratorio             | date                     | null                                               | YES         | null                     |
| observacoes_sla                  | text                     | null                                               | YES         | null                     |
| grupo_canonico_id                | uuid                     | null                                               | YES         | null                     |
| lente_selecionada_id             | uuid                     | null                                               | YES         | null                     |
| fornecedor_lente_id              | uuid                     | null                                               | YES         | null                     |
| preco_lente                      | numeric                  | null                                               | YES         | null                     |
| custo_lente                      | numeric                  | null                                               | YES         | null                     |
| margem_lente_percentual          | numeric                  | null                                               | YES         | null                     |
| nome_lente                       | text                     | null                                               | YES         | null                     |
| nome_grupo_canonico              | text                     | null                                               | YES         | null                     |
| tratamentos_lente                | jsonb                    | '[]'::jsonb                                        | YES         | null                     |
| selecao_automatica               | boolean                  | false                                              | YES         | null                     |
| lente_metadata                   | jsonb                    | '{}'::jsonb                                        | YES         | null                     |
| montador_nome                    | text                     | null                                               | YES         | null                     |
| montador_local                   | text                     | null                                               | YES         | null                     |
| montador_contato                 | text                     | null                                               | YES         | null                     |
| custo_montagem                   | numeric                  | null                                               | YES         | null                     |
| data_montagem                    | timestamp with time zone | null                                               | YES         | null                     |
| classe_lente                     | text                     | 'prata'::text                                      | YES         | null                     |
| os_fisica                        | text                     | null                                               | YES         | null                     |
| os_laboratorio                   | text                     | null                                               | YES         | null                     |
| data_os                          | date                     | CURRENT_DATE                                       | YES         | null                     |
| lente_catalogo_id                | text                     | null                                               | YES         | null                     |
| preco_custo                      | numeric                  | null                                               | YES         | null                     |
| data_previsao_entrega            | date                     | null                                               | YES         | null                     |