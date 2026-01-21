-- ===================================================================
-- SOLUÇÃO: TABELA DE MAPEAMENTO FORNECEDORES
-- ===================================================================
-- Data: 21/01/2026
-- Problema: UUIDs de core.fornecedores (SIS_LENS) são DIFERENTES 
--           dos UUIDs de laboratorios (DESENROLA_DCL)
-- Solução: Criar tabela de mapeamento para traduzir entre os bancos
-- ===================================================================

-- 1️⃣ CRIAR TABELA DE MAPEAMENTO
CREATE TABLE IF NOT EXISTS public.mapeamento_fornecedor_laboratorio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- IDs dos sistemas
  fornecedor_id_sis_lens UUID NOT NULL, -- UUID do core.fornecedores (SIS_LENS)
  laboratorio_id_desenrola UUID NOT NULL REFERENCES laboratorios(id), -- UUID do laboratorios (DESENROLA_DCL)
  
  -- Nome para conferência
  nome_laboratorio TEXT NOT NULL,
  
  -- Metadados
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  ativo BOOLEAN DEFAULT true,
  
  -- Constraints
  UNIQUE(fornecedor_id_sis_lens),
  UNIQUE(laboratorio_id_desenrola)
);

-- 2️⃣ INSERIR MAPEAMENTOS BASEADOS NOS DADOS COLETADOS
-- Mapeamento por NOME (conferido manualmente)

INSERT INTO public.mapeamento_fornecedor_laboratorio 
  (fornecedor_id_sis_lens, laboratorio_id_desenrola, nome_laboratorio)
VALUES
  -- Braslentes
  ('43721f5b-4f4a-4a75-bb34-6e8b373c5948', 'd7cc1746-0749-40d6-97b6-94e50c7a1d1b', 'Braslentes'),
  
  -- Brascor
  ('15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1', '8ce109c1-69d3-484a-a87b-8accf7984132', 'Brascor'),
  
  -- Express
  ('8eb9498c-3d99-4d26-bb8c-e503f97ccf2c', '74dc986a-1063-4b8e-8964-59eb396e10eb', 'Express'),
  
  -- Polylux
  ('3a0a8ad3-4c55-44a2-b9fa-232a9f2fdc21', 'a2f98c18-abb8-4434-8cc3-7bd254892894', 'Polylux'),
  
  -- So Blocos
  ('e1e1eace-11b4-4f26-9f15-620808a4a410', 'b3c580a3-02a3-40fa-938a-fc2a26cbc671', 'So Blocos'),
  
  -- Style
  ('d88018ac-ecae-4b38-b321-94babe5f85e3', '3e51a952-326f-4300-86e4-153df8d7f893', 'Style'),
  
  -- Sygma
  ('199bae08-0217-4b70-b054-d3f0960b4a78', '2861abfc-7a83-4929-9e9f-7c2541f863f0', 'Sygma')
  
ON CONFLICT (fornecedor_id_sis_lens) DO NOTHING;

-- 3️⃣ CRIAR FUNÇÃO DE CONVERSÃO
CREATE OR REPLACE FUNCTION public.converter_fornecedor_para_laboratorio(
  p_fornecedor_id_sis_lens UUID
)
RETURNS UUID
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_laboratorio_id UUID;
BEGIN
  -- Buscar na tabela de mapeamento
  SELECT laboratorio_id_desenrola 
  INTO v_laboratorio_id
  FROM public.mapeamento_fornecedor_laboratorio
  WHERE fornecedor_id_sis_lens = p_fornecedor_id_sis_lens
    AND ativo = true;
  
  RETURN v_laboratorio_id;
END;
$$;

-- 4️⃣ COMENTÁRIOS
COMMENT ON TABLE public.mapeamento_fornecedor_laboratorio IS 
'Mapeamento entre UUIDs de fornecedores (SIS_LENS) e laboratórios (DESENROLA_DCL).
Necessário porque os UUIDs são diferentes entre os sistemas.';

COMMENT ON FUNCTION public.converter_fornecedor_para_laboratorio IS 
'Converte UUID de fornecedor (SIS_LENS) para UUID de laboratório (DESENROLA_DCL).
Retorna NULL se não encontrar mapeamento.';

-- 5️⃣ GRANTS
GRANT SELECT ON public.mapeamento_fornecedor_laboratorio TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.converter_fornecedor_para_laboratorio TO anon, authenticated;

-- 6️⃣ TESTE DO MAPEAMENTO
SELECT 
  m.nome_laboratorio,
  m.fornecedor_id_sis_lens,
  m.laboratorio_id_desenrola,
  l.nome as nome_no_desenrola,
  l.codigo
FROM public.mapeamento_fornecedor_laboratorio m
JOIN laboratorios l ON l.id = m.laboratorio_id_desenrola
ORDER BY m.nome_laboratorio;


| nome_laboratorio | fornecedor_id_sis_lens               | laboratorio_id_desenrola             | nome_no_desenrola | codigo     |
| ---------------- | ------------------------------------ | ------------------------------------ | ----------------- | ---------- |
| Brascor          | 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | 8ce109c1-69d3-484a-a87b-8accf7984132 | Brascor           | BRASCOR    |
| Braslentes       | 43721f5b-4f4a-4a75-bb34-6e8b373c5948 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | Braslentes        | BRASLENTES |
| Express          | 8eb9498c-3d99-4d26-bb8c-e503f97ccf2c | 74dc986a-1063-4b8e-8964-59eb396e10eb | Express           | EXPRESS    |
| Polylux          | 3a0a8ad3-4c55-44a2-b9fa-232a9f2fdc21 | a2f98c18-abb8-4434-8cc3-7bd254892894 | Polylux           | POLYLUX    |
| So Blocos        | e1e1eace-11b4-4f26-9f15-620808a4a410 | b3c580a3-02a3-40fa-938a-fc2a26cbc671 | So Blocos         | SO_BLOCOS  |
| Style            | d88018ac-ecae-4b38-b321-94babe5f85e3 | 3e51a952-326f-4300-86e4-153df8d7f893 | Style             | STYLE      |
| Sygma            | 199bae08-0217-4b70-b054-d3f0960b4a78 | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | Sygma             | SYGMA      |


-- 7️⃣ TESTE DA FUNÇÃO
SELECT 
  'Express SIS_LENS' as teste,
  '8eb9498c-3d99-4d26-bb8c-e503f97ccf2c'::uuid as uuid_sis_lens,
  converter_fornecedor_para_laboratorio('8eb9498c-3d99-4d26-bb8c-e503f97ccf2c'::uuid) as uuid_desenrola,
  (SELECT nome FROM laboratorios 
   WHERE id = converter_fornecedor_para_laboratorio('8eb9498c-3d99-4d26-bb8c-e503f97ccf2c'::uuid)) as nome_laboratorio;


| teste            | uuid_sis_lens                        | uuid_desenrola                       | nome_laboratorio |
| ---------------- | ------------------------------------ | ------------------------------------ | ---------------- |
| Express SIS_LENS | 8eb9498c-3d99-4d26-bb8c-e503f97ccf2c | 74dc986a-1063-4b8e-8964-59eb396e10eb | Express          |
