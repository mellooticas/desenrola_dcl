-- ============================================================================
-- VERIFICAR SE LENTES PREMIUM (TRANSITIONS, ACCLIMATES) ESTÃO MARCADAS CORRETAMENTE
-- ============================================================================

-- 1. VER MARCAS PREMIUM E SUAS LENTES
SELECT 
  m.nome,
  m.is_premium,
  COUNT(l.id) as total_lentes,
  COUNT(l.id) FILTER (WHERE l.fotossensivel = 'transitions') as lentes_transitions,
  COUNT(l.id) FILTER (WHERE l.fotossensivel = 'acclimates') as lentes_acclimates
FROM lens_catalog.marcas m
LEFT JOIN lens_catalog.lentes l ON l.marca_id = m.id AND l.ativo = true
WHERE m.ativo = true
GROUP BY m.id, m.nome, m.is_premium
ORDER BY m.is_premium DESC, total_lentes DESC;

| nome        | is_premium | total_lentes | lentes_transitions | lentes_acclimates |
| ----------- | ---------- | ------------ | ------------------ | ----------------- |
| TRANSITIONS | true       | 234          | 234                | 0                 |
| VARILUX     | true       | 11           | 4                  | 0                 |
| RODENSTOCK  | true       | 0            | 0                  | 0                 |
| ZEISS       | true       | 0            | 0                  | 0                 |
| LENSCOPE    | true       | 0            | 0                  | 0                 |
| HOYA        | true       | 0            | 0                  | 0                 |
| ESSILOR     | true       | 0            | 0                  | 0                 |
| CRIZAL      | true       | 0            | 0                  | 0                 |
| KODAK       | true       | 0            | 0                  | 0                 |
| SO BLOCOS   | false      | 880          | 0                  | 0                 |
| POLYLUX     | false      | 132          | 0                  | 0                 |
| BRASCOR     | false      | 56           | 0                  | 0                 |
| EXPRESS     | false      | 50           | 0                  | 0                 |
| SYGMA       | false      | 38           | 0                  | 0                 |
| GENÉRICA    | false      | 10           | 0                  | 3                 |
| STYLE       | false      | 0            | 0                  | 0                 |
| BRASLENTES  | false      | 0            | 0                  | 0                 |



-- 2. LENTES COM TRANSITIONS - VERIFICAR SE MARCA É PREMIUM
SELECT 
  l.id,
  l.nome_lente,
  l.marca_id,
  m.nome as marca,
  m.is_premium as marca_premium,
  l.categoria,
  l.fotossensivel
FROM lens_catalog.lentes l
LEFT JOIN lens_catalog.marcas m ON m.id = l.marca_id
WHERE l.fotossensivel = 'transitions' AND l.ativo = true
ORDER BY m.is_premium DESC, l.nome_lente
LIMIT 30;

| id                                   | nome_lente                                                      | marca_id                             | marca       | marca_premium | categoria     | fotossensivel |
| ------------------------------------ | --------------------------------------------------------------- | ------------------------------------ | ----------- | ------------- | ------------- | ------------- |
| a4033767-161f-431a-893f-4de12cece45f | CR 1.49 / 1.56 TRANSITIONS                                      | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | economica     | transitions   |
| f261be76-71c9-451e-a173-4201b330e60f | ESPACE PLUS CR TRANSITIONS                                      | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| 92b07be7-e0d3-4871-ac41-49dbe8ab48f0 | ESPACE PLUS POLI TRANSITIONS                                    | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| 555c3c3a-ce6c-4268-9870-fb19d0068694 | ESPACE SHORT CR TRANSITIONS                                     | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| 56aa9b6d-11bb-41a0-b8af-260b81514c4a | LENTE AC.1.50 TRANSITIONS GEN8 COM AR                           | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | economica     | transitions   |
| d8271ad0-32ca-4e3e-b75b-cdf1240908ee | LENTE AC.1.50 TRANSITIONS GEN8 COM AR                           | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | economica     | transitions   |
| 38d979fe-7a68-4e54-b1f1-059e65fc1c20 | MULTI 1.49 FREEVIEW EASY TRANSITIONS CINZA                      | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| feea8370-d02c-494d-8995-dcb1da5ac875 | MULTI 1.49 FREEVIEW EASY TRANSITIONS CINZA AR FAST              | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| d7085b83-f1db-4585-886a-f20cbf3f56a3 | MULTI 1.49 FREEVIEW EASY TRANSITIONS CINZA AR FAST AZUL         | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| 660a224a-db49-43b4-86e5-c52e872787a2 | MULTI 1.49 FREEVIEW EASY TRANSITIONS CINZA AR FAST SH           | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| f874c003-2f93-4e13-b0fe-1332a32e4208 | MULTI 1.49 FREEVIEW EASY TRANSITIONS CINZA AR FAST TITANIUM     | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| ae3d46fe-e600-42aa-90b7-50f351d38602 | MULTI 1.49 FREEVIEW EASY TRANSITIONS MARROM                     | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| 90c115b1-f10a-4769-8f70-775001a860b0 | MULTI 1.49 FREEVIEW EASY TRANSITIONS MARROM AR FAST             | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| 8f563558-524c-47ad-b1a3-b5a4f448833a | MULTI 1.49 FREEVIEW EASY TRANSITIONS MARROM AR FAST AZUL        | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| 045f8310-11b4-420d-a107-2aba30519767 | MULTI 1.49 FREEVIEW EASY TRANSITIONS MARROM AR FAST SH          | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| 2f78cf83-083f-480e-8bf6-5e43ae83e3df | MULTI 1.49 FREEVIEW EASY TRANSITIONS MARROM AR FAST TITANIUM    | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| 5536098c-4479-4590-8e9b-6035aa3f760d | MULTI 1.49 FREEVIEW HD SLIM TRANSITIONS CINZA                   | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| bc3a52da-1320-4e96-9ccf-f1ee50eaf1f7 | MULTI 1.49 FREEVIEW HD SLIM TRANSITIONS CINZA AR FAST           | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| fdc390fb-74b7-4929-91b8-63921591452a | MULTI 1.49 FREEVIEW HD SLIM TRANSITIONS CINZA AR FAST AZUL      | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| 22de455d-5d0a-4a2d-822d-6df382991fcf | MULTI 1.49 FREEVIEW HD SLIM TRANSITIONS CINZA AR FAST SH        | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| 0db10c6d-6df3-474b-bb76-77cde95f50fd | MULTI 1.49 FREEVIEW HD SLIM TRANSITIONS CINZA AR FAST TITANIUM  | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| 5a57c3c7-2205-46b9-bb01-8fa3d9f7fe63 | MULTI 1.49 FREEVIEW HD SLIM TRANSITIONS MARROM                  | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| a14495b3-54bd-43fb-a270-66ab1e4cd873 | MULTI 1.49 FREEVIEW HD SLIM TRANSITIONS MARROM AR FAST          | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| cf78eaf3-36be-46bf-92af-616836440ec9 | MULTI 1.49 FREEVIEW HD SLIM TRANSITIONS MARROM AR FAST AZUL     | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| 8893fa04-0020-4a55-a79f-28f6585fccd4 | MULTI 1.49 FREEVIEW HD SLIM TRANSITIONS MARROM AR FAST SH       | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| 0825627c-1dac-4516-9f74-16edb55f4825 | MULTI 1.49 FREEVIEW HD SLIM TRANSITIONS MARROM AR FAST TITANIUM | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| 8a935b36-8a97-4caa-82e0-cf23833bd40f | MULTI 1.49 FREEVIEW HD TRANSITIONS CINZA                        | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| ea5a4845-333b-4046-9c1f-dd3f2245f574 | MULTI 1.49 FREEVIEW HD TRANSITIONS CINZA AR FAST                | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| 7393a3bd-0586-4e8e-a1e0-c98e32b5d536 | MULTI 1.49 FREEVIEW HD TRANSITIONS CINZA AR FAST AZUL           | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |
| 76fb5bb1-8af2-4d42-99f5-dddcb05dfb3b | MULTI 1.49 FREEVIEW HD TRANSITIONS CINZA AR FAST SH             | 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true          | intermediaria | transitions   |



-- 3. LENTES COM ACCLIMATES - VERIFICAR SE MARCA É PREMIUM
SELECT 
  l.id,
  l.nome_lente,
  l.marca_id,
  m.nome as marca,
  m.is_premium as marca_premium,
  l.categoria,
  l.fotossensivel
FROM lens_catalog.lentes l
LEFT JOIN lens_catalog.marcas m ON m.id = l.marca_id
WHERE l.fotossensivel = 'acclimates' AND l.ativo = true
ORDER BY m.is_premium DESC, l.nome_lente;

| id                                   | nome_lente                   | marca_id                             | marca    | marca_premium | categoria     | fotossensivel |
| ------------------------------------ | ---------------------------- | ------------------------------------ | -------- | ------------- | ------------- | ------------- |
| 4dafa827-5ac3-475d-9881-2ea0eb8b79cb | ESPACE CR ACCLIMATES         | 7f1aa237-edaf-4376-8b91-6c93c3c079a4 | GENÉRICA | false         | intermediaria | acclimates    |
| 6b110ebf-accd-45a7-b501-94663377e75c | ESPACE PLUS CR ACCLIMATES    | 7f1aa237-edaf-4376-8b91-6c93c3c079a4 | GENÉRICA | false         | intermediaria | acclimates    |
| 52ecac76-1efe-45e5-aed3-46c808d3a681 | ESPACE SHORT CR ACCLIMATES   | 7f1aa237-edaf-4376-8b91-6c93c3c079a4 | GENÉRICA | false         | intermediaria | acclimates    |



-- 4. RESUMO: TRANSITIONS E ACCLIMATES POR STATUS PREMIUM
SELECT 
  CASE 
    WHEN m.is_premium = true THEN 'Premium'
    WHEN m.is_premium = false THEN 'Standard'
    ELSE 'Sem marca'
  END as status_marca,
  COUNT(l.id) FILTER (WHERE l.fotossensivel = 'transitions') as transitions,
  COUNT(l.id) FILTER (WHERE l.fotossensivel = 'acclimates') as acclimates,
  COUNT(l.id) FILTER (WHERE l.fotossensivel IN ('transitions', 'acclimates')) as total_premium_brands,
  COUNT(l.id) as total_lentes
FROM lens_catalog.lentes l
LEFT JOIN lens_catalog.marcas m ON m.id = l.marca_id
WHERE l.ativo = true
GROUP BY status_marca
ORDER BY status_marca;

| status_marca | transitions | acclimates | total_premium_brands | total_lentes |
| ------------ | ----------- | ---------- | -------------------- | ------------ |
| Premium      | 238         | 0          | 238                  | 245          |
| Standard     | 0           | 3          | 3                    | 1166         |



-- 5. VER QUAL MARCA TEM TRANSITIONS / ACCLIMATES
SELECT DISTINCT
  m.id,
  m.nome as marca,
  m.is_premium,
  COUNT(l.id) as total_lentes_marca,
  STRING_AGG(DISTINCT l.fotossensivel, ', ' ORDER BY l.fotossensivel) as tratamentos
FROM lens_catalog.lentes l
JOIN lens_catalog.marcas m ON m.id = l.marca_id
WHERE l.ativo = true AND l.fotossensivel IN ('transitions', 'acclimates')
GROUP BY m.id, m.nome, m.is_premium
ORDER BY m.is_premium DESC;

| id                                   | marca       | is_premium | total_lentes_marca | tratamentos |
| ------------------------------------ | ----------- | ---------- | ------------------ | ----------- |
| 3f70213e-0b45-4f42-907a-28f7e7ac51c0 | VARILUX     | true       | 4                  | transitions |
| 3f8ac428-2224-415e-8a20-c9e6879754d3 | TRANSITIONS | true       | 234                | transitions |
| 7f1aa237-edaf-4376-8b91-6c93c3c079a4 | GENÉRICA    | false      | 3                  | acclimates  |



-- 6. VERIFICAR TAMBÉM NA VIEW SE ESTÁ TUDO OK
SELECT 
  COUNT(*) FILTER (WHERE marca_premium = true AND tratamento_foto IN ('transitions', 'acclimates')) as premium_com_transitions_acclimates,
  COUNT(*) FILTER (WHERE marca_premium = false AND tratamento_foto IN ('transitions', 'acclimates')) as standard_com_transitions_acclimates,
  COUNT(*) FILTER (WHERE marca_premium IS NULL AND tratamento_foto IN ('transitions', 'acclimates')) as null_com_transitions_acclimates
FROM v_lentes;


| premium_com_transitions_acclimates | standard_com_transitions_acclimates | null_com_transitions_acclimates |
| ---------------------------------- | ----------------------------------- | ------------------------------- |
| 238                                | 3                                   | 0                               |

