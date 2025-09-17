-- Criação da tabela pedidos_timeline para rastreamento de mudanças de status
-- Esta tabela registra cada mudança de status dos pedidos para análise de timeline

CREATE TABLE IF NOT EXISTS pedidos_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  responsavel_id UUID REFERENCES usuarios(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE pedidos_timeline ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Todos podem visualizar timeline" ON pedidos_timeline
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir timeline" ON pedidos_timeline
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar timeline" ON pedidos_timeline
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pedidos_timeline_pedido_id ON pedidos_timeline(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_timeline_status_novo ON pedidos_timeline(status_novo);
CREATE INDEX IF NOT EXISTS idx_pedidos_timeline_created_at ON pedidos_timeline(created_at);
CREATE INDEX IF NOT EXISTS idx_pedidos_timeline_responsavel ON pedidos_timeline(responsavel_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_pedidos_timeline_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_pedidos_timeline_updated_at
  BEFORE UPDATE ON pedidos_timeline
  FOR EACH ROW
  EXECUTE FUNCTION update_pedidos_timeline_updated_at();

-- Função para inserir automaticamente na timeline quando status do pedido muda
CREATE OR REPLACE FUNCTION inserir_timeline_pedido()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir entrada na timeline quando o status muda
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO pedidos_timeline (
      pedido_id,
      status_anterior,
      status_novo,
      responsavel_id,
      observacoes
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      COALESCE(NEW.updated_by::UUID, auth.uid()),
      CASE 
        WHEN NEW.status = 'CANCELADO' THEN 'Pedido cancelado'
        WHEN NEW.status = 'ENTREGUE' THEN 'Pedido entregue ao cliente'
        ELSE 'Status atualizado automaticamente'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger na tabela pedidos para inserção automática na timeline
CREATE TRIGGER trigger_pedidos_timeline
  AFTER UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION inserir_timeline_pedido();

-- Inserir timeline inicial para pedidos existentes (migração de dados)
INSERT INTO pedidos_timeline (pedido_id, status_anterior, status_novo, created_at)
SELECT 
  p.id,
  NULL as status_anterior,
  p.status as status_novo,
  p.created_at
FROM pedidos p
WHERE NOT EXISTS (
  SELECT 1 FROM pedidos_timeline pt WHERE pt.pedido_id = p.id
)
ON CONFLICT DO NOTHING;

-- Comentários
COMMENT ON TABLE pedidos_timeline IS 'Tabela para rastreamento de mudanças de status dos pedidos, permitindo análise de timeline e lead time';
COMMENT ON COLUMN pedidos_timeline.status_anterior IS 'Status anterior do pedido (NULL para primeira entrada)';
COMMENT ON COLUMN pedidos_timeline.status_novo IS 'Novo status do pedido';
COMMENT ON COLUMN pedidos_timeline.responsavel_id IS 'ID do usuário responsável pela mudança';
COMMENT ON COLUMN pedidos_timeline.observacoes IS 'Observações sobre a mudança de status';