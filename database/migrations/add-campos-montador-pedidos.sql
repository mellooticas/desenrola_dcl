-- =====================================================
-- 🔧 MIGRAÇÃO: Adicionar campos de montador na tabela pedidos
-- =====================================================
-- Data: 2026-01-15
-- Problema: Kanban tenta salvar dados de montador mas colunas não existem
-- Solução: Adicionar colunas para desnormalização dos dados do montador
-- =====================================================

-- 1. Verificar se colunas já existem (segurança)
DO $$
BEGIN
  -- Adicionar montador_nome se não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'pedidos' AND column_name = 'montador_nome'
  ) THEN
    ALTER TABLE pedidos ADD COLUMN montador_nome TEXT;
    RAISE NOTICE '✅ Coluna montador_nome adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna montador_nome já existe';
  END IF;

  -- Adicionar montador_local se não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'pedidos' AND column_name = 'montador_local'
  ) THEN
    ALTER TABLE pedidos ADD COLUMN montador_local TEXT;
    RAISE NOTICE '✅ Coluna montador_local adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna montador_local já existe';
  END IF;

  -- Adicionar montador_contato se não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'pedidos' AND column_name = 'montador_contato'
  ) THEN
    ALTER TABLE pedidos ADD COLUMN montador_contato TEXT;
    RAISE NOTICE '✅ Coluna montador_contato adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna montador_contato já existe';
  END IF;

  -- Adicionar custo_montagem se não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'pedidos' AND column_name = 'custo_montagem'
  ) THEN
    ALTER TABLE pedidos ADD COLUMN custo_montagem NUMERIC(10,2);
    RAISE NOTICE '✅ Coluna custo_montagem adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna custo_montagem já existe';
  END IF;

  -- Adicionar data_montagem se não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'pedidos' AND column_name = 'data_montagem'
  ) THEN
    ALTER TABLE pedidos ADD COLUMN data_montagem TIMESTAMPTZ;
    RAISE NOTICE '✅ Coluna data_montagem adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna data_montagem já existe';
  END IF;
END $$;

-- 2. Adicionar comentários nas colunas (documentação)
COMMENT ON COLUMN pedidos.montador_nome IS 'Nome do montador (desnormalizado para histórico)';
COMMENT ON COLUMN pedidos.montador_local IS 'Local de trabalho do montador (desnormalizado)';
COMMENT ON COLUMN pedidos.montador_contato IS 'Contato do montador (desnormalizado)';
COMMENT ON COLUMN pedidos.custo_montagem IS 'Custo da montagem cobrado';
COMMENT ON COLUMN pedidos.data_montagem IS 'Data em que o montador foi atribuído ao pedido';

-- 3. Popular dados existentes (se houver pedidos com montador_id)
-- Copiar dados da tabela montadores para os pedidos que já têm montador vinculado
UPDATE pedidos p
SET 
  montador_nome = m.nome,
  montador_local = CASE 
    WHEN m.tipo = 'INTERNO' THEN 'Interno DCL'
    WHEN m.tipo = 'LABORATORIO' THEN lab.nome
    ELSE 'Não especificado'
  END,
  montador_contato = 'Atualizar' -- Placeholder pois não temos contato na tabela montadores
FROM montadores m
LEFT JOIN laboratorios lab ON m.laboratorio_id = lab.id
WHERE p.montador_id = m.id
  AND p.montador_nome IS NULL; -- Só atualizar se ainda não foi preenchido

-- 4. Validação: Verificar se migração funcionou
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name LIKE '%montador%'
  OR column_name IN ('custo_montagem', 'data_montagem')
ORDER BY column_name;

-- Resultado esperado:
-- | column_name       | data_type                | is_nullable | column_default |
-- |-------------------|--------------------------|-------------|----------------|
-- | custo_montagem    | numeric                  | YES         | NULL           |
-- | data_montagem     | timestamp with time zone | YES         | NULL           |
-- | montador_contato  | text                     | YES         | NULL           |
-- | montador_id       | uuid                     | YES         | NULL           |
-- | montador_local    | text                     | YES         | NULL           |
-- | montador_nome     | text                     | YES         | NULL           |

-- 5. Testar query com dados reais
SELECT 
  p.id,
  p.numero_sequencial,
  p.cliente_nome,
  p.status,
  p.montador_id,
  p.montador_nome,
  p.montador_local,
  p.montador_contato,
  p.custo_montagem,
  p.data_montagem,
  m.nome as montador_nome_tabela,
  m.tipo as montador_tipo
FROM pedidos p
LEFT JOIN montadores m ON p.montador_id = m.id
WHERE p.montador_id IS NOT NULL
LIMIT 5;

-- =====================================================
-- 🎯 PRÓXIMOS PASSOS APÓS MIGRAÇÃO
-- =====================================================
/*
1. ✅ Executar esta migração
2. ✅ Verificar se todas as colunas foram criadas
3. ✅ Testar salvamento no Kanban
4. ✅ Verificar se dados aparecem nos detalhes do pedido
5. 🔧 Corrigir RLS de UPDATE (problema 2)

OBSERVAÇÃO IMPORTANTE:
- A tabela 'montadores' não tem campos 'local' e 'contato'
- Esses dados vêm do frontend e são salvos diretamente em 'pedidos'
- É uma arquitetura desnormalizada intencional para:
  * Manter histórico (se montador mudar, pedidos antigos não são afetados)
  * Melhor performance (menos JOINs)
  * Dados específicos do pedido (ex: contato pode variar por pedido)
*/
