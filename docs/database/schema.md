# 🗄️ Banco de Dados

Documentação completa da estrutura REAL do banco de dados PostgreSQL (Supabase) do sistema Desenrola DCL.

## 📊 Visão Geral

O banco de dados utiliza **PostgreSQL** hospedado no **Supabase** com as seguintes características:
- **Row Level Security (RLS)** habilitado
- **Triggers** para automação
- **Views** otimizadas para consultas
- **Índices** para performance
- **18 tabelas** principais operando
- **17 views** complexas para dashboard

## � Status Atual do Banco

### � Dados em Produção
- **Pedidos**: 2.948 registros
- **Usuários**: 6 registros  
- **Lojas**: 7 registros
- **Laboratórios**: 9 registros

### 📋 Status dos Pedidos
| Status | Quantidade |
|--------|------------|
| ENTREGUE | 2.203 |
| CHEGOU | 613 |
| ENVIADO | 99 |
| REGISTRADO | 10 |
| PRONTO | 8 |
| PAGO | 6 |
| PRODUCAO | 4 |
| AG_PAGAMENTO | 4 |
| CANCELADO | 1 |

### ⚡ Prioridades
| Prioridade | Quantidade |
|------------|------------|
| NORMAL | 2.097 |
| ALTA | 757 |
| URGENTE | 90 |
| BAIXA | 4 |

## 📋 Tabelas Principais (Estrutura Real)

### 👤 usuarios
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  loja_id UUID REFERENCES lojas(id),
  role TEXT DEFAULT 'operador',
  permissoes TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  telefone TEXT,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  senha_hash TEXT,
  reset_token TEXT,
  reset_token_expires_at TIMESTAMP WITH TIME ZONE,
  user_id UUID UNIQUE
);
```

### 🏪 lojas  
```sql
CREATE TABLE lojas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  endereco TEXT,
  telefone TEXT,
  gerente TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 🔬 laboratorios
```sql
CREATE TABLE laboratorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo TEXT UNIQUE,
  contato JSONB DEFAULT '{}',
  sla_padrao_dias INTEGER DEFAULT 5,
  trabalha_sabado BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```
  endereco TEXT,
  telefone VARCHAR(20),
  email VARCHAR(255),
  responsavel VARCHAR(255),
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Campos:
- `id`: Identificador sequencial
- `nome`: Nome da loja
- `endereco`: Endereço completo
- `telefone`: Telefone de contato
- `email`: Email da loja
- `responsavel`: Nome do responsável
- `ativa`: Status da loja

---

### 🔬 laboratorios
Cadastro dos laboratórios parceiros.

```sql
CREATE TABLE laboratorios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  especialidades TEXT[],
  endereco TEXT,
  telefone VARCHAR(20),
  email VARCHAR(255),
  responsavel VARCHAR(255),
  ativo BOOLEAN DEFAULT true,
  lead_time_padrao INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Campos:
- `especialidades`: Array de especialidades (multifocal, progressive, etc.)
- `lead_time_padrao`: Tempo padrão de entrega em dias

---

### 📦 pedidos (Tabela Principal)
Tabela central com TODOS os dados dos pedidos, incluindo dados ópticos.

```sql
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_sequencial INTEGER UNIQUE NOT NULL,
  loja_id UUID NOT NULL REFERENCES lojas(id),
  laboratorio_id UUID NOT NULL REFERENCES laboratorios(id),
  classe_lente_id UUID NOT NULL REFERENCES classes_lente(id),
  status VARCHAR DEFAULT 'REGISTRADO',
  prioridade VARCHAR DEFAULT 'NORMAL',
  data_pedido DATE DEFAULT CURRENT_DATE,
  data_prometida DATE,
  data_limite_pagamento DATE,
  data_prevista_pronto DATE,
  data_pagamento DATE,
  data_entregue DATE,
  valor_pedido NUMERIC,
  forma_pagamento TEXT,
  cliente_nome TEXT,
  cliente_telefone TEXT,
  pagamento_atrasado BOOLEAN DEFAULT false,
  producao_atrasada BOOLEAN DEFAULT false,
  requer_atencao BOOLEAN DEFAULT false,
  observacoes TEXT,
  observacoes_internas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by TEXT,
  numero_os_fisica VARCHAR,
  data_inicio_producao TIMESTAMP WITH TIME ZONE,
  data_conclusao_producao TIMESTAMP WITH TIME ZONE,
  lead_time_producao_horas INTEGER,
  lead_time_total_horas INTEGER,
  laboratorio_responsavel_producao VARCHAR,
  updated_by VARCHAR,
  custo_lentes NUMERIC,
  eh_garantia BOOLEAN DEFAULT false,
  observacoes_garantia TEXT,
  numero_pedido_laboratorio VARCHAR,
  vendedor_id UUID REFERENCES colaboradores(id),
  -- Dados ópticos OD (Olho Direito)
  esferico_od NUMERIC,
  cilindrico_od NUMERIC,
  eixo_od INTEGER,
  adicao_od NUMERIC,
  -- Dados ópticos OE (Olho Esquerdo)  
  esferico_oe NUMERIC,
  cilindrico_oe NUMERIC,
  eixo_oe INTEGER,
  adicao_oe NUMERIC,
  -- Dados adicionais
  distancia_pupilar NUMERIC,
  material_lente TEXT,
  indice_refracao TEXT
);
```

#### 🔄 Status Disponíveis:
- `REGISTRADO`: Pedido criado
- `AG_PAGAMENTO`: Aguardando pagamento
- `PAGO`: Pagamento confirmado
- `PRODUCAO`: Em produção no laboratório
- `PRONTO`: Pronto no DCL
- `ENVIADO`: Enviado para loja
- `CHEGOU`: Chegou na loja
- `ENTREGUE`: Entregue ao cliente
- `CANCELADO`: Pedido cancelado

#### ⚡ Prioridades:
- `BAIXA`: Não urgente
- `NORMAL`: Prioridade padrão
- `ALTA`: Requer atenção
- `URGENTE`: Máxima prioridade

---

### 📅 pedidos_timeline
Histórico completo de mudanças de status dos pedidos.

```sql
CREATE TABLE pedidos_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES pedidos(id),
  status_anterior TEXT,
  status_novo TEXT,
  responsavel_id UUID REFERENCES usuarios(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

### 🏢 Tabelas Auxiliares

#### classes_lente
```sql
CREATE TABLE classes_lente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria TEXT, -- monofocal, multifocal, transitions
  cor_badge TEXT,
  sla_base_dias INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### colaboradores  
```sql
CREATE TABLE colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  loja_id UUID REFERENCES lojas(id),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### alertas
```sql
CREATE TABLE alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  prioridade TEXT NOT NULL,
  pedido_id UUID REFERENCES pedidos(id),
  loja_id UUID REFERENCES lojas(id),
  mensagem TEXT,
  lido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### tratamentos
```sql  
CREATE TABLE tratamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### pedido_tratamentos
```sql
CREATE TABLE pedido_tratamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES pedidos(id),
  tratamento_id UUID NOT NULL REFERENCES tratamentos(id),
  UNIQUE(pedido_id, tratamento_id)
);
```

---

## 🔍 Relacionamentos Principais

### 🔗 Foreign Keys Identificadas
- `usuarios.loja_id` → `lojas.id`
- `pedidos.loja_id` → `lojas.id`
- `pedidos.laboratorio_id` → `laboratorios.id`
- `pedidos.classe_lente_id` → `classes_lente.id`
- `pedidos.vendedor_id` → `colaboradores.id`
- `pedidos_timeline.pedido_id` → `pedidos.id`
- `pedidos_timeline.responsavel_id` → `usuarios.id`
- `colaboradores.loja_id` → `lojas.id`
- `alertas.pedido_id` → `pedidos.id`
- `alertas.loja_id` → `lojas.id`

## 📊 Índices para Performance

### 🚀 Índices Principais nos Pedidos
- `idx_pedidos_status` - Busca por status
- `idx_pedidos_data_pedido` - Busca por data
- `idx_pedidos_laboratorio` - Filtro por laboratório
- `idx_pedidos_loja` - Filtro por loja
- `idx_pedidos_created_at` - Ordenação temporal
- `idx_pedidos_numero_os_fisica` - Busca por OS
- `idx_pedidos_garantia` - Filtro garantias

### 📈 Outros Índices Importantes
- `idx_pedidos_timeline_pedido_id` - Timeline por pedido
- `idx_alertas_lido` - Alertas não lidos
- `usuarios_email_key` - Login único por email
  loja_id INTEGER REFERENCES lojas(id),
  laboratorio_id INTEGER REFERENCES laboratorios(id),
  tipo_servico VARCHAR(100),
  status VARCHAR(50) DEFAULT 'novo' CHECK (status IN (
    'novo', 'orcamento', 'aprovado', 'em_producao', 
    'montagem', 'qualidade', 'pronto', 'entregue', 'cancelado'
  )),
  prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN (
    'baixa', 'media', 'alta', 'urgente'
  )),
  valor_pedido DECIMAL(10,2),
  eh_garantia BOOLEAN DEFAULT false,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  prazo_entrega TIMESTAMP WITH TIME ZONE,
  data_entrega TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Status Workflow:
1. **novo** → orcamento → aprovado → em_producao → montagem → qualidade → pronto → **entregue**
2. Qualquer status pode ir para **cancelado**

#### Prioridades:
- `baixa`: SLA 10 dias
- `media`: SLA 7 dias  
- `alta`: SLA 5 dias
- `urgente`: SLA 3 dias

---

### 👁️ receitas
Dados da receita oftálmica dos pedidos.

```sql
CREATE TABLE receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  od_esferico DECIMAL(4,2),
  od_cilindrico DECIMAL(4,2),
  od_eixo INTEGER,
  od_adicao DECIMAL(4,2),
  oe_esferico DECIMAL(4,2),
  oe_cilindrico DECIMAL(4,2),
  oe_eixo INTEGER,
  oe_adicao DECIMAL(4,2),
  dp_longe INTEGER,
  dp_perto INTEGER,
  altura_montagem DECIMAL(4,1),
  observacoes_tecnicas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Campos:
- `od_*`: Dados do olho direito
- `oe_*`: Dados do olho esquerdo
- `dp_*`: Distância pupilar
- `altura_montagem`: Altura de montagem em mm

---

### ⏱️ pedidos_timeline
Rastreamento de mudanças de status e eventos.

```sql
CREATE TABLE pedidos_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  responsavel_id UUID REFERENCES usuarios(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 🎯 classes
Classificação dos tipos de serviços.

```sql
CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco_base DECIMAL(10,2),
  tempo_producao INTEGER, -- em dias
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📈 Views Otimizadas

### v_pedidos_kanban
View otimizada para o board Kanban com todos os dados necessários.

```sql
CREATE VIEW v_pedidos_kanban AS
SELECT 
  p.id,
  p.numero_sequencial,
  p.numero_os_fisica,
  p.cliente_nome,
  p.status,
  p.prioridade,
  p.valor_pedido,
  p.eh_garantia,
  p.data_criacao,
  p.prazo_entrega,
  l.nome AS loja_nome,
  lab.nome AS laboratorio_nome,
  lab.especialidades,
  -- Cálculo de SLA
  CASE 
    WHEN p.prazo_entrega < NOW() AND p.status NOT IN ('entregue', 'cancelado') 
    THEN true 
    ELSE false 
  END AS em_atraso,
  -- Tempo decorrido
  EXTRACT(EPOCH FROM (NOW() - p.data_criacao))/86400 AS dias_criacao
FROM pedidos p
LEFT JOIN lojas l ON p.loja_id = l.id
LEFT JOIN laboratorios lab ON p.laboratorio_id = lab.id
WHERE p.status != 'cancelado';
```

---

### v_lead_time_comparativo
View para análise de lead time entre laboratórios.

```sql
CREATE VIEW v_lead_time_comparativo AS
SELECT 
  lab.nome AS laboratorio,
  COUNT(*) AS total_pedidos,
  AVG(EXTRACT(EPOCH FROM (p.data_entrega - p.data_criacao))/86400) AS lead_time_medio,
  MIN(EXTRACT(EPOCH FROM (p.data_entrega - p.data_criacao))/86400) AS lead_time_min,
  MAX(EXTRACT(EPOCH FROM (p.data_entrega - p.data_criacao))/86400) AS lead_time_max,
  COUNT(*) FILTER (WHERE p.data_entrega <= p.prazo_entrega) AS dentro_prazo,
  ROUND(
    COUNT(*) FILTER (WHERE p.data_entrega <= p.prazo_entrega) * 100.0 / COUNT(*), 
    2
  ) AS sla_compliance
FROM pedidos p
JOIN laboratorios lab ON p.laboratorio_id = lab.id
WHERE p.status = 'entregue' 
  AND p.data_entrega IS NOT NULL
GROUP BY lab.id, lab.nome;
```

---

### v_timeline_completo
View completa da timeline com dados do usuário responsável.

```sql
CREATE VIEW v_timeline_completo AS
SELECT 
  t.id,
  t.pedido_id,
  t.status_anterior,
  t.status_novo,
  t.observacoes,
  t.created_at,
  u.nome AS responsavel_nome,
  u.perfil AS responsavel_perfil,
  p.numero_sequencial,
  p.cliente_nome
FROM pedidos_timeline t
LEFT JOIN usuarios u ON t.responsavel_id = u.id
LEFT JOIN pedidos p ON t.pedido_id = p.id
ORDER BY t.created_at DESC;
```

---

## 🔧 Funções e Triggers

### Trigger de Timeline
Automaticamente insere registro na timeline quando status do pedido muda.

```sql
CREATE OR REPLACE FUNCTION inserir_timeline_pedido()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO pedidos_timeline (
      pedido_id, 
      status_anterior, 
      status_novo,
      responsavel_id
    ) VALUES (
      NEW.id, 
      OLD.status, 
      NEW.status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pedidos_timeline
  AFTER UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION inserir_timeline_pedido();
```

---

### Função de Atualização Automática
Atualiza campo `updated_at` automaticamente.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔒 Row Level Security (RLS)

### Políticas de Acesso

#### Pedidos
```sql
-- Visualização: todos os usuários autenticados
CREATE POLICY "Usuários podem visualizar pedidos" ON pedidos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Inserção: usuários de loja e admin
CREATE POLICY "Lojas podem criar pedidos" ON pedidos
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND perfil IN ('admin', 'loja')
    )
  );
```

#### Usuários
```sql
-- Apenas admins podem gerenciar usuários
CREATE POLICY "Apenas admins gerenciam usuários" ON usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND perfil = 'admin'
    )
  );
```

---

## 📊 Índices de Performance

### Índices Principais
```sql
-- Pedidos
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_loja_id ON pedidos(loja_id);
CREATE INDEX idx_pedidos_laboratorio_id ON pedidos(laboratorio_id);
CREATE INDEX idx_pedidos_data_criacao ON pedidos(data_criacao);
CREATE INDEX idx_pedidos_numero_sequencial ON pedidos(numero_sequencial);

-- Timeline
CREATE INDEX idx_timeline_pedido_id ON pedidos_timeline(pedido_id);
CREATE INDEX idx_timeline_created_at ON pedidos_timeline(created_at);

-- Usuários
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_perfil ON usuarios(perfil);
```

---

## 🚀 Migrations

### Versionamento
As migrations estão organizadas sequencialmente:

- `019_create_pedidos_timeline_table.sql` - Criação da tabela timeline
- `020_create_lead_time_comparativo_view.sql` - View de lead time
- `021_create_timeline_completo_view.sql` - View completa timeline
- `022_apply_all_timeline_migrations.sql` - Aplicação de todas migrations
- `023_create_pedidos_kanban_view.sql` - View do Kanban
- `024_fix_timeline_trigger.sql` - Correção do trigger

### Aplicação
```bash
# Via Supabase CLI
supabase db push

# Via SQL direto
psql -f migration_file.sql
```

---

## 📈 Métricas e Analytics

### Consultas Comuns

#### KPIs Principais
```sql
SELECT 
  COUNT(*) AS total_pedidos,
  COUNT(*) FILTER (WHERE status = 'entregue') AS entregues,
  SUM(valor_pedido) AS faturamento_total,
  AVG(valor_pedido) AS ticket_medio,
  AVG(
    CASE WHEN status = 'entregue' 
    THEN EXTRACT(EPOCH FROM (data_entrega - data_criacao))/86400 
    END
  ) AS lead_time_medio
FROM pedidos
WHERE data_criacao >= CURRENT_DATE - INTERVAL '30 days';
```

#### Ranking Laboratórios
```sql
SELECT 
  l.nome,
  COUNT(p.id) AS total_pedidos,
  SUM(p.valor_pedido) AS faturamento,
  AVG(p.valor_pedido) AS ticket_medio
FROM laboratorios l
JOIN pedidos p ON l.id = p.laboratorio_id
WHERE p.data_criacao >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY l.id, l.nome
ORDER BY faturamento DESC;
```

---

## ⚠️ Considerações Importantes

1. **Backup**: Supabase faz backup automático
2. **Escalabilidade**: PostgreSQL suporta até milhões de registros
3. **Segurança**: RLS garante isolamento de dados
4. **Performance**: Índices otimizados para consultas principais
5. **Monitoramento**: Supabase Dashboard para métricas em tempo real