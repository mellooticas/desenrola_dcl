-- ============================================================================
-- INVESTIGAÇÃO CRÍTICA: PROBLEMAS DE SALVAMENTO
-- ============================================================================
-- Data: 26/01/2026
-- Problemas Reportados:
-- 1. Valores com desconto não estão sendo salvos (margens incorretas)
-- 2. Número do pedido no laboratório não pode ser salvo (precisa editar pedido)
-- 3. Data de entrega editável não está sendo salva
-- ============================================================================

-- ============================================================================
-- PROBLEMA 1: VALORES COM DESCONTO (EDITÁVEIS) NÃO SALVAM
-- ============================================================================
-- 🔍 ANÁLISE: Verificar estrutura de campos de valores editáveis

-- 1.1. Verificar TODOS os campos de preço/valor/custo/margem na tabela pedidos
SELECT 
    column_name as campo,
    data_type as tipo,
    is_nullable as nulo,
    column_default as padrao,
    CASE 
        WHEN column_name ILIKE '%preco%' THEN '💰 Preço'
        WHEN column_name ILIKE '%custo%' THEN '💸 Custo'
        WHEN column_name ILIKE '%margem%' THEN '📊 Margem'
        WHEN column_name ILIKE '%desconto%' THEN '🏷️ Desconto'
        WHEN column_name ILIKE '%valor%' THEN '💵 Valor'
        ELSE '❓ Outro'
    END as categoria
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'pedidos'
AND (
    column_name ILIKE '%preco%'
    OR column_name ILIKE '%custo%'
    OR column_name ILIKE '%margem%'
    OR column_name ILIKE '%desconto%'
    OR column_name ILIKE '%valor%'
    OR column_name ILIKE '%real%'
)
ORDER BY categoria, ordinal_position;


| campo                         | tipo    | nulo | padrao | categoria    |
| ----------------------------- | ------- | ---- | ------ | ------------ |
| custo_lentes                  | numeric | YES  | null   | 💸 Custo     |
| custo_lente                   | numeric | YES  | null   | 💸 Custo     |
| custo_montagem                | numeric | YES  | null   | 💸 Custo     |
| custo_armacao                 | numeric | YES  | null   | 💸 Custo     |
| servico_custo                 | numeric | YES  | null   | 💸 Custo     |
| acessorio_custo_unitario      | numeric | YES  | null   | 💸 Custo     |
| servico_desconto_percentual   | numeric | YES  | 0      | 🏷️ Desconto |
| margem_lente_percentual       | numeric | YES  | null   | 📊 Margem    |
| margem_cliente_dias           | integer | YES  | 2      | 📊 Margem    |
| margem_armacao_percentual     | numeric | YES  | null   | 📊 Margem    |
| margem_servico_percentual     | numeric | YES  | null   | 📊 Margem    |
| margem_acessorio_percentual   | numeric | YES  | null   | 📊 Margem    |
| preco_lente                   | numeric | YES  | null   | 💰 Preço     |
| preco_custo                   | numeric | YES  | null   | 💰 Preço     |
| preco_armacao                 | numeric | YES  | null   | 💰 Preço     |
| servico_preco_tabela          | numeric | YES  | null   | 💰 Preço     |
| servico_preco_final           | numeric | YES  | null   | 💰 Preço     |
| servico_preco_real            | numeric | YES  | null   | 💰 Preço     |
| acessorio_preco_tabela        | numeric | YES  | null   | 💰 Preço     |
| acessorio_preco_real_unitario | numeric | YES  | null   | 💰 Preço     |
| valor_pedido                  | numeric | YES  | null   | 💵 Valor     |


-- RESULTADO ESPERADO: Ver campos como:
-- - preco_lente, custo_lente, margem_lente_percentual
-- - servico_preco_real, servico_custo, margem_servico_percentual
-- - acessorio_preco_real_unitario, acessorio_custo_unitario, margem_acessorio_percentual
-- - preco_armacao, custo_armacao, margem_armacao_percentual


-- 1.2. Verificar se campos de preço REAL (com desconto) existem
SELECT 
    COUNT(*) FILTER (WHERE column_name = 'preco_lente') as tem_preco_lente,
    COUNT(*) FILTER (WHERE column_name = 'custo_lente') as tem_custo_lente,
    COUNT(*) FILTER (WHERE column_name = 'margem_lente_percentual') as tem_margem_lente,
    COUNT(*) FILTER (WHERE column_name = 'servico_preco_real') as tem_servico_preco_real,
    COUNT(*) FILTER (WHERE column_name = 'servico_custo') as tem_servico_custo,
    COUNT(*) FILTER (WHERE column_name = 'margem_servico_percentual') as tem_margem_servico,
    COUNT(*) FILTER (WHERE column_name = 'preco_armacao') as tem_preco_armacao,
    COUNT(*) FILTER (WHERE column_name = 'custo_armacao') as tem_custo_armacao,
    COUNT(*) FILTER (WHERE column_name = 'margem_armacao_percentual') as tem_margem_armacao,
    COUNT(*) FILTER (WHERE column_name ILIKE '%acessorio%preco%') as tem_acessorio_preco,
    COUNT(*) FILTER (WHERE column_name ILIKE '%acessorio%custo%') as tem_acessorio_custo
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'pedidos';


| tem_preco_lente | tem_custo_lente | tem_margem_lente | tem_servico_preco_real | tem_servico_custo | tem_margem_servico | tem_preco_armacao | tem_custo_armacao | tem_margem_armacao | tem_acessorio_preco | tem_acessorio_custo |
| --------------- | --------------- | ---------------- | ---------------------- | ----------------- | ------------------ | ----------------- | ----------------- | ------------------ | ------------------- | ------------------- |
| 1               | 1               | 1                | 1                      | 1                 | 1                  | 1                 | 1                 | 1                  | 2                   | 1                   |


-- RESULTADO ESPERADO: Todos devem ser 1 (existem) ou 0 (faltam)


-- 1.3. Verificar TRIGGERS que podem estar interferindo no salvamento
SELECT 
    trigger_name as trigger_nome,
    event_manipulation as evento,
    event_object_table as tabela,
    action_timing as quando,
    action_statement as acao
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table = 'pedidos'
AND (
    trigger_name ILIKE '%margem%'
    OR trigger_name ILIKE '%preco%'
    OR trigger_name ILIKE '%custo%'
    OR trigger_name ILIKE '%valor%'
    OR trigger_name ILIKE '%calcu%'
)
ORDER BY trigger_name;


| trigger_nome                       | evento | tabela  | quando | acao                                          |
| ---------------------------------- | ------ | ------- | ------ | --------------------------------------------- |
| trigger_calcular_margem_armacao    | INSERT | pedidos | BEFORE | EXECUTE FUNCTION calcular_margem_armacao()    |
| trigger_calcular_margem_armacao    | UPDATE | pedidos | BEFORE | EXECUTE FUNCTION calcular_margem_armacao()    |
| trigger_calcular_margem_lente      | INSERT | pedidos | BEFORE | EXECUTE FUNCTION calcular_margem_lente()      |
| trigger_calcular_margem_lente      | UPDATE | pedidos | BEFORE | EXECUTE FUNCTION calcular_margem_lente()      |
| trigger_calcular_margem_servico    | INSERT | pedidos | BEFORE | EXECUTE FUNCTION calcular_margem_servico()    |
| trigger_calcular_margem_servico    | UPDATE | pedidos | BEFORE | EXECUTE FUNCTION calcular_margem_servico()    |
| trigger_calcular_valores_acessorio | INSERT | pedidos | BEFORE | EXECUTE FUNCTION calcular_valores_acessorio() |
| trigger_calcular_valores_acessorio | UPDATE | pedidos | BEFORE | EXECUTE FUNCTION calcular_valores_acessorio() |


-- RESULTADO ESPERADO: Triggers que calculam margens automaticamente


-- 1.4. Verificar se há trigger de calcular_margem_lente
SELECT 
    p.proname as funcao,
    pg_get_functiondef(p.oid) as definicao
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND (
    p.proname ILIKE '%margem%'
    OR p.proname ILIKE '%calcula%'
)
ORDER BY p.proname;

| funcao                            | definicao                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| calcular_datas_pos_pagamento      | CREATE OR REPLACE FUNCTION public.calcular_datas_pos_pagamento(pedido_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
  v_lab uuid;
  v_classe uuid;
  v_pagto date;
  v_sla_base int;
  v_peso int;
  v_prazo int;
  v_prev_pronto date;
  v_prev_envio date;
  v_lead_transporte int := 0;
begin
  select laboratorio_id, classe_lente_id, data_pagamento
    into v_lab, v_classe, v_pagto
  from pedidos_lab where id = pedido_id;

  if v_pagto is null then
    return;
  end if;

  -- Buscar SLA
  select ls.sla_base_dias into v_sla_base
  from laboratorio_sla ls
  where ls.laboratorio_id = v_lab and ls.classe_lente_id = v_classe;

  if v_sla_base is null then
    v_sla_base := 5; -- default se não configurado
  end if;

  -- Peso da classe
  select coalesce(c.peso_sla, 0) into v_peso 
  from classes_lente c where c.id = v_classe;

  v_prazo := v_sla_base + v_peso;
  
  -- Calcular datas com dias úteis específicos do lab
  v_prev_pronto := add_business_days(v_pagto, greatest(v_prazo, 0), v_lab);

  -- Lead de transporte
  select coalesce(lead_transporte_dias, 0) into v_lead_transporte
  from laboratorios where id = v_lab;

  v_prev_envio := add_business_days(v_prev_pronto, 1 + v_lead_transporte, v_lab);

  -- Atualizar pedido
  update pedidos_lab
  set prazo_producao_dias = v_prazo,
      data_prevista_pronto = v_prev_pronto,
      data_prevista_envio = v_prev_envio
  where id = pedido_id;
  
  -- Log do recálculo
  insert into pedido_eventos (pedido_id, tipo, descricao, detalhes)
  values (
    pedido_id,
    'SLA_RECALC',
    'SLA recalculado após pagamento',
    jsonb_build_object(
      'prazo_dias', v_prazo,
      'data_pronto', v_prev_pronto,
      'data_envio', v_prev_envio
    )
  );
end$function$
                                                                                                                                                                                                                                                                                                                                                                                                        |
| calcular_dias_diferenca           | CREATE OR REPLACE FUNCTION public.calcular_dias_diferenca(data_fim date, data_inicio date)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT CASE 
    WHEN data_fim IS NULL OR data_inicio IS NULL THEN NULL
    ELSE (data_fim - data_inicio)::integer
  END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| calcular_dias_diferenca_timestamp | CREATE OR REPLACE FUNCTION public.calcular_dias_diferenca_timestamp(timestamp_fim timestamp with time zone, data_inicio date)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT CASE 
    WHEN timestamp_fim IS NULL OR data_inicio IS NULL THEN NULL
    ELSE (timestamp_fim::date - data_inicio)::integer
  END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| calcular_dias_uteis               | CREATE OR REPLACE FUNCTION public.calcular_dias_uteis(data_inicio date, dias_adicionar integer)
 RETURNS date
 LANGUAGE plpgsql
AS $function$
DECLARE
  data_resultado DATE := data_inicio;
  dias_restantes INT := dias_adicionar;
  dia_semana INT;
BEGIN
  WHILE dias_restantes > 0 LOOP
    data_resultado := data_resultado + INTERVAL '1 day';
    dia_semana := EXTRACT(DOW FROM data_resultado);
    
    -- Se não for sábado (6) nem domingo (0)
    IF dia_semana NOT IN (0, 6) THEN
      dias_restantes := dias_restantes - 1;
    END IF;
  END LOOP;
  
  RETURN data_resultado;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| calcular_lead_time                | CREATE OR REPLACE FUNCTION public.calcular_lead_time()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Quando status muda para PRODUCAO, registrar início
  IF NEW.status = 'PRODUCAO' AND OLD.status != 'PRODUCAO' THEN
    NEW.data_inicio_producao = NOW();
  END IF;
  
  -- Quando status muda para PRONTO, calcular lead time de produção
  IF NEW.status = 'PRONTO' AND OLD.status = 'PRODUCAO' THEN
    NEW.data_conclusao_producao = NOW();
    IF NEW.data_inicio_producao IS NOT NULL THEN
      NEW.lead_time_producao_horas = EXTRACT(EPOCH FROM (NOW() - NEW.data_inicio_producao)) / 3600;
    END IF;
  END IF;
  
  -- Quando status muda para ENTREGUE, calcular lead time total
  IF NEW.status = 'ENTREGUE' AND OLD.status != 'ENTREGUE' THEN
    NEW.lead_time_total_horas = EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 3600;
  END IF;
  
  RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| calcular_liga                     | CREATE OR REPLACE FUNCTION public.calcular_liga(pontos_mes integer)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF pontos_mes >= 2500 THEN
    RETURN 'DIAMANTE';
  ELSIF pontos_mes >= 1200 THEN
    RETURN 'OURO';
  ELSIF pontos_mes >= 500 THEN
    RETURN 'PRATA';
  ELSE
    RETURN 'BRONZE';
  END IF;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| calcular_margem_armacao           | CREATE OR REPLACE FUNCTION public.calcular_margem_armacao()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.preco_armacao IS NOT NULL AND NEW.custo_armacao IS NOT NULL AND NEW.custo_armacao > 0 THEN
    NEW.margem_armacao_percentual := ROUND(
      ((NEW.preco_armacao - NEW.custo_armacao) / NEW.preco_armacao * 100)::numeric, 
      2
    );
  ELSE
    NEW.margem_armacao_percentual := NULL;
  END IF;
  RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| calcular_margem_lente             | CREATE OR REPLACE FUNCTION public.calcular_margem_lente()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.preco_lente IS NOT NULL AND NEW.custo_lente IS NOT NULL AND NEW.custo_lente > 0 THEN
    NEW.margem_lente_percentual := ROUND(
      ((NEW.preco_lente - NEW.custo_lente) / NEW.preco_lente * 100)::numeric, 
      2
    );
  ELSE
    NEW.margem_lente_percentual := NULL;
  END IF;
  RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| calcular_margem_servico           | CREATE OR REPLACE FUNCTION public.calcular_margem_servico()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.servico_preco_real IS NOT NULL AND NEW.servico_custo IS NOT NULL AND NEW.servico_preco_real > 0 THEN
    NEW.margem_servico_percentual := ROUND(
      ((NEW.servico_preco_real - NEW.servico_custo) / NEW.servico_preco_real * 100)::numeric, 
      2
    );
  ELSE
    NEW.margem_servico_percentual := NULL;
  END IF;
  
  RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| calcular_pontos_missao            | CREATE OR REPLACE FUNCTION public.calcular_pontos_missao(p_missao_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  missao_record RECORD;
  template_record RECORD;
  usuario_stats RECORD;
  pontos_final INT;
  badges_ganhas TEXT[] := '{}';
  multiplicadores JSONB := '{}';
BEGIN
  -- Buscar dados da missão
  SELECT * INTO missao_record
  FROM missoes_diarias 
  WHERE id = p_missao_id;
  
  -- Buscar dados do template
  SELECT * INTO template_record
  FROM missao_templates 
  WHERE id = missao_record.template_id;
  
  -- Buscar stats do usuário (se existir)
  SELECT * INTO usuario_stats
  FROM usuario_gamificacao
  WHERE usuario_id = missao_record.executada_por::uuid
  AND loja_id = missao_record.loja_id;
  
  -- Calcular pontos base
  pontos_final := template_record.pontos_base;
  
  -- Multiplicador por tipo (crítica = 3x)
  IF template_record.tipo = 'critica' THEN
    pontos_final := pontos_final * template_record.multiplicador_critico;
    multiplicadores := multiplicadores || jsonb_build_object('critica', template_record.multiplicador_critico);
  END IF;
  
  -- Bonus por qualidade (5 estrelas = +50%)
  IF missao_record.qualidade_execucao = 5 THEN
    pontos_final := pontos_final * 1.5;
    multiplicadores := multiplicadores || jsonb_build_object('qualidade_perfeita', 1.5);
    badges_ganhas := badges_ganhas || 'perfectionist';
  END IF;
  
  -- Bonus por velocidade (menos de 50% do tempo estimado = +20%)
  IF missao_record.tempo_total_execucao_segundos < (template_record.tempo_estimado_min * 60 * 0.5) THEN
    pontos_final := pontos_final * 1.2;
    multiplicadores := multiplicadores || jsonb_build_object('velocidade', 1.2);
    badges_ganhas := badges_ganhas || 'speed_demon';
  END IF;
  
  -- Multiplicador de streak (se usuário existe)
  IF usuario_stats.streak_dias_consecutivos >= 7 THEN
    pontos_final := pontos_final * 1.5;
    multiplicadores := multiplicadores || jsonb_build_object('streak', 1.5);
  END IF;
  
  RETURN jsonb_build_object(
    'pontos_final', pontos_final,
    'badges_ganhas', badges_ganhas,
    'multiplicadores', multiplicadores
  );
END;
$function$
 |
| calcular_pontuacao_diaria         | CREATE OR REPLACE FUNCTION public.calcular_pontuacao_diaria(p_loja_id uuid, p_data date)
 RETURNS TABLE(pontos_possiveis integer, pontos_conquistados integer, missoes_totais integer, missoes_completadas integer, percentual_eficiencia numeric)
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_pontos_possiveis INTEGER := 0;
  v_pontos_conquistados INTEGER := 0;
  v_missoes_totais INTEGER := 0;
  v_missoes_completadas INTEGER := 0;
  v_percentual DECIMAL(5,2) := 0;
BEGIN
  -- Buscar dados reais das missões da loja na data
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'concluida') as completadas,
    COUNT(*) * 50 as possiveis, -- 50 pontos por missão
    COALESCE(SUM(CASE WHEN status = 'concluida' THEN pontos_total ELSE 0 END), 0) as conquistados
  INTO v_missoes_totais, v_missoes_completadas, v_pontos_possiveis, v_pontos_conquistados
  FROM v_missoes_timeline 
  WHERE loja_id = p_loja_id 
    AND data_missao = p_data;
  
  -- Calcular percentual
  IF v_pontos_possiveis > 0 THEN
    v_percentual := (v_pontos_conquistados::DECIMAL / v_pontos_possiveis::DECIMAL) * 100;
  END IF;
  
  -- Inserir ou atualizar registro
  INSERT INTO pontuacao_diaria (
    loja_id, data, pontos_possiveis, pontos_conquistados, 
    missoes_totais, missoes_completadas, percentual_eficiencia
  ) VALUES (
    p_loja_id, p_data, v_pontos_possiveis, v_pontos_conquistados,
    v_missoes_totais, v_missoes_completadas, v_percentual
  )
  ON CONFLICT (loja_id, data) 
  DO UPDATE SET
    pontos_possiveis = EXCLUDED.pontos_possiveis,
    pontos_conquistados = EXCLUDED.pontos_conquistados,
    missoes_totais = EXCLUDED.missoes_totais,
    missoes_completadas = EXCLUDED.missoes_completadas,
    percentual_eficiencia = EXCLUDED.percentual_eficiencia,
    updated_at = NOW();
  
  -- Retornar resultados
  RETURN QUERY SELECT v_pontos_possiveis, v_pontos_conquistados, v_missoes_totais, v_missoes_completadas, v_percentual;
END;
$function$
                                                                                                                                                                                                           |
| calcular_sla                      | CREATE OR REPLACE FUNCTION public.calcular_sla(p_data_pagamento timestamp with time zone, p_laboratorio_id uuid)
 RETURNS date
 LANGUAGE plpgsql
AS $function$
DECLARE
  sla_dias INTEGER;
  apenas_dias_uteis BOOLEAN;
  data_resultado DATE;
BEGIN
  -- Buscar configuração do laboratório
  SELECT lab.sla_dias, lab.dias_uteis_apenas 
  INTO sla_dias, apenas_dias_uteis
  FROM laboratorios lab 
  WHERE lab.id = p_laboratorio_id;
  
  -- Se não encontrou, usar padrão
  IF sla_dias IS NULL THEN
    sla_dias := 5;
    apenas_dias_uteis := true;
  END IF;
  
  -- Calcular data baseada se é só dias úteis ou não
  IF apenas_dias_uteis THEN
    -- Adicionar apenas dias úteis (segunda a sexta)
    data_resultado := p_data_pagamento::DATE;
    WHILE sla_dias > 0 LOOP
      data_resultado := data_resultado + INTERVAL '1 day';
      -- Se não for sábado (6) nem domingo (0)
      IF EXTRACT(DOW FROM data_resultado) NOT IN (0, 6) THEN
        sla_dias := sla_dias - 1;
      END IF;
    END LOOP;
  ELSE
    -- Adicionar dias corridos
    data_resultado := (p_data_pagamento + (sla_dias || ' days')::INTERVAL)::DATE;
  END IF;
  
  RETURN data_resultado;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| calcular_sla_com_tratamentos      | CREATE OR REPLACE FUNCTION public.calcular_sla_com_tratamentos(pedido_uuid uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  pedido_record RECORD;
  dias_base INTEGER;
  dias_tratamentos INTEGER := 0;
  dias_total INTEGER;
BEGIN
  -- Buscar dados do pedido
  SELECT p.*, cl.sla_base_dias
  INTO pedido_record
  FROM pedidos p
  LEFT JOIN classes_lente cl ON p.classe_lente_id = cl.id
  WHERE p.id = pedido_uuid;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- SLA base da classe
  dias_base := COALESCE(pedido_record.sla_base_dias, 5);
  
  -- Somar dias dos tratamentos
  SELECT COALESCE(SUM(t.tempo_adicional_dias), 0)
  INTO dias_tratamentos
  FROM pedido_tratamentos pt
  LEFT JOIN tratamentos t ON pt.tratamento_id = t.id
  WHERE pt.pedido_id = pedido_uuid;
  
  -- Calcular total
  dias_total := dias_base + dias_tratamentos;
  
  -- Ajustar por prioridade
  CASE pedido_record.prioridade
    WHEN 'URGENTE' THEN dias_total := dias_total - 3;
    WHEN 'ALTA' THEN dias_total := dias_total - 1;
    WHEN 'BAIXA' THEN dias_total := dias_total + 2;
    ELSE NULL; -- NORMAL = sem ajuste
  END CASE;
  
  -- Garantir mínimo de 1 dia
  RETURN GREATEST(dias_total, 1);
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| calcular_sla_pedido               | CREATE OR REPLACE FUNCTION public.calcular_sla_pedido(pedido_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  pedido_rec RECORD;
  sla_dias INT;
  data_base DATE;
BEGIN
  -- Buscar dados do pedido
  SELECT p.*, l.trabalha_sabado, l.sla_padrao_dias
  INTO pedido_rec
  FROM pedidos p
  JOIN laboratorios l ON p.laboratorio_id = l.id
  WHERE p.id = pedido_uuid;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Buscar SLA específico ou usar padrão
  SELECT COALESCE(ls.sla_base_dias, cl.sla_base_dias, 5)
  INTO sla_dias
  FROM classes_lente cl
  LEFT JOIN laboratorio_sla ls ON ls.laboratorio_id = pedido_rec.laboratorio_id 
    AND ls.classe_lente_id = pedido_rec.classe_lente_id
  WHERE cl.id = pedido_rec.classe_lente_id;
  
  -- Ajustar SLA por prioridade
  CASE pedido_rec.prioridade
    WHEN 'URGENTE' THEN sla_dias := GREATEST(1, sla_dias - 3);
    WHEN 'ALTA' THEN sla_dias := GREATEST(2, sla_dias - 1);
    WHEN 'BAIXA' THEN sla_dias := sla_dias + 2;
    ELSE -- NORMAL, manter SLA base
  END CASE;
  
  -- Definir data base para cálculo
  data_base := COALESCE(pedido_rec.data_pagamento, pedido_rec.data_pedido);
  
  -- Calcular datas previstas
  UPDATE pedidos SET
    data_prevista_pronto = calcular_dias_uteis(data_base, sla_dias),
    updated_at = NOW()
  WHERE id = pedido_uuid;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| calcular_valores_acessorio        | CREATE OR REPLACE FUNCTION public.calcular_valores_acessorio()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Calcular subtotal (preco_real_unitario * quantidade)
  IF NEW.acessorio_preco_real_unitario IS NOT NULL AND NEW.acessorio_quantidade IS NOT NULL THEN
    NEW.acessorio_subtotal := NEW.acessorio_preco_real_unitario * NEW.acessorio_quantidade;
  ELSE
    NEW.acessorio_subtotal := NULL;
  END IF;
  
  -- Calcular margem percentual
  IF NEW.acessorio_preco_real_unitario IS NOT NULL 
     AND NEW.acessorio_custo_unitario IS NOT NULL 
     AND NEW.acessorio_preco_real_unitario > 0 THEN
    NEW.margem_acessorio_percentual := ROUND(
      ((NEW.acessorio_preco_real_unitario - NEW.acessorio_custo_unitario) / NEW.acessorio_preco_real_unitario * 100)::numeric, 
      2
    );
  ELSE
    NEW.margem_acessorio_percentual := NULL;
  END IF;
  
  RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| recalcular_sla_pedido             | CREATE OR REPLACE FUNCTION public.recalcular_sla_pedido(pedido_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  pedido_rec RECORD;
  sla_dias INTEGER := 5;
BEGIN
  -- Buscar dados do pedido
  SELECT p.*, l.sla_padrao_dias, cl.sla_base_dias
  INTO pedido_rec
  FROM pedidos p
  LEFT JOIN laboratorios l ON p.laboratorio_id = l.id
  LEFT JOIN classes_lente cl ON p.classe_lente_id = cl.id
  WHERE p.id = pedido_uuid;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'Pedido % não encontrado', pedido_uuid;
    RETURN;
  END IF;
  
  -- Calcular SLA
  SELECT COALESCE(ls.sla_base_dias, cl.sla_base_dias, l.sla_padrao_dias, 5)
  INTO sla_dias
  FROM laboratorios l
  LEFT JOIN classes_lente cl ON cl.id = pedido_rec.classe_lente_id
  LEFT JOIN laboratorio_sla ls ON ls.laboratorio_id = pedido_rec.laboratorio_id 
    AND ls.classe_lente_id = pedido_rec.classe_lente_id
  WHERE l.id = pedido_rec.laboratorio_id;
  
  -- Ajustar por prioridade
  CASE pedido_rec.prioridade
    WHEN 'URGENTE' THEN sla_dias := GREATEST(1, sla_dias - 3);
    WHEN 'ALTA' THEN sla_dias := GREATEST(2, sla_dias - 1);
    WHEN 'BAIXA' THEN sla_dias := sla_dias + 2;
    ELSE -- NORMAL
  END CASE;
  
  -- Atualizar pedido
  UPDATE pedidos SET
    data_prometida = COALESCE(data_pagamento, data_pedido) + (sla_dias || ' days')::INTERVAL,
    updated_at = NOW()
  WHERE id = pedido_uuid;
  
  RAISE NOTICE 'SLA recalculado para pedido %: % dias', pedido_uuid, sla_dias;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |



-- ANÁLISE: Ver se trigger está SOBRESCREVENDO valores editados pelo usuário


-- 1.5. Testar INSERT de pedido com valores editáveis
-- TESTE MANUAL (NÃO EXECUTAR EM PRODUÇÃO SEM BACKUP):
/*
INSERT INTO pedidos (
    loja_id,
    laboratorio_id,
    cliente_nome,
    preco_lente,
    custo_lente,
    margem_lente_percentual,
    servico_preco_real,
    servico_custo,
    margem_servico_percentual
) VALUES (
    (SELECT id FROM lojas LIMIT 1),
    (SELECT id FROM laboratorios WHERE ativo = true LIMIT 1),
    'TESTE SALVAMENTO VALORES',
    250.00,  -- Preço com desconto aplicado
    100.00,  -- Custo
    60.00,   -- Margem calculada manualmente
    85.00,   -- Preço serviço com desconto
    30.00,   -- Custo serviço
    64.71    -- Margem serviço
)
RETURNING id, preco_lente, custo_lente, margem_lente_percentual, servico_preco_real, margem_servico_percentual;
*/

-- VERIFICAR se valores foram salvos ou se trigger sobrescreveu:
/*
SELECT 
    id,
    preco_lente,
    custo_lente,
    margem_lente_percentual,
    servico_preco_real,
    servico_custo,
    margem_servico_percentual
FROM pedidos
WHERE cliente_nome = 'TESTE SALVAMENTO VALORES'
ORDER BY created_at DESC
LIMIT 1;
*/


-- 1.6. Verificar pedidos com margem ZERADA ou NULA (sintoma do problema)
SELECT 
    id,
    numero_sequencial,
    cliente_nome,
    preco_lente,
    custo_lente,
    margem_lente_percentual,
    created_at,
    updated_at,
    CASE 
        WHEN margem_lente_percentual IS NULL THEN '⚠️ NULA'
        WHEN margem_lente_percentual = 0 THEN '❌ ZERADA'
        WHEN margem_lente_percentual < 0 THEN '🔴 NEGATIVA'
        ELSE '✅ OK'
    END as status_margem
FROM pedidos
WHERE preco_lente IS NOT NULL 
  AND custo_lente IS NOT NULL
  AND (margem_lente_percentual IS NULL OR margem_lente_percentual = 0)
ORDER BY created_at DESC
LIMIT 20;

-- RESULTADO ESPERADO: Pedidos onde valores editados não foram salvos


-- ============================================================================
-- PROBLEMA 2: NÚMERO DO PEDIDO NO LABORATÓRIO NÃO SALVA
-- ============================================================================
-- 🔍 ANÁLISE: Campo numero_pedido_laboratorio

-- 2.1. Verificar se campo existe e suas propriedades
SELECT 
    column_name as campo,
    data_type as tipo,
    character_maximum_length as tamanho_max,
    is_nullable as aceita_nulo,
    column_default as valor_padrao
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'pedidos'
AND column_name = 'numero_pedido_laboratorio';


| campo                     | tipo              | tamanho_max | aceita_nulo | valor_padrao |
| ------------------------- | ----------------- | ----------- | ----------- | ------------ |
| numero_pedido_laboratorio | character varying | 100         | YES         | null         |

-- RESULTADO ESPERADO: campo VARCHAR(100) que aceita NULL


-- 2.2. Verificar se há índice no campo
SELECT 
    indexname as indice,
    indexdef as definicao
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'pedidos'
AND indexdef ILIKE '%numero_pedido_laboratorio%';


| indice                                | definicao                                                                                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| idx_pedidos_numero_pedido_laboratorio | CREATE INDEX idx_pedidos_numero_pedido_laboratorio ON public.pedidos USING btree (numero_pedido_laboratorio) WHERE (numero_pedido_laboratorio IS NOT NULL) |


-- 2.3. Verificar se há CONSTRAINT ou TRIGGER que bloqueia insert/update
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table = 'pedidos'
AND action_statement ILIKE '%numero_pedido_laboratorio%';


-- 2.4. Verificar RLS policies que podem bloquear update
SELECT 
    policyname as policy,
    cmd as comando,
    qual as condicao,
    with_check as validacao
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'pedidos'
ORDER BY cmd;

| policy                   | comando | condicao | validacao |
| ------------------------ | ------- | -------- | --------- |
| anon_all_access          | ALL     | true     | true      |
| authenticated_all_access | ALL     | true     | true      |


-- ANÁLISE: Ver se INSERT/UPDATE tem políticas restritivas


-- 2.5. Testar se UPDATE funciona diretamente no banco
-- TESTE MANUAL (executar com pedido existente):
/*
-- Criar pedido teste
INSERT INTO pedidos (loja_id, laboratorio_id, cliente_nome)
VALUES (
    (SELECT id FROM lojas LIMIT 1),
    (SELECT id FROM laboratorios WHERE ativo = true LIMIT 1),
    'TESTE NUMERO LAB'
)
RETURNING id;

-- Tentar atualizar numero_pedido_laboratorio
UPDATE pedidos 
SET numero_pedido_laboratorio = 'LAB-2026-001'
WHERE cliente_nome = 'TESTE NUMERO LAB'
RETURNING id, numero_pedido_laboratorio;
*/


-- 2.6. Verificar pedidos SEM número de laboratório (sintoma)
SELECT 
    COUNT(*) as total_sem_numero_lab,
    COUNT(*) FILTER (WHERE laboratorio_id IS NOT NULL) as tem_laboratorio_mas_sem_numero,
    ROUND(COUNT(*) FILTER (WHERE laboratorio_id IS NOT NULL)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as percentual
FROM pedidos
WHERE numero_pedido_laboratorio IS NULL;

| total_sem_numero_lab | tem_laboratorio_mas_sem_numero | percentual |
| -------------------- | ------------------------------ | ---------- |
| 56                   | 27                             | 48.21      |



-- 2.7. Verificar histórico de updates neste campo
SELECT 
    pt.pedido_id,
    p.numero_sequencial,
    p.cliente_nome,
    pt.status_anterior,
    pt.status_novo,
    pt.observacoes,
    pt.created_at
FROM pedidos_timeline pt
JOIN pedidos p ON p.id = pt.pedido_id
WHERE pt.observacoes ILIKE '%numero%laboratorio%'
   OR pt.observacoes ILIKE '%numero%pedido%'
ORDER BY pt.created_at DESC
LIMIT 10;


Success. No rows returned





-- ============================================================================
-- PROBLEMA 3: DATA DE ENTREGA EDITÁVEL NÃO SALVA
-- ============================================================================
-- 🔍 ANÁLISE: Campos de data de entrega

-- 3.1. Verificar TODOS os campos de data relacionados a entrega
SELECT 
    column_name as campo,
    data_type as tipo,
    is_nullable as aceita_nulo,
    column_default as valor_padrao,
    CASE 
        WHEN column_name ILIKE '%entrega%' THEN '📦 Entrega'
        WHEN column_name ILIKE '%entregue%' THEN '✅ Entregue'
        WHEN column_name ILIKE '%prevista%' THEN '📅 Prevista'
        WHEN column_name ILIKE '%previsao%' THEN '🔮 Previsão'
        WHEN column_name ILIKE '%prometida%' THEN '🤝 Prometida'
        ELSE '📆 Outra Data'
    END as categoria
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'pedidos'
AND (
    column_name ILIKE '%entrega%'
    OR column_name ILIKE '%entregue%'
    OR column_name ILIKE '%prevista%'
    OR column_name ILIKE '%previsao%'
    OR column_name ILIKE '%prometida%'
)
ORDER BY categoria, column_name;


| campo                  | tipo | aceita_nulo | valor_padrao | categoria    |
| ---------------------- | ---- | ----------- | ------------ | ------------ |
| data_previsao_entrega  | date | YES         | null         | 📦 Entrega   |
| data_entregue          | date | YES         | null         | ✅ Entregue   |
| data_prevista_montagem | date | YES         | null         | 📅 Prevista  |
| data_prevista_pronto   | date | YES         | null         | 📅 Prevista  |
| data_prometida         | date | YES         | null         | 🤝 Prometida |


-- RESULTADO ESPERADO: Ver campos como:
-- - data_entregue (quando foi entregue de fato)
-- - data_prevista_pronto (previsão técnica)
-- - data_previsao_entrega (previsão editável?)
-- - data_prometida (data prometida ao cliente)


-- 3.2. Verificar qual campo é o EDITÁVEL pelo usuário
SELECT 
    COUNT(*) FILTER (WHERE column_name = 'data_entregue') as tem_data_entregue,
    COUNT(*) FILTER (WHERE column_name = 'data_previsao_entrega') as tem_data_previsao_entrega,
    COUNT(*) FILTER (WHERE column_name = 'data_prevista_pronto') as tem_data_prevista_pronto,
    COUNT(*) FILTER (WHERE column_name = 'data_prometida') as tem_data_prometida
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'pedidos';

| tem_data_entregue | tem_data_previsao_entrega | tem_data_prevista_pronto | tem_data_prometida |
| ----------------- | ------------------------- | ------------------------ | ------------------ |
| 1                 | 1                         | 1                        | 1                  |


-- 3.3. Verificar TRIGGERS que podem recalcular datas automaticamente
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table = 'pedidos'
AND (
    trigger_name ILIKE '%data%'
    OR trigger_name ILIKE '%entrega%'
    OR trigger_name ILIKE '%sla%'
    OR trigger_name ILIKE '%prevista%'
    OR action_statement ILIKE '%data_entrega%'
    OR action_statement ILIKE '%data_prevista%'
    OR action_statement ILIKE '%data_previsao%'
);

| trigger_name                    | event_manipulation | action_timing | action_statement                                  |
| ------------------------------- | ------------------ | ------------- | ------------------------------------------------- |
| trigger_atualizar_datas_pedido  | INSERT             | BEFORE        | EXECUTE FUNCTION trigger_atualizar_datas_pedido() |
| trigger_atualizar_datas_pedido  | UPDATE             | BEFORE        | EXECUTE FUNCTION trigger_atualizar_datas_pedido() |
| trigger_populate_data_prometida | INSERT             | BEFORE        | EXECUTE FUNCTION populate_data_prometida()        |
| trigger_populate_data_prometida | UPDATE             | BEFORE        | EXECUTE FUNCTION populate_data_prometida()        |


-- ANÁLISE: Ver se há trigger que sobrescreve data editada pelo usuário


-- 3.4. Verificar funções que calculam datas automaticamente
SELECT 
    p.proname as funcao,
    pg_get_function_arguments(p.oid) as parametros,
    pg_get_function_result(p.oid) as retorno,
    CASE 
        WHEN p.proname ILIKE '%sla%' THEN '🎯 SLA'
        WHEN p.proname ILIKE '%data%' THEN '📅 Data'
        WHEN p.proname ILIKE '%calcular%' THEN '🧮 Cálculo'
        ELSE '❓ Outra'
    END as tipo
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND (
    p.proname ILIKE '%data%'
    OR p.proname ILIKE '%entrega%'
    OR p.proname ILIKE '%sla%'
    OR p.proname ILIKE '%prevista%'
)
ORDER BY tipo, p.proname;


| funcao                         | parametros                                                                                                   | retorno                                                                                                                                                                                           | tipo    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| calcular_datas_pos_pagamento   | pedido_id uuid                                                                                               | void                                                                                                                                                                                              | 📅 Data |
| populate_data_prometida        |                                                                                                              | trigger                                                                                                                                                                                           | 📅 Data |
| trigger_atualizar_datas_pedido |                                                                                                              | trigger                                                                                                                                                                                           | 📅 Data |
| auto_entregar_pedido           |                                                                                                              | trigger                                                                                                                                                                                           | ❓ Outra |
| calcular_sla                   | p_data_pagamento timestamp with time zone, p_laboratorio_id uuid                                             | date                                                                                                                                                                                              | 🎯 SLA  |
| calcular_sla_com_tratamentos   | pedido_uuid uuid                                                                                             | integer                                                                                                                                                                                           | 🎯 SLA  |
| calcular_sla_pedido            | pedido_uuid uuid                                                                                             | void                                                                                                                                                                                              | 🎯 SLA  |
| get_alertas_sla_criticos       | p_loja_id uuid DEFAULT NULL::uuid                                                                            | TABLE(id text, tipo text, titulo text, descricao text, pedido_os text, laboratorio text, acao_sugerida text, severidade text, dias_restantes integer)                                             | 🎯 SLA  |
| get_alertas_sla_criticos       |                                                                                                              | TABLE(pedido_id uuid, cliente_nome character varying, tipo_alerta character varying, severidade character varying, dias_restantes integer, status_atual character varying, acao_recomendada text) | 🎯 SLA  |
| get_sla_metricas               | p_loja_id uuid DEFAULT NULL::uuid, p_data_inicio date DEFAULT NULL::date, p_data_fim date DEFAULT NULL::date | TABLE(total_pedidos integer, sla_lab_cumprido integer, promessas_cumpridas integer, taxa_sla_lab numeric, taxa_promessa_cliente numeric, economia_margem numeric, custo_atrasos numeric)          | 🎯 SLA  |
| get_timeline_sla_7_dias        | p_loja_id uuid DEFAULT NULL::uuid                                                                            | TABLE(dia text, data date, sla_vencendo integer, promessas_vencendo integer, status text)                                                                                                         | 🎯 SLA  |
| get_timeline_sla_7_dias        |                                                                                                              | TABLE(data_referencia date, vencimentos_sla integer, entregas_prometidas integer, capacidade_estimada integer, risco_gargalo boolean, acoes_preventivas text)                                     | 🎯 SLA  |
| recalcular_sla_pedido          | pedido_uuid uuid                                                                                             | void                                                                                                                                                                                              | 🎯 SLA  |
| trigger_atualizar_sla          |                                                                                                              | trigger                                                                                                                                                                                           | 🎯 SLA  |


-- 3.5. Verificar definição da função calcular_sla (pode sobrescrever data editada)
SELECT 
    p.proname as funcao,
    pg_get_functiondef(p.oid) as codigo_completo
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('calcular_sla', 'calcular_sla_pedido', 'recalcular_sla_pedido', 'calcular_datas_pos_pagamento');

| funcao                       | codigo_completo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| calcular_datas_pos_pagamento | CREATE OR REPLACE FUNCTION public.calcular_datas_pos_pagamento(pedido_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
  v_lab uuid;
  v_classe uuid;
  v_pagto date;
  v_sla_base int;
  v_peso int;
  v_prazo int;
  v_prev_pronto date;
  v_prev_envio date;
  v_lead_transporte int := 0;
begin
  select laboratorio_id, classe_lente_id, data_pagamento
    into v_lab, v_classe, v_pagto
  from pedidos_lab where id = pedido_id;

  if v_pagto is null then
    return;
  end if;

  -- Buscar SLA
  select ls.sla_base_dias into v_sla_base
  from laboratorio_sla ls
  where ls.laboratorio_id = v_lab and ls.classe_lente_id = v_classe;

  if v_sla_base is null then
    v_sla_base := 5; -- default se não configurado
  end if;

  -- Peso da classe
  select coalesce(c.peso_sla, 0) into v_peso 
  from classes_lente c where c.id = v_classe;

  v_prazo := v_sla_base + v_peso;
  
  -- Calcular datas com dias úteis específicos do lab
  v_prev_pronto := add_business_days(v_pagto, greatest(v_prazo, 0), v_lab);

  -- Lead de transporte
  select coalesce(lead_transporte_dias, 0) into v_lead_transporte
  from laboratorios where id = v_lab;

  v_prev_envio := add_business_days(v_prev_pronto, 1 + v_lead_transporte, v_lab);

  -- Atualizar pedido
  update pedidos_lab
  set prazo_producao_dias = v_prazo,
      data_prevista_pronto = v_prev_pronto,
      data_prevista_envio = v_prev_envio
  where id = pedido_id;
  
  -- Log do recálculo
  insert into pedido_eventos (pedido_id, tipo, descricao, detalhes)
  values (
    pedido_id,
    'SLA_RECALC',
    'SLA recalculado após pagamento',
    jsonb_build_object(
      'prazo_dias', v_prazo,
      'data_pronto', v_prev_pronto,
      'data_envio', v_prev_envio
    )
  );
end$function$
 |
| calcular_sla                 | CREATE OR REPLACE FUNCTION public.calcular_sla(p_data_pagamento timestamp with time zone, p_laboratorio_id uuid)
 RETURNS date
 LANGUAGE plpgsql
AS $function$
DECLARE
  sla_dias INTEGER;
  apenas_dias_uteis BOOLEAN;
  data_resultado DATE;
BEGIN
  -- Buscar configuração do laboratório
  SELECT lab.sla_dias, lab.dias_uteis_apenas 
  INTO sla_dias, apenas_dias_uteis
  FROM laboratorios lab 
  WHERE lab.id = p_laboratorio_id;
  
  -- Se não encontrou, usar padrão
  IF sla_dias IS NULL THEN
    sla_dias := 5;
    apenas_dias_uteis := true;
  END IF;
  
  -- Calcular data baseada se é só dias úteis ou não
  IF apenas_dias_uteis THEN
    -- Adicionar apenas dias úteis (segunda a sexta)
    data_resultado := p_data_pagamento::DATE;
    WHILE sla_dias > 0 LOOP
      data_resultado := data_resultado + INTERVAL '1 day';
      -- Se não for sábado (6) nem domingo (0)
      IF EXTRACT(DOW FROM data_resultado) NOT IN (0, 6) THEN
        sla_dias := sla_dias - 1;
      END IF;
    END LOOP;
  ELSE
    -- Adicionar dias corridos
    data_resultado := (p_data_pagamento + (sla_dias || ' days')::INTERVAL)::DATE;
  END IF;
  
  RETURN data_resultado;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| calcular_sla_pedido          | CREATE OR REPLACE FUNCTION public.calcular_sla_pedido(pedido_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  pedido_rec RECORD;
  sla_dias INT;
  data_base DATE;
BEGIN
  -- Buscar dados do pedido
  SELECT p.*, l.trabalha_sabado, l.sla_padrao_dias
  INTO pedido_rec
  FROM pedidos p
  JOIN laboratorios l ON p.laboratorio_id = l.id
  WHERE p.id = pedido_uuid;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Buscar SLA específico ou usar padrão
  SELECT COALESCE(ls.sla_base_dias, cl.sla_base_dias, 5)
  INTO sla_dias
  FROM classes_lente cl
  LEFT JOIN laboratorio_sla ls ON ls.laboratorio_id = pedido_rec.laboratorio_id 
    AND ls.classe_lente_id = pedido_rec.classe_lente_id
  WHERE cl.id = pedido_rec.classe_lente_id;
  
  -- Ajustar SLA por prioridade
  CASE pedido_rec.prioridade
    WHEN 'URGENTE' THEN sla_dias := GREATEST(1, sla_dias - 3);
    WHEN 'ALTA' THEN sla_dias := GREATEST(2, sla_dias - 1);
    WHEN 'BAIXA' THEN sla_dias := sla_dias + 2;
    ELSE -- NORMAL, manter SLA base
  END CASE;
  
  -- Definir data base para cálculo
  data_base := COALESCE(pedido_rec.data_pagamento, pedido_rec.data_pedido);
  
  -- Calcular datas previstas
  UPDATE pedidos SET
    data_prevista_pronto = calcular_dias_uteis(data_base, sla_dias),
    updated_at = NOW()
  WHERE id = pedido_uuid;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| recalcular_sla_pedido        | CREATE OR REPLACE FUNCTION public.recalcular_sla_pedido(pedido_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  pedido_rec RECORD;
  sla_dias INTEGER := 5;
BEGIN
  -- Buscar dados do pedido
  SELECT p.*, l.sla_padrao_dias, cl.sla_base_dias
  INTO pedido_rec
  FROM pedidos p
  LEFT JOIN laboratorios l ON p.laboratorio_id = l.id
  LEFT JOIN classes_lente cl ON p.classe_lente_id = cl.id
  WHERE p.id = pedido_uuid;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'Pedido % não encontrado', pedido_uuid;
    RETURN;
  END IF;
  
  -- Calcular SLA
  SELECT COALESCE(ls.sla_base_dias, cl.sla_base_dias, l.sla_padrao_dias, 5)
  INTO sla_dias
  FROM laboratorios l
  LEFT JOIN classes_lente cl ON cl.id = pedido_rec.classe_lente_id
  LEFT JOIN laboratorio_sla ls ON ls.laboratorio_id = pedido_rec.laboratorio_id 
    AND ls.classe_lente_id = pedido_rec.classe_lente_id
  WHERE l.id = pedido_rec.laboratorio_id;
  
  -- Ajustar por prioridade
  CASE pedido_rec.prioridade
    WHEN 'URGENTE' THEN sla_dias := GREATEST(1, sla_dias - 3);
    WHEN 'ALTA' THEN sla_dias := GREATEST(2, sla_dias - 1);
    WHEN 'BAIXA' THEN sla_dias := sla_dias + 2;
    ELSE -- NORMAL
  END CASE;
  
  -- Atualizar pedido
  UPDATE pedidos SET
    data_prometida = COALESCE(data_pagamento, data_pedido) + (sla_dias || ' days')::INTERVAL,
    updated_at = NOW()
  WHERE id = pedido_uuid;
  
  RAISE NOTICE 'SLA recalculado para pedido %: % dias', pedido_uuid, sla_dias;
END;
$function$
                                                                                                                                                                                                                                                                                                     |


-- 3.6. Testar UPDATE direto no banco
-- TESTE MANUAL:
/*
-- Selecionar pedido para teste
SELECT id, numero_sequencial, data_previsao_entrega, data_prevista_pronto, data_prometida
FROM pedidos
WHERE status IN ('producao', 'aguardando_entrega')
ORDER BY created_at DESC
LIMIT 1;

-- Tentar atualizar data de entrega (ajustar ID):
UPDATE pedidos 
SET data_previsao_entrega = '2026-02-15'
WHERE id = 'UUID-DO-PEDIDO-AQUI'
RETURNING id, data_previsao_entrega, data_prevista_pronto, data_prometida;

-- Verificar se salvou:
SELECT id, numero_sequencial, data_previsao_entrega, data_prevista_pronto, data_prometida, updated_at
FROM pedidos
WHERE id = 'UUID-DO-PEDIDO-AQUI';
*/


-- 3.7. Verificar histórico de mudanças em datas
SELECT 
    pt.pedido_id,
    p.numero_sequencial,
    p.cliente_nome,
    pt.observacoes,
    pt.created_at,
    p.data_previsao_entrega,
    p.data_prevista_pronto,
    p.data_prometida
FROM pedidos_timeline pt
JOIN pedidos p ON p.id = pt.pedido_id
WHERE pt.observacoes ILIKE '%data%entrega%'
   OR pt.observacoes ILIKE '%previsao%'
   OR pt.observacoes ILIKE '%sla%'
ORDER BY pt.created_at DESC
LIMIT 20;


Success. No rows returned





-- ============================================================================
-- DIAGNÓSTICO CONSOLIDADO
-- ============================================================================

-- Verificar se há padrão de campos que NÃO salvam vs campos que salvam
SELECT 
    'CAMPOS DE VALORES' as categoria,
    COUNT(*) FILTER (WHERE column_name ILIKE '%preco%' OR column_name ILIKE '%custo%' OR column_name ILIKE '%margem%') as total_campos,
    COUNT(*) FILTER (WHERE column_name ILIKE '%preco%real%' OR column_name ILIKE '%preco%final%') as campos_editaveis
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'pedidos'
UNION ALL
SELECT 
    'CAMPOS DE DATAS' as categoria,
    COUNT(*) FILTER (WHERE column_name ILIKE '%data%'),
    COUNT(*) FILTER (WHERE column_name ILIKE '%data%entrega%' OR column_name ILIKE '%data%previsao%')
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'pedidos'
UNION ALL
SELECT 
    'CAMPOS DE TEXTO' as categoria,
    COUNT(*) FILTER (WHERE column_name ILIKE '%numero%' OR column_name ILIKE '%observ%'),
    COUNT(*) FILTER (WHERE column_name = 'numero_pedido_laboratorio')
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'pedidos';

| categoria         | total_campos | campos_editaveis |
| ----------------- | ------------ | ---------------- |
| CAMPOS DE VALORES | 19           | 3                |
| CAMPOS DE DATAS   | 15           | 1                |
| CAMPOS DE TEXTO   | 8            | 1                |


-- ============================================================================
-- QUERIES PARA VERIFICAR SE PROBLEMA É NO FRONTEND OU BACKEND
-- ============================================================================

-- Verificar últimas 10 atualizações na tabela pedidos
SELECT 
    id,
    numero_sequencial,
    cliente_nome,
    numero_pedido_laboratorio,
    preco_lente,
    custo_lente,
    margem_lente_percentual,
    data_previsao_entrega,
    data_prevista_pronto,
    created_at,
    updated_at,
    updated_by
FROM pedidos
WHERE updated_at > NOW() - INTERVAL '7 days'
ORDER BY updated_at DESC
LIMIT 10;


| id                                   | numero_sequencial | cliente_nome                  | numero_pedido_laboratorio | preco_lente | custo_lente | margem_lente_percentual | data_previsao_entrega | data_prevista_pronto | created_at                    | updated_at                    | updated_by                           |
| ------------------------------------ | ----------------- | ----------------------------- | ------------------------- | ----------- | ----------- | ----------------------- | --------------------- | -------------------- | ----------------------------- | ----------------------------- | ------------------------------------ |
| a595e5d3-8fbf-4df5-8e0b-5be8ddee9d1b | 752               | JOÃO FELIPE PREIRA IRENTE     | 736160                    | 290.00      | 18.50       | 93.62                   | null                  | 2026-02-13           | 2026-01-26 19:26:00.686636+00 | 2026-01-26 19:27:43.514857+00 | 6ef1c92e-88bb-4777-a917-5c21ad567877 |
| d50ba831-e23c-4780-85c1-55c03cf1d2b3 | 662               | MARINA HARUKO SATO TASATO     | 12644STYLE                | null        | null        | null                    | null                  | 2026-02-19           | 2026-01-13 20:06:45.720055+00 | 2026-01-26 17:38:18.185573+00 | null                                 |
| 51a93e51-6794-43e8-8faa-0504acb88e31 | 729               | JAQUELINE DE OLIVEIRA RIBEIRO | null                      | 189.00      | 18.50       | 90.21                   | null                  | null                 | 2026-01-23 20:55:13.813232+00 | 2026-01-26 17:37:48.17634+00  | null                                 |
| 3f70ae84-a69f-4891-b02b-603b2078802b | 727               | CAIMÁ BELGES BARROZIN         | null                      | 550.00      | 28.00       | 94.91                   | null                  | null                 | 2026-01-23 20:47:11.606485+00 | 2026-01-26 17:15:26.594208+00 | d1b1d10e-622c-43c1-9a8b-bd087c877e50 |
| 72560745-974e-4c1e-9f92-66b24cf1eab9 | 724               | RONIÉLIA DA SILVA             | null                      | 130.00      | 16.00       | 87.69                   | null                  | 2026-02-02           | 2026-01-23 19:59:45.157578+00 | 2026-01-26 16:42:51.223137+00 | d1b1d10e-622c-43c1-9a8b-bd087c877e50 |
| 653f49f6-a37f-445d-ae69-2d5fa130e43f | 723               | RONIÉLIA DA SILVA             | null                      | 500.00      | 18.00       | 96.40                   | null                  | 2026-02-02           | 2026-01-23 19:56:55.894894+00 | 2026-01-26 16:41:42.37633+00  | d1b1d10e-622c-43c1-9a8b-bd087c877e50 |
| cc905350-2cd3-4a91-ac59-d02cb0b37abd | 750               | BEATRIZ DA SILVA LEITE        | null                      | null        | null        | null                    | null                  | null                 | 2026-01-26 15:19:04.712557+00 | 2026-01-26 16:13:49.897131+00 | 6ef1c92e-88bb-4777-a917-5c21ad567877 |
| 73bb0d6f-2ce6-411e-940a-7d6bf4d47e66 | 709               | PRISCILA NAVES DE FREITAS     | #179915                   | 276.00      | 18.00       | 93.48                   | null                  | 2026-02-06           | 2026-01-23 16:22:04.765585+00 | 2026-01-26 16:08:11.202362+00 | d1b1d10e-622c-43c1-9a8b-bd087c877e50 |
| 6fdb38dc-a7c1-48d0-97fd-8319ce520973 | 751               | PRISCILA NAVES DE REITAS      | #179915                   | 345.00      | 18.00       | 94.78                   | null                  | 2026-02-06           | 2026-01-26 15:27:58.550618+00 | 2026-01-26 16:07:42.957158+00 | d1b1d10e-622c-43c1-9a8b-bd087c877e50 |
| 2e7f5bb1-d6d6-4bfe-9733-f152fc3cc584 | 506               | JOSE PLACIDO DA SILVA         | 727230                    | null        | null        | null                    | null                  | 2025-12-24           | 2025-12-13 20:34:48.427725+00 | 2026-01-26 15:17:30.411911+00 | 6ef1c92e-88bb-4777-a917-5c21ad567877 |


-- ANÁLISE: 
-- - Se updated_at mudou mas campos continuam NULL → trigger está sobrescrevendo
-- - Se updated_at NÃO mudou → UPDATE não está chegando no banco
-- - Se updated_by está preenchido → verificar qual usuário/sistema está fazendo update


-- ============================================================================
-- RECOMENDAÇÕES PARA CORREÇÃO
-- ============================================================================

/*
📋 CHECKLIST DE INVESTIGAÇÃO:

PROBLEMA 1 - Valores com Desconto:
□ Verificar se campos servico_preco_real, preco_armacao existem
□ Verificar trigger calcular_margem_lente - pode estar sobrescrevendo
□ Verificar se UPDATE funciona direto no banco
□ Verificar log de aplicação frontend (console.log dos valores enviados)

PROBLEMA 2 - Número Pedido Laboratório:
□ Verificar se campo numero_pedido_laboratorio existe
□ Verificar RLS policies para UPDATE
□ Verificar se formulário frontend envia o campo
□ Testar UPDATE direto no banco

PROBLEMA 3 - Data Entrega:
□ Verificar qual campo é o editável (data_previsao_entrega?)
□ Verificar trigger calcular_sla - pode estar recalculando automaticamente
□ Verificar se função calcular_datas_pos_pagamento sobrescreve
□ Testar UPDATE direto no banco

PRÓXIMOS PASSOS:
1. Executar queries acima e documentar resultados
2. Identificar se problema é trigger/função automática
3. Criar script de correção desabilitando triggers problemáticos
4. Testar salvamento após correção
*/

-- ============================================================================
-- FIM DA INVESTIGAÇÃO
-- ============================================================================
-- Execute as queries acima em ordem e documente os resultados
-- Foco principal: TRIGGERS que podem estar sobrescrevendo valores editados
