SELECT * FROM v_lentes WHERE id = '561e46cc-1077-45e8-b8d5-3b4248647d47';



| id                                   | slug                                       | sku_fornecedor | codigo_original | nome_lente              | nome_canonizado | nome_comercial | fornecedor_id                        | fornecedor_nome | fornecedor_razao_social         | fornecedor_cnpj | marca_id                             | marca_nome | marca_slug | marca_premium | grupo_canonico_id                    | grupo_nome                                                      | grupo_slug                                                                 | tipo_lente    | categoria | material | indice_refracao | linha_produto | diametro | espessura_central | peso | grau_esferico_min | grau_esferico_max | grau_cilindrico_min | grau_cilindrico_max | adicao_min | adicao_max | dnp_min | dnp_max | tem_ar | tem_antirrisco | tem_blue | tem_uv | tratamento_foto | tem_polarizado | tem_hidrofobico | preco_custo | preco_venda_sugerido | preco_fabricante | prazo_dias | ativo | destaque | created_at                    | updated_at                    |
| ------------------------------------ | ------------------------------------------ | -------------- | --------------- | ----------------------- | --------------- | -------------- | ------------------------------------ | --------------- | ------------------------------- | --------------- | ------------------------------------ | ---------- | ---------- | ------------- | ------------------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------- | --------- | -------- | --------------- | ------------- | -------- | ----------------- | ---- | ----------------- | ----------------- | ------------------- | ------------------- | ---------- | ---------- | ------- | ------- | ------ | -------------- | -------- | ------ | --------------- | -------------- | --------------- | ----------- | -------------------- | ---------------- | ---------- | ----- | -------- | ----------------------------- | ----------------------------- |
| 561e46cc-1077-45e8-b8d5-3b4248647d47 | -1-56-561e46cc-1077-45e8-b8d5-3b4248647d47 | null           | null            | LENTE AC. COM AR 1.56   | null            | null           | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | Brascor         | Brascor Distribuidora de Lentes | null            | 98deae91-ee66-4c32-8a5d-8a6f83681993 | BRASCOR    | brascor    | false         | 1a4867c0-40a9-486f-b82a-f009e218ed4d | Lente CR39 1.56 Visao Simples +AR +UV [-8.00/4.00 | 0.00/-2.00] | lente-39-156-visao-simples-ar-uv-esf-n8-00-4-00-cil-0-00-n2-00-add-000-000 | visao_simples | economica | CR39     | 1.56            | null          | null     | null              | null | null              | null              | null                | null                | 0.00       | 0.00       | null    | null    | false  | false          | false    | false  | nenhum          | false          | false           | 12.80       | 264.86               | null             | 7          | true  | false    | 2025-12-19 22:33:33.249602+00 | 2025-12-20 03:16:11.631254+00 |



SELECT 
  id,
  nome_lente,
  tipo_lente,
  categoria,
  material,
  indice_refracao,
  preco_venda_sugerido,
  fornecedor_nome,
  marca_nome,
  grupo_canonico_id,
  grau_esferico_min,
  grau_esferico_max,
  grau_cilindrico_min,
  grau_cilindrico_max,
  adicao_min,
  adicao_max,
  dnp_min,
  dnp_max,
  tem_ar,
  tem_blue,
  tem_uv,
  tem_antirrisco,
  tratamento_hidrofobico,
  tratamento_antiembacante,
  tratamento_foto,
  tem_polarizado,
  tem_digital,
  tem_free_form,
  tem_indoor,
  tem_drive,
  preco_custo,
  prazo_dias
FROM v_lentes
WHERE id = '561e46cc-1077-45e8-b8d5-3b4248647d47';


