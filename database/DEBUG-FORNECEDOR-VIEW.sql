-- 🔍 VERIFICAR dados de fornecedor na view v_lentes_catalogo
-- Execute no SQL Editor do banco best_lens (ahcikwsoxhmqqteertkx)

SELECT 
    id,
    nome_lente,
    fornecedor_id,
    fornecedor_nome,
    marca_nome,
    preco_custo,
    preco_venda_sugerido
FROM v_lentes_catalogo
WHERE ativo = true
LIMIT 5;

-- Se fornecedor_nome estiver null, precisamos verificar a estrutura da view


| id                                   | nome_lente                      | fornecedor_id                        | fornecedor_nome | marca_nome | preco_custo | preco_venda_sugerido |
| ------------------------------------ | ------------------------------- | ------------------------------------ | --------------- | ---------- | ----------- | -------------------- |
| 13e50463-bba2-4163-b242-2d2a1bd067fe | LT CR 1.49 INCOLOR (TINTAVEL)   | 8eb9498c-3d99-4d26-bb8c-e503f97ccf2c | Express         | EXPRESS    | 9.00        | 250.00               |
| 58edb8fb-4283-4d84-b7e8-663a3c8a5cc1 | LT 1.59 POLICARBONATO INCOLOR   | 8eb9498c-3d99-4d26-bb8c-e503f97ccf2c | Express         | EXPRESS    | 9.00        | 250.00               |
| 59828728-37d1-4c3b-9780-a2fce84a0b34 | LT CR AR 1.56                   | 8eb9498c-3d99-4d26-bb8c-e503f97ccf2c | Express         | EXPRESS    | 10.00       | 253.91               |
| 3d656633-f8cc-4e48-af26-d2a9f1408f8c | LT CR 1.49 Incolor (TINTÁVEL)   | 199bae08-0217-4b70-b054-d3f0960b4a78 | Sygma           | SYGMA      | 10.50       | 255.87               |
| 82cee871-8c04-4841-b3b9-7ca6d1d1286a | CR 1.56 AR                      | 3a0a8ad3-4c55-44a2-b9fa-232a9f2fdc21 | Polylux         | POLYLUX    | 12.00       | 261.73               |
