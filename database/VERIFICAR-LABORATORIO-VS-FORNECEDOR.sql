-- ============================================================
-- VERIFICAR: laboratorio_id vs fornecedor_lente_id
-- ============================================================

-- 1. Ver estrutura de pedidos relacionada
SELECT 
    'Colunas de pedidos' as info,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'pedidos'
AND column_name IN ('laboratorio_id', 'fornecedor_lente_id')
ORDER BY column_name;

| info               | column_name         | data_type | udt_name |
| ------------------ | ------------------- | --------- | -------- |
| Colunas de pedidos | fornecedor_lente_id | uuid      | uuid     |
| Colunas de pedidos | laboratorio_id      | uuid      | uuid     |


qeu bagunça

-- 2. Ver registros em laboratorios
SELECT 
    'Tabela LABORATORIOS' as tabela,
    id,
    nome,
    ativo,
    sla_padrao_dias
FROM laboratorios
LIMIT 5;


| tabela              | id                                   | nome         | ativo | sla_padrao_dias |
| ------------------- | ------------------------------------ | ------------ | ----- | --------------- |
| Tabela LABORATORIOS | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | Braslentes   | true  | 10              |
| Tabela LABORATORIOS | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | Sygma        | true  | 7               |
| Tabela LABORATORIOS | 3a65944b-330a-4b56-b983-f0f3de3905a1 | Blue Optical | true  | 7               |
| Tabela LABORATORIOS | 8ce109c1-69d3-484a-a87b-8accf7984132 | Brascor      | true  | 7               |
| Tabela LABORATORIOS | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | HighVision   | true  | 7               |

-- 3. Ver registros em fornecedores
SELECT 
    'Tabela FORNECEDORES' as tabela,
    id,
    nome_fantasia,
    razao_social,
    ativo
FROM fornecedores
LIMIT 5;

Error: Failed to run sql query: ERROR: 42P01: relation "fornecedores" does not exist LINE 9: FROM fornecedores ^




-- 4. Ver pedidos existentes para entender o padrão
SELECT 
    'Pedidos existentes' as info,
    numero_sequencial,
    tipo_pedido,
    laboratorio_id,
    fornecedor_lente_id,
    (SELECT nome FROM laboratorios WHERE id = p.laboratorio_id) as laboratorio_nome,
    (SELECT nome_fantasia FROM fornecedores WHERE id = p.fornecedor_lente_id) as fornecedor_nome
FROM pedidos p
WHERE tipo_pedido IN ('LENTES', 'COMPLETO')
AND (laboratorio_id IS NOT NULL OR fornecedor_lente_id IS NOT NULL)
LIMIT 10;


Error: Failed to run sql query: ERROR: 42P01: relation "fornecedores" does not exist LINE 10: (SELECT nome_fantasia FROM fornecedores WHERE id = p.fornecedor_lente_id) as fornecedor_nome ^



