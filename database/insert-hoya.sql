-- ============================================
-- 🏭 INSERÇÃO DO LABORATÓRIO HOYA
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- Data: 13/11/2025

INSERT INTO laboratorios (
  nome,
  codigo,
  sla_padrao_dias,
  trabalha_sabado,
  ativo,
  contato
) VALUES (
  'Hoya',                           -- Nome do laboratório
  'HOYA',                           -- Código identificador
  7,                                -- SLA padrão: 7 dias (ajuste conforme necessário)
  false,                            -- Não trabalha aos sábados (ajuste se necessário)
  true,                             -- Ativo
  jsonb_build_object(
    'email', 'contato@hoya.com.br',   -- Email padrão (confirme o real)
    'telefone', '',                    -- Adicione o telefone quando souber
    'endereco', 'São Paulo - SP'       -- Ajuste o endereço completo
  )
);

-- ============================================
-- ✅ VERIFICAÇÃO
-- ============================================
-- Confirma que o laboratório foi inserido

SELECT 
  nome,
  codigo,
  sla_padrao_dias,
  trabalha_sabado,
  ativo,
  contato->>'email' as email,
  created_at
FROM laboratorios 
WHERE codigo = 'HOYA';

-- ============================================
-- 📊 NOVO TOTAL DE LABORATÓRIOS
-- ============================================

SELECT 
  COUNT(*) as total_laboratorios,
  COUNT(*) FILTER (WHERE ativo = true) as ativos
FROM laboratorios;
