-- Debug: Verificar se montadores existem AGORA

-- 1. Verificar se a tabela existe
SELECT 
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'montadores'
  ) as tabela_existe;

-- 2. Contar montadores totais
SELECT COUNT(*) as total_montadores FROM montadores;

-- 3. Contar montadores ativos
SELECT COUNT(*) as montadores_ativos FROM montadores WHERE ativo = true;

-- 4. Listar TODOS os montadores (ativos e inativos)
SELECT 
  id,
  nome,
  tipo,
  laboratorio_id,
  ativo,
  created_at
FROM montadores
ORDER BY ativo DESC, nome;

-- 5. Verificar políticas RLS
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'montadores';
