-- ============================================================================
-- VERIFICAÇÃO: TRIGGERS DE CANONIZAÇÃO AUTOMÁTICA
-- ============================================================================
-- Execute no Supabase para verificar se os triggers estão ativos
-- ============================================================================

-- ============================================================================
-- 1. VERIFICAR TRIGGERS EXISTENTES
-- ============================================================================

SELECT
  trigger_schema,
  trigger_name,
  event_object_table as tabela,
  event_manipulation as evento,
  action_statement as funcao
FROM information_schema.triggers
WHERE trigger_schema = 'lens_catalog'
ORDER BY event_object_table, trigger_name;

| trigger_schema | trigger_name                      | tabela           | evento | funcao                                                             |
| -------------- | --------------------------------- | ---------------- | ------ | ------------------------------------------------------------------ |
| lens_catalog   | trg_grupos_auditoria              | grupos_canonicos | DELETE | EXECUTE FUNCTION lens_catalog.fn_auditar_grupos()                  |
| lens_catalog   | trg_grupos_auditoria              | grupos_canonicos | INSERT | EXECUTE FUNCTION lens_catalog.fn_auditar_grupos()                  |
| lens_catalog   | trg_grupos_auditoria              | grupos_canonicos | UPDATE | EXECUTE FUNCTION lens_catalog.fn_auditar_grupos()                  |
| lens_catalog   | trg_grupos_updated_at             | grupos_canonicos | UPDATE | EXECUTE FUNCTION lens_catalog.update_grupos_timestamp()            |
| lens_catalog   | trg_lentes_associar_grupo         | lentes           | UPDATE | EXECUTE FUNCTION lens_catalog.fn_associar_lente_grupo_automatico() |
| lens_catalog   | trg_lentes_associar_grupo         | lentes           | INSERT | EXECUTE FUNCTION lens_catalog.fn_associar_lente_grupo_automatico() |
| lens_catalog   | trg_lentes_atualizar_estatisticas | lentes           | DELETE | EXECUTE FUNCTION lens_catalog.fn_atualizar_estatisticas_grupo()    |
| lens_catalog   | trg_lentes_atualizar_estatisticas | lentes           | INSERT | EXECUTE FUNCTION lens_catalog.fn_atualizar_estatisticas_grupo()    |
| lens_catalog   | trg_lentes_atualizar_estatisticas | lentes           | UPDATE | EXECUTE FUNCTION lens_catalog.fn_atualizar_estatisticas_grupo()    |
| lens_catalog   | trg_lentes_generate_slug          | lentes           | UPDATE | EXECUTE FUNCTION lens_catalog.generate_lente_slug()                |
| lens_catalog   | trg_lentes_generate_slug          | lentes           | INSERT | EXECUTE FUNCTION lens_catalog.generate_lente_slug()                |
| lens_catalog   | trg_lentes_updated_at             | lentes           | UPDATE | EXECUTE FUNCTION lens_catalog.update_lentes_timestamp()            |
| lens_catalog   | trg_marcas_updated_at             | marcas           | UPDATE | EXECUTE FUNCTION lens_catalog.update_marcas_timestamp()            |


-- ============================================================================
-- 2. VERIFICAR FUNÇÕES DE CANONIZAÇÃO
-- ============================================================================

SELECT
  n.nspname as schema,
  p.proname as funcao,
  pg_get_function_arguments(p.oid) as parametros,
  pg_get_function_result(p.oid) as retorno
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'lens_catalog'
  AND p.proname LIKE '%grupo%'
ORDER BY p.proname;

| schema       | funcao                              | parametros                                                                                                                                                                                                                                                                 | retorno                                                                                                                                                                    |
| ------------ | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lens_catalog | atualizar_estatisticas_grupo_manual | p_grupo_id uuid DEFAULT NULL::uuid                                                                                                                                                                                                                                         | TABLE(id uuid, nome_grupo text, total_lentes integer, total_marcas integer, preco_minimo numeric, preco_maximo numeric, preco_medio numeric)                               |
| lens_catalog | fn_associar_lente_grupo_automatico  |                                                                                                                                                                                                                                                                            | trigger                                                                                                                                                                    |
| lens_catalog | fn_atualizar_estatisticas_grupo     |                                                                                                                                                                                                                                                                            | trigger                                                                                                                                                                    |
| lens_catalog | fn_auditar_grupos                   |                                                                                                                                                                                                                                                                            | trigger                                                                                                                                                                    |
| lens_catalog | fn_criar_grupo_canonico_automatico  | p_tipo_lente text, p_material text, p_indice_refracao text, p_grau_esferico_min numeric, p_grau_esferico_max numeric, p_grau_cilindrico_min numeric, p_grau_cilindrico_max numeric, p_adicao_min numeric DEFAULT NULL::numeric, p_adicao_max numeric DEFAULT NULL::numeric | uuid                                                                                                                                                                       |
| lens_catalog | update_grupos_timestamp             |                                                                                                                                                                                                                                                                            | trigger                                                                                                                                                                    |
| lens_catalog | validar_integridade_grupos          |                                                                                                                                                                                                                                                                            | TABLE(grupo_id uuid, nome_grupo text, problema text, total_lentes_registrado integer, total_lentes_real integer, preco_medio_registrado numeric, preco_medio_real numeric) |


-- ============================================================================
-- 3. VER CÓDIGO DAS FUNÇÕES PRINCIPAIS
-- ============================================================================

-- Função de associar lente ao grupo automaticamente
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'fn_associar_lente_grupo_automatico';

| pg_get_functiondef                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CREATE OR REPLACE FUNCTION lens_catalog.fn_associar_lente_grupo_automatico()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_grupo_id UUID;
    v_grupos_encontrados INTEGER;
BEGIN
    -- Se grupo_canonico_id já foi informado manualmente, não sobrescreve
    IF NEW.grupo_canonico_id IS NOT NULL THEN
        RETURN NEW;
    END IF;
    
    -- Busca grupo canônico que corresponde exatamente aos ranges da lente
    SELECT id, COUNT(*) OVER () as total
    INTO v_grupo_id, v_grupos_encontrados
    FROM lens_catalog.grupos_canonicos
    WHERE tipo_lente = NEW.tipo_lente
      AND material = NEW.material
      AND indice_refracao = NEW.indice_refracao
      -- Ranges da lente devem estar DENTRO dos ranges do grupo
      AND NEW.grau_esferico_min >= grau_esferico_min
      AND NEW.grau_esferico_max <= grau_esferico_max
      AND NEW.grau_cilindrico_min >= grau_cilindrico_min
      AND NEW.grau_cilindrico_max <= grau_cilindrico_max
      -- Para multifocais, verifica adição
      AND (
          (NEW.tipo_lente != 'multifocal') OR
          (NEW.adicao_min >= COALESCE(adicao_min, NEW.adicao_min) AND 
           NEW.adicao_max <= COALESCE(adicao_max, NEW.adicao_max))
      )
    LIMIT 1;
    
    -- Se encontrou um grupo, associa
    IF v_grupo_id IS NOT NULL THEN
        NEW.grupo_canonico_id := v_grupo_id;
        
        RAISE NOTICE 'Lente "%" associada ao grupo: %', 
            NEW.nome_lente, 
            (SELECT nome_grupo FROM lens_catalog.grupos_canonicos WHERE id = v_grupo_id);
    ELSE
        -- Não encontrou grupo compatível - AVISO
        RAISE WARNING 'Lente "%" não possui grupo canônico compatível! Ranges: Esf [%/%] | Cil [%/%] | Add [%/%]',
            NEW.nome_lente,
            NEW.grau_esferico_min, NEW.grau_esferico_max,
            NEW.grau_cilindrico_min, NEW.grau_cilindrico_max,
            COALESCE(NEW.adicao_min, 0), COALESCE(NEW.adicao_max, 0);
    END IF;
    
    RETURN NEW;
END;
$function$
 |


-- Função de atualizar estatísticas do grupo
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'fn_atualizar_estatisticas_grupo';

| pg_get_functiondef                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE OR REPLACE FUNCTION lens_catalog.fn_atualizar_estatisticas_grupo()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_grupo_id UUID;
    v_grupo_id_old UUID;
    v_total_lentes INTEGER;
    v_total_marcas INTEGER;
    v_preco_min NUMERIC(10,2);
    v_preco_max NUMERIC(10,2);
    v_preco_medio NUMERIC(10,2);
BEGIN
    -- Determina qual(is) grupo(s) atualizar
    IF TG_OP = 'DELETE' THEN
        v_grupo_id := OLD.grupo_canonico_id;
    ELSIF TG_OP = 'UPDATE' THEN
        v_grupo_id := NEW.grupo_canonico_id;
        v_grupo_id_old := OLD.grupo_canonico_id;
        
        -- Se mudou de grupo, atualiza o grupo antigo também
        IF v_grupo_id_old IS NOT NULL AND v_grupo_id_old != v_grupo_id THEN
            PERFORM lens_catalog.atualizar_estatisticas_grupo_manual(v_grupo_id_old);
        END IF;
    ELSE -- INSERT
        v_grupo_id := NEW.grupo_canonico_id;
    END IF;
    
    -- Se não há grupo associado, não faz nada
    IF v_grupo_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Calcula estatísticas atualizadas
    SELECT 
        COUNT(*),
        COUNT(DISTINCT marca_id),
        MIN(preco_venda_sugerido),  -- ✅ CORRIGIDO: era preco_custo
        MAX(preco_venda_sugerido),  -- ✅ CORRIGIDO: era preco_custo
        AVG(preco_venda_sugerido)   -- ✅ CORRIGIDO: era preco_custo
    INTO 
        v_total_lentes,
        v_total_marcas,
        v_preco_min,
        v_preco_max,
        v_preco_medio
    FROM lens_catalog.lentes
    WHERE grupo_canonico_id = v_grupo_id
      AND ativo = true;
    
    -- Atualiza o grupo canônico
    UPDATE lens_catalog.grupos_canonicos
    SET 
        total_lentes = COALESCE(v_total_lentes, 0),
        total_marcas = COALESCE(v_total_marcas, 0),
        preco_minimo = v_preco_min,
        preco_maximo = v_preco_max,
        preco_medio = v_preco_medio,
        updated_at = NOW()
    WHERE id = v_grupo_id;
    
    -- Log da atualização
    RAISE DEBUG 'Estatísticas do grupo % atualizadas: % lentes, % marcas, preços R$ % - R$ %',
        v_grupo_id, v_total_lentes, v_total_marcas, v_preco_min, v_preco_max;
    
    RETURN COALESCE(NEW, OLD);
END;
$function$
 |


-- Função de criar grupo canônico automaticamente
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'fn_criar_grupo_canonico_automatico';


| pg_get_functiondef                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE OR REPLACE FUNCTION lens_catalog.fn_criar_grupo_canonico_automatico(p_tipo_lente text, p_material text, p_indice_refracao text, p_grau_esferico_min numeric, p_grau_esferico_max numeric, p_grau_cilindrico_min numeric, p_grau_cilindrico_max numeric, p_adicao_min numeric DEFAULT NULL::numeric, p_adicao_max numeric DEFAULT NULL::numeric)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_grupo_id UUID;
    v_nome_grupo TEXT;
    v_slug TEXT;
    v_descricao_ranges TEXT;
    v_is_premium BOOLEAN;
    v_tipo_label TEXT;
BEGIN
    -- Gera UUID
    v_grupo_id := gen_random_uuid();
    
    -- Determina label do tipo
    v_tipo_label := CASE p_tipo_lente
        WHEN 'visao_simples' THEN 'Visao Simples'
        WHEN 'multifocal' THEN 'Multifocal'
        WHEN 'bifocal' THEN 'Bifocal'
        ELSE 'Outro'
    END;
    
    -- Gera nome do grupo com ranges
    v_nome_grupo := 'Lente ' || p_material || ' ' || p_indice_refracao || ' ' || v_tipo_label || ' [' ||
        p_grau_esferico_min::TEXT || '/' || p_grau_esferico_max::TEXT || ' | ' ||
        p_grau_cilindrico_min::TEXT || '/' || p_grau_cilindrico_max::TEXT ||
        CASE 
            WHEN p_adicao_min IS NOT NULL 
            THEN ' | ' || p_adicao_min::TEXT || '/' || p_adicao_max::TEXT
            ELSE ''
        END || ']';
    
    -- Gera slug
    v_slug := lower(
        'lente-' || 
        replace(p_material::TEXT, ' ', '-') || '-' ||
        replace(p_indice_refracao::TEXT, '.', '') || '-' ||
        p_tipo_lente::TEXT || '-' ||
        'esf-' || replace(replace(p_grau_esferico_min::TEXT, '-', 'n'), '.', '') || 
        '-' || replace(replace(p_grau_esferico_max::TEXT, '-', 'n'), '.', '') || '-' ||
        'cil-' || replace(replace(p_grau_cilindrico_min::TEXT, '-', 'n'), '.', '') ||
        '-' || replace(replace(p_grau_cilindrico_max::TEXT, '-', 'n'), '.', '') ||
        CASE WHEN p_adicao_min IS NOT NULL 
            THEN '-add-' || replace(p_adicao_min::TEXT, '.', '') || 
                 '-' || replace(p_adicao_max::TEXT, '.', '')
            ELSE ''
        END
    );
    
    -- Descrição dos ranges
    v_descricao_ranges := 
        'Esférico: ' || p_grau_esferico_min || ' a ' || p_grau_esferico_max || ' | ' ||
        'Cilíndrico: ' || p_grau_cilindrico_min || ' a ' || p_grau_cilindrico_max ||
        CASE 
            WHEN p_adicao_min IS NOT NULL 
            THEN ' | Adição: ' || p_adicao_min || ' a ' || p_adicao_max
            ELSE ''
        END;
    
    -- Determina se é premium (CORRIGIDA - Veja 11_CORRIGIR_IS_PREMIUM.sql)
    v_is_premium := (
        -- Premium: Índice alto (1.67+)
        p_indice_refracao::TEXT::NUMERIC >= 1.67 OR 
        -- Premium: Multifocais com índice médio ou superior (1.56+)
        (p_tipo_lente = 'multifocal' AND p_indice_refracao::TEXT::NUMERIC >= 1.56)
    );
    
    -- Insere o novo grupo
    INSERT INTO lens_catalog.grupos_canonicos (
        id,
        nome_grupo,
        slug,
        tipo_lente,
        material,
        indice_refracao,
        grau_esferico_min,
        grau_esferico_max,
        grau_cilindrico_min,
        grau_cilindrico_max,
        adicao_min,
        adicao_max,
        descricao_ranges,
        is_premium,
        total_lentes,
        total_marcas,
        preco_minimo,
        preco_maximo,
        preco_medio
    ) VALUES (
        v_grupo_id,
        v_nome_grupo,
        v_slug,
        p_tipo_lente,
        p_material,
        p_indice_refracao,
        p_grau_esferico_min,
        p_grau_esferico_max,
        p_grau_cilindrico_min,
        p_grau_cilindrico_max,
        p_adicao_min,
        p_adicao_max,
        v_descricao_ranges,
        v_is_premium,
        0, -- total_lentes será atualizado pelo trigger
        0, -- total_marcas será atualizado pelo trigger
        NULL,
        NULL,
        NULL
    );
    
    RAISE NOTICE 'Novo grupo canônico criado: % (ID: %)', v_nome_grupo, v_grupo_id;
    
    RETURN v_grupo_id;
END;
$function$
 |


-- ============================================================================
-- 4. TESTAR INSERÇÃO DE LENTE (SIMULAÇÃO)
-- ============================================================================

-- NÃO EXECUTE ISSO AINDA - É APENAS EXEMPLO
/*
-- Exemplo de como inserir uma nova lente
-- O trigger deve associar automaticamente ao grupo correto

INSERT INTO lens_catalog.lentes (
  fornecedor_id,
  marca_id,
  nome_comercial,
  tipo_lente,
  material,
  indice_refracao,
  esferico_min,
  esferico_max,
  cilindrico_min,
  cilindrico_max,
  adicao_min,
  adicao_max,
  ar,
  blue,
  uv400
) VALUES (
  'uuid-do-fornecedor',
  'uuid-da-marca',
  'Multifocal CR39 1.50 AR+UV+Blue',
  'multifocal',
  'CR39',
  '1.50',
  -8.00,
  6.50,
  -6.00,
  0.00,
  0.50,
  4.50,
  true,
  true,
  true
);

-- Verificar se foi associada ao grupo automaticamente
SELECT
  l.nome_comercial,
  l.grupo_canonico_id,
  gc.nome_grupo,
  gc.total_lentes
FROM lens_catalog.lentes l
LEFT JOIN lens_catalog.grupos_canonicos gc ON l.grupo_canonico_id = gc.id
WHERE l.nome_comercial = 'Multifocal CR39 1.50 AR+UV+Blue';
*/

-- ============================================================================
-- 5. VERIFICAR ÚLTIMA ATUALIZAÇÃO DOS GRUPOS
-- ============================================================================

SELECT
  id,
  nome_grupo,
  total_lentes,
  total_marcas,
  preco_medio,
  updated_at
FROM lens_catalog.grupos_canonicos
WHERE updated_at > NOW() - INTERVAL '7 days'
ORDER BY updated_at DESC
LIMIT 10;

Success. No rows returned




-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Se os triggers estiverem ativos, você verá:
--
-- ✅ Trigger: fn_associar_lente_grupo_automatico
--    → Dispara em: INSERT ou UPDATE de lentes
--    → Função: Busca ou cria grupo canônico baseado em:
--       - tipo_lente
--       - material
--       - indice_refracao
--       - tratamentos (ar, blue, uv, fotossensivel, etc)
--       - ranges de grau
--
-- ✅ Trigger: fn_atualizar_estatisticas_grupo
--    → Dispara em: INSERT, UPDATE ou DELETE de lentes
--    → Função: Recalcula automaticamente:
--       - total_lentes
--       - total_marcas
--       - preco_minimo, preco_maximo, preco_medio
--
-- ✅ Trigger: fn_auditar_grupos
--    → Dispara em: UPDATE de grupos_canonicos
--    → Função: Registra mudanças em grupos_canonicos_log
-- ============================================================================
