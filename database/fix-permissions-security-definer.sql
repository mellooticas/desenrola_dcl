-- ================================================================
-- FIX ALTERNATIVO: Usar SECURITY DEFINER nas funções
-- Este método é mais robusto - as funções executam com permissões do owner
-- ================================================================

-- 1. Alterar função alterar_status_pedido para usar SECURITY DEFINER
ALTER FUNCTION alterar_status_pedido(uuid, text, text, text) SECURITY DEFINER;

-- 2. Alterar função marcar_pagamento para usar SECURITY DEFINER (se existir)
ALTER FUNCTION marcar_pagamento(uuid, date, text, text) SECURITY DEFINER;

-- ================================================================
-- VERIFICAÇÃO
-- ================================================================
-- Execute este SQL para verificar se funcionou:
-- 
-- SELECT 
--   routine_name, 
--   routine_type,
--   security_type
-- FROM information_schema.routines 
-- WHERE routine_name IN ('alterar_status_pedido', 'marcar_pagamento');
-- 
-- Deve retornar "DEFINER" na coluna security_type
-- ================================================================

-- ================================================================
-- EXPLICAÇÃO
-- ================================================================
-- SECURITY DEFINER faz a função executar com as permissões do usuário
-- que CRIOU a função (geralmente o admin), não do usuário que a chama.
-- 
-- Isso resolve o problema de permissão porque:
-- 1. O admin tem permissão total em pedidos_timeline
-- 2. A função executa como admin
-- 3. O usuário DCL pode chamar a função
-- 4. A função insere no timeline com permissão do admin
-- ================================================================
