-- 🎮 SETUP COMPLETO DE GAMIFICAÇÃO - Desenrola DCL
-- Execute este arquivo no SQL Editor do Supabase
-- ✅ SEM referências FK problemáticas

-- ========================================
-- 1. TABELA DE GAMIFICAÇÃO POR LOJA
-- ========================================

CREATE TABLE IF NOT EXISTS lojas_gamificacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID NOT NULL,
  liga_atual TEXT NOT NULL DEFAULT 'BRONZE' CHECK (liga_atual IN ('BRONZE', 'PRATA', 'OURO', 'DIAMANTE')),
  pontos_mes_atual INTEGER NOT NULL DEFAULT 0,
  pontos_total INTEGER NOT NULL DEFAULT 0,
  streak_dias INTEGER NOT NULL DEFAULT 0,
  maior_streak INTEGER NOT NULL DEFAULT 0,
  badges_conquistadas TEXT[] DEFAULT ARRAY[]::TEXT[],
  ultima_atividade TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  promocoes INTEGER NOT NULL DEFAULT 0,
  rebaixamentos INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(loja_id)
);

-- ========================================
-- 2. TABELA DE PONTUAÇÃO DIÁRIA
-- ========================================

CREATE TABLE IF NOT EXISTS pontuacao_diaria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID NOT NULL,
  data DATE NOT NULL,
  pontos_possiveis INTEGER NOT NULL DEFAULT 0,
  pontos_conquistados INTEGER NOT NULL DEFAULT 0,
  missoes_totais INTEGER NOT NULL DEFAULT 0,
  missoes_completadas INTEGER NOT NULL DEFAULT 0,
  percentual_eficiencia DECIMAL(5,2) NOT NULL DEFAULT 0,
  liga_no_dia TEXT NOT NULL DEFAULT 'BRONZE' CHECK (liga_no_dia IN ('BRONZE', 'PRATA', 'OURO', 'DIAMANTE')),
  streak_dias INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(loja_id, data)
);

-- ========================================
-- 3. TABELA DE BADGES/CONQUISTAS
-- ========================================

CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  icone TEXT NOT NULL,
  cor TEXT NOT NULL,
  pontos_requisito INTEGER NOT NULL DEFAULT 0,
  condicao_especial TEXT,
  raridade TEXT NOT NULL DEFAULT 'COMUM' CHECK (raridade IN ('COMUM', 'RARO', 'EPICO', 'LENDARIO')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. TABELA DE DESAFIOS
-- ========================================

CREATE TABLE IF NOT EXISTS desafios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  meta_pontos INTEGER NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  bonus_multiplicador DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  lojas_participantes UUID[] DEFAULT ARRAY[]::UUID[],
  premiacao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para lojas_gamificacao
CREATE INDEX IF NOT EXISTS idx_lojas_gamificacao_loja_id ON lojas_gamificacao(loja_id);
CREATE INDEX IF NOT EXISTS idx_lojas_gamificacao_liga ON lojas_gamificacao(liga_atual);

-- Índices para pontuacao_diaria
CREATE INDEX IF NOT EXISTS idx_pontuacao_diaria_loja_data ON pontuacao_diaria(loja_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_pontuacao_diaria_data ON pontuacao_diaria(data DESC);
CREATE INDEX IF NOT EXISTS idx_pontuacao_diaria_liga ON pontuacao_diaria(liga_no_dia);

-- Índices para badges
CREATE INDEX IF NOT EXISTS idx_badges_tipo ON badges(tipo);
CREATE INDEX IF NOT EXISTS idx_badges_raridade ON badges(raridade);

-- Índices para desafios
CREATE INDEX IF NOT EXISTS idx_desafios_ativo ON desafios(ativo);
CREATE INDEX IF NOT EXISTS idx_desafios_periodo ON desafios(data_inicio, data_fim);

-- ========================================
-- 6. TRIGGERS PARA UPDATED_AT
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_lojas_gamificacao_updated_at 
  BEFORE UPDATE ON lojas_gamificacao 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pontuacao_diaria_updated_at 
  BEFORE UPDATE ON pontuacao_diaria 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 7. FUNÇÃO PARA CALCULAR PONTUAÇÃO DIÁRIA
-- ========================================

CREATE OR REPLACE FUNCTION calcular_pontuacao_diaria(p_loja_id UUID, p_data DATE)
RETURNS TABLE(
  pontos_possiveis INTEGER,
  pontos_conquistados INTEGER,
  missoes_totais INTEGER,
  missoes_completadas INTEGER,
  percentual_eficiencia DECIMAL(5,2)
) AS $$
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
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. DADOS INICIAIS DE BADGES
-- ========================================

INSERT INTO badges (tipo, nome, descricao, icone, cor, pontos_requisito, raridade) VALUES
('PRIMEIRO_DIA', 'Primeiro Dia', 'Complete sua primeira missão', '🌟', '#FFD700', 50, 'COMUM'),
('STREAK_7', 'Sequência de 7', '7 dias consecutivos ativos', '🔥', '#FF6B35', 500, 'RARO'),
('STREAK_30', 'Mês Completo', '30 dias consecutivos ativos', '💪', '#FF1744', 1500, 'EPICO'),
('LIGA_PRATA', 'Liga Prata', 'Alcance a Liga Prata', '🥈', '#C0C0C0', 1000, 'RARO'),
('LIGA_OURO', 'Liga Ouro', 'Alcance a Liga Ouro', '🥇', '#FFD700', 2000, 'EPICO'),
('LIGA_DIAMANTE', 'Liga Diamante', 'Alcance a Liga Diamante', '💎', '#B9F2FF', 3000, 'LENDARIO'),
('PERFEITO', 'Dia Perfeito', '100% de eficiência em um dia', '✨', '#4CAF50', 100, 'RARO')
ON CONFLICT (tipo) DO NOTHING;

-- ========================================
-- ✅ SETUP COMPLETO! 
-- ========================================

-- Mensagem de sucesso
SELECT 'Gamificação setup completo! 🎮🏆' as status;