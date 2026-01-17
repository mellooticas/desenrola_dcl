# 📝 Resumo: Wizard V2 - Lançamento Manual de Pedidos

## ✅ Implementação Completa

### 🎯 Objetivo

Criar wizard simplificado para vendedores lançarem pedidos manualmente durante o período de transição do PDV antigo para o novo sistema integrado.

---

## 🚀 Funcionalidades Implementadas

### **Step 1: Buscar Lente com Filtros** 🔍

#### Busca Textual

- Campo de busca com debounce (300ms)
- Busca por `nome_grupo` na view `v_grupos_canonicos`
- Mínimo 2 caracteres para ativar busca

#### Filtros Rápidos (Chips Clicáveis)

1. **Material**

   - 💎 CR39
   - 🛡️ Policarbonato
   - ✨ Trivex
   - 🔬 High Index

2. **Tipo de Lente**

   - 👁️ Visão Simples
   - 👓 Multifocal
   - 🔀 Bifocal

3. **Tratamentos** (multi-seleção)
   - ✨ Antirreflexo (AR)
   - 🔵 Blue Light
   - ☀️ UV400
   - 🌓 Fotossensível

#### Cards de Resultado

- Grid responsivo (2 colunas em desktop)
- Badges visuais para tratamentos
- Preço médio exibido
- Click para selecionar e avançar

---

### **Step 2: Escolher Laboratório** 🏭

#### Busca Automática de Fornecedores

- Query na view `v_fornecedores_por_lente`
- Filtra por `grupo_id` da lente escolhida
- Ordena por preço (menor primeiro)
- Limite de 10 fornecedores

#### Fallback: Fornecedores Simulados

Se a view não retornar dados:

- Hoya (destaque) - R$ preço_medio, 5 dias
- Essilor - R$ preço_medio \* 1.15, 3 dias
- Vision Opt - R$ preço_medio \* 0.90, 7 dias

#### Cards de Fornecedor

- 🏭 Nome do fornecedor
- 🏷️ Marca e linha de produto
- 💰 Preço da tabela
- ⏱️ Prazo de entrega
- ⭐ Badge "Destaque" para fornecedores premium
- Visual com borda quando selecionado

---

### **Step 3: Dados do Pedido** 📝

#### Formulário

1. **Nome do Cliente** \* (required)
2. **Telefone** \* (required)
3. **Valor Total** \* (pré-preenchido com preço do fornecedor)
4. **Observações** (opcional)

#### Criação do Pedido

- Busca `loja_id` do usuário logado
- Insere na tabela `pedidos` com status `REGISTRADO`
- Observações formatadas incluem:
  - 📦 Nome da lente
  - 🏭 Fornecedor
  - 🏷️ Marca/Linha
  - ⚡ Prazo de entrega
  - 📝 Observações customizadas

---

## 🎨 UX/UI Highlights

### Breadcrumbs Visuais

```
[1. Lente] → [2. Laboratório] → [3. Dados]
```

Com badges coloridos indicando progresso (default/secondary/outline)

### Auto-busca Inteligente

Busca automática quando:

- Usuário digita (após 300ms)
- Clica em qualquer filtro
- Remove filtros

### Feedback Visual

- Loading spinners durante buscas
- Cards hover com border-primary
- Cards selecionados com ring-2 ring-primary
- Alert informativos em cada step

### Navegação Fluída

- Botão "Voltar" em todos os steps
- Auto-avança ao selecionar lente/fornecedor
- Fecha e reseta state ao finalizar

---

## 🔧 Código Técnico

### Arquivo Principal

```
src/components/forms/CriarPedidoWizardV2.tsx
```

### Integração

```tsx
// src/app/kanban/page.tsx
import { CriarPedidoWizardV2 } from "@/components/forms/CriarPedidoWizardV2";

<CriarPedidoWizardV2
  open={showCriarPedidoWizard}
  onClose={() => setShowCriarPedidoWizard(false)}
  onSuccess={() => {
    loadPedidos();
    setShowCriarPedidoWizard(false);
  }}
/>;
```

### Queries Principais

#### 1. Buscar Lentes com Filtros

```typescript
let query = lentesClient
  .from("v_grupos_canonicos")
  .select("*")
  .ilike("nome_grupo", `%${termo}%`)
  .eq("material", filtros.material)
  .eq("tipo_lente", filtros.tipo)
  .eq("ar", true) // se filtro ativo
  .order("preco_medio", { ascending: true })
  .limit(20);
```

#### 2. Buscar Fornecedores

```typescript
const { data } = await lentesClient
  .from("v_fornecedores_por_lente")
  .select("*")
  .eq("grupo_id", lente.grupo_id)
  .eq("disponivel", true)
  .order("preco_tabela", { ascending: true })
  .limit(10);
```

#### 3. Criar Pedido

```typescript
await supabase.from("pedidos").insert({
  loja_id: perfil.loja_id,
  nome_cliente,
  telefone_cliente,
  tipo_lente: lenteEscolhida.tipo_lente,
  observacoes: [formatado],
  valor_total,
  status: "REGISTRADO",
  prioridade: "normal",
});
```

---

## 📊 Comparação: V1 vs V2

| Aspecto      | Wizard V1 (Antigo)    | Wizard V2 (Novo)            |
| ------------ | --------------------- | --------------------------- |
| Steps        | 4 (complexo)          | 3 (simplificado)            |
| Filtros      | Só busca textual      | Material, Tipo, Tratamentos |
| Fornecedores | Simulados estáticos   | Query real + fallback       |
| UX           | Lento (muitos campos) | Rápido (foco no essencial)  |
| Propósito    | Sistema completo      | Transição PDV → DCL         |
| Público      | Futuro (integrado)    | Presente (manual)           |

---

## 🎯 Fluxo de Uso Real

### Cenário: Vendedor lança pedido do PDV

1. **Vendedor fez venda no PDV offline**

   - Cliente: João Silva
   - Lente vendida: Policarbonato Blue Light
   - Laboratório: Hoya

2. **Abre Desenrola DCL → Kanban → Botão "+"**

3. **Step 1: Buscar Lente**

   - Digita "policarbonato" no campo de busca
   - Clica no chip "🔵 Blue Light"
   - Sistema mostra 5 resultados
   - Clica no card "POLICARBONATO 1.59 Visão Simples +AR +Blue"

4. **Step 2: Escolher Laboratório** (avança automaticamente)

   - Sistema mostra 3 fornecedores:
     - ⭐ Hoya - R$ 281 - 5 dias
     - Essilor - R$ 295 - 3 dias
     - Vision Opt - R$ 250 - 7 dias
   - Clica em "Hoya" (usado na venda)

5. **Step 3: Dados** (avança automaticamente)

   - Preenche: "João Silva" + "(11) 98765-4321"
   - Valor já está R$ 281,00
   - Adiciona obs: "Cliente pediu prioridade"
   - Clica "Criar Pedido"

6. **Resultado**:
   - ✅ Toast: "Pedido criado com sucesso!"
   - Pedido aparece no Kanban com status REGISTRADO
   - Observações formatadas automaticamente

**Tempo total**: ~1 minuto

---

## 🚀 Próximos Passos

### Melhorias Futuras (Opcional)

1. **Analytics**

   - Rastrear quais filtros são mais usados
   - Tempo médio por step
   - Taxa de abandono

2. **Favoritos**

   - Salvar lentes mais usadas do vendedor
   - Botão "Últimas 5 escolhas" no topo

3. **Validações**

   - CPF/CNPJ do cliente
   - Validação de telefone
   - Alerta se preço muito diferente do fornecedor

4. **Integrações**
   - Sincronizar com tabela real de laboratórios
   - Importar custos atualizados de fornecedores
   - API para receber pedidos do PDV futuro

---

## ✅ Status Atual

- [x] Wizard V2 criado e funcional
- [x] Integrado ao Kanban
- [x] Build passa sem erros
- [x] Query corrigida (nome_grupo)
- [x] Filtros funcionando
- [x] Fornecedores com fallback
- [x] Criação de pedido OK

**Pronto para uso em produção!** 🎉

---

**Criado**: 16/01/2026
**Versão**: 2.0
**Arquivo**: `src/components/forms/CriarPedidoWizardV2.tsx`
