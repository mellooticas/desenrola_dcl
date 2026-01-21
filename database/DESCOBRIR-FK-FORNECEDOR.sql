-- Descobrir o que é fornecedor_lente_id
SELECT 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'pedidos'
AND kcu.column_name IN ('laboratorio_id', 'fornecedor_lente_id');


| table_name | column_name    | foreign_table_name | foreign_column_name |
| ---------- | -------------- | ------------------ | ------------------- |
| pedidos    | laboratorio_id | laboratorios       | id                  |
