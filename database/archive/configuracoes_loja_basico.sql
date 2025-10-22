-- 🕐 SISTEMA DE HORÁRIOS E AÇÕES POR LOJA - VERSÃO BÁSICA
-- Execute este SQL primeiro (sem dependência de missao_templates)

-- ========================================
-- 1. TABELA DE CONFIGURAÇÕES DE HORÁRIO
-- ========================================

CREATE TABLE IF NOT EXISTS loja_configuracoes_horario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID NOT NULL,
  -- Horários de funcionamento
  hora_abertura TIME NOT NULL DEFAULT '08:00',
  hora_fechamento TIME NOT NULL DEFAULT '18:00',
  -- Horários específicos para ações
  hora_limite_missoes TIME NOT NULL DEFAULT '17:00',
  hora_renovacao_sistema TIME NOT NULL DEFAULT '20:00',
  -- Configurações de prazo
  prazo_padrao_horas INTEGER NOT NULL DEFAULT 8,
  permite_execucao_apos_horario BOOLEAN NOT NULL DEFAULT false,
  -- Dias da semana ativos
  segunda_ativa BOOLEAN NOT NULL DEFAULT true,
  terca_ativa BOOLEAN NOT NULL DEFAULT true,
  quarta_ativa BOOLEAN NOT NULL DEFAULT true,
  quinta_ativa BOOLEAN NOT NULL DEFAULT true,
  sexta_ativa BOOLEAN NOT NULL DEFAULT true,
  sabado_ativa BOOLEAN NOT NULL DEFAULT false,
  domingo_ativa BOOLEAN NOT NULL DEFAULT false,
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(loja_id)
);

-- ========================================
-- 2. TABELA DE AÇÕES CUSTOMIZADAS POR LOJA
-- ========================================

CREATE TABLE IF NOT EXISTS loja_acoes_customizadas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID NOT NULL,
  template_id UUID NOT NULL,
  -- Configurações específicas da ação para esta loja
  ativa BOOLEAN NOT NULL DEFAULT true,
  prioridade INTEGER NOT NULL DEFAULT 1,
  horario_especifico TIME,
  prazo_customizado_horas INTEGER,
  pontos_customizados INTEGER,
  obrigatoria BOOLEAN NOT NULL DEFAULT false,
  -- Condições especiais
  dias_semana TEXT[] DEFAULT ARRAY['seg','ter','qua','qui','sex'],
  condicoes_especiais JSONB DEFAULT '{}',
  -- Configurações de execução
  permite_delegacao BOOLEAN NOT NULL DEFAULT true,
  requer_evidencia BOOLEAN NOT NULL DEFAULT false,
  requer_justificativa_se_nao_feita BOOLEAN NOT NULL DEFAULT false,
  -- Auditoria
  configurada_por UUID,
  configurada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(loja_id, template_id)
);

-- ========================================
-- 3. TABELA DE TEMPLATES SIMPLES (CRIAR)
-- ========================================

CREATE TABLE IF NOT EXISTS missao_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT DEFAULT 'operacional',
  pontos_base INTEGER NOT NULL DEFAULT 10,
  ativo BOOLEAN NOT NULL DEFAULT true,
  -- Campos para customização por loja
  permite_customizacao_loja BOOLEAN DEFAULT true,
  categoria_configuracao TEXT DEFAULT 'operacional',
  horario_sugerido TIME,
  dias_semana_padrao TEXT[] DEFAULT ARRAY['seg','ter','qua','qui','sex'],
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. INSERIR TEMPLATES BÁSICOS
-- ========================================

INSERT INTO missao_templates (nome, descricao, categoria, pontos_base, horario_sugerido) VALUES
('Abertura da Loja', 'Verificar abertura e organização inicial', 'operacional', 5, '08:30'),
('Fechamento da Loja', 'Verificar fechamento e segurança', 'operacional', 5, '17:30'),
('Vendas do Dia', 'Verificar meta de vendas', 'vendas', 15, '16:00'),
('Atendimento ao Cliente', 'Avaliar qualidade do atendimento', 'atendimento', 10, '15:00'),
('Organização do Estoque', 'Verificar organização do estoque', 'estoque', 8, '09:00')
ON CONFLICT DO NOTHING;

-- ========================================
-- 5. FUNÇÃO BÁSICA PARA CONFIGURAÇÕES
-- ========================================

CREATE OR REPLACE FUNCTION criar_configuracoes_basicas()
RETURNS TEXT AS $$
DECLARE
  loja_record RECORD;
  template_record RECORD;
  contador INTEGER := 0;
BEGIN
  -- Para cada loja ativa, criar configuração padrão
  FOR loja_record IN SELECT id, nome FROM lojas WHERE ativo = true
  LOOP
    -- Inserir configuração padrão se não existir
    INSERT INTO loja_configuracoes_horario (loja_id)
    VALUES (loja_record.id)
    ON CONFLICT (loja_id) DO NOTHING;
    
    -- Inserir algumas ações padrão
    FOR template_record IN SELECT id FROM missao_templates WHERE ativo = true LIMIT 3
    LOOP
      INSERT INTO loja_acoes_customizadas (loja_id, template_id, ativa)
      VALUES (loja_record.id, template_record.id, true)
      ON CONFLICT (loja_id, template_id) DO NOTHING;
      
      contador := contador + 1;
    END LOOP;
  END LOOP;
  
  RETURN FORMAT('Configurações criadas para lojas. Total de ações: %s', contador);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. FUNÇÃO PARA AUDITORIA (UPDATE_AT)
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_loja_configuracoes_horario_loja ON loja_configuracoes_horario(loja_id);
CREATE INDEX IF NOT EXISTS idx_loja_acoes_customizadas_loja ON loja_acoes_customizadas(loja_id);
CREATE INDEX IF NOT EXISTS idx_loja_acoes_customizadas_template ON loja_acoes_customizadas(template_id);
CREATE INDEX IF NOT EXISTS idx_loja_acoes_customizadas_ativa ON loja_acoes_customizadas(ativa);
CREATE INDEX IF NOT EXISTS idx_missao_templates_ativo ON missao_templates(ativo);

-- ========================================
-- 8. TRIGGERS PARA AUDITORIA
-- ========================================

DROP TRIGGER IF EXISTS update_loja_configuracoes_horario_updated_at ON loja_configuracoes_horario;
CREATE TRIGGER update_loja_configuracoes_horario_updated_at 
  BEFORE UPDATE ON loja_configuracoes_horario 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_loja_acoes_customizadas_updated_at ON loja_acoes_customizadas;
CREATE TRIGGER update_loja_acoes_customizadas_updated_at 
  BEFORE UPDATE ON loja_acoes_customizadas 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_missao_templates_updated_at ON missao_templates;
CREATE TRIGGER update_missao_templates_updated_at 
  BEFORE UPDATE ON missao_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 9. EXECUTAR CONFIGURAÇÃO AUTOMÁTICA
-- ========================================

SELECT criar_configuracoes_basicas() as resultado;

-- ========================================
-- ✅ VERIFICAÇÃO FINAL
-- ========================================

SELECT 'Sistema básico de configurações criado! 🕐⚙️' as status;