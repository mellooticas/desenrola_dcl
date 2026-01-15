
# 📋 Blueprint: Gestão de Pedidos & Kanban

O coração operacional do Desenrola DCL. Responsável pela entrada de ordens de serviço e acompanhamento visual.

## 🎯 Objetivos
- Permitir entrada rápida de pedidos (Fluxo Slug).
- Visualização clara do status de produção (Kanban).
- Cálculo preciso de SLA (Prazos de Laboratório vs. Cliente).
- Prevenção de erros no direcionamento de ordens.

## 🔄 Fluxos Principais

### 1. Novo Pedido (Inclusão)
- **Rota:** `/pedidos/novo`
- **Componente:** `NovaOrdemForm.tsx` (Multi-step).
- **Lógica:**
    - Seleção de Loja.
    - **Seleção Inteligente de Lente** (Integração Best Lens).
    - Preenchimento automático de Lab, Preço e SLA.
    - Dados do Cliente e OS Física.
- **Persistência:** API `POST /api/pedidos` -> Procedure `criar_pedido_simples` -> Update Dados Lente.

### 2. Kanban (Acompanhamento)
- **Rota:** `/kanban` (ou `/pedidos`)
- **Componente:** `KanbanBoard.tsx` / `KanbanColumn.tsx`.
- **Card:** `KanbanCard.tsx` (Visual rico com SLA, Cores de Urgência e Lente).
- **Interação:** Drag & Drop para mudar status.
    - Regras de transição: Validar pagamentos, montador, conferência.

### 3. Detalhes e Edição
- **Rota:** `/pedido/[id]` (Modal ou Página).
- **Visão:** Histórico completo, timeline de eventos, dados financeiros.

## 🧩 Componentes Chave
- `NovaOrdemForm.tsx`: O formulário complexo "Slug".
- `LenteSelector.tsx`: O cérebro da seleção.
- `TermometroUrgencia.tsx`: Visualização de SLA.
- `KanbanStats.tsx`: Métricas rápidas no topo do Kanban.

## 📦 Banco de Dados
- `public.pedidos`: Tabela central.
    - Colunas Chave: `status`, `loja_id`, `laboratorio_id`, `grupo_canonico_id`, `lente_nome_snapshot`.
- `public.v_pedidos_kanban` (View): Dados desnormalizados para performance do Kanban.
- `public.eventos_pedido`: Log de alterações de status.

## ✅ Status Atual
- ✅ Novo Form implementado e integrado com Catálogo.
- ✅ Kanban funcional com Drag & Drop.
- ✅ Cards mostram SLA e Lente.
- 🚧 Validação de Montador obrigatório (Pendente).
