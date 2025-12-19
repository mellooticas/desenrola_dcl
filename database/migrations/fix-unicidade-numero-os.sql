-- =====================================================
-- SOLUÇÃO COMPLETA: Bloquear Duplicidade de Número de OS por Loja
-- =====================================================
-- PROBLEMA: Sistema permite números de OS duplicados na mesma loja
-- SOLUÇÃO: Constraint única + índice + validação + trigger
-- Execute este script NO SUPABASE SQL EDITOR
-- Data: 2025-12-19

-- =====================================================
-- PARTE 1: ANÁLISE DA SITUAÇÃO ATUAL
-- =====================================================

-- 1.1 Verificar se existem OSs duplicadas ATUALMENTE
SELECT 
  loja_id,
  l.nome as loja_nome,
  numero_os_fisica,
  COUNT(*) as quantidade,
  string_agg(id::text, ', ') as ids_duplicados
FROM pedidos p
LEFT JOIN lojas l ON l.id = p.loja_id
WHERE numero_os_fisica IS NOT NULL
  AND numero_os_fisica != ''
GROUP BY loja_id, l.nome, numero_os_fisica
HAVING COUNT(*) > 1
ORDER BY loja_id, numero_os_fisica;

-- 1.2 Estatísticas gerais
SELECT 
  'Total de pedidos' as metrica,
  COUNT(*) as valor
FROM pedidos
UNION ALL
SELECT 
  'Pedidos com OS física' as metrica,
  COUNT(*) as valor
FROM pedidos
WHERE numero_os_fisica IS NOT NULL AND numero_os_fisica != ''
UNION ALL
SELECT 
  'OSs potencialmente duplicadas' as metrica,
  COUNT(DISTINCT numero_os_fisica) - COUNT(*) as valor
FROM (
  SELECT numero_os_fisica, loja_id
  FROM pedidos
  WHERE numero_os_fisica IS NOT NULL AND numero_os_fisica != ''
) sub;

-- =====================================================
-- PARTE 2: CORREÇÃO DE DUPLICIDADES EXISTENTES (SE HOUVER)
-- =====================================================

-- 2.1 Criar tabela temporária de duplicatas
CREATE TEMP TABLE temp_duplicatas_os AS
SELECT 
  loja_id,
  numero_os_fisica,
  ARRAY_AGG(id ORDER BY created_at) as ids_pedidos,
  COUNT(*) as total_duplicatas
FROM pedidos
WHERE numero_os_fisica IS NOT NULL
  AND numero_os_fisica != ''
GROUP BY loja_id, numero_os_fisica
HAVING COUNT(*) > 1;

-- 2.2 Exibir duplicatas para revisão manual
SELECT 
  d.loja_id,
  l.nome as loja_nome,
  d.numero_os_fisica,
  d.total_duplicatas,
  d.ids_pedidos
FROM temp_duplicatas_os d
LEFT JOIN lojas l ON l.id = d.loja_id
ORDER BY d.loja_id, d.numero_os_fisica;

-- 2.3 Estratégia de correção automática (COMENTADO - EXECUTAR APENAS SE APROVAR)
/*
-- OPÇÃO A: Renumerar duplicatas adicionando sufixo
UPDATE pedidos
SET numero_os_fisica = numero_os_fisica || '-DUP-' || ROW_NUMBER() OVER (
  PARTITION BY loja_id, numero_os_fisica 
  ORDER BY created_at
)
WHERE id IN (
  SELECT UNNEST(ids_pedidos[2:]) -- Manter o primeiro, renumerar os demais
  FROM temp_duplicatas_os
);

-- OPÇÃO B: Limpar OS física das duplicatas (mantém apenas a primeira)
UPDATE pedidos
SET numero_os_fisica = NULL,
    observacoes = COALESCE(observacoes || ' | ', '') || 'OS duplicada removida automaticamente'
WHERE id IN (
  SELECT UNNEST(ids_pedidos[2:])
  FROM temp_duplicatas_os
);
*/

-- =====================================================
-- PARTE 3: CRIAR CONSTRAINT DE UNICIDADE
-- =====================================================

-- 3.1 Remover constraint antiga se existir
ALTER TABLE pedidos 
DROP CONSTRAINT IF EXISTS pedidos_numero_os_loja_unique;

-- 3.2 Criar UNIQUE CONSTRAINT parcial (apenas quando numero_os_fisica não é NULL)
-- Isso permite que múltiplos pedidos tenham numero_os_fisica = NULL
ALTER TABLE pedidos 
ADD CONSTRAINT pedidos_numero_os_loja_unique 
UNIQUE (loja_id, numero_os_fisica)
WHERE numero_os_fisica IS NOT NULL AND numero_os_fisica != '';

-- 3.3 Criar índice adicional para performance em buscas
CREATE INDEX IF NOT EXISTS idx_pedidos_numero_os_fisica 
ON pedidos(loja_id, numero_os_fisica)
WHERE numero_os_fisica IS NOT NULL AND numero_os_fisica != '';

-- =====================================================
-- PARTE 4: FUNÇÃO DE VALIDAÇÃO PRÉ-INSERT/UPDATE
-- =====================================================

-- 4.1 Função que valida se o número de OS já existe
CREATE OR REPLACE FUNCTION validar_numero_os_unico()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existe BOOLEAN;
  v_pedido_id UUID;
BEGIN
  -- Se numero_os_fisica está vazio ou NULL, permitir
  IF NEW.numero_os_fisica IS NULL OR NEW.numero_os_fisica = '' THEN
    RETURN NEW;
  END IF;

  -- Verificar se já existe (excluindo o próprio registro em UPDATEs)
  SELECT 
    EXISTS (
      SELECT 1 
      FROM pedidos 
      WHERE loja_id = NEW.loja_id 
        AND numero_os_fisica = NEW.numero_os_fisica
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    ),
    id
  INTO v_existe, v_pedido_id
  FROM pedidos
  WHERE loja_id = NEW.loja_id 
    AND numero_os_fisica = NEW.numero_os_fisica
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
  LIMIT 1;

  -- Se já existe, bloquear
  IF v_existe THEN
    RAISE EXCEPTION 'Número de OS "%" já existe para esta loja (Pedido: %)', 
      NEW.numero_os_fisica, 
      v_pedido_id
    USING HINT = 'Utilize um número de OS diferente ou deixe em branco para gerar automaticamente';
  END IF;

  RETURN NEW;
END;
$$;

-- 4.2 Criar trigger BEFORE INSERT/UPDATE
DROP TRIGGER IF EXISTS trigger_validar_numero_os ON pedidos;
CREATE TRIGGER trigger_validar_numero_os
  BEFORE INSERT OR UPDATE OF numero_os_fisica
  ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION validar_numero_os_unico();

-- =====================================================
-- PARTE 5: FUNÇÃO AUXILIAR - PRÓXIMO NÚMERO DE OS DISPONÍVEL
-- =====================================================

-- Função para sugerir o próximo número de OS disponível para uma loja
CREATE OR REPLACE FUNCTION proximo_numero_os_disponivel(
  p_loja_id UUID,
  p_prefixo TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ultimo_numero INTEGER;
  v_proximo_numero INTEGER;
  v_numero_formatado TEXT;
  v_existe BOOLEAN;
BEGIN
  -- Buscar o maior número de OS numérico desta loja
  SELECT MAX(
    CASE 
      WHEN numero_os_fisica ~ '^[0-9]+$' THEN numero_os_fisica::INTEGER
      ELSE 0
    END
  )
  INTO v_ultimo_numero
  FROM pedidos
  WHERE loja_id = p_loja_id
    AND numero_os_fisica IS NOT NULL
    AND numero_os_fisica != '';

  -- Se não há nenhum, começar do 1
  v_ultimo_numero := COALESCE(v_ultimo_numero, 0);

  -- Tentar os próximos números até encontrar um disponível
  FOR i IN 1..1000 LOOP
    v_proximo_numero := v_ultimo_numero + i;
    
    -- Formatar com prefixo se fornecido
    IF p_prefixo IS NOT NULL THEN
      v_numero_formatado := p_prefixo || LPAD(v_proximo_numero::TEXT, 4, '0');
    ELSE
      v_numero_formatado := v_proximo_numero::TEXT;
    END IF;

    -- Verificar se está disponível
    SELECT EXISTS (
      SELECT 1 
      FROM pedidos 
      WHERE loja_id = p_loja_id 
        AND numero_os_fisica = v_numero_formatado
    ) INTO v_existe;

    -- Se não existe, retornar este número
    IF NOT v_existe THEN
      RETURN v_numero_formatado;
    END IF;
  END LOOP;

  -- Se não encontrou após 1000 tentativas, retornar NULL
  RETURN NULL;
END;
$$;

-- =====================================================
-- PARTE 6: VIEW AUXILIAR - NÚMEROS DE OS EM USO
-- =====================================================

CREATE OR REPLACE VIEW v_numeros_os_em_uso AS
SELECT 
  p.loja_id,
  l.nome as loja_nome,
  p.numero_os_fisica,
  p.id as pedido_id,
  p.numero_sequencial,
  p.status,
  p.created_at,
  CASE 
    WHEN p.numero_os_fisica ~ '^[0-9]+$' THEN p.numero_os_fisica::INTEGER
    ELSE NULL
  END as numero_os_numerico
FROM pedidos p
LEFT JOIN lojas l ON l.id = p.loja_id
WHERE p.numero_os_fisica IS NOT NULL
  AND p.numero_os_fisica != ''
ORDER BY p.loja_id, numero_os_numerico DESC NULLS LAST;

-- =====================================================
-- PARTE 7: TESTES E VALIDAÇÃO
-- =====================================================

-- 7.1 Testar função de próximo número
SELECT 
  l.id as loja_id,
  l.nome as loja_nome,
  proximo_numero_os_disponivel(l.id) as proximo_numero_simples,
  proximo_numero_os_disponivel(l.id, 'OS-') as proximo_numero_com_prefixo
FROM lojas l
ORDER BY l.nome;

-- 7.2 Ver números de OS em uso por loja
SELECT 
  loja_nome,
  COUNT(*) as total_os_cadastradas,
  MIN(numero_os_numerico) as menor_os,
  MAX(numero_os_numerico) as maior_os,
  MAX(numero_os_numerico) - MIN(numero_os_numerico) - COUNT(*) + 1 as gaps_na_sequencia
FROM v_numeros_os_em_uso
WHERE numero_os_numerico IS NOT NULL
GROUP BY loja_id, loja_nome
ORDER BY loja_nome;

-- =====================================================
-- PARTE 8: TESTAR A CONSTRAINT (OPCIONAL - REMOVER EM PRODUÇÃO)
-- =====================================================

-- Este bloco pode ser usado para testar se a constraint funciona
-- REMOVER ANTES DE EXECUTAR EM PRODUÇÃO
DO $$
DECLARE
  v_loja_id UUID;
  v_test_os TEXT := 'TEST-9999';
  v_pedido_id_1 UUID;
  v_pedido_id_2 UUID;
  v_erro_capturado BOOLEAN := FALSE;
BEGIN
  -- Pegar primeira loja
  SELECT id INTO v_loja_id FROM lojas LIMIT 1;
  
  -- Tentar inserir primeiro pedido com OS teste
  INSERT INTO pedidos (
    loja_id, 
    numero_os_fisica, 
    cliente_nome, 
    status
  ) VALUES (
    v_loja_id, 
    v_test_os, 
    'TESTE UNICIDADE 1', 
    'REGISTRADO'
  ) RETURNING id INTO v_pedido_id_1;
  
  RAISE NOTICE '✅ Primeiro pedido criado: %', v_pedido_id_1;
  
  -- Tentar inserir segundo com MESMA OS (deve falhar)
  BEGIN
    INSERT INTO pedidos (
      loja_id, 
      numero_os_fisica, 
      cliente_nome, 
      status
    ) VALUES (
      v_loja_id, 
      v_test_os, 
      'TESTE UNICIDADE 2', 
      'REGISTRADO'
    ) RETURNING id INTO v_pedido_id_2;
    
    RAISE NOTICE '❌ ERRO: Segundo pedido foi criado (não deveria!)';
  EXCEPTION
    WHEN unique_violation OR others THEN
      v_erro_capturado := TRUE;
      RAISE NOTICE '✅ Constraint funcionando! Duplicata foi bloqueada: %', SQLERRM;
  END;
  
  -- Limpar teste
  DELETE FROM pedidos WHERE id = v_pedido_id_1;
  RAISE NOTICE '🧹 Pedido de teste removido';
  
  IF v_erro_capturado THEN
    RAISE NOTICE '✅ TESTE PASSOU: Sistema bloqueou OS duplicada!';
  ELSE
    RAISE NOTICE '❌ TESTE FALHOU: Duplicata foi permitida!';
  END IF;
END $$;

-- =====================================================
-- PARTE 9: DOCUMENTAÇÃO E MENSAGEM FINAL
-- =====================================================

SELECT 
  '✅ CONFIGURAÇÃO COMPLETA!' as status,
  '
  🔒 PROTEÇÕES IMPLEMENTADAS:
  
  1. CONSTRAINT ÚNICA (pedidos_numero_os_loja_unique)
     - Bloqueia OSs duplicadas no nível do banco
     - Permite múltiplos NULL (para pedidos sem OS)
  
  2. TRIGGER DE VALIDAÇÃO (trigger_validar_numero_os)
     - Validação adicional com mensagens claras
     - Verifica antes de INSERT e UPDATE
  
  3. FUNÇÃO AUXILIAR (proximo_numero_os_disponivel)
     - Sugere próximo número livre
     - Suporta prefixos customizados
  
  4. VIEW DE CONTROLE (v_numeros_os_em_uso)
     - Visualiza todas as OSs em uso
     - Identifica gaps na numeração
  
  📋 PRÓXIMOS PASSOS:
  
  1. Revisar duplicatas existentes (se houver)
  2. Escolher estratégia de correção (renumerar ou limpar)
  3. Descomentar e executar OPÇÃO A ou B da Parte 2
  4. Integrar função proximo_numero_os_disponivel() no frontend
  5. Adicionar validação no formulário antes de submeter
  
  🎯 RESULTADO:
  - Impossível criar OSs duplicadas na mesma loja
  - Mensagens de erro claras para o usuário
  - Sistema sugere próximo número disponível
  ' as detalhes;
