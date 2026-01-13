-- =========================================================
-- VERIFICAÇÃO E CORREÇÃO: Sistema de Montadores
-- =========================================================

-- 1. VERIFICAR SE TABELA EXISTE
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'montadores'
) as tabela_montadores_existe;

| tabela_montadores_existe |
| ------------------------ |
| true                     |


-- 2. SE NÃO EXISTIR, CRIAR A TABELA
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'montadores') THEN
    CREATE TABLE public.montadores (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('INTERNO', 'LABORATORIO')),
      laboratorio_id UUID REFERENCES laboratorios(id),
      ativo BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    RAISE NOTICE 'Tabela montadores criada com sucesso!';
  ELSE
    RAISE NOTICE 'Tabela montadores já existe.';
  END IF;
END $$;

-- 3. VERIFICAR PERMISSÕES RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'montadores';


| tablename  | rowsecurity |
| ---------- | ----------- |
| montadores | true        |

-- 4. HABILITAR RLS SE NECESSÁRIO
ALTER TABLE montadores ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLICIES DE RLS
DROP POLICY IF EXISTS "Montadores: SELECT para autenticados" ON montadores;
CREATE POLICY "Montadores: SELECT para autenticados"
  ON montadores FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Montadores: INSERT/UPDATE para gestores" ON montadores;
CREATE POLICY "Montadores: INSERT/UPDATE para gestores"
  ON montadores FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'gestor')
    )
  );

-- 6. GRANT PERMISSIONS
GRANT SELECT ON montadores TO authenticated;
GRANT SELECT ON montadores TO anon;

-- 7. VERIFICAR SE CAMPO montador_id EXISTE NA TABELA PEDIDOS
SELECT EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_name = 'pedidos' 
  AND column_name = 'montador_id'
) as campo_montador_id_existe;


| campo_montador_id_existe |
| ------------------------ |
| true                     |

-- 8. SE NÃO EXISTIR, ADICIONAR O CAMPO
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'pedidos' 
    AND column_name = 'montador_id'
  ) THEN
    ALTER TABLE pedidos 
    ADD COLUMN montador_id UUID REFERENCES montadores(id);
    
    RAISE NOTICE 'Campo montador_id adicionado à tabela pedidos!';
  ELSE
    RAISE NOTICE 'Campo montador_id já existe na tabela pedidos.';
  END IF;
END $$;

-- 9. POPULAR COM MONTADORES DE EXEMPLO (só se tabela estiver vazia)
DO $$
DECLARE
  lab_essilor_id UUID;
  lab_zeiss_id UUID;
  lab_hoya_id UUID;
BEGIN
  -- Verificar se já existem montadores
  IF NOT EXISTS (SELECT 1 FROM montadores LIMIT 1) THEN
    -- Inserir montadores internos
    INSERT INTO montadores (nome, tipo, ativo)
    VALUES 
      ('João Silva', 'INTERNO', true),
      ('Maria Santos', 'INTERNO', true),
      ('Pedro Oliveira', 'INTERNO', true),
      ('Ana Costa', 'INTERNO', true),
      ('Carlos Ferreira', 'INTERNO', true);
    
    RAISE NOTICE 'Montadores internos criados!';
    
    -- Buscar IDs de laboratórios
    SELECT id INTO lab_essilor_id FROM laboratorios WHERE nome ILIKE '%essilor%' LIMIT 1;
    SELECT id INTO lab_zeiss_id FROM laboratorios WHERE nome ILIKE '%zeiss%' LIMIT 1;
    SELECT id INTO lab_hoya_id FROM laboratorios WHERE nome ILIKE '%hoya%' LIMIT 1;
    
    -- Criar montadores de laboratórios se existirem
    IF lab_essilor_id IS NOT NULL THEN
      INSERT INTO montadores (nome, tipo, laboratorio_id, ativo)
      VALUES ('Equipe Essilor', 'LABORATORIO', lab_essilor_id, true);
      RAISE NOTICE 'Montador Essilor criado!';
    END IF;
    
    IF lab_zeiss_id IS NOT NULL THEN
      INSERT INTO montadores (nome, tipo, laboratorio_id, ativo)
      VALUES ('Equipe Zeiss', 'LABORATORIO', lab_zeiss_id, true);
      RAISE NOTICE 'Montador Zeiss criado!';
    END IF;
    
    IF lab_hoya_id IS NOT NULL THEN
      INSERT INTO montadores (nome, tipo, laboratorio_id, ativo)
      VALUES ('Equipe Hoya', 'LABORATORIO', lab_hoya_id, true);
      RAISE NOTICE 'Montador Hoya criado!';
    END IF;
  ELSE
    RAISE NOTICE 'Montadores já existem no sistema.';
  END IF;
END $$;

-- 10. VERIFICAÇÃO FINAL - LISTAR TUDO
SELECT 
  '=== RESUMO DO SISTEMA DE MONTADORES ===' as titulo;

SELECT 
  COUNT(*) as total_montadores,
  COUNT(*) FILTER (WHERE tipo = 'INTERNO') as internos,
  COUNT(*) FILTER (WHERE tipo = 'LABORATORIO') as laboratorios,
  COUNT(*) FILTER (WHERE ativo = true) as ativos
FROM montadores;


| total_montadores | internos | laboratorios | ativos |
| ---------------- | -------- | ------------ | ------ |
| 13               | 2        | 11           | 13     |

-- 11. LISTAR MONTADORES DETALHADOS
SELECT 
  m.id,
  m.nome,
  m.tipo,
  CASE 
    WHEN m.tipo = 'LABORATORIO' THEN COALESCE(l.nome, 'Lab não encontrado')
    ELSE 'N/A'
  END as laboratorio,
  m.ativo,
  TO_CHAR(m.created_at, 'DD/MM/YYYY HH24:MI') as criado_em
FROM montadores m
LEFT JOIN laboratorios l ON m.laboratorio_id = l.id
ORDER BY m.tipo, m.ativo DESC, m.nome;

| id                                   | nome                         | tipo        | laboratorio                  | ativo | criado_em        |
| ------------------------------------ | ---------------------------- | ----------- | ---------------------------- | ----- | ---------------- |
| 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas                      | INTERNO     | N/A                          | true  | 24/09/2025 20:08 |
| 56d71159-70ce-403b-8362-ebe44b18d882 | Thiago                       | INTERNO     | N/A                          | true  | 24/09/2025 20:08 |
| daf00305-6705-43a9-807b-68977c0e3528 | 2K                           | LABORATORIO | 2K                           | true  | 24/09/2025 20:08 |
| 8e11ace7-d52a-4d75-99be-e252e095503a | Blue Optical                 | LABORATORIO | Blue Optical                 | true  | 24/09/2025 20:08 |
| 664c1467-0b98-4d32-8269-93a69ce39437 | Brascor                      | LABORATORIO | Brascor                      | true  | 24/09/2025 20:08 |
| 3c703de3-d07c-4861-b314-4c42dfc125a6 | Braslentes                   | LABORATORIO | Braslentes                   | true  | 24/09/2025 20:08 |
| 5c1e9f51-f43a-41bc-9223-8520539a0192 | Express                      | LABORATORIO | Express                      | true  | 24/09/2025 20:08 |
| 181fdcae-831e-469e-a88d-aab3ba6c719f | HighVision                   | LABORATORIO | HighVision                   | true  | 24/09/2025 20:08 |
| bc8381bf-684c-4cc6-9460-4f768a6ba989 | Polylux                      | LABORATORIO | Polylux                      | true  | 24/09/2025 20:08 |
| db771f9b-296b-48fc-9229-5e4581531863 | So Blocos                    | LABORATORIO | So Blocos                    | true  | 24/09/2025 20:08 |
| 40e62c6a-5bf7-48f3-ad90-e16e2ef949c7 | Solótica - Lentes de Contato | LABORATORIO | Solótica - Lentes de Contato | true  | 24/09/2025 20:08 |
| 1a9c5d17-ee11-42d6-bc07-04c962469e12 | Style                        | LABORATORIO | Style                        | true  | 24/09/2025 20:08 |
| 5163c234-b2da-4ab9-8bbc-38f8ea2f6262 | Sygma                        | LABORATORIO | Sygma                        | true  | 24/09/2025 20:08 |


-- 12. VERIFICAR PEDIDOS COM MONTADOR
SELECT 
  COUNT(*) as total_pedidos,
  COUNT(montador_id) as com_montador,
  COUNT(*) - COUNT(montador_id) as sem_montador,
  ROUND(100.0 * COUNT(montador_id) / NULLIF(COUNT(*), 0), 2) as percentual_com_montador
FROM pedidos
WHERE status NOT IN ('CANCELADO', 'ENTREGUE');
| total_pedidos | com_montador | sem_montador | percentual_com_montador |
| ------------- | ------------ | ------------ | ----------------------- |
| 95            | 0            | 95           | 0.00                    |

ESTA RESPOSTA EXISTE, POIS AINDA NÃO TINHAMOS IMPLATADO O CONTROLE DE MONTADORES NOS PEDIDOS.

-- 13. VERIFICAR RLS POLICIES
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'montadores'
ORDER BY policyname;


| schemaname | tablename  | policyname                              | permissive | roles           | cmd    |
| ---------- | ---------- | --------------------------------------- | ---------- | --------------- | ------ |
| public     | montadores | Montadores: INSERT/UPDATE para gestores | PERMISSIVE | {authenticated} | ALL    |
| public     | montadores | Montadores: SELECT para autenticados    | PERMISSIVE | {authenticated} | SELECT |
| public     | montadores | montadores_all                          | PERMISSIVE | {authenticated} | ALL    |
| public     | montadores | montadores_delete                       | PERMISSIVE | {authenticated} | DELETE |
| public     | montadores | montadores_insert                       | PERMISSIVE | {authenticated} | INSERT |
| public     | montadores | montadores_select                       | PERMISSIVE | {authenticated} | SELECT |
| public     | montadores | montadores_update                       | PERMISSIVE | {authenticated} | UPDATE |
