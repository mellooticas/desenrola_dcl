-- =====================================================
-- 🔧 CORREÇÃO: Adicionar campos de montador na VIEW
-- =====================================================
-- Problema: v_pedidos_kanban não retorna montador_nome, montador_local, etc
-- Solução: Recriar a view incluindo esses campos de pedidos
-- =====================================================

-- Dropar a view antiga
DROP VIEW IF EXISTS v_pedidos_kanban CASCADE;

-- Recriar com TODOS os campos de pedidos (incluindo montador)
CREATE VIEW v_pedidos_kanban AS
SELECT 
  -- TODOS os campos da tabela pedidos (incluindo montador_nome, montador_local, etc)
  p.*,
  
  -- Dados da Loja
  l.nome as loja_nome,
  l.codigo as loja_codigo,
  l.margem_seguranca_dias,
  l.alerta_sla_dias,
  
  -- Dados do Laboratório
  lab.nome as laboratorio_nome,
  lab.codigo as laboratorio_codigo,
  lab.sla_padrao_dias,
  
  -- Dados da Classe de Lente
  cl.nome as classe_nome,
  cl.categoria as classe_categoria,
  cl.cor_badge as classe_cor,
  cl.sla_base_dias as classe_sla_dias,
  
  -- Calcular se está em atraso (SLA lab vs hoje)
  CASE 
    WHEN p.data_sla_laboratorio < CURRENT_DATE THEN true
    ELSE false
  END as sla_atrasado,
  
  -- Calcular se precisa alertar (próximo do SLA)
  CASE 
    WHEN p.data_sla_laboratorio <= CURRENT_DATE + INTERVAL '1 day' * COALESCE(l.alerta_sla_dias, 1) THEN true
    ELSE false
  END as sla_alerta,
  
  -- Diferença em dias
  (p.data_sla_laboratorio - CURRENT_DATE) as dias_para_sla,
  (p.data_prometida - CURRENT_DATE) as dias_para_promessa

FROM pedidos p
LEFT JOIN lojas l ON p.loja_id = l.id
LEFT JOIN laboratorios lab ON p.laboratorio_id = lab.id  
LEFT JOIN classes_lente cl ON p.classe_lente_id = cl.id;

-- Configurar permissões
GRANT SELECT ON v_pedidos_kanban TO authenticated, anon;
ALTER VIEW v_pedidos_kanban SET (security_invoker = true);

-- =====================================================
-- VALIDAÇÃO: Verificar se campos de montador existem
-- =====================================================

SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'v_pedidos_kanban' 
  AND column_name LIKE '%montador%'
ORDER BY column_name;


| column_name      |
| ---------------- |
| montador_contato |
| montador_id      |
| montador_local   |
| montador_nome    |


-- Deve retornar:
-- montador_contato
-- montador_id
-- montador_local
-- montador_nome

-- =====================================================
-- TESTE: Buscar pedido com montador
-- =====================================================

SELECT 
  id,
  numero_sequencial,
  cliente_nome,
  montador_id,
  montador_nome,
  montador_local,
  montador_contato,
  custo_montagem,
  data_montagem
FROM v_pedidos_kanban
WHERE id = '542c0e60-4812-4daa-b2c2-fb2232ccbf03';


| id                                   | numero_sequencial | cliente_nome         | montador_id                          | montador_nome | montador_local         | montador_contato | custo_montagem | data_montagem                 |
| ------------------------------------ | ----------------- | -------------------- | ------------------------------------ | ------------- | ---------------------- | ---------------- | -------------- | ----------------------------- |
| 542c0e60-4812-4daa-b2c2-fb2232ccbf03 | 641               | LAURA VIANA DA SILVA | 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas       | DCL - Montagem Interna | null             | null           | 2026-01-14 00:47:35.761337+00 |


-- Agora montador_nome, montador_local devem aparecer!

-- =====================================================
-- ✅ PRONTO!
-- =====================================================
/*
Após executar:
1. Refresh da página (Ctrl + Shift + R)
2. Console deve mostrar dados completos
3. Card verde deve aparecer
*/
