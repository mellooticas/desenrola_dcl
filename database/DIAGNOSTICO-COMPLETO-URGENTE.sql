-- ============================================================
-- 🚨 DIAGNÓSTICO COMPLETO URGENTE - PROBLEMA AO SALVAR PEDIDOS
-- ============================================================
-- Investigar TUDO que pode estar impedindo salvar pedidos
-- ============================================================

-- 1️⃣ VERIFICAR STATUS DA TABELA PEDIDOS
SELECT 
  'ESTRUTURA PEDIDOS' as diagnostico,
  COUNT(*) as total_pedidos,
  (SELECT COUNT(*) FROM pedidos WHERE laboratorio_id IS NULL) as sem_laboratorio,
  (SELECT COUNT(*) FROM pedidos WHERE loja_id IS NULL) as sem_loja,
  (SELECT COUNT(*) FROM pedidos WHERE status IS NULL) as sem_status
FROM pedidos;


| diagnostico       | total_pedidos | sem_laboratorio | sem_loja | sem_status |
| ----------------- | ------------- | --------------- | -------- | ---------- |
| ESTRUTURA PEDIDOS | 641           | 4               | 0        | 0          |


-- 2️⃣ VERIFICAR TRIGGERS ATIVOS NA TABELA PEDIDOS
SELECT 
  tgname as trigger_name,
  tgenabled as status,
  CASE tgenabled
    WHEN 'O' THEN '✅ HABILITADO'
    WHEN 'D' THEN '❌ DESABILITADO'
    WHEN 'R' THEN '⚠️  REPLICA ONLY'
    WHEN 'A' THEN '⚠️  ALWAYS'
    ELSE '❓ DESCONHECIDO'
  END as status_descricao,
  pg_get_triggerdef(oid) as definicao
FROM pg_trigger
WHERE tgrelid = 'pedidos'::regclass
  AND NOT tgisinternal
ORDER BY tgname;


| trigger_name                          | status | status_descricao | definicao                                                                                                                                                                             |
| ------------------------------------- | ------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pedidos_sync_os_sequencia             | O      | ✅ HABILITADO     | CREATE TRIGGER pedidos_sync_os_sequencia AFTER INSERT OR UPDATE OF numero_os_fisica ON public.pedidos FOR EACH ROW EXECUTE FUNCTION trigger_sync_os_sequencia_otimizado()             |
| trigger_atualizar_datas_pedido        | O      | ✅ HABILITADO     | CREATE TRIGGER trigger_atualizar_datas_pedido BEFORE INSERT OR UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION trigger_atualizar_datas_pedido()                                |
| trigger_auto_enviar_montagem          | O      | ✅ HABILITADO     | CREATE TRIGGER trigger_auto_enviar_montagem BEFORE UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION trigger_auto_enviar_montagem()                                              |
| trigger_calcular_margem_lente         | O      | ✅ HABILITADO     | CREATE TRIGGER trigger_calcular_margem_lente BEFORE INSERT OR UPDATE OF preco_lente, custo_lente ON public.pedidos FOR EACH ROW EXECUTE FUNCTION calcular_margem_lente()              |
| trigger_controle_os                   | O      | ✅ HABILITADO     | CREATE TRIGGER trigger_controle_os AFTER INSERT OR UPDATE OF numero_os_fisica ON public.pedidos FOR EACH ROW EXECUTE FUNCTION sync_controle_os()                                      |
| trigger_criar_evento_timeline         | O      | ✅ HABILITADO     | CREATE TRIGGER trigger_criar_evento_timeline AFTER INSERT OR UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION trigger_criar_evento_timeline()                                   |
| trigger_pedido_adicionar_os_sequencia | O      | ✅ HABILITADO     | CREATE TRIGGER trigger_pedido_adicionar_os_sequencia AFTER INSERT OR UPDATE OF numero_os_fisica ON public.pedidos FOR EACH ROW EXECUTE FUNCTION trigger_auto_adicionar_os_sequencia() |
| trigger_pedidos_timeline              | O      | ✅ HABILITADO     | CREATE TRIGGER trigger_pedidos_timeline AFTER INSERT OR UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION inserir_timeline_pedido()                                              |
| trigger_populate_data_prometida       | O      | ✅ HABILITADO     | CREATE TRIGGER trigger_populate_data_prometida BEFORE INSERT OR UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION populate_data_prometida()                                      |


-- 3️⃣ VERIFICAR RLS POLICIES NA TABELA PEDIDOS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'pedidos'
ORDER BY policyname;


| schemaname | tablename | policyname               | permissive | roles           | cmd | using_expression | with_check_expression |
| ---------- | --------- | ------------------------ | ---------- | --------------- | --- | ---------------- | --------------------- |
| public     | pedidos   | anon_all_access          | PERMISSIVE | {anon}          | ALL | true             | true                  |
| public     | pedidos   | authenticated_all_access | PERMISSIVE | {authenticated} | ALL | true             | true                  |

-- 4️⃣ VERIFICAR CONSTRAINT DE STATUS
SELECT 
  con.conname as constraint_name,
  con.contype as constraint_type,
  CASE con.contype
    WHEN 'c' THEN 'CHECK'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'u' THEN 'UNIQUE'
    ELSE 'OTHER'
  END as tipo_constraint,
  pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'pedidos'
  AND (con.conname ILIKE '%status%' OR pg_get_constraintdef(con.oid) ILIKE '%status%');

| constraint_name      | constraint_type | tipo_constraint | constraint_definition                                                                                                                                                                                          |
| -------------------- | --------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pedidos_status_check | c               | CHECK           | CHECK (((status)::text = ANY ((ARRAY['RASCUNHO'::character varying, 'PRODUCAO'::character varying, 'ENTREGUE'::character varying, 'FINALIZADO'::character varying, 'CANCELADO'::character varying])::text[]))) |


-- 5️⃣ VERIFICAR TIPO DA COLUNA STATUS
SELECT 
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name = 'status';


| column_name | data_type         | udt_name | is_nullable | column_default                |
| ----------- | ----------------- | -------- | ----------- | ----------------------------- |
| status      | character varying | varchar  | NO          | 'RASCUNHO'::character varying |

-- 6️⃣ VERIFICAR SE ENUM STATUS_PEDIDO EXISTE E SEUS VALORES
SELECT 
  e.enumlabel as valor_status,
  e.enumsortorder as ordem
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'status_pedido'
ORDER BY e.enumsortorder;

| valor_status | ordem |
| ------------ | ----- |
| pendente     | 1     |
| pago         | 2     |
| producao     | 3     |
| pronto       | 4     |
| enviado      | 5     |
| entregue     | 6     |
| MONTAGEM     | 7     |
| PENDENTE     | 8     |
| REGISTRADO   | 9     |
| AG_PAGAMENTO | 10    |
| PAGO         | 11    |
| PRODUCAO     | 12    |
| PRONTO       | 13    |
| ENVIADO      | 14    |
| CHEGOU       | 15    |
| ENTREGUE     | 16    |
| FINALIZADO   | 17    |
| CANCELADO    | 18    |



-- 7️⃣ TESTAR INSERT SIMPLES (vai falhar mas mostra o erro exato)
DO $$
DECLARE
  v_loja_id uuid;
  v_lab_id uuid;
  v_classe_id uuid;
BEGIN
  -- Pegar IDs reais
  SELECT id INTO v_loja_id FROM lojas LIMIT 1;
  SELECT id INTO v_lab_id FROM laboratorios WHERE ativo = true LIMIT 1;
  SELECT id INTO v_classe_id FROM classe_lente LIMIT 1;
  
  RAISE NOTICE '📍 Loja ID: %', v_loja_id;
  RAISE NOTICE '📍 Lab ID: %', v_lab_id;
  RAISE NOTICE '📍 Classe ID: %', v_classe_id;
  
  -- Tentar inserir (vai rolar back automaticamente no DO block)
  BEGIN
    INSERT INTO pedidos (
      loja_id,
      laboratorio_id,
      classe_lente_id,
      status,
      prioridade,
      cliente_nome,
      data_pedido
    ) VALUES (
      v_loja_id,
      v_lab_id,
      v_classe_id,
      'REGISTRADO',
      'NORMAL',
      'TESTE DIAGNOSTICO',
      CURRENT_DATE
    );
    
    RAISE NOTICE '✅ INSERT funcionou!';
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO AO INSERIR: %', SQLERRM;
    RAISE NOTICE '❌ CÓDIGO ERRO: %', SQLSTATE;
  END;
  
  -- Forçar rollback
  RAISE EXCEPTION 'Rollback intencional - teste concluído';
END $$;


Error: Failed to run sql query: ERROR: 42P01: relation "classe_lente" does not exist QUERY: SELECT id FROM classe_lente LIMIT 1 CONTEXT: PL/pgSQL function inline_code_block line 10 at SQL statement





-- 8️⃣ VERIFICAR ÍNDICES E CONSTRAINTS DA TABELA PEDIDOS
SELECT
  i.relname as index_name,
  a.attname as column_name,
  ix.indisunique as is_unique,
  ix.indisprimary as is_primary
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE t.relname = 'pedidos'
ORDER BY i.relname, a.attname;


| index_name                         | column_name            | is_unique | is_primary |
| ---------------------------------- | ---------------------- | --------- | ---------- |
| idx_pedidos_armacao_id             | armacao_id             | false     | false      |
| idx_pedidos_classe_lente           | classe_lente           | false     | false      |
| idx_pedidos_classe_lente_id        | classe_lente_id        | false     | false      |
| idx_pedidos_created_at             | created_at             | false     | false      |
| idx_pedidos_data_os                | data_os                | false     | false      |
| idx_pedidos_data_pedido            | data_pedido            | false     | false      |
| idx_pedidos_data_prevista_pronto   | data_prevista_pronto   | false     | false      |
| idx_pedidos_fornecedor_catalogo_id | fornecedor_catalogo_id | false     | false      |
| idx_pedidos_fornecedor_lente       | fornecedor_lente_id    | false     | false      |
| idx_pedidos_fornecedor_lente_id    | fornecedor_lente_id    | false     | false      |
| idx_pedidos_fornecedor_nome        | fornecedor_nome        | false     | false      |
| idx_pedidos_garantia               | eh_garantia            | false     | false      |
| idx_pedidos_grupo_canonico         | grupo_canonico_id      | false     | false      |
| idx_pedidos_grupo_canonico_id      | grupo_canonico_id      | false     | false      |
| idx_pedidos_laboratorio            | laboratorio_id         | false     | false      |
| idx_pedidos_laboratorio_data       | data_pedido            | false     | false      |
| idx_pedidos_laboratorio_data       | laboratorio_id         | false     | false      |
| idx_pedidos_laboratorio_id         | laboratorio_id         | false     | false      |
| idx_pedidos_lente_catalogo_id      | lente_catalogo_id      | false     | false      |
| idx_pedidos_lente_selecionada      | lente_selecionada_id   | false     | false      |
| idx_pedidos_lente_selecionada_id   | lente_selecionada_id   | false     | false      |
| idx_pedidos_loja                   | loja_id                | false     | false      |
| idx_pedidos_loja_id                | loja_id                | false     | false      |
| idx_pedidos_numero_os              | numero_os_fisica       | false     | false      |
| idx_pedidos_numero_os_fisica       | numero_os_fisica       | false     | false      |
| idx_pedidos_os_fisica              | os_fisica              | false     | false      |
| idx_pedidos_os_laboratorio         | os_laboratorio         | false     | false      |
| idx_pedidos_selecao_automatica     | selecao_automatica     | false     | false      |
| idx_pedidos_status                 | status                 | false     | false      |
| idx_pedidos_status_data            | data_pedido            | false     | false      |
| idx_pedidos_status_data            | status                 | false     | false      |
| idx_pedidos_tipo_pedido            | tipo_pedido            | false     | false      |
| idx_pedidos_tratamentos_lente      | tratamentos_lente      | false     | false      |
| idx_pedidos_updated_at             | updated_at             | false     | false      |
| pedidos_numero_sequencial_key      | numero_sequencial      | true      | false      |
| pedidos_pkey                       | id                     | true      | true       |

-- 9️⃣ VERIFICAR GRANTS/PERMISSÕES NA TABELA PEDIDOS
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges
WHERE table_name = 'pedidos'
ORDER BY grantee, privilege_type;


| grantee       | privilege_type | is_grantable |
| ------------- | -------------- | ------------ |
| PUBLIC        | DELETE         | NO           |
| PUBLIC        | INSERT         | NO           |
| PUBLIC        | REFERENCES     | NO           |
| PUBLIC        | SELECT         | NO           |
| PUBLIC        | TRIGGER        | NO           |
| PUBLIC        | TRUNCATE       | NO           |
| PUBLIC        | UPDATE         | NO           |
| anon          | DELETE         | NO           |
| anon          | INSERT         | NO           |
| anon          | REFERENCES     | NO           |
| anon          | SELECT         | NO           |
| anon          | TRIGGER        | NO           |
| anon          | TRUNCATE       | NO           |
| anon          | UPDATE         | NO           |
| authenticated | DELETE         | NO           |
| authenticated | INSERT         | NO           |
| authenticated | REFERENCES     | NO           |
| authenticated | SELECT         | NO           |
| authenticated | TRIGGER        | NO           |
| authenticated | TRUNCATE       | NO           |
| authenticated | UPDATE         | NO           |
| postgres      | DELETE         | YES          |
| postgres      | INSERT         | YES          |
| postgres      | REFERENCES     | YES          |
| postgres      | SELECT         | YES          |
| postgres      | TRIGGER        | YES          |
| postgres      | TRUNCATE       | YES          |
| postgres      | UPDATE         | YES          |
| service_role  | DELETE         | NO           |
| service_role  | INSERT         | NO           |
| service_role  | REFERENCES     | NO           |
| service_role  | SELECT         | NO           |
| service_role  | TRIGGER        | NO           |
| service_role  | TRUNCATE       | NO           |
| service_role  | UPDATE         | NO           |


-- 🔟 VERIFICAR LABORATÓRIOS ATIVOS
SELECT 
  id,
  nome,
  codigo,
  ativo,
  sla_padrao_dias
FROM laboratorios
ORDER BY ativo DESC, nome;


| id                                   | nome                         | codigo       | ativo | sla_padrao_dias |
| ------------------------------------ | ---------------------------- | ------------ | ----- | --------------- |
| 21e9cb25-ca46-42f9-b297-db1e693325ed | 2K                           | 2KSUZANO     | true  | 2               |
| 3a65944b-330a-4b56-b983-f0f3de3905a1 | Blue Optical                 | BLUE_OPTICAL | true  | 7               |
| 8ce109c1-69d3-484a-a87b-8accf7984132 | Brascor                      | BRASCOR      | true  | 7               |
| d7cc1746-0749-40d6-97b6-94e50c7a1d1b | Braslentes                   | BRASLENTES   | true  | 10              |
| 68233923-a12b-4c65-a3ca-7c5fec265336 | Douglas - Laboratório        | DOU          | true  | 5               |
| 74dc986a-1063-4b8e-8964-59eb396e10eb | Express                      | EXPRESS      | true  | 3               |
| 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | HighVision                   | HIGHVISION   | true  | 7               |
| 61f4303c-c8a3-4e3e-a064-e19783a0a2eb | Hoya                         | HOYA         | true  | 15              |
| a2f98c18-abb8-4434-8cc3-7bd254892894 | Polylux                      | POLYLUX      | true  | 7               |
| b3c580a3-02a3-40fa-938a-fc2a26cbc671 | So Blocos                    | SO_BLOCOS    | true  | 7               |
| 7a45dd7b-127c-40a0-9af5-e732ca3f02a9 | Solótica - Lentes de Contato | SOLOTICA     | true  | 2               |
| 3e51a952-326f-4300-86e4-153df8d7f893 | Style                        | STYLE        | true  | 7               |
| 2861abfc-7a83-4929-9e9f-7c2541f863f0 | Sygma                        | SYGMA        | true  | 7               |
| f2954dac-a0a5-47db-9238-e4e2fa748281 | Thiago - Laboratório         | THI          | true  | 5               |

-- 1️⃣1️⃣ VERIFICAR ÚLTIMO PEDIDO CRIADO
SELECT 
  id,
  numero_sequencial,
  loja_id,
  laboratorio_id,
  classe_lente_id,
  status,
  prioridade,
  cliente_nome,
  created_at,
  updated_at
FROM pedidos
ORDER BY created_at DESC
LIMIT 5;


| id                                   | numero_sequencial | loja_id                              | laboratorio_id                       | classe_lente_id                      | status    | prioridade | cliente_nome                                | created_at                    | updated_at                    |
| ------------------------------------ | ----------------- | ------------------------------------ | ------------------------------------ | ------------------------------------ | --------- | ---------- | ------------------------------------------- | ----------------------------- | ----------------------------- |
| e51f2e04-7e86-422e-bcfd-3ba50a6d213b | 694               | bab835bc-2df1-4f54-87c3-8151c61ec642 | null                                 | null                                 | RASCUNHO  | NORMAL     | gqwregqwer                                  | 2026-01-21 14:06:02.778357+00 | 2026-01-21 14:06:02.778357+00 |
| 501d27f7-47fb-46fb-af2f-a9bb29eb6f8d | 684               | bab835bc-2df1-4f54-87c3-8151c61ec642 | null                                 | null                                 | RASCUNHO  | NORMAL     | ergerg                                      | 2026-01-19 15:43:54.612+00    | 2026-01-21 13:49:52.310441+00 |
| d747b999-694c-4ad8-a9dc-519fb4d51579 | 683               | bab835bc-2df1-4f54-87c3-8151c61ec642 | null                                 | null                                 | PRODUCAO  | NORMAL     | rwfrf                                       | 2026-01-17 14:50:07.612543+00 | 2026-01-21 13:49:52.310441+00 |
| 18ebd8aa-7245-4355-9ffe-87188ab91575 | 682               | bab835bc-2df1-4f54-87c3-8151c61ec642 | null                                 | null                                 | CANCELADO | NORMAL     | fewargaw                                    | 2026-01-16 22:54:39.568965+00 | 2026-01-19 20:25:49.353713+00 |
| e73ccccb-9b6b-4205-9241-d039b750dffe | 673               | bab835bc-2df1-4f54-87c3-8151c61ec642 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | 94b19d53-6bcb-4ef1-a027-2b65b53e91c2 | CANCELADO | NORMAL     | SIMONE CRISTINA DE QUEIROZ OLIVEIRA (ANDRE) | 2026-01-15 00:18:11.60548+00  | 2026-01-19 20:25:49.353713+00 |


-- 1️⃣2️⃣ VERIFICAR SE HÁ SEQUÊNCIAS QUEBRADAS
SELECT 
  sequencename,
  last_value,
  max_value,
  increment_by
FROM pg_sequences
WHERE sequencename ILIKE '%pedido%' OR sequencename ILIKE '%os%';


| sequencename                  | last_value | max_value  | increment_by |
| ----------------------------- | ---------- | ---------- | ------------ |
| pedidos_numero_sequencial_seq | 695        | 2147483647 | 1            |

-- ============================================================
-- ✅ EXECUTE TODAS AS QUERIES E ENVIE OS RESULTADOS
-- ============================================================
