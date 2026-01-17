-- ========================================
-- MIGRATION: Adicionar campos do Wizard V2 de Lentes
-- Data: 2026-01-16
-- Descrição: Adiciona campos necessários para lançamento manual de pedidos
-- ========================================

-- 1. Adicionar coluna classe_lente (bronze, prata, ouro, platinum)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pedidos' AND column_name = 'classe_lente'
    ) THEN
        ALTER TABLE pedidos ADD COLUMN classe_lente TEXT;
        
        -- Adicionar constraint para valores permitidos
        ALTER TABLE pedidos ADD CONSTRAINT classe_lente_check 
            CHECK (classe_lente IN ('bronze', 'prata', 'ouro', 'platinum'));
        
        -- Definir valor padrão
        ALTER TABLE pedidos ALTER COLUMN classe_lente SET DEFAULT 'prata';
        
        -- Comentário
        COMMENT ON COLUMN pedidos.classe_lente IS 'Classe/categoria da lente vendida (bronze, prata, ouro, platinum)';
        
        RAISE NOTICE '✅ Coluna classe_lente adicionada';
    ELSE
        RAISE NOTICE '⚠️ Coluna classe_lente já existe';
    END IF;
END $$;

-- 2. Adicionar coluna os_fisica (número da OS física da loja)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pedidos' AND column_name = 'os_fisica'
    ) THEN
        ALTER TABLE pedidos ADD COLUMN os_fisica TEXT;
        
        -- Comentário
        COMMENT ON COLUMN pedidos.os_fisica IS 'Número da Ordem de Serviço física da loja';
        
        RAISE NOTICE '✅ Coluna os_fisica adicionada';
    ELSE
        RAISE NOTICE '⚠️ Coluna os_fisica já existe';
    END IF;
END $$;

-- 3. Adicionar coluna os_laboratorio (número da OS do laboratório)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pedidos' AND column_name = 'os_laboratorio'
    ) THEN
        ALTER TABLE pedidos ADD COLUMN os_laboratorio TEXT;
        
        -- Comentário
        COMMENT ON COLUMN pedidos.os_laboratorio IS 'Número da Ordem de Serviço do laboratório/fornecedor';
        
        RAISE NOTICE '✅ Coluna os_laboratorio adicionada';
    ELSE
        RAISE NOTICE '⚠️ Coluna os_laboratorio já existe';
    END IF;
END $$;

-- 4. Adicionar coluna data_os (data da venda/OS)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pedidos' AND column_name = 'data_os'
    ) THEN
        ALTER TABLE pedidos ADD COLUMN data_os DATE;
        
        -- Definir valor padrão como data atual
        ALTER TABLE pedidos ALTER COLUMN data_os SET DEFAULT CURRENT_DATE;
        
        -- Comentário
        COMMENT ON COLUMN pedidos.data_os IS 'Data da venda/criação da Ordem de Serviço';
        
        RAISE NOTICE '✅ Coluna data_os adicionada';
    ELSE
        RAISE NOTICE '⚠️ Coluna data_os já existe';
    END IF;
END $$;

-- 5. Adicionar coluna lente_catalogo_id (FK para catálogo de lentes)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pedidos' AND column_name = 'lente_catalogo_id'
    ) THEN
        ALTER TABLE pedidos ADD COLUMN lente_catalogo_id TEXT;
        
        -- Comentário
        COMMENT ON COLUMN pedidos.lente_catalogo_id IS 'ID da lente específica no catálogo best_lens (v_lentes_catalogo)';
        
        RAISE NOTICE '✅ Coluna lente_catalogo_id adicionada';
    ELSE
        RAISE NOTICE '⚠️ Coluna lente_catalogo_id já existe';
    END IF;
END $$;

-- 6. Adicionar coluna preco_custo (custo da lente para análise de margem)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pedidos' AND column_name = 'preco_custo'
    ) THEN
        ALTER TABLE pedidos ADD COLUMN preco_custo NUMERIC(10,2);
        
        -- Comentário
        COMMENT ON COLUMN pedidos.preco_custo IS 'Custo da lente (para cálculo de margem e análise financeira)';
        
        RAISE NOTICE '✅ Coluna preco_custo adicionada';
    ELSE
        RAISE NOTICE '⚠️ Coluna preco_custo já existe';
    END IF;
END $$;

-- 7. Verificar se data_previsao_entrega existe (provavelmente já existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pedidos' AND column_name = 'data_previsao_entrega'
    ) THEN
        ALTER TABLE pedidos ADD COLUMN data_previsao_entrega DATE;
        
        COMMENT ON COLUMN pedidos.data_previsao_entrega IS 'Data prevista de entrega do laboratório';
        
        RAISE NOTICE '✅ Coluna data_previsao_entrega adicionada';
    ELSE
        RAISE NOTICE '⚠️ Coluna data_previsao_entrega já existe';
    END IF;
END $$;

-- 8. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pedidos_os_fisica ON pedidos(os_fisica);
CREATE INDEX IF NOT EXISTS idx_pedidos_os_laboratorio ON pedidos(os_laboratorio);
CREATE INDEX IF NOT EXISTS idx_pedidos_data_os ON pedidos(data_os);
CREATE INDEX IF NOT EXISTS idx_pedidos_lente_catalogo_id ON pedidos(lente_catalogo_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_classe_lente ON pedidos(classe_lente);

-- 9. Verificar estrutura final
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'pedidos' 
AND column_name IN (
    'classe_lente', 'os_fisica', 'os_laboratorio', 
    'data_os', 'lente_catalogo_id', 'preco_custo', 'data_previsao_entrega'
)
ORDER BY column_name;

-- ========================================
-- ✅ MIGRATION CONCLUÍDA
-- Execute este script no SQL Editor do Supabase
-- ========================================
| column_name           | data_type | column_default | is_nullable |
| --------------------- | --------- | -------------- | ----------- |
| classe_lente          | text      | 'prata'::text  | YES         |
| data_os               | date      | CURRENT_DATE   | YES         |
| data_previsao_entrega | date      | null           | YES         |
| lente_catalogo_id     | text      | null           | YES         |
| os_fisica             | text      | null           | YES         |
| os_laboratorio        | text      | null           | YES         |
| preco_custo           | numeric   | null           | YES         |

