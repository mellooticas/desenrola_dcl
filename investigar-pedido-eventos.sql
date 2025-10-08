-- ============================================================================
-- INVESTIGAR TABELA PEDIDO_EVENTOS
-- ============================================================================

-- 1. Verificar se a tabela existe e sua estrutura
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'pedido_eventos'
ORDER BY ordinal_position;

| column_name     | data_type                | is_nullable | column_default    |
| --------------- | ------------------------ | ----------- | ----------------- |
| id              | uuid                     | NO          | gen_random_uuid() |
| pedido_id       | uuid                     | NO          | null              |
| tipo            | character varying        | NO          | null              |
| titulo          | text                     | NO          | null              |
| descricao       | text                     | YES         | null              |
| status_anterior | character varying        | YES         | null              |
| status_novo     | character varying        | YES         | null              |
| detalhes        | jsonb                    | YES         | '{}'::jsonb       |
| usuario         | text                     | YES         | null              |
| automatico      | boolean                  | YES         | false             |
| created_at      | timestamp with time zone | YES         | now()             |

-- 2. Contar total de eventos
SELECT COUNT(*) as total_eventos FROM pedido_eventos;

| total_eventos |
| ------------- |
| 1354          |

-- 3. Ver os primeiros 10 eventos
SELECT * FROM pedido_eventos ORDER BY created_at DESC LIMIT 10;

| id                                   | pedido_id                            | tipo          | titulo                               | descricao                                                 | status_anterior | status_novo | detalhes                                                             | usuario                | automatico | created_at                    |
| ------------------------------------ | ------------------------------------ | ------------- | ------------------------------------ | --------------------------------------------------------- | --------------- | ----------- | -------------------------------------------------------------------- | ---------------------- | ---------- | ----------------------------- |
| 87e105c9-7715-419e-ab17-4374c9b07b59 | a7323704-1200-4722-9326-eb448df64c7a | STATUS_CHANGE | Status Alterado: PRODUCAO → PAGO     | Status alterado de PRODUCAO para PAGO automaticamente     | PRODUCAO        | PAGO        | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":115} | Teste Trigger Timeline | true       | 2025-10-08 02:56:03.122127+00 |
| 91e04818-1fed-4e34-8430-505069b676e5 | a7323704-1200-4722-9326-eb448df64c7a | STATUS_CHANGE | Status Alterado: PAGO → PRODUCAO     | Status alterado de PAGO para PRODUCAO automaticamente     | PAGO            | PRODUCAO    | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":115} | Teste Trigger Timeline | true       | 2025-10-08 02:56:00.506636+00 |
| ef130cbe-1fe2-4d5b-8290-7bf82cb04de1 | a7323704-1200-4722-9326-eb448df64c7a | STATUS_CHANGE | Status Alterado: AG_PAGAMENTO → PAGO | Status alterado de AG_PAGAMENTO para PAGO automaticamente | AG_PAGAMENTO    | PAGO        | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":115} | sistema                | true       | 2025-10-07 19:57:38.571235+00 |
| 226f021e-6f2d-4f1c-9c18-7bebbb87bfda | a7323704-1200-4722-9326-eb448df64c7a | NOTE          | Observação adicionada                | Movido via drag & drop de Aguardando Pagamento para Pago  | null            | null        | {}                                                                   | Financeiro ESC         | true       | 2025-10-07 19:57:38.571235+00 |
| 744141b4-d201-4c33-8812-e707f6344a6d | 305542fe-6617-4275-8287-d8e24cd6ec2f | STATUS_CHANGE | Status Alterado: AG_PAGAMENTO → PAGO | Status alterado de AG_PAGAMENTO para PAGO automaticamente | AG_PAGAMENTO    | PAGO        | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":117} | sistema                | true       | 2025-10-07 19:56:42.865123+00 |
| c6676884-fe1b-43cf-8aa8-154e9ef1a81a | 305542fe-6617-4275-8287-d8e24cd6ec2f | NOTE          | Observação adicionada                | Movido via drag & drop de Aguardando Pagamento para Pago  | null            | null        | {}                                                                   | Financeiro ESC         | true       | 2025-10-07 19:56:42.865123+00 |
| f2cb0adf-621e-4ce7-b1dd-d5e11820c147 | cbea918d-36bb-4765-b532-da5af49c1ea6 | STATUS_CHANGE | Status Alterado: AG_PAGAMENTO → PAGO | Status alterado de AG_PAGAMENTO para PAGO automaticamente | AG_PAGAMENTO    | PAGO        | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":118} | sistema                | true       | 2025-10-07 19:56:36.76356+00  |
| acf1b979-2bcb-43d2-ac48-a1a46f12c99e | cbea918d-36bb-4765-b532-da5af49c1ea6 | NOTE          | Observação adicionada                | Movido via drag & drop de Aguardando Pagamento para Pago  | null            | null        | {}                                                                   | Financeiro ESC         | true       | 2025-10-07 19:56:36.76356+00  |
| 9db86580-e357-43c3-9b14-c40a17114081 | 3b3edbe7-3adf-4731-ae06-f602db42c02a | STATUS_CHANGE | Status Alterado: AG_PAGAMENTO → PAGO | Status alterado de AG_PAGAMENTO para PAGO automaticamente | AG_PAGAMENTO    | PAGO        | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":120} | sistema                | true       | 2025-10-07 19:56:31.135038+00 |
| 6dd9f3fc-4c00-40f0-924d-41c14b2ca34e | 3b3edbe7-3adf-4731-ae06-f602db42c02a | NOTE          | Observação adicionada                | Movido via drag & drop de Aguardando Pagamento para Pago  | null            | null        | {}                                                                   | Financeiro ESC         | true       | 2025-10-07 19:56:31.135038+00 |


-- 4. Ver distribuição por tipo de evento
SELECT 
  tipo_evento,
  COUNT(*) as quantidade
FROM pedido_eventos
GROUP BY tipo_evento
ORDER BY quantidade DESC;

| quantidade |
| ---------- |
| 1354       | tirei o tipo_evento





-- 5. Ver eventos de mudança de status (se houver)
SELECT * 
FROM pedido_eventos 
WHERE tipo_evento ILIKE '%status%' 
   OR descricao ILIKE '%status%'
ORDER BY created_at DESC 
LIMIT 10;


| id                                   | pedido_id                            | tipo          | titulo                               | descricao                                                 | status_anterior | status_novo | detalhes                                                             | usuario                | automatico | created_at                    |
| ------------------------------------ | ------------------------------------ | ------------- | ------------------------------------ | --------------------------------------------------------- | --------------- | ----------- | -------------------------------------------------------------------- | ---------------------- | ---------- | ----------------------------- |
| 87e105c9-7715-419e-ab17-4374c9b07b59 | a7323704-1200-4722-9326-eb448df64c7a | STATUS_CHANGE | Status Alterado: PRODUCAO → PAGO     | Status alterado de PRODUCAO para PAGO automaticamente     | PRODUCAO        | PAGO        | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":115} | Teste Trigger Timeline | true       | 2025-10-08 02:56:03.122127+00 |
| 91e04818-1fed-4e34-8430-505069b676e5 | a7323704-1200-4722-9326-eb448df64c7a | STATUS_CHANGE | Status Alterado: PAGO → PRODUCAO     | Status alterado de PAGO para PRODUCAO automaticamente     | PAGO            | PRODUCAO    | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":115} | Teste Trigger Timeline | true       | 2025-10-08 02:56:00.506636+00 |
| ef130cbe-1fe2-4d5b-8290-7bf82cb04de1 | a7323704-1200-4722-9326-eb448df64c7a | STATUS_CHANGE | Status Alterado: AG_PAGAMENTO → PAGO | Status alterado de AG_PAGAMENTO para PAGO automaticamente | AG_PAGAMENTO    | PAGO        | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":115} | sistema                | true       | 2025-10-07 19:57:38.571235+00 |
| 226f021e-6f2d-4f1c-9c18-7bebbb87bfda | a7323704-1200-4722-9326-eb448df64c7a | NOTE          | Observação adicionada                | Movido via drag & drop de Aguardando Pagamento para Pago  | null            | null        | {}                                                                   | Financeiro ESC         | true       | 2025-10-07 19:57:38.571235+00 |
| 744141b4-d201-4c33-8812-e707f6344a6d | 305542fe-6617-4275-8287-d8e24cd6ec2f | STATUS_CHANGE | Status Alterado: AG_PAGAMENTO → PAGO | Status alterado de AG_PAGAMENTO para PAGO automaticamente | AG_PAGAMENTO    | PAGO        | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":117} | sistema                | true       | 2025-10-07 19:56:42.865123+00 |
| c6676884-fe1b-43cf-8aa8-154e9ef1a81a | 305542fe-6617-4275-8287-d8e24cd6ec2f | NOTE          | Observação adicionada                | Movido via drag & drop de Aguardando Pagamento para Pago  | null            | null        | {}                                                                   | Financeiro ESC         | true       | 2025-10-07 19:56:42.865123+00 |
| f2cb0adf-621e-4ce7-b1dd-d5e11820c147 | cbea918d-36bb-4765-b532-da5af49c1ea6 | STATUS_CHANGE | Status Alterado: AG_PAGAMENTO → PAGO | Status alterado de AG_PAGAMENTO para PAGO automaticamente | AG_PAGAMENTO    | PAGO        | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":118} | sistema                | true       | 2025-10-07 19:56:36.76356+00  |
| acf1b979-2bcb-43d2-ac48-a1a46f12c99e | cbea918d-36bb-4765-b532-da5af49c1ea6 | NOTE          | Observação adicionada                | Movido via drag & drop de Aguardando Pagamento para Pago  | null            | null        | {}                                                                   | Financeiro ESC         | true       | 2025-10-07 19:56:36.76356+00  |
| 9db86580-e357-43c3-9b14-c40a17114081 | 3b3edbe7-3adf-4731-ae06-f602db42c02a | STATUS_CHANGE | Status Alterado: AG_PAGAMENTO → PAGO | Status alterado de AG_PAGAMENTO para PAGO automaticamente | AG_PAGAMENTO    | PAGO        | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":120} | sistema                | true       | 2025-10-07 19:56:31.135038+00 |
| 6dd9f3fc-4c00-40f0-924d-41c14b2ca34e | 3b3edbe7-3adf-4731-ae06-f602db42c02a | NOTE          | Observação adicionada                | Movido via drag & drop de Aguardando Pagamento para Pago  | null            | null        | {}                                                                   | Financeiro ESC         | true       | 2025-10-07 19:56:31.135038+00 |

-- 6. Ver últimos eventos de cada pedido
SELECT 
  pe.*,
  p.numero_sequencial
FROM pedido_eventos pe
JOIN pedidos p ON p.id = pe.pedido_id
ORDER BY pe.created_at DESC
LIMIT 20;

| id                                   | pedido_id                            | tipo          | titulo                                     | descricao                                                            | status_anterior | status_novo  | detalhes                                                             | usuario                | automatico | created_at                    | numero_sequencial |
| ------------------------------------ | ------------------------------------ | ------------- | ------------------------------------------ | -------------------------------------------------------------------- | --------------- | ------------ | -------------------------------------------------------------------- | ---------------------- | ---------- | ----------------------------- | ----------------- |
| 87e105c9-7715-419e-ab17-4374c9b07b59 | a7323704-1200-4722-9326-eb448df64c7a | STATUS_CHANGE | Status Alterado: PRODUCAO → PAGO           | Status alterado de PRODUCAO para PAGO automaticamente                | PRODUCAO        | PAGO         | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":115} | Teste Trigger Timeline | true       | 2025-10-08 02:56:03.122127+00 | 115               |
| 91e04818-1fed-4e34-8430-505069b676e5 | a7323704-1200-4722-9326-eb448df64c7a | STATUS_CHANGE | Status Alterado: PAGO → PRODUCAO           | Status alterado de PAGO para PRODUCAO automaticamente                | PAGO            | PRODUCAO     | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":115} | Teste Trigger Timeline | true       | 2025-10-08 02:56:00.506636+00 | 115               |
| ef130cbe-1fe2-4d5b-8290-7bf82cb04de1 | a7323704-1200-4722-9326-eb448df64c7a | STATUS_CHANGE | Status Alterado: AG_PAGAMENTO → PAGO       | Status alterado de AG_PAGAMENTO para PAGO automaticamente            | AG_PAGAMENTO    | PAGO         | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":115} | sistema                | true       | 2025-10-07 19:57:38.571235+00 | 115               |
| 226f021e-6f2d-4f1c-9c18-7bebbb87bfda | a7323704-1200-4722-9326-eb448df64c7a | NOTE          | Observação adicionada                      | Movido via drag & drop de Aguardando Pagamento para Pago             | null            | null         | {}                                                                   | Financeiro ESC         | true       | 2025-10-07 19:57:38.571235+00 | 115               |
| 744141b4-d201-4c33-8812-e707f6344a6d | 305542fe-6617-4275-8287-d8e24cd6ec2f | STATUS_CHANGE | Status Alterado: AG_PAGAMENTO → PAGO       | Status alterado de AG_PAGAMENTO para PAGO automaticamente            | AG_PAGAMENTO    | PAGO         | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":117} | sistema                | true       | 2025-10-07 19:56:42.865123+00 | 117               |
| c6676884-fe1b-43cf-8aa8-154e9ef1a81a | 305542fe-6617-4275-8287-d8e24cd6ec2f | NOTE          | Observação adicionada                      | Movido via drag & drop de Aguardando Pagamento para Pago             | null            | null         | {}                                                                   | Financeiro ESC         | true       | 2025-10-07 19:56:42.865123+00 | 117               |
| f2cb0adf-621e-4ce7-b1dd-d5e11820c147 | cbea918d-36bb-4765-b532-da5af49c1ea6 | STATUS_CHANGE | Status Alterado: AG_PAGAMENTO → PAGO       | Status alterado de AG_PAGAMENTO para PAGO automaticamente            | AG_PAGAMENTO    | PAGO         | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":118} | sistema                | true       | 2025-10-07 19:56:36.76356+00  | 118               |
| acf1b979-2bcb-43d2-ac48-a1a46f12c99e | cbea918d-36bb-4765-b532-da5af49c1ea6 | NOTE          | Observação adicionada                      | Movido via drag & drop de Aguardando Pagamento para Pago             | null            | null         | {}                                                                   | Financeiro ESC         | true       | 2025-10-07 19:56:36.76356+00  | 118               |
| 9db86580-e357-43c3-9b14-c40a17114081 | 3b3edbe7-3adf-4731-ae06-f602db42c02a | STATUS_CHANGE | Status Alterado: AG_PAGAMENTO → PAGO       | Status alterado de AG_PAGAMENTO para PAGO automaticamente            | AG_PAGAMENTO    | PAGO         | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":120} | sistema                | true       | 2025-10-07 19:56:31.135038+00 | 120               |
| 6dd9f3fc-4c00-40f0-924d-41c14b2ca34e | 3b3edbe7-3adf-4731-ae06-f602db42c02a | NOTE          | Observação adicionada                      | Movido via drag & drop de Aguardando Pagamento para Pago             | null            | null         | {}                                                                   | Financeiro ESC         | true       | 2025-10-07 19:56:31.135038+00 | 120               |
| e066665a-bc75-4645-bcc6-7f004d433c5e | ee534231-78b5-4728-b72f-ebe8dc1296df | STATUS_CHANGE | Status Alterado: AG_PAGAMENTO → PAGO       | Status alterado de AG_PAGAMENTO para PAGO automaticamente            | AG_PAGAMENTO    | PAGO         | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":119} | sistema                | true       | 2025-10-07 19:56:26.963196+00 | 119               |
| 456d3d67-0456-405b-a349-53ecb792c886 | ee534231-78b5-4728-b72f-ebe8dc1296df | NOTE          | Observação adicionada                      | Movido via drag & drop de Aguardando Pagamento para Pago             | null            | null         | {}                                                                   | Financeiro ESC         | true       | 2025-10-07 19:56:26.963196+00 | 119               |
| db1210dc-8fbd-485c-8aa0-f33d1c7a51f0 | f8a523da-d02a-4c01-a999-55f3ae63067d | NOTE          | Observação adicionada                      | Movido via drag & drop de Aguardando Pagamento para Pago             | null            | null         | {}                                                                   | Financeiro ESC         | true       | 2025-10-07 19:56:20.768111+00 | 121               |
| 35743988-5d1c-4033-ad74-f2b9edd5a798 | f8a523da-d02a-4c01-a999-55f3ae63067d | STATUS_CHANGE | Status Alterado: AG_PAGAMENTO → PAGO       | Status alterado de AG_PAGAMENTO para PAGO automaticamente            | AG_PAGAMENTO    | PAGO         | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":121} | sistema                | true       | 2025-10-07 19:56:20.768111+00 | 121               |
| 7d5c693f-c38d-4fba-92dc-64dacb2d4665 | a2d80135-1ae7-4c8f-81de-0e40ffa9cdc1 | STATUS_CHANGE | Status Alterado: CHEGOU → ENTREGUE         | Status alterado de CHEGOU para ENTREGUE automaticamente              | CHEGOU          | ENTREGUE     | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":60}  | sistema                | true       | 2025-10-07 19:26:59.482949+00 | 60                |
| dfe6fa3a-234d-498d-88a7-145c7aa65450 | a2d80135-1ae7-4c8f-81de-0e40ffa9cdc1 | NOTE          | Observação adicionada                      | Avançado de Chegou na Loja para Entregue por Operadores Lojas        | null            | null         | {}                                                                   | Operadores Lojas       | true       | 2025-10-07 19:26:59.482949+00 | 60                |
| 27823ee5-34c5-4e01-8cab-99ebf49d91a4 | 1241a96f-9a7c-4dd9-9e27-32bfd5d7b347 | STATUS_CHANGE | Status Alterado: CHEGOU → ENTREGUE         | Status alterado de CHEGOU para ENTREGUE automaticamente              | CHEGOU          | ENTREGUE     | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":48}  | sistema                | true       | 2025-10-07 19:23:54.174937+00 | 48                |
| 46f88f60-6220-40a6-bbc7-ff0fa6351fe7 | 1241a96f-9a7c-4dd9-9e27-32bfd5d7b347 | NOTE          | Observação adicionada                      | Avançado de Chegou na Loja para Entregue por Operadores Lojas        | null            | null         | {}                                                                   | Operadores Lojas       | true       | 2025-10-07 19:23:54.174937+00 | 48                |
| 3f8895e2-c217-4a70-abe9-4649470d95ab | 8a99ef18-0e87-4523-8a02-9a6b9dbcf2e4 | STATUS_CHANGE | Status Alterado: REGISTRADO → AG_PAGAMENTO | Status alterado de REGISTRADO para AG_PAGAMENTO automaticamente      | REGISTRADO      | AG_PAGAMENTO | {"trigger":"automatico","operacao":"UPDATE","numero_sequencial":129} | sistema                | true       | 2025-10-06 19:49:13.856157+00 | 129               |
| caf0aaa3-e896-4ea5-a453-755aba9524aa | 8a99ef18-0e87-4523-8a02-9a6b9dbcf2e4 | NOTE          | Observação adicionada                      | Avançado de Registrado para Aguardando Pagamento por DCL Laboratório | null            | null         | {}                                                                   | DCL Laboratório        | true       | 2025-10-06 19:49:13.856157+00 | 129               |

-- ============================================================================
-- OBJETIVO: Entender a estrutura e ver se podemos migrar dados para timeline
-- ============================================================================
