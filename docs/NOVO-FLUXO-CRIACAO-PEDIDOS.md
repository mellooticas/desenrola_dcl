# 🎯 Novo Fluxo de Criação de Pedidos - Gap Transitório

## 📋 Contexto

Sistema em **transição** até integração com PDV. Necessário lançar vendas atuais com fluxo decisório otimizado.

## 🚀 Novo Wizard de Criação (3 Etapas)

### ✅ Componente Implementado

`src/components/forms/CriarPedidoWizard.tsx`

### 📊 Fluxo Decisório

#### **Etapa 1: Seleção de Lente Canônica**

- ✅ Seleção de loja
- ✅ Busca de lente no catálogo Best Lens
- ✅ Visualização de opções disponíveis
- ✅ Seleção da lente desejada

#### **Etapa 2: Escolha de Laboratório**

- ✅ Lista laboratórios disponíveis para a lente
- ✅ **Mostra custo estimado** por laboratório
- ✅ **Mostra prazo de entrega** por laboratório
- ✅ **Ordena por melhor custo-benefício**
- ✅ Destaque "Melhor Escolha" automaticamente
- ✅ Decisão visual clara: Preço vs Prazo

#### **Etapa 3: Dados do Cliente**

- ✅ Resumo da escolha (Lente + Lab + Preço + Prazo)
- ✅ Nome do cliente (obrigatório)
- ✅ Telefone
- ✅ Nº OS Física
- ✅ Prioridade (Normal/Alta/Urgente)
- ✅ Valor de venda
- ✅ Observações

### 🎯 Status Inicial

**IMPORTANTE**: Pedidos criados já vão direto para status `REGISTRADO`

```typescript
// Na API (src/app/api/pedidos/route.ts - linha 175)
const novoPedido = {
  // ... outros campos
  status: "REGISTRADO" as const, // ✅ Direto para REGISTRADO
  // ... resto
};
```

**Não passa por "rascunho"** - já entra no fluxo ativo do Kanban.

## 🔄 Integração no Kanban

### Antes (Antigo)

```tsx
<NovaOrdemForm onSuccess={loadPedidos} />
```

### Depois (Novo)

```tsx
<Button onClick={() => setShowCriarPedidoWizard(true)}>
  <Plus /> Novo Pedido
</Button>

<CriarPedidoWizard
  open={showCriarPedidoWizard}
  onOpenChange={setShowCriarPedidoWizard}
  onSuccess={() => {
    loadPedidos()
    setShowCriarPedidoWizard(false)
  }}
  lojaPreSelecionada={selectedLoja}
/>
```

## 🎨 UX do Wizard

### Indicador de Progresso

```
━━━━━━  ━━━━━━  ━━━━━━
Etapa 1  Etapa 2  Etapa 3
```

### Cards de Seleção

Cada item (lente/laboratório) tem:

- ✅ **Card clicável** com hover effect
- ✅ **Badge de destaque** para "Melhor Escolha"
- ✅ **Ícones visuais**: 💰 Preço, ⏰ Prazo
- ✅ **Seta de navegação** →

### Alertas Informativos

```tsx
// Etapa 1
<Alert>
  ℹ️ Primeiro, selecione a lente desejada do catálogo
</Alert>

// Etapa 2
<Alert className="bg-blue-50">
  📊 Lente selecionada: Varilux X Series
  Agora escolha o laboratório com melhor custo-benefício
</Alert>

// Etapa 3
<Alert className="bg-green-50">
  ✅ Lente: Varilux X Series
  Lab: Essilor • R$ 250,00 • 5 dias
</Alert>
```

## 📝 Dados Salvos no Pedido

```typescript
{
  // Identificadores da lente
  grupo_canonico_id: string,
  lente_id: string,
  lente_nome_snapshot: string,

  // Laboratório e custos
  laboratorio_id: string,
  custo_lentes: number,  // ← Calculado automaticamente

  // Status
  status: 'REGISTRADO',  // ← Direto para fluxo ativo

  // Cliente
  cliente_nome: string,
  cliente_telefone?: string,

  // Outros
  numero_os_fisica?: string,
  prioridade: 'NORMAL' | 'ALTA' | 'URGENTE',
  valor_pedido?: number,
  observacoes?: string
}
```

## 🔧 TODO: Próximas Melhorias

### Fase 1 (Atual) ✅

- [x] Wizard de 3 etapas
- [x] Seleção de lente do catálogo
- [x] Escolha de laboratório com preços
- [x] Status direto REGISTRADO

### Fase 2 (Próximo Sprint)

- [ ] Integrar com tabela real de preços por laboratório
- [ ] API para buscar custo real da lente por lab
- [ ] Disponibilidade real do laboratório
- [ ] Histórico de preços/performance por lab

### Fase 3 (Integração PDV)

- [ ] Webhook do PDV dispara criação
- [ ] Sincronização bidirecional
- [ ] Automação completa

## 🎯 Benefícios do Novo Fluxo

### Para o Usuário

- ✅ **Decisão visual clara**: Comparação lado a lado
- ✅ **Transparência**: Vê custos e prazos antes de escolher
- ✅ **Rapidez**: 3 cliques (lente → lab → confirmar)
- ✅ **Recomendação automática**: Sistema sugere melhor escolha

### Para o Sistema

- ✅ **Rastreabilidade**: Sabe qual lente canônica foi escolhida
- ✅ **Histórico**: Pode analisar padrões de escolha
- ✅ **Integração futura**: Preparado para PDV
- ✅ **Status correto**: Não cria rascunhos desnecessários

## 🚨 Pontos de Atenção

### Custos e Prazos

⚠️ **Atualmente simulados** (dados fictícios)

```typescript
// TODO: Substituir por consulta real
const custoBase = Math.random() * 200 + 100; // ← TEMPORÁRIO
```

### Quando Implementar Custos Reais

1. Criar tabela `precos_lentes_laboratorios`
2. Popular com dados reais
3. Substituir cálculo simulado por query
4. Adicionar validação de disponibilidade

### Migração de Pedidos Antigos

- Pedidos existentes podem não ter `grupo_canonico_id`
- Sistema funciona mesmo sem (backward compatible)
- Gradualmente todos terão ao criar novos

## 📖 Como Usar

### No Kanban

1. Clicar em **"Novo Pedido"**
2. Wizard abre
3. Seguir 3 etapas
4. Pedido aparece em **REGISTRADO**

### Permissões

- ✅ Gestor: Pode criar
- ✅ DCL: Pode criar
- ✅ Financeiro: Pode criar
- ✅ Loja: Pode criar
- ❌ Demo: **Não pode criar** (botão oculto)

## 🎓 Treinamento Rápido

**"Como lançar uma venda agora"**

1. Abrir Kanban
2. Clicar "Novo Pedido"
3. Buscar lente (ex: "varilux")
4. Escolher laboratório com melhor preço
5. Preencher nome do cliente
6. Confirmar

**Resultado**: Pedido em REGISTRADO, pronto para fluxo normal!

---

**Implementado em**: 16/01/2026
**Autor**: Sistema Desenrola DCL
**Status**: ✅ Pronto para Uso
