# 🚨 GUIA RÁPIDO: Corrigir Erro de Status ao Salvar Pedido

## 📋 Problema Identificado

```
Erro: new row for relation "pedidos" violates check constraint "pedidos_status_check"
```

**Causa:** O frontend envia `status: 'RASCUNHO'`, mas o banco de dados tem uma constraint CHECK que **não aceita esse valor**.

---

## ✅ Solução em 3 Passos

### **1️⃣ Executar Diagnóstico (Opcional)**

Arquivo: `database/DIAGNOSTICO-STATUS-PEDIDOS.sql`

Este script mostra:

- Quais valores de status são aceitos atualmente
- O tipo de dados da coluna status
- As constraints configuradas

### **2️⃣ Executar Correção (OBRIGATÓRIO)**

Arquivo: `database/FIX-STATUS-PEDIDOS-CONSTRAINT.sql`

**Como executar:**

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Cole TODO o conteúdo de `FIX-STATUS-PEDIDOS-CONSTRAINT.sql`
4. Clique em **Run**

**O que o script faz:**

- ✅ Remove constraints antigas inválidas
- ✅ Converte coluna para TEXT (se for ENUM)
- ✅ Adiciona constraint CHECK com valores corretos:
  - `RASCUNHO` (novo pedido)
  - `PRODUCAO` (no laboratório)
  - `ENTREGUE` (chegou na loja)
  - `FINALIZADO` (cliente retirou)
  - `CANCELADO` (cancelado)
- ✅ Atualiza status antigos para o novo padrão
- ✅ Define default como 'RASCUNHO'

### **3️⃣ Testar no Frontend**

1. Recarregue a página do wizard
2. Crie um novo pedido
3. Preencha os dados
4. Clique em "Salvar"

✅ **Deve funcionar sem erro!**

---

## 🔍 Valores de Status Aceitos

| Status       | Descrição                               | Kanban                     |
| ------------ | --------------------------------------- | -------------------------- |
| `RASCUNHO`   | Pedido em criação, aguardando lente/lab | 🟡 Rascunho                |
| `PRODUCAO`   | Enviado para laboratório, em fabricação | 🔵 Produção                |
| `ENTREGUE`   | Chegou na loja, aguarda retirada        | 🟢 Entregue                |
| `FINALIZADO` | Cliente retirou, processo completo      | ✅ (não aparece no Kanban) |
| `CANCELADO`  | Cancelado em qualquer etapa             | ❌ (não aparece no Kanban) |

---

## 🐛 Se o Erro Persistir

Execute novamente o diagnóstico e verifique:

```sql
-- Ver valores aceitos
SELECT enumlabel FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_pedido');

-- Ver constraint atual
SELECT pg_get_constraintdef(oid) FROM pg_constraint
WHERE conname = 'pedidos_status_check';
```

---

## 📝 Arquivos Relacionados

- `database/FIX-STATUS-PEDIDOS-CONSTRAINT.sql` → Script de correção
- `database/DIAGNOSTICO-STATUS-PEDIDOS.sql` → Script de diagnóstico
- `database/migrations/2026-01-17-simplificar-status-kanban.sql` → Migração original (pode não ter sido executada)
- `src/components/forms/NovaOrdemWizard.tsx:218` → Onde o status é definido no frontend

---

## 🎯 Status do Fix

- [x] Diagnóstico criado
- [x] Script de correção criado
- [ ] **Script executado no Supabase** ← VOCÊ ESTÁ AQUI
- [ ] Teste no frontend realizado
