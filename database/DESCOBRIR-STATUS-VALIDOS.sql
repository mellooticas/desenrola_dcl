-- ============================================================
-- 🔍 DESCOBRIR: QUAIS STATUS SÃO VÁLIDOS NO BANCO ATUAL?
-- ============================================================
-- Consultar o ENUM status_pedido para ver todos os valores aceitos
-- ============================================================

-- 1️⃣ LISTAR TODOS OS VALORES DO ENUM status_pedido
SELECT 
  '📋 STATUS VÁLIDOS NO ENUM' as info,
  enumlabel as status_valido,
  enumsortorder as ordem
FROM pg_enum
WHERE enumtypid = 'status_pedido'::regtype
ORDER BY enumsortorder;

| info                      | status_valido | ordem |
| ------------------------- | ------------- | ----- |
| 📋 STATUS VÁLIDOS NO ENUM | pendente      | 1     |
| 📋 STATUS VÁLIDOS NO ENUM | pago          | 2     |
| 📋 STATUS VÁLIDOS NO ENUM | producao      | 3     |
| 📋 STATUS VÁLIDOS NO ENUM | pronto        | 4     |
| 📋 STATUS VÁLIDOS NO ENUM | enviado       | 5     |
| 📋 STATUS VÁLIDOS NO ENUM | entregue      | 6     |
| 📋 STATUS VÁLIDOS NO ENUM | MONTAGEM      | 7     |
| 📋 STATUS VÁLIDOS NO ENUM | PENDENTE      | 8     |
| 📋 STATUS VÁLIDOS NO ENUM | REGISTRADO    | 9     |
| 📋 STATUS VÁLIDOS NO ENUM | AG_PAGAMENTO  | 10    |
| 📋 STATUS VÁLIDOS NO ENUM | PAGO          | 11    |
| 📋 STATUS VÁLIDOS NO ENUM | PRODUCAO      | 12    |
| 📋 STATUS VÁLIDOS NO ENUM | PRONTO        | 13    |
| 📋 STATUS VÁLIDOS NO ENUM | ENVIADO       | 14    |
| 📋 STATUS VÁLIDOS NO ENUM | CHEGOU        | 15    |
| 📋 STATUS VÁLIDOS NO ENUM | ENTREGUE      | 16    |
| 📋 STATUS VÁLIDOS NO ENUM | FINALIZADO    | 17    |
| 📋 STATUS VÁLIDOS NO ENUM | CANCELADO     | 18    |


-- 2️⃣ LISTAR STATUS ÚNICOS NA TIMELINE (histórico)
SELECT 
  '📜 STATUS NA TIMELINE' as info,
  status_novo as status_usado,
  COUNT(*) as quantidade
FROM pedidos_timeline
GROUP BY status_novo
ORDER BY quantidade DESC;

| info                  | status_usado | quantidade |
| --------------------- | ------------ | ---------- |
| 📜 STATUS NA TIMELINE | AG_PAGAMENTO | 641        |
| 📜 STATUS NA TIMELINE | ENVIADO      | 629        |
| 📜 STATUS NA TIMELINE | PRONTO       | 628        |
| 📜 STATUS NA TIMELINE | PRODUCAO     | 620        |
| 📜 STATUS NA TIMELINE | PAGO         | 618        |
| 📜 STATUS NA TIMELINE | CHEGOU       | 576        |
| 📜 STATUS NA TIMELINE | ENTREGUE     | 573        |
| 📜 STATUS NA TIMELINE | REGISTRADO   | 522        |
| 📜 STATUS NA TIMELINE | CANCELADO    | 41         |
| 📜 STATUS NA TIMELINE | RASCUNHO     | 1          |


-- 3️⃣ LISTAR STATUS ANTERIORES NA TIMELINE
SELECT 
  '📜 STATUS ANTERIORES' as info,
  status_anterior as status_usado,
  COUNT(*) as quantidade
FROM pedidos_timeline
GROUP BY status_anterior
ORDER BY quantidade DESC;


| info                 | status_usado | quantidade |
| -------------------- | ------------ | ---------- |
| 📜 STATUS ANTERIORES | REGISTRADO   | 643        |
| 📜 STATUS ANTERIORES | AG_PAGAMENTO | 641        |
| 📜 STATUS ANTERIORES | ENVIADO      | 629        |
| 📜 STATUS ANTERIORES | PRONTO       | 628        |
| 📜 STATUS ANTERIORES | PAGO         | 618        |
| 📜 STATUS ANTERIORES | PRODUCAO     | 591        |
| 📜 STATUS ANTERIORES | CHEGOU       | 576        |
| 📜 STATUS ANTERIORES | null         | 519        |
| 📜 STATUS ANTERIORES | ENTREGUE     | 4          |


-- 4️⃣ STATUS QUE APARECEM NA TIMELINE MAS NÃO ESTÃO NO ENUM (PROBLEMÁTICOS!)
SELECT 
  '⚠️  STATUS ÓRFÃOS (timeline mas não no ENUM)' as alerta,
  status_usado,
  quantidade
FROM (
  SELECT status_novo as status_usado, COUNT(*) as quantidade
  FROM pedidos_timeline
  GROUP BY status_novo
  UNION
  SELECT status_anterior as status_usado, COUNT(*) as quantidade
  FROM pedidos_timeline
  GROUP BY status_anterior
) todos_status
WHERE status_usado NOT IN (
  SELECT enumlabel FROM pg_enum WHERE enumtypid = 'status_pedido'::regtype
)
ORDER BY quantidade DESC;


| alerta                                       | status_usado | quantidade |
| -------------------------------------------- | ------------ | ---------- |
| ⚠️  STATUS ÓRFÃOS (timeline mas não no ENUM) | RASCUNHO     | 1          |






-- ============================================================
-- 🎯 EXECUTE PARA VER QUAIS STATUS SÃO VÁLIDOS!
-- ============================================================
