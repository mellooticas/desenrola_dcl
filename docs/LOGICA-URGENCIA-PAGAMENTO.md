# 📊 Lógica de Urgência de Pagamento - AG_PAGAMENTO

## 🎯 Objetivo

Calcular o **prazo limite para pagamento** das lentes ao laboratório, considerando:

- Data prometida ao cliente
- SLA do laboratório
- Margem de segurança para montagem

## 📐 Fórmula

```
Data Limite Pagamento = Data Prometida ao Cliente - SLA Lab - Margem Segurança
```

### Exemplo Prático

**Cenário:**

- Data Prometida ao Cliente: **20/11/2025**
- SLA do Laboratório: **7 dias**
- Margem de Segurança: **3 dias** (para montagem)

**Cálculo:**

```
Data Limite = 20/11 - 7 dias - 3 dias
Data Limite = 10/11/2025
```

**Resultado:** Pedido deve ser pago até **10/11/2025** para garantir entrega ao cliente em 20/11.

## 🚦 Níveis de Urgência

### 🔥 CRÍTICO

- **Dias restantes**: ≤ 1 dia
- **Cor**: Vermelho (pulsante)
- **Ação**: PAGAR URGENTE!
- **Risco**: Comprometimento da entrega ao cliente

### ⚠️ URGENTE

- **Dias restantes**: 2-3 dias
- **Cor**: Laranja
- **Ação**: Priorizar pagamento
- **Risco**: Pouca margem para imprevistos

### 🟡 ATENÇÃO

- **Dias restantes**: 4-5 dias
- **Cor**: Amarelo
- **Ação**: Planejar pagamento
- **Risco**: Prazo apertado

### ✅ FOLGA

- **Dias restantes**: 6+ dias
- **Cor**: Verde
- **Ação**: Dentro do prazo normal
- **Risco**: Baixo

## 📅 Fluxo Temporal

```
┌─────────────┬──────────────┬────────────────┬─────────────────┐
│  Pagamento  │ Lab Produz   │  Montagem      │   Entrega       │
│             │   (7 dias)   │   (3 dias)     │   ao Cliente    │
├─────────────┼──────────────┼────────────────┼─────────────────┤
│   10/11     │  11-17/11    │   18-20/11     │     20/11       │
│  (LIMITE)   │  (SLA LAB)   │  (MARGEM)      │  (PROMETIDO)    │
└─────────────┴──────────────┴────────────────┴─────────────────┘

Hoje: 09/11 → URGENTE (1 dia restante)
Hoje: 10/11 → CRÍTICO (pagar hoje!)
Hoje: 11/11 → VENCIDO (atraso!)
```

## 🔧 Implementação Técnica

### Arquivo Principal

`src/lib/utils/urgencia-pagamento.ts`

### Função de Cálculo

```typescript
calcularUrgenciaPagamento(
  dataPrometida: string | Date,
  dataPedido?: string | Date,
  margemSeguranca: number = 3
): UrgenciaInfo
```

### Componentes

- `<BadgeUrgencia />` - Badge compacto para cards
- `<TermometroUrgencia />` - Termômetro completo com barra de progresso

## 💡 Casos de Uso

### 1. Planejamento Financeiro

Permite à equipe financeira priorizar pagamentos baseado na urgência real.

### 2. Evitar Atrasos

Alerta visual quando o prazo está crítico, evitando problemas com entrega ao cliente.

### 3. Gestão de Fluxo de Caixa

Diferencia pedidos que DEVEM ser pagos hoje de pedidos com folga.

## ⚠️ Observações Importantes

1. **Margem de Segurança é FIXA**: 3 dias sempre (montagem + imprevistos)
2. **SLA do Lab é VARIÁVEL**: Depende do tipo de lente/complexidade
3. **Data de Referência**: Sempre a data prometida ao CLIENTE
4. **Cálculo Automático**: Trigger no banco popula data_prometida automaticamente

## 📊 Display Visual no Kanban

Em cada card AG_PAGAMENTO aparece:

```
┌─────────────────────────────────┐
│  🚨 CRÍTICO • 1 dia             │ <- Badge com urgência
├─────────────────────────────────┤
│ 📅 Cliente    │ ⏰ SLA Lab      │
│    20/11      │     17/11       │ <- Datas de referência
└─────────────────────────────────┘
```

### Header da Coluna

```
┌─────────────────────────────────┐
│  AG_PAGAMENTO        [25]       │
├─────────────────────────────────┤
│ 🚨 3 CRÍTICOS  ⚠️ 5 URGENTES   │ <- Clicável para filtrar
│ 🟡 8 ATENÇÃO   ✕ Limpar Filtro │
└─────────────────────────────────┘
```

## 🔄 Atualização Automática

### Banco de Dados

Trigger `populate_data_prometida()` calcula automaticamente:

```sql
data_prometida = data_pedido + sla_padrao_dias + margem_seguranca_dias
```

### Frontend

Cálculo dinâmico em tempo real considerando a data atual para mostrar dias restantes.

## 📈 Benefícios

✅ **Controle Preciso**: Saber exatamente quando pagar cada pedido
✅ **Redução de Atrasos**: Alertas visuais evitam esquecimentos
✅ **Priorização Inteligente**: Foco nos pedidos mais urgentes
✅ **Transparência**: Equipe toda vê a mesma informação
✅ **Automatização**: Cálculo sem intervenção manual

---

**Última Atualização**: 21/11/2025
**Versão**: 1.0 (Lógica Corrigida)
