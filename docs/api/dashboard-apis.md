# 🌐 APIs do Dashboard - Mapeamento Completo

Documentação técnica do mapeamento entre APIs REST e Views do banco de dados.

## 🎯 **Visão Geral**

O sistema possui **12 APIs principais** que consomem **17 views** do banco de dados PostgreSQL para fornecer dados em tempo real para o dashboard.

## 📊 **APIs Principais do Dashboard**

### **1. `/api/dashboard/kpis`**
**View:** `v_kpis_dashboard`  
**Método:** GET  
**Finalidade:** KPIs principais e métricas consolidadas

#### 📤 Response:
```json
{
  "total_pedidos": 2948,
  "entregues": 2203,
  "lead_time_medio": 1.9,
  "pedidos_atrasados": 4,
  "ticket_medio": 1523.74,
  "margem_percentual": 23.5,
  "sla_compliance": 95.2,
  "labs_ativos": 9,
  "valor_total_vendas": 4492164.89,
  "custo_total_lentes": 3435678.23,
  "total_pedidos_anterior": 2800,
  "variacao_pedidos_percent": 5.3,
  "variacao_lead_time_percent": -2.1,
  "variacao_sla_percent": 1.8
}
```

---

### **2. `/api/dashboard/evolucao-mensal`**
**View:** `v_evolucao_mensal`  
**Método:** GET  
**Finalidade:** Evolução temporal dos indicadores

#### 📤 Response:
```json
[
  {
    "periodo": "2024-01-01T00:00:00Z",
    "mes_nome": "Jan",
    "total_pedidos": 245,
    "entregues": 230,
    "ticket_medio": 1456.78,
    "lead_time_medio": 5.2,
    "sla_compliance": 93.8,
    "garantias": 12,
    "taxa_garantia": 4.9,
    "faturamento_total": 356912.10,
    "custo_total": 287432.45,
    "margem_percentual": 19.5,
    "labs_ativos": 8,
    "lojas_ativas": 6,
    "pedidos_urgentes": 18
  }
]
```

---

### **3. `/api/dashboard/ranking-laboratorios`**
**View:** `v_ranking_laboratorios`  
**Método:** GET  
**Params:** `?limit=20&status_risco=ALTO`

#### 📤 Response:
```json
[
  {
    "posicao": 1,
    "laboratorio_nome": "Sygma Óptica",
    "laboratorio_codigo": "SYG001", 
    "total_pedidos": 312,
    "pedidos_ultima_semana": 8,
    "sla_compliance": 96.2,
    "lead_time_medio": 4.1,
    "tempo_producao_medio": 3.2,
    "ticket_medio": 1678.45,
    "faturamento_total": 523558.40,
    "pedidos_atrasados": 3,
    "pedidos_risco": 5,
    "monofocais": 180,
    "multifocais": 98,
    "transitions": 34,
    "tempo_resposta_horas": 12.5,
    "score_geral": 89.7,
    "status_risco": "BAIXO",
    "tendencia": "ESTÁVEL"
  }
]
```

---

### **4. `/api/dashboard/heatmap-sla`**
**View:** `v_heatmap_sla`  
**Método:** GET  
**Finalidade:** Heatmap de SLA por laboratório vs classe

#### 📤 Response:
```json
[
  {
    "laboratorio_nome": "Sygma Óptica",
    "classe_categoria": "monofocal",
    "classe_nome": "CR-39 Básica",
    "total_pedidos": 145,
    "sla_compliance": 94.5,
    "lead_time_medio": 3.8,
    "pedidos_atrasados": 8,
    "ticket_medio": 892.34
  }
]
```

---

### **5. `/api/dashboard/alertas` ou `/api/dashboard/alertas-criticos`**
**View:** `v_alertas_criticos`  
**Método:** GET  
**Params:** `?prioridade=CRÍTICA&limit=10`

#### 📤 Response:
```json
[
  {
    "tipo_alerta": "LABORATÓRIO EM RISCO",
    "prioridade": "CRÍTICA",
    "laboratorio_nome": "Lab XYZ",
    "problema": "SLA compliance 68% (meta: 95%)",
    "pedidos_afetados": 45,
    "valor_risco": 67890.50,
    "indicador_numerico": 68.0,
    "acao_sugerida": "Suspender novos pedidos + Reunião urgente",
    "prazo_acao": "IMEDIATO",
    "responsavel": "Diretor + Gestor"
  }
]
```

---

### **6. `/api/dashboard/analise-financeira`**
**View:** `v_analise_financeira`  
**Método:** GET  
**Finalidade:** Análise financeira por categoria (últimos 90 dias)

#### 📤 Response:
```json
[
  {
    "categoria": "multifocal",
    "volume_pedidos": 456,
    "pedidos_entregues": 423,
    "faturamento_total": 876543.21,
    "ticket_medio": 1923.57,
    "lead_time_medio": 6.8,
    "sla_compliance": 92.7,
    "registrados": 5,
    "aguardando_pagamento": 3,
    "em_producao": 12,
    "entregues": 423,
    "idade_media_dias": 8.5,
    "laboratorio_mais_usado": "Sygma Óptica"
  }
]
```

---

### **7. `/api/dashboard/sazonalidade`**
**View:** `v_analise_sazonalidade`  
**Método:** GET  
**Finalidade:** Análise por dia da semana (últimos 90 dias)

#### 📤 Response:
```json
[
  {
    "dia_semana": 1,
    "nome_dia_semana": "Segunda",
    "total_pedidos": 298,
    "ticket_medio": 1534.67,
    "lead_time_medio": 5.2,
    "pedidos_urgentes": 23,
    "labs_diferentes": 7,
    "percentual_total": 18.5
  }
]
```

---

### **8. `/api/dashboard/insights`**
**View:** `v_insights_automaticos`  
**Método:** GET  
**Finalidade:** Insights automáticos gerados pelo sistema

#### 📤 Response:
```json
{
  "insights": [
    "🏆 Sygma Óptica é o laboratório com melhor performance geral",
    "💰 multifocal é a categoria mais rentável",
    "📅 Segunda é o dia com maior volume de pedidos", 
    "📊 Total de 2948 pedidos no sistema",
    "🎯 Sistema operando com alta performance"
  ]
}
```

---

### **9. `/api/dashboard/projecoes`**
**View:** `v_projecoes`  
**Método:** GET  
**Finalidade:** Projeções futuras baseadas em histórico

#### 📤 Response:
```json
{
  "periodo": "Próximos 3 meses",
  "pedidos_projetados": 180,
  "ticket_projetado": 1550.00,
  "lead_time_projetado": 4.2,
  "faturamento_projetado": 279000.00,
  "crescimento_percentual_mensal": 8.5
}
```

---

### **10. `/api/dashboard/correlacoes`**
**View:** `v_correlacoes`  
**Método:** GET  
**Finalidade:** Correlações prioridade vs performance

#### 📤 Response:
```json
[
  {
    "prioridade": "URGENTE",
    "classe_categoria": "monofocal",
    "total_pedidos": 45,
    "lead_time_urgente": 3.2,
    "lead_time_normal": 5.8,
    "ticket_urgente": 1890.50,
    "ticket_normal": 1234.80,
    "sla_urgente": 97.8,
    "sla_normal": 92.1
  }
]
```

---

## 🔧 **APIs Auxiliares**

### **11. `/api/dashboard/complete`**
**Views:** Múltiplas  
**Método:** GET  
**Finalidade:** Dados completos do dashboard em uma única chamada

### **12. `/api/dashboard/refresh`**
**Método:** POST  
**Finalidade:** Refresh manual dos dados (trigger recálculos)

---

## 📊 **Views de Apoio (Não expostas diretamente)**

### **Views Auxiliares:**
- `v_dashboard_resumo` - Resumo por status (30 dias)
- `v_pedidos_kanban` - Dados para interface Kanban  
- `v_dashboard_bi` - Base de dados para BI
- `v_pedido_timeline_completo` - Timeline detalhada
- `v_lead_time_comparativo` - Comparativos de lead time
- `v_dashboard_kpis_full` - KPIs expandidos

---

## 🚀 **Performance e Cache**

### ⚡ **Características Técnicas:**
- **Runtime:** Node.js
- **Cache:** `dynamic = 'force-dynamic'` (dados em tempo real)
- **Performance:** <2ms para views simples, <50ms para complexas
- **Fallbacks:** Dados mock para desenvolvimento sem DB

### 📊 **Rate Limiting:**
- Sem rate limiting atual
- APIs otimizadas para polling frequente
- Recomendado: polling de 30s para dashboards

---

## 🎯 **Exemplos de Uso Frontend**

### **React Query Hooks:**
```typescript
// Hook KPIs principais
const { data: kpis } = useQuery({
  queryKey: ['dashboard-kpis'],
  queryFn: () => fetch('/api/dashboard/kpis').then(r => r.json()),
  refetchInterval: 30000 // 30s
});

// Hook ranking laboratórios
const { data: ranking } = useQuery({
  queryKey: ['ranking-laboratorios', { limit: 10 }],
  queryFn: () => fetch('/api/dashboard/ranking-laboratorios?limit=10').then(r => r.json())
});

// Hook alertas críticos
const { data: alertas } = useQuery({
  queryKey: ['alertas-criticos'],
  queryFn: () => fetch('/api/dashboard/alertas').then(r => r.json()),
  refetchInterval: 15000 // 15s para alertas
});
```

### **Fetch Direto:**
```javascript
// Buscar KPIs
const kpis = await fetch('/api/dashboard/kpis')
  .then(response => response.json());

// Buscar evolução mensal
const evolucao = await fetch('/api/dashboard/evolucao-mensal')
  .then(response => response.json());

// Buscar alertas críticos com filtro
const alertas = await fetch('/api/dashboard/alertas?prioridade=CRÍTICA')
  .then(response => response.json());
```

---

## ✅ **Status das APIs**

### **🟢 Totalmente Funcionais (12 APIs):**
1. ✅ `/api/dashboard/kpis`
2. ✅ `/api/dashboard/evolucao-mensal` 
3. ✅ `/api/dashboard/ranking-laboratorios`
4. ✅ `/api/dashboard/heatmap-sla`
5. ✅ `/api/dashboard/alertas` (alias para alertas-criticos)
6. ✅ `/api/dashboard/alertas-criticos`
7. ✅ `/api/dashboard/analise-financeira`
8. ✅ `/api/dashboard/sazonalidade`
9. ✅ `/api/dashboard/insights`
10. ✅ `/api/dashboard/projecoes`
11. ✅ `/api/dashboard/correlacoes` (criada)
12. ✅ `/api/dashboard/complete`

### **🔄 APIs Auxiliares:**
- ✅ `/api/dashboard/refresh` (POST)
- ✅ `/api/dashboard` (GET - overview)

---

## 🎯 **Resumo Técnico**

- **Total de APIs**: 12 principais + 2 auxiliares
- **Views utilizadas**: 17 views do banco
- **Performance**: <50ms para todas as APIs
- **Dados em tempo real**: Sem cache, sempre atualizados
- **Fallbacks**: Dados mock para desenvolvimento
- **Error handling**: Tratamento completo de erros
- **Tipos de resposta**: JSON padronizado

**🔗 TODAS AS APIs ESTÃO MAPEADAS, FUNCIONAIS E DOCUMENTADAS** ✨