# 🔄 Novo Fluxo do Kanban - Coluna PENDENTE

## 📋 Resumo da Mudança

**Data**: 20/12/2025  
**Motivo**: Laboratório não é mais escolhido na primeira tela. Ele vem automaticamente com a escolha da lente.

## 🎯 Fluxo Antigo vs Novo

### ❌ Fluxo Antigo

```
RASCUNHO → REGISTRADO → AGUARDANDO_PAGAMENTO → PRODUÇÃO → ...
   ↑
[Usuário escolhe laboratório manualmente na tela]
```

### ✅ Fluxo Novo

```
PENDENTE → REGISTRADO → AGUARDANDO_PAGAMENTO → PRODUÇÃO → ...
   ↓           ↓               ↓
   DCL       Edita      Só avança
 escolhe    número      com número
  lente      pedido     preenchido
```

## 📊 Detalhes de Cada Status

### 1. 🆕 PENDENTE (Nova Coluna!)

**Cor**: `#94a3b8` (slate)  
**Ícone**: ⏳

**O que acontece aqui**:

- Pedido entra no sistema (vindo do PDV ou criado manualmente)
- **DCL analisa a receita** e escolhe a melhor lente
- **Fornecedor vem automaticamente** com a lente escolhida
- DCL registra o pedido no laboratório via:
  - 📞 Telefone
  - 💬 WhatsApp
  - 🖥️ Sistema interno do lab

**Campos obrigatórios para avançar**:

- ✅ `lente_selecionada_id` (qual lente foi escolhida)
- ✅ `fornecedor_lente_id` (qual fornecedor/lab)
- ✅ `nome_lente` (snapshot do nome)
- ✅ `preco_lente` e `custo_lente` (valores financeiros)

**Neste status**:

- Ainda NÃO tem `numero_pedido_laboratorio`
- Campo `pode_editar_numero_lab = true`

---

### 2. 📝 REGISTRADO

**Cor**: `#3b82f6` (blue)  
**Ícone**: 📝

**O que acontece aqui**:

- Pedido já foi registrado no laboratório
- **Aguardando retorno do lab com o número do pedido**
- DCL pode **editar o campo `numero_pedido_laboratorio`**

**Campos obrigatórios para avançar**:

- ✅ `numero_pedido_laboratorio` (OBRIGATÓRIO preenchido!)

**Validação do Sistema**:

```typescript
// ❌ Não pode avançar sem número do pedido
if (status === "registrado" && !numero_pedido_laboratorio) {
  throw new Error("Preencha o número do pedido do laboratório primeiro!");
}

// ✅ Só libera botão de avançar quando tiver número preenchido
const podeAvancar =
  numero_pedido_laboratorio && numero_pedido_laboratorio !== "";
```

**Neste status**:

- Campo `aguardando_numero_lab = true` (se número estiver vazio)
- Campo `pode_avancar_pagamento = true` (se número estiver preenchido)
- Campo `pode_editar_numero_lab = true`

---

### 3. 💰 AGUARDANDO_PAGAMENTO

**Cor**: `#eab308` (yellow)  
**Ícone**: 💰

**O que acontece aqui**:

- Já tem número do pedido do lab ✅
- Aguardando confirmação de pagamento
- **Restante do fluxo já funciona** (sem mudanças)

**Neste status**:

- Campo `pode_editar_numero_lab = false` (não pode mais editar)

---

## 🗄️ Mudanças no Banco de Dados

### 1. Novo ENUM Status

```sql
ALTER TYPE status_pedido ADD VALUE 'pendente' BEFORE 'rascunho';
```

**Ordem completa**:

1. `pendente` 🆕
2. `rascunho` (deprecado, manter por compatibilidade)
3. `registrado`
4. `aguardando_pagamento`
5. `producao`
6. `enviado`
7. `entregue`
8. `finalizado`
9. `cancelado`

### 2. Nova Constraint

```sql
ALTER TABLE public.pedidos
ADD CONSTRAINT chk_aguardando_pagamento_tem_numero
CHECK (
  status != 'aguardando_pagamento'
  OR
  (status = 'aguardando_pagamento' AND numero_pedido_laboratorio IS NOT NULL)
);
```

**O que faz**: Impede que pedido vá para `aguardando_pagamento` sem número do lab.

### 3. Novo Trigger de Validação

```sql
CREATE TRIGGER trigger_validar_transicao_status
  BEFORE UPDATE OF status
  ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION validar_transicao_status_pedido();
```

**Validações**:

- `pendente → registrado`: Exige `lente_selecionada_id` e `fornecedor_lente_id`
- `registrado → aguardando_pagamento`: Exige `numero_pedido_laboratorio`

### 4. Nova View: `v_kanban_colunas`

```sql
CREATE VIEW public.v_kanban_colunas AS
SELECT
  'pendente' as coluna_id,
  'Pendente' as coluna_nome,
  '⏳' as icone,
  1 as ordem,
  '#94a3b8' as cor
UNION ALL ...
```

**O que faz**: Define as colunas do Kanban com ordem, cores e ícones.

### 5. Campos Novos na View `v_pedidos_kanban`

```sql
SELECT
  p.*,
  pode_editar_numero_pedido(p.status) as pode_editar_numero_lab,
  (p.status = 'pendente' AND p.lente_selecionada_id IS NULL) as aguardando_escolha_lente,
  (p.status = 'registrado' AND p.numero_pedido_laboratorio IS NULL) as aguardando_numero_lab,
  (p.status = 'registrado' AND p.numero_pedido_laboratorio IS NOT NULL) as pode_avancar_pagamento
FROM public.pedidos p
```

**Novos campos**:

- `pode_editar_numero_lab`: Boolean - permite edição do campo número
- `aguardando_escolha_lente`: Boolean - pedido em pendente sem lente
- `aguardando_numero_lab`: Boolean - pedido em registrado sem número
- `pode_avancar_pagamento`: Boolean - pedido pode ir para aguardando_pagamento

---

## 🖥️ Mudanças no Frontend

### 1. Componente: `NovaOrdemForm.tsx`

**❌ REMOVER**:

```tsx
// Campo de seleção de laboratório na primeira tela
<Select name="laboratorio_id">
  <SelectItem value="lab1">Laboratório 1</SelectItem>
  ...
</Select>
```

**✅ ADICIONAR**:

```tsx
// Campo de laboratório virá automaticamente com a lente
<div className="text-sm text-muted-foreground">
  Laboratório: <strong>{fornecedorSelecionado?.nome}</strong>
  <span className="text-xs">(escolhido automaticamente com a lente)</span>
</div>
```

### 2. Componente: `KanbanBoard.tsx`

**✅ ADICIONAR COLUNA PENDENTE**:

```tsx
const colunas = [
  { id: "pendente", nome: "Pendente", cor: "#94a3b8", icone: "⏳" },
  { id: "registrado", nome: "Registrado", cor: "#3b82f6", icone: "📝" },
  {
    id: "aguardando_pagamento",
    nome: "Aguardando Pagamento",
    cor: "#eab308",
    icone: "💰",
  },
  // ... resto das colunas
];
```

### 3. Componente: `PedidoCard.tsx` (no Kanban)

**✅ ADICIONAR BADGES DE STATUS**:

```tsx
{
  pedido.status === "pendente" && !pedido.lente_selecionada_id && (
    <Badge variant="warning">⏳ Aguardando escolha de lente</Badge>
  );
}

{
  pedido.status === "registrado" && pedido.aguardando_numero_lab && (
    <Badge variant="info">📝 Aguardando número do lab</Badge>
  );
}

{
  pedido.status === "registrado" && pedido.pode_avancar_pagamento && (
    <Badge variant="success">✅ Pronto para avançar</Badge>
  );
}
```

**✅ ADICIONAR CAMPO EDITÁVEL DE NÚMERO DO PEDIDO**:

```tsx
{
  pedido.pode_editar_numero_lab && (
    <Input
      name="numero_pedido_laboratorio"
      placeholder="Ex: LAB-12345"
      defaultValue={pedido.numero_pedido_laboratorio || ""}
      onChange={handleUpdateNumeroLab}
    />
  );
}

{
  !pedido.pode_editar_numero_lab && pedido.numero_pedido_laboratorio && (
    <div className="text-sm">
      Nº Lab: <strong>{pedido.numero_pedido_laboratorio}</strong>
    </div>
  );
}
```

### 4. Componente: `SeletorLentesReceita.tsx` (FASE 2)

**Funcionamento**:

1. Usuário preenche receita do cliente
2. Componente busca lentes compatíveis
3. Sistema sugere 3 opções (econômica/intermediária/premium)
4. Usuário escolhe uma opção
5. **Fornecedor vem automaticamente** com a lente escolhida
6. Pedido entra em status `pendente`

---

## 🧪 Testes Necessários

### Teste 1: Criar Pedido em PENDENTE

```typescript
const pedido = await criarPedido({
  status: "pendente",
  lente_selecionada_id: null,
  fornecedor_lente_id: null,
});

// ✅ Deve criar com sucesso
// ✅ Deve aparecer na coluna PENDENTE do Kanban
// ✅ Badge "Aguardando escolha de lente" deve aparecer
```

### Teste 2: Avançar de PENDENTE → REGISTRADO

```typescript
// ❌ Sem lente escolhida - deve falhar
await atualizarPedido({
  status: "registrado",
});
// Esperado: Error "Não é possível registrar pedido sem lente escolhida"

// ✅ Com lente escolhida - deve passar
await atualizarPedido({
  lente_selecionada_id: "uuid-da-lente",
  fornecedor_lente_id: "uuid-do-fornecedor",
  status: "registrado",
});
// Esperado: Sucesso
```

### Teste 3: Editar Número do Pedido

```typescript
// ✅ Em REGISTRADO - deve permitir
await atualizarPedido({
  status: "registrado",
  numero_pedido_laboratorio: "LAB-12345",
});

// ❌ Em AGUARDANDO_PAGAMENTO - deve bloquear
await atualizarPedido({
  status: "aguardando_pagamento",
  numero_pedido_laboratorio: "LAB-99999",
});
// Esperado: Campo readonly no frontend
```

### Teste 4: Avançar de REGISTRADO → AGUARDANDO_PAGAMENTO

```typescript
// ❌ Sem número do lab - deve falhar
await atualizarPedido({
  status: "aguardando_pagamento",
});
// Esperado: Error "Não é possível avançar sem número do pedido do laboratório"

// ✅ Com número do lab - deve passar
await atualizarPedido({
  numero_pedido_laboratorio: "LAB-12345",
  status: "aguardando_pagamento",
});
// Esperado: Sucesso
```

---

## 📁 Arquivos Afetados

### Banco de Dados

- ✅ `database/migrations/add-status-pendente-kanban.sql` - Migração completa

### TypeScript Types

- ✅ `src/lib/types/database.ts` - StatusPedido atualizado

### Componentes Frontend (a fazer)

- ⏳ `src/components/pedidos/NovaOrdemForm.tsx` - Remover campo laboratório
- ⏳ `src/components/kanban/KanbanBoard.tsx` - Adicionar coluna PENDENTE
- ⏳ `src/components/kanban/PedidoCard.tsx` - Adicionar badges e campo editável
- ⏳ `src/components/lentes/SeletorLentesReceita.tsx` - Componente novo (FASE 2)

### APIs (a fazer)

- ⏳ `src/app/api/pedidos/route.ts` - Validar transições de status
- ⏳ `src/app/api/pedidos/[id]/route.ts` - PATCH para número do lab

---

## 🚀 Plano de Execução

### FASE 1: Banco de Dados (HOJE) ✅

1. ✅ Executar migração `add-status-pendente-kanban.sql`
2. ✅ Testar constraints e triggers
3. ✅ Verificar views

### FASE 2: Frontend - Ajustes Básicos (AMANHÃ)

1. ⏳ Atualizar `KanbanBoard.tsx` com coluna PENDENTE
2. ⏳ Adicionar badges em `PedidoCard.tsx`
3. ⏳ Adicionar campo editável de número do lab
4. ⏳ Remover campo laboratório de `NovaOrdemForm.tsx`

### FASE 3: Componente Seletor de Lentes (PRÓXIMA SEMANA)

1. ⏳ Criar `SeletorLentesReceita.tsx`
2. ⏳ Integrar no formulário
3. ⏳ Testar fluxo completo: receita → lente → fornecedor → pendente

---

## 💡 Dicas de UX

### Coluna PENDENTE

- **Badge "⏳ Aguardando DCL"**: Indica que está esperando análise
- **Contador de tempo**: "Aguardando há 2h" para criar senso de urgência
- **Botão "Escolher Lente"**: Atalho direto para o seletor

### Coluna REGISTRADO

- **Campo número do lab em destaque**: Input editável grande e claro
- **Placeholder útil**: "Ex: LAB-12345 ou sistema interno do lab"
- **Validação em tempo real**: Não permite avançar sem número
- **Badge dinâmico**:
  - 📝 "Aguardando número" (vermelho) - campo vazio
  - ✅ "Pronto para avançar" (verde) - campo preenchido

---

## 🔗 Links Relacionados

- [ESTRATEGIA-INTEGRACAO-LENTES-GRADUAL.md](./ESTRATEGIA-INTEGRACAO-LENTES-GRADUAL.md) - Estratégia geral de integração
- [ANALISE-DADOS-LENTES.md](./ANALISE-DADOS-LENTES.md) - Análise do catálogo de lentes
- `database/migrations/add-lentes-catalog-fields.sql` - Campos de lentes nos pedidos
- `src/lib/types/lentes.ts` - TypeScript types para lentes

---

## ❓ FAQ

### 1. O que acontece com pedidos antigos em 'rascunho'?

Eles continuam funcionando normalmente. O status 'rascunho' foi mantido por compatibilidade.

### 2. Posso editar o número do lab depois de ir para aguardando_pagamento?

Não. O campo fica readonly após avançar de 'registrado'.

### 3. E se o cliente quiser escolher o laboratório manualmente?

Não é mais possível. O laboratório vem automaticamente com a lente escolhida. Se quiser outro lab, precisa escolher outra lente do fornecedor desejado.

### 4. Como funciona a escolha automática de fornecedor?

O sistema usa um algoritmo de score:

- 60% baseado em preço
- 40% baseado em prazo de entrega

Veja `escolherMelhorFornecedor()` em [ESTRATEGIA-INTEGRACAO-LENTES-GRADUAL.md](./ESTRATEGIA-INTEGRACAO-LENTES-GRADUAL.md#fase-3-automação-escolha-de-fornecedor).

---

**Última atualização**: 20/12/2025  
**Autor**: DCL Team  
**Status**: ✅ Migração de banco criada, aguardando execução
