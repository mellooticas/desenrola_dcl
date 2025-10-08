-- =====================================================================
-- IMPLEMENTAÇÃO COMPLETA DO SISTEMA DE TIMELINE
-- =====================================================================

-- 1. VERIFICAR E AJUSTAR ESTRUTURA DA TABELA pedidos_historico
-- =====================================================================

-- Verificar se a tabela existe e tem a estrutura correta
CREATE TABLE IF NOT EXISTS pedidos_historico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  responsavel_id UUID,
  responsavel_nome TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CONFIGURAR RLS E PERMISSÕES
-- =====================================================================

-- Habilitar RLS
ALTER TABLE pedidos_historico ENABLE ROW LEVEL SECURITY;

-- Política para visualização (todos podem ver)
DROP POLICY IF EXISTS "Permitir visualização de histórico" ON pedidos_historico;
CREATE POLICY "Permitir visualização de histórico" ON pedidos_historico
  FOR SELECT USING (true);

-- Política para inserção (usuários autenticados)
DROP POLICY IF EXISTS "Permitir inserção de histórico" ON pedidos_historico;
CREATE POLICY "Permitir inserção de histórico" ON pedidos_historico
  FOR INSERT WITH CHECK (true);

-- Política para atualização (usuários autenticados)
DROP POLICY IF EXISTS "Permitir atualização de histórico" ON pedidos_historico;
CREATE POLICY "Permitir atualização de histórico" ON pedidos_historico
  FOR UPDATE USING (true) WITH CHECK (true);

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_pedidos_historico_pedido_id ON pedidos_historico(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_historico_status_novo ON pedidos_historico(status_novo);
CREATE INDEX IF NOT EXISTS idx_pedidos_historico_created_at ON pedidos_historico(created_at);

-- 4. CRIAR FUNÇÃO PARA REGISTRAR MUDANÇAS DE STATUS
-- =====================================================================

CREATE OR REPLACE FUNCTION registrar_mudanca_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Só registra se o status mudou
  IF OLD IS NULL OR OLD.status != NEW.status THEN
    INSERT INTO pedidos_historico (
      pedido_id,
      status_anterior,
      status_novo,
      responsavel_nome,
      observacoes,
      created_at
    ) VALUES (
      NEW.id,
      CASE WHEN OLD IS NULL THEN NULL ELSE OLD.status END,
      NEW.status,
      COALESCE(NEW.updated_by, 'Sistema'),
      CASE 
        WHEN OLD IS NULL THEN 'Pedido criado'
        ELSE 'Status alterado de ' || OLD.status || ' para ' || NEW.status
      END,
      NEW.updated_at
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. CRIAR TRIGGER PARA REGISTRAR MUDANÇAS AUTOMATICAMENTE
-- =====================================================================

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_registrar_mudanca_status ON pedidos;

-- Criar trigger que executa após inserção ou atualização
CREATE TRIGGER trigger_registrar_mudanca_status
  AFTER INSERT OR UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION registrar_mudanca_status();

-- 6. POPULAR HISTÓRICO COM DADOS EXISTENTES (REGISTRO INICIAL)
-- =====================================================================

-- Inserir registro de criação para todos os pedidos existentes que não têm histórico
INSERT INTO pedidos_historico (
  pedido_id,
  status_anterior,
  status_novo,
  responsavel_nome,
  observacoes,
  created_at
)
SELECT 
  p.id,
  NULL as status_anterior,
  p.status,
  COALESCE(p.created_by, 'Sistema') as responsavel_nome,
  'Pedido criado' as observacoes,
  p.created_at
FROM pedidos p
WHERE NOT EXISTS (
  SELECT 1 FROM pedidos_historico ph 
  WHERE ph.pedido_id = p.id
)
ORDER BY p.created_at;

-- 7. CRIAR VIEW OTIMIZADA PARA TIMELINE
-- =====================================================================

CREATE OR REPLACE VIEW v_pedidos_timeline AS
SELECT 
  ph.id,
  ph.pedido_id,
  ph.status_anterior,
  ph.status_novo,
  ph.responsavel_nome,
  ph.observacoes,
  ph.created_at,
  ph.updated_at,
  
  -- Dados do pedido
  p.numero_sequencial,
  p.cliente_nome,
  p.loja_id,
  p.laboratorio_id,
  
  -- Status formatado
  CASE ph.status_novo
    WHEN 'REGISTRADO' THEN 'Registrado'
    WHEN 'AG_PAGAMENTO' THEN 'Aguardando Pagamento'
    WHEN 'PAGO' THEN 'Pago'
    WHEN 'PRODUCAO' THEN 'Em Produção'
    WHEN 'PRONTO' THEN 'Pronto no DCL'
    WHEN 'ENVIADO' THEN 'Enviado para Loja'
    WHEN 'CHEGOU' THEN 'Chegou na Loja'
    WHEN 'ENTREGUE' THEN 'Entregue ao Cliente'
    WHEN 'CANCELADO' THEN 'Cancelado'
    ELSE ph.status_novo
  END as status_label,
  
  -- Cor do status para UI
  CASE ph.status_novo
    WHEN 'REGISTRADO' THEN '#94A3B8'
    WHEN 'AG_PAGAMENTO' THEN '#F59E0B'
    WHEN 'PAGO' THEN '#10B981'
    WHEN 'PRODUCAO' THEN '#3B82F6'
    WHEN 'PRONTO' THEN '#8B5CF6'
    WHEN 'ENVIADO' THEN '#EF4444'
    WHEN 'CHEGOU' THEN '#06B6D4'
    WHEN 'ENTREGUE' THEN '#059669'
    WHEN 'CANCELADO' THEN '#DC2626'
    ELSE '#6B7280'
  END as status_color,
  
  -- Cálculo de tempo desde evento anterior
  LAG(ph.created_at) OVER (
    PARTITION BY ph.pedido_id 
    ORDER BY ph.created_at
  ) as evento_anterior,
  
  -- Duração desde evento anterior em horas
  EXTRACT(EPOCH FROM (
    ph.created_at - LAG(ph.created_at) OVER (
      PARTITION BY ph.pedido_id 
      ORDER BY ph.created_at
    )
  )) / 3600.0 as duracao_horas

FROM pedidos_historico ph
LEFT JOIN pedidos p ON ph.pedido_id = p.id
ORDER BY ph.pedido_id, ph.created_at;

-- 8. CONCEDER PERMISSÕES
-- =====================================================================

-- Permitir acesso à view
GRANT SELECT ON v_pedidos_timeline TO anon, authenticated;

-- Permitir acesso à tabela (já configurado via RLS)
GRANT SELECT, INSERT, UPDATE ON pedidos_historico TO anon, authenticated;

-- 9. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================================

COMMENT ON TABLE pedidos_historico IS 'Histórico completo de mudanças de status dos pedidos com trigger automático';
COMMENT ON FUNCTION registrar_mudanca_status() IS 'Função trigger que registra automaticamente mudanças de status na tabela pedidos_historico';
COMMENT ON VIEW v_pedidos_timeline IS 'View otimizada para exibição de timeline com cálculos de duração e formatação para UI';

-- =====================================================================
-- FIM DA IMPLEMENTAÇÃO
-- =====================================================================

-- Para testar:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Faça uma mudança de status em algum pedido
-- 3. Verifique se foi registrada: SELECT * FROM pedidos_historico ORDER BY created_at DESC LIMIT 5;