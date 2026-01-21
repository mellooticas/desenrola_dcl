-- ============================================================
-- DIAGNÓSTICO: Status dos pedidos e colunas do Kanban
-- ============================================================
-- Investigar onde cada pedido está e por que não carrega no kanban
-- ============================================================

-- 1️⃣ DISTRIBUIÇÃO DE PEDIDOS POR STATUS (visão geral)
SELECT 
  status,
  COUNT(*) as total_pedidos,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM pedidos
GROUP BY status
ORDER BY total_pedidos DESC;

| status    | total_pedidos | percentual |
| --------- | ------------- | ---------- |
| ENTREGUE  | 569           | 88.77      |
| CANCELADO | 41            | 6.40       |
| PRODUCAO  | 29            | 4.52       |
| RASCUNHO  | 2             | 0.31       |



-- 2️⃣ LISTA TODOS OS PEDIDOS COM INFORMAÇÕES CHAVE
SELECT 
  id,
  numero_sequencial as "#OS",
  status,
  loja_id,
  laboratorio_id,
  data_pedido::date as data,
  created_at::date as criado_em,
  updated_at::date as atualizado_em
FROM pedidos
ORDER BY numero_sequencial DESC
LIMIT 50;

| id                                   | #OS | status    | loja_id                              | laboratorio_id                       | data       | criado_em  | atualizado_em |
| ------------------------------------ | --- | --------- | ------------------------------------ | ------------------------------------ | ---------- | ---------- | ------------- |
| e51f2e04-7e86-422e-bcfd-3ba50a6d213b | 694 | RASCUNHO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | null                                 | 2026-01-21 | 2026-01-21 | 2026-01-21    |
| 501d27f7-47fb-46fb-af2f-a9bb29eb6f8d | 684 | RASCUNHO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | null                                 | 2026-01-19 | 2026-01-19 | 2026-01-21    |
| d747b999-694c-4ad8-a9dc-519fb4d51579 | 683 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | null                                 | 2026-01-17 | 2026-01-17 | 2026-01-21    |
| 18ebd8aa-7245-4355-9ffe-87188ab91575 | 682 | CANCELADO | bab835bc-2df1-4f54-87c3-8151c61ec642 | null                                 | 2026-01-16 | 2026-01-16 | 2026-01-19    |
| e73ccccb-9b6b-4205-9241-d039b750dffe | 673 | CANCELADO | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-15 | 2026-01-15 | 2026-01-19    |
| b9374462-ac98-4b4a-984d-8fe65aaa9194 | 672 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-15 | 2026-01-15 | 2026-01-21    |
| aeb9d187-491a-47db-afb1-828dcb760089 | 671 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | 2026-01-15 | 2026-01-15 | 2026-01-21    |
| e9457472-1ba7-40fb-aac8-d19c60aeb6e7 | 670 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | 2026-01-14 | 2026-01-14 | 2026-01-21    |
| 6c75d926-452c-4745-a3d1-bd97020cd82b | 669 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | 2026-01-14 | 2026-01-14 | 2026-01-21    |
| 78c44a99-8f71-4c69-adf1-b1d228e9aa12 | 668 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | 2026-01-14 | 2026-01-14 | 2026-01-21    |
| 1fbfa297-a1f1-48ac-a6c2-129a4b1f97bf | 667 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | 2026-01-14 | 2026-01-14 | 2026-01-21    |
| 1d6cc18e-6e6b-48d8-a30b-ad924b10fb87 | 666 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | 2026-01-14 | 2026-01-14 | 2026-01-21    |
| 6d5c0a69-1baa-475a-86ad-a2f04b2a48f9 | 665 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 3e51a952-326f-4300-86e4-153df8d7f893 | 2026-01-14 | 2026-01-14 | 2026-01-21    |
| 11cd698f-db07-429f-89aa-7fe40b4e263d | 663 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-14 | 2026-01-14 | 2026-01-19    |
| d50ba831-e23c-4780-85c1-55c03cf1d2b3 | 662 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 3e51a952-326f-4300-86e4-153df8d7f893 | 2026-01-13 | 2026-01-13 | 2026-01-21    |
| 6c042a43-c816-4555-a998-3f776badd662 | 661 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 3e51a952-326f-4300-86e4-153df8d7f893 | 2026-01-13 | 2026-01-13 | 2026-01-21    |
| 1512d395-ccdb-415c-8379-e9f2077c9413 | 660 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 68233923-a12b-4c65-a3ca-7c5fec265336 | 2026-01-13 | 2026-01-13 | 2026-01-21    |
| 3acaace0-78b4-4d5d-a567-812f43534c5e | 659 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 68233923-a12b-4c65-a3ca-7c5fec265336 | 2026-01-13 | 2026-01-13 | 2026-01-20    |
| 026a4b95-440e-41e0-8434-bce90c809087 | 658 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 21e9cb25-ca46-42f9-b297-db1e693325ed | 2026-01-13 | 2026-01-13 | 2026-01-19    |
| 36329608-c08a-426c-8a58-845078c8ea23 | 657 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 21e9cb25-ca46-42f9-b297-db1e693325ed | 2026-01-13 | 2026-01-13 | 2026-01-19    |
| 63d71878-01d7-4055-b886-c9851dcda119 | 656 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 21e9cb25-ca46-42f9-b297-db1e693325ed | 2026-01-13 | 2026-01-13 | 2026-01-20    |
| fb650ea1-670f-4194-91f5-982710d15333 | 655 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 68233923-a12b-4c65-a3ca-7c5fec265336 | 2026-01-13 | 2026-01-13 | 2026-01-21    |
| 3dedea00-4b82-4df0-aa92-e7a731e43bab | 654 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-12 | 2026-01-12 | 2026-01-21    |
| c194179b-8e6d-488f-a388-29242b54095c | 653 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-12 | 2026-01-12 | 2026-01-20    |
| bfebe7de-f824-452f-94ea-f83dbb779e1b | 652 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-12 | 2026-01-12 | 2026-01-20    |
| 988a106e-5ba1-406a-991f-7be35dced4b4 | 651 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-12 | 2026-01-12 | 2026-01-20    |
| 74f9f01a-5644-489d-8f6c-f37e640a0cbe | 650 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 21e9cb25-ca46-42f9-b297-db1e693325ed | 2026-01-12 | 2026-01-12 | 2026-01-21    |
| 493d9300-5bd7-48b9-ae12-8d7b9dc174d7 | 649 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-12 | 2026-01-12 | 2026-01-20    |
| 36f612db-54e2-4d4c-a7de-63bd1787aad9 | 648 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-12 | 2026-01-12 | 2026-01-20    |
| 4eba0375-bb43-4fa1-8e46-956ae357717d | 647 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-12 | 2026-01-12 | 2026-01-20    |
| c9a83a82-e42a-4034-bdac-e81f8febe8d8 | 646 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-12 | 2026-01-12 | 2026-01-21    |
| c73a98c3-c5b0-4479-a206-299608c9a1db | 645 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-12 | 2026-01-12 | 2026-01-20    |
| 0df4535e-e39c-4b1c-9a83-4985158cf0ba | 644 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-12 | 2026-01-12 | 2026-01-19    |
| 5ed4aea0-6113-4e3b-bff0-c6a47cfc87fa | 643 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-12 | 2026-01-12 | 2026-01-19    |
| 3e7a4185-bcc6-4bf8-8945-49bed640771b | 642 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-12 | 2026-01-12 | 2026-01-19    |
| 542c0e60-4812-4daa-b2c2-fb2232ccbf03 | 641 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-12 | 2026-01-12 | 2026-01-20    |
| 75a2ee96-f2a5-4b21-b808-d786e630b400 | 640 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-08 | 2026-01-08 | 2026-01-19    |
| 0039c138-7b2b-4613-9fe3-4632657701ff | 639 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-08 | 2026-01-08 | 2026-01-19    |
| f5a96aaf-8120-4c8d-bc83-20171bec84a7 | 638 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 2026-01-08 | 2026-01-08 | 2026-01-20    |
| 3a54b740-9894-4727-b9e3-dde53f7b8b63 | 637 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 21e9cb25-ca46-42f9-b297-db1e693325ed | 2026-01-08 | 2026-01-08 | 2026-01-19    |
| a6fcc921-2a40-4e35-a4f8-fd9da926548e | 636 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 21e9cb25-ca46-42f9-b297-db1e693325ed | 2026-01-08 | 2026-01-08 | 2026-01-19    |
| f8690f7a-e09e-48a4-af3f-abef417e180d | 635 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 21e9cb25-ca46-42f9-b297-db1e693325ed | 2026-01-08 | 2026-01-08 | 2026-01-20    |
| 30b73620-1724-4303-90b2-2b63b6b6f488 | 631 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | 2026-01-08 | 2026-01-08 | 2026-01-21    |
| 24b55d6a-2938-4ca5-a55b-313cb891d0da | 630 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | 2026-01-08 | 2026-01-08 | 2026-01-21    |
| 683660d7-25f5-4075-9e01-f20d89b4c294 | 629 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | 2026-01-08 | 2026-01-08 | 2026-01-21    |
| 9b99fe5b-2009-4e12-ada9-941ddbc0803b | 628 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | 2026-01-08 | 2026-01-08 | 2026-01-21    |
| d12459a9-4495-4d51-af6b-3793c016bf77 | 627 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | 2026-01-08 | 2026-01-08 | 2026-01-21    |
| 75dd6131-9ba5-4d10-bcdc-57f52a89be91 | 626 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | 2026-01-08 | 2026-01-08 | 2026-01-21    |
| d4622412-2d7c-4e45-9a56-48d5d077733d | 625 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | 2026-01-08 | 2026-01-08 | 2026-01-21    |
| 6ea130a7-315e-4ef7-ac36-c53cd0f69471 | 624 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | 2026-01-08 | 2026-01-08 | 2026-01-21    |


-- 3️⃣ PEDIDOS QUE DEVERIAM APARECER NO KANBAN (8 colunas operacionais)
SELECT 
  status,
  COUNT(*) as total,
  ARRAY_AGG(numero_sequencial ORDER BY numero_sequencial DESC) FILTER (WHERE numero_sequencial IS NOT NULL) as pedidos_exemplo
FROM pedidos
WHERE status IN ('PENDENTE', 'REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU')
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'PENDENTE' THEN 1
    WHEN 'REGISTRADO' THEN 2
    WHEN 'AG_PAGAMENTO' THEN 3
    WHEN 'PAGO' THEN 4
    WHEN 'PRODUCAO' THEN 5
    WHEN 'PRONTO' THEN 6
    WHEN 'ENVIADO' THEN 7
    WHEN 'CHEGOU' THEN 8
  END;

| status   | total | pedidos_exemplo                                                                                                       |
| -------- | ----- | --------------------------------------------------------------------------------------------------------------------- |
| PRODUCAO | 29    | [683,670,669,668,667,666,662,660,655,654,650,631,628,625,618,615,614,611,610,609,607,606,603,592,581,570,509,446,400] |


-- 4️⃣ PEDIDOS FORA DO KANBAN (gerenciais)
SELECT 
  status,
  COUNT(*) as total,
  STRING_AGG(numero_sequencial::TEXT, ', ' ORDER BY numero_sequencial DESC) as pedidos
FROM pedidos
WHERE status IN ('ENTREGUE', 'FINALIZADO', 'CANCELADO', 'RASCUNHO')
GROUP BY status;


| status    | total | pedidos                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CANCELADO | 41    | 682, 673, 604, 591, 589, 588, 587, 586, 585, 584, 580, 571, 549, 548, 547, 546, 539, 538, 536, 535, 523, 521, 520, 518, 517, 516, 449, 445, 332, 249, 227, 177, 176, 175, 174, 173, 172, 152, 91, 69, 12                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ENTREGUE  | 569   | 672, 671, 665, 663, 661, 659, 658, 657, 656, 653, 652, 651, 649, 648, 647, 646, 645, 644, 643, 642, 641, 640, 639, 638, 637, 636, 635, 630, 629, 627, 626, 624, 623, 622, 621, 620, 619, 617, 616, 613, 612, 608, 605, 602, 601, 600, 599, 598, 597, 596, 595, 594, 593, 590, 583, 582, 579, 578, 577, 576, 575, 574, 573, 572, 569, 568, 567, 566, 565, 564, 563, 562, 561, 560, 559, 558, 557, 556, 555, 554, 553, 552, 551, 550, 545, 544, 543, 542, 541, 540, 537, 534, 533, 532, 531, 530, 529, 528, 527, 526, 525, 524, 522, 519, 515, 514, 513, 512, 511, 510, 508, 507, 506, 505, 504, 503, 502, 501, 500, 499, 498, 497, 496, 495, 494, 493, 492, 491, 490, 489, 488, 487, 486, 485, 484, 483, 482, 481, 480, 479, 478, 477, 476, 475, 474, 473, 472, 471, 470, 469, 468, 467, 466, 465, 464, 463, 462, 461, 460, 459, 458, 457, 456, 455, 454, 453, 452, 451, 450, 448, 447, 444, 443, 442, 441, 440, 439, 438, 437, 436, 435, 434, 433, 432, 431, 430, 429, 428, 427, 426, 425, 424, 423, 422, 421, 420, 419, 418, 417, 416, 415, 414, 413, 412, 411, 410, 409, 408, 407, 406, 405, 404, 403, 402, 401, 399, 398, 397, 396, 395, 394, 393, 392, 391, 390, 389, 388, 387, 386, 385, 384, 383, 382, 381, 380, 379, 378, 377, 376, 375, 374, 373, 372, 371, 370, 369, 368, 367, 366, 365, 364, 363, 362, 361, 360, 359, 358, 357, 356, 355, 354, 353, 352, 351, 350, 349, 348, 347, 346, 345, 344, 343, 342, 341, 340, 339, 338, 337, 336, 335, 334, 333, 331, 330, 329, 328, 327, 326, 325, 324, 323, 322, 321, 320, 319, 318, 317, 316, 315, 314, 313, 312, 311, 310, 309, 308, 307, 306, 305, 304, 303, 302, 301, 300, 299, 298, 297, 296, 295, 294, 293, 292, 291, 290, 289, 288, 287, 286, 285, 284, 283, 282, 281, 280, 279, 278, 277, 276, 275, 274, 273, 272, 271, 270, 269, 268, 267, 266, 265, 264, 263, 262, 261, 260, 259, 258, 257, 256, 255, 254, 253, 252, 251, 250, 248, 247, 246, 245, 244, 240, 239, 238, 237, 236, 235, 234, 233, 232, 231, 230, 229, 228, 226, 225, 224, 223, 222, 221, 220, 219, 218, 217, 216, 215, 212, 211, 210, 209, 208, 207, 206, 205, 204, 203, 202, 201, 200, 199, 198, 197, 196, 195, 194, 193, 192, 191, 190, 189, 188, 187, 186, 185, 184, 183, 182, 181, 180, 179, 178, 151, 150, 149, 148, 147, 146, 145, 144, 143, 142, 141, 140, 139, 138, 137, 136, 135, 134, 133, 132, 131, 130, 129, 128, 127, 126, 125, 124, 123, 122, 121, 120, 119, 118, 117, 116, 115, 114, 113, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 101, 100, 99, 98, 97, 96, 95, 94, 93, 92, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 74, 73, 72, 71, 70, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 11, 5, 3, 2, 1 |
| RASCUNHO  | 2     | 694, 684                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |


-- 5️⃣ VERIFICAR SE HÁ STATUS INVÁLIDOS/NULL
SELECT 
  CASE 
    WHEN status IS NULL THEN '❌ STATUS NULL'
    WHEN status NOT IN ('RASCUNHO', 'PENDENTE', 'REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU', 'ENTREGUE', 'FINALIZADO', 'CANCELADO') THEN '❌ STATUS INVÁLIDO: ' || status
    ELSE status
  END as status_check,
  COUNT(*) as total,
  STRING_AGG(numero_sequencial::TEXT, ', ') as pedidos
FROM pedidos
WHERE status IS NULL 
   OR status NOT IN ('RASCUNHO', 'PENDENTE', 'REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU', 'ENTREGUE', 'FINALIZADO', 'CANCELADO')
GROUP BY status;

Success. No rows returned





-- 6️⃣ VERIFICAR EVENTOS DE TIMELINE (kanban depende disso)
SELECT 
  p.numero_sequencial as "#OS",
  p.status,
  COUNT(pt.id) as total_eventos_timeline
FROM pedidos p
LEFT JOIN pedidos_timeline pt ON pt.pedido_id = p.id
GROUP BY p.id, p.numero_sequencial, p.status
HAVING COUNT(pt.id) = 0
ORDER BY p.numero_sequencial DESC;


| #OS | status   | total_eventos_timeline |
| --- | -------- | ---------------------- |
| 694 | RASCUNHO | 0                      |

-- 7️⃣ PEDIDOS SEM LABORATÓRIO OU LOJA (pode causar problema no kanban)
SELECT 
  numero_sequencial as "#OS",
  status,
  CASE WHEN loja_id IS NULL THEN '❌ SEM LOJA' ELSE '✅' END as tem_loja,
  CASE WHEN laboratorio_id IS NULL THEN '❌ SEM LAB' ELSE '✅' END as tem_lab
FROM pedidos
WHERE loja_id IS NULL OR laboratorio_id IS NULL
ORDER BY numero_sequencial DESC;


| #OS | status    | tem_loja | tem_lab   |
| --- | --------- | -------- | --------- |
| 694 | RASCUNHO  | ✅        | ❌ SEM LAB |
| 684 | RASCUNHO  | ✅        | ❌ SEM LAB |
| 683 | PRODUCAO  | ✅        | ❌ SEM LAB |
| 682 | CANCELADO | ✅        | ❌ SEM LAB |


-- 8️⃣ ANÁLISE DETALHADA DE PEDIDOS ESPECÍFICOS (ajustar IDs conforme necessário)
SELECT 
  p.numero_sequencial as "#OS",
  p.status,
  p.loja_id,
  p.laboratorio_id,
  l.nome as laboratorio,
  lj.nome as loja,
  p.data_pedido::date,
  COUNT(pt.id) as eventos_timeline
FROM pedidos p
LEFT JOIN laboratorios l ON l.id = p.laboratorio_id
LEFT JOIN lojas lj ON lj.id = p.loja_id
LEFT JOIN pedidos_timeline pt ON pt.pedido_id = p.id
GROUP BY p.id, p.numero_sequencial, p.status, p.loja_id, p.laboratorio_id, l.nome, lj.nome, p.data_pedido
ORDER BY p.numero_sequencial DESC
LIMIT 20;


| #OS | status    | loja_id                              | laboratorio_id                       | laboratorio           | loja               | data_pedido | eventos_timeline |
| --- | --------- | ------------------------------------ | ------------------------------------ | --------------------- | ------------------ | ----------- | ---------------- |
| 694 | RASCUNHO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | null                                 | null                  | Lancaster - Suzano | 2026-01-21  | 0                |
| 684 | RASCUNHO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | null                                 | null                  | Lancaster - Suzano | 2026-01-19  | 2                |
| 683 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | null                                 | null                  | Lancaster - Suzano | 2026-01-17  | 3                |
| 682 | CANCELADO | bab835bc-2df1-4f54-87c3-8151c61ec642 | null                                 | null                  | Lancaster - Suzano | 2026-01-16  | 2                |
| 673 | CANCELADO | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | Braslentes            | Lancaster - Suzano | 2026-01-15  | 2                |
| 672 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | Braslentes            | Lancaster - Suzano | 2026-01-15  | 9                |
| 671 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | Brascor               | Lancaster - Suzano | 2026-01-15  | 7                |
| 670 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | Brascor               | Lancaster - Suzano | 2026-01-14  | 4                |
| 669 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | Brascor               | Lancaster - Suzano | 2026-01-14  | 4                |
| 668 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | Brascor               | Lancaster - Suzano | 2026-01-14  | 4                |
| 667 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | Brascor               | Lancaster - Suzano | 2026-01-14  | 4                |
| 666 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 8ce109c1-69d3-484a-a87b-8accf7984132 | Brascor               | Lancaster - Suzano | 2026-01-14  | 4                |
| 665 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 3e51a952-326f-4300-86e4-153df8d7f893 | Style                 | Lancaster - Suzano | 2026-01-14  | 8                |
| 663 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | Braslentes            | Lancaster - Suzano | 2026-01-14  | 8                |
| 662 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 3e51a952-326f-4300-86e4-153df8d7f893 | Style                 | Lancaster - Suzano | 2026-01-13  | 4                |
| 661 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 3e51a952-326f-4300-86e4-153df8d7f893 | Style                 | Lancaster - Suzano | 2026-01-13  | 8                |
| 660 | PRODUCAO  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 68233923-a12b-4c65-a3ca-7c5fec265336 | Douglas - Laboratório | Lancaster - Suzano | 2026-01-13  | 3                |
| 659 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 68233923-a12b-4c65-a3ca-7c5fec265336 | Douglas - Laboratório | Lancaster - Suzano | 2026-01-13  | 8                |
| 658 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 21e9cb25-ca46-42f9-b297-db1e693325ed | 2K                    | Lancaster - Suzano | 2026-01-13  | 8                |
| 657 | ENTREGUE  | bab835bc-2df1-4f54-87c3-8151c61ec642 | 21e9cb25-ca46-42f9-b297-db1e693325ed | 2K                    | Lancaster - Suzano | 2026-01-13  | 8                |


-- 9️⃣ VERIFICAR CONSTRAINT DE STATUS (deve permitir todos os status)
SELECT 
  con.conname as constraint_name,
  pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'pedidos'
  AND (con.conname LIKE '%status%' OR pg_get_constraintdef(con.oid) ILIKE '%status%');


| constraint_name      | constraint_definition                                                                                                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pedidos_status_check | CHECK (((status)::text = ANY ((ARRAY['RASCUNHO'::character varying, 'PRODUCAO'::character varying, 'ENTREGUE'::character varying, 'FINALIZADO'::character varying, 'CANCELADO'::character varying])::text[]))) |


-- 🔟 RESUMO EXECUTIVO
SELECT 
  '📊 RESUMO' as tipo,
  (SELECT COUNT(*) FROM pedidos) as total_pedidos,
  (SELECT COUNT(*) FROM pedidos WHERE status IN ('PENDENTE', 'REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU')) as pedidos_kanban,
  (SELECT COUNT(*) FROM pedidos WHERE status IN ('ENTREGUE', 'FINALIZADO', 'CANCELADO')) as pedidos_fora_kanban,
  (SELECT COUNT(*) FROM pedidos WHERE status = 'RASCUNHO') as pedidos_rascunho,
  (SELECT COUNT(*) FROM pedidos WHERE status IS NULL) as pedidos_sem_status;


| tipo      | total_pedidos | pedidos_kanban | pedidos_fora_kanban | pedidos_rascunho | pedidos_sem_status |
| --------- | ------------- | -------------- | ------------------- | ---------------- | ------------------ |
| 📊 RESUMO | 641           | 29             | 610                 | 2                | 0                  |


-- ============================================================
-- ✅ EXECUTE E ENVIE OS RESULTADOS
-- ============================================================
