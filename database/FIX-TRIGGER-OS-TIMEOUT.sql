-- ============================================================
-- FIX: Otimizar trigger de OS sequência (causando timeout)
-- ============================================================
-- PROBLEMA: Trigger fazendo generate_series em cada INSERT
-- SOLUÇÃO: Simplificar trigger para apenas inserir o número atual
-- ============================================================

-- PASSO 1: Garantir que existe constraint UNIQUE em os_sequencia
DO $$ 
BEGIN
  -- Verificar se a tabela os_sequencia existe
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'os_sequencia'
  ) THEN
    -- Remover constraint antiga se existir
    ALTER TABLE os_sequencia DROP CONSTRAINT IF EXISTS os_sequencia_numero_os_key;
    
    -- Adicionar constraint UNIQUE composta (se não existir)
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'os_sequencia_numero_os_loja_id_key'
    ) THEN
      ALTER TABLE os_sequencia 
        ADD CONSTRAINT os_sequencia_numero_os_loja_id_key 
        UNIQUE (numero_os, loja_id);
      
      RAISE NOTICE '✅ Constraint UNIQUE adicionada em os_sequencia';
    ELSE
      RAISE NOTICE 'ℹ️  Constraint UNIQUE já existe';
    END IF;
  ELSE
    RAISE NOTICE '⚠️  Tabela os_sequencia não existe - trigger será criado mesmo assim';
  END IF;
END $$;

-- PASSO 2: Remover trigger pesado atual
DROP TRIGGER IF EXISTS pedidos_sync_os_sequencia ON pedidos;

-- PASSO 3: Criar versão otimizada da função (SEM generate_series)
CREATE OR REPLACE FUNCTION trigger_sync_os_sequencia_otimizado()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando insere ou atualiza um pedido com numero_os_fisica
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND 
     NEW.numero_os_fisica IS NOT NULL AND 
     NEW.numero_os_fisica ~ '^[0-9]+$' THEN
    
    -- Verificar se tabela os_sequencia existe antes de inserir
    BEGIN
      -- Apenas inserir o número atual (SEM preencher gaps)
      -- Gaps serão preenchidos por job separado, não em tempo real
      INSERT INTO os_sequencia (numero_os, loja_id, data_esperada, origem)
      VALUES (
        CAST(NEW.numero_os_fisica AS INTEGER),
        NEW.loja_id,
        COALESCE(NEW.created_at, NOW()),
        'trigger_otimizado'
      )
      ON CONFLICT (numero_os, loja_id) DO NOTHING;
    EXCEPTION
      WHEN undefined_table THEN
        -- Se tabela não existir, apenas ignora
        NULL;
      WHEN OTHERS THEN
        -- Log do erro mas não falha a operação
        RAISE WARNING 'Erro ao inserir em os_sequencia: %', SQLERRM;
    END;
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASSO 4: Criar trigger otimizado
CREATE TRIGGER pedidos_sync_os_sequencia
  AFTER INSERT OR UPDATE OF numero_os_fisica ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_os_sequencia_otimizado();

-- PASSO 5: Comentários
COMMENT ON FUNCTION trigger_sync_os_sequencia_otimizado() IS 
  'Versão otimizada que apenas insere o número atual da OS, sem preencher gaps. Gaps são preenchidos por job separado para não causar timeout.';

-- ============================================================
-- ✅ EXECUTAR ESTE SCRIPT NO SUPABASE SQL EDITOR
-- ============================================================
