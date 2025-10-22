-- ===================================================================
-- CORREÇÃO: Resetar sequence do numero_sequencial
-- Data: 22/10/2025
-- Descrição: Ajusta a sequence para o próximo valor disponível
-- ===================================================================

-- Método 1: Verificar estado atual
SELECT 
  'Maior numero_sequencial na tabela: ' || COALESCE(MAX(numero_sequencial), 0) as info
FROM pedidos;

-- Método 2: Ajustar sequence automaticamente
DO $$
DECLARE
  max_seq INTEGER;
BEGIN
  -- Buscar maior valor atual
  SELECT COALESCE(MAX(numero_sequencial), 0) INTO max_seq FROM pedidos;
  
  -- Ajustar sequence para o próximo valor
  PERFORM setval(
    pg_get_serial_sequence('pedidos', 'numero_sequencial'),
    max_seq,
    true  -- true = próximo valor será max_seq + 1
  );
  
  RAISE NOTICE 'Sequence ajustada! Próximo numero_sequencial será: %', max_seq + 1;
END $$;

-- Verificar resultado
SELECT 
  pg_get_serial_sequence('pedidos', 'numero_sequencial') as sequence_name,
  last_value as valor_atual,
  last_value + 1 as proximo_valor
FROM pedidos_numero_sequencial_seq;
