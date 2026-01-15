# 🔍 Debug: Pedido Sem Montador Aparecendo

## 🎯 O Que Foi Feito

**Problema:** Card do montador não aparecia mesmo quando pedido tinha `montador_id`

**Solução:**

1. ✅ Card agora aparece se houver `montador_id` OU `montador_nome`
2. ✅ Se só tiver `montador_id` (sem nome), mostra aviso amarelo
3. ✅ Console.log já estava ativo para debug

---

## 🧪 Testar Agora

### 1. Abrir o pedido novamente

```
http://localhost:3000/pedidos/542c0e60-4812-4daa-b2c2-fb2232ccbf03
```

### 2. Abrir Console (F12)

Procurar por: `🔧 Dados do montador:`

**Verificar:**

- `montador_id`: tem valor?
- `montador_nome`: null ou tem nome?
- `montador_local`: null ou tem local?

### 3. Cenários Possíveis

#### Cenário A: Aparece card AMARELO (aviso)

**Significa:** Pedido tem `montador_id` mas falta `montador_nome`

**Solução:** Executar script para popular dados

```sql
-- No Supabase, executar:
-- Arquivo: database/debug-pedido-especifico.sql
```

#### Cenário B: Card VERDE (completo) aparece

**Significa:** Tudo OK! Dados completos.

#### Cenário C: Nenhum card aparece

**Significa:** Pedido não tem montador vinculado

**Verificar no console:**

- montador_id deve ser `null`

---

## 🛠️ Como Popular os Dados

### Opção 1: Popular APENAS este pedido

```sql
-- Executar no Supabase:
UPDATE pedidos p
SET
  montador_nome = m.nome,
  montador_local = CASE
    WHEN m.tipo = 'INTERNO' THEN 'DCL - Montagem Interna'
    WHEN m.tipo = 'LABORATORIO' THEN lab.nome
    ELSE 'Não especificado'
  END,
  data_montagem = COALESCE(p.data_montagem, p.updated_at, p.created_at)
FROM montadores m
LEFT JOIN laboratorios lab ON m.laboratorio_id = lab.id
WHERE p.id = '542c0e60-4812-4daa-b2c2-fb2232ccbf03'
  AND p.montador_id = m.id;
```

### Opção 2: Popular TODOS os pedidos que faltam

```sql
-- Popular todos de uma vez
UPDATE pedidos p
SET
  montador_nome = m.nome,
  montador_local = CASE
    WHEN m.tipo = 'INTERNO' THEN 'DCL - Montagem Interna'
    WHEN m.tipo = 'LABORATORIO' THEN lab.nome
    ELSE 'Não especificado'
  END,
  data_montagem = COALESCE(p.data_montagem, p.updated_at, p.created_at)
FROM montadores m
LEFT JOIN laboratorios lab ON m.laboratorio_id = lab.id
WHERE p.montador_id = m.id
  AND p.montador_nome IS NULL;
```

---

## 📊 Verificar no Banco

```sql
-- Ver dados do pedido específico
SELECT
  numero_sequencial,
  cliente_nome,
  status,
  montador_id,
  montador_nome,
  montador_local,
  montador_contato
FROM pedidos
WHERE id = '542c0e60-4812-4daa-b2c2-fb2232ccbf03';
```

**Resultado esperado (após popular):**

```
| numero_sequencial | cliente_nome | montador_id | montador_nome | montador_local |
|-------------------|--------------|-------------|---------------|----------------|
| XXX               | Nome Cliente | uuid...     | Thiago        | DCL - Montagem |
```

---

## 🎨 Como Vai Aparecer

### Card Completo (dados OK):

```
┌─────────────────────────────────┐
│ 👥 Montador Responsável         │
├─────────────────────────────────┤
│ Thiago                          │
│ DCL - Montagem Interna          │
│ 💰 R$ 25.00                     │
│ Atribuído em 15/01/2026 14:30   │
└─────────────────────────────────┘
```

### Card de Aviso (falta popular):

```
┌─────────────────────────────────┐
│ 👥 Montador Responsável         │
├─────────────────────────────────┤
│ ⚠️ Montador vinculado mas       │
│ dados incompletos               │
│ ID: uuid-aqui                   │
│ Execute script de atualização   │
└─────────────────────────────────┘
```

---

## ✅ Próximos Passos

1. **Testar página:** Ver qual card aparece (ou se não aparece)
2. **Ver console:** Verificar valores dos dados
3. **Popular dados:** Se aparecer aviso amarelo, executar UPDATE
4. **Refresh página:** Ctrl + Shift + R para recarregar
5. **Validar:** Card verde deve aparecer com todos os dados

---

## 🐛 Ainda Não Funciona?

**Me mostre:**

1. Print do console com `🔧 Dados do montador:`
2. Resultado da query SQL do pedido específico
3. Se o card aparece (verde, amarelo, ou não aparece)

Com essas informações consigo te ajudar melhor!
