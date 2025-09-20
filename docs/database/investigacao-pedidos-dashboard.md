# RESULTADO INVESTIGAÇÃO PEDIDOS - DASHBOARD
Data: 2025-09-18
Script: investigacao_pedidos_simples.js

## 🔍 DADOS REAIS ENCONTRADOS

### Total de Pedidos
- **Tabela real**: 3 pedidos ✅
- **View dashboard**: 3 pedidos ✅
- **Status**: SINCRONIZADOS

### Detalhes dos 3 Pedidos
1. **Pedido 1**: 6adfa937-e72b-4fbf-a172-05886d3d8b75
   - Cliente: MARIA ISABEL BONFIM DA SILVA
   - Valor: R$ 1.400,00
   - Status: AG_PAGAMENTO
   - Criado: 2025-09-18 às 18:54

2. **Pedido 2**: f0cfb380-5039-45b3-a25c-624a77d9b19b
   - Cliente: GABRIEL SOUZA XAVIER
   - Valor: R$ 251,00
   - Status: AG_PAGAMENTO
   - Criado: 2025-09-18 às 14:33

3. **Pedido 3**: c99b4b8b-c9f5-46c6-9ccd-46cbea6eeb60
   - Cliente: LETICIA GHIORZI BRANDÃO
   - Valor: R$ 350,00
   - Status: AG_PAGAMENTO
   - Criado: 2025-09-18 às 14:29

### Estatísticas Consolidadas
- **Total de pedidos**: 3
- **Todos com status**: AG_PAGAMENTO
- **Pedidos entregues**: 0
- **Valor total**: R$ 2.001,00
- **Ticket médio**: R$ 667,00

## 🎯 CONCLUSÃO

### Problema Identificado
O dashboard deveria mostrar **3 pedidos** conforme confirmado pelo usuário e pela investigação terminal. 

### Status da Sincronização
- ✅ View `v_kpis_dashboard` está sincronizada (3 pedidos)
- ✅ Tabela `pedidos` tem exatamente 3 registros
- ❓ Dashboard web ainda mostra apenas 2 pedidos

### Possíveis Causas do Dashboard Web
1. **Cache do browser** - dados antigos no frontend
2. **API middleware** - filtros adicionais na rota
3. **Estado React** - componentes não atualizando
4. **Condições WHERE** - filtros na query da dashboard

### Próximos Passos Recomendados
1. Verificar API route `/api/dashboard/` para filtros adicionais
2. Limpar cache do browser / hard refresh
3. Verificar se há filtros por data/status no dashboard
4. Investigar componente React do dashboard