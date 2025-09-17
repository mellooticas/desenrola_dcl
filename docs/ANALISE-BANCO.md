# 📊 ANÁLISE COMPLETA: HOOKS E APIS vs BANCO

## 🔍 VIEWS ESPERADAS PELAS APIS

### ✅ APIs Dashboard que tentam buscar views:

1. **`/api/dashboard/kpis`** → busca `v_kpis_dashboard`
2. **`/api/dashboard/ranking-laboratorios`** → busca `v_ranking_laboratorios`
3. **`/api/dashboard/evolucao-mensal`** → busca `v_evolucao_mensal`
4. **`/api/dashboard/analise-financeira`** → busca `v_analise_financeira`
5. **`/api/dashboard/alertas-criticos`** → busca `v_alertas_criticos`
6. **`/api/dashboard/heatmap-sla`** → busca `v_heatmap_sla`
7. **`/api/dashboard/sazonalidade`** → busca `v_analise_sazonalidade`
8. **`/api/dashboard/insights`** → busca `v_insights_automaticos`
9. **`/api/dashboard/projecoes`** → busca `v_projecoes`
10. **`/api/dashboard/correlacoes`** → busca `v_correlacoes`
11. **`/api/dashboard/complete`** → busca múltiplas views
12. **`/api/dashboard`** → busca `v_dashboard_resumo`

## 🗄️ TABELAS ESPERADAS PELOS HOOKS

### ✅ Hooks que acessam tabelas diretamente:

1. **`useNotifications`** → tabela `notificacoes`
2. **`usePermissions`** → tabela `role_permissions`
3. **`usePedidos`** → tabelas `pedidos`, `pedido_eventos`
4. **`useLojas`** → tabela `lojas`
5. **`useLaboratorios`** → tabela `laboratorios`
6. **`useClassesLente`** → tabela `classes_lente`
7. **`useAlertas`** → tabela `alertas`

## 🎯 O QUE FAZER AGORA:

### PASSO 1: Execute a consulta SQL
Cole o arquivo `sql-queries/verificar-estrutura-banco.sql` no Supabase SQL Editor e execute.

### PASSO 2: Cole aqui o resultado
Com o resultado saberemos exatamente:
- ✅ O que já existe no banco
- ❌ O que está faltando
- 🔧 O que precisa ser criado

### PASSO 3: Criar apenas o que falta
Em vez de criar tudo do zero, vamos criar apenas as views que não existem.

---

## 📋 LISTA COMPLETA DE VIEWS ESPERADAS:

```
v_kpis_dashboard
v_ranking_laboratorios
v_evolucao_mensal
v_analise_financeira
v_alertas_criticos
v_heatmap_sla
v_analise_sazonalidade
v_insights_automaticos
v_projecoes
v_correlacoes
v_dashboard_resumo
v_pedidos_kanban
v_dashboard_bi
v_pedido_timeline_completo
v_lead_time_comparativo
v_dashboard_kpis_full
```

## 📋 LISTA COMPLETA DE TABELAS ESPERADAS:

```
pedidos
laboratorios
lojas
classes_lente
alertas
notificacoes
role_permissions
pedido_eventos
usuarios
```

---

**🚀 Execute o SQL de verificação e cole o resultado para continuarmos!**