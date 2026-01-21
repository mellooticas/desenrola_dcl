-- ============================================================================
-- LIMPEZA: Schema PUBLIC após reestruturação do SIS_LENS
-- ============================================================================
-- Objetivo: Remover/corrigir apenas o que está quebrado
-- Data: 20/01/2026
-- ============================================================================

-- ============================================================================
-- DIAGNÓSTICO EXECUTADO
-- ============================================================================
-- ✅ 16 VIEWS: Todas funcionando perfeitamente
-- ⚠️ 1 FUNCTION QUEBRADA: buscar_lentes (referência a compras.estoque_saldo)
-- ✅ 3 FUNCTIONS OK: buscar_lentes_por_receita, obter_alternativas_lente
-- ✅ 4 FUNCTIONS DO POSTGRES: unaccent* (extension)
--
-- CONCLUSÃO: Apenas 1 item precisa ser corrigido
-- ============================================================================

-- ============================================================================
-- OPÇÃO 1: REMOVER A FUNCTION QUEBRADA (RECOMENDADO)
-- ============================================================================
-- Se a function buscar_lentes não está sendo usada no frontend,
-- é mais seguro removê-la

DROP FUNCTION IF EXISTS public.buscar_lentes(
  lens_catalog.tipo_lente,
  lens_catalog.material_lente,
  lens_catalog.indice_refracao,
  numeric,
  numeric,
  boolean,
  boolean,
  uuid,
  uuid,
  integer,
  integer
) CASCADE;

-- ============================================================================
-- OPÇÃO 2: CORRIGIR A FUNCTION (se estiver em uso)
-- ============================================================================
-- Se a function estiver sendo usada no código, descomentar abaixo:
/*
CREATE OR REPLACE FUNCTION public.buscar_lentes(
    p_tipo_lente lens_catalog.tipo_lente DEFAULT NULL,
    p_material lens_catalog.material_lente DEFAULT NULL,
    p_indice lens_catalog.indice_refracao DEFAULT NULL,
    p_preco_min numeric DEFAULT NULL,
    p_preco_max numeric DEFAULT NULL,
    p_tem_ar boolean DEFAULT NULL,
    p_tem_blue boolean DEFAULT NULL,
    p_fornecedor_id uuid DEFAULT NULL,
    p_marca_id uuid DEFAULT NULL,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
)
RETURNS TABLE(
    id uuid,
    slug text,
    nome text,
    fornecedor text,
    marca text,
    tipo_lente lens_catalog.tipo_lente,
    material lens_catalog.material_lente,
    indice_refracao lens_catalog.indice_refracao,
    preco numeric,
    categoria lens_catalog.categoria_lente,
    tem_ar boolean,
    tem_blue boolean,
    grupo_nome text,
    estoque_disponivel integer
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.slug::TEXT,
        l.nome_canonizado::TEXT,
        f.nome::TEXT as fornecedor,
        m.nome::TEXT as marca,
        l.tipo_lente,
        l.material,
        l.indice_refracao,
        l.preco_venda_sugerido,
        l.categoria,
        l.tratamento_antirreflexo,
        l.tratamento_blue_light,
        gc.nome_grupo::TEXT,
        0::INTEGER as estoque_disponivel -- CORRIGIDO: removida referência a compras.estoque_saldo
    FROM lens_catalog.lentes l
    JOIN core.fornecedores f ON l.fornecedor_id = f.id
    LEFT JOIN lens_catalog.marcas m ON l.marca_id = m.id
    LEFT JOIN lens_catalog.grupos_canonicos gc ON l.grupo_canonico_id = gc.id
    -- REMOVIDO: LEFT JOIN compras.estoque_saldo es ON l.id = es.lente_id
    WHERE l.ativo = true
    AND l.status = 'ativo'
    AND (p_tipo_lente IS NULL OR l.tipo_lente = p_tipo_lente)
    AND (p_material IS NULL OR l.material = p_material)
    AND (p_indice IS NULL OR l.indice_refracao = p_indice)
    AND (p_preco_min IS NULL OR l.preco_venda_sugerido >= p_preco_min)
    AND (p_preco_max IS NULL OR l.preco_venda_sugerido <= p_preco_max)
    AND (p_tem_ar IS NULL OR l.tratamento_antirreflexo = p_tem_ar)
    AND (p_tem_blue IS NULL OR l.tratamento_blue_light = p_tem_blue)
    AND (p_fornecedor_id IS NULL OR l.fornecedor_id = p_fornecedor_id)
    AND (p_marca_id IS NULL OR l.marca_id = p_marca_id)
    ORDER BY l.peso DESC, l.preco_venda_sugerido ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Comentário sobre a correção:
-- Como o schema compras.estoque_saldo não existe mais, substituímos por 0::INTEGER
-- Se precisar de controle de estoque no futuro, criar nova tabela no schema adequado
*/

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
-- Teste a function após escolher uma das opções acima:
-- 

| id                                   | slug                                              | nome | fornecedor | marca   | tipo_lente    | material      | indice_refracao | preco  | categoria | tem_ar | tem_blue | grupo_nome                                                            | estoque_disponivel |
| ------------------------------------ | ------------------------------------------------- | ---- | ---------- | ------- | ------------- | ------------- | --------------- | ------ | --------- | ------ | -------- | --------------------------------------------------------------------- | ------------------ |
| 13e50463-bba2-4163-b242-2d2a1bd067fe | -1-49-13e50463-bba2-4163-b242-2d2a1bd067fe        | null | Express    | EXPRESS | visao_simples | CR39          | 1.50            | 250.00 | economica | false  | false    | Lente CR39 1.50 Visao Simples +UV [-6.00/6.00 | 0.00/-2.00]           | 0                  |
| 58edb8fb-4283-4d84-b7e8-663a3c8a5cc1 | -1-59-58edb8fb-4283-4d84-b7e8-663a3c8a5cc1        | null | Express    | EXPRESS | visao_simples | POLICARBONATO | 1.59            | 250.00 | economica | false  | false    | Lente POLICARBONATO 1.59 Visao Simples +UV [-10.00/6.00 | 0.00/-2.00] | 0                  |
| 59828728-37d1-4c3b-9780-a2fce84a0b34 | -1-56-59828728-37d1-4c3b-9780-a2fce84a0b34        | null | Express    | EXPRESS | visao_simples | CR39          | 1.56            | 253.91 | economica | true   | false    | Lente CR39 1.56 Visao Simples +AR +UV [-8.00/6.00 | 0.00/-2.00]       | 0                  |
| 3d656633-f8cc-4e48-af26-d2a9f1408f8c | -1-49-ncolor-3d656633-f8cc-4e48-af26-d2a9f1408f8c | null | Sygma      | SYGMA   | visao_simples | CR39          | 1.50            | 255.87 | economica | false  | false    | Lente CR39 1.50 Visao Simples +UV [-6.00/6.00 | -2.00/2.00]           | 0                  |
| 82cee871-8c04-4841-b3b9-7ca6d1d1286a | -1-56-82cee871-8c04-4841-b3b9-7ca6d1d1286a        | null | Polylux    | POLYLUX | visao_simples | CR39          | 1.56            | 261.73 | economica | true   | false    | Lente CR39 1.56 Visao Simples +AR +UV [-8.00/6.00 | -2.00/0.00]       | 0                  |



-- ============================================================================
-- INSTRUÇÕES DE USO
-- ============================================================================
-- 1. Se a function NÃO está em uso: Execute apenas a OPÇÃO 1 (DROP)
-- 2. Se a function ESTÁ em uso: Comente OPÇÃO 1 e descomente OPÇÃO 2 (CREATE)
-- 3. Verifique no código se há referências: grep -r "buscar_lentes" src/
-- ============================================================================

-- ============================================================================
-- CONCLUSÃO
-- ============================================================================
-- ✅ Todas as 16 views estão saudáveis e funcionando
-- ✅ buscar_lentes_por_receita está OK
-- ✅ obter_alternativas_lente está OK
-- ⚠️ buscar_lentes precisa de ação (DROP ou FIX)
-- 
-- RECOMENDAÇÃO: Executar OPÇÃO 1 (DROP) se não houver uso no frontend
-- ============================================================================
