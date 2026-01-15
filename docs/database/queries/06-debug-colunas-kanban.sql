-- 🔍 Diagnóstico: Verificar view v_kanban_colunas

-- 1. Ver estrutura da view
SELECT 
    coluna_id,
    coluna_nome,
    icone,
    cor,
    ordem
FROM v_kanban_colunas
ORDER BY ordem;

| coluna_id  | coluna_nome | icone | cor     | ordem |
| ---------- | ----------- | ----- | ------- | ----- |
| pendente   | Pendente    | ⏳     | #94a3b8 | 1     |
| rascunho   | Rascunho    | 📝    | #6b7280 | 2     |
| registrado | Registrado  | 📋    | #3b82f6 | 3     |
| pago       | Pago        | 💰    | #eab308 | 4     |
| producao   | Produção    | ⚙️    | #f97316 | 5     |
| pronto     | Pronto      | ✅     | #8b5cf6 | 6     |
| enviado    | Enviado     | 📦    | #8b5cf6 | 7     |
| entregue   | Entregue    | 🎉    | #10b981 | 8     |



-- 2. Verificar se existe 'pendente' vs 'PENDENTE'
SELECT 
    coluna_id,
    UPPER(coluna_id) as coluna_id_upper,
    coluna_nome
FROM v_kanban_colunas
WHERE coluna_id ILIKE '%pend%'
ORDER BY ordem;

| coluna_id | coluna_id_upper | coluna_nome |
| --------- | --------------- | ----------- |
| pendente  | PENDENTE        | Pendente    |


-- 3. Contar total de colunas
SELECT COUNT(*) as total_colunas FROM v_kanban_colunas;

| total_colunas |
| ------------- |
| 8             |


-- 4. Ver todas as colunas não-finais (que devem aparecer no Kanban)
SELECT 
    coluna_id,
    coluna_nome,
    ordem,
    CASE 
        WHEN coluna_id IN ('entregue', 'cancelado', 'ENTREGUE', 'CANCELADO') THEN '❌ Excluir'
        ELSE '✅ Mostrar'
    END as deve_aparecer
FROM v_kanban_colunas
ORDER BY ordem;


| coluna_id  | coluna_nome | ordem | deve_aparecer |
| ---------- | ----------- | ----- | ------------- |
| pendente   | Pendente    | 1     | ✅ Mostrar     |
| rascunho   | Rascunho    | 2     | ✅ Mostrar     |
| registrado | Registrado  | 3     | ✅ Mostrar     |
| pago       | Pago        | 4     | ✅ Mostrar     |
| producao   | Produção    | 5     | ✅ Mostrar     |
| pronto     | Pronto      | 6     | ✅ Mostrar     |
| enviado    | Enviado     | 7     | ✅ Mostrar     |
| entregue   | Entregue    | 8     | ❌ Excluir     |
