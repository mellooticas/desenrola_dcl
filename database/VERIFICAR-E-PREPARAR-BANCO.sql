-- ============================================================
-- VERIFICAÇÃO E PREPARAÇÃO DO BANCO PARA MIGRAÇÃO
-- ============================================================
-- Execute este script ANTES de rodar MIGRAR-LOJAS-PARA-PADRAO-CRM.sql
-- ============================================================

-- PASSO 1: Verificar estrutura existente
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 VERIFICANDO ESTRUTURA DO BANCO';
  RAISE NOTICE '========================================';
END $$;

-- Verificar se tabelas principais existem
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pedidos') 
    THEN '✅ Tabela pedidos existe'
    ELSE '❌ Tabela pedidos NÃO existe'
  END as status_pedidos,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lojas') 
    THEN '✅ Tabela lojas existe'
    ELSE '❌ Tabela lojas NÃO existe'
  END as status_lojas,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') 
    THEN '✅ Tabela usuarios existe'
    ELSE '❌ Tabela usuarios NÃO existe'
  END as status_usuarios;

-- Listar todas as tabelas existentes
SELECT 
  '📋 TABELAS NO BANCO' as info,
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

| info                | table_name                      |
| ------------------- | ------------------------------- |
| 📋 TABELAS NO BANCO | admin_equipe_por_loja           |
| 📋 TABELAS NO BANCO | admin_lojas_completo            |
| 📋 TABELAS NO BANCO | admin_pessoal_completo          |
| 📋 TABELAS NO BANCO | admin_profissionais_saude       |
| 📋 TABELAS NO BANCO | caixa_movimentacoes             |
| 📋 TABELAS NO BANCO | caixa_sessoes                   |
| 📋 TABELAS NO BANCO | canais_aquisicao                |
| 📋 TABELAS NO BANCO | cargos                          |
| 📋 TABELAS NO BANCO | clientes                        |
| 📋 TABELAS NO BANCO | config_descontos_por_cargo      |
| 📋 TABELAS NO BANCO | configuracoes_juros             |
| 📋 TABELAS NO BANCO | contratos_carne                 |
| 📋 TABELAS NO BANCO | endereco_cliente                |
| 📋 TABELAS NO BANCO | formas_pagamento                |
| 📋 TABELAS NO BANCO | formas_pagamento_disponiveis    |
| 📋 TABELAS NO BANCO | itens_venda                     |
| 📋 TABELAS NO BANCO | limites_desconto_por_cargo      |
| 📋 TABELAS NO BANCO | limites_desconto_por_usuario    |
| 📋 TABELAS NO BANCO | lojas_ativas                    |
| 📋 TABELAS NO BANCO | orcamentos                      |
| 📋 TABELAS NO BANCO | parcelas                        |
| 📋 TABELAS NO BANCO | parcelas_com_juros              |
| 📋 TABELAS NO BANCO | profissionais_para_receitas     |
| 📋 TABELAS NO BANCO | profissionais_saude             |
| 📋 TABELAS NO BANCO | receitas                        |
| 📋 TABELAS NO BANCO | responsaveis_oticos             |
| 📋 TABELAS NO BANCO | responsaveis_oticos_ativos      |
| 📋 TABELAS NO BANCO | resumo_dia                      |
| 📋 TABELAS NO BANCO | roles                           |
| 📋 TABELAS NO BANCO | telefones                       |
| 📋 TABELAS NO BANCO | v_audit_logs_recentes           |
| 📋 TABELAS NO BANCO | v_despesas_caixa                |
| 📋 TABELAS NO BANCO | v_entregas_caixa                |
| 📋 TABELAS NO BANCO | v_movimentacoes_caixa           |
| 📋 TABELAS NO BANCO | v_movimentacoes_financeiras_dia |
| 📋 TABELAS NO BANCO | v_pagamentos_adicionais_caixa   |
| 📋 TABELAS NO BANCO | v_pagamentos_carnes_caixa       |
| 📋 TABELAS NO BANCO | v_parcelas_vencidas             |
| 📋 TABELAS NO BANCO | v_timeline_venda                |
| 📋 TABELAS NO BANCO | v_user_lojas_acesso             |
| 📋 TABELAS NO BANCO | v_user_permissions              |
| 📋 TABELAS NO BANCO | v_users_completo                |
| 📋 TABELAS NO BANCO | v_vendas_caixa_dia              |
| 📋 TABELAS NO BANCO | v_vendas_por_status             |
| 📋 TABELAS NO BANCO | vendas                          |
| 📋 TABELAS NO BANCO | vendas_ativas                   |
| 📋 TABELAS NO BANCO | vendas_carne_entrada_pendente   |
| 📋 TABELAS NO BANCO | vendas_detalhes                 |
| 📋 TABELAS NO BANCO | vendas_dia                      |
| 📋 TABELAS NO BANCO | vendas_formas_pagamento         |
| 📋 TABELAS NO BANCO | vendas_itens                    |
| 📋 TABELAS NO BANCO | vendas_saldo_pendente           |
| 📋 TABELAS NO BANCO | vw_clientes                     |
| 📋 TABELAS NO BANCO | vw_dashboard_lojas              |
| 📋 TABELAS NO BANCO | vw_dashboard_stats              |
| 📋 TABELAS NO BANCO | vw_dashboard_ultimas_vendas     |
| 📋 TABELAS NO BANCO | vw_entregas_calendario          |
| 📋 TABELAS NO BANCO | vw_formas_pagamento             |
| 📋 TABELAS NO BANCO | vw_parcelas                     |
| 📋 TABELAS NO BANCO | vw_performance_receitas         |
| 📋 TABELAS NO BANCO | vw_performance_vendedores       |
| 📋 TABELAS NO BANCO | vw_produtos_mais_vendidos       |
| 📋 TABELAS NO BANCO | vw_venda_detalhes               |
| 📋 TABELAS NO BANCO | vw_vendas                       |
| 📋 TABELAS NO BANCO | vw_vendas_geral                 |


-- PASSO 2: Verificar dados nas lojas
-- ============================================================
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lojas') THEN
    SELECT COUNT(*) INTO v_count FROM lojas;
    RAISE NOTICE '📊 Total de lojas: %', v_count;
    
    IF v_count > 0 THEN
      RAISE NOTICE '✅ Banco tem dados de lojas';
    ELSE
      RAISE NOTICE '⚠️ Tabela lojas existe mas está vazia';
    END IF;
  ELSE
    RAISE NOTICE '❌ ERRO: Tabela lojas não existe!';
    RAISE NOTICE '👉 AÇÃO NECESSÁRIA: Execute o script de estrutura básica primeiro';
  END IF;
END $$;

-- PASSO 3: Verificar dados nos pedidos
-- ============================================================
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pedidos') THEN
    SELECT COUNT(*) INTO v_count FROM pedidos;
    RAISE NOTICE '📊 Total de pedidos: %', v_count;
    
    IF v_count > 0 THEN
      RAISE NOTICE '✅ Banco tem dados de pedidos';
      
      -- Mostrar distribuição por loja
      RAISE NOTICE '📍 Distribuição de pedidos por loja:';
    ELSE
      RAISE NOTICE '⚠️ Tabela pedidos existe mas está vazia';
    END IF;
  ELSE
    RAISE NOTICE '❌ ERRO: Tabela pedidos não existe!';
    RAISE NOTICE '👉 AÇÃO NECESSÁRIA: Execute o script de estrutura básica primeiro';
  END IF;
END $$;

-- Mostrar pedidos por loja (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pedidos') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lojas') THEN
    
    PERFORM 1; -- Query será executada fora do bloco
  END IF;
END $$;

SELECT 
  l.nome as loja,
  l.id as loja_id,
  COUNT(p.id) as total_pedidos
FROM lojas l
LEFT JOIN pedidos p ON p.loja_id = l.id
GROUP BY l.id, l.nome
ORDER BY l.nome;

-- PASSO 4: Diagnóstico final
-- ============================================================
DO $$
DECLARE
  v_tem_lojas BOOLEAN;
  v_tem_pedidos BOOLEAN;
  v_tem_usuarios BOOLEAN;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '📋 DIAGNÓSTICO FINAL';
  RAISE NOTICE '========================================';
  
  v_tem_lojas := EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lojas');
  v_tem_pedidos := EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pedidos');
  v_tem_usuarios := EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios');
  
  IF v_tem_lojas AND v_tem_pedidos AND v_tem_usuarios THEN
    RAISE NOTICE '✅ Estrutura básica OK - Pode executar a migração';
    RAISE NOTICE '👉 Próximo passo: Execute MIGRAR-LOJAS-PARA-PADRAO-CRM.sql';
  ELSE
    RAISE NOTICE '❌ ESTRUTURA INCOMPLETA';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ VOCÊ PRECISA:';
    
    IF NOT v_tem_lojas THEN
      RAISE NOTICE '   1. Criar tabela lojas';
    END IF;
    
    IF NOT v_tem_pedidos THEN
      RAISE NOTICE '   2. Criar tabela pedidos';
    END IF;
    
    IF NOT v_tem_usuarios THEN
      RAISE NOTICE '   3. Criar tabela usuarios';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '📌 OPÇÕES:';
    RAISE NOTICE '   A) Executar no Supabase (banco desenrola_dcl) onde as tabelas existem';
    RAISE NOTICE '   B) Criar estrutura básica primeiro neste banco';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Documentação: docs/ANALISE-BANCO.md';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;

-- ============================================================
-- 📝 INSTRUÇÕES
-- ============================================================
-- 
-- SE TODAS AS VERIFICAÇÕES PASSARAM (✅):
--   → Execute: MIGRAR-LOJAS-PARA-PADRAO-CRM.sql
--
-- SE FALTAM TABELAS (❌):
--   → OPÇÃO 1: Você está no banco errado!
--              Conecte-se ao Supabase desenrola_dcl
--   
--   → OPÇÃO 2: Este é um banco novo
--              Execute primeiro os scripts de estrutura básica
--
-- ============================================================
