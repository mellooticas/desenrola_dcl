-- INVESTIGAR CAMPOS DE MONTAGEM
-- Execute e me envie os resultados

-- Query 1: Ver todos os campos relacionados a montagem de um pedido com montador
SELECT 
    numero_sequencial,
    montador_id,
    data_envio_montagem,
    data_prevista_montagem,
    data_conclusao_producao,
    data_inicio_producao,
    status,
    lead_time_producao_horas,
    created_at
FROM v_pedidos_kanban
WHERE montador_id IS NOT NULL
LIMIT 5;


| numero_sequencial | montador_id                          | data_envio_montagem | data_prevista_montagem | data_conclusao_producao | data_inicio_producao | status  | lead_time_producao_horas | created_at                    |
| ----------------- | ------------------------------------ | ------------------- | ---------------------- | ----------------------- | -------------------- | ------- | ------------------------ | ----------------------------- |
| 646               | 41412e4a-68af-431b-a5d7-54b96291fe37 | null                | null                   | null                    | null                 | CHEGOU  | null                     | 2026-01-12 14:25:43.364+00    |
| 644               | 56d71159-70ce-403b-8362-ebe44b18d882 | null                | null                   | null                    | null                 | ENVIADO | null                     | 2026-01-12 14:22:23.880682+00 |
| 641               | 41412e4a-68af-431b-a5d7-54b96291fe37 | null                | null                   | null                    | null                 | CHEGOU  | null                     | 2026-01-12 14:16:34.35826+00  |
| 629               | 56d71159-70ce-403b-8362-ebe44b18d882 | null                | null                   | null                    | null                 | ENVIADO | null                     | 2026-01-08 01:07:11.953504+00 |
| 583               | 56d71159-70ce-403b-8362-ebe44b18d882 | null                | null                   | null                    | null                 | ENVIADO | null                     | 2025-12-27 15:46:31.063176+00 |


problemas em alguma triggers?

-- Query 2: Contar quantos pedidos com montador têm cada campo preenchido
SELECT 
    COUNT(*) as total_com_montador,
    COUNT(data_envio_montagem) as tem_data_envio,
    COUNT(data_prevista_montagem) as tem_data_prevista,
    COUNT(data_conclusao_producao) as tem_data_conclusao,
    COUNT(data_inicio_producao) as tem_data_inicio,
    COUNT(lead_time_producao_horas) as tem_lead_time
FROM v_pedidos_kanban
WHERE montador_id IS NOT NULL;

| total_com_montador | tem_data_envio | tem_data_prevista | tem_data_conclusao | tem_data_inicio | tem_lead_time |
| ------------------ | -------------- | ----------------- | ------------------ | --------------- | ------------- |
| 7                  | 0              | 0                 | 0                  | 0               | 0             |



-- Query 3: Ver quais campos de data existem na tabela pedidos relacionados a montagem
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name LIKE '%montag%'
ORDER BY column_name;

| column_name            | data_type |
| ---------------------- | --------- |
| data_envio_montagem    | date      |
| data_prevista_montagem | date      |
