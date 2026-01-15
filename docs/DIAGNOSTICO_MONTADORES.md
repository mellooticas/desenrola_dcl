# 🔍 DIAGNÓSTICO: Sistema de Montadores - Status Atual

**Data:** 15 de janeiro de 2026  
**Status:** Investigação em andamento

---

## 📊 Descobertas

### 1️⃣ Arquitetura Desnormalizada (como está implementado)

O sistema usa **desnormalização** - os dados do montador são copiados para a tabela `pedidos`:

```typescript
// No Kanban (src/app/kanban/page.tsx linha 1112):
const updateData = {
  montador_id: montador.id, // FK para tabela montadores
  montador_nome: montador.nome, // Campo desnormalizado
  montador_local: montador.local, // Campo desnormalizado
  montador_contato: montador.contato, // Campo desnormalizado
  custo_montagem: montador.preco_base,
  data_montagem: new Date().toISOString(),
};
```

**Vantagens:**

- ✅ Histórico preservado (se montador mudar, pedidos antigos mantêm dados originais)
- ✅ Performance (menos JOINs)
- ✅ Simplicidade nas queries

**Tabela PEDIDOS deve ter:**

```sql
-- Campos relacionados a montador na tabela pedidos:
montador_id       UUID          -- FK para montadores(id)
montador_nome     TEXT          -- Nome copiado
montador_local    TEXT          -- Local copiado
montador_contato  TEXT          -- Contato copiado
custo_montagem    NUMERIC       -- Custo da montagem
data_montagem     TIMESTAMPTZ   -- Quando foi atribuído
```

**Tabela MONTADORES (estrutura simples):**

```sql
CREATE TABLE montadores (
  id               UUID PRIMARY KEY,
  nome             TEXT NOT NULL,
  tipo             TEXT NOT NULL,  -- 'INTERNO' | 'LABORATORIO'
  laboratorio_id   UUID,           -- FK opcional
  ativo            BOOLEAN,
  created_at       TIMESTAMPTZ
)
```

---

### 2️⃣ Problema Identificado

**Erro ao executar SQL:**

```
ERROR: column m.local_trabalho does not exist
```

**Causa:**

- O SQL criado tentava fazer JOIN com `montadores.local_trabalho`
- Mas essa coluna não existe na tabela `montadores`
- Os dados estão desnormalizados em `pedidos.montador_local`

---

## ✅ Solução Correta

### A View `v_pedidos_kanban` deve apenas expor os campos da tabela `pedidos`:

```sql
CREATE VIEW v_pedidos_kanban AS
SELECT
  p.*,  -- Isso já inclui montador_nome, montador_local, montador_contato
  l.nome as loja_nome,
  l.codigo as loja_codigo,
  l.margem_seguranca_dias,
  l.alerta_sla_dias,
  lab.nome as laboratorio_nome,
  lab.codigo as laboratorio_codigo,
  lab.sla_padrao_dias,
  cl.nome as classe_nome,
  cl.categoria as classe_categoria,
  cl.cor_badge as classe_cor,
  cl.sla_base_dias as classe_sla_dias,
  -- NÃO PRECISA DE JOIN COM MONTADORES!
  -- Os campos já vêm de p.* (pedidos)
  ...
FROM pedidos p
LEFT JOIN lojas l ON p.loja_id = l.id
LEFT JOIN laboratorios lab ON p.laboratorio_id = lab.id
LEFT JOIN classes_lente cl ON p.classe_lente_id = cl.id;
-- ❌ NÃO: LEFT JOIN montadores m ON p.montador_id = m.id
```

---

## 🎯 Ações Necessárias

### ✅ Passo 1: Confirmar estrutura da tabela pedidos

Execute: `database/diagnostico-estrutura-montadores.sql`

**Verifique se existem essas colunas:**

- [ ] `pedidos.montador_id`
- [ ] `pedidos.montador_nome`
- [ ] `pedidos.montador_local`
- [ ] `pedidos.montador_contato`
- [ ] `pedidos.custo_montagem`
- [ ] `pedidos.data_montagem`

### ⚠️ Passo 2: Se alguma coluna estiver faltando, adicionar

Se o diagnóstico mostrar que faltam campos na tabela `pedidos`, precisamos criar um script de migração.

### ✅ Passo 3: Atualizar view (SE colunas existirem)

Se todas as colunas existem, a view atual já deve funcionar porque `p.*` já inclui esses campos.

---

## 📋 Próximos Passos

1. **EXECUTAR:** `database/diagnostico-estrutura-montadores.sql` no Supabase
2. **ANALISAR:** Resultado e verificar quais campos existem
3. **DECIDIR:**
   - Se campos existem → View já deve funcionar
   - Se campos faltam → Criar migração para adicionar
4. **TESTAR:** Edição de pedidos e visualização de montador

---

## ❓ Perguntas para Investigar

1. A tabela `pedidos` tem as colunas `montador_nome`, `montador_local`, `montador_contato`?
2. O Kanban está conseguindo salvar esses dados?
3. A view `v_pedidos_kanban` já retorna esses campos?
4. O problema é só a policy de UPDATE ou há problema estrutural?

**Aguardando execução do diagnóstico para prosseguir...**
