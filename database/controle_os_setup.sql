-- =========================================
-- 📋 SISTEMA DE CONTROLE DE ORDENS DE SERVIÇO
-- =========================================
-- Detecta e gerencia gaps na sequência de OSs

-- ⚠️ ATENÇÃO: Este script pode ser re-executado sem problemas
-- Os comandos DROP IF EXISTS permitem recriar tudo do zero

-- 🗑️ Limpeza de objetos existentes (ordem inversa de dependências)
DROP VIEW IF EXISTS view_os_estatisticas CASCADE;
DROP VIEW IF EXISTS view_os_gaps CASCADE;
DROP TRIGGER IF EXISTS os_sequencia_updated_at ON os_sequencia CASCADE;
DROP TRIGGER IF EXISTS os_nao_lancadas_updated_at ON os_nao_lancadas CASCADE;
DROP FUNCTION IF EXISTS trigger_set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS justificar_os_nao_lancada(INTEGER, UUID, TEXT, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS popular_sequencia_os(UUID, INTEGER, INTEGER, TEXT) CASCADE;
DROP TABLE IF EXISTS os_nao_lancadas CASCADE;
DROP TABLE IF EXISTS os_sequencia CASCADE;

-- 1️⃣ Tabela de sequência de OSs esperadas
CREATE TABLE os_sequencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_os INTEGER UNIQUE NOT NULL,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE,
  data_esperada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  origem TEXT, -- 'importacao', 'manual', 'sistema'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2️⃣ Tabela de justificativas para OSs não lançadas
CREATE TABLE os_nao_lancadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_os INTEGER NOT NULL,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE,
  justificativa TEXT NOT NULL,
  tipo_justificativa TEXT CHECK (tipo_justificativa IN (
    'cancelada_cliente',
    'duplicada',
    'erro_numeracao',
    'nao_concretizada',
    'teste',
    'outro'
  )),
  usuario_id UUID REFERENCES usuarios(id),
  resolvido BOOLEAN DEFAULT FALSE,
  data_resolucao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(numero_os, loja_id)
);

-- 3️⃣ View que detecta OSs não lançadas (GAPS)
-- IMPORTANTE: A tabela pedidos usa a coluna 'numero_os_fisica' para armazenar o número da OS
CREATE OR REPLACE VIEW view_os_gaps AS
WITH os_esperadas AS (
  SELECT 
    seq.numero_os,
    seq.loja_id,
    seq.data_esperada,
    seq.origem,
    l.nome as loja_nome
  FROM os_sequencia seq
  LEFT JOIN lojas l ON l.id = seq.loja_id
),
os_lancadas AS (
  SELECT 
    CAST(numero_os_fisica AS INTEGER) as numero_os,
    loja_id
  FROM pedidos
  WHERE numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$'
),
os_justificadas AS (
  SELECT 
    numero_os,
    loja_id,
    justificativa,
    tipo_justificativa,
    resolvido
  FROM os_nao_lancadas
)
SELECT 
  e.numero_os,
  e.loja_id,
  e.loja_nome,
  e.data_esperada,
  e.origem,
  CASE 
    WHEN l.numero_os IS NOT NULL THEN 'lancada'
    WHEN j.numero_os IS NOT NULL AND j.resolvido THEN 'justificada'
    WHEN j.numero_os IS NOT NULL AND NOT j.resolvido THEN 'pendente_justificativa'
    ELSE 'nao_lancada'
  END as status,
  j.justificativa,
  j.tipo_justificativa,
  l.numero_os IS NULL AND (j.numero_os IS NULL OR NOT j.resolvido) as precisa_atencao
FROM os_esperadas e
LEFT JOIN os_lancadas l ON l.numero_os = e.numero_os AND l.loja_id = e.loja_id
LEFT JOIN os_justificadas j ON j.numero_os = e.numero_os AND j.loja_id = e.loja_id
ORDER BY e.numero_os DESC;

-- 4️⃣ View de estatísticas de controle
CREATE OR REPLACE VIEW view_os_estatisticas AS
SELECT 
  loja_id,
  loja_nome,
  COUNT(*) as total_os_esperadas,
  COUNT(*) FILTER (WHERE status = 'lancada') as total_lancadas,
  COUNT(*) FILTER (WHERE status = 'nao_lancada') as total_nao_lancadas,
  COUNT(*) FILTER (WHERE status = 'justificada') as total_justificadas,
  COUNT(*) FILTER (WHERE status = 'pendente_justificativa') as total_pendentes,
  COUNT(*) FILTER (WHERE precisa_atencao) as total_precisa_atencao,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'lancada')::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as percentual_lancamento
FROM view_os_gaps
GROUP BY loja_id, loja_nome;

-- 5️⃣ Função para popular sequência de OSs (range)
CREATE OR REPLACE FUNCTION popular_sequencia_os(
  p_loja_id UUID,
  p_numero_inicial INTEGER,
  p_numero_final INTEGER,
  p_origem TEXT DEFAULT 'importacao'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
  v_numero INTEGER;
BEGIN
  -- Validações
  IF p_numero_inicial > p_numero_final THEN
    RAISE EXCEPTION 'Número inicial não pode ser maior que o final';
  END IF;

  -- Inserir sequência
  FOR v_numero IN p_numero_inicial..p_numero_final LOOP
    INSERT INTO os_sequencia (numero_os, loja_id, origem)
    VALUES (v_numero, p_loja_id, p_origem)
    ON CONFLICT (numero_os) DO NOTHING;
    
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- 🔄 Função para popular sequência DINÂMICA (baseada no que existe em pedidos)
CREATE OR REPLACE FUNCTION popular_sequencia_dinamica(
  p_loja_id UUID,
  p_numero_inicial INTEGER DEFAULT NULL,
  p_margem_futura INTEGER DEFAULT 1000
)
RETURNS TABLE(
  total_populado INTEGER,
  primeira_os INTEGER,
  ultima_os INTEGER,
  maior_os_real INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
  v_primeira INTEGER;
  v_ultima INTEGER;
  v_maior_real INTEGER;
  v_numero_inicial INTEGER;
BEGIN
  -- Buscar a maior OS real na tabela pedidos para esta loja
  SELECT MAX(CAST(numero_os_fisica AS INTEGER))
  INTO v_maior_real
  FROM pedidos
  WHERE loja_id = p_loja_id
    AND numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$';

  -- Se não há pedidos, usar o número inicial fornecido
  IF v_maior_real IS NULL THEN
    v_maior_real := COALESCE(p_numero_inicial, 1);
  END IF;

  -- Definir número inicial (usar o fornecido ou a menor OS dos pedidos)
  IF p_numero_inicial IS NOT NULL THEN
    v_numero_inicial := p_numero_inicial;
  ELSE
    SELECT MIN(CAST(numero_os_fisica AS INTEGER))
    INTO v_numero_inicial
    FROM pedidos
    WHERE loja_id = p_loja_id
      AND numero_os_fisica IS NOT NULL
      AND numero_os_fisica ~ '^[0-9]+$';
    
    v_numero_inicial := COALESCE(v_numero_inicial, 1);
  END IF;

  -- Popular do inicial até maior OS real + margem
  v_primeira := v_numero_inicial;
  v_ultima := v_maior_real + p_margem_futura;

  -- Inserir sequência
  FOR i IN v_primeira..v_ultima LOOP
    INSERT INTO os_sequencia (numero_os, loja_id, origem)
    VALUES (i, p_loja_id, 'dinamico')
    ON CONFLICT (numero_os) DO NOTHING;
    
    IF FOUND THEN
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_count, v_primeira, v_ultima, v_maior_real;
END;
$$;

-- 🤖 Trigger para auto-adicionar OSs novas à sequência
CREATE OR REPLACE FUNCTION trigger_auto_adicionar_os_sequencia()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_numero_os INTEGER;
BEGIN
  -- Validar se numero_os_fisica é um número válido
  IF NEW.numero_os_fisica IS NOT NULL 
     AND NEW.numero_os_fisica ~ '^[0-9]+$' THEN
    
    v_numero_os := CAST(NEW.numero_os_fisica AS INTEGER);
    
    -- Inserir na sequência se não existir
    INSERT INTO os_sequencia (numero_os, loja_id, origem)
    VALUES (v_numero_os, NEW.loja_id, 'auto')
    ON CONFLICT (numero_os) DO NOTHING;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger no INSERT e UPDATE de pedidos
DROP TRIGGER IF EXISTS trigger_pedido_adicionar_os_sequencia ON pedidos;
CREATE TRIGGER trigger_pedido_adicionar_os_sequencia
  AFTER INSERT OR UPDATE OF numero_os_fisica ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_adicionar_os_sequencia();

-- 6️⃣ Função para justificar OS não lançada
CREATE OR REPLACE FUNCTION justificar_os_nao_lancada(
  p_numero_os INTEGER,
  p_loja_id UUID,
  p_justificativa TEXT,
  p_tipo_justificativa TEXT,
  p_usuario_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Verificar se OS existe na sequência
  IF NOT EXISTS (
    SELECT 1 FROM os_sequencia 
    WHERE numero_os = p_numero_os AND loja_id = p_loja_id
  ) THEN
    RAISE EXCEPTION 'OS % não encontrada na sequência da loja', p_numero_os;
  END IF;

  -- Inserir ou atualizar justificativa
  INSERT INTO os_nao_lancadas (
    numero_os, 
    loja_id, 
    justificativa, 
    tipo_justificativa,
    usuario_id,
    resolvido
  )
  VALUES (
    p_numero_os,
    p_loja_id,
    p_justificativa,
    p_tipo_justificativa,
    p_usuario_id,
    TRUE
  )
  ON CONFLICT (numero_os, loja_id) 
  DO UPDATE SET
    justificativa = EXCLUDED.justificativa,
    tipo_justificativa = EXCLUDED.tipo_justificativa,
    usuario_id = EXCLUDED.usuario_id,
    resolvido = TRUE,
    data_resolucao = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- 7️⃣ Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER os_sequencia_updated_at
  BEFORE UPDATE ON os_sequencia
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER os_nao_lancadas_updated_at
  BEFORE UPDATE ON os_nao_lancadas
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- 8️⃣ Row Level Security (RLS)
ALTER TABLE os_sequencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_nao_lancadas ENABLE ROW LEVEL SECURITY;

-- Policy para os_sequencia
CREATE POLICY os_sequencia_select_policy ON os_sequencia
  FOR SELECT
  USING (
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
        AND role IN ('gestor', 'dcl')
    )
  );

CREATE POLICY os_sequencia_insert_policy ON os_sequencia
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
        AND role IN ('gestor', 'dcl')
    )
  );

-- Policy para os_nao_lancadas
CREATE POLICY os_nao_lancadas_select_policy ON os_nao_lancadas
  FOR SELECT
  USING (
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
        AND role IN ('gestor', 'dcl')
    )
  );

CREATE POLICY os_nao_lancadas_insert_policy ON os_nao_lancadas
  FOR INSERT
  WITH CHECK (
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY os_nao_lancadas_update_policy ON os_nao_lancadas
  FOR UPDATE
  USING (
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- 9️⃣ Índices para performance
CREATE INDEX IF NOT EXISTS idx_os_sequencia_numero ON os_sequencia(numero_os);
CREATE INDEX IF NOT EXISTS idx_os_sequencia_loja ON os_sequencia(loja_id);
CREATE INDEX IF NOT EXISTS idx_os_nao_lancadas_numero ON os_nao_lancadas(numero_os);
CREATE INDEX IF NOT EXISTS idx_os_nao_lancadas_loja ON os_nao_lancadas(loja_id);
CREATE INDEX IF NOT EXISTS idx_os_nao_lancadas_resolvido ON os_nao_lancadas(resolvido);

-- 🎯 Comentários das tabelas
COMMENT ON TABLE os_sequencia IS 'Sequência esperada de todas as OSs que deveriam existir no sistema';
COMMENT ON TABLE os_nao_lancadas IS 'Justificativas para OSs que não foram lançadas no sistema';
COMMENT ON VIEW view_os_gaps IS 'Detecta gaps entre OSs esperadas e OSs lançadas';
COMMENT ON VIEW view_os_estatisticas IS 'Estatísticas de controle de lançamento de OSs por loja';

-- 🔐 Permissões (GRANTs) para usuários autenticados
GRANT SELECT ON view_os_gaps TO authenticated;
GRANT SELECT ON view_os_estatisticas TO authenticated;
GRANT SELECT ON os_sequencia TO authenticated;
GRANT SELECT, INSERT, UPDATE ON os_nao_lancadas TO authenticated;
GRANT EXECUTE ON FUNCTION justificar_os_nao_lancada(INTEGER, UUID, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION popular_sequencia_os(UUID, INTEGER, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION popular_sequencia_dinamica(UUID, INTEGER, INTEGER) TO authenticated;
