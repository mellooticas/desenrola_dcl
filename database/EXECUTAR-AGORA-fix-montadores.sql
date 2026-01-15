-- =====================================================
-- 🚀 CORREÇÃO DEFINITIVA: Adicionar Campos de Montador
-- =====================================================
-- EXECUTAR ESTE SCRIPT AGORA!
-- =====================================================

-- PARTE 1: Adicionar as colunas faltantes
-- =====================================================

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS montador_nome TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS montador_local TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS montador_contato TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS custo_montagem NUMERIC(10,2);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS data_montagem TIMESTAMPTZ;

-- Adicionar comentários
COMMENT ON COLUMN pedidos.montador_nome IS 'Nome do montador (snapshot no momento da atribuição)';
COMMENT ON COLUMN pedidos.montador_local IS 'Local de trabalho do montador';
COMMENT ON COLUMN pedidos.montador_contato IS 'Contato do montador';
COMMENT ON COLUMN pedidos.custo_montagem IS 'Custo da montagem';
COMMENT ON COLUMN pedidos.data_montagem IS 'Data de atribuição do montador';

-- =====================================================
-- PARTE 2: Popular dados dos 5 pedidos existentes
-- =====================================================

-- Atualizar pedidos que já têm montador_id mas faltam os outros dados
UPDATE pedidos p
SET 
  montador_nome = m.nome,
  montador_local = CASE 
    WHEN m.tipo = 'INTERNO' THEN 'DCL - Montagem Interna'
    WHEN m.tipo = 'LABORATORIO' THEN lab.nome
    ELSE 'Não especificado'
  END,
  data_montagem = COALESCE(p.updated_at, p.created_at)  -- Usar data de atualização
FROM montadores m
LEFT JOIN laboratorios lab ON m.laboratorio_id = lab.id
WHERE p.montador_id = m.id
  AND p.montador_nome IS NULL;  -- Só atualizar se ainda não preenchido

-- =====================================================
-- PARTE 3: Corrigir RLS de UPDATE
-- =====================================================

-- Remover policies antigas
DROP POLICY IF EXISTS "pedidos_update_policy" ON pedidos;
DROP POLICY IF EXISTS "Usuarios podem atualizar pedidos da sua loja" ON pedidos;
DROP POLICY IF EXISTS "pedidos_update_emergency" ON pedidos;

-- Criar policy correta
CREATE POLICY "pedidos_update_policy" ON pedidos
  FOR UPDATE
  TO authenticated
  USING (
    loja_id IN (SELECT loja_id FROM usuarios WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('gestor', 'dcl', 'financeiro'))
  )
  WITH CHECK (
    loja_id IN (SELECT loja_id FROM usuarios WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('gestor', 'dcl', 'financeiro'))
  );

-- =====================================================
-- VALIDAÇÃO: Verificar se funcionou
-- =====================================================

-- 1. Confirmar colunas criadas
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'pedidos' AND column_name LIKE '%montador%'
ORDER BY column_name;

| column_name      | data_type |
| ---------------- | --------- |
| montador_contato | text      |
| montador_id      | uuid      |
| montador_local   | text      |
| montador_nome    | text      |


-- Esperado:
-- montador_contato | text
-- montador_id      | uuid
-- montador_local   | text
-- montador_nome    | text

-- 2. Verificar pedidos atualizados
SELECT 
  numero_sequencial,
  cliente_nome,
  status,
  montador_id,
  montador_nome,
  montador_local,
  data_montagem
FROM pedidos
WHERE montador_id IS NOT NULL
ORDER BY numero_sequencial DESC
LIMIT 5;

| numero_sequencial | cliente_nome                                | status  | montador_id                          | montador_nome | montador_local         | data_montagem                 |
| ----------------- | ------------------------------------------- | ------- | ------------------------------------ | ------------- | ---------------------- | ----------------------------- |
| 653               | ÍTALA CAROLINE RODRIGUES BASTOS             | ENVIADO | 56d71159-70ce-403b-8362-ebe44b18d882 | Thiago        | DCL - Montagem Interna | 2026-01-14 23:33:34.353602+00 |
| 651               | MARIA SALETE DA SILVA PIRES                 | ENVIADO | 56d71159-70ce-403b-8362-ebe44b18d882 | Thiago        | DCL - Montagem Interna | 2026-01-14 23:33:09.417669+00 |
| 649               | DÉBORA OLIVEIRA DE JESUS CAVALCANTE (Joana) | ENVIADO | 56d71159-70ce-403b-8362-ebe44b18d882 | Thiago        | DCL - Montagem Interna | 2026-01-14 23:31:51.024518+00 |
| 648               | MARIA ANTÔNIA CALIXTO                       | ENVIADO | 56d71159-70ce-403b-8362-ebe44b18d882 | Thiago        | DCL - Montagem Interna | 2026-01-14 23:32:29.986894+00 |
| 647               | LUCAS GONÇALVES DA CONCEIÇÃO                | ENVIADO | 56d71159-70ce-403b-8362-ebe44b18d882 | Thiago        | DCL - Montagem Interna | 2026-01-14 23:32:10.3869+00   |


-- Esperado: Os 5 pedidos devem ter montador_nome e montador_local preenchidos

-- 3. Verificar policy de UPDATE
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'pedidos' AND cmd = 'UPDATE';

| policyname            | cmd    |
| --------------------- | ------ |
| pedidos_update_policy | UPDATE |



-- Esperado: Apenas "pedidos_update_policy"

-- =====================================================
-- ✅ PRONTO! Agora teste:
-- =====================================================
/*
1. Kanban: Atribuir montador em novo pedido → Deve salvar todos os campos
2. Detalhes: Ver pedido com montador → Deve mostrar card completo
3. Edição: Editar qualquer pedido → Deve salvar normalmente

Se tudo funcionar, fazer commit!
*/
