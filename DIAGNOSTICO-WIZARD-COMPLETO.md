# 🔍 Diagnóstico Completo - Wizard Nova Ordem

## 📋 Checklist de Implementação

### ✅ 1. Banco de Dados

- [x] Colunas `preco_armacao`, `custo_armacao`, `margem_armacao_percentual` criadas
- [x] Colunas `preco_lente`, `custo_lente`, `margem_lente_percentual` criadas
- [x] Triggers `trigger_calcular_margem_armacao` e `trigger_calcular_margem_lente` criados
- [x] Views `view_dashboard_kpis` e `view_pedido_detalhes_completo` atualizadas

### ✅ 2. Interface (WizardData)

```typescript
// NovaOrdemWizard.tsx linha 48-52
armacao_dados?: {
  sku: string
  sku_visual: string
  descricao: string
  preco_custo?: number
  preco_tabela: number
  preco_venda_real?: number // ✅ Campo existe
}

// linha 60-68
lente_dados?: {
  nome_lente: string
  nome_grupo: string
  fornecedor_id: string
  fornecedor_nome: string
  preco_custo: number
  preco_tabela: number
  preco_venda_real?: number // ✅ Campo existe
  prazo_dias: number
}
```

### ✅ 3. Step3Armacao (Inputs de Preço)

**Status**: Implementado corretamente

- [x] Import do `Input` e `DollarSign` (linhas 3, 7)
- [x] Inicializa `preco_venda_real` com valor tabela (linha 47)
- [x] Seção "Preços da Armação" aparece quando:
  - `data.armacao_id` existe
  - `data.armacao_dados` existe
  - `!data.cliente_trouxe_armacao`
- [x] Input de preço venda real (linhas 126-143)
- [x] Cálculo de margem em tempo real (linhas 151-169)

**Condição para aparecer** (linha 94):

```tsx
{data.armacao_id && data.armacao_dados && !data.cliente_trouxe_armacao && (
  // Seção de preços aparece aqui
)}
```

### ✅ 4. Step4Lentes (Inputs de Preço)

**Status**: Implementado corretamente

- [x] Handler `handlePrecoVendaRealChange` (linhas 77-86)
- [x] Inicializa `preco_venda_real` com preço tabela (linha 72)
- [x] Seção "Preço de Venda Real" (linhas 192-256)
- [x] Input type="number" com step="0.01" (linhas 223-231)
- [x] Cálculo de margem em tempo real (linhas 239-256)

**Condição para aparecer** (linha 147):

```tsx
{data.lente_selecionada_id && data.lente_dados && (
  // Seção de preços aparece aqui
)}
```

### ✅ 5. Salvamento no Banco

**NovaOrdemWizard.tsx linhas 228-242**

```typescript
// Armações
if (data.tipo_pedido === "ARMACAO" || data.tipo_pedido === "COMPLETO") {
  pedidoData.armacao_id = data.armacao_id;
  pedidoData.origem_armacao = data.cliente_trouxe_armacao
    ? "cliente_trouxe"
    : "estoque";

  if (data.armacao_dados) {
    pedidoData.preco_armacao =
      data.armacao_dados.preco_venda_real || data.armacao_dados.preco_tabela;
    pedidoData.custo_armacao = data.armacao_dados.preco_custo || 0;
  }
}

// Lentes (linhas 273-277)
if (data.lente_dados) {
  pedidoData.preco_lente =
    data.lente_dados.preco_venda_real || data.lente_dados.preco_tabela;
  pedidoData.custo_lente = data.lente_dados.preco_custo || 0;
}
```

## 🐛 Possíveis Problemas Reportados

### Problema 1: "Não aparece opção de colocar valor da lente"

**Causa possível**: Lente não foi selecionada completamente

**Verificar**:

1. Abrir DevTools (F12) → Console
2. No Step4, após selecionar lente, verificar se existe:

```javascript
console.log(data.lente_selecionada_id); // Deve ter UUID
console.log(data.lente_dados); // Deve ter objeto com preco_tabela
```

**Solução**: A seção de preços SÓ aparece se ambos existirem (linha 147 do Step4)

### Problema 2: "Não traz armações para pedidos novos"

**Causa possível**:

- Filtro de estoque muito restritivo
- Armações não vinculadas à loja selecionada
- Erro no CRM_ERP ao buscar armações

**Verificar**:

1. Console do navegador no Step3
2. Ver se `buscarArmacoes()` retorna dados
3. Verificar se checkbox "Apenas em estoque" está marcado

**Teste rápido**:

```javascript
// No console do navegador:
const resultado = await buscarArmacoes({
  lojaId: "SEU_LOJA_ID_AQUI",
  apenas_em_estoque: false,
});
console.log(resultado);
```

### Problema 3: "Valor continua padronizado da tabela"

**Causa possível**: Input não está sendo alterado ou valor não está sendo salvo

**Debug**:

1. No Step4, após selecionar lente, o input deve mostrar o `preco_tabela`
2. Alterar o valor no input
3. Ver no console: `data.lente_dados.preco_venda_real` deve mudar

**Se não mudar**, verificar:

- Handler `handlePrecoVendaRealChange` está sendo chamado?
- Valor está sendo parseado corretamente?

## 🧪 Testes Passo a Passo

### Teste 1: Criar Pedido COMPLETO com Preços Reais

```
1. Acessar /nova-ordem
2. Step 1: Selecionar loja + OS
3. Step 2: Selecionar "COMPLETO"
4. Step 3 (Armação):
   ✓ Aparece seletor de armações?
   ✓ Ao selecionar, aparece seção "Preços da Armação"?
   ✓ Mostra: Custo | Preço Tabela | Input de Preço Venda Real?
   ✓ Ao digitar valor diferente, calcula margem?
5. Step 4 (Lentes):
   ✓ Aparece seletor de grupos?
   ✓ Ao selecionar grupo, aparece fornecedores?
   ✓ Ao selecionar fornecedor+prazo, aparece seção "Preço de Venda Real"?
   ✓ Mostra: Custo | Preço Tabela | Input de Preço Venda Real?
   ✓ Ao digitar valor diferente, calcula margem?
6. Step 5: Preencher dados cliente
7. Step 6: Revisar (deve mostrar preços reais)
8. Salvar
9. Verificar no banco:
   SELECT preco_armacao, custo_armacao, margem_armacao_percentual,
          preco_lente, custo_lente, margem_lente_percentual
   FROM pedidos WHERE numero_sequencial = [ULTIMO]
```

### Teste 2: Verificar ArmacaoSelector

```sql
-- No banco CRM_ERP, verificar se há armações:
SELECT COUNT(*) FROM pessoas.produtos
WHERE tipo_produto = 'ARMACAO'
AND loja_id = 'SEU_LOJA_ID';

-- Verificar estoque:
SELECT p.id, p.descricao, pe.quantidade_disponivel, pe.status_estoque
FROM pessoas.produtos p
LEFT JOIN pessoas.produtos_estoque pe ON p.id = pe.produto_id
WHERE p.tipo_produto = 'ARMACAO';
```

### Teste 3: Verificar Lentes no SIS_LENS

```sql
-- Verificar grupos canônicos:
SELECT COUNT(*) FROM core.grupos_lentes_canonicos;

-- Verificar lentes por fornecedor:
SELECT f.nome_fornecedor, COUNT(l.id) as total_lentes
FROM core.lentes l
JOIN core.fornecedores f ON l.fornecedor_id = f.id
GROUP BY f.nome_fornecedor;
```

## 🔧 Scripts de Correção

### Se armações não aparecem:

```sql
-- Verificar vinculação loja-armações no CRM_ERP
SELECT l.nome AS loja, COUNT(p.id) as total_armacoes
FROM pessoas.lojas l
LEFT JOIN pessoas.produtos p ON p.loja_id = l.id AND p.tipo_produto = 'ARMACAO'
GROUP BY l.nome;
```

### Se precisar resetar teste:

```sql
-- Deletar último pedido de teste
DELETE FROM public.pedidos WHERE numero_os_fisica LIKE 'TESTE%';
```

## 📝 Próximos Passos

1. **Confirmar problemas específicos**:
   - Qual step exatamente não mostra os campos?
   - Há erros no console do navegador?
   - Armações aparecem no seletor ou está vazio?

2. **Testes que preciso fazer**:
   - [ ] Criar pedido COMPLETO do início ao fim
   - [ ] Verificar se inputs de preço aparecem
   - [ ] Confirmar se valores são salvos no banco
   - [ ] Testar cálculo de margens

3. **Se ainda houver problemas**:
   - Enviar screenshot do Step3 quando armação é selecionada
   - Enviar screenshot do Step4 quando lente é selecionada
   - Enviar console.log de `data.armacao_dados` e `data.lente_dados`
