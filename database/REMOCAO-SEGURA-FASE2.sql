-- =========================================
-- SCRIPT DE REMOÇÃO SEGURA - FASE 2
-- =========================================
-- Tabelas VAZIAS que são CANDIDATAS a remoção
-- EXECUTAR APENAS APÓS CONFIRMAR COM EQUIPE DE PRODUTO

-- ========================================
-- TABELAS DESTA FASE:
-- ========================================
-- 1. desafios (vazia - feature gamificação não implementada)
-- 2. desafios_participacao (vazia)
-- 3. colaboradores (vazia - nunca foi usada)
-- 4. clientes (vazia - pedidos usam cliente_nome diretamente)
-- 5. sistema_config (vazia - config hardcoded)
-- 6. loja_acoes_customizadas (vazia mas tem trigger!)
-- 7. loja_configuracoes_horario (vazia mas tem trigger!)

-- ⚠️ ATENÇÃO: Estas tabelas TÊM TRIGGERS ativos!
-- Verificar se triggers fazem algo importante antes de remover

-- ========================================
-- PASSO 1: BACKUP
-- ========================================

CREATE TABLE IF NOT EXISTS backup_desafios_20260115 AS SELECT * FROM desafios;
CREATE TABLE IF NOT EXISTS backup_desafios_participacao_20260115 AS SELECT * FROM desafios_participacao;
CREATE TABLE IF NOT EXISTS backup_colaboradores_20260115 AS SELECT * FROM colaboradores;
CREATE TABLE IF NOT EXISTS backup_clientes_20260115 AS SELECT * FROM clientes;
CREATE TABLE IF NOT EXISTS backup_sistema_config_20260115 AS SELECT * FROM sistema_config;
CREATE TABLE IF NOT EXISTS backup_loja_acoes_customizadas_20260115 AS SELECT * FROM loja_acoes_customizadas;
CREATE TABLE IF NOT EXISTS backup_loja_configuracoes_horario_20260115 AS SELECT * FROM loja_configuracoes_horario;

-- ========================================
-- PASSO 2: VERIFICAR TRIGGERS
-- ========================================

SELECT 
  trigger_name,
  event_object_table,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN (
  'desafios',
  'desafios_participacao', 
  'colaboradores',
  'clientes',
  'sistema_config',
  'loja_acoes_customizadas',
  'loja_configuracoes_horario'
)
ORDER BY event_object_table, trigger_name;

-- ========================================
-- PASSO 3: REMOVER TRIGGERS
-- ========================================

-- Listar triggers para remoção manual
SELECT 
  'DROP TRIGGER IF EXISTS ' || trigger_name || ' ON ' || event_object_table || ' CASCADE;' as comando
FROM information_schema.triggers
WHERE event_object_table IN (
  'loja_acoes_customizadas',
  'loja_configuracoes_horario'
);

-- ========================================
-- PASSO 4: REMOVER POLICIES
-- ========================================

DO $$
DECLARE
  tabela TEXT;
  pol RECORD;
BEGIN
  FOR tabela IN SELECT unnest(ARRAY[
    'desafios', 
    'desafios_participacao',
    'colaboradores',
    'clientes',
    'sistema_config',
    'loja_acoes_customizadas',
    'loja_configuracoes_horario'
  ]) LOOP
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = tabela LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tabela);
      RAISE NOTICE 'Policy removida: % em %', pol.policyname, tabela;
    END LOOP;
  END LOOP;
END $$;

-- ========================================
-- PASSO 5: REMOVER TABELAS (COMENTADO)
-- ========================================
-- Descomente APENAS após aprovação da equipe

/*
DROP TABLE IF EXISTS desafios CASCADE;
DROP TABLE IF EXISTS desafios_participacao CASCADE;
DROP TABLE IF EXISTS colaboradores CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS sistema_config CASCADE;
DROP TABLE IF EXISTS loja_acoes_customizadas CASCADE;
DROP TABLE IF EXISTS loja_configuracoes_horario CASCADE;
*/

-- ========================================
-- RESUMO FASE 2
-- ========================================

SELECT 
  'FASE 2 - PREPARADA MAS NÃO EXECUTADA' as status,
  7 as tabelas_candidatas,
  'Aguardando aprovação do produto' as proxima_acao;
