# ✅ Wizard V2 - Integração com Fornecedores Reais

## 🎯 Mudança Implementada

Atualizado **CriarPedidoWizardV2** para buscar fornecedores/laboratórios REAIS do banco de lentes ao invés de dados simulados.

---

## 📊 Arquitetura de Dados (Conforme Banco Real)

### Views Utilizadas

1. **`v_grupos_canonicos`** (Step 1)

   - Grupos de lentes com características agregadas
   - Campos: `grupo_id`, `nome_grupo`, `material`, `tipo_lente`, `preco_medio`, etc.
   - Uso: Busca inicial com filtros

2. **`v_lentes_catalogo`** (Step 2)
   - TODAS as lentes físicas individuais
   - Cada lente já vem com fornecedor completo
   - Campos chave:
     - `id` (lente_id - chave primária)
     - `fornecedor_id`, `fornecedor_nome`
     - `prazo_visao_simples`, `prazo_multifocal`
     - `marca_id`, `marca_nome`, `marca_premium`
     - `preco_custo`, `preco_venda_sugerido`
     - `estoque_disponivel`

---

## 🔄 Fluxo Atualizado

### Step 1: Buscar Grupo Canônico

```typescript
// Query em v_grupos_canonicos
const { data } = await lentesClient
  .from("v_grupos_canonicos")
  .select("*")
  .ilike("nome_grupo", `%${termo}%`)
  .eq("material", filtros.material)
  .eq("tipo_lente", filtros.tipo)
  .order("preco_medio")
  .limit(20);
```

**Usuário escolhe**: Ex: "CR39 Visão Simples com AR"

---

### Step 2: Buscar Lentes Físicas (Fornecedores)

```typescript
// Query em v_lentes_catalogo WHERE grupo_id
const { data } = await lentesClient
  .from("v_lentes_catalogo")
  .select(
    `
    id,
    slug,
    nome_lente,
    fornecedor_id,
    fornecedor_nome,
    prazo_visao_simples,
    prazo_multifocal,
    marca_id,
    marca_nome,
    marca_premium,
    tipo_lente,
    preco_custo,
    preco_venda_sugerido,
    estoque_disponivel
  `
  )
  .eq("grupo_id", grupoSelecionado.grupo_id)
  .eq("ativo", true)
  .order("preco_venda_sugerido")
  .limit(20);
```

**Resultado**: Lista de 3-20 lentes do mesmo grupo, cada uma com:

- Fornecedor diferente (Hoya, Essilor, Vision Opt, etc.)
- Preço real
- Prazo real do fornecedor
- Estoque disponível
- Marca premium ou genérica

**Usuário escolhe**: Ex: "Hoya - R$280 - 5 dias - 12 em estoque"

---

### Step 3: Criar Pedido

```typescript
await supabase.from("pedidos").insert({
  loja_id: user.loja_id,
  lente_catalogo_id: lenteEscolhida.id, // ✅ ID da lente física
  laboratorio_id: lenteEscolhida.fornecedor_id, // ✅ ID do fornecedor
  nome_cliente,
  telefone_cliente,
  tipo_lente: lenteEscolhida.tipo_lente,
  observacoes: `...`,
  valor_total,
  status: "REGISTRADO",
});
```

---

## 🆚 Antes vs Depois

### ❌ Antes (Simulado)

```typescript
setFornecedores([
  {
    lente_id: `sim-${grupo_id}-1`,
    fornecedor_nome: "Hoya", // ❌ Hardcoded
    preco_tabela: grupo.preco_medio, // ❌ Preço aproximado
    prazo_entrega: 5, // ❌ Prazo fictício
  },
]);
```

### ✅ Depois (Real)

```typescript
const { data } = await lentesClient
  .from("v_lentes_catalogo") // ✅ View real do banco
  .select("*")
  .eq("grupo_id", grupo.grupo_id); // ✅ Filtra por grupo

// data = [
//   {
//     id: "uuid-real",
//     fornecedor_id: "uuid-fornecedor",
//     fornecedor_nome: "Hoya", // ✅ Nome real
//     preco_venda_sugerido: 287.50, // ✅ Preço real
//     prazo_visao_simples: 5 // ✅ Prazo real do fornecedor
//   }
// ]
```

---

## 📦 Interface Atualizada

```typescript
interface LenteFornecedor {
  id: string; // lente_id (chave primária)
  slug: string;
  nome_lente: string;
  fornecedor_id: string; // ✅ Para salvar no pedido
  fornecedor_nome: string; // ✅ Para exibir na UI
  fornecedor_prazo_visao_simples: number | null;
  fornecedor_prazo_multifocal: number | null;
  marca_id: string | null;
  marca_nome: string | null;
  marca_premium: boolean | null;
  tipo_lente: string;
  preco_custo: number;
  preco_venda_sugerido: number; // ✅ Preço real
  estoque_disponivel: number; // ✅ Mostra se tem estoque
}
```

---

## 🎨 UX Melhorado

### Cards de Fornecedores (Step 2)

```tsx
{
  lentes.map((lente) => {
    const prazo =
      lente.tipo_lente === "visao_simples"
        ? lente.fornecedor_prazo_visao_simples
        : lente.fornecedor_prazo_multifocal;

    return (
      <Card>
        <Building2 /> {lente.fornecedor_nome}
        {lente.marca_premium && <Badge>⭐ Premium</Badge>}
        {lente.estoque_disponivel > 0 && (
          <Badge>📦 {lente.estoque_disponivel} em estoque</Badge>
        )}
        💰 R$ {lente.preco_venda_sugerido.toFixed(2)}
        ⏱️ {prazo} dias úteis
        {lente.marca_nome && `🏷️ ${lente.marca_nome}`}
      </Card>
    );
  });
}
```

**Benefícios**:

- ✅ Preços reais por fornecedor
- ✅ Prazos reais por tipo de lente
- ✅ Marcas premium destacadas
- ✅ Estoque visível
- ✅ Permite comparação fácil

---

## 🔗 Relacionamento com Banco Desenrola

### Tabela `pedidos` - Campos Atualizados

```sql
-- Campos que recebem dados do catálogo de lentes:
lente_catalogo_id UUID -- ✅ ID da lente física escolhida
laboratorio_id UUID    -- ✅ ID do fornecedor
tipo_lente TEXT        -- ✅ visao_simples, multifocal, etc
valor_total NUMERIC    -- ✅ preco_venda_sugerido
observacoes TEXT       -- ✅ Detalhes da lente/marca/prazo
```

---

## 📝 Checklist de Implementação

- [x] Interface `LenteFornecedor` criada
- [x] Query Step 1 usando `v_grupos_canonicos`
- [x] Query Step 2 usando `v_lentes_catalogo`
- [x] Mapeamento de dados do banco para interface
- [x] UI Step 2 atualizada com dados reais
- [x] Resumo Step 3 com fornecedor real
- [x] Insert de pedido com `lente_catalogo_id` e `laboratorio_id`
- [x] Cálculo de prazo baseado em `tipo_lente`
- [x] Badges de marca premium e estoque
- [x] Remoção de código simulado
- [x] Build sem erros TypeScript

---

## 🚀 Próximos Passos (Futuro)

1. **Filtros Step 1** - Adicionar filtros de tratamentos quando soubermos os nomes corretos das colunas
2. **Paginação Step 2** - Se houver muitos fornecedores (>20)
3. **Comparador Visual** - Tabela lado-a-lado de fornecedores
4. **Filtros Step 2** - Filtrar por marca, prazo máximo, preço máximo
5. **Favoritos** - Salvar fornecedores preferidos por loja

---

## ✅ Status

**Implementação Completa** ✅

- Build: OK
- TypeScript: OK
- Queries: Usando views reais
- Dados: Fornecedores/laboratórios reais
- UX: Comparação visual de opções

**Testado**: Aguardando teste com banco populado
