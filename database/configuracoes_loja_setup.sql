-- 🕐 SISTEMA DE HORÁRIOS E AÇÕES POR LOJA
-- Configuração flexível via interface admin

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
  hora_limite_missoes TIME NOT NULL DEFAULT '17:00', -- Deadline das missões
  hora_renovacao_sistema TIME NOT NULL DEFAULT '20:00', -- Quando renova (customizável)
  -- Configurações de prazo
  prazo_padrao_horas INTEGER NOT NULL DEFAULT 8, -- Prazo padrão para missões
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
  template_id UUID NOT NULL, -- Referência ao template da missão
  -- Configurações específicas da ação para esta loja
  ativa BOOLEAN NOT NULL DEFAULT true,
  prioridade INTEGER NOT NULL DEFAULT 1, -- 1=baixa, 5=alta
  horario_especifico TIME, -- Se tem horário específico diferente do padrão
  prazo_customizado_horas INTEGER, -- Prazo diferente do padrão
  pontos_customizados INTEGER, -- Pontos diferentes do template
  obrigatoria BOOLEAN NOT NULL DEFAULT false, -- Se é obrigatória para esta loja
  -- Condições especiais
  dias_semana TEXT[] DEFAULT ARRAY['seg','ter','qua','qui','sex'], -- Quais dias aparece
  condicoes_especiais JSONB DEFAULT '{}', -- Condições extras (ex: faturamento, estoque)
  -- Configurações de execução
  permite_delegacao BOOLEAN NOT NULL DEFAULT true,
  requer_evidencia BOOLEAN NOT NULL DEFAULT false,
  requer_justificativa_se_nao_feita BOOLEAN NOT NULL DEFAULT false,
  -- Auditoria
  configurada_por UUID, -- Quem configurou
  configurada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(loja_id, template_id)
);

-- ========================================
-- 3. TABELA DE TEMPLATES GLOBAIS (EXPANDIDA)
-- ========================================

-- Adicionar campos para permitir customização por loja
ALTER TABLE missao_templates ADD COLUMN IF NOT EXISTS 
  permite_customizacao_loja BOOLEAN DEFAULT true;

ALTER TABLE missao_templates ADD COLUMN IF NOT EXISTS 
  categoria_configuracao TEXT DEFAULT 'operacional';

ALTER TABLE missao_templates ADD COLUMN IF NOT EXISTS 
  horario_sugerido TIME;

ALTER TABLE missao_templates ADD COLUMN IF NOT EXISTS 
  dias_semana_padrao TEXT[] DEFAULT ARRAY['seg','ter','qua','qui','sex'];

-- ========================================
-- 4. FUNÇÃO PARA APLICAR CONFIGURAÇÕES
-- ========================================

CREATE OR REPLACE FUNCTION aplicar_configuracoes_loja_horarios()
RETURNS TABLE(
  loja_id UUID,
  configuracoes_aplicadas INTEGER,
  proxima_renovacao TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  r RECORD;
  v_configuracoes INTEGER := 0;
BEGIN
  -- Para cada loja, criar configurações padrão se não existir
  FOR r IN SELECT id FROM lojas WHERE ativo = true
  LOOP
    -- Inserir configuração padrão se não existir
    INSERT INTO loja_configuracoes_horario (loja_id)
    VALUES (r.id)
    ON CONFLICT (loja_id) DO NOTHING;
    
    -- Inserir ações padrão baseadas nos templates ativos
    INSERT INTO loja_acoes_customizadas (loja_id, template_id, ativa)
    SELECT r.id, mt.id, true
    FROM missao_templates mt 
    WHERE mt.ativo = true 
      AND mt.permite_customizacao_loja = true
    ON CONFLICT (loja_id, template_id) DO NOTHING;
    
    GET DIAGNOSTICS v_configuracoes = ROW_COUNT;
    
    -- Calcular próxima renovação baseada na configuração da loja
    RETURN QUERY 
    SELECT 
      r.id,
      v_configuracoes,
      (CURRENT_DATE + INTERVAL '1 day' + 
       COALESCE((SELECT hora_renovacao_sistema FROM loja_configuracoes_horario WHERE loja_id = r.id), '20:00'::TIME)
      )::TIMESTAMP WITH TIME ZONE;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. FUNÇÃO PARA GERAR MISSÕES COM CONFIGURAÇÕES
-- ========================================

CREATE OR REPLACE FUNCTION gerar_missoes_com_configuracoes(p_data DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  missoes_criadas INTEGER,
  lojas_processadas INTEGER,
  detalhes TEXT
) AS $$
DECLARE
  r RECORD;
  v_missoes_criadas INTEGER := 0;
  v_lojas_processadas INTEGER := 0;
  v_dia_semana TEXT;
  v_horario_limite TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Determinar dia da semana
  v_dia_semana := CASE EXTRACT(dow FROM p_data)
    WHEN 1 THEN 'seg'
    WHEN 2 THEN 'ter' 
    WHEN 3 THEN 'qua'
    WHEN 4 THEN 'qui'
    WHEN 5 THEN 'sex'
    WHEN 6 THEN 'sab'
    WHEN 0 THEN 'dom'
  END;
  
  -- Processar cada loja
  FOR r IN 
    SELECT DISTINCT l.id as loja_id, lch.* 
    FROM lojas l
    JOIN loja_configuracoes_horario lch ON l.id = lch.loja_id
    WHERE l.ativo = true
  LOOP
    -- Verificar se a loja trabalha neste dia
    IF (
      (v_dia_semana = 'seg' AND r.segunda_ativa) OR
      (v_dia_semana = 'ter' AND r.terca_ativa) OR
      (v_dia_semana = 'qua' AND r.quarta_ativa) OR
      (v_dia_semana = 'qui' AND r.quinta_ativa) OR
      (v_dia_semana = 'sex' AND r.sexta_ativa) OR
      (v_dia_semana = 'sab' AND r.sabado_ativa) OR
      (v_dia_semana = 'dom' AND r.domingo_ativa)
    ) THEN
      
      -- Criar missões baseadas nas ações customizadas da loja
      INSERT INTO missoes_diarias (
        loja_id,
        template_id,
        data_missao,
        data_vencimento,
        pontos_total,
        status,
        eh_obrigatoria,
        criada_automaticamente
      )
      SELECT 
        r.loja_id,
        ac.template_id,
        p_data,
        -- Calcular vencimento baseado na configuração
        (p_data + COALESCE(ac.horario_especifico, r.hora_limite_missoes, '17:00'::TIME))::TIMESTAMP WITH TIME ZONE,
        COALESCE(ac.pontos_customizados, mt.pontos_base),
        'pendente',
        ac.obrigatoria,
        true
      FROM loja_acoes_customizadas ac
      JOIN missao_templates mt ON ac.template_id = mt.id
      WHERE ac.loja_id = r.loja_id
        AND ac.ativa = true
        AND v_dia_semana = ANY(ac.dias_semana)
        AND mt.ativo = true
      ON CONFLICT (loja_id, template_id, data_missao) DO NOTHING;
      
      GET DIAGNOSTICS v_missoes_criadas = ROW_COUNT;
      v_lojas_processadas := v_lojas_processadas + 1;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT v_missoes_criadas, v_lojas_processadas, 
    FORMAT('Criadas %s missões para %s lojas na data %s', 
           v_missoes_criadas, v_lojas_processadas, p_data);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_loja_configuracoes_horario_loja ON loja_configuracoes_horario(loja_id);
CREATE INDEX IF NOT EXISTS idx_loja_acoes_customizadas_loja ON loja_acoes_customizadas(loja_id);
CREATE INDEX IF NOT EXISTS idx_loja_acoes_customizadas_template ON loja_acoes_customizadas(template_id);
CREATE INDEX IF NOT EXISTS idx_loja_acoes_customizadas_ativa ON loja_acoes_customizadas(ativa);

-- ========================================
-- 7. TRIGGERS PARA AUDITORIA
-- ========================================

CREATE TRIGGER update_loja_configuracoes_horario_updated_at 
  BEFORE UPDATE ON loja_configuracoes_horario 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loja_acoes_customizadas_updated_at 
  BEFORE UPDATE ON loja_acoes_customizadas 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ✅ SISTEMA DE CONFIGURAÇÃO COMPLETO!
-- ========================================

SELECT 'Sistema de configurações de horário e ações por loja criado! 🕐⚙️' as status;