-- 🇧🇷 SISTEMA DE RENOVAÇÃO DIÁRIA - TIMEZONE BRASIL
-- Renovação automática às 20:00 (horário de Brasília)
-- Controle de missões e manutenção de histórico

-- ========================================
-- 1. CONFIGURAÇÃO DE TIMEZONE
-- ========================================

-- Definir timezone padrão para o Brasil
SET timezone TO 'America/Sao_Paulo';

-- Função para obter data/hora atual no Brasil
CREATE OR REPLACE FUNCTION brasil_now() 
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
  RETURN NOW() AT TIME ZONE 'America/Sao_Paulo';
END;
$$ LANGUAGE plpgsql;

-- Função para obter data brasileira (sem hora)
CREATE OR REPLACE FUNCTION brasil_today() 
RETURNS DATE AS $$
BEGIN
  RETURN (NOW() AT TIME ZONE 'America/Sao_Paulo')::DATE;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 2. TABELA DE CONTROLE DE RENOVAÇÃO
-- ========================================

CREATE TABLE IF NOT EXISTS renovacao_diaria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data_renovacao DATE NOT NULL,
  hora_renovacao TIMESTAMP WITH TIME ZONE NOT NULL,
  total_lojas_processadas INTEGER NOT NULL DEFAULT 0,
  total_missoes_limpas INTEGER NOT NULL DEFAULT 0,
  total_pontuacoes_calculadas INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'PROCESSANDO', 'CONCLUIDO', 'ERRO')),
  detalhes_erro TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT brasil_now(),
  UNIQUE(data_renovacao)
);

-- ========================================
-- 3. FUNÇÃO DE RENOVAÇÃO DIÁRIA
-- ========================================

CREATE OR REPLACE FUNCTION executar_renovacao_diaria()
RETURNS TABLE(
  status TEXT,
  lojas_processadas INTEGER,
  missoes_limpas INTEGER,
  pontuacoes_calculadas INTEGER,
  detalhes TEXT
) AS $$
DECLARE
  v_data_hoje DATE;
  v_data_ontem DATE;
  v_lojas_processadas INTEGER := 0;
  v_missoes_limpas INTEGER := 0;
  v_pontuacoes_calculadas INTEGER := 0;
  v_loja_id UUID;
  v_renovacao_id UUID;
BEGIN
  -- Obter datas no fuso brasileiro
  v_data_hoje := brasil_today();
  v_data_ontem := v_data_hoje - INTERVAL '1 day';
  
  -- Verificar se já foi processado hoje
  IF EXISTS (SELECT 1 FROM renovacao_diaria WHERE data_renovacao = v_data_hoje) THEN
    RETURN QUERY SELECT 
      'JA_PROCESSADO'::TEXT,
      0::INTEGER,
      0::INTEGER, 
      0::INTEGER,
      'Renovação já executada hoje'::TEXT;
    RETURN;
  END IF;
  
  -- Iniciar processo de renovação
  INSERT INTO renovacao_diaria (
    data_renovacao, 
    hora_renovacao, 
    status
  ) VALUES (
    v_data_hoje, 
    brasil_now(), 
    'PROCESSANDO'
  ) RETURNING id INTO v_renovacao_id;
  
  BEGIN
    -- PASSO 1: Calcular pontuação de ontem para todas as lojas
    FOR v_loja_id IN 
      SELECT DISTINCT loja_id FROM v_missoes_timeline 
      WHERE data_missao = v_data_ontem
    LOOP
      -- Calcular e salvar pontuação de ontem
      PERFORM calcular_pontuacao_diaria(v_loja_id, v_data_ontem);
      v_pontuacoes_calculadas := v_pontuacoes_calculadas + 1;
    END LOOP;
    
    -- PASSO 2: Atualizar estatísticas de gamificação
    UPDATE lojas_gamificacao 
    SET 
      -- Calcular streak baseado na pontuação de ontem
      streak_dias = CASE 
        WHEN EXISTS (
          SELECT 1 FROM pontuacao_diaria 
          WHERE loja_id = lojas_gamificacao.loja_id 
            AND data = v_data_ontem 
            AND missoes_completadas > 0
        ) THEN streak_dias + 1
        ELSE 0
      END,
      -- Atualizar maior streak se necessário
      maior_streak = GREATEST(
        maior_streak,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM pontuacao_diaria 
            WHERE loja_id = lojas_gamificacao.loja_id 
              AND data = v_data_ontem 
              AND missoes_completadas > 0
          ) THEN streak_dias + 1
          ELSE streak_dias
        END
      ),
      -- Atualizar liga baseada na performance do mês
      liga_atual = (
        SELECT CASE 
          WHEN AVG(percentual_eficiencia) >= 100 THEN 'DIAMANTE'
          WHEN AVG(percentual_eficiencia) >= 80 THEN 'OURO'
          WHEN AVG(percentual_eficiencia) >= 60 THEN 'PRATA'
          ELSE 'BRONZE'
        END
        FROM pontuacao_diaria 
        WHERE loja_id = lojas_gamificacao.loja_id
          AND data >= DATE_TRUNC('month', v_data_hoje)::DATE
          AND data < v_data_hoje
      ),
      ultima_atividade = brasil_now(),
      updated_at = brasil_now();
    
    GET DIAGNOSTICS v_lojas_processadas = ROW_COUNT;
    
    -- PASSO 3: Limpeza de missões antigas (opcional - manter histórico)
    -- Por enquanto, vamos apenas marcar como "processadas" sem deletar
    -- para manter o histórico completo
    
    -- PASSO 4: Preparar missões do dia atual
    -- (As missões são criadas dinamicamente pelo sistema principal)
    
    -- Finalizar com sucesso
    UPDATE renovacao_diaria 
    SET 
      status = 'CONCLUIDO',
      total_lojas_processadas = v_lojas_processadas,
      total_missoes_limpas = v_missoes_limpas,
      total_pontuacoes_calculadas = v_pontuacoes_calculadas
    WHERE id = v_renovacao_id;
    
    RETURN QUERY SELECT 
      'SUCESSO'::TEXT,
      v_lojas_processadas,
      v_missoes_limpas,
      v_pontuacoes_calculadas,
      FORMAT('Renovação concluída: %s lojas, %s pontuações calculadas', 
             v_lojas_processadas, v_pontuacoes_calculadas)::TEXT;
    
  EXCEPTION WHEN OTHERS THEN
    -- Em caso de erro, registrar e reverter
    UPDATE renovacao_diaria 
    SET 
      status = 'ERRO',
      detalhes_erro = SQLERRM
    WHERE id = v_renovacao_id;
    
    RETURN QUERY SELECT 
      'ERRO'::TEXT,
      0::INTEGER,
      0::INTEGER,
      0::INTEGER,
      SQLERRM::TEXT;
  END;
  
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 4. FUNÇÃO PARA VERIFICAR SE DEVE RENOVAR
-- ========================================

CREATE OR REPLACE FUNCTION deve_executar_renovacao()
RETURNS BOOLEAN AS $$
DECLARE
  v_hora_atual TIME;
  v_data_hoje DATE;
BEGIN
  v_hora_atual := (brasil_now())::TIME;
  v_data_hoje := brasil_today();
  
  -- Verificar se é após 20:00 e ainda não foi processado hoje
  RETURN (
    v_hora_atual >= '20:00:00'::TIME 
    AND NOT EXISTS (
      SELECT 1 FROM renovacao_diaria 
      WHERE data_renovacao = v_data_hoje 
        AND status = 'CONCLUIDO'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. SISTEMA DE CRON JOBS (Para agendar)
-- ========================================

-- Função que pode ser chamada por um cron job externo
CREATE OR REPLACE FUNCTION cron_renovacao_diaria()
RETURNS TEXT AS $$
DECLARE
  v_resultado RECORD;
BEGIN
  -- Verificar se deve executar
  IF NOT deve_executar_renovacao() THEN
    RETURN 'Renovação não necessária no momento';
  END IF;
  
  -- Executar renovação
  SELECT * INTO v_resultado FROM executar_renovacao_diaria() LIMIT 1;
  
  RETURN FORMAT('Status: %s | Lojas: %s | Pontuações: %s | %s', 
                v_resultado.status, 
                v_resultado.lojas_processadas,
                v_resultado.pontuacoes_calculadas,
                v_resultado.detalhes);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. FUNÇÕES DE CONSULTA E MONITORAMENTO
-- ========================================

-- Verificar status da última renovação
CREATE OR REPLACE FUNCTION status_ultima_renovacao()
RETURNS TABLE(
  data_renovacao DATE,
  hora_renovacao TIMESTAMP WITH TIME ZONE,
  status TEXT,
  lojas_processadas INTEGER,
  pontuacoes_calculadas INTEGER,
  tempo_execucao INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.data_renovacao,
    r.hora_renovacao,
    r.status,
    r.total_lojas_processadas,
    r.total_pontuacoes_calculadas,
    CASE 
      WHEN r.status = 'CONCLUIDO' THEN 
        (SELECT created_at FROM renovacao_diaria WHERE id = r.id) - r.hora_renovacao
      ELSE NULL
    END as tempo_execucao
  FROM renovacao_diaria r
  ORDER BY r.data_renovacao DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Verificar próxima renovação
CREATE OR REPLACE FUNCTION proxima_renovacao()
RETURNS TABLE(
  proxima_data DATE,
  proxima_hora TIMESTAMP WITH TIME ZONE,
  deve_executar_agora BOOLEAN,
  tempo_restante INTERVAL
) AS $$
DECLARE
  v_hoje DATE;
  v_proxima_renovacao TIMESTAMP WITH TIME ZONE;
BEGIN
  v_hoje := brasil_today();
  
  -- Se já passou das 20h hoje e não foi processado, é agora
  IF (brasil_now())::TIME >= '20:00:00'::TIME 
     AND NOT EXISTS (SELECT 1 FROM renovacao_diaria WHERE data_renovacao = v_hoje AND status = 'CONCLUIDO') THEN
    v_proxima_renovacao := v_hoje + TIME '20:00:00';
  ELSE
    -- Senão, é amanhã às 20h
    v_proxima_renovacao := (v_hoje + INTERVAL '1 day') + TIME '20:00:00';
  END IF;
  
  RETURN QUERY SELECT
    v_proxima_renovacao::DATE,
    v_proxima_renovacao,
    deve_executar_renovacao(),
    CASE 
      WHEN deve_executar_renovacao() THEN INTERVAL '0'
      ELSE v_proxima_renovacao - brasil_now()
    END;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_renovacao_diaria_data ON renovacao_diaria(data_renovacao DESC);
CREATE INDEX IF NOT EXISTS idx_renovacao_diaria_status ON renovacao_diaria(status);

-- ========================================
-- ✅ SISTEMA DE RENOVAÇÃO CONFIGURADO!
-- ========================================

SELECT 'Sistema de renovação diária configurado! 🇧🇷⏰' as status;