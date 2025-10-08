-- ============================================================================
-- CONFIGURAR PERMISSÕES RLS PARA TIMELINE
-- ============================================================================

-- 1. Habilitar RLS na tabela pedidos_timeline
ALTER TABLE pedidos_timeline ENABLE ROW LEVEL SECURITY;

-- 2. Criar política para SELECT (leitura) - todos usuários autenticados
CREATE POLICY "Usuários autenticados podem ver timeline"
ON pedidos_timeline
FOR SELECT
TO authenticated
USING (true);

-- 3. Criar política para INSERT (trigger vai usar SECURITY DEFINER, mas por garantia)
CREATE POLICY "Sistema pode inserir na timeline"
ON pedidos_timeline
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. Dar permissão de SELECT na view para usuários autenticados
GRANT SELECT ON v_pedido_timeline_completo TO authenticated;
GRANT SELECT ON v_pedido_timeline_completo TO anon;

-- 5. Verificar se funcionou
SELECT 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'pedidos_timeline';

| tablename        | policyname                                     | permissive | roles           | cmd    |
| ---------------- | ---------------------------------------------- | ---------- | --------------- | ------ |
| pedidos_timeline | Permitir leitura para todos                    | PERMISSIVE | {authenticated} | SELECT |
| pedidos_timeline | Sistema pode inserir na timeline               | PERMISSIVE | {authenticated} | INSERT |
| pedidos_timeline | Todos podem visualizar timeline                | PERMISSIVE | {public}        | SELECT |
| pedidos_timeline | Usuários autenticados podem atualizar timeline | PERMISSIVE | {public}        | UPDATE |
| pedidos_timeline | Usuários autenticados podem inserir timeline   | PERMISSIVE | {public}        | INSERT |
| pedidos_timeline | Usuários autenticados podem ver timeline       | PERMISSIVE | {authenticated} | SELECT |
| pedidos_timeline | allow_all_timeline                             | PERMISSIVE | {public}        | ALL    |

-- ============================================================================
-- FIM
-- ============================================================================
