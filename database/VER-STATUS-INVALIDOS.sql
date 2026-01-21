-- Verificar quais status INVÁLIDOS existem atualmente
SELECT 
    '=== STATUS INVÁLIDOS NO BANCO ===' as secao,
    p.status,
    COUNT(*) as quantidade,
    STRING_AGG(DISTINCT p.numero_sequencial::text, ', ' ORDER BY p.numero_sequencial::text) as exemplos
FROM pedidos p
WHERE p.status NOT IN (
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
    'CANCELADO'
)
GROUP BY p.status
ORDER BY quantidade DESC;

| secao                             | status   | quantidade | exemplos |
| --------------------------------- | -------- | ---------- | -------- |
| === STATUS INVÁLIDOS NO BANCO === | RASCUNHO | 2          | 684, 694 |



-- Ver TODOS os status únicos que existem
SELECT 
    '=== TODOS OS STATUS NO BANCO ===' as secao,
    p.status,
    COUNT(*) as quantidade
FROM pedidos p
GROUP BY p.status
ORDER BY quantidade DESC;


| secao                            | status    | quantidade |
| -------------------------------- | --------- | ---------- |
| === TODOS OS STATUS NO BANCO === | ENTREGUE  | 569        |
| === TODOS OS STATUS NO BANCO === | CANCELADO | 41         |
| === TODOS OS STATUS NO BANCO === | PRODUCAO  | 29         |
| === TODOS OS STATUS NO BANCO === | RASCUNHO  | 2          |