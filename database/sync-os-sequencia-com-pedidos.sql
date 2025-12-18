-- =========================================
-- 🔄 SINCRONIZAR OS_SEQUENCIA COM PEDIDOS REAIS
-- =========================================
-- Garante que os_sequencia sempre reflete apenas OSs que foram realmente vendidas
-- Nunca teremos gaps de números que ainda não existem

-- 0️⃣ Adicionar constraint UNIQUE se não existir
DO $$ 
BEGIN
  -- Remover constraint UNIQUE antiga de numero_os
  ALTER TABLE os_sequencia DROP CONSTRAINT IF EXISTS os_sequencia_numero_os_key;
  
  -- Adicionar constraint UNIQUE composta
  ALTER TABLE os_sequencia ADD CONSTRAINT os_sequencia_numero_os_loja_id_key 
    UNIQUE (numero_os, loja_id);
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN others THEN 
    RAISE NOTICE 'Constraint já existe ou erro: %', SQLERRM;
END $$;

-- 1️⃣ Criar função para sincronizar os_sequencia com pedidos
CREATE OR REPLACE FUNCTION sync_os_sequencia_com_pedidos(p_loja_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_sincronizadas BIGINT,
  menor_os INTEGER,
  maior_os INTEGER
) AS $$
DECLARE
  v_loja_id UUID;
  v_menor_os INTEGER;
  v_maior_os INTEGER;
  v_total BIGINT := 0;
BEGIN
  -- Se não passar loja_id, faz para todas
  FOR v_loja_id IN 
    SELECT DISTINCT loja_id 
    FROM pedidos 
    WHERE numero_os_fisica IS NOT NULL
      AND numero_os_fisica ~ '^[0-9]+$'
      AND (p_loja_id IS NULL OR loja_id = p_loja_id)
  LOOP
    -- Buscar range de OSs da loja
    SELECT 
      MIN(CAST(numero_os_fisica AS INTEGER)),
      MAX(CAST(numero_os_fisica AS INTEGER))
    INTO v_menor_os, v_maior_os
    FROM pedidos
    WHERE loja_id = v_loja_id
      AND numero_os_fisica IS NOT NULL
      AND numero_os_fisica ~ '^[0-9]+$';

    -- Remover OSs acima do maior número real desta loja
    DELETE FROM os_sequencia
    WHERE loja_id = v_loja_id
      AND numero_os > v_maior_os;

    -- Inserir sequência completa do menor ao maior
    INSERT INTO os_sequencia (numero_os, loja_id, data_esperada, origem)
    SELECT 
      generate_series(v_menor_os, v_maior_os) as numero_os,
      v_loja_id,
      NOW(),
      'sincronizacao_automatica'
    ON CONFLICT (numero_os, loja_id) 
    DO UPDATE SET 
      updated_at = NOW(),
      origem = 'sincronizacao_automatica';

    GET DIAGNOSTICS v_total = ROW_COUNT;

    RAISE NOTICE 'Loja %: sincronizadas % OSs (% a %)', 
      v_loja_id, v_total, v_menor_os, v_maior_os;
  END LOOP;

  -- Retornar estatísticas gerais
  SELECT 
    COUNT(*),
    MIN(numero_os),
    MAX(numero_os)
  INTO v_total, v_menor_os, v_maior_os
  FROM os_sequencia
  WHERE p_loja_id IS NULL OR loja_id = p_loja_id;

  RETURN QUERY SELECT v_total, v_menor_os, v_maior_os;
END;
$$ LANGUAGE plpgsql;

-- 2️⃣ Criar trigger para manter sincronizado automaticamente
CREATE OR REPLACE FUNCTION trigger_sync_os_sequencia()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando insere ou atualiza um pedido com numero_os_fisica
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND 
     NEW.numero_os_fisica IS NOT NULL AND 
     NEW.numero_os_fisica ~ '^[0-9]+$' THEN
    
    -- Inserir o número na sequência se não existir
    INSERT INTO os_sequencia (numero_os, loja_id, data_esperada, origem)
    VALUES (
      CAST(NEW.numero_os_fisica AS INTEGER),
      NEW.loja_id,
      NEW.created_at,
      'trigger_automatico'
    )
    ON CONFLICT (numero_os, loja_id) DO NOTHING;

    -- Preencher gaps até este número
    INSERT INTO os_sequencia (numero_os, loja_id, data_esperada, origem)
    SELECT 
      num,
      NEW.loja_id,
      NEW.created_at,
      'preenchimento_automatico'
    FROM generate_series(
      (SELECT COALESCE(MIN(CAST(numero_os_fisica AS INTEGER)), CAST(NEW.numero_os_fisica AS INTEGER))
       FROM pedidos 
       WHERE loja_id = NEW.loja_id 
         AND numero_os_fisica IS NOT NULL 
         AND numero_os_fisica ~ '^[0-9]+$'),
      CAST(NEW.numero_os_fisica AS INTEGER)
    ) AS num
    ON CONFLICT (numero_os, loja_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS pedidos_sync_os_sequencia ON pedidos;

-- Criar trigger
CREATE TRIGGER pedidos_sync_os_sequencia
  AFTER INSERT OR UPDATE OF numero_os_fisica ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_os_sequencia();

-- 3️⃣ Executar sincronização inicial
SELECT * FROM sync_os_sequencia_com_pedidos();

-- 4️⃣ Verificar resultados
SELECT 
  l.nome as loja,
  COUNT(*) as total_os_sequencia,
  MIN(s.numero_os) as menor_os,
  MAX(s.numero_os) as maior_os
FROM os_sequencia s
LEFT JOIN lojas l ON l.id = s.loja_id
GROUP BY l.nome
ORDER BY l.nome;

-- 5️⃣ Comparar com pedidos reais
SELECT 
  l.nome as loja,
  COUNT(DISTINCT p.numero_os_fisica) as os_reais,
  MIN(CAST(p.numero_os_fisica AS INTEGER)) as menor_real,
  MAX(CAST(p.numero_os_fisica AS INTEGER)) as maior_real,
  (SELECT MAX(numero_os) FROM os_sequencia WHERE loja_id = p.loja_id) as maior_sequencia
FROM pedidos p
LEFT JOIN lojas l ON l.id = p.loja_id
WHERE p.numero_os_fisica IS NOT NULL
  AND p.numero_os_fisica ~ '^[0-9]+$'
GROUP BY l.nome, p.loja_id
ORDER BY l.nome;

/*
RESULTADO ESPERADO:

Após executar este script:
✅ os_sequencia terá apenas números até o maior numero_os_fisica de cada loja
✅ Novos pedidos inserem automaticamente na sequência (via trigger)
✅ Nunca mais aparecerão gaps de OSs que não existem
✅ view_os_gaps mostrará apenas gaps reais

Para executar manualmente a sincronização:
SELECT * FROM sync_os_sequencia_com_pedidos(); -- todas as lojas
SELECT * FROM sync_os_sequencia_com_pedidos('e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'); -- apenas Suzano
*/
