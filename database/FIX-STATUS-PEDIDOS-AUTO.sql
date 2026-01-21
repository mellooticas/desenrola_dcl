-- ============================================================
-- FIX: Corrigir constraint de status em pedidos (AUTO SCHEMA)
-- ============================================================
-- PROBLEMA: Frontend envia 'RASCUNHO', mas banco rejeita
-- SOLUÇÃO: Garantir que o tipo ENUM ou CHECK constraint aceita os valores corretos
-- NOTA: Script detecta automaticamente o schema da tabela pedidos
-- ============================================================

DO $$
DECLARE
  schema_pedidos TEXT;
  tipo_coluna TEXT;
  constraint_exists BOOLEAN;
  status_invalidos INTEGER;
  total INTEGER;
  por_status RECORD;
  sql_command TEXT;
BEGIN
  -- ============================================================
  -- PASSO 1: Descobrir schema da tabela pedidos
  -- ============================================================
  SELECT table_schema INTO schema_pedidos
  FROM information_schema.tables
  WHERE table_name = 'pedidos'
  LIMIT 1;
  
  IF schema_pedidos IS NULL THEN
    RAISE EXCEPTION 'Tabela pedidos não encontrada em nenhum schema!';
  END IF;
  
  RAISE NOTICE '📍 Tabela pedidos encontrada no schema: %', schema_pedidos;
  
  -- ============================================================
  -- PASSO 2: Verificar tipo atual da coluna status
  -- ============================================================
  EXECUTE format('
    SELECT udt_name
    FROM information_schema.columns
    WHERE table_schema = %L
      AND table_name = %L
      AND column_name = %L
  ', schema_pedidos, 'pedidos', 'status')
  INTO tipo_coluna;
  
  RAISE NOTICE '📊 Tipo atual da coluna status: %', tipo_coluna;
  
  -- ============================================================
  -- PASSO 3: Dropar constraint CHECK antiga (se existir)
  -- ============================================================
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = schema_pedidos
      AND t.relname = 'pedidos'
      AND c.conname = 'pedidos_status_check'
  ) INTO constraint_exists;
  
  IF constraint_exists THEN
    EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT pedidos_status_check', 
      schema_pedidos, 'pedidos');
    RAISE NOTICE '✅ Constraint pedidos_status_check removida';
  ELSE
    RAISE NOTICE 'ℹ️  Constraint pedidos_status_check não existe';
  END IF;
  
  -- ============================================================
  -- PASSO 4: Converter coluna para TEXT (se for ENUM)
  -- ============================================================
  IF tipo_coluna LIKE 'status_pedido%' THEN
    RAISE NOTICE '🔄 Convertendo coluna status de ENUM para TEXT...';
    
    EXECUTE format('
      ALTER TABLE %I.%I 
        ALTER COLUMN status TYPE TEXT 
        USING status::TEXT
    ', schema_pedidos, 'pedidos');
    
    RAISE NOTICE '✅ Coluna convertida para TEXT';
  ELSE
    RAISE NOTICE 'ℹ️  Coluna já é TEXT';
  END IF;
  
  -- ============================================================
  -- PASSO 5: Atualizar status inválidos ANTES de criar constraint
  -- ============================================================
  EXECUTE format('
    SELECT COUNT(*) FROM %I.%I
    WHERE status NOT IN (%L, %L, %L, %L, %L)
  ', schema_pedidos, 'pedidos', 
     'RASCUNHO', 'PRODUCAO', 'ENTREGUE', 'FINALIZADO', 'CANCELADO')
  INTO status_invalidos;
  
  IF status_invalidos > 0 THEN
    RAISE NOTICE '🔧 Atualizando % registros com status inválido...', status_invalidos;
    
    -- Mapear status antigos para novos
    EXECUTE format('
      UPDATE %I.%I SET status = %L 
      WHERE status IN (%L, %L, %L, %L)
    ', schema_pedidos, 'pedidos', 'RASCUNHO',
       'PENDENTE', 'REGISTRADO', 'pendente', 'registrado');
    
    EXECUTE format('
      UPDATE %I.%I SET status = %L 
      WHERE status IN (%L, %L, %L, %L, %L, %L)
    ', schema_pedidos, 'pedidos', 'PRODUCAO',
       'AG_PAGAMENTO', 'PAGO', 'ag_pagamento', 'pago', 'PRODUCAO', 'producao');
    
    EXECUTE format('
      UPDATE %I.%I SET status = %L 
      WHERE status IN (%L, %L, %L, %L, %L, %L)
    ', schema_pedidos, 'pedidos', 'ENTREGUE',
       'PRONTO', 'ENVIADO', 'CHEGOU', 'pronto', 'enviado', 'chegou');
    
    EXECUTE format('
      UPDATE %I.%I SET status = %L 
      WHERE status IN (%L, %L)
    ', schema_pedidos, 'pedidos', 'FINALIZADO',
       'entregue', 'finalizado');
    
    EXECUTE format('
      UPDATE %I.%I SET status = %L 
      WHERE status = %L
    ', schema_pedidos, 'pedidos', 'CANCELADO',
       'cancelado');
    
    RAISE NOTICE '✅ Status atualizados';
  ELSE
    RAISE NOTICE '✅ Todos os status já estão no padrão correto';
  END IF;
  
  -- ============================================================
  -- PASSO 6: Adicionar constraint CHECK com valores corretos
  -- ============================================================
  EXECUTE format('
    ALTER TABLE %I.%I
      ADD CONSTRAINT pedidos_status_check 
      CHECK (status IN (%L, %L, %L, %L, %L))
  ', schema_pedidos, 'pedidos',
     'RASCUNHO', 'PRODUCAO', 'ENTREGUE', 'FINALIZADO', 'CANCELADO');
  
  RAISE NOTICE '✅ Constraint pedidos_status_check criada';
  
  -- ============================================================
  -- PASSO 7: Definir default
  -- ============================================================
  EXECUTE format('
    ALTER TABLE %I.%I 
      ALTER COLUMN status SET DEFAULT %L
  ', schema_pedidos, 'pedidos', 'RASCUNHO');
  
  RAISE NOTICE '✅ Default definido como RASCUNHO';
  
  -- ============================================================
  -- PASSO 8: Garantir NOT NULL
  -- ============================================================
  EXECUTE format('
    ALTER TABLE %I.%I 
      ALTER COLUMN status SET NOT NULL
  ', schema_pedidos, 'pedidos');
  
  RAISE NOTICE '✅ Coluna status definida como NOT NULL';
  
  -- ============================================================
  -- PASSO 9: Verificação final
  -- ============================================================
  EXECUTE format('SELECT COUNT(*) FROM %I.%I', schema_pedidos, 'pedidos')
  INTO total;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
  RAISE NOTICE 'Schema: %.pedidos', schema_pedidos;
  RAISE NOTICE 'Total de pedidos: %', total;
  RAISE NOTICE '';
  RAISE NOTICE 'Distribuição por status:';
  
  FOR por_status IN 
    EXECUTE format('
      SELECT status, COUNT(*) as qtd 
      FROM %I.%I 
      GROUP BY status 
      ORDER BY status
    ', schema_pedidos, 'pedidos')
  LOOP
    RAISE NOTICE '  %-12s : % pedidos', por_status.status, por_status.qtd;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Script concluído! Teste criar um novo pedido.';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Valores aceitos: RASCUNHO, PRODUCAO, ENTREGUE, FINALIZADO, CANCELADO';
END $$;

-- ============================================================
-- ✅ EXECUTAR ESTE SCRIPT NO SUPABASE SQL EDITOR
-- ============================================================
