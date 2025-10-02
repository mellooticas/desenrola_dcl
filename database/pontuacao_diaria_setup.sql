-- Tabela de controle diário - DADOS REAIS
-- Execute no SQL Editor do Supabase

-- Tabela para registrar performance diária de cada loja
CREATE TABLE IF NOT EXISTS pontuacao_diaria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID NOT NULL, -- Removendo a referência FK temporariamente
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pontuacao_diaria_loja_data ON pontuacao_diaria(loja_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_pontuacao_diaria_data ON pontuacao_diaria(data DESC);
CREATE INDEX IF NOT EXISTS idx_pontuacao_diaria_liga ON pontuacao_diaria(liga_no_dia);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pontuacao_diaria_updated_at 
  BEFORE UPDATE ON pontuacao_diaria 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular e inserir/atualizar pontuação diária
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

-- ✅ Script simples pronto! Execute no Supabase