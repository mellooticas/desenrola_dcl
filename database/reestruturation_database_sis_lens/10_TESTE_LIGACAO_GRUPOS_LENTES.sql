-- ============================================================================
-- TESTE: Ligação Grupos Canônicos ↔ Lentes
-- ============================================================================
-- Objetivo: Verificar se a ligação entre grupos e lentes está funcionando
-- Data: 20/01/2026
-- ============================================================================

-- ============================================================================
-- TESTE 1: Estatísticas de Cobertura
-- ============================================================================
-- Verificar quantas lentes têm grupo canônico associado

SELECT 
  'Total de Lentes' AS metrica,
  COUNT(*) AS total
FROM v_lentes

UNION ALL

SELECT 
  'Lentes COM grupo canônico',
  COUNT(*)
FROM v_lentes
WHERE grupo_canonico_id IS NOT NULL

UNION ALL

SELECT 
  'Lentes SEM grupo canônico',
  COUNT(*)
FROM v_lentes
WHERE grupo_canonico_id IS NULL

UNION ALL

SELECT 
  'Percentual de Cobertura',
  ROUND((COUNT(*) FILTER (WHERE grupo_canonico_id IS NOT NULL)::NUMERIC / COUNT(*) * 100), 2)
FROM v_lentes;


| metrica                   | total  |
| ------------------------- | ------ |
| Total de Lentes           | 1411   |
| Lentes COM grupo canônico | 1411   |
| Lentes SEM grupo canônico | 0      |
| Percentual de Cobertura   | 100.00 |


-- ============================================================================
-- TESTE 2: Grupos → Lentes (verificar se grupos retornam lentes)
-- ============================================================================
-- Buscar grupos canônicos e contar suas lentes

SELECT 
  gc.id AS grupo_id,
  gc.nome_grupo,
  gc.tipo_lente,
  gc.material,
  gc.indice_refracao,
  gc.preco_medio AS preco_grupo,
  gc.total_lentes AS lentes_no_grupo,
  COUNT(l.id) AS lentes_na_view
FROM v_grupos_canonicos gc
LEFT JOIN v_lentes l ON l.grupo_canonico_id = gc.id
GROUP BY gc.id, gc.nome_grupo, gc.tipo_lente, gc.material, gc.indice_refracao, gc.preco_medio, gc.total_lentes
ORDER BY gc.preco_medio
LIMIT 20;


| grupo_id                             | nome_grupo                                                                  | tipo_lente    | material      | indice_refracao | preco_grupo | lentes_no_grupo | lentes_na_view |
| ------------------------------------ | --------------------------------------------------------------------------- | ------------- | ------------- | --------------- | ----------- | --------------- | -------------- |
| 573729aa-91b7-4f74-b2dc-00e5bcd9ea34 | Lente POLICARBONATO 1.59 Visao Simples +UV [-10.00/6.00 | 0.00/-2.00]       | visao_simples | POLICARBONATO | 1.59            | 250.00      | 1               | 1              |
| 30d581c1-4b46-41a8-b4a5-6653c862ec7a | Lente CR39 1.50 Visao Simples +UV [-6.00/6.00 | 0.00/-2.00]                 | visao_simples | CR39          | 1.50            | 250.00      | 1               | 1              |
| 62d675b2-e9b2-47d3-b98f-9ff53b26eca7 | Lente CR39 1.56 Visao Simples +AR +UV [-8.00/6.00 | 0.00/-2.00]             | visao_simples | CR39          | 1.56            | 253.91      | 1               | 1              |
| 928ddd31-a900-4340-8d3f-094e68538524 | Lente CR39 1.50 Visao Simples +UV [-6.00/6.00 | -2.00/2.00]                 | visao_simples | CR39          | 1.50            | 255.87      | 1               | 1              |
| 14a2d496-3947-4b9e-9ff2-aff781d7cee3 | Lente CR39 1.56 Visao Simples +AR +UV [-8.00/6.00 | -2.00/0.00]             | visao_simples | CR39          | 1.56            | 261.73      | 1               | 1              |
| 4c50219d-9140-4a59-b30b-c0adadd43051 | Lente CR39 1.56 Visao Simples +UV [-6.00/6.00 | -2.00/0.00]                 | visao_simples | CR39          | 1.56            | 265.64      | 1               | 1              |
| 7ae84a5b-46b9-488b-a0fb-5c35bdcdc9f7 | Lente CR39 1.56 Visao Simples +UV +BlueLight [-6.00/6.00 | 0.00/-2.00]      | visao_simples | CR39          | 1.56            | 265.64      | 2               | 2              |
| 636a8f30-bebb-4553-ac8b-505b4d897ecb | Lente CR39 1.50 Visao Simples +AR +UV [-4.00/4.00 | 0.00/-2.00]             | visao_simples | CR39          | 1.50            | 267.60      | 1               | 1              |
| a47e13a0-4e6a-4153-bf54-78e534e58e6b | Lente CR39 1.56 Visao Simples +AR +UV [-6.00/6.00 | -2.25/-4.00]            | visao_simples | CR39          | 1.56            | 273.47      | 2               | 2              |
| 3ee458a1-b0da-4b18-b55f-5160eb57f8ee | Lente POLICARBONATO 1.59 Visao Simples +UV [-6.00/6.00 | -2.25/-4.00]       | visao_simples | POLICARBONATO | 1.59            | 273.47      | 1               | 1              |
| 3a79ba0f-2bdd-4f1a-a0b9-e5d5cd463ad7 | Lente CR39 1.50 Visao Simples +AR +UV [-6.00/6.00 | -2.25/-4.00]            | visao_simples | CR39          | 1.50            | 275.42      | 1               | 1              |
| 4c7c241c-fe6c-426b-91aa-b5dccf30abba | Lente POLICARBONATO 1.59 Visao Simples +AR +UV [-10.00/6.00 | 0.00/-2.00]   | visao_simples | POLICARBONATO | 1.59            | 281.29      | 1               | 1              |
| f87cac93-9763-4271-8aa9-f91cd7ef96b4 | Lente CR39 1.56 Visao Simples +UV +BlueLight [-6.00/6.00 | -2.25/-4.00]     | visao_simples | CR39          | 1.56            | 281.29      | 2               | 2              |
| 8fb489a7-604a-41cc-972b-b3458b18dd9b | Lente POLICARBONATO 1.59 Visao Simples +UV [-6.00/4.00 | 0.00/-2.00]        | visao_simples | POLICARBONATO | 1.59            | 282.85      | 1               | 1              |
| 96cc23dd-a7bf-454f-b383-d1fb81de3e73 | Lente CR39 1.50 Visao Simples +UV [-4.00/6.00 | 0.00/-2.00]                 | visao_simples | CR39          | 1.50            | 287.15      | 1               | 1              |
| 27fcd3ef-e6f4-495d-a91e-27e7f92f513f | Lente CR39 1.56 Visao Simples +AR +UV +BlueLight [-6.00/4.00 | -2.00/0.00]  | visao_simples | CR39          | 1.56            | 289.11      | 2               | 2              |
| 5faf19ca-c9c0-49d9-94b6-8d8bf1c3eab1 | Lente CR39 1.56 Visao Simples +UV +BlueLight [-4.00/4.00 | -2.00/0.00]      | visao_simples | CR39          | 1.56            | 293.02      | 1               | 1              |
| 50b7df71-a005-4efa-bbeb-a709bb3551a5 | Lente CR39 1.56 Visao Simples +AR +UV +BlueLight [-6.00/6.00 | -2.25/-4.00] | visao_simples | CR39          | 1.56            | 293.02      | 4               | 4              |
| af79dfea-e8f8-4521-baae-c391252bc71a | Lente POLICARBONATO 1.59 Visao Simples +UV [-6.00/6.00 | -2.00/0.00]        | visao_simples | POLICARBONATO | 1.59            | 293.02      | 1               | 1              |
| 1a4867c0-40a9-486f-b82a-f009e218ed4d | Lente CR39 1.56 Visao Simples +AR +UV [-8.00/4.00 | 0.00/-2.00]             | visao_simples | CR39          | 1.56            | 299.27      | 3               | 3              |

-- ============================================================================
-- TESTE 3: Lentes → Grupos (verificar se lentes retornam seus grupos)
-- ============================================================================
-- Buscar lentes e verificar dados do grupo

SELECT 
  l.id AS lente_id,
  l.nome_lente,
  l.fornecedor_nome,
  l.marca_nome,
  l.tipo_lente,
  l.material,
  l.indice_refracao,
  l.preco_venda_sugerido AS preco_lente,
  l.grupo_canonico_id,
  l.grupo_nome,
  gc.preco_medio AS preco_grupo,
  gc.total_lentes AS lentes_no_grupo
FROM v_lentes l
LEFT JOIN v_grupos_canonicos gc ON gc.id = l.grupo_canonico_id
WHERE l.tipo_lente = 'visao_simples'
  AND l.material = 'CR39'
  AND l.indice_refracao = '1.50'
ORDER BY l.preco_venda_sugerido
LIMIT 20;

| lente_id                             | nome_lente                                | fornecedor_nome | marca_nome  | tipo_lente    | material | indice_refracao | preco_lente | grupo_canonico_id                    | grupo_nome                                                                     | preco_grupo | lentes_no_grupo |
| ------------------------------------ | ----------------------------------------- | --------------- | ----------- | ------------- | -------- | --------------- | ----------- | ------------------------------------ | ------------------------------------------------------------------------------ | ----------- | --------------- |
| 3d656633-f8cc-4e48-af26-d2a9f1408f8c | LT CR 1.49 Incolor (TINTÁVEL)             | Sygma           | SYGMA       | visao_simples | CR39     | 1.50            | 0.00        | 928ddd31-a900-4340-8d3f-094e68538524 | Lente CR39 1.50 Visao Simples +UV [-6.00/6.00 | -2.00/2.00]                    | 255.87      | 1               |
| 5a464ac2-b4c1-43b4-a19b-f6af81c28230 | LENTE AC. COM AR 1.49                     | Brascor         | BRASCOR     | visao_simples | CR39     | 1.50            | 0.00        | 636a8f30-bebb-4553-ac8b-505b4d897ecb | Lente CR39 1.50 Visao Simples +AR +UV [-4.00/4.00 | 0.00/-2.00]                | 267.60      | 1               |
| 08fa44ef-8d82-4f5b-b6da-b981c533080b | LT CR 1.49 Incolor Cil. Ext. (TINTÁVEL)   | Sygma           | SYGMA       | visao_simples | CR39     | 1.50            | 0.00        | 3a79ba0f-2bdd-4f1a-a0b9-e5d5cd463ad7 | Lente CR39 1.50 Visao Simples +AR +UV [-6.00/6.00 | -2.25/-4.00]               | 275.42      | 1               |
| db6b4cf0-033a-4641-82fd-54e6140bd936 | LENTE AC. 1.49 INCOLOR                    | Brascor         | BRASCOR     | visao_simples | CR39     | 1.50            | 0.00        | 96cc23dd-a7bf-454f-b383-d1fb81de3e73 | Lente CR39 1.50 Visao Simples +UV [-4.00/6.00 | 0.00/-2.00]                    | 287.15      | 1               |
| 2cc91b1d-fed5-49b2-8a4b-fef24e5d7976 | LT CR 1.49 INCOLOR CIL. EXT. (TINTAVEL)   | Express         | EXPRESS     | visao_simples | CR39     | 1.50            | 0.00        | bf12d88f-9acc-459e-916d-5bd2bb0f62b5 | Lente CR39 1.50 Visao Simples +UV [-4.00/4.00 | -2.25/-4.00]                   | 304.75      | 2               |
| a48b35e1-381d-43b2-a094-614160acaf23 | LENTE AC. 1.49 INCOLOR CIL. ESTENDIDO     | Brascor         | BRASCOR     | visao_simples | CR39     | 1.50            | 0.00        | bf12d88f-9acc-459e-916d-5bd2bb0f62b5 | Lente CR39 1.50 Visao Simples +UV [-4.00/4.00 | -2.25/-4.00]                   | 304.75      | 2               |
| 42d403f7-f9a3-40f7-9d20-655a8ce0a9bf | VISAO SIMPLES CR (NAO TINTAVEL)           | Express         | EXPRESS     | visao_simples | CR39     | 1.50            | 0.00        | cd4313a8-ec50-467c-9d06-69f84cabf64d | Lente CR39 1.50 Visao Simples +UV [-6.00/8.00 | 0.00/-4.00]                    | 371.24      | 1               |
| 87f464fb-dc2d-4e3f-ada0-c7025d20b9bd | VISAO SIMPLES CR PLUS (TINTAVEL)          | Express         | EXPRESS     | visao_simples | CR39     | 1.50            | 0.00        | 482eb5d2-d057-4fc2-ba7d-b59bad57401d | Lente CR39 1.50 Visao Simples +UV [-10.00/8.00 | 0.00/-4.00]                   | 410.35      | 1               |
| 5bee5b4e-bfc1-48b1-9059-2eb5aa360e70 | VISAO SIMPLES CR PLUS                     | Express         | EXPRESS     | visao_simples | CR39     | 1.50            | 0.00        | 9db99661-ce7e-4492-b606-766f7c9574f7 | Lente CR39 1.50 Visao Simples +UV [-6.00/6.00 | 0.00/-4.00]                    | 410.35      | 1               |
| cd99f454-6e1d-409b-8394-8273e3259d0c | VISAO SIMPLES DIGITAL 1.49 INC            | Polylux         | POLYLUX     | visao_simples | CR39     | 1.50            | 0.00        | 338c124c-6516-4e7a-b1e3-7489344e975d | Lente CR39 1.50 Visao Simples +UV [-6.00/6.00 | -4.00/0.00]                    | 496.38      | 1               |
| f18854af-c3c7-4f40-9563-77c0ca7232ca | VISAO SIMPLES CR PHOTO PLUS               | Express         | EXPRESS     | visao_simples | CR39     | 1.50            | 0.00        | 1fd33a5c-6c34-4d14-b7ef-4a9d03ee31db | Lente CR39 1.50 Visao Simples +UV +fotocromático [-8.00/10.00 | 0.00/-4.00]    | 605.89      | 1               |
| 31716d48-f28d-4b2e-9bae-ede36412eb6d | VISAO SIMPLES DIGITAL 1.49 BLUE INC       | Polylux         | POLYLUX     | visao_simples | CR39     | 1.50            | 0.00        | 160cee43-1dc1-4dd5-a1da-b5f84ca1e40f | Lente CR39 1.50 Visao Simples +UV +BlueLight [-6.00/6.00 | -4.00/0.00]         | 688.02      | 1               |
| ef5adbee-10b1-4014-b7d9-595be7dfeb96 | VISAO SIMPLES DIGITAL 1.49 AR             | Polylux         | POLYLUX     | visao_simples | CR39     | 1.50            | 0.00        | aa06bcac-1de3-450a-88b6-88ffe7cea158 | Lente CR39 1.50 Visao Simples +AR +UV [-6.00/6.00 | -4.00/0.00]                | 727.13      | 1               |
| 23a2270f-a46e-48ef-a1c5-f5ad722fb8f8 | 1.70 RESINA AR BLUE                       | Polylux         | POLYLUX     | visao_simples | CR39     | 1.50            | 0.00        | 269eb02c-fa87-43c0-be8c-44227dce121c | Lente CR39 1.50 Visao Simples +AR +UV +BlueLight [-12.00/-3.00 | -2.00/0.00]   | 840.54      | 1               |
| 3fb227e0-8ba1-4be5-8414-4bb722e69692 | VISAO SIMPLES DIGITAL 1.49 BLUE AR        | Polylux         | POLYLUX     | visao_simples | CR39     | 1.50            | 0.00        | b16d7869-ad98-44fe-a4ae-d77e7158b9b2 | Lente CR39 1.50 Visao Simples +AR +UV +BlueLight [-6.00/6.00 | -4.00/0.00]     | 918.76      | 1               |
| 03033eb5-a996-4251-99c7-5e61e412315c | 1.70 RESINA AR BLUE 1                     | Polylux         | POLYLUX     | visao_simples | CR39     | 1.50            | 0.00        | 562926dc-7fab-4108-b4fc-37a7e283f1b2 | Lente CR39 1.50 Visao Simples +AR +UV +BlueLight [-18.00/-12.50 | -2.00/0.00]  | 957.87      | 1               |
| 56aa9b6d-11bb-41a0-b8af-260b81514c4a | LENTE AC.1.50 TRANSITIONS GEN8 COM AR     | Brascor         | TRANSITIONS | visao_simples | CR39     | 1.50            | 0.00        | 520981ba-b797-4934-920e-7d7630c835c7 | Lente CR39 1.50 Visao Simples +UV +fotocromático [2.25/4.00 | -2.25/-4.00]     | 977.42      | 1               |
| d8271ad0-32ca-4e3e-b75b-cdf1240908ee | LENTE AC.1.50 TRANSITIONS GEN8 COM AR     | Brascor         | TRANSITIONS | visao_simples | CR39     | 1.50            | 0.00        | 6604b87e-a01f-47d0-bb99-04cfb6a16736 | Lente CR39 1.50 Visao Simples +AR +UV +fotocromático [-2.00/2.00 | 0.00/-2.00] | 977.42      | 1               |
| 3b6c5f6e-59f0-488a-ac12-1a662ef6a5d0 | 1.70 RESINA AR BLUE 2                     | Polylux         | POLYLUX     | visao_simples | CR39     | 1.50            | 0.00        | 4cea2f19-b389-4e7a-b586-32bd71bdb8f9 | Lente CR39 1.50 Visao Simples +AR +UV +BlueLight [-24.00/-18.25 | -2.00/0.00]  | 1036.08     | 1               |
| 13e50463-bba2-4163-b242-2d2a1bd067fe | LT CR 1.49 INCOLOR (TINTAVEL)             | Express         | EXPRESS     | visao_simples | CR39     | 1.50            | 0.00        | 30d581c1-4b46-41a8-b4a5-6653c862ec7a | Lente CR39 1.50 Visao Simples +UV [-6.00/6.00 | 0.00/-2.00]                    | 250.00      | 1               |


-- ============================================================================
-- TESTE 4: Busca por Grupo Específico (caso de uso real)
-- ============================================================================
-- Encontrar todas as lentes de um grupo específico

-- Primeiro, pegar um grupo aleatório:
SELECT 
  id,
  slug,
  nome_grupo,
  tipo_lente,
  material,
  indice_refracao,
  preco_medio,
  total_lentes
FROM v_grupos_canonicos
WHERE tipo_lente = 'visao_simples'
  AND material = 'CR39'
  AND indice_refracao = '1.50'
LIMIT 1;


| id                                   | slug                                                                    | nome_grupo                                                  | tipo_lente    | material | indice_refracao | preco_medio | total_lentes |
| ------------------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------- | ------------- | -------- | --------------- | ----------- | ------------ |
| 30d581c1-4b46-41a8-b4a5-6653c862ec7a | lente-39-150-visao-simples-uv-esf-n6-00-6-00-cil-0-00-n2-00-add-000-000 | Lente CR39 1.50 Visao Simples +UV [-6.00/6.00 | 0.00/-2.00] | visao_simples | CR39     | 1.50            | 250.00      | 1            |


-- Depois, buscar as lentes desse grupo:
-- (substituir o UUID pelo resultado acima)
/*
SELECT 
  l.id,
  l.nome_lente,
  l.fornecedor_nome,
  l.marca_nome,
  l.preco_venda_sugerido,
  l.prazo_dias,
  l.tem_ar,
  l.tem_blue
FROM v_lentes l
WHERE l.grupo_canonico_id = '30d581c1-4b46-41a8-b4a5-6653c862ec7a'
ORDER BY l.preco_venda_sugerido;
*/

| id                                   | nome_lente                      | fornecedor_nome | marca_nome | preco_venda_sugerido | prazo_dias | tem_ar | tem_blue |
| ------------------------------------ | ------------------------------- | --------------- | ---------- | -------------------- | ---------- | ------ | -------- |
| 13e50463-bba2-4163-b242-2d2a1bd067fe | LT CR 1.49 INCOLOR (TINTAVEL)   | Express         | EXPRESS    | 0.00                 | 7          | false  | false    |

-- ============================================================================
-- TESTE 5: Busca Reversa (encontrar grupo de uma lente específica)
-- ============================================================================
-- Pegar uma lente e encontrar seu grupo com todas as alternativas

WITH lente_selecionada AS (
  SELECT * FROM v_lentes
  WHERE tipo_lente = 'visao_simples'
    AND material = 'CR39'
    AND indice_refracao = '1.50'
  LIMIT 1
)
SELECT 
  ls.nome_lente AS lente_escolhida,
  ls.fornecedor_nome AS fornecedor_escolhido,
  ls.preco_venda_sugerido AS preco_escolhido,
  gc.nome_grupo AS grupo_pertencente,
  gc.total_lentes AS total_alternativas,
  gc.preco_minimo AS preco_min_grupo,
  gc.preco_medio AS preco_medio_grupo,
  gc.preco_maximo AS preco_max_grupo
FROM lente_selecionada ls
JOIN v_grupos_canonicos gc ON gc.id = ls.grupo_canonico_id;


| lente_escolhida     | fornecedor_escolhido | preco_escolhido | grupo_pertencente                                                            | total_alternativas | preco_min_grupo | preco_medio_grupo | preco_max_grupo |
| ------------------- | -------------------- | --------------- | ---------------------------------------------------------------------------- | ------------------ | --------------- | ----------------- | --------------- |
| 1.70 RESINA AR BLUE | Polylux              | 0.00            | Lente CR39 1.50 Visao Simples +AR +UV +BlueLight [-12.00/-3.00 | -2.00/0.00] | 1                  | 840.54          | 840.54            | 840.54          |

-- ============================================================================
-- TESTE 6: Validar Consistência (total_lentes do grupo = COUNT real)
-- ============================================================================
-- Verificar se o campo total_lentes está correto

SELECT 
  gc.id,
  gc.nome_grupo,
  gc.total_lentes AS total_registrado,
  COUNT(l.id) AS total_real,
  CASE 
    WHEN gc.total_lentes = COUNT(l.id) THEN '✅ Consistente'
    ELSE '❌ Inconsistente'
  END AS status
FROM v_grupos_canonicos gc
LEFT JOIN v_lentes l ON l.grupo_canonico_id = gc.id
GROUP BY gc.id, gc.nome_grupo, gc.total_lentes
HAVING gc.total_lentes != COUNT(l.id)
LIMIT 20;


Success. No rows returned




-- ============================================================================
-- TESTE 7: Caso de Uso Completo - Wizard de Orçamento
-- ============================================================================
-- Simular busca no wizard: cliente precisa de lente visão simples

-- 1. Listar grupos disponíveis por faixa de preço
SELECT 
  gc.id,
  gc.nome_grupo,
  gc.tipo_lente,
  gc.material,
  gc.indice_refracao,
  gc.preco_medio,
  gc.categoria_preco,
  gc.total_lentes AS opcoes_disponiveis,
  gc.total_fornecedores,
  gc.prazo_medio_dias
FROM v_grupos_canonicos gc
WHERE gc.tipo_lente = 'visao_simples'
  AND gc.preco_medio BETWEEN 200 AND 500
ORDER BY gc.preco_medio
LIMIT 10;

| id                                   | nome_grupo                                                             | tipo_lente    | material      | indice_refracao | preco_medio | categoria_preco | opcoes_disponiveis | total_fornecedores | prazo_medio_dias |
| ------------------------------------ | ---------------------------------------------------------------------- | ------------- | ------------- | --------------- | ----------- | --------------- | ------------------ | ------------------ | ---------------- |
| 30d581c1-4b46-41a8-b4a5-6653c862ec7a | Lente CR39 1.50 Visao Simples +UV [-6.00/6.00 | 0.00/-2.00]            | visao_simples | CR39          | 1.50            | 250.00      | Básico          | 1                  | 1                  | 3                |
| 573729aa-91b7-4f74-b2dc-00e5bcd9ea34 | Lente POLICARBONATO 1.59 Visao Simples +UV [-10.00/6.00 | 0.00/-2.00]  | visao_simples | POLICARBONATO | 1.59            | 250.00      | Básico          | 1                  | 1                  | 3                |
| 62d675b2-e9b2-47d3-b98f-9ff53b26eca7 | Lente CR39 1.56 Visao Simples +AR +UV [-8.00/6.00 | 0.00/-2.00]        | visao_simples | CR39          | 1.56            | 253.91      | Básico          | 1                  | 1                  | 3                |
| 928ddd31-a900-4340-8d3f-094e68538524 | Lente CR39 1.50 Visao Simples +UV [-6.00/6.00 | -2.00/2.00]            | visao_simples | CR39          | 1.50            | 255.87      | Básico          | 1                  | 1                  | 7                |
| 14a2d496-3947-4b9e-9ff2-aff781d7cee3 | Lente CR39 1.56 Visao Simples +AR +UV [-8.00/6.00 | -2.00/0.00]        | visao_simples | CR39          | 1.56            | 261.73      | Básico          | 1                  | 1                  | 7                |
| 7ae84a5b-46b9-488b-a0fb-5c35bdcdc9f7 | Lente CR39 1.56 Visao Simples +UV +BlueLight [-6.00/6.00 | 0.00/-2.00] | visao_simples | CR39          | 1.56            | 265.64      | Básico          | 2                  | 1                  | 3                |
| 4c50219d-9140-4a59-b30b-c0adadd43051 | Lente CR39 1.56 Visao Simples +UV [-6.00/6.00 | -2.00/0.00]            | visao_simples | CR39          | 1.56            | 265.64      | Básico          | 1                  | 1                  | 7                |
| 636a8f30-bebb-4553-ac8b-505b4d897ecb | Lente CR39 1.50 Visao Simples +AR +UV [-4.00/4.00 | 0.00/-2.00]        | visao_simples | CR39          | 1.50            | 267.60      | Básico          | 1                  | 1                  | 7                |
| 3ee458a1-b0da-4b18-b55f-5160eb57f8ee | Lente POLICARBONATO 1.59 Visao Simples +UV [-6.00/6.00 | -2.25/-4.00]  | visao_simples | POLICARBONATO | 1.59            | 273.47      | Básico          | 1                  | 1                  | 3                |
| a47e13a0-4e6a-4153-bf54-78e534e58e6b | Lente CR39 1.56 Visao Simples +AR +UV [-6.00/6.00 | -2.25/-4.00]       | visao_simples | CR39          | 1.56            | 273.47      | Básico          | 2                  | 1                  | 7                |



-- 2. Cliente escolheu um grupo, mostrar lentes disponíveis
-- (usar ID do grupo selecionado acima)
/*
SELECT 
  l.id,
  l.nome_lente,
  l.fornecedor_nome,
  l.marca_nome,
  l.preco_venda_sugerido,
  l.prazo_dias,
  l.tem_ar,
  l.tem_blue,
  l.tem_uv,
  CASE 
    WHEN l.prazo_dias <= 3 THEN '⚡ Express'
    WHEN l.prazo_dias <= 7 THEN '📦 Normal'
    ELSE '🐌 Econômico'
  END AS badge_entrega
FROM v_lentes l
WHERE l.grupo_canonico_id = '3ee458a1-b0da-4b18-b55f-5160eb57f8ee'
ORDER BY l.preco_venda_sugerido, l.prazo_dias
LIMIT 20;
*/
| id                                   | nome_lente                                | fornecedor_nome | marca_nome | preco_venda_sugerido | prazo_dias | tem_ar | tem_blue | tem_uv | badge_entrega |
| ------------------------------------ | ----------------------------------------- | --------------- | ---------- | -------------------- | ---------- | ------ | -------- | ------ | ------------- |
| 8f5168f4-1ea3-415c-b0cd-55a9e8fea6f0 | LT 1.59 POLICARBONATO INCOLOR CIL. EXT.   | Express         | EXPRESS    | 0.00                 | 7          | false  | false    | false  | 📦 Normal     |


-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- ✅ TESTE 1: Deve mostrar ~100% de cobertura (todas lentes com grupo)
-- ✅ TESTE 2: total_lentes = lentes_na_view (consistência)
-- ✅ TESTE 3: Todas lentes devem ter grupo_nome preenchido
-- ✅ TESTE 4: Deve retornar múltiplas lentes do mesmo grupo
-- ✅ TESTE 5: Deve encontrar grupo da lente selecionada
-- ✅ TESTE 6: Nenhuma inconsistência (lista vazia)
-- ✅ TESTE 7: Workflow completo funcionando
-- ============================================================================
