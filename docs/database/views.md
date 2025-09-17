# 📊 Views do Banco de Dados

Documentação das **17 views** complexas que existem no banco de dados do sistema Desenrola DCL.

## 🎯 Visão Geral

O sistema possui **17 views otimizadas** que fornecem dados agregados e processados para o dashboard e relatórios. Todas as views estão funcionando e em produção.

## 📈 Views do Dashboard Principal

### 🎯 v_kpis_dashboard
**Finalidade**: KPIs principais do dashboard com métricas consolidadas.

**Campos principais**:
- `total_pedidos`: Total de pedidos no sistema
- `entregues`: Pedidos entregues
- `lead_time_medio`: Tempo médio de entrega (dias)
- `pedidos_atrasados`: Pedidos em atraso
- `ticket_medio`: Valor médio dos pedidos
- `margem_percentual`: Margem de lucro %
- `sla_compliance`: Compliance SLA %
- `labs_ativos`: Laboratórios ativos
- `valor_total_vendas`: Faturamento total
- `custo_total_lentes`: Custo total das lentes

**Usado em**: `/api/dashboard/kpis`

---

### 📊 v_dashboard_resumo
**Finalidade**: Resumo rápido por status dos últimos 30 dias.

**Campos principais**:
- `total_pedidos`: Total geral
- `registrados`: Status REGISTRADO
- `aguardando_pagamento`: Status AG_PAGAMENTO  
- `pagos`: Status PAGO
- `em_producao`: Status PRODUCAO
- `prontos`: Status PRONTO
- `enviados`: Status ENVIADO
- `chegaram`: Status CHEGOU
- `entregues`: Status ENTREGUE
- `pagamentos_atrasados`: Com atraso no pagamento
- `producao_atrasada`: Com atraso na produção
- `requer_atencao`: Que requerem atenção

**Usado em**: `/api/dashboard/resumo`

---

### 📈 v_evolucao_mensal
**Finalidade**: Evolução temporal dos indicadores por mês.

**Campos principais**:
- `periodo`: Data do mês (date_trunc)
- `mes_nome`: Nome do mês (Mon)
- `total_pedidos`: Volume mensal
- `entregues`: Entregues no mês
- `ticket_medio`: Ticket médio mensal
- `lead_time_medio`: Lead time médio
- `sla_compliance`: SLA % do mês
- `garantias`: Pedidos de garantia
- `taxa_garantia`: % de garantias
- `faturamento_total`: Receita do mês
- `custo_total`: Custo das lentes
- `margem_percentual`: Margem % do mês
- `labs_ativos`: Labs ativos no mês
- `lojas_ativas`: Lojas ativas no mês
- `pedidos_urgentes`: Urgentes no mês

**Usado em**: `/api/dashboard/evolucao-mensal`

---

## 🏆 Views de Ranking e Performance

### 🥇 v_ranking_laboratorios
**Finalidade**: Ranking completo dos laboratórios com score de performance.

**Campos principais**:
- `posicao`: Posição no ranking
- `laboratorio_nome`: Nome do laboratório
- `laboratorio_codigo`: Código do lab
- `total_pedidos`: Volume total
- `pedidos_ultima_semana`: Volume semanal
- `sla_compliance`: SLA % do laboratório
- `lead_time_medio`: Lead time médio
- `tempo_producao_medio`: Tempo produção
- `ticket_medio`: Ticket médio
- `faturamento_total`: Receita do lab
- `pedidos_atrasados`: Pedidos atrasados
- `pedidos_risco`: Pedidos em risco
- `monofocais`: Volume monofocais
- `multifocais`: Volume multifocais
- `transitions`: Volume transitions
- `tempo_resposta_horas`: Tempo resposta
- `score_geral`: Score calculado (0-100)
- `status_risco`: ALTO/MÉDIO/BAIXO
- `tendencia`: SUBINDO/DESCENDO/ESTÁVEL

**Usado em**: `/api/dashboard/ranking-laboratorios`

---

### 🎯 v_heatmap_sla
**Finalidade**: Heatmap de SLA por laboratório vs classe de lente.

**Campos principais**:
- `laboratorio_nome`: Nome do laboratório
- `classe_categoria`: Categoria da lente
- `classe_nome`: Nome da classe
- `total_pedidos`: Volume da combinação
- `sla_compliance`: SLA % da combinação
- `lead_time_medio`: Lead time médio
- `pedidos_atrasados`: Atrasados na combinação
- `ticket_medio`: Ticket médio

**Usado em**: `/api/dashboard/heatmap-sla`

---

## 💰 Views Financeiras

### 💸 v_analise_financeira
**Finalidade**: Análise financeira por categoria de lente (últimos 90 dias).

**Campos principais**:
- `categoria`: Categoria da lente
- `volume_pedidos`: Volume da categoria
- `pedidos_entregues`: Entregues na categoria
- `faturamento_total`: Receita da categoria
- `ticket_medio`: Ticket médio da categoria
- `lead_time_medio`: Lead time médio
- `sla_compliance`: SLA % da categoria
- `registrados`: Em status REGISTRADO
- `aguardando_pagamento`: Em AG_PAGAMENTO
- `em_producao`: Em PRODUCAO
- `entregues`: Entregues
- `idade_media_dias`: Idade média dos pedidos
- `laboratorio_mais_usado`: Lab mais usado na categoria

**Usado em**: `/api/dashboard/analise-financeira`

---

## 🚨 Views de Alertas

### ⚠️ v_alertas_criticos
**Finalidade**: Alertas críticos automáticos baseados em performance.

**Tipos de alerta**:
- `LABORATÓRIO EM RISCO`: SLA < 90%
- `TEMPO RESPOSTA LENTO`: > 24h para responder
- `VOLUME MUITO BAIXO`: < 2 pedidos na semana

**Campos principais**:
- `tipo_alerta`: Tipo do alerta
- `prioridade`: CRÍTICA/ALTA/MÉDIA
- `laboratorio_nome`: Lab afetado
- `problema`: Descrição do problema
- `pedidos_afetados`: Quantidade afetada
- `valor_risco`: Valor em risco (R$)
- `indicador_numerico`: Valor do indicador
- `acao_sugerida`: Ação recomendada
- `prazo_acao`: Prazo para ação
- `responsavel`: Quem deve agir

**Usado em**: `/api/dashboard/alertas`

---

## 📊 Views de Business Intelligence

### 🧠 v_dashboard_bi
**Finalidade**: View principal de BI que consolida todos os dados para análises.

**Campos principais**:
- Dados do pedido completos
- Dados da loja (nome, código)
- Dados do laboratório (nome, código)
- Dados da classe (nome, categoria, cor)
- `horas_producao_real`: Horas reais de produção
- `dias_desde_criacao`: Idade do pedido
- `status_sla`: NO_PRAZO/ATRASADO/EM_ANDAMENTO/RISCO_ATRASO
- `ano`, `mes`, `ano_mes`: Dimensões temporais

**Usada como base para**: Múltiplas outras views e análises

---

### 📅 v_analise_sazonalidade
**Finalidade**: Análise de sazonalidade por dia da semana (últimos 90 dias).

**Campos principais**:
- `dia_semana`: Número do dia (0-6)
- `nome_dia_semana`: Nome do dia
- `total_pedidos`: Volume do dia
- `ticket_medio`: Ticket médio do dia
- `lead_time_medio`: Lead time do dia
- `pedidos_urgentes`: Urgentes no dia
- `labs_diferentes`: Labs únicos no dia
- `percentual_total`: % do volume total

**Usado em**: `/api/dashboard/sazonalidade`

---

### 🔗 v_correlacoes
**Finalidade**: Correlações entre prioridade, categoria e performance.

**Campos principais**:
- `prioridade`: URGENTE/NORMAL
- `classe_categoria`: Categoria da lente
- `total_pedidos`: Volume da combinação
- `lead_time_urgente`: Lead time dos urgentes
- `lead_time_normal`: Lead time dos normais
- `ticket_urgente`: Ticket dos urgentes
- `ticket_normal`: Ticket dos normais
- `sla_urgente`: SLA % dos urgentes
- `sla_normal`: SLA % dos normais

**Usado em**: `/api/dashboard/correlacoes`

---

## 📱 Views do Kanban

### 📋 v_pedidos_kanban
**Finalidade**: Dados completos dos pedidos para o board Kanban.

**Campos principais**:
- Todos os dados do pedido
- Dados relacionados (loja, lab, classe)
- `lead_time_dias`: Lead time em dias
- `status_label`: Label amigável do status
- `em_atraso`: Boolean se está atrasado
- `dias_atraso`: Quantos dias de atraso

**Usado em**: `/app/kanban` e `/api/pedidos`

---

### 📈 v_pedido_timeline_completo
**Finalidade**: Timeline completa dos pedidos com cálculos de tempo.

**Campos principais**:
- Dados do evento de timeline
- `responsavel_nome`: Nome do responsável
- `tempo_etapa_anterior_horas`: Tempo da etapa anterior
- `tempo_etapa_anterior_dias`: Tempo em dias
- `status_label`: Label amigável
- `status_color`: Cor do status
- `ordem_etapa`: Ordem cronológica

**Usado em**: `/api/pedidos/[id]/timeline`

---

## 🔍 Views de Análise Avançada

### ⚡ v_lead_time_comparativo
**Finalidade**: Comparativo de lead times para benchmarking.

**Campos principais**:
- `laboratorio_id`: ID do laboratório
- `classe_lente_id`: ID da classe
- `media_laboratorio`: Média do laboratório
- `media_classe`: Média da classe
- `media_geral`: Média geral do sistema
- `pedidos_laboratorio`: Volume do laboratório
- `pedidos_classe`: Volume da classe
- `total_pedidos`: Volume total

**Usado em**: Análises internas de performance

---

### 🎯 v_insights_automaticos
**Finalidade**: Insights automáticos gerados pelo sistema.

**Retorna**: Array de insights textuais como:
- "🏆 [Lab] é o laboratório com melhor performance geral"
- "💰 [Categoria] é a categoria mais rentável"
- "📅 [Dia] é o dia com maior volume de pedidos"
- "📊 Total de [X] pedidos no sistema"

**Usado em**: `/api/dashboard/insights`

---

### 📈 v_projecoes
**Finalidade**: Projeções futuras baseadas em dados históricos.

**Campos principais**:
- `periodo`: "Próximos 3 meses"
- `pedidos_projetados`: Volume projetado
- `ticket_projetado`: Ticket médio projetado
- `lead_time_projetado`: Lead time projetado
- `faturamento_projetado`: Faturamento projetado
- `crescimento_percentual_mensal`: % crescimento

**Usado em**: `/api/dashboard/projecoes`

---

## ✅ Status das Views

### 🟢 Views Funcionando
Todas as **17 views** estão criadas e funcionando:

1. ✅ `v_kpis_dashboard`
2. ✅ `v_dashboard_resumo`
3. ✅ `v_evolucao_mensal`
4. ✅ `v_ranking_laboratorios`
5. ✅ `v_heatmap_sla`
6. ✅ `v_analise_financeira`
7. ✅ `v_alertas_criticos`
8. ✅ `v_dashboard_bi`
9. ✅ `v_analise_sazonalidade`
10. ✅ `v_correlacoes`
11. ✅ `v_pedidos_kanban`
12. ✅ `v_pedido_timeline_completo`
13. ✅ `v_lead_time_comparativo`
14. ✅ `v_insights_automaticos`
15. ✅ `v_projecoes`
16. ✅ `v_dashboard_kpis_full`
17. ✅ `v_dashboard_kpis`

### 🔄 Dependências Entre Views
- `v_dashboard_bi` → Base para múltiplas views
- `v_ranking_laboratorios` → Usada por `v_alertas_criticos`
- `v_kpis_dashboard` → Usada por `v_insights_automaticos`

## 🚀 Performance e Status Validado

### ⚡ Performance Real (Testado 15/09/2024)
- **v_alertas_criticos**: 1.4ms (view mais complexa)
- **v_ranking_laboratorios**: <1ms (agregações otimizadas)
- **Índices**: 100% funcionando com cache Memoize
- **Buffers**: Uso eficiente de memória (78 shared hits)

### 📊 Dados em Produção Validados
- **Total Views Funcionando**: 17/17 ✅
- **Consistência de Dados**: 100% entre views e tabelas
- **v_lead_time_comparativo**: 72 registros (combinações lab/classe)
- **v_alertas_criticos**: 2 alertas ativos
- **v_ranking_laboratorios**: 5 laboratórios ativos (últimos 90 dias)

### 🎯 Status por View
| View | Registros | Performance | Status |
|------|-----------|-------------|--------|
| v_kpis_dashboard | 1 | <1ms | ✅ |
| v_dashboard_resumo | 1 | <1ms | ✅ |
| v_ranking_laboratorios | 5 | <1ms | ✅ |
| v_pedidos_kanban | 2.948 | <1ms | ✅ |
| v_alertas_criticos | 2 | 1.4ms | ✅ |
| v_lead_time_comparativo | 72 | <1ms | ✅ |

### ⚠️ Alertas Identificados
- **SLA Compliance**: 0% médio nos laboratórios (requer investigação)
- **Volume Baixo**: Apenas 34 pedidos nos últimos 30 dias
- **Laboratórios Ativos**: Apenas 5 de 9 laboratórios com pedidos recentes

### 🔄 Dependências Entre Views
- `v_dashboard_bi` → Base para múltiplas views
- `v_ranking_laboratorios` → Usada por `v_alertas_criticos`
- `v_kpis_dashboard` → Usada por `v_insights_automaticos`

### 📊 Complexidade Validada
- **Simples**: v_dashboard_resumo, v_projecoes (<1ms)
- **Médias**: v_evolucao_mensal, v_analise_financeira (<1ms)
- **Complexas**: v_ranking_laboratorios, v_alertas_criticos (1.4ms)