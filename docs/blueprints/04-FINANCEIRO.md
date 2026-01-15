
# 💰 Blueprint: Financeiro & Pagamentos

Módulo destinado ao controle de fluxo de caixa, validação de pagamentos e relatórios financeiros.

## 🎯 Objetivos
- Registrar pagamentos e sinais (entradas).
- Validar transações PIX e Cartão.
- Controlar custos de laboratório (saídas previstas).
- Calcular lucro líquido por pedido e por loja.
- Relatórios de fechamento de caixa.

## 🔄 Fluxos Planejados

### 1. Pagamento de Pedido
- **Ação:** No Check-in ou Retirada.
- **Entrada:** Valor, Método (Dinheiro, PIX, Crédito).
- **Status:** Altera status do pedido de `AG_PAGAMENTO` para `PRODUCAO` ou `ENTREGUE`.

### 2. Controle de Custo (Laboratório)
- **Cálculo:** Baseado no `custo_lentes` capturado do Catálogo + `custo_montagem`.
- **Visibilidade:** Apenas Gerentes/Admin veem margem de lucro.

### 3. Relatórios
- Vendas Diárias / Mensais.
- Ticket Médio.
- Margem de Contribuição.

## 🧩 Componentes Chave (Previstos)
- `PaymentModal.tsx`: Interface para registro de pagamentos.
- `FinancialDashboard.tsx`: Gráficos de receita.
- `CaixaDiario.tsx`: Tabela de movimentações.

## 📦 Banco de Dados (Necessários)
- `public.pagamentos` (Tabela nova: pedido_id, valor, metodo, data).
- `public.caixa_movimentacoes` (Log de caixa).

## 🚧 Status Atual
- 🚧 Conceito definido.
- 🚧 Campos `valor_pedido` e `custo_lentes` já existem na tabela `pedidos`.
- ❌ Módulo de gestão de pagamentos ainda não implementado no frontend.
