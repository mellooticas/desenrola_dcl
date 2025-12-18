-- =========================================
-- 🎯 SISTEMA DE CONTROLE DE OS - VERSÃO FINAL
-- =========================================
-- Solução definitiva que mantém sincronização automática com pedidos
-- Nunca mostra OSs acima do número real máximo

-- ========================================
-- PASSO 0: LIMPAR ESTRUTURAS ANTIGAS
-- ========================================

-- Remover views antigas
DROP VIEW IF EXISTS view_os_gaps CASCADE;
DROP VIEW IF EXISTS view_os_gaps_reais CASCADE;
DROP VIEW IF EXISTS view_os_estatisticas CASCADE;

-- Remover triggers antigos
DROP TRIGGER IF EXISTS pedidos_sync_os_sequencia ON pedidos;
DROP TRIGGER IF EXISTS os_sequencia_updated_at ON os_sequencia;

-- Remover funções antigas que não usaremos mais
DROP FUNCTION IF EXISTS popular_sequencia_os(UUID, INTEGER, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS sync_os_sequencia_com_pedidos(UUID) CASCADE;
DROP FUNCTION IF EXISTS trigger_sync_os_sequencia() CASCADE;

-- Remover tabela antiga os_sequencia (substituída por controle_os)
DROP TABLE IF EXISTS os_sequencia CASCADE;

-- Manter apenas: os_nao_lancadas (usada para justificativas)

-- ========================================
-- PASSO 1: CRIAR TABELA DE CONTROLE SIMPLIFICADA
-- ========================================

-- Tabela principal de controle (substitui os_sequencia)
CREATE TABLE IF NOT EXISTS controle_os (
  numero_os INTEGER NOT NULL,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE,
  lancado BOOLEAN DEFAULT FALSE,
  data_lancamento TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (numero_os, loja_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_controle_os_loja ON controle_os(loja_id);
CREATE INDEX IF NOT EXISTS idx_controle_os_lancado ON controle_os(lancado) WHERE lancado = FALSE;

-- ========================================
-- PASSO 2: FUNÇÃO DE SINCRONIZAÇÃO
-- ========================================

CREATE OR REPLACE FUNCTION sync_controle_os()
RETURNS TRIGGER AS $$
DECLARE
  v_numero_os INTEGER;
  v_min_os INTEGER;
  v_max_os INTEGER;
BEGIN
  -- Só processa se tiver numero_os_fisica válido
  IF NEW.numero_os_fisica IS NULL OR NEW.numero_os_fisica !~ '^[0-9]+$' THEN
    RETURN NEW;
  END IF;

  v_numero_os := CAST(NEW.numero_os_fisica AS INTEGER);

  -- Buscar range atual da loja
  SELECT 
    COALESCE(MIN(CAST(numero_os_fisica AS INTEGER)), v_numero_os),
    COALESCE(MAX(CAST(numero_os_fisica AS INTEGER)), v_numero_os)
  INTO v_min_os, v_max_os
  FROM pedidos
  WHERE loja_id = NEW.loja_id
    AND numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$';

  -- Preencher sequência completa do MIN ao MAX
  INSERT INTO controle_os (numero_os, loja_id, lancado, data_lancamento)
  SELECT 
    num,
    NEW.loja_id,
    EXISTS(
      SELECT 1 FROM pedidos 
      WHERE loja_id = NEW.loja_id 
        AND numero_os_fisica = num::TEXT
    ),
    CASE 
      WHEN EXISTS(
        SELECT 1 FROM pedidos 
        WHERE loja_id = NEW.loja_id 
          AND numero_os_fisica = num::TEXT
      ) THEN NEW.created_at
      ELSE NULL
    END
  FROM generate_series(v_min_os, v_max_os) AS num
  ON CONFLICT (numero_os, loja_id) 
  DO UPDATE SET 
    lancado = TRUE,
    data_lancamento = COALESCE(controle_os.data_lancamento, NEW.created_at),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PASSO 3: CRIAR TRIGGER
-- ========================================

DROP TRIGGER IF EXISTS trigger_controle_os ON pedidos;

CREATE TRIGGER trigger_controle_os
  AFTER INSERT OR UPDATE OF numero_os_fisica ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION sync_controle_os();

-- ========================================
-- PASSO 4: POPULAR DADOS INICIAIS
-- ========================================

-- Limpar tabela
TRUNCATE controle_os;

-- Popular loja por loja (evita explodir memória)
-- SUZANO
INSERT INTO controle_os (numero_os, loja_id, lancado, data_lancamento)
WITH pedidos_suzano AS (
  SELECT 
    CAST(numero_os_fisica AS INTEGER) as numero_os,
    MIN(created_at) as data_lancamento
  FROM pedidos
  WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
    AND numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$'
  GROUP BY numero_os_fisica
),
range_suzano AS (
  SELECT MIN(numero_os) as min_os, MAX(numero_os) as max_os FROM pedidos_suzano
)
SELECT 
  num,
  'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'::UUID,
  (p.numero_os IS NOT NULL),
  p.data_lancamento
FROM range_suzano
CROSS JOIN generate_series(range_suzano.min_os, range_suzano.max_os) AS num
LEFT JOIN pedidos_suzano p ON p.numero_os = num;

-- Adicione aqui outras lojas se necessário:
-- INSERT INTO controle_os (...) WITH pedidos_loja2 AS (...) ...

COMMENT ON TABLE controle_os IS 'Controle de OSs - Adicione INSERTs para novas lojas no script acima';

-- ========================================
-- PASSO 5: VIEW PARA O FRONTEND (GAPS)
-- ========================================

CREATE OR REPLACE VIEW view_controle_os_gaps AS
SELECT 
  c.numero_os,
  c.loja_id,
  l.nome as loja_nome,
  c.lancado,
  c.data_lancamento,
  c.created_at,
  -- Buscar justificativa se houver
  j.justificativa,
  j.tipo_justificativa,
  j.resolvido as justificativa_resolvida,
  -- Status consolidado
  CASE 
    WHEN c.lancado THEN 'lancada'
    WHEN j.resolvido THEN 'justificada'
    WHEN j.id IS NOT NULL AND NOT j.resolvido THEN 'pendente_justificativa'
    ELSE 'nao_lancada'
  END as status,
  -- Precisa atenção?
  (NOT c.lancado AND (j.id IS NULL OR NOT j.resolvido)) as precisa_atencao
FROM controle_os c
LEFT JOIN lojas l ON l.id = c.loja_id
LEFT JOIN os_nao_lancadas j ON j.numero_os = c.numero_os AND j.loja_id = c.loja_id
WHERE c.lancado = FALSE; -- Apenas não lançadas

-- Grant permissions
GRANT SELECT ON controle_os TO anon, authenticated, public;
GRANT SELECT ON view_controle_os_gaps TO anon, authenticated, public;

-- ========================================
-- PASSO 6: VIEW DE ESTATÍSTICAS
-- ========================================

CREATE OR REPLACE VIEW view_controle_os_estatisticas AS
SELECT 
  c.loja_id,
  l.nome as loja_nome,
  COUNT(*) as total_os_esperadas,
  COUNT(*) FILTER (WHERE c.lancado) as total_lancadas,
  COUNT(*) FILTER (WHERE NOT c.lancado) as total_nao_lancadas,
  COUNT(j.id) FILTER (WHERE j.resolvido) as total_justificadas,
  COUNT(j.id) FILTER (WHERE NOT j.resolvido) as total_pendentes,
  COUNT(*) FILTER (WHERE NOT c.lancado AND (j.id IS NULL OR NOT j.resolvido)) as total_precisa_atencao,
  ROUND((COUNT(*) FILTER (WHERE c.lancado)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2) as percentual_lancamento
FROM controle_os c
LEFT JOIN lojas l ON l.id = c.loja_id
LEFT JOIN os_nao_lancadas j ON j.numero_os = c.numero_os AND j.loja_id = c.loja_id
GROUP BY c.loja_id, l.nome;

GRANT SELECT ON view_controle_os_estatisticas TO anon, authenticated, public;

-- ========================================
-- PASSO 7: ATUALIZAR FUNÇÃO DE JUSTIFICAR
-- ========================================

-- Dropar função antiga primeiro
DROP FUNCTION IF EXISTS justificar_os_nao_lancada(INTEGER, UUID, TEXT, TEXT, UUID) CASCADE;

CREATE OR REPLACE FUNCTION justificar_os_nao_lancada(
  p_numero_os INTEGER,
  p_loja_id UUID,
  p_justificativa TEXT,
  p_tipo_justificativa TEXT,
  p_usuario_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Inserir ou atualizar justificativa
  INSERT INTO os_nao_lancadas (
    numero_os,
    loja_id,
    justificativa,
    tipo_justificativa,
    usuario_id,
    resolvido,
    data_resolucao
  )
  VALUES (
    p_numero_os,
    p_loja_id,
    p_justificativa,
    p_tipo_justificativa,
    p_usuario_id,
    TRUE,
    NOW()
  )
  ON CONFLICT (numero_os, loja_id)
  DO UPDATE SET
    justificativa = p_justificativa,
    tipo_justificativa = p_tipo_justificativa,
    usuario_id = p_usuario_id,
    resolvido = TRUE,
    data_resolucao = NOW(),
    updated_at = NOW();

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PASSO 8: VERIFICAÇÃO FINAL
-- ========================================

-- Ver quantidade por loja
SELECT 
  loja_nome,
  total_os_esperadas,
  total_lancadas,
  total_nao_lancadas,
  total_precisa_atencao,
  percentual_lancamento
FROM view_controle_os_estatisticas
ORDER BY loja_nome;

| loja_nome | total_os_esperadas | total_lancadas | total_nao_lancadas | total_precisa_atencao | percentual_lancamento |
| --------- | ------------------ | -------------- | ------------------ | --------------------- | --------------------- |
| Suzano    | 425455             | 435            | 425020             | 425020                | 0.10                  |


que maluquice de OS, kkkkk

-- Ver primeiros gaps da Suzano
SELECT 
  numero_os,
  loja_nome,
  status,
  precisa_atencao
FROM view_controle_os_gaps
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  AND precisa_atencao = TRUE
ORDER BY numero_os DESC
LIMIT 10;

| numero_os | loja_nome | status      | precisa_atencao |
| --------- | --------- | ----------- | --------------- |
| 434574    | Suzano    | nao_lancada | true            |
| 434573    | Suzano    | nao_lancada | true            |
| 434572    | Suzano    | nao_lancada | true            |
| 434571    | Suzano    | nao_lancada | true            |
| 434570    | Suzano    | nao_lancada | true            |
| 434569    | Suzano    | nao_lancada | true            |
| 434568    | Suzano    | nao_lancada | true            |
| 434567    | Suzano    | nao_lancada | true            |
| 434566    | Suzano    | nao_lancada | true            |
| 434565    | Suzano    | nao_lancada | true            |

temos algumas coisas erradas, a ultima Os que temos é a 12477, na 

-- Comparação: menor e maior OS
SELECT 
  'Controle' as fonte,
  MIN(numero_os) as menor,
  MAX(numero_os) as maior,
  COUNT(*) as total
FROM controle_os
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
UNION ALL
SELECT 
  'Pedidos' as fonte,
  MIN(CAST(numero_os_fisica AS INTEGER)),
  MAX(CAST(numero_os_fisica AS INTEGER)),
  COUNT(DISTINCT numero_os_fisica)
FROM pedidos
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  AND numero_os_fisica IS NOT NULL
  AND numero_os_fisica ~ '^[0-9]+$';

| fonte    | menor | maior  | total  |
| -------- | ----- | ------ | ------ |
| Controle | 9121  | 434575 | 425455 |
| Pedidos  | 9121  | 434575 | 435    |



/*
===========================================
RESULTADO ESPERADO:

✅ controle_os: Apenas OSs de MIN a MAX real de cada loja
✅ view_controle_os_gaps: Mostra apenas gaps reais
✅ Trigger: Mantém tudo sincronizado automaticamente
✅ Frontend: Usa view_controle_os_gaps (sempre atualizada)
✅ Sem números fantasmas (13483, etc)

Para usar no frontend, basta trocar:
- view_os_gaps → view_controle_os_gaps
- view_os_estatisticas → view_controle_os_estatisticas
===========================================
*/
