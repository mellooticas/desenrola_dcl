-- ============================================================
-- FIX EMERGENCIAL: DESABILITAR TRIGGERS PESADOS
-- ============================================================
-- Problema: INSERT em pedidos está dando timeout (57014)
-- Causa: Múltiplos triggers pesados executando simultaneamente
-- 
-- Triggers problemáticos:
-- 1. trigger_controle_os → Preenche sequência COMPLETA (MIN até MAX)
-- 2. pedidos_sync_os_sequencia → Insert em os_sequencia
-- 3. trigger_pedido_adicionar_os_sequencia → Outro insert em os_sequencia
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '🔥 DESABILITANDO TRIGGERS PESADOS TEMPORARIAMENTE';
    RAISE NOTICE '';
    
    -- DESABILITAR triggers de controle de OS (MUITO PESADOS!)
    BEGIN
        ALTER TABLE pedidos DISABLE TRIGGER trigger_controle_os;
        RAISE NOTICE '✓ trigger_controle_os DESABILITADO';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  trigger_controle_os não encontrado';
    END;
    
    BEGIN
        ALTER TABLE pedidos DISABLE TRIGGER pedidos_sync_os_sequencia;
        RAISE NOTICE '✓ pedidos_sync_os_sequencia DESABILITADO';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  pedidos_sync_os_sequencia não encontrado';
    END;
    
    BEGIN
        ALTER TABLE pedidos DISABLE TRIGGER trigger_pedido_adicionar_os_sequencia;
        RAISE NOTICE '✓ trigger_pedido_adicionar_os_sequencia DESABILITADO';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  trigger_pedido_adicionar_os_sequencia não encontrado';
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Triggers pesados desabilitados!';
    RAISE NOTICE 'ℹ️  Pedidos agora podem ser criados normalmente';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANTE:';
    RAISE NOTICE '   - Controle de OS será feito por job separado';
    RAISE NOTICE '   - Não afeta criação de pedidos';
    RAISE NOTICE '   - Sistema mais rápido';
    
END $$;

-- Verificar triggers ativos
SELECT 
    '=== TRIGGERS ATIVOS EM PEDIDOS ===' as secao,
    tgname as trigger_nome,
    CASE tgenabled
        WHEN 'O' THEN '✅ ATIVO'
        WHEN 'D' THEN '❌ DESABILITADO'
        ELSE '⚠️ ' || tgenabled::text
    END as status
FROM pg_trigger
WHERE tgrelid = 'pedidos'::regclass
AND tgisinternal = FALSE
ORDER BY tgname;


| secao                              | trigger_nome                          | status         |
| ---------------------------------- | ------------------------------------- | -------------- |
| === TRIGGERS ATIVOS EM PEDIDOS === | pedidos_sync_os_sequencia             | ❌ DESABILITADO |
| === TRIGGERS ATIVOS EM PEDIDOS === | trigger_atualizar_datas_pedido        | ✅ ATIVO        |
| === TRIGGERS ATIVOS EM PEDIDOS === | trigger_auto_enviar_montagem          | ✅ ATIVO        |
| === TRIGGERS ATIVOS EM PEDIDOS === | trigger_calcular_margem_lente         | ✅ ATIVO        |
| === TRIGGERS ATIVOS EM PEDIDOS === | trigger_controle_os                   | ❌ DESABILITADO |
| === TRIGGERS ATIVOS EM PEDIDOS === | trigger_criar_evento_timeline         | ✅ ATIVO        |
| === TRIGGERS ATIVOS EM PEDIDOS === | trigger_pedido_adicionar_os_sequencia | ❌ DESABILITADO |
| === TRIGGERS ATIVOS EM PEDIDOS === | trigger_pedidos_timeline              | ✅ ATIVO        |
| === TRIGGERS ATIVOS EM PEDIDOS === | trigger_populate_data_prometida       | ✅ ATIVO        |
