-- ============================================================
-- FIX: Adicionar RASCUNHO ao constraint (temporário)
-- ============================================================
-- Problema: Wizard criando pedidos com status='RASCUNHO'
-- Mas constraint só permite 11 status (sem RASCUNHO)
-- 
-- Solução:
-- 1. Adicionar RASCUNHO ao constraint (segurança)
-- 2. Wizard já corrigido para usar PENDENTE
-- ============================================================

-- Remover constraint atual
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_status_check;

-- Criar constraint com RASCUNHO incluído (12 status)
ALTER TABLE pedidos 
ADD CONSTRAINT pedidos_status_check 
CHECK (status IN (
    'PENDENTE',
    'REGISTRADO',
    'AG_PAGAMENTO',
    'PAGO',
    'PRODUCAO',
    'PRONTO',
    'ENVIADO',
    'CHEGOU',
    'ENTREGUE',
    'FINALIZADO',
    'CANCELADO',
    'RASCUNHO'  -- ⚠️ Temporário por segurança
));

-- Mensagem
DO $$
BEGIN
    RAISE NOTICE '✓ Constraint atualizado com RASCUNHO incluído';
    RAISE NOTICE 'ℹ️  Wizard corrigido para usar PENDENTE';
    RAISE NOTICE 'ℹ️  RASCUNHO mantido por segurança (caso algum código antigo use)';
END $$;

-- Verificar pedidos RASCUNHO existentes
SELECT 
    'Pedidos RASCUNHO no banco' as info,
    COUNT(*) as quantidade
FROM pedidos
WHERE status = 'RASCUNHO';

| info                      | quantidade |
| ------------------------- | ---------- |
| Pedidos RASCUNHO no banco | 0          |
