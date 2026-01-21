# 🚨 GUIA RÁPIDO: Corrigir Erro de Status ao Salvar Pedido

## 📋 Problema Identificado

```
Erro: new row for relation "pedidos" violates check constraint "pedidos_status_check"
```

**Causa:** O frontend envia `status: 'RASCUNHO'`, mas o banco de dados tem uma constraint CHECK que **não aceita esse valor**.

---

## ✅ Solução em 2 Passos

### **1️⃣ Executar Correção (OBRIGATÓRIO)**

⭐ **ARQUIVO RECOMENDADO:** `database/FIX-STATUS-PEDIDOS-AUTO.sql`

**Escolha entre:**

- ✅ **FIX-STATUS-PEDIDOS-AUTO.sql** - Detecta schema automaticamente (RECOMENDADO)
- ⚠️ **FIX-STATUS-PEDIDOS-CONSTRAINT.sql** - Assume schema public (pode dar erro)

**Como executar:**

1. Abra o **Supabase Dashboard** → **SQL Editor**
2. Cole TODO o conteúdo de **FIX-STATUS-PEDIDOS-AUTO.sql**
3. Clique em **Run**

**O que o script faz:**

- 🔍 Detecta automaticamente o schema da tabela `pedidos`
- ✅ Remove constraints antigas inválidas
- ✅ Converte coluna para TEXT (se for ENUM)
- ✅ Atualiza status antigos para o novo padrão
- ✅ Adiciona constraint CHECK com valores corretos:
  - `RASCUNHO` (novo pedido)
  - `PRODUCAO` (no laboratório)
  - `ENTREGUE` (chegou na loja)
  - `FINALIZADO` (cliente retirou)
  - `CANCELADO` (cancelado)
- ✅ Define default como 'RASCUNHO'
- 📊 Mostra estatísticas finais

### **2️⃣ Testar no Frontend**

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

## 🐛 Diagnóstico Opcional

Se quiser investigar antes de executar o fix, use:

- `database/DESCOBRIR-SCHEMA-PEDIDOS.sql` - Ver em qual schema está a tabela
- `database/DIAGNOSTICO-STATUS-PEDIDOS.sql` - Ver constraints atuais

---

## 📝 Arquivos Relacionados

- ⭐ `database/FIX-STATUS-PEDIDOS-AUTO.sql` → **Script recomendado** (detecta schema)
- `database/FIX-STATUS-PEDIDOS-CONSTRAINT.sql` → Script alternativo (schema fixo)
- `database/DESCOBRIR-SCHEMA-PEDIDOS.sql` → Diagnóstico de schema
- `database/DIAGNOSTICO-STATUS-PEDIDOS.sql` → Diagnóstico de constraints
- `src/components/forms/NovaOrdemWizard.tsx:218` → Onde o status é definido no frontend

---

## 🎯 Checklist

- [x] Problema identificado
- [x] Script AUTO criado (detecta schema)
- [ ] **Script executado no Supabase** ← VOCÊ ESTÁ AQUI
- [ ] Teste no frontend realizado
- [ ] ✅ Funcionando!
