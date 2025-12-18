-- Verificar range REAL de OSs da Suzano
SELECT 
  MIN(CAST(numero_os_fisica AS INTEGER)) as menor_os,
  MAX(CAST(numero_os_fisica AS INTEGER)) as maior_os,
  COUNT(DISTINCT numero_os_fisica) as total_distintas
FROM pedidos
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  AND numero_os_fisica IS NOT NULL
  AND numero_os_fisica ~ '^[0-9]+$';

-- Ver os 10 maiores números
SELECT DISTINCT
  CAST(numero_os_fisica AS INTEGER) as numero_os
FROM pedidos
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  AND numero_os_fisica IS NOT NULL
  AND numero_os_fisica ~ '^[0-9]+$'
ORDER BY numero_os DESC
LIMIT 20;

-- Ver se tem algum número suspeito (acima de 15000)
SELECT 
  numero_os_fisica,
  created_at
FROM pedidos
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  AND numero_os_fisica IS NOT NULL
  AND numero_os_fisica ~ '^[0-9]+$'
  AND CAST(numero_os_fisica AS INTEGER) > 15000
ORDER BY CAST(numero_os_fisica AS INTEGER) DESC
LIMIT 10;
