-- ============================================
-- REVERTER ATRIBUIÇÕES ALEATÓRIAS DE MONTADORES
-- ============================================

-- Verificar quantos tem montador antes de limpar
SELECT 'Antes da limpeza' as momento, COUNT(*) as total_com_montador
FROM pedidos 
WHERE montador_id IS NOT NULL;

| momento          | total_com_montador |
| ---------------- | ------------------ |
| Antes da limpeza | 20                 |


-- Limpar todos os montadores atribuídos
UPDATE pedidos
SET montador_id = NULL
WHERE montador_id IS NOT NULL;

-- Verificar resultado
SELECT 'Após limpeza' as momento, COUNT(*) as total_com_montador
FROM pedidos 
WHERE montador_id IS NOT NULL;

| momento      | total_com_montador |
| ------------ | ------------------ |
| Após limpeza | 0                  |


-- Mostrar pedidos candidatos para teste de hoje
SELECT 
  'Pedidos de hoje candidatos' as info,
  COUNT(*) as total
FROM pedidos
WHERE DATE(created_at) = CURRENT_DATE
  AND status IN ('ENVIADO', 'PRODUCAO', 'CHEGOU');


| info                       | total |
| -------------------------- | ----- |
| Pedidos de hoje candidatos | 0     |
