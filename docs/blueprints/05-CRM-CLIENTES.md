
# 👥 Blueprint: CRM & Gestão de Clientes

Módulo focado no relacionamento com o cliente, histórico de compras e retenção.

## 🎯 Objetivos
- Centralizar dados dos clientes (Nome, Contato, Receitas).
- Histórico completo de óculos feitos.
- Lembretes de retorno (aniversário de 1 ano do óculos).
- Marketing direcionado.

## 🔄 Funcionalidades

### 1. Perfil do Cliente
- **Dados:** Nome, Telefone (WhatsApp), Data Nascimento, CPF.
- **Histórico:** Lista de pedidos vinculados.

### 2. Gestão de Receitas
- **Armazenamento:** Foto da receita ou dados estruturados (Esférico, Cilíndrico, Eixo).
- **Vínculo:** Receita ligada ao Cliente e usada no Pedido.

### 3. Ações de Retenção (CRM)
- **Régua de Contato:** 
    - 7 dias: "Como está a adaptação?"
    - 6 meses: "Manutenção/Ajuste gratuito"
    - 1 ano: "Promoção nova receita"

## 🧩 Componentes Chave (Previstos)
- `ClienteProfile.tsx`: Página detalhada.
- `ReceitaForm.tsx`: Digitalização de dados da receita.
- `ClientSearch.tsx`: Busca global inteligente.

## 📦 Banco de Dados
- Tabela `public.clientes` (A ser criada/migrada de dados textuais em pedidos).
- Tabela `public.receitas`.

## 🚧 Status Atual
- 🚧 Clientes são tratados apenas como campos de texto (`cliente_nome`, `cliente_telefone`) na tabela `pedidos`.
- ❌ Não existe entidade `Cliente` separada nem tabela de receitas estruturada.
- 📅 Planejado para Fase 2 (Pós-lançamento Pedidos).
