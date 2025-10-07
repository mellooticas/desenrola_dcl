# Status dos Dados nos Gráficos Financeiros

## 📊 Análise de Fonte de Dados por Gráfico

### 1. **📈 Evolução Financeira** 
**Status**: ✅ **Dados Simulados Inteligentes** (baseados em métricas reais)
- **Fonte**: Função `gerarEvolucaoTemporal()` que usa:
  - `metricas_principais.receita_total` (REAL)
  - `metricas_principais.custo_total` (REAL) 
  - `metricas_principais.quantidade_pedidos` (REAL)
- **Método**: Distribui proporcionalmente com variações realistas
- **Fallback**: API `evolucao_temporal` (quando implementada)

### 2. **📊 Receita por Status**
**Status**: ✅ **Dados Reais** (da API)
- **Fonte**: API `/api/dashboard/financeiro` → `receita_por_status`
- **Cálculo Real**:
```typescript
// Processa todos os pedidos por status
pedidosCompletos.forEach(pedido => {
  receitaPorStatus[pedido.status].quantidade++
  receitaPorStatus[pedido.status].valor_total += pedido.valor_pedido
})
```
- **Fallback**: Dados simulados proporcionais quando API vazia

### 3. **🥧 Formas de Pagamento**
**Status**: ⚠️ **Dados Simulados** (Mock Proporcional)
- **Fonte Principal**: API `formas_pagamento` (implementada mas possivelmente vazia)
- **Fallback Ativo**: Dados mock baseados em `receita_total`:
  - PIX: 40% da receita
  - Cartão Débito: 30% 
  - Cartão Crédito: 25%
  - Dinheiro: 5%
- **API Real**: Processa `pedidosComPagamento.filter(p => p.forma_pagamento)`

### 4. **📊 Distribuição por Status**
**Status**: ✅ **Dados Reais** (mesmo que gráfico #2)
- **Fonte**: Mesmo `receita_por_status` do gráfico de receita
- **Dados**: Valores totais reais por status dos pedidos

## 🔍 Por que Formas de Pagamento está com Mock?

### **Possíveis Causas:**
1. **Campo vazio**: `forma_pagamento` pode estar NULL/vazio nos pedidos
2. **Filtro restritivo**: `pedidosComPagamento = pedidosComValor.filter(p => p.forma_pagamento)`
3. **Dados históricos**: Pedidos antigos podem não ter forma de pagamento preenchida

### **Verificação na API:**
```typescript
// A API calcula assim:
const pedidosComPagamento = pedidosComValor.filter(p => p.forma_pagamento)
pedidosComPagamento.forEach(p => {
  const forma = p.forma_pagamento.toLowerCase()
  formasPagamento[forma].valor_total += p.valor_pedido
})
```

## 📈 Comparação: Real vs Simulado

| Gráfico | Dados | Fonte | Motivo |
|---|---|---|---|
| **Evolução Financeira** | 🟡 Simulado Inteligente | Métricas reais distribuídas | API evolução temporal não implementada |
| **Receita por Status** | 🟢 Real | `receita_por_status` da API | Campos obrigatórios (status existe) |
| **Formas Pagamento** | 🔴 Mock | Fallback proporcional | Campo `forma_pagamento` vazio |
| **Distribuição Status** | 🟢 Real | `receita_por_status` da API | Mesmo que receita por status |

## ✅ Recomendações para Dados 100% Reais

### **1. Formas de Pagamento (Prioridade Alta)**
```sql
-- Verificar se campo está preenchido
SELECT forma_pagamento, COUNT(*) 
FROM pedidos 
WHERE valor_pedido > 0 
GROUP BY forma_pagamento;
```

### **2. Evolução Temporal (Prioridade Média)**
- A API já calcula evolução temporal real nos últimos 7 dias
- Implementar agrupamento por período (dia/semana/mês)
- Usar API `/api/dashboard/evolucao-financeira` (já criada)

### **3. Dados Obrigatórios vs Opcionais**
- ✅ **Status**: Campo obrigatório → sempre real
- ⚠️ **Forma Pagamento**: Campo opcional → pode estar vazio
- ✅ **Valores**: Campos obrigatórios → sempre reais

## 🎯 Status Final

**3 de 4 gráficos** usam dados reais ou baseados em métricas reais:
- ✅ **Evolução**: Simulado inteligente (baseado em reais)
- ✅ **Status**: 100% real
- ❌ **Formas Pag**: Mock (campo vazio no banco)
- ✅ **Distribuição**: 100% real

**Para tornar 100% real**: Preencher campo `forma_pagamento` nos pedidos ou ajustar a query da API.