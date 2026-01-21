-- ============================================================================
-- TRIGGERS: Atualização Automática de Grupos Canônicos
-- ============================================================================
-- Objetivo: Manter grupos canônicos sincronizados ao inserir/atualizar/deletar lentes
-- Data: 20/01/2026
-- ============================================================================

-- ============================================================================
-- ESTRATÉGIA
-- ============================================================================
-- 1. Quando INSERIR lente → Criar grupo canônico se não existir + atualizar estatísticas
-- 2. Quando ATUALIZAR lente → Recalcular estatísticas dos grupos afetados
-- 3. Quando DELETAR lente → Recalcular estatísticas ou remover grupo vazio
-- 4. Trigger executado AFTER para garantir que dados já estão no banco
-- ============================================================================

-- ============================================================================
-- FUNÇÃO 1: Atualizar Estatísticas de um Grupo Canônico
-- ============================================================================
CREATE OR REPLACE FUNCTION lens_catalog.atualizar_estatisticas_grupo_canonico(p_grupo_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE lens_catalog.grupos_canonicos
  SET
    -- Recalcular preços
    preco_minimo = (SELECT MIN(preco_venda_sugerido) FROM lens_catalog.lentes WHERE grupo_canonico_id = p_grupo_id AND ativo = true),
    preco_maximo = (SELECT MAX(preco_venda_sugerido) FROM lens_catalog.lentes WHERE grupo_canonico_id = p_grupo_id AND ativo = true),
    preco_medio = (SELECT ROUND(AVG(preco_venda_sugerido)::NUMERIC, 2) FROM lens_catalog.lentes WHERE grupo_canonico_id = p_grupo_id AND ativo = true),
    
    -- Recalcular totais
    total_lentes = (SELECT COUNT(*) FROM lens_catalog.lentes WHERE grupo_canonico_id = p_grupo_id AND ativo = true),
    total_marcas = (SELECT COUNT(DISTINCT marca_id) FROM lens_catalog.lentes WHERE grupo_canonico_id = p_grupo_id AND ativo = true),
    
    -- Atualizar timestamp
    updated_at = NOW()
  WHERE id = p_grupo_id;
  
  -- Se grupo ficou sem lentes, desativar
  UPDATE lens_catalog.grupos_canonicos
  SET ativo = false, updated_at = NOW()
  WHERE id = p_grupo_id 
    AND total_lentes = 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNÇÃO 2: Encontrar ou Criar Grupo Canônico
-- ============================================================================
CREATE OR REPLACE FUNCTION lens_catalog.encontrar_ou_criar_grupo_canonico(
  p_tipo_lente lens_catalog.tipo_lente,
  p_material lens_catalog.material_lente,
  p_indice lens_catalog.indice_refracao,
  p_categoria lens_catalog.categoria_lente,
  p_esferico_min NUMERIC,
  p_esferico_max NUMERIC,
  p_cilindrico_min NUMERIC,
  p_cilindrico_max NUMERIC,
  p_adicao_min NUMERIC,
  p_adicao_max NUMERIC,
  p_tem_ar BOOLEAN,
  p_tem_antirrisco BOOLEAN,
  p_tem_uv BOOLEAN,
  p_tem_blue BOOLEAN,
  p_tratamento_foto lens_catalog.tratamento_foto
)
RETURNS UUID AS $$
DECLARE
  v_grupo_id UUID;
  v_nome_grupo TEXT;
  v_slug TEXT;
BEGIN
  -- Buscar grupo existente com mesmas características
  SELECT id INTO v_grupo_id
  FROM lens_catalog.grupos_canonicos
  WHERE tipo_lente = p_tipo_lente
    AND material = p_material
    AND indice_refracao = p_indice
    AND categoria_predominante = p_categoria
    AND grau_esferico_min = p_esferico_min
    AND grau_esferico_max = p_esferico_max
    AND grau_cilindrico_min = p_cilindrico_min
    AND grau_cilindrico_max = p_cilindrico_max
    AND COALESCE(adicao_min, 0) = COALESCE(p_adicao_min, 0)
    AND COALESCE(adicao_max, 0) = COALESCE(p_adicao_max, 0)
    AND tratamento_antirreflexo = p_tem_ar
    AND tratamento_antirrisco = p_tem_antirrisco
    AND tratamento_uv = p_tem_uv
    AND tratamento_blue_light = p_tem_blue
    AND COALESCE(tratamento_fotossensiveis, 'nenhum') = COALESCE(p_tratamento_foto, 'nenhum')
  LIMIT 1;
  
  -- Se não encontrou, criar novo grupo
  IF v_grupo_id IS NULL THEN
    -- Gerar nome descritivo
    v_nome_grupo := 'Lente ' || p_material || ' ' || p_indice || ' ' || 
                    REPLACE(INITCAP(p_tipo_lente::TEXT), '_', ' ');
    
    IF p_tem_ar THEN v_nome_grupo := v_nome_grupo || ' +AR'; END IF;
    IF p_tem_uv THEN v_nome_grupo := v_nome_grupo || ' +UV'; END IF;
    IF p_tem_blue THEN v_nome_grupo := v_nome_grupo || ' +BlueLight'; END IF;
    IF p_tratamento_foto IS NOT NULL AND p_tratamento_foto != 'nenhum' THEN 
      v_nome_grupo := v_nome_grupo || ' +' || INITCAP(p_tratamento_foto::TEXT);
    END IF;
    
    v_nome_grupo := v_nome_grupo || ' [' || 
                    p_esferico_min || '/' || p_esferico_max || ' | ' ||
                    p_cilindrico_min || '/' || p_cilindrico_max || ']';
    
    -- Gerar slug
    v_slug := LOWER(REGEXP_REPLACE(v_nome_grupo, '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := TRIM(BOTH '-' FROM v_slug);
    
    -- Inserir novo grupo
    INSERT INTO lens_catalog.grupos_canonicos (
      slug, nome_grupo, tipo_lente, material, indice_refracao,
      categoria_predominante, grau_esferico_min, grau_esferico_max,
      grau_cilindrico_min, grau_cilindrico_max, adicao_min, adicao_max,
      tratamento_antirreflexo, tratamento_antirrisco, tratamento_uv,
      tratamento_blue_light, tratamento_fotossensiveis,
      preco_minimo, preco_maximo, preco_medio, total_lentes, total_marcas,
      peso, is_premium, ativo
    ) VALUES (
      v_slug, v_nome_grupo, p_tipo_lente, p_material, p_indice,
      p_categoria, p_esferico_min, p_esferico_max,
      p_cilindrico_min, p_cilindrico_max, p_adicao_min, p_adicao_max,
      p_tem_ar, p_tem_antirrisco, p_tem_uv, p_tem_blue, p_tratamento_foto,
      0, 0, 0, 0, 0, -- estatísticas iniciais
      50, false, true -- peso padrão, não premium, ativo
    )
    RETURNING id INTO v_grupo_id;
    
    RAISE NOTICE 'Novo grupo canônico criado: % (ID: %)', v_nome_grupo, v_grupo_id;
  END IF;
  
  RETURN v_grupo_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER FUNCTION: Após inserir/atualizar lente
-- ============================================================================
CREATE OR REPLACE FUNCTION lens_catalog.trigger_atualizar_grupo_canonico()
RETURNS TRIGGER AS $$
DECLARE
  v_grupo_id UUID;
  v_grupo_antigo_id UUID;
BEGIN
  -- Se está inserindo ou grupo mudou na atualização
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.grupo_canonico_id != NEW.grupo_canonico_id) THEN
    
    -- Guardar grupo antigo para atualizar depois (no UPDATE)
    IF TG_OP = 'UPDATE' THEN
      v_grupo_antigo_id := OLD.grupo_canonico_id;
    END IF;
    
    -- Se grupo_canonico_id está NULL, encontrar ou criar
    IF NEW.grupo_canonico_id IS NULL THEN
      v_grupo_id := lens_catalog.encontrar_ou_criar_grupo_canonico(
        NEW.tipo_lente,
        NEW.material,
        NEW.indice_refracao,
        NEW.categoria,
        NEW.esferico_min,
        NEW.esferico_max,
        NEW.cilindrico_min,
        NEW.cilindrico_max,
        NEW.adicao_min,
        NEW.adicao_max,
        COALESCE(NEW.ar, false),
        COALESCE(NEW.antirrisco, false),
        COALESCE(NEW.uv400, false),
        COALESCE(NEW.blue, false),
        COALESCE(NEW.fotossensivel, 'nenhum')
      );
      
      -- Atualizar lente com o grupo encontrado/criado
      NEW.grupo_canonico_id := v_grupo_id;
    ELSE
      v_grupo_id := NEW.grupo_canonico_id;
    END IF;
    
    -- Atualizar estatísticas do novo grupo
    PERFORM lens_catalog.atualizar_estatisticas_grupo_canonico(v_grupo_id);
    
    -- Se foi UPDATE e mudou de grupo, atualizar estatísticas do grupo antigo
    IF TG_OP = 'UPDATE' AND v_grupo_antigo_id IS NOT NULL AND v_grupo_antigo_id != v_grupo_id THEN
      PERFORM lens_catalog.atualizar_estatisticas_grupo_canonico(v_grupo_antigo_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER FUNCTION: Após deletar lente
-- ============================================================================
CREATE OR REPLACE FUNCTION lens_catalog.trigger_deletar_lente_atualizar_grupo()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar estatísticas do grupo que perdeu a lente
  IF OLD.grupo_canonico_id IS NOT NULL THEN
    PERFORM lens_catalog.atualizar_estatisticas_grupo_canonico(OLD.grupo_canonico_id);
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CRIAR TRIGGERS NA TABELA LENTES
-- ============================================================================

-- Remover triggers antigos se existirem
DROP TRIGGER IF EXISTS trg_lente_insert_update ON lens_catalog.lentes;
DROP TRIGGER IF EXISTS trg_lente_delete ON lens_catalog.lentes;

-- Trigger para INSERT e UPDATE
CREATE TRIGGER trg_lente_insert_update
  AFTER INSERT OR UPDATE OF grupo_canonico_id, tipo_lente, material, 
                            indice_refracao, categoria, ar, antirrisco, 
                            uv400, blue, fotossensivel, ativo
  ON lens_catalog.lentes
  FOR EACH ROW
  EXECUTE FUNCTION lens_catalog.trigger_atualizar_grupo_canonico();

-- Trigger para DELETE
CREATE TRIGGER trg_lente_delete
  AFTER DELETE ON lens_catalog.lentes
  FOR EACH ROW
  EXECUTE FUNCTION lens_catalog.trigger_deletar_lente_atualizar_grupo();

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================
COMMENT ON FUNCTION lens_catalog.atualizar_estatisticas_grupo_canonico IS
'Recalcula preços (min/max/médio) e totais (lentes/marcas) de um grupo canônico.
Desativa grupo automaticamente se ficar sem lentes.';

COMMENT ON FUNCTION lens_catalog.encontrar_ou_criar_grupo_canonico IS
'Busca grupo canônico existente com características específicas.
Se não encontrar, cria novo grupo automaticamente com nome descritivo.';

COMMENT ON FUNCTION lens_catalog.trigger_atualizar_grupo_canonico IS
'Trigger executado após INSERT/UPDATE de lente.
Associa lente ao grupo correto e atualiza estatísticas.';

COMMENT ON FUNCTION lens_catalog.trigger_deletar_lente_atualizar_grupo IS
'Trigger executado após DELETE de lente.
Atualiza estatísticas do grupo que perdeu a lente.';

-- ============================================================================
-- TESTE DO SISTEMA
-- ============================================================================
-- Para testar, inserir uma lente nova e ver se grupo é criado/atualizado:
/*
INSERT INTO lens_catalog.lentes (
  fornecedor_id,
  tipo_lente,
  material,
  indice_refracao,
  categoria,
  nome_lente,
  esferico_min,
  esferico_max,
  cilindrico_min,
  cilindrico_max,
  ar,
  uv400,
  preco_tabela,
  ativo,
  status
) VALUES (
  (SELECT id FROM core.fornecedores WHERE nome = 'Express' LIMIT 1),
  'visao_simples',
  'CR39',
  '1.50',
  'economica',
  'Teste Lente Nova',
  -4.00,
  4.00,
  0.00,
  -2.00,
  true,
  true,
  299.90,
  true,
  'ativo'
);

-- Verificar se grupo foi criado/atualizado:
SELECT * FROM lens_catalog.grupos_canonicos 
WHERE nome_grupo LIKE '%Teste%' 
ORDER BY created_at DESC 
LIMIT 1;
*/

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- ✅ Ao inserir lente → Grupo criado automaticamente se não existir
-- ✅ Ao inserir lente → Estatísticas do grupo atualizadas (total_lentes, preços)
-- ✅ Ao atualizar lente → Estatísticas recalculadas
-- ✅ Ao deletar lente → Estatísticas recalculadas, grupo desativado se vazio
-- ✅ Sistema 100% automático, sem intervenção manual
-- ============================================================================
