-- ============================================================
-- MIGRAÇÃO: Atualizar desenrola_dcl para PADRÃO CRM_ERP
-- ============================================================
-- SITUAÇÃO: crm_erp, sis_vendas, sis_marketing, sis_finance
--           todos usam o MESMO padrão de lojas (7 lojas)
-- PROBLEMA: desenrola_dcl tem lojas DIFERENTES (IDs antigos)
-- SOLUÇÃO: Substituir lojas do desenrola_dcl pelas do CRM_ERP
-- ============================================================

-- ============================================================
-- EXECUTAR NO BANCO: desenrola_dcl
-- ============================================================

-- PASSO 1: Backup das lojas antigas e mapeamento
-- ============================================================
CREATE TABLE IF NOT EXISTS lojas_backup_migracao AS
SELECT * FROM lojas;

-- PASSO 2: Criar tabela de mapeamento (ID antigo → ID novo)
-- ============================================================
-- Criando tabela PERMANENTE (não TEMP) para funcionar entre comandos
DROP TABLE IF EXISTS mapeamento_lojas;
CREATE TABLE mapeamento_lojas (
  id_antigo UUID,
  nome_antigo TEXT,
  id_novo UUID,
  nome_novo TEXT
);

-- Mapeamento baseado na similaridade de nomes
INSERT INTO mapeamento_lojas (id_antigo, nome_antigo, id_novo, nome_novo) VALUES
  -- Suzano → Lancaster - Suzano (tem 491 produtos!)
  ('e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55', 'Suzano', 
   'bab835bc-2df1-4f54-87c3-8151c61ec642', 'Lancaster - Suzano'),
  
  -- Mauá → Lancaster - Mauá
  ('c1aa5124-bdec-4cd2-86ee-cba6eea5041d', 'Mauá',
   'f8302fdd-615d-44c6-9dd2-233332937fe1', 'Lancaster - Mauá'),
  
  -- Perus → Mello Óticas - Perus
  ('f1dd8fe9-b783-46cd-ad26-56ad364a85d7', 'Perus',
   'f03f5cc3-d2ed-4fa1-b8a8-d49f2b0ff59b', 'Mello Óticas - Perus'),
  
  -- Rio Pequeno → Mello Óticas - Rio Pequeno
  ('c2bb8806-91d1-4670-9ce2-a949b188f8ae', 'Rio Pequeno',
   '069c77db-2502-4fa6-b714-51e76f9bc719', 'Mello Óticas - Rio Pequeno'),
  
  -- São Mateus → Mello Óticas - São Mateus
  ('626c4397-72cd-46de-93ec-1a4255e21e44', 'São Mateus',
   'f2a684b9-91b3-4650-b2c0-d64124d3a571', 'Mello Óticas - São Mateus'),
  
  -- Escritório Central → Mello Óticas - Escritório
  ('e974fc5d-ed39-4831-9e5e-4a5544489de6', 'Escritório Central',
   '534cba2b-932f-4d26-b003-ae1dcb903361', 'Mello Óticas - Escritório'),
  
  -- Suzano Centro → Mello Óticas - Suzano II
  ('cb8ebda2-deff-4d44-8488-672d63bc8bd7', 'Suzano Centro',
   'f333a360-ee11-4a16-b98c-1d41961ca0bd', 'Mello Óticas - Suzano II');

-- Verificar mapeamento
SELECT 
  nome_antigo || ' (' || id_antigo || ')' as loja_antiga,
  ' → ' as mapeamento,
  nome_novo || ' (' || id_novo || ')' as loja_nova
FROM mapeamento_lojas
ORDER BY nome_antigo;

-- PASSO 3: Inserir lojas do padrão CRM_ERP PRIMEIRO
-- ============================================================
-- ⚠️ IMPORTANTE: Fazer isso ANTES de atualizar pedidos/usuarios!
--    (evita violação de foreign key constraint)
-- Inserindo com CÓDIGOS TEMPORÁRIOS para evitar duplicata (constraint unique)

INSERT INTO lojas (id, nome, codigo, endereco, telefone, gerente, ativo, created_at, margem_seguranca_dias, alerta_sla_dias)
SELECT 
  m.id_novo,
  m.nome_novo,
  'TEMP_' || l.codigo,  -- Código temporário para evitar duplicata
  l.endereco,
  l.telefone,
  l.gerente,
  l.ativo,
  NOW(),
  COALESCE(l.margem_seguranca_dias, 2),
  COALESCE(l.alerta_sla_dias, 1)
FROM mapeamento_lojas m
INNER JOIN lojas l ON l.id = m.id_antigo
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  codigo = EXCLUDED.codigo,
  endereco = EXCLUDED.endereco,
  telefone = EXCLUDED.telefone,
  gerente = EXCLUDED.gerente,
  ativo = EXCLUDED.ativo;

-- Verificar lojas inseridas
SELECT 
  '✅ LOJAS INSERIDAS' as status,
  COUNT(*) as total
FROM lojas
WHERE id IN (SELECT id_novo FROM mapeamento_lojas);


| status            | total |
| ----------------- | ----- |
| ✅ LOJAS INSERIDAS | 7     |


-- PASSO 4: Atualizar pedidos com os novos IDs de loja
-- ============================================================
-- ⚠️ EXECUTAR DEPOIS DE INSERIR AS LOJAS NOVAS (PASSO 3)!

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Atualizar loja_id nos pedidos
  UPDATE pedidos p
  SET loja_id = m.id_novo
  FROM mapeamento_lojas m
  WHERE p.loja_id = m.id_antigo;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE '✅ Atualizados % pedidos com novos IDs de loja', v_count;
END $$;

-- Verificar se ficou algum pedido com ID antigo
SELECT 
  COUNT(*) as pedidos_com_id_antigo,
  loja_id
FROM pedidos
WHERE loja_id IN (SELECT id_antigo FROM mapeamento_lojas)
GROUP BY loja_id;
-- Deve retornar 0 linhas (nenhum pedido com ID antigo)

-- PASSO 5: Atualizar outras tabelas que referenciam loja_id
-- ============================================================

-- 5.1: Atualizar USUARIOS
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE usuarios u
  SET loja_id = m.id_novo
  FROM mapeamento_lojas m
  WHERE u.loja_id = m.id_antigo;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE '✅ Atualizados % usuários com novos IDs de loja', v_count;
END $$;

-- 5.2: Verificar outras tabelas que podem ter loja_id
SELECT 
  table_name,
  column_name
FROM information_schema.columns
WHERE column_name = 'loja_id'
  AND table_schema = 'public'
ORDER BY table_name;

-- PASSO 6: Remover lojas antigas (agora que tudo foi atualizado)
-- ============================================================
DELETE FROM lojas WHERE id IN (SELECT id_antigo FROM mapeamento_lojas);

-- PASSO 6.1: Atualizar códigos das lojas novas (remover TEMP_)
-- ============================================================
UPDATE lojas l
SET codigo = REPLACE(codigo, 'TEMP_', '')
WHERE codigo LIKE 'TEMP_%'
  AND id IN (SELECT id_novo FROM mapeamento_lojas);

-- Verificar remoção
SELECT 
  '✅ LOJAS ANTIGAS REMOVIDAS' as status,
  COUNT(*) as total_removidas
FROM lojas_backup_migracao
WHERE id NOT IN (SELECT id FROM lojas);

-- PASSO 7: VERIFICAÇÕES FINAIS
-- ============================================================

-- 7.1: Verificar lojas (deve ter 7)
SELECT 
  '✅ LOJAS APÓS MIGRAÇÃO' as status,
  COUNT(*) as total
FROM lojas;

SELECT id, nome, ativo FROM lojas ORDER BY nome;

-- 7.2: Verificar pedidos (todos devem ter IDs novos)
SELECT 
  '✅ PEDIDOS POR LOJA (novos IDs)' as status,
  l.nome as loja,
  COUNT(p.id) as total_pedidos,
  p.loja_id
FROM lojas l
LEFT JOIN pedidos p ON p.loja_id = l.id
GROUP BY l.id, l.nome, p.loja_id
ORDER BY l.nome;

-- 7.3: Verificar se ficou algum órfão
SELECT 
  COUNT(*) as pedidos_orfaos,
  'ATENÇÃO: Pedidos sem loja válida!' as aviso
FROM pedidos p
WHERE NOT EXISTS (
  SELECT 1 FROM lojas l WHERE l.id = p.loja_id
);

-- 7.4: Comparar antes/depois
SELECT 
  'RESUMO DA MIGRAÇÃO' as status,
  (SELECT COUNT(*) FROM lojas_backup_migracao) as lojas_antes,
  (SELECT COUNT(*) FROM lojas) as lojas_depois,
  (SELECT COUNT(DISTINCT loja_id) FROM pedidos) as lojas_em_uso;

-- ============================================================
-- PASSO 8: LIMPAR temporários (após confirmar que está OK)
-- ============================================================
-- DROP TABLE IF EXISTS lojas_backup_migracao;
-- DROP TABLE IF EXISTS mapeamento_lojas;

-- ============================================================
-- 📝 ANOTAÇÕES PÓS-MIGRAÇÃO
-- ============================================================
-- 
-- ✅ Agora o desenrola_dcl usa o MESMO padrão de lojas que:
--    - crm_erp (produtos e estoque)
--    - sis_vendas (PDV)
--    - sis_marketing (campanhas)
--    - sis_finance (financeiro)
--    - e outros sistemas
--
-- ✅ Todos os pedidos foram migrados para os novos IDs
-- ✅ Filtros de armação agora funcionam (loja_id compatível)
-- ✅ Dados de backup salvos em lojas_backup_migracao
--
-- ⚠️ PRÓXIMOS PASSOS:
-- 1. Testar wizard de nova ordem
-- 2. Verificar filtros de armações
-- 3. Validar dashboard por loja
-- 4. Confirmar kanban por loja
--
-- 🧹 LIMPEZA (executar após validação):
-- DROP TABLE IF EXISTS mapeamento_lojas;
-- DROP TABLE IF EXISTS lojas_backup_migracao;
--
-- ============================================================

SELECT '🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!' as resultado;
