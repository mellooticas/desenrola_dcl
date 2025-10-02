-- 🏗️ Criação das Estruturas Básicas - Sistema de Configurações
-- Execute este SQL no Supabase SQL Editor

-- 1. TABELA DE CONFIGURAÇÕES DE HORÁRIO
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

-- 2. TABELA DE AÇÕES CUSTOMIZADAS POR LOJA
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

-- 3. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_loja_configuracoes_horario_loja ON loja_configuracoes_horario(loja_id);
CREATE INDEX IF NOT EXISTS idx_loja_acoes_customizadas_loja ON loja_acoes_customizadas(loja_id);
CREATE INDEX IF NOT EXISTS idx_loja_acoes_customizadas_template ON loja_acoes_customizadas(template_id);
CREATE INDEX IF NOT EXISTS idx_loja_acoes_customizadas_ativa ON loja_acoes_customizadas(ativa);

-- 4. VERIFICAR SE DEU CERTO
SELECT 'Tabelas criadas com sucesso!' as status;