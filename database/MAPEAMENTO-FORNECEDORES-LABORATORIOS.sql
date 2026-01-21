-- ===================================================================
-- MAPEAMENTO: FORNECEDORES (SIS_LENS) ← → LABORATORIOS (DESENROLA_DCL)
-- ===================================================================
-- Objetivo: Descobrir como os fornecedores do SIS_LENS foram mapeados para laboratórios
-- Data: 21/01/2026
-- ===================================================================

-- 1️⃣ LISTAR LABORATORIOS ATUAIS NO DESENROLA_DCL
SELECT 
  id as laboratorio_id,
  nome,
  codigo,
  ativo,
  sla_padrao_dias,
  created_at
FROM laboratorios
ORDER BY nome;

| laboratorio_id                       | nome                         | codigo       | ativo | sla_padrao_dias | created_at                    |
| ------------------------------------ | ---------------------------- | ------------ | ----- | --------------- | ----------------------------- |
| 21e9cb25-ca46-42f9-b297-db1e693325ed | 2K                           | 2KSUZANO     | true  | 2               | 2025-09-23 14:41:51.802404+00 |
| 3a65944b-330a-4b56-b983-f0f3de3905a1 | Blue Optical                 | BLUE_OPTICAL | true  | 7               | 2025-09-10 16:18:56.654833+00 |
| 8ce109c1-69d3-484a-a87b-8accf7984132 | Brascor                      | BRASCOR      | true  | 7               | 2025-09-10 16:18:56.654833+00 |
| d7cc1746-0749-40d6-97b6-94e50c7a1d1b | Braslentes                   | BRASLENTES   | true  | 10              | 2025-09-10 16:18:56.654833+00 |
| 68233923-a12b-4c65-a3ca-7c5fec265336 | Douglas - Laboratório        | DOU          | true  | 5               | 2026-01-13 11:50:01.912723+00 |
| 74dc986a-1063-4b8e-8964-59eb396e10eb | Express                      | EXPRESS      | true  | 3               | 2025-09-10 16:18:56.654833+00 |
| 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | HighVision                   | HIGHVISION   | true  | 7               | 2025-09-10 16:18:56.654833+00 |
| 61f4303c-c8a3-4e3e-a064-e19783a0a2eb | Hoya                         | HOYA         | true  | 15              | 2025-11-13 19:44:05.585617+00 |
| a2f98c18-abb8-4434-8cc3-7bd254892894 | Polylux                      | POLYLUX      | true  | 7               | 2025-09-10 16:18:56.654833+00 |
| b3c580a3-02a3-40fa-938a-fc2a26cbc671 | So Blocos                    | SO_BLOCOS    | true  | 7               | 2025-09-10 16:18:56.654833+00 |
| 7a45dd7b-127c-40a0-9af5-e732ca3f02a9 | Solótica - Lentes de Contato | SOLOTICA     | true  | 2               | 2025-09-23 14:45:43.367958+00 |
| 3e51a952-326f-4300-86e4-153df8d7f893 | Style                        | STYLE        | true  | 7               | 2025-09-10 16:18:56.654833+00 |
| 2861abfc-7a83-4929-9e9f-7c2541f863f0 | Sygma                        | SYGMA        | true  | 7               | 2025-09-10 16:18:56.654833+00 |
| f2954dac-a0a5-47db-9238-e4e2fa748281 | Thiago - Laboratório         | THI          | true  | 5               | 2026-01-13 11:49:56.74197+00  |


-- 2️⃣ LISTAR FORNECEDORES DO SIS_LENS (core.fornecedores)
-- Esta query deve ser executada no banco SIS_LENS:
 SELECT 
   id as fornecedor_id,
   nome,
   razao_social,
   cnpj,
   prazo_visao_simples,
   prazo_multifocal,
   ativo
 FROM core.fornecedores
 WHERE ativo = true
 ORDER BY nome;


| fornecedor_id                        | nome                   | razao_social                              | cnpj | prazo_visao_simples | prazo_multifocal | ativo |
| ------------------------------------ | ---------------------- | ----------------------------------------- | ---- | ------------------- | ---------------- | ----- |
| 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | Brascor                | Brascor Distribuidora de Lentes           | null | 7                   | 10               | true  |
| 43721f5b-4f4a-4a75-bb34-6e8b373c5948 | Braslentes             | Champ Brasil Comercio LTDA                | null | 10                  | 12               | true  |
| 8eb9498c-3d99-4d26-bb8c-e503f97ccf2c | Express                | Lentes e Cia Express LTDA                 | null | 3                   | 5                | true  |
| e4a24408-3d58-4fc7-a096-cf7140f4f248 | Galeria Florencio lj11 | Galeria Florêncio Comércio de Óptica LTDA | null | 7                   | 10               | true  |
| d90bebaf-e552-4cf0-a226-808c91bda73a | Kaizi Oculos Solares   | Kaizi Importação e Exportação LTDA        | null | 7                   | 10               | true  |
| c50ea6eb-a420-4cf7-8aa2-68aaeb41ac95 | Navarro Oculos         | Navarro Distribuidora de Óculos LTDA      | null | 7                   | 10               | true  |
| 3a0a8ad3-4c55-44a2-b9fa-232a9f2fdc21 | Polylux                | Polylux Comercio de Produtos Opticos LTDA | null | 7                   | 10               | true  |
| 1d0b088f-dcb1-4179-9a18-5d67ce86c4b6 | Sao Paulo Acessorios   | São Paulo Acessórios LTDA                 | null | 7                   | 10               | true  |
| e1e1eace-11b4-4f26-9f15-620808a4a410 | So Blocos              | S blocos Comercio e Servios Oticos LTDA   | null | 7                   | 10               | true  |
| d88018ac-ecae-4b38-b321-94babe5f85e3 | Style                  | Style Primer Lentes Oftalmicas e Armaes   | null | 7                   | 10               | true  |
| 199bae08-0217-4b70-b054-d3f0960b4a78 | Sygma                  | Sygma Lentes Laboratório Óptico           | null | 7                   | 10               | true  |

-- 3️⃣ VERIFICAR SE HÁ LENTES NO DESENROLA_DCL COM fornecedor_lente_id
-- (lentes podem ter sido importadas do SIS_LENS)
SELECT EXISTS(SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'lentes' 
              AND column_name = 'fornecedor_lente_id') as coluna_existe;

-- 4️⃣ SE EXISTIR TABELA lentes, VER MAPEAMENTO
-- SELECT DISTINCT
--   fornecedor_lente_id,
--   COUNT(*) as qtd_lentes
-- FROM lentes
-- WHERE fornecedor_lente_id IS NOT NULL
-- GROUP BY fornecedor_lente_id;

-- 5️⃣ VERIFICAR PEDIDOS QUE TÊM fornecedor_lente_id
SELECT 
  p.id,
  p.numero_os_fisica,
  p.tipo_pedido,
  p.fornecedor_lente_id,
  p.laboratorio_id,
  l.nome as laboratorio_nome,
  p.created_at
FROM pedidos p
LEFT JOIN laboratorios l ON l.id = p.laboratorio_id
WHERE p.fornecedor_lente_id IS NOT NULL
ORDER BY p.created_at DESC
LIMIT 10;

| id                                   | numero_os_fisica | tipo_pedido | fornecedor_lente_id                  | laboratorio_id | laboratorio_nome | created_at                    |
| ------------------------------------ | ---------------- | ----------- | ------------------------------------ | -------------- | ---------------- | ----------------------------- |
| 7180bab0-9a9b-4707-95e5-aa93a6c76c57 | 4353245          | LENTES      | 199bae08-0217-4b70-b054-d3f0960b4a78 | null           | null             | 2026-01-21 18:10:16.362039+00 |


-- 6️⃣ COMPARAR: UUIDs de fornecedor_lente_id vs laboratorio_id
SELECT 
  'SÃO IGUAIS' as resultado,
  COUNT(*) as qtd_pedidos
FROM pedidos
WHERE fornecedor_lente_id = laboratorio_id
  AND fornecedor_lente_id IS NOT NULL
  AND laboratorio_id IS NOT NULL

UNION ALL

SELECT 
  'SÃO DIFERENTES' as resultado,
  COUNT(*) as qtd_pedidos
FROM pedidos
WHERE fornecedor_lente_id != laboratorio_id
  AND fornecedor_lente_id IS NOT NULL
  AND laboratorio_id IS NOT NULL;

  | resultado      | qtd_pedidos |
| -------------- | ----------- |
| SÃO IGUAIS     | 0           |
| SÃO DIFERENTES | 0           |


-- 7️⃣ VERIFICAR SE fornecedor_lente_id SÃO UUIDs VÁLIDOS EM laboratorios
SELECT 
  p.fornecedor_lente_id,
  COUNT(*) as qtd_pedidos,
  EXISTS(SELECT 1 FROM laboratorios l WHERE l.id = p.fornecedor_lente_id) as uuid_existe_em_labs
FROM pedidos p
WHERE p.fornecedor_lente_id IS NOT NULL
GROUP BY p.fornecedor_lente_id
ORDER BY qtd_pedidos DESC;


| fornecedor_lente_id                  | qtd_pedidos | uuid_existe_em_labs |
| ------------------------------------ | ----------- | ------------------- |
| 199bae08-0217-4b70-b054-d3f0960b4a78 | 1           | false               |
