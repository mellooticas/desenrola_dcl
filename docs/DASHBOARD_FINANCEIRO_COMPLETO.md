# Dashboard Financeiro Completo - Documentação

## Visão Geral
O Dashboard Financeiro foi completamente reformulado para oferecer uma experiência de Business Intelligence (BI) de alta qualidade, integrando métricas avançadas, visualizações interativas e análises de tendências.

## 🚀 Funcionalidades Implementadas

### 1. Dashboard Financeiro Principal (`DashboardFinanceiroCompleto.tsx`)

#### KPIs Principais
- **Receita Total**: Valor total de receita com breakdown por dia
- **Margem Bruta**: Valor absoluto e percentual de margem
- **Ticket Médio**: Valor médio por pedido
- **Total de Pedidos**: Quantidade total com separação entre pedidos com valor e garantias

#### Visualizações Interativas
- **Evolução Financeira**: Gráfico combinado (barras + linha) mostrando:
  - Receita e custos em barras
  - Margem percentual em linha
  - Agrupamento temporal dinâmico
- **Gráficos Dinâmicos**: Alternância entre:
  - Receita por Status
  - Formas de Pagamento (Pie Chart)
  - Distribuição por Status (Bar Chart)
  - Análise de Margem

#### Análises Detalhadas
- **Garantias**: Quantidade, taxa e custo
- **Pagamentos**: Status de pagamentos (pagos/pendentes)
- **Top Lojas**: Ranking por receita (quando aplicável)

### 2. API de Evolução Financeira (`/api/dashboard/evolucao-financeira`)

#### Parâmetros Suportados
- `periodo`: Número de dias (padrão: 30)
- `agrupamento`: day, week, month, year
- `laboratorio_id`: Filtro por laboratório
- `loja_id`: Filtro por loja
- `classe`: Filtro por classe

#### Métricas Calculadas
- Receita por período
- Custos por período
- Margem absoluta e percentual
- Ticket médio
- Quantidade de pedidos

### 3. Componente de Tendências (`AnaliseTendenciasFinanceiras.tsx`)

#### Análises Avançadas
- **Tendência Geral**: Crescimento, declínio ou estável
- **Crescimento Médio**: Taxa média de crescimento
- **Volatilidade**: Medida de instabilidade
- **Melhor/Pior Períodos**: Identificação de picos e vales

#### Visualizações
- **Gráfico de Área**: Evolução de receita e custos
- **Linha de Margem**: Margem percentual sobreposta
- **KPIs de Tendência**: Cards com métricas calculadas

## 🔧 Integração com Filtros

### Sistema de Filtros Unificado
Todos os componentes financeiros respondem aos filtros globais:
- **Data**: Início e fim do período
- **Laboratório**: Filtro por laboratório específico
- **Loja**: Filtro por loja específica
- **Classe**: Filtro por classe de produtos

### Sincronização Automática
- Mudanças nos filtros atualizam automaticamente todos os gráficos
- Cache inteligente com React Query (5 minutos)
- Loading states durante atualizações

## 📊 Métricas e Cálculos

### Fórmulas Implementadas
```typescript
// Margem Bruta
margem_bruta = receita_total - custo_total

// Margem Percentual
margem_percentual = (margem_bruta / receita_total) * 100

// Ticket Médio
ticket_medio = receita_total / quantidade_pedidos_com_valor

// Taxa de Crescimento
crescimento = ((valor_atual - valor_anterior) / valor_anterior) * 100

// Volatilidade (Desvio Padrão)
volatilidade = sqrt(Σ(xi - μ)² / n)
```

### Agregações Temporais
- **Diário**: Agrupamento por data (YYYY-MM-DD)
- **Semanal**: Agrupamento por semana (início da semana)
- **Mensal**: Agrupamento por mês (primeiro dia do mês)
- **Anual**: Agrupamento por ano (01 de janeiro)

## 🎨 Design e UX

### Paleta de Cores
- **Receita**: Verde (#10b981)
- **Custos**: Vermelho (#ef4444)
- **Margem**: Amarelo/Laranja (#f59e0b)
- **Pedidos**: Azul (#3b82f6)

### Cards com Gradientes
- Cada KPI tem cores distintas e gradientes suaves
- Ícones emoji para melhor usabilidade
- Informações contextuais em cada card

### Estados de Loading
- Skeleton loading para carregamento inicial
- Estados de erro com retry
- Empty states para dados insuficientes

## 🔄 Fluxo de Dados

```mermaid
graph TD
    A[Dashboard Page] --> B[DashboardFinanceiroCompleto]
    B --> C[/api/dashboard/financeiro]
    B --> D[/api/dashboard/evolucao-financeira]
    C --> E[Supabase - Pedidos]
    D --> E
    B --> F[Gráficos Recharts]
    B --> G[KPIs Cards]
    B --> H[Análises Detalhadas]
```

## 📈 Comparação com Versão Anterior

| Funcionalidade | Versão Anterior | Nova Versão |
|---|---|---|
| KPIs | 4 básicos | 4 avançados com contexto |
| Gráficos | Placeholders | 6 gráficos interativos |
| Filtros | Não integrado | Totalmente integrado |
| Tendências | Não existia | Análise completa |
| APIs | Estática | Dinâmica com parâmetros |
| UX | Básica | BI profissional |

## 🚦 Status e Próximos Passos

### ✅ Implementado
- Dashboard financeiro completo
- Integração com filtros globais
- API de evolução temporal
- Análises de tendências
- Visualizações interativas
- Estados de loading/error

### 🔄 Possíveis Melhorias Futuras
- Forecast/Previsões
- Alertas financeiros automatizados
- Comparações período a período
- Exportação de relatórios
- Drill-down por produtos
- Análise de sazonalidade

## 💾 Arquivos Modificados/Criados

### Novos Arquivos
- `src/components/dashboard/DashboardFinanceiroCompleto.tsx`
- `src/components/dashboard/AnaliseTendenciasFinanceiras.tsx`
- `src/app/api/dashboard/evolucao-financeira/route.ts`

### Arquivos Modificados
- `src/app/dashboard/page.tsx` (integração do componente)
- Correções de ícones em diversos componentes

### Configurações
- Mantida compatibilidade com API existente
- Preservada estrutura de filtros
- Mantida consistência visual

## 🎯 Objetivo Alcançado

O dashboard financeiro agora oferece:
- **Qualidade BI**: Visualizações profissionais e métricas avançadas
- **Integração Completa**: Sincronização total com sistema de filtros
- **Performance**: Loading otimizado e cache inteligente
- **Usabilidade**: Interface intuitiva e responsiva
- **Extensibilidade**: Código modular para futuras expansões

A implementação transformou uma seção básica em uma ferramenta robusta de análise financeira, mantendo a consistência com o resto da aplicação e preservando funcionalidades existentes.