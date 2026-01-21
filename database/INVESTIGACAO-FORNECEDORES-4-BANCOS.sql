-- ===================================================================
-- INVESTIGAÇÃO COMPLETA: FORNECEDORES NOS 4 BANCOS DE DADOS
-- ===================================================================
-- Data: 21/01/2026
-- Objetivo: Mapear fornecedores/laboratórios em cada banco e descobrir
--           como fazer o mapeamento correto entre eles
-- ===================================================================

-- ===================================================================
-- 🏢 BANCO 1: DESENROLA_DCL (Sistema Atual - Kanban/Controle)
-- ===================================================================
-- Tabela: public.laboratorios
-- Propósito: Laboratórios que produzem lentes

\echo '===== DESENROLA_DCL: LABORATORIOS ====='

SELECT 
  '🏢 DESENROLA_DCL' as banco,
  id as uuid_laboratorio,
  nome,
  codigo,
  ativo,
  sla_padrao_dias,
  trabalha_sabado,
  created_at::date as criado_em
FROM laboratorios
WHERE ativo = true
ORDER BY nome;

| banco            | uuid_laboratorio                     | nome                         | codigo       | ativo | sla_padrao_dias | trabalha_sabado | criado_em  |
| ---------------- | ------------------------------------ | ---------------------------- | ------------ | ----- | --------------- | --------------- | ---------- |
| 🏢 DESENROLA_DCL | 21e9cb25-ca46-42f9-b297-db1e693325ed | 2K                           | 2KSUZANO     | true  | 2               | true            | 2025-09-23 |
| 🏢 DESENROLA_DCL | 3a65944b-330a-4b56-b983-f0f3de3905a1 | Blue Optical                 | BLUE_OPTICAL | true  | 7               | false           | 2025-09-10 |
| 🏢 DESENROLA_DCL | 8ce109c1-69d3-484a-a87b-8accf7984132 | Brascor                      | BRASCOR      | true  | 7               | false           | 2025-09-10 |
| 🏢 DESENROLA_DCL | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | Braslentes                   | BRASLENTES   | true  | 10              | false           | 2025-09-10 |
| 🏢 DESENROLA_DCL | 68233923-a12b-4c65-a3ca-7c5fec265336 | Douglas - Laboratório        | DOU          | true  | 5               | false           | 2026-01-13 |
| 🏢 DESENROLA_DCL | 74dc986a-1063-4b8e-8964-59eb396e10eb | Express                      | EXPRESS      | true  | 3               | true            | 2025-09-10 |
| 🏢 DESENROLA_DCL | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | HighVision                   | HIGHVISION   | true  | 7               | false           | 2025-09-10 |
| 🏢 DESENROLA_DCL | 61f4303c-c8a3-4e3e-a064-e19783a0a2eb | Hoya                         | HOYA         | true  | 15              | false           | 2025-11-13 |
| 🏢 DESENROLA_DCL | a2f98c18-abb8-4434-8cc3-7bd254892894 | Polylux                      | POLYLUX      | true  | 7               | false           | 2025-09-10 |
| 🏢 DESENROLA_DCL | b3c580a3-02a3-40fa-938a-fc2a26cbc671 | So Blocos                    | SO_BLOCOS    | true  | 7               | false           | 2025-09-10 |
| 🏢 DESENROLA_DCL | 7a45dd7b-127c-40a0-9af5-e732ca3f02a9 | Solótica - Lentes de Contato | SOLOTICA     | true  | 2               | true            | 2025-09-23 |
| 🏢 DESENROLA_DCL | 3e51a952-326f-4300-86e4-153df8d7f893 | Style                        | STYLE        | true  | 7               | false           | 2025-09-10 |
| 🏢 DESENROLA_DCL | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | Sygma                        | SYGMA        | true  | 7               | false           | 2025-09-10 |
| 🏢 DESENROLA_DCL | f2954dac-a0a5-47db-9238-e4e2fa748281 | Thiago - Laboratório         | THI          | true  | 5               | false           | 2026-01-13 |


-- Contagem
SELECT 
  '🏢 DESENROLA_DCL' as banco,
  'laboratorios' as tabela,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE ativo = true) as total_ativos
FROM laboratorios;

| banco            | tabela       | total_registros | total_ativos |
| ---------------- | ------------ | --------------- | ------------ |
| 🏢 DESENROLA_DCL | laboratorios | 14              | 14           |


-- ===================================================================
-- 🔬 BANCO 2: SIS_LENS (Catálogo de Lentes)
-- ===================================================================
-- Tabela: core.fornecedores
-- Propósito: Fornecedores/Laboratórios que fornecem lentes
-- Relacionamento: lens_catalog.lentes.fornecedor_id → core.fornecedores.id

\echo '===== SIS_LENS: FORNECEDORES ====='

-- ATENÇÃO: Executar esta query no banco SIS_LENS
/*
SELECT 
  '🔬 SIS_LENS' as banco,
  id as uuid_fornecedor,
  nome,
  razao_social,
  cnpj,
  prazo_visao_simples,
  prazo_multifocal,
  prazo_surfacada,
  prazo_free_form,
  ativo,
  created_at::date as criado_em
FROM core.fornecedores
WHERE ativo = true
ORDER BY nome;

| banco       | uuid_fornecedor                      | nome                   | razao_social                              | cnpj | prazo_visao_simples | prazo_multifocal | prazo_surfacada | prazo_free_form | ativo | criado_em  |
| ----------- | ------------------------------------ | ---------------------- | ----------------------------------------- | ---- | ------------------- | ---------------- | --------------- | --------------- | ----- | ---------- |
| 🔬 SIS_LENS | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | Brascor                | Brascor Distribuidora de Lentes           | null | 7                   | 10               | 12              | 15              | true  | 2025-12-19 |
| 🔬 SIS_LENS | 43721f5b-4f4a-4a75-bb34-6e8b373c5948 | Braslentes             | Champ Brasil Comercio LTDA                | null | 10                  | 12               | 14              | 17              | true  | 2025-12-19 |
| 🔬 SIS_LENS | 8eb9498c-3d99-4d26-bb8c-e503f97ccf2c | Express                | Lentes e Cia Express LTDA                 | null | 3                   | 5                | 7               | 10              | true  | 2025-12-19 |
| 🔬 SIS_LENS | e4a24408-3d58-4fc7-a096-cf7140f4f248 | Galeria Florencio lj11 | Galeria Florêncio Comércio de Óptica LTDA | null | 7                   | 10               | 12              | 15              | true  | 2025-12-19 |
| 🔬 SIS_LENS | d90bebaf-e552-4cf0-a226-808c91bda73a | Kaizi Oculos Solares   | Kaizi Importação e Exportação LTDA        | null | 7                   | 10               | 12              | 15              | true  | 2025-12-19 |
| 🔬 SIS_LENS | c50ea6eb-a420-4cf7-8aa2-68aaeb41ac95 | Navarro Oculos         | Navarro Distribuidora de Óculos LTDA      | null | 7                   | 10               | 12              | 15              | true  | 2025-12-19 |
| 🔬 SIS_LENS | 3a0a8ad3-4c55-44a2-b9fa-232a9f2fdc21 | Polylux                | Polylux Comercio de Produtos Opticos LTDA | null | 7                   | 10               | 12              | 15              | true  | 2025-12-19 |
| 🔬 SIS_LENS | 1d0b088f-dcb1-4179-9a18-5d67ce86c4b6 | Sao Paulo Acessorios   | São Paulo Acessórios LTDA                 | null | 7                   | 10               | 12              | 15              | true  | 2025-12-19 |
| 🔬 SIS_LENS | e1e1eace-11b4-4f26-9f15-620808a4a410 | So Blocos              | S blocos Comercio e Servios Oticos LTDA   | null | 7                   | 10               | 12              | 15              | true  | 2025-12-19 |
| 🔬 SIS_LENS | d88018ac-ecae-4b38-b321-94babe5f85e3 | Style                  | Style Primer Lentes Oftalmicas e Armaes   | null | 7                   | 10               | 12              | 15              | true  | 2025-12-19 |
| 🔬 SIS_LENS | 199bae08-0217-4b70-b054-d3f0960b4a78 | Sygma                  | Sygma Lentes Laboratório Óptico           | null | 7                   | 10               | 12              | 15              | true  | 2025-12-19 |


-- Contagem
SELECT 
  '🔬 SIS_LENS' as banco,
  'core.fornecedores' as tabela,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE ativo = true) as total_ativos
FROM core.fornecedores;


| banco       | tabela            | total_registros | total_ativos |
| ----------- | ----------------- | --------------- | ------------ |
| 🔬 SIS_LENS | core.fornecedores | 11              | 11           |


-- Verificar quantas lentes cada fornecedor tem
SELECT 
  f.id as fornecedor_id,
  f.nome as fornecedor_nome,
  COUNT(l.id) as total_lentes,
  COUNT(*) FILTER (WHERE l.ativo = true) as lentes_ativas
FROM core.fornecedores f
LEFT JOIN lens_catalog.lentes l ON l.fornecedor_id = f.id
WHERE f.ativo = true
GROUP BY f.id, f.nome
ORDER BY f.nome;
*/


| fornecedor_id                        | fornecedor_nome        | total_lentes | lentes_ativas |
| ------------------------------------ | ---------------------- | ------------ | ------------- |
| 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | Brascor                | 58           | 58            |
| 43721f5b-4f4a-4a75-bb34-6e8b373c5948 | Braslentes             | 0            | 0             |
| 8eb9498c-3d99-4d26-bb8c-e503f97ccf2c | Express                | 84           | 84            |
| e4a24408-3d58-4fc7-a096-cf7140f4f248 | Galeria Florencio lj11 | 0            | 0             |
| d90bebaf-e552-4cf0-a226-808c91bda73a | Kaizi Oculos Solares   | 0            | 0             |
| c50ea6eb-a420-4cf7-8aa2-68aaeb41ac95 | Navarro Oculos         | 0            | 0             |
| 3a0a8ad3-4c55-44a2-b9fa-232a9f2fdc21 | Polylux                | 158          | 158           |
| 1d0b088f-dcb1-4179-9a18-5d67ce86c4b6 | Sao Paulo Acessorios   | 0            | 0             |
| e1e1eace-11b4-4f26-9f15-620808a4a410 | So Blocos              | 1097         | 1097          |
| d88018ac-ecae-4b38-b321-94babe5f85e3 | Style                  | 0            | 0             |
| 199bae08-0217-4b70-b054-d3f0960b4a78 | Sygma                  | 14           | 14            |


-- ===================================================================
-- 🛒 BANCO 3: CRM_ERP (Produtos/Armações)
-- ===================================================================
-- Tabela: core.fornecedores (PODE TER TAMBÉM)
-- Propósito: Fornecedores de armações e produtos

\echo '===== CRM_ERP: FORNECEDORES ====='

-- ATENÇÃO: Executar estas queries no banco CRM_ERP
-- Tabela: pessoas.fornecedores (schema "pessoas")

-- STEP 1: Listar fornecedores de armações/produtos
/*
SELECT 
  '🛒 CRM_ERP' as banco,
  id as uuid_fornecedor,
  nome,
  razao_social,
  cnpj,
  contato,
  telefone,
  email,
  representante,
  prazo_entrega_dias,
  ativo,
  created_at::date as criado_em
FROM pessoas.fornecedores
WHERE ativo = true
ORDER BY nome;
*/

| banco      | uuid_fornecedor                      | nome                   | razao_social                              | cnpj | contato                                   | telefone        | email                           | representante      | prazo_entrega_dias | ativo | criado_em  |
| ---------- | ------------------------------------ | ---------------------- | ----------------------------------------- | ---- | ----------------------------------------- | --------------- | ------------------------------- | ------------------ | ------------------ | ----- | ---------- |
| 🛒 CRM_ERP | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | Brascor                | Brascor Distribuidora de Lentes           | null | Brascor Distribuidora de Lentes           | (11) 93047-3110 | vendas@brascorlab.com.br        | Shirley            | 7                  | true  | 2025-04-30 |
| 🛒 CRM_ERP | 43721f5b-4f4a-4a75-bb34-6e8b373c5948 | Braslentes             | Champ Brasil Comercio LTDA                | null | Champ Brasil Comercio LTDA                | (11) 91285-8758 | contato@braslentes.com.br       | Erica              | 10                 | true  | 2025-04-30 |
| 🛒 CRM_ERP | 8eb9498c-3d99-4d26-bb8c-e503f97ccf2c | Express                | Lentes e Cia Express LTDA                 | null | Lentes e Cia Express LTDA                 | (11) 94165-8875 | lentesexpress25@gmail.com       | Maria              | 3                  | true  | 2025-04-30 |
| 🛒 CRM_ERP | e4a24408-3d58-4fc7-a096-cf7140f4f248 | Galeria Florencio lj11 | Galeria Florêncio Comércio de Óptica LTDA | null | Galeria Florêncio Comércio de Óptica LTDA | (11) 66666-6666 | contato@galeriaflorencio.com.br | Márcia             | 7                  | true  | 2025-05-07 |
| 🛒 CRM_ERP | d90bebaf-e552-4cf0-a226-808c91bda73a | Kaizi Oculos Solares   | Kaizi Importação e Exportação LTDA        | null | Kaizi Importação e Exportação LTDA        | (11) 77777-7777 | contato@kaizi.com.br            | Eduardo            | 7                  | true  | 2025-05-07 |
| 🛒 CRM_ERP | c50ea6eb-a420-4cf7-8aa2-68aaeb41ac95 | Navarro Oculos         | Navarro Distribuidora de Óculos LTDA      | null | Navarro Distribuidora de Óculos LTDA      | (11) 88888-8888 | contato@navarro.com.br          | Roberto            | 7                  | true  | 2025-05-07 |
| 🛒 CRM_ERP | 3a0a8ad3-4c55-44a2-b9fa-232a9f2fdc21 | Polylux                | Polylux Comercio de Produtos Opticos LTDA | null | Polylux Comercio de Produtos Opticos LTDA | (11) 4123-1319  | atendimento@polilux.com         | Espedito           | 7                  | true  | 2025-04-30 |
| 🛒 CRM_ERP | 1d0b088f-dcb1-4179-9a18-5d67ce86c4b6 | Sao Paulo Acessorios   | São Paulo Acessórios LTDA                 | null | São Paulo Acessórios LTDA                 | (11) 99999-9999 | contato@spacessorios.com.br     | Carlos             | 7                  | true  | 2025-05-07 |
| 🛒 CRM_ERP | e1e1eace-11b4-4f26-9f15-620808a4a410 | So Blocos              | S� blocos Comercio e Servi�os Oticos LTDA | null | S� blocos Comercio e Servi�os Oticos LTDA | (11) 93778-3087 | null                            | Mauricio           | 7                  | true  | 2025-04-30 |
| 🛒 CRM_ERP | d88018ac-ecae-4b38-b321-94babe5f85e3 | Style                  | Style Primer Lentes Oftalmicas e Arma��es | null | Style Primer Lentes Oftalmicas e Arma��es | (11) 91367-9326 | null                            | Ericson/Alessandro | 7                  | true  | 2025-04-30 |
| 🛒 CRM_ERP | 199bae08-0217-4b70-b054-d3f0960b4a78 | Sygma                  | Sygma Lentes Laboratório Óptico           | null | Sygma Lentes Laboratório Óptico           | (11) 3667-8803  | contato@sygmalentes.com.br      | Não informado      | 7                  | true  | 2025-05-28 |


-- STEP 2: Contagem e estatísticas
/*
SELECT 
  '🛒 CRM_ERP' as banco,
  'pessoas.fornecedores' as tabela,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE ativo = true) as total_ativos,
  AVG(prazo_entrega_dias) as prazo_medio_dias,
  COUNT(*) FILTER (WHERE cnpj IS NOT NULL) as total_com_cnpj
FROM pessoas.fornecedores;
*/

| banco      | tabela               | total_registros | total_ativos | prazo_medio_dias   | total_com_cnpj |
| ---------- | -------------------- | --------------- | ------------ | ------------------ | -------------- |
| 🛒 CRM_ERP | pessoas.fornecedores | 11              | 11           | 6.9090909090909091 | 0              |


-- STEP 3: Verificar fornecedores mais usados
/*
-- Se houver relação com produtos/vendas
SELECT 
  f.nome as fornecedor,
  f.prazo_entrega_dias,
  COUNT(DISTINCT p.id) as total_produtos
FROM pessoas.fornecedores f
LEFT JOIN produtos p ON p.fornecedor_id = f.id  -- ajustar conforme estrutura real
WHERE f.ativo = true
GROUP BY f.id, f.nome, f.prazo_entrega_dias
ORDER BY total_produtos DESC;
*/

| fornecedor             | prazo_entrega_dias | total_produtos |
| ---------------------- | ------------------ | -------------- |
| Galeria Florencio lj11 | 7                  | 954            |
| Kaizi Oculos Solares   | 7                  | 128            |
| Navarro Oculos         | 7                  | 54             |
| Sao Paulo Acessorios   | 7                  | 38             |
| Brascor                | 7                  | 0              |
| Style                  | 7                  | 0              |
| So Blocos              | 7                  | 0              |
| Express                | 3                  | 0              |
| Sygma                  | 7                  | 0              |
| Polylux                | 7                  | 0              |
| Braslentes             | 10                 | 0              |



-- ===================================================================
-- 💰 BANCO 4: SIS_VENDAS (PDV)
-- ===================================================================
-- ✅ CONFIRMADO: NÃO tem fornecedores!
-- SIS_VENDAS é apenas o PDV (Ponto de Venda)
-- Consome dados de CRM_ERP (armações) e SIS_LENS (lentes)

\echo '===== SIS_VENDAS: SEM FORNECEDORES ====='

/*
CONCLUSÃO: SIS_VENDAS não gerencia fornecedores.
Os fornecedores vêm de:
- CRM_ERP → pessoas.fornecedores (armações/produtos)
- SIS_LENS → core.fornecedores (lentes)

UUIDs são COMPARTILHADOS entre CRM_ERP e SIS_LENS (mesmos valores)!
*/

| table_schema | table_name              |
| ------------ | ----------------------- |
| vendas       | autorizacoes            |
| vendas       | backup_numeros_original |
| vendas       | contratos_carne         |
| vendas       | despesas_operacionais   |
| vendas       | entregas_brindes        |
| vendas       | entregas_carne          |
| vendas       | entregas_os             |
| vendas       | formas_pagamento        |
| vendas       | historico_entrada       |
| vendas       | historico_status        |
| vendas       | itens_orcamento         |
| vendas       | itens_venda             |
| vendas       | logs_conversao_carne    |
| vendas       | notificacoes_entrada    |
| vendas       | orcamentos              |
| vendas       | pagamentos              |
| vendas       | parcelas                |
| vendas       | profissionais_saude     |
| vendas       | recebimentos_carne      |
| vendas       | receitas                |
| vendas       | responsaveis_oticos     |
| vendas       | restantes_entrada       |
| vendas       | restituicoes            |
| vendas       | vendas                  |
| vendas       | vendas_formas_pagamento |


-- ===================================================================
-- 🔗 ANÁLISE DE MAPEAMENTO: DESENROLA_DCL ← SIS_LENS
-- ===================================================================
-- Objetivo: Descobrir se os UUIDs são os mesmos

\echo '===== MAPEAMENTO: DESENROLA_DCL ↔ SIS_LENS ====='

-- Query 1: Pedidos que têm fornecedor_lente_id (vindo do SIS_LENS)
SELECT 
  COUNT(*) as total_pedidos_com_fornecedor,
  COUNT(DISTINCT fornecedor_lente_id) as fornecedores_distintos
FROM pedidos 
WHERE fornecedor_lente_id IS NOT NULL;


| total_pedidos_com_fornecedor | fornecedores_distintos |
| ---------------------------- | ---------------------- |
| 1                            | 1                      |


-- Query 2: Comparar fornecedor_lente_id vs laboratorio_id
SELECT 
  CASE 
    WHEN fornecedor_lente_id = laboratorio_id THEN 'UUIDs IGUAIS'
    ELSE 'UUIDs DIFERENTES'
  END as comparacao,
  COUNT(*) as quantidade
FROM pedidos
WHERE fornecedor_lente_id IS NOT NULL 
  AND laboratorio_id IS NOT NULL
GROUP BY 
  CASE 
    WHEN fornecedor_lente_id = laboratorio_id THEN 'UUIDs IGUAIS'
    ELSE 'UUIDs DIFERENTES'
  END;

-- Query 3: Verificar se fornecedor_lente_id existem na tabela laboratorios
SELECT 
  p.fornecedor_lente_id,
  COUNT(*) as qtd_pedidos_com_esse_uuid,
  EXISTS(
    SELECT 1 FROM laboratorios l 
    WHERE l.id = p.fornecedor_lente_id
  ) as uuid_existe_em_laboratorios
FROM pedidos p
WHERE p.fornecedor_lente_id IS NOT NULL
GROUP BY p.fornecedor_lente_id
ORDER BY qtd_pedidos_com_esse_uuid DESC;


-- ===================================================================
-- 🎯 QUERY CRÍTICA: Qual UUID está causando o erro FK?
-- ===================================================================

\echo '===== DESCOBRIR UUID DO ERRO ====='

-- Esta query deve ser executada APÓS tentar criar um pedido e ver o erro
-- Copie o UUID do console.log "Dados preparados para insert"
-- e substitua 'SEU_UUID_AQUI' pelo valor real

/*
-- Verificar se UUID existe em laboratorios
SELECT 
  'UUID TESTADO' as info,
  'SEU_UUID_AQUI'::uuid as uuid_testado,
  EXISTS(SELECT 1 FROM laboratorios WHERE id = 'SEU_UUID_AQUI'::uuid) as existe_em_laboratorios;

-- Buscar esse UUID nos fornecedores do SIS_LENS (executar lá)
-- SELECT * FROM core.fornecedores WHERE id = 'SEU_UUID_AQUI'::uuid;
*/


-- ===================================================================
-- 📊 SUMÁRIO DA INVESTIGAÇÃO
-- ===================================================================

\echo '===== SUMÁRIO E CONCLUSÕES ====='

/*
🔍 DESCOBERTAS CRÍTICAS:

1️⃣ SIS_LENS ↔ CRM_ERP: UUIDs IDÊNTICOS! ✅
   - Brascor: 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 (mesmo UUID nos 2 bancos)
   - Express: 8eb9498c-3d99-4d26-bb8c-e503f97ccf2c (mesmo UUID nos 2 bancos)
   - Polylux: 3a0a8ad3-4c55-44a2-b9fa-232a9f2fdc21 (mesmo UUID nos 2 bancos)
   
   ✅ Conclusão: CRM_ERP e SIS_LENS foram sincronizados com mesmos UUIDs

2️⃣ DESENROLA_DCL: UUIDs DIFERENTES! ❌
   - Express DESENROLA: 74dc986a-1063-4b8e-8964-59eb396e10eb
   - Express SIS_LENS: 8eb9498c-3d99-4d26-bb8c-e503f97ccf2c
   
   ❌ Conclusão: DESENROLA_DCL foi criado INDEPENDENTEMENTE

3️⃣ SIS_VENDAS: Sem fornecedores ✅
   - É apenas PDV (Ponto de Venda)
   - Consome dados de CRM_ERP e SIS_LENS

📋 ESTRUTURA DOS 4 BANCOS:
┌─────────────────┬──────────────────────────┬─────────┬────────────────────┐
│ BANCO           │ TABELA                   │ TOTAL   │ PROPÓSITO          │
├─────────────────┼──────────────────────────┼─────────┼────────────────────┤
│ DESENROLA_DCL   │ public.laboratorios      │ 14      │ Labs de lentes     │
│ SIS_LENS        │ core.fornecedores        │ 11      │ Fornec. de lentes  │
│ CRM_ERP         │ pessoas.fornecedores     │ 11      │ Fornec. armações   │
│ SIS_VENDAS      │ (não tem)                │ 0       │ Apenas PDV         │
└─────────────────┴──────────────────────────┴─────────┴────────────────────┘

🔄 MAPEAMENTO NECESSÁRIO:
   SIS_LENS (UUID antigo) → DESENROLA_DCL (UUID novo)
   
   Usar: database/CRIAR-MAPEAMENTO-FORNECEDORES.sql
*/

-- Resumo final
SELECT 
  'DESENROLA_DCL' as banco,
  'laboratorios' as tabela_chave,
  COUNT(*) as total,
  'UUIDs NOVOS - Precisa mapeamento' as status
FROM laboratorios
UNION ALL
SELECT 
  'SIS_LENS + CRM_ERP' as banco,
  'core.fornecedores + pessoas.fornecedores' as tabela_chave,
  11 as total,
  'UUIDs COMPARTILHADOS entre si' as status;
