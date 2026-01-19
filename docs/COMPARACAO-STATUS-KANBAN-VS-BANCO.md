# 📊 Comparação: Status Kanban vs Banco

## 🎨 **KANBAN (Código - 8 colunas visíveis)**

```typescript
// src/app/kanban/page.tsx - linhas 398-407
const baseColumns = [
  { id: "PENDENTE", title: "Pendente - DCL" }, // ⏳
  { id: "REGISTRADO", title: "Registrado" }, // 📝
  { id: "AG_PAGAMENTO", title: "Aguard. Pagamento" }, // 💰
  { id: "PAGO", title: "Pago" }, // ✅
  { id: "PRODUCAO", title: "Em Produção no LAB" }, // 🏭
  { id: "PRONTO", title: "Lentes no DCL" }, // ✨
  { id: "ENVIADO", title: "Montagem" }, // 🚚
  { id: "CHEGOU", title: "Na Loja" }, // 📦
];
```

**Total: 8 status visíveis no Kanban**

### Status que existem no código mas NÃO aparecem no Kanban:

```typescript
"ENTREGUE"; // ✅ Gerenciado na seção de pedidos
"FINALIZADO"; // ✅ Gerenciado na seção de pedidos
"CANCELADO"; // ❌ Gerenciado separadamente
```

**Total no TypeScript: 11 status**

---

## 🗄️ **BANCO (Supabase - ENUM real)**

```sql
-- Resultado do diagnóstico (docs/database/queries/00-diagnostico.sql)
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'status_pedido'::regtype;

pendente    -- minúscula
pago        -- minúscula
producao    -- minúscula
pronto      -- minúscula
enviado     -- minúscula
entregue    -- minúscula
MONTAGEM    -- MAIÚSCULA (inconsistente!)
```

**Total: 7 status no banco**

---

## ⚠️ **DESALINHAMENTO DETECTADO**

### ❌ Status que o KANBAN espera mas NÃO EXISTEM no banco:

1. `REGISTRADO` - Código espera MAIÚSCULA, banco não tem
2. `AG_PAGAMENTO` - Código espera MAIÚSCULA, banco não tem
3. `CHEGOU` - Código espera MAIÚSCULA, banco não tem
4. `FINALIZADO` - Código espera MAIÚSCULA, banco não tem
5. `CANCELADO` - Código espera MAIÚSCULA, banco não tem

### ❓ Status que existem no BANCO mas não no código:

1. `MONTAGEM` - Banco tem MAIÚSCULA, código espera `ENVIADO`

### 🔤 Problema de CASE (maiúscula vs minúscula):

| Banco (atual) | Código espera | Status            |
| ------------- | ------------- | ----------------- |
| `pendente`    | `PENDENTE`    | ❌ Case diferente |
| `pago`        | `PAGO`        | ❌ Case diferente |
| `producao`    | `PRODUCAO`    | ❌ Case diferente |
| `pronto`      | `PRONTO`      | ❌ Case diferente |
| `enviado`     | `ENVIADO`     | ❌ Case diferente |
| `entregue`    | `ENTREGUE`    | ❌ Case diferente |

---

## 🤔 **PERGUNTA CRÍTICA**

**Se o app "estava funcionando", como isso era possível?**

### Hipóteses:

**A) Queries com ILIKE (case-insensitive)**

```typescript
.ilike('status', 'PENDENTE') // Funciona com 'pendente' no banco
```

**B) Conversão automática no Supabase**

```sql
-- Supabase pode estar convertendo automaticamente
WHERE status::text = 'PENDENTE' -- Vira 'pendente'
```

**C) Nenhum pedido criado ainda**

- Talvez não existam pedidos reais no banco
- Kanban vazio = nenhum erro aparece

**D) View ou função fazendo conversão**

- Talvez `v_pedidos_kanban` faça UPPER() ou LOWER()

---

## ✅ **O QUE FAZER AGORA?**

### Opção 1: **Verificar se realmente funciona**

```bash
# Testar criar um pedido novo
# Ver se aparece no Kanban
# Tentar mover entre colunas
```

### Opção 2: **Verificar queries reais**

```typescript
// Ver como o Kanban busca os dados
// Linha ~440-450 em kanban/page.tsx
const { data: pedidos } = await supabase
  .from("pedidos")
  .select("*")
  .not("status", "in", '("ENTREGUE","CANCELADO")');
```

### Opção 3: **Executar diagnóstico completo**

```sql
-- database/diagnostico-status-atual.sql
-- Ver se existem pedidos reais
-- Ver quais status estão sendo usados
```

---

## 🎯 **RECOMENDAÇÃO**

**1. Primeiro: Verificar se existem pedidos no banco**

```sql
SELECT status, COUNT(*)
FROM pedidos
GROUP BY status;
```

**2. Testar criar pedido novo**

- Usar formulário `/pedidos/novo`
- Ver qual status é salvo
- Verificar se aparece no Kanban

**3. Decidir estratégia:**

- **Se não tem pedidos:** Ajustar código para minúsculas (mais fácil)
- **Se tem pedidos:** Adicionar status faltantes no banco
- **Se está funcionando:** Entender a mágica e documentar

---

**Precisa que eu execute algum destes diagnósticos? 🔍**
