# 📊 Implementação Completa: Margens de Armações e KPIs

## ✅ O que foi implementado

### 1. 🗄️ Banco de Dados

#### Script: `ADD-PRECOS-REAIS-ARMACAO-LENTE.sql`

- ✅ Colunas adicionadas na tabela `pedidos`:
  - `preco_armacao` - Preço de venda real (com desconto)
  - `custo_armacao` - Custo de aquisição
  - `margem_armacao_percentual` - Calculada automaticamente
  - `preco_lente` - Preço de venda real (com desconto)
  - `custo_lente` - Custo de aquisição
  - `margem_lente_percentual` - Calculada automaticamente

- ✅ Triggers criados:
  - `trigger_calcular_margem_armacao` - Calcula margem ao inserir/atualizar
  - `trigger_calcular_margem_lente` - Calcula margem ao inserir/atualizar

#### Script: `UPDATE-DASHBOARD-KPIS-COM-ARMACOES.sql`

- ✅ View `view_dashboard_kpis` atualizada com:
  - **Contadores por tipo**: COMPLETO, ARMACAO, LENTES, SERVICO
  - **KPIs de Armações**:
    - Volume total de armações
    - Custo total de armações
    - Margem média percentual
    - Ticket médio de armações
  - **KPIs de Lentes**:
    - Volume total de lentes
    - Custo total de lentes
    - Margem média percentual
    - Ticket médio de lentes
  - **Margem consolidada real**: Considera armações + lentes

- ✅ Nova view `view_pedido_detalhes_completo`:
  - Cálculos automáticos de lucro por produto
  - Margem consolidada do pedido
  - Join com laboratórios e lojas

### 2. 🎨 Frontend

#### Step3Armacao.tsx

- ✅ Campo de input para preço de venda real
- ✅ Display de: Custo | Preço Tabela | **Preço Venda Real**
- ✅ Cálculo em tempo real de:
  - Margem percentual: `(venda - custo) / venda * 100`
  - Lucro em R$: `venda - custo`

#### Step4Lentes.tsx

- ✅ Campo de input padronizado para preço de venda real
- ✅ Mesmo layout: Custo | Preço Tabela | **Preço Venda Real**
- ✅ Cálculos em tempo real de margem e lucro

#### NovaOrdemWizard.tsx

- ✅ Salvamento de `preco_armacao` e `custo_armacao`
- ✅ Salvamento de `preco_lente` e `custo_lente`
- ✅ Usa `preco_venda_real` ou fallback para `preco_tabela`

#### Página de Detalhes (/pedidos/[id]/page.tsx)

- ✅ **3 seções de KPIs**:
  1. **Armação** (se tipo ARMACAO ou COMPLETO):
     - Preço Venda
     - Custo
     - Lucro
     - Margem %
  2. **Lentes** (se tipo LENTES ou COMPLETO):
     - Preço Venda
     - Custo
     - Lucro
     - Margem %
  3. **Total Consolidado**:
     - Valor Total
     - Custo Total
     - Lucro Total
     - Margem % Consolidada

## 🎯 Benefícios Implementados

### Para Gestores

- 📊 **Margens reais** (não fictícias) calculadas automaticamente
- 💰 **Visibilidade total** de lucro por produto (armação + lente)
- 📈 **KPIs no dashboard** separados por tipo de produto
- 🎯 **Decisões baseadas** em dados reais de margem

### Para Vendedores

- 💵 **Input de desconto** direto no wizard
- 👁️ **Visualização instantânea** da margem ao dar desconto
- ⚡ **Feedback imediato** sobre rentabilidade do pedido

### Para o Futuro (PDV)

- 🔄 **Estrutura pronta** para integração PDV
- 📱 **Mesmos campos** serão usados no PDV
- 🎲 **Margens calculadas** tanto no wizard quanto no PDV
- 📊 **Relatórios consolidados** de todos os canais

## 📋 Próximos Passos

### 1. Executar Scripts SQL

```bash
# 1. Executar no Supabase SQL Editor:
# - ADD-PRECOS-REAIS-ARMACAO-LENTE.sql
# - UPDATE-DASHBOARD-KPIS-COM-ARMACOES.sql

# 2. Verificar colunas criadas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name LIKE '%armacao%' OR column_name LIKE '%lente%'
ORDER BY ordinal_position;
```

### 2. Testar no Wizard

1. Criar pedido COMPLETO
2. Selecionar armação → Verificar input de preço real
3. Selecionar lente → Verificar input de preço real
4. Aplicar desconto em ambos
5. Ver margens calculadas em tempo real
6. Salvar e verificar no banco

### 3. Testar na Página de Detalhes

1. Abrir pedido COMPLETO salvo
2. Verificar 3 seções de KPIs:
   - Armação (verde/laranja/azul/roxo)
   - Lentes (verde/laranja/azul/roxo)
   - Total Consolidado
3. Confirmar cálculos de margem

### 4. Validar Dashboard

1. Acessar /dashboard
2. Verificar novos KPIs:
   - Volume de armações
   - Margem média de armações
   - Ticket médio de armações
   - Volume de lentes
   - Margem média de lentes
   - Ticket médio de lentes
   - Margem consolidada real

## 🔥 Fórmulas Implementadas

### Margem Percentual

```
margem_percentual = (preco_venda_real - custo) / preco_venda_real * 100
```

### Lucro Bruto

```
lucro = preco_venda_real - custo
```

### Margem Consolidada

```
margem_consolidada =
  ((preco_armacao + preco_lente) - (custo_armacao + custo_lente)) /
  (preco_armacao + preco_lente) * 100
```

## 📝 Notas Técnicas

- ✅ Triggers calculam margens automaticamente no banco
- ✅ Frontend mostra preview antes de salvar
- ✅ Banco de dados é a fonte da verdade
- ✅ Views otimizadas para performance
- ✅ RLS aplicado em todas as views
- ✅ Compatível com futura integração PDV

## 🎉 Status: PRONTO PARA EXECUÇÃO

Todos os arquivos foram criados e atualizados.
Execute os scripts SQL no Supabase para ativar as funcionalidades!
