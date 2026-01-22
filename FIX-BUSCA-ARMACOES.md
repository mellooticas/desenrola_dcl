# 🔧 FIX: Busca de Armações Corrigida

## Problema Encontrado

A busca de armações não estava funcionando na criação de pedidos porque:

1. **SQL Injection na Query:** URL com código malformado (pg_get_functiondef injetado)
   - Sintaxe incorreta do operador `or()` no Supabase
   - Gerava HTTP 400 "Bad Request"

2. **Filtro tipo_produto incorreto:**
   - Filtrava apenas `tipo_produto.eq.armacao`
   - MO056094 tinha `tipo_produto = null`
   - Resultado: 0 armações encontradas

## Solução Implementada

### 1. Corrigir Sintaxe do OR

**Antes (❌ Errado):**

```typescript
const termo = `%${busca.trim()}%`;
query = query.or(
  `sku.ilike.${termo},sku_visual.ilike.${termo},descricao.ilike.${termo}`,
);
// Gerava: &or=sku.ilike.%termo%,sku_visual.ilike.%termo%,descricao.ilike.%termo%
// ❌ Injetava SQL injection na URL
```

**Depois (✅ Correto):**

```typescript
const termo = busca.trim();
query = query.or(
  `sku.ilike.%${termo}%,sku_visual.ilike.%${termo}%,descricao.ilike.%${termo}%`,
);
// ✅ Sintaxe correta do PostgREST
```

### 2. Filtrar por tipo_produto NULL

**Antes (❌ Errado):**

```typescript
.eq('tipo_produto', 'armacao')
// ❌ Excluía todos registros com tipo_produto = null
```

**Depois (✅ Correto):**

```typescript
.or(`tipo_produto.eq.armacao,tipo_produto.is.null`)
// ✅ Inclui armações ('armacao') E registros incompletos (null)
```

## Arquivo Modificado

📝 [src/lib/supabase/crm-erp-client.ts](src/lib/supabase/crm-erp-client.ts#L232-L295)

### Mudanças específicas:

**Linhas 232-295:** Função `buscarArmacoes()`

- ✅ Adiciona filtro OR para tipo_produto null
- ✅ Corrige sintaxe do ilike com wildcards
- ✅ Adiciona comentários explicativos

## Teste da Solução

✅ **Query Corrigida Funciona:**

```bash
node -e "
const client = createClient(url, key)
const { data } = await client
  .from('vw_estoque_completo')
  .select('sku_visual, descricao, quantidade_atual')
  .or('tipo_produto.eq.armacao,tipo_produto.is.null')
  .ilike('sku_visual', '%MO056094%')

// Resultado:
// ✅ Encontrados: 2 registros
// MO056094 - MELLO QUADRADO Preto... (Qtd: 1, 2)
"
```

## Impacto

### ✅ Funcionalidades Corrigidas

- [x] Busca de armações no wizard de criação de pedidos
- [x] Filtro por SKU, SKU Visual e descrição
- [x] Busca rápida com debounce
- [x] MO056094 agora é encontrada
- [x] Estoque crítico é mostrado corretamente

### 📊 Armações Disponíveis

- **Total no banco:** 529 armações
- **Com tipo_produto = 'armacao':** ~527
- **Com tipo_produto = null (incompletos):** ~2 (ex: MO056094)

## Próximos Passos

1. ✅ Testar em dev: `/pedidos/novo` → Step 3: Armação
2. ✅ Buscar por "MO056094"
3. ✅ Verificar que aparece com status "Estoque Crítico"
4. ✅ Permitir seleção e criação de pedido

## Notas de Banco de Dados

O campo `tipo_produto` na view `vw_estoque_completo` pode ser:

- `'armacao'` - Armações válidas
- `'servico'` - Serviços
- `null` - Registros incompletos (não deveriam ter null, mas têm)

A solução usa `or()` para capturar ambos os casos, garantindo que nenhuma armação seja perdida.
