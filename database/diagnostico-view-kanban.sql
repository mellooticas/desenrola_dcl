-- DIAGNOSTICO DA VIEW v_pedidos_kanban
-- Execute essas queries e me envie os resultados

-- Query 1: Ver definição completa da view
SELECT pg_get_viewdef('v_pedidos_kanban', true);


| pg_get_viewdef                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  SELECT p.id,
    p.numero_sequencial,
    p.loja_id,
    p.laboratorio_id,
    p.classe_lente_id,
    p.status,
    p.prioridade,
    p.data_pedido,
    p.data_prometida,
    p.data_limite_pagamento,
    p.data_prevista_pronto,
    p.data_pagamento,
    p.data_entregue,
    p.valor_pedido,
    p.forma_pagamento,
    p.cliente_nome,
    p.cliente_telefone,
    p.pagamento_atrasado,
    p.producao_atrasada,
    p.requer_atencao,
    p.observacoes,
    p.observacoes_internas,
    p.created_at,
    p.updated_at,
    p.created_by,
    p.numero_os_fisica,
    p.data_inicio_producao,
    p.data_conclusao_producao,
    p.lead_time_producao_horas,
    p.lead_time_total_horas,
    p.laboratorio_responsavel_producao,
    p.updated_by,
    p.custo_lentes,
    p.eh_garantia,
    p.observacoes_garantia,
    p.numero_pedido_laboratorio,
    p.vendedor_id,
    p.esferico_od,
    p.cilindrico_od,
    p.eixo_od,
    p.adicao_od,
    p.esferico_oe,
    p.cilindrico_oe,
    p.eixo_oe,
    p.adicao_oe,
    p.distancia_pupilar,
    p.material_lente,
    p.indice_refracao,
    p.montador_id,
    p.data_envio_montagem,
    p.data_prevista_montagem,
    p.data_sla_laboratorio,
    p.observacoes_sla,
    p.grupo_canonico_id,
    p.lente_selecionada_id,
    p.fornecedor_lente_id,
    p.preco_lente,
    p.custo_lente,
    p.margem_lente_percentual,
    p.nome_lente,
    p.nome_grupo_canonico,
    p.tratamentos_lente,
    p.selecao_automatica,
    p.lente_metadata,
    l.nome AS loja_nome,
    lab.nome AS laboratorio_nome,
    cl.nome AS classe_lente_nome,
        CASE
            WHEN p.margem_lente_percentual >= 400::numeric THEN 'alta'::text
            WHEN p.margem_lente_percentual >= 300::numeric THEN 'normal'::text
            ELSE 'baixa'::text
        END AS classificacao_margem,
        CASE
            WHEN p.margem_lente_percentual >= 400::numeric THEN '🟢 Alta'::text
            WHEN p.margem_lente_percentual >= 300::numeric THEN '🟡 Normal'::text
            WHEN p.margem_lente_percentual IS NOT NULL THEN '🔴 Baixa'::text
            ELSE NULL::text
        END AS badge_margem,
    jsonb_array_length(COALESCE(p.tratamentos_lente, '[]'::jsonb)) AS qtd_tratamentos,
    p.lente_selecionada_id IS NOT NULL AS usa_catalogo_lentes,
    p.status::text = ANY (ARRAY['pendente'::character varying, 'rascunho'::character varying, 'registrado'::character varying]::text[]) AS pode_editar_numero_lab,
    p.status::text = 'pendente'::text AND p.lente_selecionada_id IS NULL AS aguardando_escolha_lente,
    p.status::text = 'registrado'::text AND (p.numero_pedido_laboratorio IS NULL OR p.numero_pedido_laboratorio::text = ''::text) AS aguardando_numero_lab,
    p.status::text = 'registrado'::text AND p.numero_pedido_laboratorio IS NOT NULL AND p.numero_pedido_laboratorio::text <> ''::text AS pode_avancar_pagamento
   FROM pedidos p
     LEFT JOIN lojas l ON p.loja_id = l.id
     LEFT JOIN laboratorios lab ON p.laboratorio_id = lab.id
     LEFT JOIN classes_lente cl ON p.classe_lente_id = cl.id
  ORDER BY (
        CASE p.status
            WHEN 'pendente'::text THEN 1
            WHEN 'rascunho'::text THEN 2
            WHEN 'registrado'::text THEN 3
            WHEN 'pago'::text THEN 4
            WHEN 'producao'::text THEN 5
            WHEN 'pronto'::text THEN 6
            WHEN 'enviado'::text THEN 7
            WHEN 'entregue'::text THEN 8
            ELSE NULL::integer
        END), p.created_at DESC; |


-- Query 2: Listar todas as colunas da view
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'v_pedidos_kanban'
ORDER BY ordinal_position;


| column_name                      | data_type                | is_nullable |
| -------------------------------- | ------------------------ | ----------- |
| id                               | uuid                     | YES         |
| numero_sequencial                | integer                  | YES         |
| loja_id                          | uuid                     | YES         |
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
| loja_nome                        | text                     | YES         |
| laboratorio_nome                 | text                     | YES         |
| classe_lente_nome                | text                     | YES         |
| classificacao_margem             | text                     | YES         |
| badge_margem                     | text                     | YES         |
| qtd_tratamentos                  | integer                  | YES         |
| usa_catalogo_lentes              | boolean                  | YES         |
| pode_editar_numero_lab           | boolean                  | YES         |
| aguardando_escolha_lente         | boolean                  | YES         |
| aguardando_numero_lab            | boolean                  | YES         |
| pode_avancar_pagamento           | boolean                  | YES         |


-- Query 3: Verificar se created_at existe especificamente
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'v_pedidos_kanban'
  AND column_name IN ('created_at', 'data_criacao', 'data_cadastro');


| column_name | data_type                |
| ----------- | ------------------------ |
| created_at  | timestamp with time zone |


-- Query 4: Testar query simples na view (limite 1 registro)
SELECT 
    id,
    numero_sequencial,
    cliente_nome,
    montador_id,
    created_at
FROM v_pedidos_kanban
WHERE montador_id IS NOT NULL
LIMIT 1;


| id                                   | numero_sequencial | cliente_nome        | montador_id                          | created_at                 |
| ------------------------------------ | ----------------- | ------------------- | ------------------------------------ | -------------------------- |
| c9a83a82-e42a-4034-bdac-e81f8febe8d8 | 646               | VALÉRIA MARIA RAMOS | 41412e4a-68af-431b-a5d7-54b96291fe37 | 2026-01-12 14:25:43.364+00 |


-- Query 5: Ver colunas de data disponíveis na view
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'v_pedidos_kanban'
  AND (data_type LIKE '%timestamp%' OR data_type LIKE '%date%')
ORDER BY column_name;


| column_name             | data_type                |
| ----------------------- | ------------------------ |
| created_at              | timestamp with time zone |
| data_conclusao_producao | timestamp with time zone |
| data_entregue           | date                     |
| data_envio_montagem     | date                     |
| data_inicio_producao    | timestamp with time zone |
| data_limite_pagamento   | date                     |
| data_pagamento          | date                     |
| data_pedido             | date                     |
| data_prevista_montagem  | date                     |
| data_prevista_pronto    | date                     |
| data_prometida          | date                     |
| data_sla_laboratorio    | date                     |
| updated_at              | timestamp with time zone |


-- Query 6: Testar ordenação por diferentes campos
SELECT 
    id,
    numero_sequencial,
    montador_id
FROM v_pedidos_kanban
WHERE montador_id IS NOT NULL
ORDER BY numero_sequencial DESC
LIMIT 3;


| id                                   | numero_sequencial | montador_id                          |
| ------------------------------------ | ----------------- | ------------------------------------ |
| c9a83a82-e42a-4034-bdac-e81f8febe8d8 | 646               | 41412e4a-68af-431b-a5d7-54b96291fe37 |
| 0df4535e-e39c-4b1c-9a83-4985158cf0ba | 644               | 56d71159-70ce-403b-8362-ebe44b18d882 |
| 542c0e60-4812-4daa-b2c2-fb2232ccbf03 | 641               | 41412e4a-68af-431b-a5d7-54b96291fe37 |