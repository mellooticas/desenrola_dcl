# 📦 APIs de Pedidos

Documentação completa das APIs de gestão de pedidos do sistema Desenrola DCL.

## Endpoints Principais

### 1. Listar Pedidos

**GET** `/api/pedidos`

Lista pedidos com filtros e paginação.

#### Query Parameters
- `view`: `kanban` (padrão) ou `simple`
- `loja_id`: Filtrar por loja específica
- `laboratorio_id`: Filtrar por laboratório
- `status`: Filtrar por status específico
- `prioridade`: `baixa`, `media`, `alta`, `urgente`
- `eh_garantia`: `true` ou `false`
- `cliente_nome`: Buscar por nome do cliente
- `numero_sequencial`: Buscar por número sequencial
- `numero_os_fisica`: Buscar por OS física
- `data_inicio`: Data inicial (YYYY-MM-DD)
- `data_fim`: Data final (YYYY-MM-DD)

#### Request Examples
```bash
GET /api/pedidos?view=kanban
GET /api/pedidos?loja_id=1&status=em_producao
GET /api/pedidos?cliente_nome=João&prioridade=alta
```

#### Response Success (200)
```json
{
  "pedidos": [
    {
      "id": "uuid",
      "numero_sequencial": "DCL-2025-001",
      "numero_os_fisica": "OS-001",
      "cliente_nome": "João Silva",
      "loja_nome": "Ótica Centro",
      "laboratorio_nome": "DCL Laboratório",
      "status": "em_producao",
      "prioridade": "alta",
      "valor_pedido": 150.00,
      "eh_garantia": false,
      "data_criacao": "2025-09-15T10:00:00Z",
      "prazo_entrega": "2025-09-20T10:00:00Z",
      "observacoes": "Cliente preferencial"
    }
  ],
  "total": 1,
  "filtros_aplicados": {
    "status": "em_producao",
    "loja_id": "1"
  }
}
```

---

### 2. Criar Pedido

**POST** `/api/pedidos`

Cria um novo pedido no sistema.

#### Request Body
```json
{
  "cliente_nome": "Maria Santos",
  "cliente_telefone": "(11) 99999-9999",
  "cliente_email": "maria@email.com",
  "loja_id": 1,
  "laboratorio_id": 2,
  "tipo_servico": "multifocal",
  "valor_pedido": 250.00,
  "prioridade": "media",
  "eh_garantia": false,
  "observacoes": "Lentes com antirreflexo",
  "receita": {
    "od_esferico": -2.00,
    "od_cilindrico": -1.00,
    "od_eixo": 90,
    "oe_esferico": -1.75,
    "oe_cilindrico": -0.75,
    "oe_eixo": 85
  }
}
```

#### Response Success (201)
```json
{
  "success": true,
  "pedido": {
    "id": "uuid",
    "numero_sequencial": "DCL-2025-002",
    "status": "novo",
    "data_criacao": "2025-09-15T11:00:00Z",
    "prazo_entrega": "2025-09-22T11:00:00Z"
  },
  "message": "Pedido criado com sucesso"
}
```

---

### 3. Buscar Pedido por ID

**GET** `/api/pedidos/[id]`

Retorna detalhes completos de um pedido específico.

#### Request
```
GET /api/pedidos/uuid-do-pedido
```

#### Response Success (200)
```json
{
  "pedido": {
    "id": "uuid",
    "numero_sequencial": "DCL-2025-001",
    "numero_os_fisica": "OS-001",
    "cliente": {
      "nome": "João Silva",
      "telefone": "(11) 88888-8888",
      "email": "joao@email.com"
    },
    "loja": {
      "id": 1,
      "nome": "Ótica Centro",
      "endereco": "Rua Principal, 123"
    },
    "laboratorio": {
      "id": 2,
      "nome": "DCL Laboratório",
      "especialidades": ["multifocal", "progressive"]
    },
    "receita": {
      "od_esferico": -2.00,
      "od_cilindrico": -1.00,
      "od_eixo": 90,
      "oe_esferico": -1.75,
      "oe_cilindrico": -0.75,
      "oe_eixo": 85
    },
    "status": "em_producao",
    "prioridade": "alta",
    "valor_pedido": 150.00,
    "eh_garantia": false,
    "data_criacao": "2025-09-15T10:00:00Z",
    "prazo_entrega": "2025-09-20T10:00:00Z",
    "observacoes": "Cliente preferencial",
    "timeline": [
      {
        "status": "novo",
        "data": "2025-09-15T10:00:00Z",
        "usuario": "Sistema"
      },
      {
        "status": "em_producao",
        "data": "2025-09-15T14:30:00Z",
        "usuario": "DCL Lab"
      }
    ]
  }
}
```

---

### 4. Atualizar Pedido

**PUT** `/api/pedidos/[id]`

Atualiza dados de um pedido existente.

#### Request Body
```json
{
  "observacoes": "Observação atualizada",
  "prioridade": "urgente",
  "valor_pedido": 175.00
}
```

#### Response Success (200)
```json
{
  "success": true,
  "pedido": {
    "id": "uuid",
    "numero_sequencial": "DCL-2025-001",
    "observacoes": "Observação atualizada",
    "prioridade": "urgente",
    "valor_pedido": 175.00,
    "updated_at": "2025-09-15T15:30:00Z"
  },
  "message": "Pedido atualizado com sucesso"
}
```

---

## Ações de Pedidos

### 5. Avançar Status

**POST** `/api/pedidos/actions/avancar-status`

Avança o pedido para o próximo status na sequência.

#### Request Body
```json
{
  "pedido_id": "uuid",
  "observacao": "Lentes prontas para montagem"
}
```

#### Response Success (200)
```json
{
  "success": true,
  "status_anterior": "em_producao",
  "status_atual": "montagem",
  "pedido_id": "uuid",
  "timestamp": "2025-09-15T16:00:00Z"
}
```

---

### 6. Marcar como Pago

**POST** `/api/pedidos/actions/marcar-pago`

Marca um pedido como pago.

#### Request Body
```json
{
  "pedido_id": "uuid",
  "valor_pago": 150.00,
  "forma_pagamento": "cartao",
  "observacao": "Pagamento via cartão de crédito"
}
```

#### Response Success (200)
```json
{
  "success": true,
  "pedido_id": "uuid",
  "status_pagamento": "pago",
  "valor_pago": 150.00,
  "data_pagamento": "2025-09-15T17:00:00Z"
}
```

---

### 7. Cancelar Pedido

**POST** `/api/pedidos/actions/cancelar`

Cancela um pedido existente.

#### Request Body
```json
{
  "pedido_id": "uuid",
  "motivo": "Cliente desistiu da compra",
  "observacao": "Cancelamento solicitado pelo cliente"
}
```

#### Response Success (200)
```json
{
  "success": true,
  "pedido_id": "uuid",
  "status": "cancelado",
  "motivo_cancelamento": "Cliente desistiu da compra",
  "data_cancelamento": "2025-09-15T18:00:00Z"
}
```

---

## Timeline e Eventos

### 8. Eventos do Pedido

**GET** `/api/pedidos/[id]/eventos`

Retorna timeline completa de eventos do pedido.

#### Response Success (200)
```json
{
  "eventos": [
    {
      "id": "uuid",
      "pedido_id": "uuid",
      "tipo": "status_change",
      "status_anterior": "novo",
      "status_atual": "em_producao",
      "usuario": "DCL Lab",
      "data": "2025-09-15T14:30:00Z",
      "observacao": "Pedido iniciado na produção"
    },
    {
      "id": "uuid",
      "pedido_id": "uuid", 
      "tipo": "comment",
      "usuario": "Junior Admin",
      "data": "2025-09-15T15:00:00Z",
      "observacao": "Cliente ligou perguntando sobre prazo"
    }
  ]
}
```

---

### 9. Adicionar Evento

**POST** `/api/pedidos/[id]/eventos`

Adiciona um novo evento ao timeline do pedido.

#### Request Body
```json
{
  "tipo": "comment",
  "observacao": "Cliente confirmou endereço de entrega",
  "usuario": "Operador Loja"
}
```

#### Response Success (201)
```json
{
  "success": true,
  "evento": {
    "id": "uuid",
    "pedido_id": "uuid",
    "tipo": "comment",
    "usuario": "Operador Loja",
    "data": "2025-09-15T19:00:00Z",
    "observacao": "Cliente confirmou endereço de entrega"
  }
}
```

---

## Dashboard de Pedidos

### 10. Estatísticas Rápidas

**GET** `/api/pedidos/dashboard`

Retorna estatísticas rápidas para dashboard.

#### Response Success (200)
```json
{
  "resumo": {
    "total_pedidos": 150,
    "novos": 12,
    "em_producao": 45,
    "prontos": 8,
    "entregues": 85,
    "valor_total": 125000
  },
  "por_status": [
    {
      "status": "novo",
      "quantidade": 12,
      "percentual": 8.0
    },
    {
      "status": "em_producao", 
      "quantidade": 45,
      "percentual": 30.0
    }
  ]
}
```

---

## Status de Pedidos

| Status | Descrição | Próximo Status |
|--------|-----------|----------------|
| `novo` | Pedido recém criado | `orcamento` |
| `orcamento` | Aguardando orçamento | `aprovado` |
| `aprovado` | Orçamento aprovado | `em_producao` |
| `em_producao` | Em produção no lab | `montagem` |
| `montagem` | Em processo de montagem | `qualidade` |
| `qualidade` | Controle de qualidade | `pronto` |
| `pronto` | Pronto para entrega | `entregue` |
| `entregue` | Entregue ao cliente | - |
| `cancelado` | Pedido cancelado | - |

## Prioridades

| Prioridade | Descrição | SLA |
|------------|-----------|-----|
| `baixa` | Não urgente | 10 dias |
| `media` | Padrão | 7 dias |
| `alta` | Prioritário | 5 dias |
| `urgente` | Emergencial | 3 dias |

## 🔧 Exemplos de Uso

### Buscar Pedidos do Kanban
```bash
curl -X GET "http://localhost:3000/api/pedidos?view=kanban" \
  -H "Authorization: Bearer seu_jwt_token"
```

### Criar Novo Pedido
```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_jwt_token" \
  -d '{
    "cliente_nome": "João Silva",
    "loja_id": 1,
    "laboratorio_id": 2,
    "valor_pedido": 150.00
  }'
```

### Avançar Status
```bash
curl -X POST http://localhost:3000/api/pedidos/actions/avancar-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_jwt_token" \
  -d '{
    "pedido_id": "uuid",
    "observacao": "Produção finalizada"
  }'
```

## ⚠️ Validações Importantes

1. **Cliente Nome**: Obrigatório, mínimo 2 caracteres
2. **Valor Pedido**: Deve ser positivo
3. **Loja/Lab**: Devem existir e estar ativos
4. **Status**: Seguir sequência lógica definida
5. **Prioridade**: Impacta no SLA automaticamente