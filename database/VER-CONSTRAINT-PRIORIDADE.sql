-- 🔍 VERIFICAR CONSTRAINT DE PRIORIDADE
-- Execute para ver os valores permitidos

SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'pedidos'::regclass
AND conname LIKE '%prioridade%';

| constraint_name          | constraint_definition                                                                                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pedidos_prioridade_check | CHECK (((prioridade)::text = ANY ((ARRAY['BAIXA'::character varying, 'NORMAL'::character varying, 'ALTA'::character varying, 'URGENTE'::character varying])::text[]))) |
