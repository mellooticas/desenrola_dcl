-- ============================================================================
-- LIMPEZA: Remover tabela antiga de lentes de contato
-- ============================================================================
-- Data: 22/01/2026
-- Objetivo: Apagar lens_catalog.lentes_contato (estrutura antiga/teste)
-- Motivo: A estrutura correta é contact_lens.lentes
-- ============================================================================

-- ============================================================================
-- 1. VERIFICAR CONTEÚDO ANTES DE APAGAR
-- ============================================================================

SELECT COUNT(*) AS total_registros_antigos
FROM lens_catalog.lentes_contato;

-- Mostrar registros que serão perdidos
SELECT 
  sku,
  nome_produto,
  marca_nome,
  tipo_lente_contato
FROM lens_catalog.lentes_contato;

-- ============================================================================
-- 2. APAGAR TABELA ANTIGA
-- ============================================================================

DROP TABLE IF EXISTS lens_catalog.lentes_contato CASCADE;

-- ============================================================================
-- 3. VERIFICAR ESTRUTURA CORRETA EXISTE
-- ============================================================================

-- Verificar que contact_lens.lentes existe
SELECT 
  schemaname,
  tablename
FROM pg_tables 
WHERE schemaname = 'contact_lens' 
  AND tablename = 'lentes';

  | schemaname   | tablename |
| ------------ | --------- |
| contact_lens | lentes    |

-- Verificar que a view aponta para a tabela correta
SELECT 
  viewname,
  definition
FROM pg_views 
WHERE viewname = 'v_lentes_contato'
  AND schemaname = 'public';


| viewname         | definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v_lentes_contato |  SELECT l.id,
    l.slug,
    l.sku,
    l.codigo_fornecedor,
    l.nome_produto,
    l.nome_canonizado,
    l.marca_id,
    m.nome AS marca_nome,
    m.slug AS marca_slug,
    m.is_premium AS marca_premium,
    m.pais_origem,
    l.fornecedor_id,
    f.nome AS fornecedor_nome,
    f.razao_social AS fornecedor_razao_social,
    (l.tipo_lente)::text AS tipo_lente_contato,
    (l.material)::text AS material_contato,
    (l.finalidade)::text AS finalidade,
    l.diametro AS diametro_mm,
    l.curva_base AS curvatura_base,
    l.dk_t,
    l.conteudo_agua AS teor_agua_percentual,
    l.espessura_central,
    l.esferico_min,
    l.esferico_max,
    l.cilindrico_min,
    l.cilindrico_max,
    l.eixo_min,
    l.eixo_max,
    l.adicao_min,
    l.adicao_max,
    l.protecao_uv AS tem_protecao_uv,
    l.colorida AS eh_colorida,
    l.cor_disponivel,
    l.resistente_depositos,
    l.hidratacao_prolongada,
    l.dias_uso,
    l.horas_uso_diario,
    l.pode_dormir_com_lente,
    l.solucao_recomendada,
    l.unidades_por_caixa AS qtd_por_caixa,
    l.preco_custo,
    l.preco_tabela,
    l.preco_fabricante,
    l.lead_time_dias AS prazo_entrega_dias,
    l.estoque_disponivel,
    l.disponivel,
    l.destaque,
    l.novidade,
    l.data_lancamento,
    l.data_descontinuacao,
    l.descricao_curta,
    l.descricao_completa,
    l.beneficios,
    l.indicacoes,
    l.contraindicacoes,
    l.ativo,
    (l.status)::text AS status_produto,
    l.metadata,
    l.observacoes,
    l.created_at,
    l.updated_at,
    l.deleted_at
   FROM ((contact_lens.lentes l
     LEFT JOIN contact_lens.marcas m ON ((m.id = l.marca_id)))
     LEFT JOIN core.fornecedores f ON ((f.id = l.fornecedor_id)))
  WHERE (l.ativo = true)
  ORDER BY m.nome, l.nome_produto; |
  
-- ============================================================================
-- ✅ TABELA ANTIGA REMOVIDA - USAR APENAS contact_lens.lentes
-- ============================================================================
