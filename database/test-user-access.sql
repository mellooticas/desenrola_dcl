-- 🧪 TESTE DE ACESSO DO USUÁRIO AUTENTICADO
-- ==========================================
-- Execute este script LOGADO no Supabase (não como postgres)
-- ==========================================

-- 1️⃣ Verificar quem você é (usuário autenticado)
SELECT 
  auth.uid() as meu_user_id,
  (SELECT nome FROM usuarios WHERE id = auth.uid()) as meu_nome,
  (SELECT loja_id FROM usuarios WHERE id = auth.uid()) as minha_loja_id,
  (SELECT role FROM usuarios WHERE id = auth.uid()) as minha_role;

-- 📊 Resultado: Deve mostrar seus dados

-- 2️⃣ Testar acesso à view_os_gaps
SELECT COUNT(*) as total_gaps
FROM view_os_gaps
WHERE loja_id = (SELECT loja_id FROM usuarios WHERE id = auth.uid());

-- 📊 Resultado esperado: 1248 (se você é da loja Suzano)

-- 3️⃣ Testar acesso à view_os_estatisticas  
SELECT *
FROM view_os_estatisticas
WHERE loja_id = (SELECT loja_id FROM usuarios WHERE id = auth.uid());

-- 📊 Resultado esperado: 1 linha com total_os_esperadas = 1638

-- 4️⃣ Verificar as primeiras 5 OSs pendentes
SELECT 
  numero_os,
  status,
  precisa_atencao
FROM view_os_gaps
WHERE loja_id = (SELECT loja_id FROM usuarios WHERE id = auth.uid())
  AND precisa_atencao = true
ORDER BY numero_os ASC
LIMIT 5;

-- 📊 Resultado esperado: OS 11856, 11857, 11865, 11869, 11873

-- ⚠️ SE RETORNAR 0 EM TODOS OS TESTES:
-- Problema: As policies RLS nas tabelas os_sequencia e os_nao_lancadas estão bloqueando
-- Solução: Executar o próximo script de correção RLS
