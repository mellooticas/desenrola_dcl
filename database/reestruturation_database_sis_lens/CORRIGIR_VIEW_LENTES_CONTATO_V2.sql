-- ============================================================================
-- CORREÇÃO: View de Lentes de Contato para Schema Correto
-- ============================================================================
-- Data: 22/01/2026
-- Objetivo: Corrigir v_lentes_contato para usar contact_lens.lentes
-- Baseado na estrutura real de contact_lens.lentes (02_CRIAR_CONTACT_LENS.sql)
-- ============================================================================

-- ============================================================================
-- 1. REMOVER VIEW ANTIGA
-- ============================================================================

DROP VIEW IF EXISTS public.v_lentes_contato CASCADE;

-- ============================================================================
-- 2. CRIAR VIEW CORRETA USANDO contact_lens.lentes
-- ============================================================================

CREATE OR REPLACE VIEW public.v_lentes_contato AS
SELECT 
  -- IDs e Identificação
  l.id,
  l.slug,
  l.sku,
  l.codigo_fornecedor,
  l.nome_produto,
  l.nome_canonizado,
  
  -- ========================================
  -- MARCA (join com contact_lens.marcas)
  -- ========================================
  l.marca_id,
  m.nome AS marca_nome,
  m.slug AS marca_slug,
  m.is_premium AS marca_premium,
  m.pais_origem,
  
  -- ========================================
  -- FORNECEDOR (join com core.fornecedores)
  -- ========================================
  l.fornecedor_id,
  f.nome AS fornecedor_nome,
  f.razao_social AS fornecedor_razao_social,
  
  -- ========================================
  -- CLASSIFICAÇÃO
  -- ========================================
  l.tipo_lente::TEXT AS tipo_lente_contato,
  l.material::TEXT AS material_contato,
  l.finalidade::TEXT,
  
  -- ========================================
  -- ESPECIFICAÇÕES TÉCNICAS
  -- ========================================
  l.diametro AS diametro_mm,
  l.curva_base AS curvatura_base,
  l.dk_t,
  l.conteudo_agua AS teor_agua_percentual,
  l.espessura_central,
  
  -- ========================================
  -- PARÂMETROS ÓPTICOS - ESFÉRICO
  -- ========================================
  l.esferico_min,
  l.esferico_max,
  
  -- ========================================
  -- PARÂMETROS ÓPTICOS - CILÍNDRICO/TÓRICO
  -- ========================================
  l.cilindrico_min,
  l.cilindrico_max,
  l.eixo_min,
  l.eixo_max,
  
  -- ========================================
  -- PARÂMETROS ÓPTICOS - MULTIFOCAL
  -- ========================================
  l.adicao_min,
  l.adicao_max,
  
  -- ========================================
  -- CARACTERÍSTICAS ESPECIAIS
  -- ========================================
  l.protecao_uv AS tem_protecao_uv,
  l.colorida AS eh_colorida,
  l.cor_disponivel,
  l.resistente_depositos,
  l.hidratacao_prolongada,
  
  -- ========================================
  -- USO E MANUTENÇÃO
  -- ========================================
  l.dias_uso,
  l.horas_uso_diario,
  l.pode_dormir_com_lente,
  l.solucao_recomendada,
  
  -- ========================================
  -- EMBALAGEM E ESTOQUE
  -- ========================================
  l.unidades_por_caixa AS qtd_por_caixa,
  
  -- ========================================
  -- PREÇOS E CUSTOS
  -- ========================================
  l.preco_custo,
  l.preco_tabela,
  l.preco_fabricante,
  
  -- ========================================
  -- LOGÍSTICA
  -- ========================================
  l.lead_time_dias AS prazo_entrega_dias,
  l.estoque_disponivel,
  l.disponivel,
  
  -- ========================================
  -- MARKETING
  -- ========================================
  l.destaque,
  l.novidade,
  l.data_lancamento,
  l.data_descontinuacao,
  l.descricao_curta,
  l.descricao_completa,
  l.beneficios,
  l.indicacoes,
  l.contraindicacoes,
  
  -- ========================================
  -- STATUS E METADADOS
  -- ========================================
  l.ativo,
  l.status::TEXT AS status_produto,
  l.metadata,
  l.observacoes,
  
  -- ========================================
  -- DATAS
  -- ========================================
  l.created_at,
  l.updated_at,
  l.deleted_at
  
FROM contact_lens.lentes l
LEFT JOIN contact_lens.marcas m ON m.id = l.marca_id
LEFT JOIN core.fornecedores f ON f.id = l.fornecedor_id
WHERE l.ativo = true
ORDER BY m.nome, l.nome_produto;

-- ============================================================================
-- 3. PERMISSÕES
-- ============================================================================

GRANT SELECT ON public.v_lentes_contato TO anon, authenticated;

-- ============================================================================
-- 4. COMENTÁRIOS
-- ============================================================================

COMMENT ON VIEW public.v_lentes_contato IS 
'View consolidada de lentes de contato do schema contact_lens.lentes
- Baseada na estrutura de 02_CRIAR_CONTACT_LENS.sql
- Joins com contact_lens.marcas e core.fornecedores
- Dados completos para frontend
- Apenas lentes ativas';

-- ============================================================================
-- 5. VERIFICAÇÃO
-- ============================================================================

-- Contar total
SELECT COUNT(*) AS total_lentes_view
FROM public.v_lentes_contato;

-- Ver exemplo de dados
SELECT 
  marca_nome,
  nome_produto,
  tipo_lente_contato,
  material_contato,
  finalidade,
  diametro_mm,
  curvatura_base,
  esferico_min,
  esferico_max,
  qtd_por_caixa,
  preco_tabela
FROM public.v_lentes_contato
LIMIT 5;

-- ============================================================================
-- ✅ VIEW CORRIGIDA PARA USAR contact_lens.lentes COM ESTRUTURA CORRETA
-- ============================================================================
