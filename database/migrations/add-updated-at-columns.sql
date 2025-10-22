-- ===================================================================
-- CORREÇÃO: Adicionar coluna updated_at em tabelas faltantes
-- Data: 22/10/2025
-- Descrição: Adiciona updated_at na tabela lojas e outras sem essa coluna
-- ===================================================================

-- 1. Adicionar updated_at na tabela lojas (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lojas' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE lojas ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    
    -- Criar trigger para atualizar automaticamente
    CREATE OR REPLACE FUNCTION update_lojas_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
    
    CREATE TRIGGER lojas_updated_at_trigger
    BEFORE UPDATE ON lojas
    FOR EACH ROW
    EXECUTE FUNCTION update_lojas_updated_at();
    
    RAISE NOTICE 'Coluna updated_at adicionada à tabela lojas com trigger';
  ELSE
    RAISE NOTICE 'Coluna updated_at já existe na tabela lojas';
  END IF;
END $$;

-- 2. Atualizar registros existentes com created_at (se tiver)
UPDATE lojas 
SET updated_at = created_at 
WHERE updated_at IS NULL AND created_at IS NOT NULL;

-- 3. Verificar resultado
SELECT 
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'lojas' 
  AND column_name IN ('created_at', 'updated_at')
ORDER BY column_name;
