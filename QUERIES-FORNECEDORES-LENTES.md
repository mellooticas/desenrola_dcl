# 🔍 Queries para Investigar Fornecedores/Laboratórios no Banco Lentes

**Objetivo**: Descobrir como buscar fornecedores/laboratórios reais para cada grupo de lente

**Database**: `best_lens` (ahcikwsoxhmqqteertkx.supabase.co)

---

## 📋 Query #1: Listar todas as views disponíveis

```sql
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'VIEW'
ORDER BY table_name;
```

**O que descobrir**:

- Se existe `v_fornecedores_por_lente` ou similar
- Se existe `vw_detalhes_genericas` ou `vw_detalhes_premium` (do SisLens)
- Outras views relacionadas a fornecedores/labs

---

## 📋 Query #2: Investigar views com "fornecedor", "lab", "fabricante"

```sql
SELECT
  table_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
  AND (
    table_name ILIKE '%fornecedor%'
    OR table_name ILIKE '%lab%'
    OR table_name ILIKE '%fabricante%'
    OR table_name ILIKE '%supplier%'
    OR table_name ILIKE '%detalhes%'
  )
ORDER BY table_name;
```

**O que descobrir**: Views que relacionam lentes com fornecedores

---

## 📋 Query #3: Listar todas as tabelas (não views)

```sql
SELECT
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**O que descobrir**:

- Tabela de fornecedores/laboratórios
- Tabela de lentes com fornecedor_id
- Relacionamentos

---

## 📋 Query #4: Estrutura da tabela de lentes (se existir)

```sql
-- Teste 1: Verificar se existe tabela 'lentes'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'lentes'
ORDER BY ordinal_position;

-- Teste 2: Verificar se existe tabela 'lentes_catalogo'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'lentes_catalogo'
ORDER BY ordinal_position;

-- Teste 3: Verificar se existe tabela 'produtos' ou 'catalog'
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND (
    table_name ILIKE '%lente%'
    OR table_name ILIKE '%produto%'
    OR table_name ILIKE '%catalog%'
  );
```

**O que descobrir**: Campos relacionados a fornecedor (fornecedor_id, laboratorio_id, fabricante_id)

---

## 📋 Query #5: Verificar estrutura da v_grupos_canonicos

```sql
-- Listar colunas da view
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'v_grupos_canonicos'
ORDER BY ordinal_position;

-- Amostra de dados
SELECT *
FROM v_grupos_canonicos
LIMIT 3;
```

**O que descobrir**:

- Se tem campo `fornecedor_id` ou similar
- Se tem campo `total_fornecedores`
- Como relacionar com fornecedores

---

## 📋 Query #6: Buscar padrão de relacionamento

```sql
-- Se v_grupos_canonicos tem grupo_id, buscar onde mais esse ID aparece
SELECT
  table_name,
  column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    column_name ILIKE '%grupo_id%'
    OR column_name ILIKE '%canonical_id%'
  )
ORDER BY table_name;
```

**O que descobrir**: Tabelas/views que relacionam grupos com outras entidades

---

## 📋 Query #7: Investigar tabela/view de fornecedores

```sql
-- Teste 1: Tabela fornecedores
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (
    table_name ILIKE '%fornecedor%'
    OR table_name ILIKE '%laboratorio%'
    OR table_name ILIKE '%fabricante%'
    OR table_name ILIKE '%supplier%'
    OR table_name ILIKE '%vendor%'
  );

-- Se existir fornecedores, ver estrutura
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'fornecedores',
    'laboratorios',
    'fabricantes',
    'suppliers'
  )
ORDER BY table_name, ordinal_position;
```

**O que descobrir**: Tabela master de fornecedores/labs

---

## 📋 Query #8: Sample da vw_lentes_catalogo (do SisLens)

```sql
-- Verificar se existe
SELECT COUNT(*) as total
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'vw_lentes_catalogo';

-- Se existir, ver estrutura
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'vw_lentes_catalogo'
ORDER BY ordinal_position;

-- Amostra de dados com fornecedor
SELECT
  nome_comercial,
  fornecedor_nome,
  marca_nome,
  preco_tabela,
  prazo_entrega
FROM vw_lentes_catalogo
WHERE disponivel = true
LIMIT 5;
```

**O que descobrir**:

- Se essa view já tem fornecedor_nome agregado
- Como o SisLens busca fornecedores

---

## 🎯 Cenários de Uso (conforme docs)

### Cenário 1: SisLens usa `vw_detalhes_genericas`

Se o banco tiver essa view:

```typescript
// Buscar fornecedores para um grupo
const { data: fornecedores } = await lentesClient
  .from("vw_detalhes_genericas")
  .select("*")
  .eq("grupo_id", lenteSelecionada.grupo_id)
  .eq("disponivel", true)
  .order("preco_tabela", { ascending: true });
```

### Cenário 2: Tabela lentes + JOIN fornecedores

Se for normalizado:

```typescript
// Query com JOIN
const { data: fornecedores } = await lentesClient
  .from("lentes")
  .select(
    `
    lente_id,
    preco_tabela,
    prazo_dias,
    fornecedores (
      fornecedor_id,
      fornecedor_nome
    )
  `
  )
  .eq("grupo_id", lenteSelecionada.grupo_id)
  .eq("disponivel", true);
```

### Cenário 3: Campo fornecedor_nome direto na tabela

Se desnormalizado:

```typescript
const { data: fornecedores } = await lentesClient
  .from("lentes")
  .select("lente_id, fornecedor_nome, preco_tabela, prazo_dias")
  .eq("grupo_id", lenteSelecionada.grupo_id)
  .eq("disponivel", true);
```

---

## ⚡ Instruções de Execução

### No Supabase SQL Editor:

1. Acesse: `https://supabase.com/dashboard/project/ahcikwsoxhmqqteertkx/sql/new`
2. Execute as queries **na ordem**: #1 → #2 → #3 (prioridade alta)
3. Depois execute #4 → #8 conforme necessário

### O que reportar de volta:

**CRÍTICO** (copiar resultados completos):

- ✅ Query #1 - Lista de views
- ✅ Query #2 - Views de fornecedores
- ✅ Query #3 - Lista de tabelas

**IMPORTANTE** (se encontrar algo):

- Query #4 - Estrutura da tabela lentes
- Query #5 - Estrutura completa v_grupos_canonicos
- Query #7 - Tabelas de fornecedores
- Query #8 - Estrutura vw_lentes_catalogo

---

## 🎯 Resultado Esperado

Após executar as queries, saberemos:

1. ✅ Qual view/tabela usar para buscar fornecedores
2. ✅ Quais colunas contêm nome do fornecedor/lab
3. ✅ Como relacionar grupo_id com fornecedores
4. ✅ Se tem preço/prazo por fornecedor
5. ✅ Atualizar CriarPedidoWizardV2 com dados reais

---

**Status**: ⏳ Aguardando execução das queries
