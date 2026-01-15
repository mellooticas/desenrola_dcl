-- =========================================
-- VERIFICAR SE PEDIDO EXISTE NA TABELA
-- =========================================
-- Execute este script no Supabase SQL Editor
-- para confirmar se o pedido realmente existe

-- 1. Verificar se o pedido existe na tabela pedidos
SELECT 
  id,
  numero_sequencial,
  numero_os_fisica,
  cliente_nome,
  status,
  loja_id,
  created_at,
  updated_at
FROM pedidos
WHERE id = 'b9374462-ac98-4b4a-984d-8fe65aaa9194';

| id                                   | numero_sequencial | numero_os_fisica | cliente_nome                | status     | loja_id                              | created_at                    | updated_at                    |
| ------------------------------------ | ----------------- | ---------------- | --------------------------- | ---------- | ------------------------------------ | ----------------------------- | ----------------------------- |
| b9374462-ac98-4b4a-984d-8fe65aaa9194 | 672               | 12665            | MARIA ROMILDA SALES A SILVA | REGISTRADO | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | 2026-01-15 00:15:22.434113+00 | 2026-01-15 00:15:22.434113+00 |


-- 2. Se não retornar nada acima, verificar se existe na VIEW
SELECT 
  id,
  numero_sequencial,
  numero_os_fisica,
  cliente_nome,
  status
FROM v_pedidos_kanban
WHERE id = 'b9374462-ac98-4b4a-984d-8fe65aaa9194';

| id                                   | numero_sequencial | numero_os_fisica | cliente_nome                | status     |
| ------------------------------------ | ----------------- | ---------------- | --------------------------- | ---------- |
| b9374462-ac98-4b4a-984d-8fe65aaa9194 | 672               | 12665            | MARIA ROMILDA SALES A SILVA | REGISTRADO |


-- 3. Tentar fazer UPDATE manual para testar
UPDATE pedidos
SET updated_at = NOW()
WHERE id = 'b9374462-ac98-4b4a-984d-8fe65aaa9194'
RETURNING id, numero_sequencial, cliente_nome;

| id                                   | numero_sequencial | cliente_nome                |
| ------------------------------------ | ----------------- | --------------------------- |
| b9374462-ac98-4b4a-984d-8fe65aaa9194 | 672               | MARIA ROMILDA SALES A SILVA |


-- 4. Verificar quantos pedidos existem no total
SELECT COUNT(*) as total_pedidos FROM pedidos;

| total_pedidos |
| ------------- |
| 637           |


-- 5. Listar os primeiros 5 pedidos para ver IDs válidos
SELECT id, numero_sequencial, numero_os_fisica, cliente_nome
FROM pedidos
ORDER BY created_at DESC
LIMIT 5;


| id                                   | numero_sequencial | numero_os_fisica | cliente_nome                                |
| ------------------------------------ | ----------------- | ---------------- | ------------------------------------------- |
| e73ccccb-9b6b-4205-9241-d039b750dffe | 673               | 12642            | SIMONE CRISTINA DE QUEIROZ OLIVEIRA (ANDRE) |
| b9374462-ac98-4b4a-984d-8fe65aaa9194 | 672               | 12665            | MARIA ROMILDA SALES A SILVA                 |
| aeb9d187-491a-47db-afb1-828dcb760089 | 671               | 12619            | REGINA SELLES PEREIRA LIMA                  |
| e9457472-1ba7-40fb-aac8-d19c60aeb6e7 | 670               | 12617            | REGINA SELLES PEREIRA LIMA                  |
| 6c75d926-452c-4745-a3d1-bd97020cd82b | 669               | 12621            | REGINALDO MACIEL DE OLIVEIRA FILHO          |
