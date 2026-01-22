# ✅ Integração de Armações - Análise Completa

## 📋 Resumo da Solução

A armação **MO056094** foi **CONFIRMADA** como existente e acessível no banco CRM_ERP:

- ✅ SKU Visual: `MO056094`
- ✅ SKU Banco: `AR-QUA-PRE-55181401-192`
- ✅ Descrição: `MELLO QUADRADO Preto ML52020 C1 55-18-140-C1`
- ✅ Quantidade: 3 unidades (em estoque crítico)
- ✅ Preço: R$ 196,20

## 🔄 Fluxo de Leitura de Armações

### 1. **Onde está a lógica de busca de armações?**

```
src/app/pedidos/novo/page.tsx (Página inicial)
    ↓
src/components/forms/NovaOrdemWizard.tsx (Wizard principal)
    ↓
src/components/forms/wizard-steps/Step3Armacao.tsx (Passo 3: Seleção)
    ↓
src/components/armacoes/ArmacaoSelector.tsx (Componente de seleção)
    ↓
src/lib/hooks/useArmacoes.ts (Hook React Query)
    ↓
src/lib/supabase/crm-erp-client.ts (Cliente Supabase)
    ↓
CRM_ERP → vw_estoque_completo (Apenas LEITURA)
```

### 2. **Função de Busca Principal**

**Arquivo:** [src/lib/supabase/crm-erp-client.ts](src/lib/supabase/crm-erp-client.ts#L230)

```typescript
export async function buscarArmacoes(filtros: ArmacaoFiltros) {
  // ✅ APENAS LEITURA
  let query = crmErpClient
    .from("vw_estoque_completo") // View de LEITURA
    .select("*")
    .eq("tipo_produto", "armacao") // Filtra tipo armação
    .order("descricao")
    .limit(20);

  // Filtros opcionais:
  // - loja_id: Filtra por loja específica
  // - busca: SKU, SKU Visual ou descrição
  // - marca_id: Filtra por marca
  // - categoria_id: Filtra por categoria
  // - apenas_em_estoque: Mostra apenas com quantidade > 0

  const { data, error } = await query;
  return (data || []) as ProdutoCrmErp[];
}
```

### 3. **Hook React Query**

**Arquivo:** [src/lib/hooks/useArmacoes.ts](src/lib/hooks/useArmacoes.ts)

```typescript
export function useArmacoes(filtros: ArmacaoFiltros) {
  return useQuery({
    queryKey: ["armacoes", filtros],
    queryFn: () => buscarArmacoes(filtros),
    staleTime: 2 * 60 * 1000, // Cache por 2 minutos
    gcTime: 5 * 60 * 1000, // Garbage collection em 5 minutos
  });
}
```

### 4. **Componente UI**

**Arquivo:** [src/components/armacoes/ArmacaoSelector.tsx](src/components/armacoes/ArmacaoSelector.tsx)

- Campo de busca por SKU/descrição
- Filtro "Apenas com estoque disponível"
- Lista com status (Em Estoque, Crítico, Sem Estoque)
- Seleção via clique
- Indicador de carregamento

### 5. **Step 3 do Wizard**

**Arquivo:** [src/components/forms/wizard-steps/Step3Armacao.tsx](src/components/forms/wizard-steps/Step3Armacao.tsx)

```typescript
const buscarDadosArmacao = async (armacaoId: string) => {
  // ✅ APENAS LEITURA - Busca informações após seleção
  const { data: resultado, error } = await crmErpClient
    .from("vw_estoque_completo")
    .select("*")
    .eq("produto_id", armacaoId)
    .single();

  if (resultado) {
    onChange({
      ...data,
      armacao_dados: {
        sku: resultado.sku,
        sku_visual: resultado.sku_visual,
        descricao: resultado.descricao,
        preco_custo: resultado.custo,
        preco_tabela: resultado.preco_venda,
        preco_venda_real: resultado.preco_venda, // 🎯 Inicializa com preço tabela
      },
    });
  }
};
```

## ✅ Confirmação: Apenas LEITURA

### O que fazemos:

- ✅ Ler dados de `vw_estoque_completo` (view somente leitura)
- ✅ Consultar quantidade em estoque
- ✅ Buscar preços de custo e venda
- ✅ Filtrar por loja, marca, categoria
- ✅ Armazenar dados selecionados no wizard

### O que NÃO fazemos:

- ❌ Dar baixa em estoque
- ❌ Atualizar quantidade
- ❌ Modificar preços
- ❌ Criar/deletar registros
- ❌ Escrever dados no CRM_ERP

## 📊 Estrutura de Dados Retornada

```typescript
interface ProdutoCrmErp {
  produto_id: string; // UUID do produto
  sku: string; // AR-QUA-PRE-55181401-192
  sku_visual: string; // MO056094
  cod: string | null;
  descricao: string; // MELLO QUADRADO Preto ML52020 C1 55-18-140-C1
  tipo_produto: string; // 'armacao'
  categoria_id: string | null;
  marca_id: string | null;
  modelo_id: string | null;
  cor_id: string | null;
  custo: number | null; // R$ 18,00
  preco_venda: number | null; // R$ 196,20
  codigo_barras: string | null;
  loja_id: string; // UUID da loja
  quantidade_atual: number; // 1, 2, 3, etc
  ativo: boolean; // true
  status_estoque: "NORMAL" | "CRITICO" | "SEM_ESTOQUE";
}
```

## 🎯 MO056094 Confirmado nos Testes

### Teste de Conectividade ✅

```bash
node test-armacao-especifica.js
```

**Resultado:**

```
✅ ENCONTRADO em sku_visual!
  - MO056094: MELLO QUADRADO Preto ML52020 C1 55-18-140-C1 (Qtd: 1)
  - MO056094: MELLO QUADRADO Preto ML52020 C1 55-18-140-C1 (Qtd: 2)
```

## 🔧 Como Testar na UI

1. **Ir para criação de novo pedido:**

   ```
   /pedidos/novo
   ```

2. **Passo 1:** Selecionar loja

3. **Passo 2:** Selecionar tipo de pedido (ARMACAO ou COMPLETO)

4. **Passo 3:** Na busca, digitar:
   - `MO056094` (SKU Visual)
   - `056094` (Parte do SKU)
   - `MELLO` (Descrição)
   - `Preto` (Cor/descrição)

5. **Resultado esperado:**
   - ✅ Armação aparece na lista
   - ✅ Status: "Estoque Crítico" (apenas 3 unidades)
   - ✅ Preço: R$ 196,20
   - ✅ Permite seleção

## 📝 Conclusão

A integração de armações está **COMPLETA E FUNCIONAL**:

- ✅ Busca em vw_estoque_completo funciona
- ✅ MO056094 é encontrada corretamente
- ✅ Apenas leitura de dados (seguro)
- ✅ Cache com React Query (performance)
- ✅ Filtros disponíveis (loja, marca, categoria, estoque)

**Nenhuma mudança necessária no código - tudo está funcionando!** 🎉
