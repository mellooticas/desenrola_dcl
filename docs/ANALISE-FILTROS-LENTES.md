# 🔍 Análise: Filtros de Lentes - sis_lens vs desenrola_dcl

**Data:** 17/01/2026  
**Objetivo:** Melhorar filtros de lentes no wizard de pedidos

---

## 📊 Estrutura Descoberta no sis_lens

### Tabelas Principais

#### 1. `lens_catalog.lentes` (86 colunas)

Campos-chave para filtros:

- `tipo_lente` (USER-DEFINED ENUM)
- `material` (USER-DEFINED ENUM)
- `indice_refracao` (USER-DEFINED ENUM)
- `categoria` (USER-DEFINED ENUM)
- Tratamentos (booleans):
  - `tratamento_antirreflexo`
  - `tratamento_antirrisco`
  - `tratamento_uv`
  - `tratamento_blue_light`
  - `tratamento_fotossensiveis` (ENUM)
- Faixas de grau:
  - `grau_esferico_min/max`
  - `grau_cilindrico_min/max`
  - `adicao_min/max`
- Preços:
  - `preco_custo`
  - `preco_venda_sugerido`
  - `margem_lucro`

#### 2. `lens_catalog.marcas` (10 colunas)

```sql
- id (UUID)
- nome
- slug
- is_premium (boolean)
- descricao, website, logo_url
- ativo
```

#### 3. `lens_catalog.grupos_canonicos` (34 colunas)

Agrupa lentes similares:

- `nome_grupo`
- `tipo_lente`, `material`, `indice_refracao`
- `categoria_predominante`
- Tratamentos (booleans consolidados)
- Estatísticas:
  - `total_lentes`
  - `preco_medio`, `preco_minimo`, `preco_maximo`
  - `total_marcas`, `total_fornecedores`

---

## 🎯 Views de Filtros Otimizadas

### 1. `v_filtros_disponiveis`

**Propósito:** Listar todos os filtros disponíveis com contagem

```sql
SELECT 'tipo_lente' AS filtro_nome,
       tipo_lente::text AS valor,
       COUNT(*) AS total,
       MIN(preco_venda_sugerido) AS preco_min,
       MAX(preco_venda_sugerido) AS preco_max
FROM lens_catalog.lentes
WHERE ativo = true AND status = 'ativo'
GROUP BY tipo_lente

UNION ALL

SELECT 'material' AS filtro_nome, ...
UNION ALL
SELECT 'indice_refracao' AS filtro_nome, ...
```

**Resultado:**
| filtro_nome | valor | total | preco_min | preco_max |
|------------|-------|-------|-----------|-----------|
| tipo_lente | visao_simples | 150 | 80.00 | 500.00 |
| tipo_lente | multifocal | 80 | 200.00 | 1200.00 |
| material | resina | 120 | 80.00 | 600.00 |
| material | policarbonato | 60 | 150.00 | 800.00 |

### 2. `v_filtros_grupos_canonicos`

**Propósito:** Filtros específicos para grupos canônicos

### 3. `v_grupos_por_receita_cliente`

**Propósito:** Sugerir grupos compatíveis com receita do cliente

Filtra por:

- Faixa de grau esférico
- Faixa de grau cilíndrico
- Necessidade de adição (progressiva)

---

## 📋 Estado Atual no desenrola_dcl

### O que JÁ TEMOS:

✅ Integração com sis_lens (campos `grupo_canonico_id`, `lente_selecionada_id`)  
✅ Campos de receita na tabela `pedidos` (esférico, cilíndrico, eixo, adição)  
✅ Client Supabase configurado para sis_lens

### O que FALTA:

❌ **Filtros visuais** no wizard (dropdowns, checkboxes)  
❌ **API** para buscar filtros disponíveis  
❌ **Componentes React** para seleção interativa  
❌ **Lógica de sugestão** baseada em receita  
❌ **Busca por texto** (nome da lente, marca)

---

## 🛠️ Plano de Implementação

### Fase 1: API de Filtros (Backend) ⏱️ 2-3 horas

#### 1.1 Criar helpers no `lentes-client.ts`

```typescript
// src/lib/supabase/lentes-client.ts

/**
 * Buscar filtros disponíveis (tipos, materiais, índices)
 */
export async function buscarFiltrosDisponiveis() {
  const { data, error } = await lentesClient
    .from("v_filtros_disponiveis")
    .select("*")
    .order("filtro_nome", { ascending: true })
    .order("total", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Buscar marcas ativas
 */
export async function buscarMarcas() {
  const { data, error } = await lentesClient
    .from("marcas")
    .select("id, nome, is_premium")
    .eq("ativo", true)
    .order("nome");

  if (error) throw error;
  return data;
}

/**
 * Buscar grupos canônicos compatíveis com receita
 */
export async function buscarGruposPorReceita({
  esferico_od,
  cilindrico_od,
  adicao_od,
}: {
  esferico_od: number;
  cilindrico_od: number;
  adicao_od?: number;
}) {
  // Lógica para filtrar grupos compatíveis
  // Usar view v_grupos_por_receita_cliente
}

/**
 * Buscar lentes dentro de um grupo canônico
 */
export async function buscarLentesDoGrupo(
  grupo_canonico_id: string,
  filtros?: {
    marca_id?: string;
    preco_max?: number;
    tratamentos?: string[];
  }
) {
  let query = lentesClient
    .from("lentes")
    .select("*")
    .eq("grupo_canonico_id", grupo_canonico_id)
    .eq("ativo", true)
    .eq("status", "ativo");

  if (filtros?.marca_id) {
    query = query.eq("marca_id", filtros.marca_id);
  }

  if (filtros?.preco_max) {
    query = query.lte("preco_venda_sugerido", filtros.preco_max);
  }

  // Tratamentos...

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
```

#### 1.2 Criar rotas API

```
GET /api/lentes/filtros
GET /api/lentes/marcas
GET /api/lentes/grupos-por-receita
GET /api/lentes/buscar?q=...&tipo=...&material=...
```

---

### Fase 2: Componentes de Filtro (Frontend) ⏱️ 3-4 horas

#### 2.1 `FiltrosLentes.tsx`

Componente principal com:

- Dropdowns: Tipo, Material, Índice de Refração
- Checkboxes: Tratamentos (antirreflexo, UV, blue light)
- Range slider: Faixa de preço
- Busca: Input de texto para nome/marca

#### 2.2 `SugestaoGrupo.tsx`

Baseado em receita preenchida:

- "Para a receita informada, sugerimos grupos multifocais"
- Cards com grupos recomendados

#### 2.3 `ListaLentes.tsx`

Grid de lentes filtradas com:

- Foto (se houver)
- Nome + marca
- Preço (custo / venda)
- Tratamentos (badges)
- Botão "Selecionar"

---

### Fase 3: Integração no Wizard ⏱️ 2 horas

#### 3.1 Fluxo de seleção

```
1. Usuário preenche receita (graus)
   ↓
2. Sistema sugere grupos compatíveis
   ↓
3. Usuário aplica filtros (tipo, material, tratamentos)
   ↓
4. Lista de lentes aparece
   ↓
5. Usuário seleciona lente
   ↓
6. Pedido salva: grupo_canonico_id, lente_selecionada_id
```

#### 3.2 Validações

- Se grau alto → sugerir índice 1.67 ou 1.74
- Se adição > 0 → filtrar apenas multifocais
- Se cilindro > -2.00 → sugerir tratamento antirrisco

---

## 📊 Comparação: Antes vs Depois

### ANTES (Estado Atual)

```
❌ Busca manual de lentes (sem filtros)
❌ Não sugere lentes por receita
❌ Lista todas as lentes (lento)
❌ Sem agrupamento canônico visível
```

### DEPOIS (Com Filtros)

```
✅ Filtros dinâmicos (tipo, material, índice)
✅ Sugestão automática por receita
✅ Busca rápida por nome/marca
✅ Visualização de grupos canônicos
✅ Comparação de preços dentro do grupo
```

---

## 🎯 Prioridades

### 🔴 ALTA (Fazer Agora)

1. API `/api/lentes/filtros` - retornar filtros disponíveis
2. API `/api/lentes/marcas` - listar marcas
3. Componente `FiltrosLentes` básico (tipo, material)
4. Integrar no wizard de pedidos

### 🟡 MÉDIA (Próxima Sprint)

5. Sugestão por receita (`v_grupos_por_receita_cliente`)
6. Comparação de lentes dentro do grupo
7. Busca por texto (nome, marca)

### 🟢 BAIXA (Melhorias Futuras)

8. Fotos das lentes
9. Histórico de lentes mais vendidas
10. Sistema de favoritos

---

## 🚀 Próximos Passos IMEDIATOS

### 1️⃣ Criar API de Filtros (15min)

```bash
src/app/api/lentes/filtros/route.ts
src/app/api/lentes/marcas/route.ts
```

### 2️⃣ Atualizar `lentes-client.ts` (10min)

Adicionar helpers: `buscarFiltrosDisponiveis()`, `buscarMarcas()`

### 3️⃣ Criar componente básico (30min)

`src/components/lentes/FiltrosLentes.tsx`

### 4️⃣ Testar no wizard (15min)

Adicionar no formulário de pedidos

---

**Total estimado:** ~4-6 horas de desenvolvimento
**Impacto:** 🚀 UX 10x melhor, menos erros, vendas mais rápidas

---

## ✅ Checklist de Implementação

- [ ] API `/api/lentes/filtros`
- [ ] API `/api/lentes/marcas`
- [ ] Helper `buscarFiltrosDisponiveis()`
- [ ] Helper `buscarMarcas()`
- [ ] Componente `FiltrosLentes.tsx`
- [ ] Integrar no wizard de pedidos
- [ ] Testar filtragem com dados reais
- [ ] Validar performance (cache?)

---

**Próxima Ação:** Criar as APIs de filtros agora! 🎯
