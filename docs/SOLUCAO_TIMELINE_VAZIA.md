# 🔧 Implementação do Sistema de Timeline

## ❌ Problema Identificado

A **timeline dos pedidos está vazia** porque:
1. A tabela `pedidos_historico` existe mas está vazia (0 registros)
2. Não existe **trigger** para registrar automaticamente as mudanças de status
3. Quando um pedido muda de status no kanban, essa mudança não é gravada

## ✅ Solução Implementada

Criado script SQL completo que:

### 1. **Configura Estrutura da Tabela**
- Garante que `pedidos_historico` tem todos os campos necessários
- Adiciona campo `responsavel_nome` para não depender de JOINs

### 2. **Configura Permissões (RLS)**
```sql
-- Permite visualização pública
CREATE POLICY "Permitir visualização de histórico" ON pedidos_historico
  FOR SELECT USING (true);

-- Permite inserção automática por triggers
CREATE POLICY "Permitir inserção de histórico" ON pedidos_historico
  FOR INSERT WITH CHECK (true);
```

### 3. **Cria Trigger Automático**
```sql
CREATE OR REPLACE FUNCTION registrar_mudanca_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Registra APENAS se o status mudou
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

CREATE TRIGGER trigger_registrar_mudanca_status
  AFTER INSERT OR UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION registrar_mudanca_status();
```

### 4. **Popula Histórico Inicial**
```sql
-- Cria registro de criação para todos os pedidos existentes
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
  NULL,
  p.status,
  COALESCE(p.created_by, 'Sistema'),
  'Pedido criado',
  p.created_at
FROM pedidos p
WHERE NOT EXISTS (
  SELECT 1 FROM pedidos_historico ph 
  WHERE ph.pedido_id = p.id
);
```

### 5. **Cria View Otimizada**
```sql
CREATE OR REPLACE VIEW v_pedidos_timeline AS
SELECT 
  ph.*,
  p.numero_sequencial,
  p.cliente_nome,
  -- Status formatado para UI
  CASE ph.status_novo
    WHEN 'REGISTRADO' THEN 'Registrado'
    WHEN 'AG_PAGAMENTO' THEN 'Aguardando Pagamento'
    ...
  END as status_label,
  -- Cor para UI
  CASE ph.status_novo
    WHEN 'REGISTRADO' THEN '#94A3B8'
    ...
  END as status_color,
  -- Duração desde evento anterior
  EXTRACT(EPOCH FROM (
    ph.created_at - LAG(ph.created_at) OVER (
      PARTITION BY ph.pedido_id 
      ORDER BY ph.created_at
    )
  )) / 3600.0 as duracao_horas
FROM pedidos_historico ph
LEFT JOIN pedidos p ON ph.pedido_id = p.id;
```

## 📝 Como Aplicar

### Opção 1: Via Supabase Dashboard (RECOMENDADO)
1. Acesse https://zobgyjsocqmzaggrnwqd.supabase.co
2. Vá em **SQL Editor**
3. Cole o conteúdo de `implementar-timeline-completa.sql`
4. Execute (Run)

### Opção 2: Via API (alternativo)
```bash
node aplicar-timeline.js
```

## 🔍 Verificação

Após aplicar, verifique:

```sql
-- Ver total de registros
SELECT COUNT(*) FROM pedidos_historico;

-- Ver últimos eventos
SELECT 
  ph.pedido_id,
  ph.status_anterior,
  ph.status_novo,
  ph.responsavel_nome,
  ph.created_at
FROM pedidos_historico ph
ORDER BY ph.created_at DESC
LIMIT 10;

-- Testar trigger: altere um status
UPDATE pedidos 
SET status = 'PAGO', updated_by = 'Teste Timeline' 
WHERE id = (SELECT id FROM pedidos LIMIT 1);

-- Verificar se registrou
SELECT * FROM pedidos_historico ORDER BY created_at DESC LIMIT 3;
```

## 📋 Próximos Passos

Depois de aplicar o SQL:

1. ✅ Atualizar componente `PedidoTimelinePage` para usar `pedidos_historico` em vez de `pedidos_timeline`
2. ✅ Testar movimentação no kanban para ver se registra
3. ✅ Verificar que timeline agora mostra histórico completo

## 🎯 Resultado Esperado

- **Timeline mostrará** todos os eventos de cada pedido
- **Novos registros** automáticos a cada mudança de status no kanban
- **Histórico completo** desde a criação até o status atual
- **Performance otimizada** com view e índices