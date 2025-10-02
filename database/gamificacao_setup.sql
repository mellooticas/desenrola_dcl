-- Gamificação - Criação das tabelas necessárias
-- Execute no SQL Editor do Supabase

-- 1. Tabela de gamificação por loja
CREATE TABLE IF NOT EXISTS lojas_gamificacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID NOT NULL, -- Removendo a referência FK temporariamente
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

-- 2. Tabela de badges/conquistas
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

-- 3. Tabela de desafios
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

-- 4. Tabela de participação em desafios
CREATE TABLE IF NOT EXISTS desafios_participacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  desafio_id UUID NOT NULL REFERENCES desafios(id) ON DELETE CASCADE,
  loja_id UUID NOT NULL, -- Removendo a referência FK temporariamente
  pontos_conquistados INTEGER NOT NULL DEFAULT 0,
  meta_atingida BOOLEAN NOT NULL DEFAULT false,
  posicao_final INTEGER,
  bonus_recebido INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(desafio_id, loja_id)
);

-- 5. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lojas_gamificacao_updated_at 
  BEFORE UPDATE ON lojas_gamificacao 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Inserir badges padrão 
INSERT INTO badges (tipo, nome, descricao, icone, cor, pontos_requisito, raridade) VALUES
('PRIMEIRA_MISSAO', 'Primeira Missão', 'Complete sua primeira missão', '🎯', '#10B981', 0, 'COMUM'),
('STREAK_7_DIAS', 'Sequência de 7 Dias', 'Complete missões por 7 dias consecutivos', '🔥', '#F59E0B', 0, 'RARO'),
('STREAK_30_DIAS', 'Sequência de 30 Dias', 'Complete missões por 30 dias consecutivos', '🌟', '#8B5CF6', 0, 'EPICO'),
('PONTUACAO_100', 'Centena', 'Alcance 100 pontos', '💯', '#3B82F6', 100, 'COMUM'),
('PONTUACAO_500', 'Quinhentos', 'Alcance 500 pontos', '🚀', '#8B5CF6', 500, 'RARO'),
('PONTUACAO_1000', 'Mil', 'Alcance 1000 pontos', '👑', '#F59E0B', 1000, 'EPICO'),
('MISSOES_PERFEITAS_10', '10 Perfeitas', 'Complete 10 missões com nota máxima', '⭐', '#10B981', 0, 'RARO'),
('MISSOES_PERFEITAS_50', '50 Perfeitas', 'Complete 50 missões com nota máxima', '🌟', '#8B5CF6', 0, 'EPICO'),
('CAMPEAO_SEMANAL', 'Campeão Semanal', 'Seja o primeiro colocado da semana', '🏆', '#FFD700', 0, 'LENDARIO'),
('CAMPEAO_MENSAL', 'Campeão Mensal', 'Seja o primeiro colocado do mês', '👑', '#FFD700', 0, 'LENDARIO'),
('SUBIU_LIGA', 'Subiu de Liga', 'Promovido para uma liga superior', '📈', '#10B981', 0, 'RARO'),
('LIDER_EQUIPE', 'Líder da Equipe', 'Mantenha sua loja em primeiro lugar', '🎖️', '#8B5CF6', 0, 'EPICO')
ON CONFLICT (tipo) DO NOTHING;

-- 7. Função para calcular promoção/rebaixamento de liga
CREATE OR REPLACE FUNCTION calcular_liga(pontos_mes INTEGER)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- 8. Trigger para atualizar liga automaticamente
CREATE OR REPLACE FUNCTION atualizar_liga_automatica()
RETURNS TRIGGER AS $$
DECLARE
  nova_liga TEXT;
BEGIN
  nova_liga := calcular_liga(NEW.pontos_mes_atual);
  
  IF nova_liga != NEW.liga_atual THEN
    NEW.liga_atual := nova_liga;
    
    -- Contar promoções/rebaixamentos
    IF nova_liga > OLD.liga_atual THEN
      NEW.promocoes := NEW.promocoes + 1;
    ELSIF nova_liga < OLD.liga_atual THEN  
      NEW.rebaixamentos := NEW.rebaixamentos + 1;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_liga 
  BEFORE UPDATE ON lojas_gamificacao 
  FOR EACH ROW 
  WHEN (OLD.pontos_mes_atual IS DISTINCT FROM NEW.pontos_mes_atual)
  EXECUTE FUNCTION atualizar_liga_automatica();

-- 9. RLS (Row Level Security) - Opcional
-- Remova os comentários se quiser ativar segurança por linha
-- ALTER TABLE lojas_gamificacao ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE desafios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE desafios_participacao ENABLE ROW LEVEL SECURITY;

-- 10. Índices para performance
CREATE INDEX IF NOT EXISTS idx_lojas_gamificacao_loja_id ON lojas_gamificacao(loja_id);
CREATE INDEX IF NOT EXISTS idx_lojas_gamificacao_liga ON lojas_gamificacao(liga_atual);
CREATE INDEX IF NOT EXISTS idx_lojas_gamificacao_pontos_mes ON lojas_gamificacao(pontos_mes_atual DESC);
CREATE INDEX IF NOT EXISTS idx_badges_tipo ON badges(tipo);
CREATE INDEX IF NOT EXISTS idx_desafios_ativo ON desafios(ativo);
CREATE INDEX IF NOT EXISTS idx_desafios_data ON desafios(data_inicio, data_fim);

-- ✅ Script completo! Execute tudo de uma vez no Supabase SQL Editor