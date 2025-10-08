-- 🎮 SETUP COMPLETO DO MISSION CONTROL - Desenrola DCL
-- Execute este arquivo no SQL Editor do Supabase
-- Data: 08/10/2025

-- ========================================
-- 1. TABELAS DE GAMIFICAÇÃO
-- ========================================

-- Tabela principal de gamificação por loja
CREATE TABLE IF NOT EXISTS lojas_gamificacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
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

-- Tabela de pontuação diária
CREATE TABLE IF NOT EXISTS pontuacao_diaria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
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

-- Tabela de badges/conquistas
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
-- 2. TABELA DE MISSÕES
-- ========================================

CREATE TABLE IF NOT EXISTS missoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'DIARIA' CHECK (tipo IN ('DIARIA', 'SEMANAL', 'MENSAL', 'ESPECIAL')),
  prioridade TEXT NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativa', 'concluida', 'cancelada')),
  pontos_total INTEGER NOT NULL DEFAULT 50,
  pontos_conquistados INTEGER NOT NULL DEFAULT 0,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento DATE NOT NULL,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  progresso_percentual DECIMAL(5,2) NOT NULL DEFAULT 0,
  meta_pedidos INTEGER,
  pedidos_completados INTEGER DEFAULT 0,
  observacoes TEXT,
  criado_por UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de missões
CREATE TABLE IF NOT EXISTS missoes_historico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  missao_id UUID NOT NULL REFERENCES missoes(id) ON DELETE CASCADE,
  loja_id UUID NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  pontos_anteriores INTEGER,
  pontos_novos INTEGER,
  observacao TEXT,
  alterado_por UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. ÍNDICES PARA PERFORMANCE
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

-- Índices para missoes
CREATE INDEX IF NOT EXISTS idx_missoes_loja_id ON missoes(loja_id);
CREATE INDEX IF NOT EXISTS idx_missoes_status ON missoes(status);
CREATE INDEX IF NOT EXISTS idx_missoes_data_vencimento ON missoes(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_missoes_tipo ON missoes(tipo);

-- Índices para missoes_historico
CREATE INDEX IF NOT EXISTS idx_missoes_historico_missao_id ON missoes_historico(missao_id);
CREATE INDEX IF NOT EXISTS idx_missoes_historico_loja_id ON missoes_historico(loja_id);
CREATE INDEX IF NOT EXISTS idx_missoes_historico_created_at ON missoes_historico(created_at DESC);

-- ========================================
-- 4. TRIGGERS PARA UPDATED_AT
-- ========================================

-- Função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_lojas_gamificacao_updated_at ON lojas_gamificacao;
CREATE TRIGGER update_lojas_gamificacao_updated_at 
  BEFORE UPDATE ON lojas_gamificacao 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pontuacao_diaria_updated_at ON pontuacao_diaria;
CREATE TRIGGER update_pontuacao_diaria_updated_at 
  BEFORE UPDATE ON pontuacao_diaria 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_missoes_updated_at ON missoes;
CREATE TRIGGER update_missoes_updated_at 
  BEFORE UPDATE ON missoes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 5. TRIGGER PARA HISTÓRICO DE MISSÕES
-- ========================================

CREATE OR REPLACE FUNCTION registrar_historico_missao()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar mudança de status
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO missoes_historico (
      missao_id, loja_id, status_anterior, status_novo, 
      pontos_anteriores, pontos_novos, observacao
    ) VALUES (
      NEW.id, NEW.loja_id, OLD.status, NEW.status,
      OLD.pontos_conquistados, NEW.pontos_conquistados,
      'Status alterado de ' || OLD.status || ' para ' || NEW.status
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

DROP TRIGGER IF EXISTS trigger_missoes_historico ON missoes;
CREATE TRIGGER trigger_missoes_historico
  AFTER UPDATE ON missoes
  FOR EACH ROW
  EXECUTE FUNCTION registrar_historico_missao();

-- ========================================
-- 6. VIEW PARA MISSÕES COM TIMELINE
-- ========================================

CREATE OR REPLACE VIEW v_missoes_timeline AS
SELECT 
  m.id,
  m.loja_id,
  l.nome as loja_nome,
  m.titulo,
  m.descricao,
  m.tipo,
  m.prioridade,
  m.status,
  m.pontos_total,
  m.pontos_conquistados,
  m.data_inicio,
  m.data_vencimento,
  m.data_conclusao,
  m.progresso_percentual,
  m.meta_pedidos,
  m.pedidos_completados,
  m.data_inicio as data_missao, -- Alias para compatibilidade
  m.created_at,
  m.updated_at,
  -- Campos calculados
  CASE 
    WHEN m.data_vencimento < CURRENT_DATE AND m.status != 'concluida' THEN 'ATRASADA'
    WHEN m.data_vencimento = CURRENT_DATE AND m.status != 'concluida' THEN 'VENCE_HOJE'
    WHEN m.status = 'concluida' THEN 'OK'
    ELSE 'NO_PRAZO'
  END as situacao_prazo,
  CASE
    WHEN m.data_vencimento < CURRENT_DATE THEN CURRENT_DATE - m.data_vencimento
    ELSE 0
  END as dias_atraso,
  m.data_vencimento - CURRENT_DATE as dias_restantes
FROM missoes m
INNER JOIN lojas l ON l.id = m.loja_id
WHERE l.ativo = true;

-- ========================================
-- 7. POLÍTICAS RLS (Row Level Security)
-- ========================================

-- Habilitar RLS
ALTER TABLE lojas_gamificacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE pontuacao_diaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE missoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE missoes_historico ENABLE ROW LEVEL SECURITY;

-- Políticas para lojas_gamificacao
DROP POLICY IF EXISTS "Permitir SELECT para authenticated" ON lojas_gamificacao;
CREATE POLICY "Permitir SELECT para authenticated" ON lojas_gamificacao
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir INSERT para authenticated" ON lojas_gamificacao;
CREATE POLICY "Permitir INSERT para authenticated" ON lojas_gamificacao
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir UPDATE para authenticated" ON lojas_gamificacao;
CREATE POLICY "Permitir UPDATE para authenticated" ON lojas_gamificacao
  FOR UPDATE TO authenticated USING (true);

-- Políticas para pontuacao_diaria
DROP POLICY IF EXISTS "Permitir SELECT para authenticated" ON pontuacao_diaria;
CREATE POLICY "Permitir SELECT para authenticated" ON pontuacao_diaria
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir INSERT para authenticated" ON pontuacao_diaria;
CREATE POLICY "Permitir INSERT para authenticated" ON pontuacao_diaria
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir UPDATE para authenticated" ON pontuacao_diaria;
CREATE POLICY "Permitir UPDATE para authenticated" ON pontuacao_diaria
  FOR UPDATE TO authenticated USING (true);

-- Políticas para badges (somente leitura)
DROP POLICY IF EXISTS "Permitir SELECT para todos" ON badges;
CREATE POLICY "Permitir SELECT para todos" ON badges
  FOR SELECT TO authenticated USING (true);

-- Políticas para missoes
DROP POLICY IF EXISTS "Permitir SELECT para authenticated" ON missoes;
CREATE POLICY "Permitir SELECT para authenticated" ON missoes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir INSERT para authenticated" ON missoes;
CREATE POLICY "Permitir INSERT para authenticated" ON missoes
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir UPDATE para authenticated" ON missoes;
CREATE POLICY "Permitir UPDATE para authenticated" ON missoes
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir DELETE para authenticated" ON missoes;
CREATE POLICY "Permitir DELETE para authenticated" ON missoes
  FOR DELETE TO authenticated USING (true);

-- Políticas para missoes_historico (somente leitura e inserção automática)
DROP POLICY IF EXISTS "Permitir SELECT para authenticated" ON missoes_historico;
CREATE POLICY "Permitir SELECT para authenticated" ON missoes_historico
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir INSERT para authenticated" ON missoes_historico;
CREATE POLICY "Permitir INSERT para authenticated" ON missoes_historico
  FOR INSERT TO authenticated WITH CHECK (true);

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
('PERFEITO', 'Dia Perfeito', '100% de eficiência em um dia', '✨', '#4CAF50', 100, 'RARO'),
('MISSAO_10', '10 Missões', 'Complete 10 missões', '🎯', '#2196F3', 500, 'COMUM'),
('MISSAO_50', '50 Missões', 'Complete 50 missões', '🚀', '#673AB7', 2500, 'RARO'),
('MISSAO_100', '100 Missões', 'Complete 100 missões', '👑', '#F44336', 5000, 'EPICO')
ON CONFLICT (tipo) DO NOTHING;

-- ========================================
-- 9. INICIALIZAR GAMIFICAÇÃO PARA LOJAS
-- ========================================

-- Criar registro de gamificação para todas as lojas ativas
INSERT INTO lojas_gamificacao (loja_id, liga_atual, pontos_mes_atual, pontos_total)
SELECT 
  id, 
  'BRONZE', 
  0, 
  0
FROM lojas 
WHERE ativo = true
ON CONFLICT (loja_id) DO NOTHING;

-- ========================================
-- 10. CRIAR MISSÕES DIÁRIAS AUTOMÁTICAS
-- ========================================

-- Função para criar missões diárias automaticamente
CREATE OR REPLACE FUNCTION criar_missoes_diarias()
RETURNS void AS $$
DECLARE
  v_loja RECORD;
  v_hoje DATE := CURRENT_DATE;
BEGIN
  -- Para cada loja ativa
  FOR v_loja IN SELECT id, nome FROM lojas WHERE ativo = true LOOP
    
    -- Missão 1: Processar pedidos AG_PAGAMENTO
    INSERT INTO missoes (
      loja_id, titulo, descricao, tipo, prioridade, 
      data_vencimento, pontos_total, meta_pedidos
    ) VALUES (
      v_loja.id,
      'Processar Pedidos Aguardando Pagamento',
      'Avançar todos os pedidos em AG_PAGAMENTO para PAGO',
      'DIARIA',
      'alta',
      v_hoje,
      100,
      (SELECT COUNT(*) FROM pedidos WHERE loja_id = v_loja.id AND status = 'AG_PAGAMENTO')
    )
    ON CONFLICT DO NOTHING;
    
    -- Missão 2: Enviar pedidos prontos
    INSERT INTO missoes (
      loja_id, titulo, descricao, tipo, prioridade,
      data_vencimento, pontos_total, meta_pedidos
    ) VALUES (
      v_loja.id,
      'Enviar Pedidos Prontos',
      'Enviar todos os pedidos com status PRONTO',
      'DIARIA',
      'media',
      v_hoje,
      75,
      (SELECT COUNT(*) FROM pedidos WHERE loja_id = v_loja.id AND status = 'PRONTO')
    )
    ON CONFLICT DO NOTHING;
    
    -- Missão 3: Finalizar entregas
    INSERT INTO missoes (
      loja_id, titulo, descricao, tipo, prioridade,
      data_vencimento, pontos_total, meta_pedidos
    ) VALUES (
      v_loja.id,
      'Confirmar Entregas',
      'Confirmar recebimento de todos os pedidos CHEGOU',
      'DIARIA',
      'media',
      v_hoje,
      50,
      (SELECT COUNT(*) FROM pedidos WHERE loja_id = v_loja.id AND status = 'CHEGOU')
    )
    ON CONFLICT DO NOTHING;
    
  END LOOP;
  
  RAISE NOTICE 'Missões diárias criadas com sucesso!';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executar criação de missões para hoje
SELECT criar_missoes_diarias();

-- ========================================
-- ✅ VERIFICAÇÃO FINAL
-- ========================================

DO $$
DECLARE
  v_lojas_count INTEGER;
  v_gamificacao_count INTEGER;
  v_missoes_count INTEGER;
  v_badges_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_lojas_count FROM lojas WHERE ativo = true;
  SELECT COUNT(*) INTO v_gamificacao_count FROM lojas_gamificacao;
  SELECT COUNT(*) INTO v_missoes_count FROM missoes WHERE data_vencimento = CURRENT_DATE;
  SELECT COUNT(*) INTO v_badges_count FROM badges;
  
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '✅ SETUP DO MISSION CONTROL COMPLETO!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Estatísticas:';
  RAISE NOTICE '   - Lojas ativas: %', v_lojas_count;
  RAISE NOTICE '   - Registros gamificação: %', v_gamificacao_count;
  RAISE NOTICE '   - Missões criadas hoje: %', v_missoes_count;
  RAISE NOTICE '   - Badges disponíveis: %', v_badges_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎮 Sistema pronto para uso!';
  RAISE NOTICE '============================================================';
END $$;
