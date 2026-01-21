-- ===================================================================
-- DEBUG: Verificar UUID do laboratório que está causando erro FK
-- ===================================================================
-- Erro: Key is not present in table "laboratorios"
-- Precisamos ver:
-- 1. Quais UUIDs existem em laboratorios
-- 2. Se fornecedor_lente_id tem UUIDs diferentes
-- 3. Qual UUID está sendo usado no insert

-- 1️⃣ LISTAR TODOS OS LABORATÓRIOS COM SEUS UUIDs
SELECT 
  id as laboratorio_uuid,
  nome_fantasia,
  ativo,
  sla_producao_dias
FROM laboratorios
ORDER BY nome_fantasia;

-- 2️⃣ VERIFICAR SE HÁ PEDIDOS COM fornecedor_lente_id
-- que NÃO existem em laboratorios
SELECT 
  COUNT(*) as total_pedidos_com_fornecedor,
  COUNT(DISTINCT fornecedor_lente_id) as fornecedores_unicos
FROM pedidos 
WHERE fornecedor_lente_id IS NOT NULL;

-- 3️⃣ LISTAR fornecedor_lente_id que NÃO existem em laboratorios
SELECT DISTINCT
  p.fornecedor_lente_id,
  COUNT(*) as qtd_pedidos_com_esse_fornecedor
FROM pedidos p
WHERE p.fornecedor_lente_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM laboratorios l 
    WHERE l.id = p.fornecedor_lente_id
  )
GROUP BY p.fornecedor_lente_id;

-- 4️⃣ SE houver fornecedor_lente_id sem match, mostrar exemplos de pedidos
SELECT 
  id,
  numero_os_fisica,
  cliente_nome,
  fornecedor_lente_id,
  laboratorio_id,
  created_at
FROM pedidos
WHERE fornecedor_lente_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM laboratorios l 
    WHERE l.id = fornecedor_lente_id
  )
ORDER BY created_at DESC
LIMIT 5;
