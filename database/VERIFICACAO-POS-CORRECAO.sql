-- ============================================================
-- VERIFICAÇÃO PÓS-CORREÇÃO
-- ============================================================

-- Ver distribuição dos 38 pedidos após correção
SELECT 
    '=== STATUS DOS 38 PEDIDOS ===' as secao,
    status,
    COUNT(*) as quantidade
FROM pedidos
WHERE numero_sequencial IN (
    57, 61, 269, 278, 390, 453, 461, 485, 496, 506, 510, 544, 578, 594, 596, 605,
    614, 615, 616, 617, 619, 621, 622, 624, 626, 627, 629, 630, 631, 646, 650, 655,
    660, 661, 665, 671, 672, 683
)
GROUP BY status
ORDER BY 
    CASE status
        WHEN 'AG_PAGAMENTO' THEN 1
        WHEN 'PRONTO' THEN 2
        WHEN 'ENVIADO' THEN 3
        WHEN 'CHEGOU' THEN 4
        WHEN 'ENTREGUE' THEN 5
        WHEN 'PRODUCAO' THEN 6
        ELSE 99
    END;

-- Esperado:
-- AG_PAGAMENTO: 7
-- PRONTO: 1
-- ENVIADO: 5
-- CHEGOU: 25

-- Ver se timeline foi limpa
SELECT 
    '=== TIMELINE 10:49 ===' as secao,
    COUNT(*) as registros_restantes
FROM pedidos_timeline
WHERE DATE_TRUNC('minute', created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp;


| secao                  | registros_restantes |
| ---------------------- | ------------------- |
| === TIMELINE 10:49 === | 0                   |

-- Ver último status de cada pedido na timeline
SELECT 
    '=== ÚLTIMO STATUS NA TIMELINE ===' as secao,
    p.numero_sequencial,
    p.status as status_atual_pedido,
    (
        SELECT status_novo 
        FROM pedidos_timeline pt 
        WHERE pt.pedido_id = p.id 
        ORDER BY pt.created_at DESC 
        LIMIT 1
    ) as ultimo_status_timeline
FROM pedidos p
WHERE p.numero_sequencial IN (
    57, 61, 269, 278, 390, 453, 461, 485, 496, 506, 510, 544, 578, 594, 596, 605,
    614, 615, 616, 617, 619, 621, 622, 624, 626, 627, 629, 630, 631, 646, 650, 655,
    660, 661, 665, 671, 672, 683
)
ORDER BY p.numero_sequencial;


| secao                             | numero_sequencial | status_atual_pedido | ultimo_status_timeline |
| --------------------------------- | ----------------- | ------------------- | ---------------------- |
| === ÚLTIMO STATUS NA TIMELINE === | 57                | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 61                | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 269               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 278               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 390               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 453               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 461               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 485               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 496               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 506               | PRONTO              | PRONTO                 |
| === ÚLTIMO STATUS NA TIMELINE === | 510               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 544               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 578               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 594               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 596               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 605               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 614               | AG_PAGAMENTO        | AG_PAGAMENTO           |
| === ÚLTIMO STATUS NA TIMELINE === | 615               | AG_PAGAMENTO        | AG_PAGAMENTO           |
| === ÚLTIMO STATUS NA TIMELINE === | 616               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 617               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 619               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 621               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 622               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 624               | ENVIADO             | ENVIADO                |
| === ÚLTIMO STATUS NA TIMELINE === | 626               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 627               | ENVIADO             | ENVIADO                |
| === ÚLTIMO STATUS NA TIMELINE === | 629               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 630               | ENVIADO             | ENVIADO                |
| === ÚLTIMO STATUS NA TIMELINE === | 631               | AG_PAGAMENTO        | AG_PAGAMENTO           |
| === ÚLTIMO STATUS NA TIMELINE === | 646               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 650               | AG_PAGAMENTO        | AG_PAGAMENTO           |
| === ÚLTIMO STATUS NA TIMELINE === | 655               | AG_PAGAMENTO        | AG_PAGAMENTO           |
| === ÚLTIMO STATUS NA TIMELINE === | 660               | AG_PAGAMENTO        | AG_PAGAMENTO           |
| === ÚLTIMO STATUS NA TIMELINE === | 661               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 665               | CHEGOU              | CHEGOU                 |
| === ÚLTIMO STATUS NA TIMELINE === | 671               | ENVIADO             | ENVIADO                |
| === ÚLTIMO STATUS NA TIMELINE === | 672               | ENVIADO             | ENVIADO                |
| === ÚLTIMO STATUS NA TIMELINE === | 683               | AG_PAGAMENTO        | AG_PAGAMENTO           |
