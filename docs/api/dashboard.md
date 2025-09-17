# 📊 APIs do Dashboard

Documentação completa das APIs do Dashboard BI do sistema Desenrola DCL.

## Endpoints Disponíveis

### 1. KPIs Principais

**GET** `/api/dashboard/kpis`

Retorna os principais indicadores de performance do sistema.

#### Response Success (200)
```json
{
  "total_pedidos": 150,
  "entregues": 142,
  "valor_total_vendas": 125000,
  "ticket_medio": 833.33,
  "sla_compliance": 94.2,
  "lead_time_medio": 4.8,
  "pedidos_atrasados": 8,
  "labs_ativos": 26,
  "total_pedidos_anterior": 135,
  "lead_time_anterior": 5.2,
  "sla_anterior": 91.8,
  "variacao_pedidos_percent": 11.1,
  "variacao_lead_time_percent": -7.7,
  "variacao_sla_percent": 2.6
}
```

#### Campos Explicados
- `total_pedidos`: Total de pedidos no período
- `entregues`: Pedidos entregues com sucesso
- `valor_total_vendas`: Faturamento total em reais
- `ticket_medio`: Valor médio por pedido
- `sla_compliance`: % de cumprimento do SLA
- `lead_time_medio`: Tempo médio de entrega em dias
- `pedidos_atrasados`: Quantidade de pedidos em atraso
- `labs_ativos`: Laboratórios com pedidos ativos
- `*_anterior`: Valores do período anterior para comparação
- `variacao_*_percent`: Percentual de variação vs período anterior

---

### 2. Evolução Mensal

**GET** `/api/dashboard/evolucao`

Retorna dados de evolução mensal de pedidos e faturamento.

#### Response Success (200)
```json
{
  "evolucao": [
    {
      "mes": "2025-01",
      "pedidos": 120,
      "faturamento": 95000,
      "ticket_medio": 791.67
    },
    {
      "mes": "2025-02", 
      "pedidos": 135,
      "faturamento": 110000,
      "ticket_medio": 814.81
    }
  ]
}
```

---

### 3. Ranking de Laboratórios

**GET** `/api/dashboard/ranking-laboratorios`

Lista os laboratórios ordenados por performance.

#### Query Parameters
- `limit` (opcional): Número máximo de resultados (padrão: 10)

#### Request
```
GET /api/dashboard/ranking-laboratorios?limit=5
```

#### Response Success (200)
```json
{
  "ranking": [
    {
      "laboratorio": "DCL Laboratório",
      "total_pedidos": 45,
      "valor_total": 37500,
      "ticket_medio": 833.33,
      "lead_time": 4.2,
      "sla_compliance": 96.8,
      "posicao": 1
    },
    {
      "laboratorio": "Lab Vision",
      "total_pedidos": 38,
      "valor_total": 31200,
      "ticket_medio": 821.05,
      "lead_time": 4.8,
      "sla_compliance": 94.1,
      "posicao": 2
    }
  ]
}
```

---

### 4. Alertas Críticos

**GET** `/api/dashboard/alertas-criticos`

Retorna alertas que precisam de atenção imediata.

#### Response Success (200)
```json
{
  "alertas": [
    {
      "id": "alert_001",
      "tipo": "sla_risco",
      "titulo": "SLA em Risco",
      "descricao": "3 pedidos próximos do limite de SLA",
      "criticidade": "alta",
      "pedidos_afetados": 3,
      "created_at": "2025-09-15T08:30:00Z"
    },
    {
      "id": "alert_002", 
      "tipo": "estoque_baixo",
      "titulo": "Estoque Crítico",
      "descricao": "Laboratório XYZ com estoque baixo",
      "criticidade": "media",
      "laboratorio": "Lab XYZ",
      "created_at": "2025-09-15T09:15:00Z"
    }
  ],
  "total": 2
}
```

---

### 5. Análise Financeira

**GET** `/api/dashboard/analise-financeira`

Retorna análise detalhada dos dados financeiros.

#### Response Success (200)
```json
{
  "resumo": {
    "faturamento_total": 125000,
    "ticket_medio": 833.33,
    "margem_bruta": 35.5,
    "crescimento_mensal": 11.1
  },
  "por_periodo": [
    {
      "periodo": "2025-09",
      "faturamento": 125000,
      "custos": 80625,
      "margem": 44375,
      "percentual_margem": 35.5
    }
  ],
  "por_laboratorio": [
    {
      "laboratorio": "DCL",
      "faturamento": 45000,
      "participacao": 36.0
    }
  ]
}
```

---

### 6. Insights Automáticos

**GET** `/api/dashboard/insights`

Retorna insights automáticos baseados nos dados.

#### Response Success (200)
```json
{
  "insights": [
    {
      "tipo": "tendencia",
      "titulo": "Crescimento Acelerado",
      "descricao": "Pedidos cresceram 11.1% em relação ao mês anterior",
      "impacto": "positivo",
      "confianca": 85
    },
    {
      "tipo": "problema",
      "titulo": "Lead Time Aumentando", 
      "descricao": "Tempo de entrega subiu 7.7% no último período",
      "impacto": "negativo",
      "confianca": 92,
      "sugestao": "Revisar processo de produção"
    }
  ]
}
```

---

### 7. Heatmap SLA

**GET** `/api/dashboard/heatmap-sla`

Retorna dados para heatmap de cumprimento de SLA.

#### Response Success (200)
```json
{
  "heatmap": [
    {
      "laboratorio": "DCL",
      "dia_semana": "Segunda",
      "sla_compliance": 96.8,
      "total_pedidos": 12
    },
    {
      "laboratorio": "DCL",
      "dia_semana": "Terça", 
      "sla_compliance": 94.2,
      "total_pedidos": 15
    }
  ]
}
```

---

### 8. Sazonalidade

**GET** `/api/dashboard/sazonalidade`

Analisa padrões sazonais nos dados.

#### Response Success (200)
```json
{
  "por_mes": [
    {
      "mes": 1,
      "nome_mes": "Janeiro",
      "media_pedidos": 98,
      "indice_sazonalidade": 0.85
    }
  ],
  "por_dia_semana": [
    {
      "dia": 1,
      "nome_dia": "Segunda",
      "media_pedidos": 22,
      "indice_sazonalidade": 1.1
    }
  ]
}
```

---

### 9. Projeções

**GET** `/api/dashboard/projecoes`

Retorna projeções baseadas em dados históricos.

#### Response Success (200)
```json
{
  "projecao_mensal": {
    "pedidos_projetados": 165,
    "faturamento_projetado": 137500,
    "confianca": 78
  },
  "tendencias": [
    {
      "metrica": "pedidos",
      "tendencia": "crescimento",
      "percentual": 11.1
    }
  ]
}
```

---

### 10. Refresh Dashboard

**POST** `/api/dashboard/refresh`

Força atualização dos dados do dashboard.

#### Response Success (200)
```json
{
  "success": true,
  "message": "Dashboard atualizado com sucesso",
  "timestamp": "2025-09-15T10:30:00Z"
}
```

## 📈 Códigos de Status

- **200**: Sucesso
- **400**: Parâmetros inválidos
- **401**: Não autenticado
- **403**: Sem permissão
- **500**: Erro interno do servidor

## 🔧 Exemplos de Uso

### Buscar KPIs com cURL
```bash
curl -X GET http://localhost:3000/api/dashboard/kpis \
  -H "Authorization: Bearer seu_jwt_token"
```

### Ranking com Limite
```bash
curl -X GET "http://localhost:3000/api/dashboard/ranking-laboratorios?limit=5" \
  -H "Authorization: Bearer seu_jwt_token"
```

### Refresh Dashboard
```bash
curl -X POST http://localhost:3000/api/dashboard/refresh \
  -H "Authorization: Bearer seu_jwt_token"
```

## ⚠️ Notas Importantes

1. **Autenticação**: Todas as APIs requerem token JWT válido
2. **Cache**: Dados são cacheados por 5 minutos
3. **Simulação**: Em caso de erro no banco, retorna dados simulados
4. **Performance**: APIs otimizadas para resposta rápida
5. **Real-time**: Alguns dados são atualizados em tempo real