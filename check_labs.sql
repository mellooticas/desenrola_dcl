-- Consultar laboratórios cadastrados
SELECT 
  COUNT(*) as total_labs,
  COUNT(*) FILTER (WHERE ativo = true) as ativos,
  COUNT(*) FILTER (WHERE ativo = false) as inativos
FROM laboratorios;

-- Lista de laboratórios
SELECT 
  nome,
  codigo,
  sla_padrao_dias,
  trabalha_sabado,
  ativo,
  CASE 
    WHEN contato->>'email' IS NOT NULL THEN '✓ Email'
    ELSE '✗ Email'
  END as tem_contato
FROM laboratorios
ORDER BY ativo DESC, nome;
