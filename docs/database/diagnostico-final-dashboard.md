# DIAGNÓSTICO FINAL - DASHBOARD PEDIDOS
Data: 2025-09-18
Status: PROBLEMA IDENTIFICADO E LOCALIZADO

## 🚨 PROBLEMA CONFIRMADO

### Sintomas Finais
- **Dashboard Web**: Mostra 2 pedidos (R$ 601)
- **Banco Real**: Tem 3 pedidos (R$ 2.001)
- **API HTTP**: /api/dashboard/kpis retorna 2 pedidos
- **Acesso Direto**: Mesma query Supabase retorna 3 pedidos

### Pedido Missing
**Pedido perdido**: 6adfa937-e72b-4fbf-a172-05886d3d8b75
- Valor: R$ 1.400 (maior pedido)
- Status: AG_PAGAMENTO
- Cliente: MARIA ISABEL BONFIM DA SILVA
- Created: 2025-09-18T18:54:51.186609+00:00

### Cálculos Matemáticos
```
Esperado: R$ 350 + R$ 1.400 + R$ 251 = R$ 2.001 (3 pedidos)
API HTTP: R$ 350 + R$ 251 = R$ 601 (2 pedidos)
Missing: R$ 1.400 (1 pedido)
```

## 🔍 LOCALIZAÇÃO DO PROBLEMA

### ✅ Descartado
- ❌ RLS (Row Level Security): Ambas chaves retornam 3 pedidos
- ❌ Middleware: Não filtra dados
- ❌ Variáveis ambiente: Mesmas para ambos contextos
- ❌ Query diferente: Exatamente a mesma query
- ❌ Lead time filtering: Todos pedidos têm lead_time NULL

### 🎯 Confirmado
- ✅ **API /api/dashboard/kpis tem BUG interno**
- ✅ Acesso direto ao Supabase funciona perfeitamente
- ✅ View v_kpis_dashboard tem dados antigos (2.504 pedidos)
- ✅ Cálculo manual deveria funcionar mas não está

## 🛠️ SOLUÇÃO IMEDIATA

### Opção 1: Recriar API simples
Criar nova API que apenas replica o acesso direto funcionando

### Opção 2: Debug linha por linha
Adicionar logs em cada linha da API atual para identificar onde perde o pedido

### Opção 3: Bypass temporário
Usar API /api/dashboard/ (simples) que funciona corretamente

## 🎯 RECOMENDAÇÃO

**AÇÃO IMEDIATA**: Usar bypass temporário - modificar hook para chamar /api/dashboard em vez de /api/dashboard/kpis

**INVESTIGAÇÃO**: API /api/dashboard/kpis tem bug oculto entre busca e retorno dos dados