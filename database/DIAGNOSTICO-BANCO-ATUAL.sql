-- ============================================================
-- 🔍 DIAGNÓSTICO: Verificar se está no banco correto
-- ============================================================
-- Execute este script PRIMEIRO para confirmar que está no
-- banco desenrola_dcl operacional do Supabase
-- ============================================================

-- 1. Listar TODAS as tabelas do banco atual
SELECT 
  '📋 TABELAS EXISTENTES' as info,
  table_name 
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

| info                  | table_name                    |
| --------------------- | ----------------------------- |
| 📋 TABELAS EXISTENTES | alertas                       |
| 📋 TABELAS EXISTENTES | classes_lente                 |
| 📋 TABELAS EXISTENTES | clientes                      |
| 📋 TABELAS EXISTENTES | colaboradores                 |
| 📋 TABELAS EXISTENTES | controle_os                   |
| 📋 TABELAS EXISTENTES | desafios                      |
| 📋 TABELAS EXISTENTES | desafios_participacao         |
| 📋 TABELAS EXISTENTES | laboratorio_sla               |
| 📋 TABELAS EXISTENTES | laboratorios                  |
| 📋 TABELAS EXISTENTES | loja_acoes_customizadas       |
| 📋 TABELAS EXISTENTES | loja_configuracoes_horario    |
| 📋 TABELAS EXISTENTES | lojas                         |
| 📋 TABELAS EXISTENTES | lojas_backup_migracao         |
| 📋 TABELAS EXISTENTES | mapeamento_lojas              |
| 📋 TABELAS EXISTENTES | missao_templates              |
| 📋 TABELAS EXISTENTES | missoes_diarias               |
| 📋 TABELAS EXISTENTES | montadores                    |
| 📋 TABELAS EXISTENTES | notificacoes                  |
| 📋 TABELAS EXISTENTES | os_nao_lancadas               |
| 📋 TABELAS EXISTENTES | os_sequencia                  |
| 📋 TABELAS EXISTENTES | pedido_eventos                |
| 📋 TABELAS EXISTENTES | pedido_tratamentos            |
| 📋 TABELAS EXISTENTES | pedidos                       |
| 📋 TABELAS EXISTENTES | pedidos_historico             |
| 📋 TABELAS EXISTENTES | pedidos_timeline              |
| 📋 TABELAS EXISTENTES | renovacao_diaria              |
| 📋 TABELAS EXISTENTES | role_permissions              |
| 📋 TABELAS EXISTENTES | role_status_permissoes_legacy |
| 📋 TABELAS EXISTENTES | sistema_config                |
| 📋 TABELAS EXISTENTES | tratamentos                   |
| 📋 TABELAS EXISTENTES | user_sessions                 |
| 📋 TABELAS EXISTENTES | usuarios                      |



-- 2. Verificar tabelas críticas
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pedidos') 
    THEN '✅ pedidos existe'
    ELSE '❌ pedidos NÃO EXISTE' 
  END as status_pedidos,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lojas') 
    THEN '✅ lojas existe'
    ELSE '❌ lojas NÃO EXISTE' 
  END as status_lojas,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'laboratorios') 
    THEN '✅ laboratorios existe'
    ELSE '❌ laboratorios NÃO EXISTE' 
  END as status_laboratorios,
  
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') 
    THEN '✅ usuarios existe'
    ELSE '❌ usuarios NÃO EXISTE' 
  END as status_usuarios;


| status_pedidos   | status_lojas   | status_laboratorios   | status_usuarios   |
| ---------------- | -------------- | --------------------- | ----------------- |
| ✅ pedidos existe | ✅ lojas existe | ✅ laboratorios existe | ✅ usuarios existe |


-- 3. Contar registros (SE as tabelas existirem)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pedidos') THEN
    RAISE NOTICE '📊 Contagem de pedidos:';
    PERFORM 1;
  ELSE
    RAISE NOTICE '❌ TABELA PEDIDOS NÃO EXISTE!';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lojas') THEN
    RAISE NOTICE '📊 Contagem de lojas:';
    PERFORM 1;
  ELSE
    RAISE NOTICE '❌ TABELA LOJAS NÃO EXISTE!';
  END IF;
END $$;

-- 4. Se existir, contar pedidos
SELECT 
  '📊 TOTAL DE PEDIDOS' as info,
  COUNT(*) as total
FROM pedidos
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pedidos');

-- 5. Se existir, contar lojas
SELECT 
  '📊 TOTAL DE LOJAS' as info,
  COUNT(*) as total
FROM lojas
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lojas');


| info              | total |
| ----------------- | ----- |
| 📊 TOTAL DE LOJAS | 7     |


-- 6. Se existir, mostrar lojas
SELECT 
  '🏪 LOJAS CADASTRADAS' as info,
  id,
  nome,
  codigo
FROM lojas
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lojas')
ORDER BY nome;

| info                 | id                                   | nome                       | codigo  |
| -------------------- | ------------------------------------ | -------------------------- | ------- |
| 🏪 LOJAS CADASTRADAS | f8302fdd-615d-44c6-9dd2-233332937fe1 | Lancaster - Mauá           | MELL048 |
| 🏪 LOJAS CADASTRADAS | bab835bc-2df1-4f54-87c3-8151c61ec642 | Lancaster - Suzano         | MELL042 |
| 🏪 LOJAS CADASTRADAS | 534cba2b-932f-4d26-b003-ae1dcb903361 | Mello Óticas - Escritório  | MELL013 |
| 🏪 LOJAS CADASTRADAS | f03f5cc3-d2ed-4fa1-b8a8-d49f2b0ff59b | Mello Óticas - Perus       | MELL009 |
| 🏪 LOJAS CADASTRADAS | 069c77db-2502-4fa6-b714-51e76f9bc719 | Mello Óticas - Rio Pequeno | MELL011 |
| 🏪 LOJAS CADASTRADAS | f2a684b9-91b3-4650-b2c0-d64124d3a571 | Mello Óticas - São Mateus  | MELL012 |
| 🏪 LOJAS CADASTRADAS | f333a360-ee11-4a16-b98c-1d41961ca0bd | Mello Óticas - Suzano II   | MELL010 |



-- ============================================================
-- 📝 INTERPRETAÇÃO DOS RESULTADOS
-- ============================================================
-- 
-- ✅ SE APARECER:
--    - ✅ pedidos existe
--    - ✅ lojas existe  
--    - 📊 Total ~2.900 pedidos
--    - 🏪 7 lojas listadas
--    → Você está NO BANCO CERTO! Pode executar a migração.
--
-- ❌ SE APARECER:
--    - ❌ pedidos NÃO EXISTE
--    - ❌ lojas NÃO EXISTE
--    - Nenhuma tabela listada ou poucas tabelas
--    → BANCO ERRADO! Você precisa:
--      1. Conectar no Supabase (https://supabase.com)
--      2. Selecionar o projeto "desenrola_dcl"
--      3. Ir em SQL Editor
--      4. Executar lá
--
-- ============================================================

-- Verificação final
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pedidos')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lojas')
     AND (SELECT COUNT(*) FROM pedidos) > 1000
    THEN '✅ BANCO CORRETO - Pode executar MIGRAR-LOJAS-PARA-PADRAO-CRM.sql'
    ELSE '❌ BANCO ERRADO - Conecte no Supabase desenrola_dcl primeiro!'
  END as diagnostico_final;


| diagnostico_final                                            |
| ------------------------------------------------------------ |
| ❌ BANCO ERRADO - Conecte no Supabase desenrola_dcl primeiro! |

