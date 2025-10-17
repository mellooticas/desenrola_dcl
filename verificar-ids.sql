-- VERIFICAR ESTRUTURA DAS TABELAS PARA USAR IDs CORRETOS

-- 1. Verificar IDs disponíveis na tabela lojas
SELECT id, nome FROM lojas LIMIT 5;

| id                                   | nome               |
| ------------------------------------ | ------------------ |
| e974fc5d-ed39-4831-9e5e-4a5544489de6 | Escritório Central |
| c1aa5124-bdec-4cd2-86ee-cba6eea5041d | Mauá               |
| f1dd8fe9-b783-46cd-ad26-56ad364a85d7 | Perus              |
| c2bb8806-91d1-4670-9ce2-a949b188f8ae | Rio Pequeno        |
| 626c4397-72cd-46de-93ec-1a4255e21e44 | São Mateus         |

-- 2. Verificar IDs disponíveis na tabela laboratorios  
SELECT id, nome FROM laboratorios LIMIT 5;

| id                                   | nome         |
| ------------------------------------ | ------------ |
| d7cc1746-0749-40d6-97b6-94e50c7a1d1b | Braslentes   |
| 2861abfc-7a83-4929-9e9f-7c2541f863f0 | Sygma        |
| 3a65944b-330a-4b56-b983-f0f3de3905a1 | Blue Optical |
| 8ce109c1-69d3-484a-a87b-8accf7984132 | Brascor      |
| 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | HighVision   |

-- 3. Verificar IDs disponíveis na tabela classes_lente
SELECT id, nome FROM classes_lente LIMIT 5;

| id                                   | nome                     |
| ------------------------------------ | ------------------------ |
| 8886773e-a171-47c9-8a6d-8eb66f9f20ac | Multifocal Pronta        |
| be797f77-1ee2-4cb7-8241-9f03011f900f | Multifocal Surfaçada     |
| 579ac110-c4ec-4e45-9352-53a857be4c06 | Multifocal Free Form     |
| d98c3562-ddd8-4db7-bf69-de9eb8633f3e | Bifocal                  |
| 9fddadfe-ea07-4dd9-be67-a20d71267710 | Visão Simples Surfarçada |


-- 4. Verificar estrutura da tabela pedidos
\d pedidos;