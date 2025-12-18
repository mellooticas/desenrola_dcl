-- 🚨 SOLUÇÃO DEFINITIVA - CORRIGIR RLS
-- =====================================
-- Problema: Políticas RLS muito restritivas
-- Solução: Permitir SELECT para usuários autenticados com filtro por loja
-- =====================================

-- 1️⃣ REMOVER políticas antigas restritivas
DROP POLICY IF EXISTS os_sequencia_select_policy ON os_sequencia;
DROP POLICY IF EXISTS os_nao_lancadas_select_policy ON os_nao_lancadas;

-- 2️⃣ CRIAR políticas CORRETAS (permitem acesso baseado em loja do usuário)

-- Política para os_sequencia - permite SELECT para usuários da mesma loja
CREATE POLICY os_sequencia_select_policy ON os_sequencia
  FOR SELECT
  USING (
    -- Permite se é da mesma loja OU se é gestor/dcl
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
        AND role IN ('gestor', 'dcl')
    )
  );

-- Política para os_nao_lancadas - permite SELECT para usuários da mesma loja  
CREATE POLICY os_nao_lancadas_select_policy ON os_nao_lancadas
  FOR SELECT
  USING (
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
        AND role IN ('gestor', 'dcl')
    )
  );

-- 3️⃣ TESTE IMEDIATO (execute como usuário autenticado)
SELECT 
  'os_sequencia' as tabela,
  COUNT(*) as total_acessivel
FROM os_sequencia
WHERE loja_id = (SELECT loja_id FROM usuarios WHERE id = auth.uid())

UNION ALL

SELECT 
  'view_os_gaps' as tabela,
  COUNT(*) as total_acessivel
FROM view_os_gaps
WHERE loja_id = (SELECT loja_id FROM usuarios WHERE id = auth.uid())

UNION ALL

SELECT 
  'gaps pendentes' as tabela,
  COUNT(*) as total_acessivel
FROM view_os_gaps
WHERE loja_id = (SELECT loja_id FROM usuarios WHERE id = auth.uid())
  AND precisa_atencao = true;

-- 📊 Resultado esperado:
-- os_sequencia: 4376
-- view_os_gaps: 4376
-- gaps pendentes: 3934

-- ✅ SE RETORNAR OS NÚMEROS CORRETOS:
-- Frontend funcionará! Badge mostrará 3934 OSs pendentes

-- ❌ SE AINDA RETORNAR 0:
-- Problema pode estar na tabela pedidos ou lojas
-- Execute o diagnóstico adicional abaixo

-- 🔍 DIAGNÓSTICO ADICIONAL (se ainda não funcionar)
SELECT 
  'Meu usuário' as info,
  auth.uid() as user_id,
  u.nome,
  u.loja_id,
  u.role
FROM usuarios u
WHERE u.id = auth.uid();

-- Isso deve mostrar seus dados. Se não mostrar nada, 
-- o problema é a tabela usuarios não ter RLS correto
