-- 🔍 VER TODAS AS COLUNAS DA VIEW v_lentes_catalogo
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'v_lentes_catalogo'
ORDER BY ordinal_position;


| column_name               | data_type                |
| ------------------------- | ------------------------ |
| id                        | uuid                     |
| slug                      | text                     |
| nome_lente                | text                     |
| nome_canonizado           | text                     |
| fornecedor_id             | uuid                     |
| fornecedor_nome           | text                     |
| prazo_visao_simples       | integer                  |
| prazo_multifocal          | integer                  |
| prazo_surfacada           | integer                  |
| prazo_free_form           | integer                  |
| marca_id                  | uuid                     |
| marca_nome                | character varying        |
| marca_slug                | character varying        |
| marca_premium             | boolean                  |
| grupo_id                  | uuid                     |
| nome_grupo                | text                     |
| grupo_slug                | text                     |
| tipo_lente                | USER-DEFINED             |
| material                  | USER-DEFINED             |
| indice_refracao           | USER-DEFINED             |
| categoria                 | USER-DEFINED             |
| tratamento_antirreflexo   | boolean                  |
| tratamento_antirrisco     | boolean                  |
| tratamento_uv             | boolean                  |
| tratamento_blue_light     | boolean                  |
| tratamento_fotossensiveis | USER-DEFINED             |
| diametro_mm               | integer                  |
| curva_base                | numeric                  |
| espessura_centro_mm       | numeric                  |
| grau_esferico_min         | numeric                  |
| grau_esferico_max         | numeric                  |
| grau_cilindrico_min       | numeric                  |
| grau_cilindrico_max       | numeric                  |
| adicao_min                | numeric                  |
| adicao_max                | numeric                  |
| preco_custo               | numeric                  |
| preco_venda_sugerido      | numeric                  |
| margem_lucro              | numeric                  |
| estoque_disponivel        | integer                  |
| estoque_reservado         | integer                  |
| status                    | USER-DEFINED             |
| ativo                     | boolean                  |
| peso                      | integer                  |
| metadata                  | jsonb                    |
| created_at                | timestamp with time zone |
| updated_at                | timestamp with time zone |

