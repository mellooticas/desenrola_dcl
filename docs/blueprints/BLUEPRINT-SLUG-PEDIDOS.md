# 🚀 Blueprint: Novo Fluxo de Pedidos (Slug Inteligente)

## 🎯 Objetivo
Substituir a seleção manual e propensa a erros de "Classe de Lente" e "Laboratório" por uma **Seleção Inteligente de Lentes** baseada no catálogo real (Best Lens).

## 🔄 Fluxo "Slug" de Inclusão

### 1️⃣ Passo 1: Quem e Onde?
- **Loja:** Seleciona a loja (Define margem de segurança e origem).
- **Cliente:** Nome e Telefone (Identificação).
- **OS Física:** Número da OS de papel (opcional).

### 2️⃣ Passo 2: A Lente (O "Cérebro")
> 💡 **Mudança Radical:** Em vez de escolher "Laboratório" e depois "Classe", o usuário escolhe a **LENTE**.

- **Busca:** Componente `LenteSelector` (já validado em `/test-lentes`).
- **Input:** Usuário digita "Varilux", "Kodak", "Visão Simples".
- **Automação:** Ao selecionar a lente, o sistema define AUTOMATICAMENTE:
  - ✅ `laboratorio_id`: Baseado no fornecedor da lente.
  - ✅ `custo_lentes`: Baseado no preço de custo cadastrado.
  - ✅ `valor_pedido`: Sugestão baseada no preço de venda (pode editar).
  - ✅ `classe_lente_id`: Mapeado automaticamente para a classe correspondente (ex: Multifocal Premium).
  - ✅ `grupo_canonico_id` e `lente_id`: Salvos para rastreabilidade total.

### 3️⃣ Passo 3: Refinamento
- **Tratamentos:** Adicionais (Antirreflexo, BlueControl) vindos da estrutura da lente ou extras.
- **SLA:** Calculado com precisão (Prazo do Lab específico da lente + Margem).

## 🛠️ O Que Falta (GAPs Técnicos)

1.  **Banco de Dados:**
    - Adicionar `grupo_canonico_id` e `lente_id` na tabela `pedidos`.
    - Script pronto: `docs/sql-queries/06-add-lentes-catalogo.sql`.

2.  **Frontend (`NovaOrdemForm`):**
    - Substituir os Selects antigos pelo componente `LenteSelector`.
    - Lógica de preenchimento automático (State Update).

3.  **Backend (API Routes):**
    - Atualizar validação do `POST /api/pedidos` para aceitar os novos IDs.

## ✅ Conclusão
Este fluxo elimina erros de direcionamento (mandar lente para lab errado) e garante precificação correta desde a entrada.
