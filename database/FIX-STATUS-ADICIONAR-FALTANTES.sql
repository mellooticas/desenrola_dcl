-- ============================================================================
-- FIX: Adicionar status faltantes no ENUM (simples e direto)
-- Data: 17/01/2026
-- Objetivo: Oficializar os status que já estão sendo usados nos pedidos
-- ============================================================================

-- STATUS ATUALMENTE EM USO (query #2 mostrou):
-- ✅ AG_PAGAMENTO, CANCELADO, PRODUCAO, PRONTO, CHEGOU, ENTREGUE, ENVIADO
-- 
-- STATUS NO ENUM ATUAL (query #6 mostrou):
-- ❌ pendente, pago, producao, pronto, enviado, entregue, MONTAGEM
--
-- FALTAM ADICIONAR:
-- - REGISTRADO (para pedidos manuais)
-- - PENDENTE (maiúscula, para PDV futuro)
-- - AG_PAGAMENTO (já usado mas não no ENUM)
-- - PAGO (maiúscula)
-- - CHEGOU (já usado mas não no ENUM)
-- - CANCELADO (já usado mas não no ENUM)
-- - FINALIZADO (para histórico futuro)

-- ============================================================================
-- ADICIONAR STATUS FALTANTES
-- ============================================================================

-- Nota: ALTER TYPE ADD VALUE não pode rodar dentro de transaction
-- Execute cada linha INDIVIDUALMENTE no Supabase Dashboard

-- 1. PENDENTE (maiúscula) - para PDV futuro
ALTER TYPE status_pedido ADD VALUE IF NOT EXISTS 'PENDENTE';

-- 2. REGISTRADO - pedidos manuais atuais
ALTER TYPE status_pedido ADD VALUE IF NOT EXISTS 'REGISTRADO';

-- 3. AG_PAGAMENTO - aguardando pagamento financeiro
ALTER TYPE status_pedido ADD VALUE IF NOT EXISTS 'AG_PAGAMENTO';

-- 4. PAGO (maiúscula) - para consistência
ALTER TYPE status_pedido ADD VALUE IF NOT EXISTS 'PAGO';

-- 5. PRODUCAO (maiúscula) - já existe minúscula, adicionar maiúscula
ALTER TYPE status_pedido ADD VALUE IF NOT EXISTS 'PRODUCAO';

-- 6. PRONTO (maiúscula)
ALTER TYPE status_pedido ADD VALUE IF NOT EXISTS 'PRONTO';

-- 7. ENVIADO (maiúscula)
ALTER TYPE status_pedido ADD VALUE IF NOT EXISTS 'ENVIADO';

-- 8. CHEGOU - lentes chegaram na loja
ALTER TYPE status_pedido ADD VALUE IF NOT EXISTS 'CHEGOU';

-- 9. ENTREGUE (maiúscula)
ALTER TYPE status_pedido ADD VALUE IF NOT EXISTS 'ENTREGUE';

-- 10. FINALIZADO - para histórico completo
ALTER TYPE status_pedido ADD VALUE IF NOT EXISTS 'FINALIZADO';

-- 11. CANCELADO - pedidos cancelados
ALTER TYPE status_pedido ADD VALUE IF NOT EXISTS 'CANCELADO';

-- ============================================================================
-- VERIFICAR RESULTADO
-- ============================================================================

-- Ver todos os status disponíveis agora (deve ter ~18 valores)
SELECT 
  enumlabel as status_valor,
  enumsortorder as ordem,
  LENGTH(enumlabel) as tamanho,
  CASE 
    WHEN enumlabel = UPPER(enumlabel) THEN 'MAIÚSCULA ✅'
    WHEN enumlabel = LOWER(enumlabel) THEN 'minúscula (legado)'
    ELSE 'Misto'
  END as padrao
FROM pg_enum
WHERE enumtypid = 'status_pedido'::regtype
ORDER BY enumsortorder;


| status_valor | ordem | tamanho | padrao             |
| ------------ | ----- | ------- | ------------------ |
| pendente     | 1     | 8       | minúscula (legado) |
| pago         | 2     | 4       | minúscula (legado) |
| producao     | 3     | 8       | minúscula (legado) |
| pronto       | 4     | 6       | minúscula (legado) |
| enviado      | 5     | 7       | minúscula (legado) |
| entregue     | 6     | 8       | minúscula (legado) |
| MONTAGEM     | 7     | 8       | MAIÚSCULA ✅        |
| PENDENTE     | 8     | 8       | MAIÚSCULA ✅        |
| REGISTRADO   | 9     | 10      | MAIÚSCULA ✅        |
| AG_PAGAMENTO | 10    | 12      | MAIÚSCULA ✅        |
| PAGO         | 11    | 4       | MAIÚSCULA ✅        |
| PRODUCAO     | 12    | 8       | MAIÚSCULA ✅        |
| PRONTO       | 13    | 6       | MAIÚSCULA ✅        |
| ENVIADO      | 14    | 7       | MAIÚSCULA ✅        |
| CHEGOU       | 15    | 6       | MAIÚSCULA ✅        |
| ENTREGUE     | 16    | 8       | MAIÚSCULA ✅        |
| FINALIZADO   | 17    | 10      | MAIÚSCULA ✅        |
| CANCELADO    | 18    | 9       | MAIÚSCULA ✅        |



-- Ver quais status estão REALMENTE sendo usados
SELECT 
  status,
  COUNT(*) as quantidade,
  CASE 
    WHEN status = UPPER(status) THEN '✅ MAIÚSCULA (correto)'
    ELSE '⚠️ minúscula (legado)'
  END as padrao
FROM pedidos
GROUP BY status
ORDER BY quantidade DESC;


| status       | quantidade | padrao                |
| ------------ | ---------- | --------------------- |
| ENTREGUE     | 494        | ✅ MAIÚSCULA (correto) |
| CHEGOU       | 44         | ✅ MAIÚSCULA (correto) |
| CANCELADO    | 41         | ✅ MAIÚSCULA (correto) |
| PRODUCAO     | 29         | ✅ MAIÚSCULA (correto) |
| ENVIADO      | 19         | ✅ MAIÚSCULA (correto) |
| AG_PAGAMENTO | 10         | ✅ MAIÚSCULA (correto) |
| PRONTO       | 2          | ✅ MAIÚSCULA (correto) |

-- ============================================================================
-- PRONTO! ✅
-- ============================================================================
-- Agora o ENUM tem TODOS os status que o código TypeScript espera
-- O Kanban vai funcionar 100% sem erros de tipo
-- Sem triggers, sem complexidade, sem bagunça
-- ============================================================================
