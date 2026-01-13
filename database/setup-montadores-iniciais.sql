-- =========================================================
-- SCRIPT: Configuração Inicial de Montadores
-- Descrição: Popula tabela de montadores com dados iniciais
-- Data: 2026-01-13
-- =========================================================

-- Verificar se já existem montadores
DO $$
BEGIN
  -- Inserir montadores internos apenas se não existirem
  IF NOT EXISTS (SELECT 1 FROM montadores WHERE nome = 'João Silva') THEN
    INSERT INTO montadores (nome, tipo, ativo)
    VALUES ('João Silva', 'INTERNO', true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM montadores WHERE nome = 'Maria Santos') THEN
    INSERT INTO montadores (nome, tipo, ativo)
    VALUES ('Maria Santos', 'INTERNO', true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM montadores WHERE nome = 'Pedro Oliveira') THEN
    INSERT INTO montadores (nome, tipo, ativo)
    VALUES ('Pedro Oliveira', 'INTERNO', true);
  END IF;

  -- Inserir montadores vinculados a laboratórios
  -- Nota: Ajuste os IDs dos laboratórios conforme sua base
  
  -- Exemplo: Montador vinculado ao laboratório Essilor
  IF EXISTS (SELECT 1 FROM laboratorios WHERE nome ILIKE '%essilor%') THEN
    IF NOT EXISTS (SELECT 1 FROM montadores WHERE nome = 'Equipe Essilor') THEN
      INSERT INTO montadores (nome, tipo, laboratorio_id, ativo)
      SELECT 'Equipe Essilor', 'LABORATORIO', id, true
      FROM laboratorios 
      WHERE nome ILIKE '%essilor%'
      LIMIT 1;
    END IF;
  END IF;

  -- Exemplo: Montador vinculado ao laboratório Zeiss
  IF EXISTS (SELECT 1 FROM laboratorios WHERE nome ILIKE '%zeiss%') THEN
    IF NOT EXISTS (SELECT 1 FROM montadores WHERE nome = 'Equipe Zeiss') THEN
      INSERT INTO montadores (nome, tipo, laboratorio_id, ativo)
      SELECT 'Equipe Zeiss', 'LABORATORIO', id, true
      FROM laboratorios 
      WHERE nome ILIKE '%zeiss%'
      LIMIT 1;
    END IF;
  END IF;

  -- Exemplo: Montador vinculado ao laboratório Hoya
  IF EXISTS (SELECT 1 FROM laboratorios WHERE nome ILIKE '%hoya%') THEN
    IF NOT EXISTS (SELECT 1 FROM montadores WHERE nome = 'Equipe Hoya') THEN
      INSERT INTO montadores (nome, tipo, laboratorio_id, ativo)
      SELECT 'Equipe Hoya', 'LABORATORIO', id, true
      FROM laboratorios 
      WHERE nome ILIKE '%hoya%'
      LIMIT 1;
    END IF;
  END IF;

END $$;

-- Listar montadores criados
SELECT 
  m.id,
  m.nome,
  m.tipo,
  CASE 
    WHEN m.tipo = 'LABORATORIO' THEN l.nome
    ELSE 'N/A'
  END as laboratorio,
  m.ativo,
  m.created_at
FROM montadores m
LEFT JOIN laboratorios l ON m.laboratorio_id = l.id
ORDER BY m.tipo, m.nome;
