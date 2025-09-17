-- Script para aplicar todas as migrações de timeline em ordem
-- Execute este arquivo no seu banco Supabase

-- 1. Primeiro criar a tabela pedidos_timeline
\i 019_create_pedidos_timeline_table.sql

-- 2. Depois criar a view de lead time comparativo
\i 020_create_lead_time_comparativo_view.sql

-- 3. Por último criar a view de timeline completo
\i 021_create_timeline_completo_view.sql