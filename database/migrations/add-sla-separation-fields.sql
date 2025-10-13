-- ===================================================================
-- MIGRAÇÃO: Separação de SLA Lab vs Promessa Cliente  
-- Data: 13/10/2025
-- Descrição: Adiciona campos para separar controle interno de promessas
-- ===================================================================

-- 1. ADICIONAR CAMPOS NA TABELA PEDIDOS (sem quebrar existentes)
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS data_sla_laboratorio DATE,
ADD COLUMN IF NOT EXISTS observacoes_sla TEXT;

-- 2. ADICIONAR CONFIGURAÇÃO POR LOJA 
ALTER TABLE lojas 
ADD COLUMN IF NOT EXISTS margem_seguranca_dias INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS alerta_sla_dias INTEGER DEFAULT 1;

-- 3. POPULAR CAMPOS NOVOS BASEADO NOS EXISTENTES (retroativo)
-- Para pedidos existentes, usar data_prevista_pronto como SLA lab
UPDATE pedidos 
SET data_sla_laboratorio = data_prevista_pronto 
WHERE data_sla_laboratorio IS NULL 
  AND data_prevista_pronto IS NOT NULL;

-- 4. POPULAR CAMPO data_prometida PARA PEDIDOS QUE NÃO TEM
-- Se não tem data_prometida, calcular baseado no SLA + margem da loja
UPDATE pedidos 
SET data_prometida = (
  SELECT data_sla_laboratorio + INTERVAL '1 day' * COALESCE(l.margem_seguranca_dias, 2)
  FROM lojas l 
  WHERE l.id = pedidos.loja_id
)
WHERE data_prometida IS NULL 
  AND data_sla_laboratorio IS NOT NULL;

-- 5. COMENTÁRIOS PARA CLAREZA DOS CAMPOS
COMMENT ON COLUMN pedidos.data_sla_laboratorio IS 'Data que o laboratório deve entregar (controle interno)';
COMMENT ON COLUMN pedidos.data_prometida IS 'Data prometida ao cliente (comercial)';
COMMENT ON COLUMN pedidos.data_prevista_pronto IS 'Campo legado mantido para compatibilidade';
COMMENT ON COLUMN lojas.margem_seguranca_dias IS 'Dias extras adicionados ao SLA lab para promessa ao cliente';
COMMENT ON COLUMN lojas.alerta_sla_dias IS 'Dias antes do SLA para alertar sobre prazo';

-- 6. ATUALIZAR VIEW DO KANBAN PARA INCLUIR NOVOS CAMPOS
DROP VIEW IF EXISTS v_pedidos_kanban;
CREATE VIEW v_pedidos_kanban AS
SELECT 
  p.*,
  l.nome as loja_nome,
  l.codigo as loja_codigo,
  l.margem_seguranca_dias,
  l.alerta_sla_dias,
  lab.nome as laboratorio_nome,
  lab.codigo as laboratorio_codigo,
  lab.sla_padrao_dias,
  cl.nome as classe_nome,
  cl.categoria as classe_categoria,
  cl.cor_badge as classe_cor,
  cl.sla_base_dias as classe_sla_dias,
  -- Calcular se está em atraso (SLA lab vs hoje)
  CASE 
    WHEN p.data_sla_laboratorio < CURRENT_DATE THEN true
    ELSE false
  END as sla_atrasado,
  -- Calcular se precisa alertar (próximo do SLA)
  CASE 
    WHEN p.data_sla_laboratorio <= CURRENT_DATE + INTERVAL '1 day' * COALESCE(l.alerta_sla_dias, 1) THEN true
    ELSE false
  END as sla_alerta,
  -- Diferença em dias
  (p.data_sla_laboratorio - CURRENT_DATE) as dias_para_sla,
  (p.data_prometida - CURRENT_DATE) as dias_para_promessa
FROM pedidos p
LEFT JOIN lojas l ON p.loja_id = l.id
LEFT JOIN laboratorios lab ON p.laboratorio_id = lab.id  
LEFT JOIN classes_lente cl ON p.classe_lente_id = cl.id;

-- 7. GRANT PERMISSIONS (manter as mesmas que já existem)
-- (As permissions já existentes cobrem os novos campos automaticamente)

-- ===================================================================
-- VALIDAÇÃO: Verificar se migração funcionou
-- ===================================================================

-- Verificar campos adicionados
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'pedidos' 
  AND column_name IN ('data_sla_laboratorio', 'observacoes_sla')
ORDER BY column_name;

SELECT column_name, data_type, is_nullable, column_default  
FROM information_schema.columns
WHERE table_name = 'lojas'
  AND column_name IN ('margem_seguranca_dias', 'alerta_sla_dias')
ORDER BY column_name;

-- Verificar dados populados
SELECT 
  COUNT(*) as total_pedidos,
  COUNT(data_sla_laboratorio) as com_sla_lab,
  COUNT(data_prometida) as com_promessa,
  COUNT(data_prevista_pronto) as legado_compatibilidade
FROM pedidos;

-- Verificar view atualizada
SELECT COUNT(*) as total_registros_view FROM v_pedidos_kanban LIMIT 1;

-- ===================================================================
-- ROLLBACK (em caso de problema)  
-- ===================================================================
/*
-- Para reverter a migração (executar apenas se necessário):

DROP VIEW IF EXISTS v_pedidos_kanban;

ALTER TABLE pedidos 
DROP COLUMN IF EXISTS data_sla_laboratorio,
DROP COLUMN IF EXISTS observacoes_sla;

ALTER TABLE lojas
DROP COLUMN IF EXISTS margem_seguranca_dias,
DROP COLUMN IF EXISTS alerta_sla_dias;

-- Recriar view original (consultar backup da view anterior)
*/